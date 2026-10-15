# Tijera Fina — Turnos online

Demo de reserva de turnos para una peluquería: la clienta elige servicio, profesional, día y horario,
deja sus datos y confirma; el staff ve la agenda del día.

- Stack y decisiones: [docs/adr/0001-stack-y-arquitectura.md](docs/adr/0001-stack-y-arquitectura.md).

## Requisitos

- Node.js 24 y npm.

## Cómo correr

```bash
npm ci
npm run dev      # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a Postgres (Neon). Se agrega con la base de datos. |
| `STAFF_AGENDA_KEY` | Clave secreta para ver la agenda del staff. Se agrega con la agenda. |

Nunca commitees valores reales: usá `.env.local` (ignorado por git).
