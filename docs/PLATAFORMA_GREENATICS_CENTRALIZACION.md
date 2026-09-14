# Plataforma Greenatics · centralización de aplicaciones

## Decisión de dirección

Greenatics será la puerta única de entrada, la marca de hosting y el contexto común de sus herramientas. Eso no significa convertir todos los productos en una sola pantalla ni copiar sus bases de datos: cada aplicación conserva su dominio, reglas y ritmo de evolución, mientras comparte una capa controlada de identidad, organizaciones, permisos, navegación, auditoría y enlaces de contexto.

La web institucional actual es un sitio Next.js con exportación estática. Es adecuada para contenido público, demos y portal de entrada, pero no debe recibir directamente el backend de Calcula tu Huella ni inventar una conexión productiva para OPS. La consolidación debe añadir servicios ejecutables detrás del mismo dominio o de subdominios Greenatics con contratos explícitos.

## Mapa propuesto

```text
greenatics.com/                 Sitio público institucional y comercial
greenatics.com/plataforma/      Centro único de aplicaciones
greenatics.com/app/             Demo pública y futura entrada OPS
greenatics.com/huella/          Estimador público y futura entrada Huella
greenatics.com/red/             Explicación pública de GREENATICS Red
greenatics.com/red/app/         Estación navegable Red, futura app productiva
greenatics.com/acceso/          Modelo de acceso y solicitud de implementación

app.greenatics.com              Portal autenticado productivo, cuando exista identidad central
ops.greenatics.com              Servicio OPS o ruta protegida equivalente
huella.greenatics.com            Servicio FastAPI de Calcula tu Huella o ruta protegida equivalente
red.greenatics.com               Servicio Red cuando tenga persistencia y operación real
```

La decisión final entre rutas y subdominios depende del proveedor de despliegue, cookies, CORS, DNS y política de sesiones. En ambos casos el usuario debe percibir una sola plataforma Greenatics y no cuatro productos desconectados.

## Estado real de los productos

| Producto | Evidencia disponible | Estado en la web actual | Próximo paso técnico |
| --- | --- | --- | --- |
| GREENATICS OPS | Demo Next.js, módulos de Hoy, Bitácora, Recepciones, Procesos, Volúmenes, Activos, Inventario y Reportes; histórico de dashboards operativos | Demostración pública, sin backend productivo conectado | Recuperar el backend/código productivo o especificarlo, definir modelo común y migrar por módulos |
| Calcula tu Huella | Aplicación FastAPI + PostgreSQL V0.45.5 con autenticación, inventarios, CSV/XLSX, validación, evidencias, historial, reportes y Docker | Landing de producto, estimador público y explicación de plataforma completa | Desplegar el servicio como aplicación Greenatics, reemplazar credenciales demo y conectar identidad/organizaciones |
| GREENATICS Red | Paquetes Red Bello v7, contratos UX, dashboards, PMIRS STUDIO y prototipo navegable `/red/app/` | Prototipo de estación independiente, datos ilustrativos | Construir API y persistencia para Proyecto 360, FIELD, QA/QC, PMIRS y coordinación |
| AGROWAY | Monorepo privado con identidad, lotes, abastecimiento, campo, cosecha, impacto y Control Tower | Entorno privado en evolución | Integrar por contrato y mantener sus límites de privacidad; no copiarlo a la web pública |

## Núcleo compartido

### Identidad y organizaciones

- Una cuenta puede pertenecer a una o más organizaciones.
- El contexto activo debe incluir organización, planta, proyecto o unidad según el producto.
- Los permisos se resuelven por rol y objeto, no solo por una bandera global de administrador.
- OPS, Huella, Red y AGROWAY nunca deben exponer por defecto datos de otra organización.
- La sesión productiva requiere HTTPS, cookies seguras, rotación de secretos, recuperación de cuenta y protección contra CSRF.

### Registro y estados

Todos los productos deben distinguir, cuando aplique:

```text
RAW → VALIDATED → INTERPRETED → DERIVED / PUBLISHED
```

Una corrección no elimina el dato original. Conserva actor, fecha, motivo, versión, evidencia y relación con el objeto fuente. Un resultado derivado necesita método, periodo, alcance y nivel de revisión antes de convertirse en claim público.

