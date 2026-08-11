# AGENTS · GREENATICS OPS

## Orden de autoridad
1. PRODUCT.md
2. decisiones activas en `knowledge/memory.jsonl`
3. DESIGN.md
4. arquitectura y ADR vigentes
5. Matriz Maestra de requisitos
6. skills externos
7. preferencias generales del agente

Si un skill externo contradice una decisión canónica del producto, gana la decisión canónica.

## Stack
- Binario IA/App Factory: arquitectura, gates, versiones, memoria, componentes y delivery.
- Impeccable: shape, critique, audit, harden y polish.
- Taste Skill: lenguaje visual, layout, tipografía, densidad y anti-slop.
- Emil Kowalski: microinteracciones, motion y feedback.
- Vercel React Best Practices: rendimiento React/Next.
- Vercel Web Design Guidelines: accesibilidad, forms, focus, responsive y UX.

## Gate de una pantalla
1. requisito funcional;
2. flujo operario;
3. estados vacío/cargando/error;
4. responsive;
5. teclado/foco;
6. Impeccable critique/audit;
7. Taste pre-flight;
8. performance React/Next;
9. QA visual;
10. unit tests cuando exista lógica derivada;
11. Playwright desktop + móvil para flujos críticos;
12. evidencia en PR.

## Definición de CI verde
Un PR funcional no se considera verde únicamente porque compile. El workflow debe completar:
- archivos canónicos + memoria JSONL;
- typecheck;
- lint;
- unit tests;
- build de producción;
- browser E2E en Chromium desktop y móvil.

Cualquier excepción debe quedar explícitamente justificada en el PR; nunca se elimina un gate solo para obtener PASS.

## Nunca
- desarrollar features directamente en `main` o `develop`;
- borrar una buena versión para reemplazarla;
- marcar gates como PASS sin evidencia;
- guardar secretos;
- dejar decisiones importantes solo en chat;
- permitir que agentes reescriban la memoria canónica.
