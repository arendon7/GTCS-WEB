# Greenatics Web · checkpoint de iteración · 2026-09-17

## Lectura del plan

El portal público está en una etapa avanzada de cierre editorial, visual y de navegación. El siguiente salto no consiste en añadir más páginas, sino en hacer consistente la experiencia completa: cada landing debe explicar su producto, cada demo debe ser recorrible, cada runtime debe tener una entrada real y cada claim debe conservar su contexto.

La ruta de producto sigue siendo:

1. Portal Greenatics para comprender y elegir.
2. Landing específica para explicar alcance, módulos y casos de uso.
3. Demo pública para recorrer la experiencia con datos ilustrativos.
4. Runtime autenticado para trabajar con organización, rol, permisos y persistencia.

## Cerrado en este corte

- La home tiene accesos directos a OPS, Red, Calcula tu Huella, AGROWAY y SANA.
- El Centro Greenatics separa landing, demo y entorno real.
- El Centro añade un mapa de tres puertas: landing para entender, demo pública para explorar y entorno real para operar con permisos.
- La barra flotante no compite con el bloque de herramientas en la home; se conserva en páginas internas.
- La página de impacto muestra los claims validados de Yarumal con periodo, ruta o escenario visible.
- Se añadió una lectura explícita de cómo la evidencia logística puede alimentar un claim climático de CO₂.
- Wondergreen distingue nutrición soluble de bioinsumo líquido con soporte documental.
- El centro de usuarios filtra por organización y recalcula métricas, directorio y alcance de plataformas.
- Las imágenes de etiquetas líquidas y bioinsumos se presentan como referencias visuales, no como packshots aprobados cuando el registro de producto aún no los reconcilia.
- El smoke test del ecosistema acepta destinos configurables para repetir la validación en local, LAN, staging o producción sin editar el script.
- La Biblioteca dejó de prometer un inventario obsoleto: ahora comunica 24 recursos curados, distingue descarga PDF de referencia web y alinea el catálogo público Wondergreen con sus 10 páginas reales.
- Red sustituyó estados ambiguos de “por confirmar” por estados operativos accionables como “unidad no registrada” y “medición de capacidad de recepción”.
- Se eliminó la duplicación de marca en el título de Biblioteca y se actualizó su descripción para reflejar el alcance editorial vigente.
- Municipios y Servicios ahora reutilizan un registro visual central: cada servicio tiene una imagen contextual, un `alt` descriptivo y un recorte responsive controlado, sin tarjetas vacías.
- Las landings de servicio muestran la etiqueta pública de cada capacidad, no solo su categoría técnica; Wondergreen y Digital quedan diferenciados desde el primer pantallazo.
- Programas Agronómicos Wondergreen incorporó un proceso específico de cinco pasos y una lista de insumos de diagnóstico; dejó de depender del proceso genérico de valorización.
- Casa & Jardín dejó de referenciar el asset obsoleto `kit-casa-completa-v1.png` y usa la versión WebP optimizada en la portada, el catálogo y el detalle del kit.
- El centro de herramientas unificó la marca visible como `GREENATICS Red` y reservó “microrrutas de aseo” para describir el contexto, no para nombrar una segunda aplicación.
- La home ahora lleva a la landing de cada plataforma; el Centro Greenatics conserva la separación explícita entre landing, demo pública y entorno real.
- La cadena de cinco herramientas usa cinco columnas en escritorio y un escalado de tres, dos y una columna en pantallas menores; el gobierno de cuatro estados usa cuatro, dos y una.
- El componente heredado de métricas fue alineado con los cuatro claims validados de Yarumal y quedó sin emojis ni cifras paralelas.
- Las fichas de producto Wondergreen muestran etiquetas públicas legibles como “Fertilizantes sólidos”, “Fertilizantes líquidos” y “Bioinsumos y bioles”.
- La auditoría estática ahora protege las 14 fichas de producto: exige H1, tratamiento visual, retorno a Wondergreen y entrada al cotizador; la ficha especial de Biol quedó incluida con su estructura documental.
- El Centro Greenatics ya no deja AGROWAY ni SANA en un estado terminal: además de la demo, cada tarjeta ofrece `Configurar entorno real` y conserva el interés de la herramienta en la ruta de acceso.
- La estación pública de GREENATICS Red dejó de mostrarse como “Prototipo navegable” y ahora se presenta como `Estación demo`, manteniendo visibles sus datos ilustrativos y el enlace a usuarios y permisos.
- Los enlaces de configuración del Centro conservan el contexto de cada herramienta: Red, Huella, AGROWAY y SANA llegan a Acceso con su interés específico, sin caer en una ruta genérica.
- Casa & Jardín ordena ahora su entrada comercial en tres pasos visibles: orientación, guías y catálogo de productos/kits; “Quiero comprar” ya no salta directamente a Contacto.
- El catálogo de Casa & Jardín ya no deja COMPOST sin referencia visual: usa la ficha validada del sistema Wondergreen mientras no exista un packshot independiente aprobado.
- El catálogo reemplazó lenguaje interno de reconciliación comercial por una explicación pública de la recomendación: cultivo, sustrato, condición, etiqueta, dosis y frecuencia.
- La auditoría estática protege el catálogo Casa & Jardín con cinco tarjetas visuales y bloquea el regreso del lenguaje interno de reconciliación comercial.
- La home alinea la promesa de herramientas con la navegación real: cada tarjeta comunica “alcance y acceso” y explica que la landing contiene módulos, demo y entrada operativa con credenciales.
- La página de acceso reemplazó un cierre defensivo por una explicación positiva de seguridad: demos sin contraseña y entornos reales con identidad, roles, permisos y trazabilidad.
- El Centro de usuarios distingue mejor la revisión local de la administración productiva: sus enlaces llaman a “Administrar usuarios en OPS”, abren la consola externa de forma segura y mantienen visible el alcance de la demo.
- El rail de acceso de las landings ya no oculta la configuración real cuando existe una demo sin runtime conectado: Huella, Red, AGROWAY y SANA muestran demo pública y preparación del entorno por organización.
- AGROWAY reemplazó etiquetas públicas de “Por certificar” y “Por montar” por una ruta de puesta en marcha: base funcional, capacidades de ecosistema, certificación técnica y configuración productiva.
- El Centro de usuarios eliminó el lenguaje de desarrollo “Consola local preparada” y ahora comunica una vista de demostración, con transparencia sobre persistencia local y administración productiva en OPS.
- El metadata raíz dejó de imponer la URL de la portada como `og:url` en todas las páginas; cada ruta conserva su canonical y el QA ahora detecta cualquier Open Graph que apunte a otra ruta.
- Se eliminaron landmarks `<main>` anidados en el Centro de usuarios, la biblioteca de cultivos, las guías de cultivo y las herramientas de soluciones/agronomía; sus clases visuales se mantienen sin duplicar la semántica principal.
- La auditoría estática ahora falla ante más de un landmark principal por página, además de verificar canonical, `og:url`, enlaces, imágenes, JSON-LD, sitemap, claims sensibles y rutas de runtime.
- El Centro Greenatics dejó de llamar “prototipo” a GREENATICS Red: ahora comunica una estación demo disponible con datos ilustrativos y una ruta explícita de consolidación productiva.
- Las pestañas de audiencia de la portada incorporaron navegación por teclado con flechas, `Home` y `End`, manteniendo el cambio de contenido y el foco visible.
- El puente de decisión de las rutas municipales dejó el contexto editorial en una sola introducción; las tarjetas ya no repiten el mismo texto auxiliar en cada alternativa.
- El registro visual municipal incorporó excepciones explícitas para diferenciar el diagnóstico aéreo de la evidencia de operación en campo de PGIRS/PMIRS; esto evita que dos capacidades distintas se perciban como la misma escena.
- La cabecera institucional reconoce la ruta actual y sus subrutas: marca la sección activa en escritorio, la opción hija en los desplegables y el grupo correspondiente en el menú móvil mediante `aria-current`.
- Las fichas públicas Wondergreen ajustaron el texto de sus visuales de referencia: ahora conectan imagen de familia, ficha técnica, presentación, suministro y cotización sin exponer lenguaje interno de reconciliación.
- Biblioteca y Wondergreen incorporaron metadata social de sección para no compartir páginas técnicas con el título genérico de la portada; las rutas hijas conservan sus títulos específicos cuando los declaran.
- Casa & Jardín incorporó metadata social propia para que portada, kits y guías se compartan como una experiencia Wondergreen diferenciada.
- Las páginas hijas de Casa & Jardín ahora declaran metadata social específica: cada kit comparte su ruta y portada, cada producto su función e imagen aprobada cuando existe, y la biblioteca de guías su cubierta PDF. Esto evita que un enlace compartido pierda el contexto del recurso.
- La puerta “Quiero comprar” de Casa & Jardín dejó de mezclar productos y kits en un único CTA: ahora ofrece “Ver productos por etapa” y “Ver kits por uso”, con destinos independientes y visibles.
- Los índices de productos y kits de Casa & Jardín ahora tienen metadata social propia e imagen contextual, completando la cadena de compartibilidad entre sección, catálogo, kit, producto y guía.
- Casa & Jardín incorporó breadcrumbs JSON-LD en portada, índices de productos y kits, guías y fichas individuales; la jerarquía Greenatics → Casa & Jardín → recurso ahora coincide con los retornos visibles de cada página.

