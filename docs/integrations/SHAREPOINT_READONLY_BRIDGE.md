# GREENATICS OPS · SharePoint read-only bridge

## Decisión
GREENATICS OPS mantiene la operación diaria y sus transacciones como fuente canónica. SharePoint permanece como repositorio documental e histórico. La integración une ambos mundos mediante **referencias**, no copiando la lógica operativa de vuelta a documentos o listas.

## Privacidad del repositorio
Este repositorio es público. Por tanto, no se versionan:
- hostname real del tenant;
- site ID;
- drive ID;
- item IDs;
- rutas internas reales;
- client IDs, secrets, tokens o credenciales.

La estructura documental real se inventariará y auditará fuera de Git, y sus identificadores se inyectan únicamente como configuración server-side.

## Configuración
El contrato inicial usa:

```text
SHAREPOINT_SITE_HOSTNAME=
SHAREPOINT_SITE_PATH=
SHAREPOINT_DRIVE_ID=
SHAREPOINT_DOCUMENT_ROOT=
```

Ninguna variable documental usa el prefijo `NEXT_PUBLIC_`.

## Identidad estable
Una referencia SharePoint se identifica por:

```text
sharepoint:<driveId>:<itemId>
```

`webUrl` es un enlace de navegación para personas; no es la identidad primaria porque nombres, carpetas o URLs pueden cambiar.

## Contrato de referencia
Campos V0:
- `provider = sharepoint`;
- `driveId`;
- `itemId`;
- `title`;
- `webUrl` HTTPS de SharePoint;
- `mimeType` opcional;
- `modifiedAt` opcional.

El contrato no contiene binarios ni credenciales.

## Frontera read-only de CORE-005A
Este slice **no** implementa OAuth de Microsoft Graph desde el runtime, uploads, renombres, movimientos, borrados ni sincronización automática. Tampoco usa SharePoint como fallback cuando Supabase falla.

La siguiente fase puede añadir un adapter server-side de lectura Graph con permisos mínimos y cache controlada. Solo después de certificar ese adapter se habilitarán vistas de documentos/evidencias en OPS.

## Reglas de integridad
1. Una transacción OPS no desaparece si un documento externo cambia de nombre o carpeta.
2. Una referencia documental rota se reporta como tal; no se elimina silenciosamente.
3. SharePoint no decide autorización operacional por planta: esa frontera sigue en Supabase/RLS.
4. El navegador nunca recibe credenciales Graph.
5. No se persisten URLs temporales de descarga como identidad canónica.
6. No se inventan carpetas o IDs cuando falta configuración.

## Gate para CORE-005B
Antes de lectura remota real:
- definir mecanismo OAuth/App Registration y permisos mínimos;
- confirmar si la autenticación será app-only o delegada;
- mantener secretos solo server-side;
- añadir pruebas contractuales con fixture Graph sanitizado;
- definir política de cache/revalidación y límites;
- validar que el repo público no filtra metadata interna del tenant.
