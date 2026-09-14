# Matriz editorial web Greenatics · V1

## Propósito

Esta matriz asigna una función principal a cada familia de rutas. Sirve para escribir, revisar y ubicar nuevos contenidos sin repetir la misma promesa en varias páginas. Una página puede enlazar a otra, pero no debe competir con ella por la misma pregunta.

## Arquitectura de mensajes

| Ruta | Pregunta que responde | Audiencia prioritaria | Mensaje canónico | Evidencia o soporte | Acción principal |
| --- | --- | --- | --- | --- | --- |
| `/` | ¿Qué es Greenatics? | Todas las audiencias | Diseñamos sistemas de economía circular que una organización puede operar, medir y mejorar. | Casos, imágenes reales, cinco capacidades | Encontrar mi solución |
| `/servicios/` | ¿Qué se puede contratar? | Municipios, ESP, empresas, agroindustria | Portafolio de diagnóstico, logística, infraestructura, operación, datos y valorización, con modelos de operación integral, compartida o dirección técnica. | Alcances, actividades, entregables y categorías | Encontrar mi ruta |
| `/soluciones/` | ¿Qué combinación de capacidades necesita mi problema? | Decisores y equipos técnicos | Una solución es una combinación de capacidades ajustada al material, territorio, infraestructura y capacidad local. | Secuencia del sistema y rutas por necesidad | Encontrar mi punto de entrada |
| `/municipios/` | ¿Cómo convertir una meta pública en operación territorial? | Municipios y ESP | Separación, microrrutas, plantas, dirección técnica, datos y cumplimiento conectados en una ruta gradual. | Caso Yarumal, rutas, resultados validados | Explorar ruta territorial |
| `/empresas/` | ¿Cómo ordenar y demostrar una corriente interna? | Empresas y grandes generadores | PMIRS, separación, logística, tratamiento y evidencia para reducir pérdidas y hacer visible la gestión. | Flujos de responsabilidad y registros | Revisar mi corriente |
| `/agroindustria/` | ¿Cómo aprovechar subproductos, biogás y energía? | Agroindustria | Caracterizar la corriente y conectar hidrólisis, UASB, biogás, bioenergía, productos y control operacional. | Caso Támesis, diagrama de proceso, variables de control | Evaluar un proyecto |
| `/casa-jardin/` | ¿Cómo cuidar plantas en casa, jardín o huerta? | Hogares, viveros y huertas urbanas | Diagnóstico, producto y guía organizados por tipo de planta, etapa y objetivo. | Guías, kits y herramientas de orientación | Encontrar mi guía |
| `/wondergreen/` | ¿Cómo se conecta la valorización con suelo y cultivo? | Productores y distribuidores | Nutrientes, bioinsumos y acompañamiento para decidir según suelo, cultivo, etapa y objetivo. | Catálogo, manuales y arquitectura agronómica | Explorar Wondergreen |
| `/proyectos/` | ¿Dónde se ha aplicado el sistema? | Decisores, aliados y equipos técnicos | Yarumal y Támesis muestran arquitecturas distintas: compostaje y logística local; digestión anaerobia, biogás y bioenergía. | Fotografías, casos y leyendas de procedencia | Leer un caso |
| `/impacto/` | ¿Qué resultados están validados y cómo se obtuvieron? | Dirección, entidades y aliados | Las cifras de Yarumal son claims de impacto, eficacia y eficiencia del caso, con periodo, alcance, método y soporte visibles. | `src/data/claims.ts`, contrato de publicación de impacto | Ver evidencia y metodología |
| `/plataforma/` | ¿Dónde están las herramientas y cuál es su estado? | Usuarios de productos y aliados | Greenatics es la puerta de entrada; cada runtime conserva su alcance, permisos y nivel de madurez. | Estados locales, staging o producción; enlaces de runtime | Abrir una aplicación |
| `/herramientas/` | ¿Qué puedo explorar por mi cuenta? | Usuarios en etapa de exploración | Calculadoras, diagnóstico y recursos para formular mejores preguntas antes de contratar o implementar. | Herramientas orientativas y advertencias de alcance | Usar una herramienta |
| `/huella/` | ¿Qué hace Calcula tu Huella? | Organizaciones y responsables de sostenibilidad | Mide, comprende y reduce con inventarios, fuentes, evidencia, revisión y reportes trazables. | Landing oficial y runtime FastAPI | Explorar la plataforma |
| `/red/` | ¿Cómo se convierte el territorio en trabajo coordinado? | Municipios, ESP y equipos territoriales | Proyecto 360, FIELD, QA/QC, PMIRS y seguimiento conectan registro, revisión, decisión e implementación. | Prototipo navegable y contrato futuro de producto | Abrir estación Red |
| `/app/` | ¿Cómo se ve la experiencia de OPS? | Equipos operativos y dirección | La demo muestra bitácora, recepciones, procesos, activos, inventarios e indicadores; la operación real requiere entorno configurado. | Datos ilustrativos y módulos de demo | Recorrer la demostración |

## Reglas de redacción

1. La primera pantalla debe decir quién puede beneficiarse, qué problema aborda y cuál es el siguiente paso.
2. La página de servicios explica alcance contratable; la página de soluciones explica combinación y decisión. No duplicar los mismos listados en ambas.
3. La página de proyectos cuenta cómo funciona un caso; la página de impacto explica qué está medido, validado y publicado.
4. Los claims de Yarumal pueden comunicarse como resultados validados del caso, siempre junto con su periodo, alcance, método y contexto.
5. Támesis puede comunicar la existencia del UASB, la captura de biogás, el aprovechamiento de bioenergía y la arquitectura operativa. No publicar una serie energética cuantitativa hasta contar con su corte validado.
6. Las imágenes reales explican una etapa, un equipo, una salida o una relación territorial. No usar una imagen de producto o planta para llenar una tarjeta sin leyenda interpretativa.
7. Las herramientas orientativas deben indicar supuestos y límites; no reemplazan caracterización, ingeniería, factores documentados o validación contractual.
8. Cada CTA debe expresar la acción y el nivel de compromiso: explorar, diagnosticar, revisar alcance, solicitar acceso o diseñar implementación.

## Auditoría de duplicación

- Si una frase aparece en tres o más familias de rutas, convertirla en principio de marca o reescribirla con el contexto de la página.
- Si un bloque enumera capacidades, debe enlazar a su página de decisión y no repetir sus entregables completos.
- Si un caso contiene cifras, el resumen comercial debe enlazar a `/impacto/` y la ficha del caso debe explicar el mecanismo operativo detrás de cada cifra.
- Si una aplicación tiene landing propia, `/plataforma/` y `/acceso/` describen su estado y la enlazan; no deben intentar reemplazar su onboarding.

## Próxima revisión

La V1 debe contrastarse con nuevas fuentes de Greenatics, capturas anonimizadas de OPS, la landing completa de Calcula tu Huella y los datos validados que se aprueben para Támesis. Cualquier nuevo claim, imagen o producto debe entrar primero en el registro de fuente y estado antes de publicarse.