## Puertas verificadas

- TypeScript sin errores.
- Build Next.js de producción correcto.
- 126 rutas estáticas generadas.
- Auditoría estática: 124 páginas HTML y 50 rutas del sitemap.
- Salida pública sin URLs de runtimes locales.
- Entry points principales verificados sobre el export estático en `localhost:3042`: home, Centro Greenatics, Huella, acceso, Red, OPS y Támesis responden HTTP 200.
- Revisión de navegador del Centro: 5 aplicaciones con landing y entrada demo navegable; el mapa de acceso es visible y accesible.
- Contrato de landings: 5/5 rutas verificadas con demo específica, enlace al Centro de herramientas y navegación institucional.
- Revisión de navegador sobre el export nuevo: home, Biblioteca y Red cargan con títulos, inventario, módulos y retornos institucionales actualizados.
- Revisión de navegador sobre el export nuevo: el centro muestra cinco herramientas, accesos diferenciados y la cadena completa de cinco capas sin espacio huérfano.
- Las filas seleccionables del directorio de Red exponen selección, contexto y estado al teclado; la interacción con espacio no provoca desplazamiento accidental.
- Diagnóstico, FAQ y las ocho rutas de soluciones específicas tienen metadata propia para no aparecer como páginas genéricas al compartirlas o encontrarlas en buscadores.
- Auditoría de imágenes: 42 archivos con `next/image`, 0 tags sin `alt`; registro visual de servicios con 7/7 assets existentes y salida estática sin referencias al asset reemplazado.
- Contrato de producto: 14/14 landings exportadas con visual y rutas de continuidad verificadas.
- QA semántico: 124 páginas HTML sin landmarks `<main>` duplicados y sin `og:url` heredados de la portada.
- Revisión visual local: portada, accesos, imágenes de operación y bloque de rutas de audiencia revisados sobre `localhost:3042`.
- Revisión de municipios: el HTML exportado conserva el texto auxiliar una sola vez y usa visuales diferenciados para diagnóstico y operación de rutas.
- Revisión del Centro de Herramientas: las tres puertas (landing, demo pública y entorno real) se leen en móvil; los accesos de OPS, Red, Huella, AGROWAY y SANA mantienen su destino diferenciado.
- Revisión de producto: 2GROW conserva su pieza visual documental con presentaciones sólida y líquidas visibles; el componente común mantiene un tratamiento fail-closed para referencias sin packshot público aprobado.
- Cada ficha de producto Wondergreen incorpora ahora dos salidas de continuidad desde el criterio técnico: manual de aplicación y ciencia Wondergreen, además de sus rutas existentes hacia cultivos, cotizador y contacto.
- QA de compartibilidad: Biblioteca comparte con título propio de sección y Wondergreen con título de sistema agronómico; no se alteraron las URLs canónicas ni el sitemap.
- QA de Casa & Jardín: portada, kits y guías exportan título social de sección; las descargas PDF y los enlaces canónicos permanecen intactos.
- QA de compartibilidad de Casa & Jardín: kits, productos y guías exportan `og:title`, `og:description`, `og:url` e imagen contextual cuando corresponde; se verificaron Plantas Verdes, CRECE y Guías.
- QA de orientación de compra: el HTML exportado contiene las dos rutas diferenciadas y ya no conserva el CTA ambiguo “Ver productos y kits”.
- QA de catálogo compartible: los índices `/casa-jardin/productos/` y `/casa-jardin/kits/` exportan título, descripción, URL e imagen Open Graph propios.
- QA estructural de Casa & Jardín: seis superficies exportan breadcrumbs válidos y conservan las rutas canónicas, sin cambiar el contenido visible ni las URLs públicas.
- Los botones que prometen descargar documentos en Casa & Jardín y Biol ahora ejecutan descarga directa del PDF; el HTML exportado fue comprobado con el atributo `download`.

