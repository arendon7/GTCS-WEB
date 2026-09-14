# Plan de trabajo · Greenatics como plataforma

## Propósito

Convertir la web Greenatics en una puerta única, clara y confiable para sus productos digitales, sin esconder la complejidad real detrás de una maqueta. La experiencia pública debe explicar; las aplicaciones autenticadas deben operar; y los datos publicados deben conservar fuente, estado, periodo, responsable y nivel de revisión.

## Punto de partida

- El sitio institucional Next.js y sus rutas públicas compilan y pasan auditoría estática.
- `/plataforma/` funciona como centro de entrada para OPS, Calcula tu Huella, GREENATICS Red y AGROWAY.
- `/huella/` es ahora la landing pública de Calcula tu Huella, con logo propio, estimador y acceso diferenciado.
- `apps/calcula-tu-huella/` contiene el backend canónico FastAPI + PostgreSQL V0.45.5.
- `apps/greenatics-ops/` contiene el runtime Next.js + Supabase de OPS, sus migraciones y pruebas.
- `/red/app/` es una estación navegable para validar la experiencia de Red; sus datos todavía son ilustrativos.
- Yarumal y Támesis tienen contenido público, evidencia visual y narrativa técnica diferenciada.

## Decisiones que no se deben romper

1. Greenatics es la marca y la puerta de entrada, no necesariamente una única base de datos ni un único runtime.
2. La demo pública nunca se presenta como conexión en vivo.
3. La identidad y los permisos se comparten solo mediante contratos explícitos.
4. Un dato corregido conserva su fuente original, autor, fecha, motivo y versión.
5. Las cifras validadas de impacto sí pueden comunicarse; cada claim conserva periodo, alcance, método y soporte.
6. La operación de plantas, incluyendo Támesis y Yarumal, permanece como servicio público del portafolio.
7. Casa y Jardín, Wondergreen, Huella, OPS, Red y AGROWAY se mantienen visibles, aunque tengan públicos y niveles de madurez distintos.

## Secuencia de ejecución

### Fase 0 · Cerrar las entradas públicas

**Estado:** cerrada para el portal local; pendiente de promoción a staging certificado.

**Entregables:**

- Landing de cada producto con promesa, usuario, capacidades, estado y CTA correcto.
- Centro de acceso que reconozca Huella, OPS, Red y AGROWAY explícitamente.
- Estados visibles: demo pública, estimador, prototipo navegable, staging o producción.
- Activos oficiales en `public/brand/` y leyendas que distingan evidencia real de composición ilustrativa.

**Gate de salida:** ninguna acción pública debe llevar a una ruta genérica que no explique el producto que la originó.

### Fase 1 · Congelar el sistema de contenido y diseño

**Objetivo:** que la mejora no dependa de memoria de chat ni de decisiones aisladas.

**Entregables:**

- Inventario de páginas, claims, imágenes, fuentes y estados de producto.
- Matriz de mensajes por audiencia: municipios y ESP, empresas, agroindustria, casa y jardín, dirección y equipos operativos.
- Design tokens, componentes de CTA, tarjetas de estado, leyendas de evidencia, tablas de resultados y patrones responsive.
- Biblioteca de activos con nombre, origen, licencia, uso permitido, recorte y texto alternativo.
- Registro editorial para evitar duplicaciones entre `/servicios/`, `/soluciones/`, `/herramientas/`, `/proyectos/` y `/biblioteca/`.

**Gate de salida:** cada página tiene una función principal, una audiencia prioritaria y una acción siguiente; no se agregan secciones solo para llenar espacio.

### Fase 2 · Preparar repositorio y entornos

**Objetivo:** hacer reproducible el proyecto central y separar local, staging y producción.

**Entregables:**

- Repositorio Greenatics conectado a GitHub o monorepo definido, sin arrastrar secretos ni datos de usuario.
- CI del monorepo con gates separados para web pública, GREENATICS OPS y Calcula tu Huella.
- Entornos `local`, `staging` y `production` con variables externas y reglas de promoción.
- Runbooks de despliegue, rollback, backup, restauración y respuesta ante incidentes.
- Dominio o subdominios definidos para portal, OPS, Huella y Red.

**Gate de salida:** un tercero puede clonar, instalar, probar y desplegar el sitio público sin depender de una sesión local de Antigravity.

### Fase 3 · Staging de Calcula tu Huella

**Objetivo:** pasar del backend incorporado al proyecto a una aplicación ejecutable dentro del ecosistema Greenatics.

**Entregables:**

- PostgreSQL de staging nuevo y almacenamiento privado para evidencias.
- Migraciones V0.45.5 aplicadas desde cero y respaldadas.
- `SEED_DEMO=false`, secretos externos y eliminación de credenciales demo activas.
- Usuarios, organizaciones, inventarios de prueba, cargas CSV/XLSX y datos de corrección.
- Smoke tests para login, aislamiento, importación, validación, historial, cálculo, cierre y reportes.
- Enlace desde `/huella/` al runtime solo cuando el preflight esté listo.

**Gate de salida:** una organización de prueba puede completar el recorrido fuente → validación → evidencia → cálculo → reporte y otra organización no puede leer sus datos.

### Fase 4 · Staging de GREENATICS OPS

