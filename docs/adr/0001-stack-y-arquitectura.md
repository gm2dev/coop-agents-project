# ADR 0001 — Stack y arquitectura de la demo de turnos

- **Estado:** aceptado
- **Fecha:** 2026-10-15
- **Alcance:** demo funcional mínima (opción B) de reserva de turnos para Tijera Fina.

## Contexto

Necesitamos una demo desplegable en Vercel donde una clienta reserve un turno (servicio → profesional →
día y horario → datos → revisar → confirmado) y el staff vea la agenda del día. La regla de negocio
crítica es que **un profesional nunca tenga dos turnos superpuestos**, incluso con reservas concurrentes.

## Decisión

### Stack

- **Next.js (App Router) + TypeScript estricto**, desplegado en **Vercel** (plan Hobby para la demo).
  Las páginas que leen fecha actual o DB se renderizan dinámicamente por request; no se accede a la DB en
  build (`cacheComponents` desactivado para mantener el modelo de render simple en la demo).
- **Postgres gestionado: Neon** vía Vercel Marketplace, que expone la variable `DATABASE_URL`.
- **Drizzle ORM** con migraciones SQL versionadas en el repo.
- **Email (Resend) y login del staff** quedan para la fase 1.

### Regla clave: sin superposición por profesional

La garantiza la base de datos con una restricción de exclusión (extensión `btree_gist`):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (
    professional_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status = 'confirmed');
```

- Ante concurrencia, la DB rechaza la segunda inserción; la app traduce la violación
  (**SQLSTATE `23P01`**, `exclusion_violation`) al estado de UI «horario tomado».
- El rango es semiabierto (`[)`): un turno que termina 10:45 no choca con otro que empieza 10:45.

### Sin retención temporal del horario (Q10)

No se reserva el horario mientras la clienta completa sus datos. La disponibilidad se valida **al
confirmar**; si alguien lo tomó antes, se muestra «horario tomado» con alternativas, sin perder los datos.

### Tiempo

- Todo se guarda en **UTC** (`timestamptz`).
- Zona horaria fija del local: **`America/Argentina/Buenos_Aires`**. Los horarios de atención y los slots se
  calculan en hora local y se convierten a UTC al guardar. La UI no muestra la zona.

### «Cualquiera disponible»

Al confirmar, se intenta asignar los profesionales libres en **orden determinista** (por id); se inserta
con el primero y, si viola la restricción, se prueba con el siguiente. El primero que no la viola queda
asignado. Si ninguno puede, «horario tomado».

### Recordatorio (fase 1)

Un envío diario «tus turnos de mañana» vía **Vercel Cron** (un cron diario es compatible con Hobby).

### Fuera de la demo (fase 1)

Emails, recordatorio, login del staff, cancelar/reprogramar, bloqueos de horario, carga manual de turnos y
panel de administración.

## Consecuencias

- La integridad no depende de la app: cualquier cliente que escriba en la tabla respeta la regla.
- Requiere Postgres con `btree_gist` (disponible en Neon).
- La agenda del staff de la demo se protege con una clave secreta en la URL hasta tener login (fase 1).
