# Release readiness · Greenatics · 2026-09-14

## Estado verificable

| Superficie | Estado actual | Evidencia | Qué significa |
| --- | --- | --- | --- |
| Web pública Greenatics | Publicada | Sites versión 5, deployment exitoso | Sitio institucional, biblioteca, proyectos, Wondergreen, Casa y Jardín, Centro Greenatics y demostraciones disponibles públicamente. |
| Centro Greenatics | Publicado dentro del sitio | Auditoría estática y smoke local | Es la puerta única de navegación; no contiene secretos ni sustituye la autenticación de los runtimes. |
| Calcula tu Huella | Runtime local operativo; staging pendiente | V0.45.5, suite histórica aprobada, health/login local | Puede probarse localmente con SQLite. Para usuarios reales necesita PostgreSQL, almacenamiento privado, dominio HTTPS, secretos externos y `SEED_DEMO=false`. |
| GREENATICS OPS | Runtime local operativo; staging pendiente | TypeScript, lint, 392 pruebas y build Webpack aprobados; health/login local | Incluye operación, bitácora, recepciones, lotes, compostaje, producción, activos, mantenimiento, inventario, compras, gastos, ventas, caja, documentos, analítica y administración. Para operación real necesita Supabase, migraciones, RLS, usuarios y plantas. |
| GREENATICS Red | Estación navegable pública; producto operativo pendiente | 12 módulos de la estación v5 y smoke local | La experiencia cubre Proyecto 360, territorio, generadores, rutas, FIELD, QA/QC, hallazgos, PMIRS, indicadores, evidencias y coordinación. El estado actual es local y demostrativo: no persiste cambios ni ofrece identidad o permisos productivos. |

## Puertas pasadas

- `pnpm audit:static`: 116 páginas HTML y 29 rutas del sitemap auditadas sin errores.
- `pnpm qa:runtime-config`: configuración segura de los tres destinos de runtime validada.
- `pnpm qa:ecosystem`: 8/8 superficies locales verificadas en modo servidor de producción.
- Huella: health y login respondieron `200` en el runtime local.
- OPS: health y login respondieron `200`; el acceso anónimo redirigió a configuración/login (`307`).
- La auditoría visual automatizada no se pudo ejecutar en este entorno porque falta el binario local de Chromium de Playwright; no es un fallo de la aplicación.

## Puertas que faltan para publicar runtimes

### Huella

1. Crear una base PostgreSQL de staging nueva y aplicar todas las migraciones.
2. Configurar almacenamiento privado para evidencias y probar descarga controlada.
3. Cargar `SESSION_SECRET`, `PUBLIC_BASE_URL`, `TRUSTED_HOSTS`, `SEED_DEMO=false` y `DEPLOYMENT_STRICT=true` en el gestor de secretos del proveedor.
4. Ejecutar el recorrido fuente → validación → evidencia → cálculo → cierre → reporte.
5. Probar aislamiento entre organizaciones, backup y restauración.

### OPS

1. Crear o seleccionar el proyecto Supabase piloto y ejecutar las migraciones en orden.
2. Configurar el proyecto Vercel y sus variables server-side, sin usar claves privilegiadas en `NEXT_PUBLIC_*`.
3. Ejecutar preflight, bootstrap de Director y smoke RLS para `TAM` Támesis y `YAR` Yarumal.
4. Probar módulos operativos con usuarios de rol distinto y conciliar los reportes.
5. Promover el build estable solo después de UAT y backup/restauración.

### Red

1. Definir el modelo persistente para proyectos, territorio, generadores, rutas, jornadas, hallazgos, acciones, indicadores y evidencias.
2. Añadir autenticación, organizaciones, permisos por proyecto y auditoría de cambios.
3. Implementar APIs y almacenamiento privado para captura móvil, QA/QC y PMIRS.
4. Conectar referencias de contexto con OPS sin leer tablas privadas directamente.
5. Ejecutar UAT con un caso de prueba completo, desde diagnóstico hasta acción y evidencia.

## Regla de promoción

El Centro Greenatics solo cambiará una tarjeta de “demo”, “estimador” o “prototipo” a “acceso disponible” cuando el runtime tenga dominio HTTPS, autenticación, permisos, health, logs, backup, restauración y UAT aprobados. La web pública ya está lista para comunicar las herramientas; este gate evita presentar una interfaz navegable como operación multiusuario.

## Próxima acción externa

La publicación real de OPS requiere primero sincronizar el código actual con el repositorio público de GitHub. El workflow manual disponible en `main` apunta a una historia anterior; `develop` no contiene ese workflow manual. No se debe ejecutarlo hasta que el commit exacto de la versión actual esté en la rama de publicación y el proyecto Vercel esté conectado.

Después de sincronizar la fuente, el propietario debe configurar el proyecto Vercel y los secretos del workflow en GitHub. La publicación real de Huella requiere crear el servicio y su base persistente. No se deben pegar tokens en el repositorio ni en el chat.