**Objetivo:** poner en operación controlada la aplicación completa, no solo su demo editorial.

**Entregables:**

- Proyecto Supabase piloto separado del sitio público.
- Migraciones versionadas aplicadas en orden.
- Roles y membresías para `TAM` Támesis y `YAR` Yarumal.
- Preflight, bootstrap atómico de Dirección y smoke RLS.
- Pruebas de bitácora, recepciones, lotes, compostaje, producción, activos, mantenimiento, inventario, compras, gastos, ventas y reportes.
- `next start` o despliegue de staging para evitar depender de watchers locales.

**Gate de salida:** cada usuario ve únicamente las plantas, módulos y acciones autorizadas; toda operación relevante deja historial y puede conciliarse con el reporte.

### Fase 5 · Identidad y navegación común

**Objetivo:** que el usuario perciba una sola plataforma sin fusionar indebidamente los dominios.

**Entregables:**

- Portal autenticado Greenatics con organización y contexto activo.
- Sesiones seguras, recuperación de cuenta, roles y membresías.
- Gateway o reverse proxy para TLS, headers, observabilidad y rutas coherentes.
- Contrato común de `Organization`, `Project`, `Facility`, `Activity`, `Inventory` y `Evidence`.
- Enlaces contextuales entre Red, OPS y Huella mediante identificadores estables o read models, no consultas directas a tablas privadas.

**Gate de salida:** cambiar de producto no cambia accidentalmente de organización ni abre información de otro contexto.

### Fase 6 · GREENATICS Red como producto

**Objetivo:** convertir el prototipo de estación en una aplicación con persistencia y trabajo real.

**Entregables:**

- Proyecto 360 y diagnóstico territorial.
- FIELD móvil para captura de campo.
- QA/QC con hallazgos, responsables, estados y evidencias.
- Línea base validada y PMIRS STUDIO.
- Programas, acciones, indicadores y seguimiento PMIRS VIVO.
- Centro de coordinación conectado a OPS mediante referencias de contexto.

**Gate de salida:** un caso puede pasar de diagnóstico a acción, conservar evidencia y mostrar quién debe hacer qué, sin convertir un dato preliminar en claim publicado.

### Fase 7 · Claims, casos y biblioteca

**Objetivo:** usar la capacidad real del sistema para comunicar mejor, no para inflar el relato.

**Entregables:**

- Fichas de Yarumal y Támesis con resultados validados, periodo, método y límites.
- Diferenciación explícita entre compostaje, digestión anaerobia, producción de biogás, captura, acondicionamiento, almacenamiento, uso y medición de bioenergía.
- Biblioteca de capturas anonimizadas de Huella, OPS y Red.
- Diagramas de flujo de datos, operación, masa, gas, energía y evidencia.
- Reducción de duplicaciones entre páginas comerciales y técnicas.

**Gate de salida:** cada cifra pública puede rastrearse hasta un soporte y cada imagen tiene una función narrativa concreta.

### Fase 8 · Producción y mejora continua

**Objetivo:** publicar solo lo que pueda operar, protegerse y mantenerse.

**Entregables:**

- Promoción controlada de staging a producción.
- Backups y restauración ensayados.
- Monitoreo de errores, disponibilidad, rendimiento y auditoría.
- Revisión mensual de claims, factores, contenido, accesibilidad y permisos.
- Backlog priorizado por valor para usuario, riesgo y esfuerzo.

**Gate de salida:** el sistema tiene responsable, soporte, recuperación y una ruta de reversión antes de abrirse a usuarios reales.

## Próximo lote recomendado

1. Completar la Fase 1 con un inventario editorial de páginas, claims, imágenes, fuentes, estados y CTAs; eliminar duplicaciones entre `/servicios/`, `/soluciones/`, `/herramientas/`, `/proyectos/` y `/biblioteca/`.
2. Revisar visualmente `/huella/`, `/acceso/` y `/plataforma/` en escritorio y móvil, incluyendo contraste, tamaño de logos, foco de teclado, retorno a Greenatics y CTA principal.
3. Preparar la conexión del repositorio central a GitHub antes de cualquier despliegue productivo, sin publicar secretos ni bases locales.
4. Crear el contrato de staging de Huella: dominio, base, almacenamiento, secretos, migraciones, datos de prueba y recorrido fuente → validación → evidencia → cálculo → reporte.
5. Crear el contrato de staging de OPS: Supabase, plantas piloto, roles, RLS, preflight y pruebas de bitácora, volúmenes, producción, inventario y reportes.

## Modelo de colaboración con agentes

- **Astra:** dirección de producto, arquitectura, claims, priorización y decisiones de alto impacto.
- **Sol o Terra:** ejecución de cambios acotados, migraciones documentales, componentes, pruebas y QA repetible.
- **Skills de diseño y UX:** crítica visual, jerarquía, responsive, accesibilidad y microinteracciones.
- **Skills de Vercel y seguridad:** build, despliegue, variables, observabilidad, revisión de riesgo y gates de producción.

Cada iteración debe registrar: archivos cambiados, decisiones, pruebas ejecutadas, riesgos pendientes y siguiente lote. No se debe declarar una integración productiva sin autenticación, persistencia, permisos y evidencia comprobados.
