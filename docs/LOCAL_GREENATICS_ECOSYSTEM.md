# Ecosistema local Greenatics

El desarrollo local se organiza en runtimes separados para conservar las fronteras de seguridad y permitir que el sitio público siga siendo estático.

## Superficies

| Superficie | URL local | Función |
| --- | --- | --- |
| Web pública | `http://localhost:3001/` | Sitio institucional, servicios, proyectos, Wondergreen y demos |
| Centro Greenatics | `http://localhost:3001/plataforma/` | Entrada común y estado de las aplicaciones |
| GREENATICS Red | `http://localhost:3001/red/app/` | Estación navegable v5 para Proyecto 360, territorio, generadores, rutas, FIELD, QA/QC, hallazgos, PMIRS STUDIO/VIVO, indicadores, evidencias y coordinación |
| Calcula tu Huella | `http://127.0.0.1:8765/login` | Runtime FastAPI con SQLite local y flujo completo de plataforma |
| GREENATICS OPS | `http://localhost:3002/login` | Runtime Next.js con modo local; Supabase queda desactivado |

Desde cada runtime existe un retorno visible a `http://localhost:3001/`, el sitio canónico local de Greenatics. Las landings propias siguen conservando sus enlaces internos: el retorno no reemplaza la navegación de producto.

## Arranque

### Web pública

```bash
cd /Users/agustinrendoncalle/.gemini/antigravity/scratch/GTCS-WEB
pnpm dev
```

La configuración local de `.env.local` hace que el portal use Huella en `8765`, OPS en `3002` y Red en la ruta pública local. El archivo está ignorado y no debe publicarse.

### Calcula tu Huella

```bash
cd /Users/agustinrendoncalle/.gemini/antigravity/scratch/GTCS-WEB/apps/calcula-tu-huella
OPEN_BROWSER=0 PORT=8765 ./scripts/dev/run.sh
```

Si ya había un proceso en `8765`, deténlo y vuelve a ejecutar este comando para que tome `GREENATICS_PUBLIC_URL` desde `.env.local`.

### GREENATICS OPS

```bash
cd /Users/agustinrendoncalle/.gemini/antigravity/scratch/GTCS-WEB/apps/greenatics-ops
pnpm exec next start --port 3002
```

Si ya había un proceso en `3002`, reinícialo después de compilar para que tome la cabecera y el acceso actualizados.

OPS debe redirigir a login con `reason=configuration` cuando no hay Supabase configurado. Eso es un bloqueo seguro, no un error de la aplicación.

## Verificación

Con los tres runtimes levantados:

```bash
pnpm qa:ecosystem
```

El gate verifica web pública, portal, Red, health/login de Huella, health/login de OPS y el bloqueo anónimo de OPS. No crea usuarios, no ejecuta migraciones remotas y no toca datos productivos.

## Alcance local

- Huella usa SQLite local aislada y conserva su flujo de inventario, cargas, validación, evidencias, cálculo e informes.
- OPS usa modo local para la experiencia de interfaz; el modo Supabase requiere variables, migraciones, RLS y usuarios de prueba.
- Red v5 es una estación de producto navegable con datos demo claramente marcados. Sus módulos y contratos de trabajo están definidos, pero no debe presentarse como operación productiva hasta implementar persistencia, autenticación, permisos, auditoría y almacenamiento de evidencias.
- La web pública comunica claramente el estado de cada producto y no simula autenticación.
