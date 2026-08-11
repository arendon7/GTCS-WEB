# ADR-0003 · Project Memory + Obsidian + grafo

**Estado:** ACEPTADO

`knowledge/memory.jsonl` es append-only y canónico. Tipos iniciales: DECISION, CONVENTION, LESSON, ANTI_PATTERN e INCIDENT_RESOLUTION. Las entradas nuevas pueden `supersede` anteriores sin borrar historia.

`knowledge/obsidian-vault/` es la capa humana navegable. `knowledge/graph/` contiene nodos y relaciones derivadas para recuperación contextual. El grafo es advisory: no convierte una fuente histórica en verdad vigente por sí mismo.

Precedencia: decisión canónica activa → requisito validado → documento técnico vigente → fuente histórica → borrador/reference → legacy/rejected.
