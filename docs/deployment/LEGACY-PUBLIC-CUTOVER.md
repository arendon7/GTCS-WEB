# GREENATICS · Legacy Public Cutover

## Objetivo
Migrar la autoridad pública desde el WordPress indexado en `greenatics.org` hacia la nueva plataforma gobernada de `GTCS-WEB` sin copiar automáticamente contenido, claims, slugs de plantilla ni contaminación SEO del sitio legado.

## Principio
La indexación histórica no convierte un contenido en verdad vigente.

Cada URL legado queda en una de tres categorías:

- `redirect`: intención útil y compatible con una superficie gobernada nueva;
- `quarantine`: contenido contaminado, inseguro o que no debe heredar autoridad mediante redirect;
- `manual-review`: contenido que requiere revisión jurídica/editorial antes de volver a publicarse.

El registro ejecutable vive en `src/data/legacy-public-migration.ts`.

## Redirects aprobados
| Legacy path | Destino | Motivo |
| --- | --- | --- |
| `/blog` | `/biblioteca` | Conserva la puerta de entrada al conocimiento sin clonar el archivo WordPress. |
| `/el-potencial-de-la-ruta-selectiva-de-recoleccion-de-residuos` | `/soluciones/rutas-selectivas` | Conserva intención sobre rutas selectivas en la ficha de servicio gobernada. |
| `/fertilizantes-que-nutren` | `/wondergreen` | Conserva intención sobre organominerales sin transportar claims históricos verbatim. |
| `/impacto-y-resultados` | `/impacto` | Sustituye cifras históricas por el contrato de impacto conciliado/aprobado. |
| `/winds-of-change-in-the-turbines-service-industries` | `/wondergreen` | El contenido indexado es agronómico/Wondergreen aunque el slug sea de una plantilla ajena. |
| `/from-niche-to-100-gw-mainstream-and-beyond-world` | `/biblioteca` | Conserva tráfico de conocimiento sin mantener el slug de plantilla. |

Next.js emite estos cambios como redirects permanentes. Se activan realmente cuando el dominio legado sea servido por el nuevo deployment o su capa de edge/proxy apunte a él.

## Cuarentena
`/cities-must-show-the-way-forward-on-renewable-energy` no se redirige. La versión indexada observada durante la auditoría contiene texto spam ajeno al contenido Greenatics. Debe retirarse/limpiarse en el WordPress legado y no heredar autoridad hacia una página nueva.

Una URL en cuarentena permanece en 404 en `GTCS-WEB` hasta una decisión explícita. No crear un redirect genérico al HOME.

## Revisión manual obligatoria
Por ahora no se redirigen automáticamente:

- `/terminos-y-condiciones`
- `/privacidad`
- `/politicas`

El nuevo sistema combina sitio público, agenda externa y GREENATICS OPS. Los textos legales deben corresponder a la operación y tratamiento de datos actuales; copiar textos históricos sin revisión generaría una representación jurídica potencialmente incorrecta.

Cuando cada texto sea aprobado:
1. crear su ruta pública gobernada;
2. agregar metadata/canonical;
3. añadirla a footer/sitemap si corresponde;
4. cambiar su disposición en el registro a `redirect`;
5. actualizar los tests de migración.

## Claims históricos
No migrar directamente cifras o superlativos del WordPress legado. En especial:
- capacidades estándar de planta;
- producción anual/diaria;
- biogás por día;
- equivalencias climáticas;
- "única solución" u otros superlativos;
- promesas agronómicas o de captura de carbono;
- afirmaciones de certificación/ensayos sin fuente vigente vinculada.

La ruta `/impacto` es la autoridad para cifras publicables y el Product Master/Truth de Wondergreen es la autoridad para claims de producto.

## Gate antes del corte de dominio
1. Preview `public-only` certificado para el SHA exacto.
2. Navegación pública y SEO base en PASS.
3. Redirects del registro ejecutable verificados en navegador.
4. Slug en cuarentena devuelve 404 en la nueva plataforma.
5. WordPress legado respaldado antes de modificarlo.
6. Contenido spam retirado del WordPress y cachés/CDN.
7. Sitemap legado retirado o reemplazado en el momento del corte.
8. `greenatics.org` redirige hacia `greenatics.com.co` conservando paths aprobados.
9. Search Console se actualiza solo después de confirmar 200/redirects/canonicals del dominio definitivo.
10. No cambiar DNS de producción como mecanismo de prueba.

## Después del corte
- observar 404 de tráfico legado y añadir redirects solo cuando exista un destino semánticamente correcto;
- no usar redirects masivos al HOME;
- revisar indexación de `greenatics.org` hasta que caiga el contenido viejo;
- mantener `greenatics.com.co` como canonical único en la nueva plataforma;
- retirar definitivamente la superficie WordPress cuando la transición esté estabilizada.