### Contexto compartido

Los objetos que pueden cruzar aplicaciones deben usar identificadores estables y contratos de lectura, no consultas directas entre bases:

```text
Organization → Project / Facility → Activity / Reception / Inventory / Evidence
```

Ejemplo: Red puede indicar que un proyecto requiere control de recepción; OPS puede recibir una referencia contextual a ese proyecto, pero OPS conserva la verdad operacional de la recepción. Huella puede recibir una fuente de actividad o energía aprobada, pero no recalcula un inventario sin una regla y una revisión explícita.

## Hospedaje recomendado

### Fase pública

- Mantener el Next.js institucional en el hosting web/CDN actual.
- Servir `/plataforma/`, `/red/` y las demos desde el mismo origen Greenatics.
- No subir secretos, bases, credenciales demo ni archivos privados al export estático.

### Fase de aplicaciones

- Desplegar el portal autenticado y los servicios con un proveedor que soporte runtime persistente, variables secretas, PostgreSQL administrado, almacenamiento privado y workers.
- Usar un reverse proxy o gateway bajo Greenatics para que las aplicaciones compartan dominio, TLS, headers y observabilidad.
- Mantener Calcula tu Huella como servicio FastAPI hasta completar una migración probada; no reescribir su backend dentro de Next.js por apariencia de unidad.
- Definir si OPS se recupera desde una rama/código productivo existente o si el demo actual se convierte en el primer frontend del backend que falta localizar.

## Secuencia de implementación

1. **Portal y contratos públicos.** Centro Greenatics, enlaces, estados honestos y Red navegable. No requiere base de datos.
2. **Inventario de código y propiedad.** Congelar versiones de Huella, localizar el backend OPS, registrar dependencias, licencias, migraciones, jobs, archivos y datos de prueba.
3. **Fundación de despliegue.** Repositorio central o monorepo, CI, entornos `local`, `staging` y `production`, secretos externos, backups y dominio.
4. **Identidad central.** Usuarios, organizaciones, membresías, roles, sesiones, auditoría y acceso por aplicación. Primero staging, con pruebas de aislamiento.
5. **Huella productiva.** Desplegar V0.45.5 sin alterar factores, fórmulas ni metodología; importar datos de ensayo, probar restauración y conectar el portal.
6. **OPS productivo.** Integrar bitácora, recepciones, balances y mantenimiento antes de ampliar a inventario, costos y multi-planta. Mantener el demo público separado del entorno real.
7. **Red MVP.** Persistir Proyecto 360, FIELD, QA/QC, evidencia contextual, línea base, PMIRS y coordinación. Móvil para ejecutar; escritorio para analizar.
8. **Integración de datos.** Publicar contratos de eventos o read models mínimos y versionados. Nunca compartir tablas privadas directamente entre productos.

## Gates antes de publicar producción

- `SEED_DEMO=false` y ninguna contraseña demo activa.
- HTTPS, cookies seguras, CSRF, rate limiting y headers de seguridad verificados.
- Aislamiento probado entre organizaciones, plantas y proyectos.
- Backup y restauración probados en un entorno separado.
- Migraciones reversibles o con plan de recuperación.
- Auditoría de cambios, exportación y borrado controlado definidos.
- Datos ilustrativos claramente separados de datos productivos.
- Build, typecheck, pruebas de backend, pruebas de permisos, smoke browser y auditoría estática pasando.
- Contratos de claims y evidencia revisados antes de mostrar resultados públicos.

## Lo que no se hará

- No copiar el backend de Huella dentro de la exportación estática del sitio.
- No fingir login productivo en `/app/`, `/huella/` o `/red/app/`.
- No mezclar el inventario de emisiones con volúmenes operativos sin fuente, unidad y regla de relación.
- No convertir una maqueta o dato ilustrativo en evidencia de impacto.
- No publicar una base compartida sin separación por organización, permisos y auditoría.

## Registro de esta iteración

- Se creó `/plataforma/` como centro de entrada único.
- Se creó `/red/app/` como estación independiente navegable para validar UX y contratos de pantalla.
- Se mantuvieron `/app/` y `/huella/` como experiencias públicas actuales, con estado explícito.
- Se añadió este documento para guiar la migración real de backends y evitar una consolidación superficial.
