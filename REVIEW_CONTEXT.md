# Greenatics Web: contexto para revisión externa

## Estado de esta versión

Esta carpeta contiene la versión local más avanzada de la web pública de Greenatics.
Está construida con Next.js 16, React 19 y TypeScript. El build de producción y el
typecheck fueron validados antes de preparar este paquete.

La versión incorpora, entre otros elementos:

- Portada organizada por municipios, empresas y agro.
- Casos territoriales independientes para Yarumal y Támesis.
- Caso Yarumal con cifras de impacto validadas y contextualizadas.
- Caso Támesis con reactor anaerobio UASB, hidrólisis, captura de biogás y bioenergía.
- GREENATICS OPS como estación operativa con bitácoras, recepciones, procesos,
  volúmenes, activos, inventario, reportes y vistas por planta.
- Centro de recursos con biblioteca, proyectos, metodología de impacto y herramientas.
- Universo Wondergreen con productos, cultivos, guías, calculadoras y Casa & Jardín.

## Fuente de verdad para claims públicos

Los resultados validados del caso Yarumal están centralizados en
'src/data/claims.ts':

- '+120 t/mes' de residuos orgánicos desviados de disposición final.
- '96,4 %' de pureza orgánica en recepción.
- '140 km' de transporte regional evitado por viaje sustituido.
- '$180 M COP/año' de ahorro validado en fletes.

Estas cifras corresponden al contexto y periodo documentado del caso Yarumal. No deben
convertirse en garantías universales para nuevos proyectos.

La infraestructura de Támesis está documentada, pero el sitio no debe publicar una
serie de producción energética como validada hasta contar con balance y registros
aprobados.

## Principios editoriales

1. Separar claramente hechos validados, infraestructura documentada, demostradores,
   metodologías, proyecciones y ejemplos ilustrativos.
2. No presentar beneficios tributarios, registros, certificaciones, rendimientos
   agronómicos o tiempos de entrega como automáticos.
3. Explicar primero el problema, la decisión y el entregable; luego la tecnología.
4. Utilizar imágenes reales de Yarumal y Támesis cuando se hable de esos proyectos.
5. Mantener GREENATICS OPS como una capacidad profunda de operación, no como un
   dashboard decorativo.

## Rutas prioritarias para revisar

- '/'
- '/municipios/'
- '/empresas/'
- '/proyectos/'
- '/proyectos/yarumal/'
- '/proyectos/tamesis/'
- '/app/'
- '/impacto/'
- '/recursos/'
- '/tecnologia/'
- '/wondergreen/'

## Qué esperamos de una revisión

La revisión debe proponer cambios concretos y priorizados en:

- Arquitectura de información y navegación.
- Claridad de la propuesta de valor.
- Textos, titulares, explicaciones y llamadas a la acción.
- Uso y selección de imágenes.
- Consistencia entre páginas.
- Diferenciación entre evidencia y promesa.
- Experiencia móvil y de escritorio.
- Conversión para municipios, empresas, aliados, distribuidores y productores.

No se deben inventar cifras, alianzas, certificaciones, registros, capacidades,
clientes o resultados.

