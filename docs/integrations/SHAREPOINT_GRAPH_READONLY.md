# GREENATICS OPS · Microsoft Graph read-only adapter

## Propósito
CORE-005B añade el adapter server-side que convierte archivos de una biblioteca SharePoint en referencias documentales seguras de GREENATICS OPS. No cambia la fuente de verdad operacional: las transacciones continúan en Supabase/RLS y SharePoint permanece como repositorio documental e histórico.

## Modelo de autenticación
El runtime usa OAuth 2.0 **client credentials** contra Microsoft Entra. La aplicación solicita `https://graph.microsoft.com/.default` y utiliza únicamente permisos de aplicación previamente consentidos por un administrador.

Variables server-only:

```text
SHAREPOINT_TENANT_ID=
SHAREPOINT_CLIENT_ID=
SHAREPOINT_CLIENT_SECRET=
```

Nunca usar prefijo `NEXT_PUBLIC_`, serializar estas variables al cliente, imprimir el access token ni incorporar secretos a errores o logs.

## Permiso recomendado
Para el piloto, la política preferida es **`Sites.Selected`** con una asignación explícita de `read` únicamente al sitio SharePoint autorizado. Consentir `Sites.Selected` por sí solo no concede acceso al contenido: también se requiere la asignación del recurso seleccionado.

No sustituirlo por `Sites.Read.All` o permisos de escritura por conveniencia. Un alcance mayor requiere una decisión explícita y documentada.

## Lectura implementada
El adapter consulta Microsoft Graph v1.0 sobre el `driveId` configurado y una ruta siempre confinada bajo `SHAREPOINT_DOCUMENT_ROOT`.

Características:
- listado no recursivo de archivos de una carpeta;
- path encoding por segmento antes de construir la URL Graph;
- bloqueo de `.` / `..`, rutas absolutas y separadores Windows;
- `$select` limitado a `id`, `name`, `webUrl`, `lastModifiedDateTime`, `file` y `folder`;
- carpetas se ignoran como documentos; pueden consultarse de forma explícita pasando una subruta permitida;
- cada archivo se valida mediante el contrato CORE-005A antes de devolverse;
- la identidad estable sigue siendo `sharepoint:<driveId>:<itemId>`;
- no se lee ni devuelve `@microsoft.graph.downloadUrl`;
- no se descargan binarios.

## Paginación y límites
El adapter sigue `@odata.nextLink` únicamente cuando:
- usa HTTPS;
- el host es exactamente `graph.microsoft.com`;
- permanece en Microsoft Graph v1.0;
- permanece bajo el mismo `driveId` configurado.

Límites de defensa:
- máximo 5 páginas Graph por listado;
- máximo 200 documentos por listado;
- cualquier referencia documental malformada hace fallar la operación en lugar de exponer datos parciales no validados.

## Caché
Hay dos cachés de proceso, ambas efímeras:
1. **Access token:** se reutiliza hasta antes de su expiración, con margen de seguridad. Nunca se persiste.
2. **Metadatos documentales:** TTL de 60 segundos por carpeta. `forceRefresh` permite invalidar la lectura cuando una operación server-side lo necesite.

La caché desaparece con el proceso/serverless instance y no es fuente de verdad.

## Provisioning externo pendiente
Para activar la lectura contra el tenant real se debe:
1. crear o seleccionar una App Registration dedicada;
2. agregar `Sites.Selected` como application permission para Microsoft Graph;
3. otorgar admin consent;
4. conceder a esa aplicación `read` sobre el sitio SharePoint autorizado;
5. guardar tenant ID, client ID y client secret únicamente en el proveedor de secretos/runtime;
6. cargar la configuración CORE-005A (`hostname`, `sitePath`, `driveId`, `documentRoot`) fuera de Git;
7. ejecutar una lectura smoke server-side y confirmar que la aplicación no puede leer otro sitio no asignado.

Hasta completar ese provisioning, el adapter queda certificado por contrato y fixtures sanitizados, pero no debe afirmarse que el tenant real está conectado.

## Fuera de alcance
CORE-005B no implementa:
- subida, edición, renombre, movimiento o borrado;
- sincronización automática;
- permisos de escritura;
- navegación Graph desde el browser;
- endpoints públicos de documentos;
- autorización operacional basada en SharePoint;
- persistencia de tokens o URLs temporales de descarga.
