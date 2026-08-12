# ADR-0007 · Frontera de acceso entre web pública y GREENATICS OPS

## Estado
Aceptado para v0.11.

## Contexto
`GTCS-WEB` sirve en el mismo runtime la web pública y GREENATICS OPS. `robots.txt` evita indexación accidental, pero no es un mecanismo de autorización. Además, el `RootLayout` histórico montaba los stores de OPS en todas las rutas, incluso en páginas públicas.

## Decisión
1. Mantener URLs públicas e internas estables; no mover todavía todo el árbol a route groups.
2. Definir explícitamente las familias de rutas protegidas de OPS.
3. En desarrollo/CI con modo `local`, permitir el adapter local para QA y demos aisladas.
4. En runtime de producción, el modo local queda bloqueado por defecto. Un bypass local solo puede habilitarse explícitamente fuera de Vercel.
5. En modo `supabase`, usar `proxy.ts` de Next.js 16 para refrescar/validar claims antes de las rutas protegidas.
6. Revalidar server-side antes de renderizar cada árbol OPS: claim válido, perfil activo y al menos una membresía de planta activa.
7. Mantener RLS como autorización de datos y roles dentro de PostgreSQL; el proxy y el guard de página no sustituyen RLS.
8. Montar los providers/stores OPS únicamente en rutas internas; la web pública no inicializa ni persiste el adapter operativo.
9. Mantener las rutas protegidas como `force-dynamic` para que la decisión de sesión no se prerenderice ni se comparta por caché.
10. El login exitoso entra a `/app`; un usuario no autenticado o un deployment mal configurado no puede usar el modo local como fallback silencioso.

## Consecuencias
- Un visitante público puede navegar la web sin inicializar stores operativos.
- Conocer una URL interna no concede acceso a OPS.
- Preview/producción requieren configuración Supabase para usar OPS.
- CI y desarrollo local conservan los flujos existentes sin credenciales remotas.
- La autorización queda en profundidad: frontera de request + render server-side + RLS.

## Siguiente paso
Después de certificar v0.11, crear un preview de runtime Next.js y verificar variables de entorno, cookies, autenticación, navegación pública y rutas OPS antes de asociar el dominio productivo.
