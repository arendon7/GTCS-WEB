# ADR-0006 · Plataforma dual y estrategia de despliegue

## Estado
Aceptado para integración v0.3. El proveedor de runtime definitivo queda abierto.

## Contexto
`GTCS-WEB` contiene desde v0.3 dos superficies del mismo producto:

- web pública corporativa/comercial (`/`, `/wondergreen`, etc.);
- GREENATICS OPS, aplicación interna (`/app` y rutas operativas existentes).

La web pública histórica fue desplegada en GitHub Pages mediante `output: "export"`. La aplicación OPS actual, sin embargo, contiene rutas dinámicas cuyos identificadores se crean en tiempo de ejecución (por ejemplo `/activities/[id]`, `/compost/[id]` y `/equipment/[id]`) y un proxy de sesión Supabase. GitHub Pages solo sirve archivos estáticos y no ejecuta ese runtime.

## Decisión
1. Mantener **un único repositorio y una única base de producto** en `GTCS-WEB`.
2. No reintroducir `output: "export"` global ni la configuración histórica de Pages hasta que toda la plataforma sea compatible con ese modo.
3. No degradar, duplicar ni rediseñar las rutas dinámicas de OPS únicamente para adaptarlas a hosting estático.
4. GitHub Pages puede continuar como superficie pública/preview durante la transición, pero no se considerará por sí solo el runtime definitivo de la plataforma dual.
5. El despliegue final deberá soportar Next.js runtime y el contrato de autenticación/Supabase de OPS, manteniendo la web pública y la app en el mismo repositorio. El proveedor y topología de dominio se decidirán en una iteración posterior con QA de build y seguridad.
6. Cualquier publicación pública de datos internos deberá pasar por un contrato de publicación; compartir deployment no autoriza acceso público a stores, tablas ni sesiones de OPS.

## Consecuencias
- La integración pública puede avanzar sin bloquear el desarrollo interno.
- Se preservan rutas y flujos OPS existentes.
- No se usa GitHub Pages como restricción arquitectónica artificial.
- La configuración de Pages histórica no se porta automáticamente desde `feat/public-web-v0.2.1-depth`.
- Antes de producción se requiere una decisión explícita sobre runtime, dominio, autenticación y despliegue.
