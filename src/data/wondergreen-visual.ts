import type { WondergreenReference } from "./wondergreen-public";

export type WondergreenVisualTone =
  | "compost"
  | "grow"
  | "balance"
  | "bloom"
  | "fruit"
  | "bioinput"
  | "botanical";

/**
 * V9 visual routing only.
 *
 * Product Truth remains in wondergreen-public.ts. This mapping translates the
 * V9 line-color system into UI tones without changing formula, role, status,
 * presentation, price or agronomic claims.
 */
export function getWondergreenVisualTone(
  reference: Pick<WondergreenReference, "family" | "line" | "format">,
): WondergreenVisualTone {
  if (reference.family === "2Grow") return "grow";
  if (reference.family === "2Balance") return "balance";
  if (reference.family === "2Bloom") return "bloom";
  if (reference.family === "2Fruit") return "fruit";
  if (reference.format === "compost") return "compost";
  if (reference.format === "botanical") return "botanical";
  return "bioinput";
}
