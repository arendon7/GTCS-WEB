# GREENATICS Public Web Release · 2026-08-25

## Objetivo
Cerrar el ciclo de profundización comercial de la web pública y publicar el `develop` certificado en el origen estable de GREENATICS OPS/Vercel.

## Alcance de este release
- Conserva la arquitectura pública y los Truth Locks ya aprobados.
- Traduce estados internos de Wondergreen a lenguaje público sin cambiar `truthStatus` ni Product Truth.
- Mantiene la separación línea → referencia → formulación → presentación → documentación.
- Preserva el producto o servicio exacto al pasar a Contacto.
- Oculta metadata técnica de navegación que no aporta valor al visitante.
- Añade un gate E2E de rutas públicas críticas, conversión, sitemap y frontera OPS.
- Añade un workflow de publicación que certifica preview, producción, provenance y smoke HTTP.

## No cambia
- H1 de HOME: `Transformamos residuos en vida.`
- Estados técnicos/regulatorios internos.
- Formulaciones, presentaciones, dosis, claims, precios o disponibilidad no documentados.
- Casa & Jardín continúa en pre-lanzamiento y `noindex,follow`.
- Canonical público continúa apuntando a `https://greenatics.com.co`.
- `main` no participa en este release: la fuente canónica es `develop`.

## Gate antes de merge
- `quality`
- `database`
- Playwright desktop
- Playwright mobile

## Gate después de merge
El workflow `publish-greenatics-web-release-20260825`:
1. toma el SHA exacto de `develop`;
2. repite typecheck, lint, unit y build;
3. certifica backend hospedado;
4. despliega y certifica Preview full-ops;
5. publica producción estable;
6. certifica branch/SHA con `pilot:preflight`;
7. prueba rutas públicas críticas, sitemap y robots;
8. marca `greenatics/web-release` en el commit publicado.
