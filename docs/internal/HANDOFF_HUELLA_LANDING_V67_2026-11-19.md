# Handoff · landing estática Back 2 Green V67 en GREENATICS

**Estado: no listo para integrar; revisión de Huella pendiente.**

- **Repositorio:** `arendon7/GTCS-WEB`; rama `codex/huella-v67-static-20261119`; base exacta `main@a41c09369a671612d2475f68ca58231fbefd2ce9`.
- **Fuente propietaria:** `arendon7/back2green/main@d3377fb7614084b493ef0f5b71190ce5445237ac`. La página fuente `app/templates/public_home.html` usa `landing-visual-20261108-v67` (blob `3785816734700c41f9ab8283497322391d2bd57d`). Precios y oferta se renderizaron desde `app/public_marketing.py` (blob `98f6d651e62cbf872e36754700650c3c0c018585`).
- **Activos fuente:** `public-landing.css` blob `c2f87a70e9e44061390760595ee0d054e7f899d2`; `public-layout-refinements.css` blob `e5b3599dd1d2df34caf986527c0a24df5f3fab9f`; `app.css` blob `7e838d1ccd1dfb3ddb95d89ff9c64e99710a4193`; captura de flujo blob `b02a6ed488f9759c32d3d6377417cd83fb33e502`. Foto del medidor: `back2green-capture-energy-meter-v1.png`, blob fuente `00c4971586421783afab773ace89db635d2dc65a`, SHA-256 fuente `885b94ac8c0a1ef72fcfcc00bd9534a4aceb0321e9235c6a192ecc8f1267e1f0`; export JPEG en la web, SHA-256 `7afe9979ef13d7426e4d23c00fed5abff0f26f9d5d6ac74170000ef38ec84c25` (calidad 75, 1536×1024).

## Alcance

- Reemplaza la landing antigua de `/huella/` por el contenido estático de V67 dentro de la carcasa del sitio. No incluye backend, login, diagnóstico dinámico ni acceso a datos.
- Los enlaces a diagnóstico se dirigen al formulario de contacto de GREENATICS; metodología, entregables, normativa y planes se enlazan a secciones reales de esta misma landing. El enlace de herramientas vuelve al recorrido en esta página.
- El CSS fuente se mantiene aislado en el iframe de la página; no modifica estilos globales. El visual de producto conserva la leyenda de datos de ejemplo.

## Verificación de esta preparación

- La plantilla de V67 se renderizó con el contexto de precios y oferta obtenido de la rama fuente propietaria; quedaron 17 IDs únicos, los cuatro anchors internos referenciados existen y no quedaron expresiones Jinja.
- Enlaces internos de la app se remapearon: tras la exportación, el único destino Greenatics externo a la landing es `/contacto/`; los restantes son anchors o fuentes oficiales externas.
- No se ejecutaron build, pruebas ni QA de navegador. Revisar en preview escritorio/tablet/móvil y validar interacción del marco antes de cerrar el PR.
- El hilo propietario de Huella recibió solicitud de confirmar V67/CTA y revisar el diff. Mantener el PR en borrador hasta recibir ese handoff. Sin integración, publicación ni despliegue.
