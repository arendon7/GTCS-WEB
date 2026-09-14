# PRODUCT · GREENATICS WEB PLATFORM

## Tipo de producto
Plataforma web única de GREENATICS con dos superficies claramente separadas y un mismo repositorio:

1. **Web pública corporativa y comercial**: presenta GREENATICS, Wondergreen, soluciones, proyectos, tecnología, impacto, conocimiento y rutas de contacto/conversión.
2. **GREENATICS OPS**: aplicación interna operacional y de dirección para captura, trazabilidad, coordinación, análisis y flujo de información de la empresa.

La coexistencia en `GTCS-WEB` no autoriza a mezclar experiencia pública e interna. Comparten base técnica, componentes transversales cuando sea seguro y una futura capa de publicación gobernada; mantienen rutas, navegación, lenguaje visual y permisos propios.

## Superficies y rutas
### Web pública
- `/` es la entrada corporativa pública.
- Las rutas públicas incluyen, progresivamente: `/wondergreen`, `/servicios`, `/proyectos`, `/impacto`, `/tecnologia`, `/biblioteca`, `/nosotros`, `/contacto` y demás rutas aprobadas.
- La web pública debe incluir una entrada visible a GREENATICS OPS sin exponer datos internos.

### GREENATICS OPS
- `/app` es la entrada explícita a la experiencia interna.
- Las rutas operativas existentes continúan funcionando y no se eliminan ni se reescriben solo para acomodar la web pública.
- Autenticación, permisos y datos internos nunca dependen de ocultamiento visual de enlaces públicos.

## Usuarios de la web pública
- Productores y agricultores.
- Agrotiendas y distribuidores.
- Agrónomos y técnicos.
- Municipios, ESP y entidades públicas.
- Empresas generadoras de residuos orgánicos.
- Aliados técnicos, académicos y comerciales.
- Personas interesadas en conocer GREENATICS y sus soluciones.

## Usuarios de GREENATICS OPS
- Operarios de planta.
- Coordinación / supervisión.
- Dirección Operativa.
- Dirección / gerencia.
- Mantenimiento.
- Técnico / calidad.
- Administración.

## Problemas que resuelve la web pública
- Explicar con claridad qué es GREENATICS y cómo conecta residuos, tecnología, operación, suelo y producto.
- Dar a Wondergreen una ruta comercial y técnica fuerte, sin reducirlo a un catálogo de NPK.
- Organizar fertilizantes sólidos, fertilizantes líquidos, compost y bioinsumos por cultivo, etapa, necesidad y problema.
- Convertir guías, manuales y conocimiento técnico existente en recursos navegables.
- Enrutar oportunidades de municipios, empresas, productores, agrotiendas y agrónomos hacia la solución adecuada.
- Publicar impacto únicamente cuando el dato esté conciliado, aprobado y tenga fuente/metodología aplicable.

## Problemas que resuelve GREENATICS OPS
- Registros dispersos en formularios, Excel y SharePoint.
- Falta de visión inmediata de qué está haciendo cada trabajador.
- Dificultad para comparar programación vs ejecución.
- Mantenimientos y fallas enterrados en comentarios.
- Errores de fechas, unidades, horas y duplicados.
- Retrabajo para construir dashboards.
- Dificultad para reconstruir un día, mes o periodo histórico.

## Experiencia objetivo pública
Una persona debe poder entrar sin conocer la estructura interna de GREENATICS y responder rápidamente una de estas preguntas: tengo un residuo, un cultivo, un proyecto o quiero entender qué hace GREENATICS. La profundidad técnica aparece progresivamente, no como una pared de texto.

Wondergreen se presenta como sistema de **suelo + nutrición + biología + conocimiento + acompañamiento**, con dos familias de producto principales:
- fertilizantes: 5 referencias líquidas, 4 referencias sólidas y compost;
- bioinsumos: referencias microbianas y extractos botánicos aprobados, incluyendo Neem y Ajo–Ají, con estado regulatorio/comercial explícito.

Los sólidos Wondergreen pueden comunicar su condición de organominerales ocluidos y peletizados cuando corresponda a la versión de producto soportada. Claims como liberación controlada, eficacia, rendimiento o reducción de pérdidas requieren soporte específico antes de publicarse.

## Experiencia objetivo GREENATICS OPS
### Operario
Ve “Hoy”, inicia una actividad, la finaliza y completa únicamente los datos que no pueden derivarse.

### Coordinación
Ve plan vs real, faltantes, desviaciones, incidencias, equipos y calidad del dato.

### Dirección
Ve recibido, procesado, producción, horas-hombre, cumplimiento, mantenimiento y alertas por día, mes o histórico.

## Flujo canónico interno
Programación mensual/semanal → calendario → actividad programada → ejecución → registro técnico → evidencia/incidencia → revisión → indicadores → histórico.

## Relación futura entre ambas superficies
La app interna es la fuente de verdad operacional. La web pública no lee directamente SharePoint ni expone datos internos. Los indicadores, proyectos, productos o contenidos que se publiquen desde información interna deben pasar por una capa/contrato de publicación con estado, fecha, fuente y aprobación.

## Principios de producto
- **No reemplazar una buena versión para crear otra**: evolucionar por capas y cambios revisables.
- **Una sola fuente técnica, dos experiencias**: compartir infraestructura no significa mezclar UX pública e interna.
- **Complejidad interna, experiencia simple**: la profundidad vive en modelos, evidencia y automatizaciones, no en formularios o páginas innecesariamente densas.
- **Truth lock de marca y producto**: no redibujar logos, empaques, etiquetas, formulaciones ni claims.
- **Publicación gobernada**: un dato o claim público debe poder rastrearse a una fuente y estado aprobados.