## Riesgos que permanecen

- El proceso interactivo que atiende `localhost:3002` puede conservar un build anterior en memoria después de una compilación. Debe reiniciarse desde Antigravity para visualizar cambios nuevos.
- Calcula tu Huella necesita staging con PostgreSQL, almacenamiento privado, secretos externos, `SEED_DEMO=false`, aislamiento entre organizaciones y smoke end-to-end.
- OPS necesita staging con Supabase, migraciones, RLS, usuarios piloto, plantas Támesis/Yarumal, backup/restauración y pruebas operativas reales.
- Red mantiene una estación navegable con datos ilustrativos; necesita persistencia, identidad, permisos, captura FIELD, QA/QC y PMIRS operativo antes de declararse runtime productivo.
- El registro de activos de producto sigue en modo fail-closed hasta reconciliar etiqueta, presentación, fórmula, fuente y aprobación.
- La suite Playwright de Red y la suite de accesibilidad requieren descargar el navegador headless de Playwright en el entorno de ejecución; en este corte no se ejecutaron por esa dependencia ausente, aunque la revisión estática y el build sí pasaron.

## Siguiente lote recomendado

1. Reiniciar el servidor local y hacer revisión visual escritorio/móvil de home, herramientas, Wondergreen y usuarios; el proceso actual puede conservar un build anterior en memoria.
2. Ejecutar `pnpm qa:tool-contracts` y auditar enlaces de cada landing contra su demo y runtime correspondiente; para un export estático, usar `GREENATICS_SITE_URL=http://localhost:3042`.
3. Reconciliar el registro visual de productos Wondergreen por SKU, empezando por sólidos y líquidos.
4. Convertir la lista de gates de staging en una secuencia ejecutable para Huella y OPS, sin publicar secretos.
5. Mantener Red como producto en construcción hasta completar persistencia y permisos; no confundir estación pública con operación multiusuario.
6. Mantener el control de semántica y metadatos dentro de la auditoría estática para que las próximas iteraciones de contenido o diseño no degraden accesibilidad ni compartibilidad.
7. Reconectar el proyecto Sites original desde la cuenta personal antes de publicar este commit; no crear una segunda URL mientras el proyecto anterior no sea visible.
8. Continuar la revisión visual con el mismo criterio: reducir repetición, distinguir cada capacidad con evidencia adecuada y evitar imágenes decorativas sin función narrativa.
9. Mantener el estado de navegación activo al incorporar nuevas rutas, especialmente en las landings de producto, herramientas y Casa & Jardín.
10. Cuando se aprueben nuevos packshots o etiquetas, incorporarlos al registro por SKU sin reemplazar referencias documentales con mockups no reconciliados.
11. Mantener la continuidad de las fichas: producto, manual, ciencia, cultivo, cotizador y contacto deben permanecer visibles como una misma ruta.
12. Al crear nuevas secciones, definir metadata social de sección y verificar que las páginas no hereden el título genérico de Greenatics.
13. Mantener alineados el verbo de cada CTA documental y su comportamiento real: “Descargar” debe descargar; “Abrir” debe abrir una ruta de lectura.
14. Mantener Casa & Jardín como una experiencia propia dentro de Wondergreen: portada, kits, productos y guías deben compartir identidad visual y metadata, pero conservar entradas claras.
15. Mantener metadata social específica en cada recurso compartible de Casa & Jardín; no volver a depender del título genérico de la sección cuando exista una ficha o documento concreto.
16. Mantener separadas las puertas de catálogo y kits en cualquier CTA futuro; no usar etiquetas que prometan dos destinos cuando solo enlazan uno.
17. Mantener metadata propia en los índices de productos y kits; la sección Casa & Jardín no debe ser el único contexto compartido.
18. Mantener la jerarquía JSON-LD alineada con la navegación visible al crear nuevas fichas o documentos dentro de Casa & Jardín.

## Regla de continuidad

Cada iteración posterior debe anotar archivos modificados, decisión editorial o técnica, pruebas ejecutadas, riesgos que siguen abiertos y el siguiente lote. No se promociona una experiencia de demo a producción solo por estar navegable.
