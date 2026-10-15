import type { NextConfig } from "next";

// Sin cacheComponents: todas las páginas de la demo son dinámicas por request
// (dependen de la fecha actual y de la DB). Ver docs/adr/0001-stack-y-arquitectura.md.
const nextConfig: NextConfig = {};

export default nextConfig;
