import { wondergreenReferences, type WondergreenReference } from "./wondergreen-public";

export type WondergreenProductLine = Readonly<{
  slug: "2grow" | "2balance" | "2bloom" | "2fruit";
  family: "2Grow" | "2Balance" | "2Bloom" | "2Fruit";
  label: string;
}>;

export const wondergreenProductLines: readonly WondergreenProductLine[] = [
  { slug: "2grow", family: "2Grow", label: "Línea 2Grow" },
  { slug: "2balance", family: "2Balance", label: "Línea 2Balance" },
  { slug: "2bloom", family: "2Bloom", label: "Línea 2Bloom" },
  { slug: "2fruit", family: "2Fruit", label: "Línea 2Fruit" },
] as const;

export function getWondergreenProductLine(slug: string): WondergreenProductLine | null {
  return wondergreenProductLines.find((line) => line.slug === slug) ?? null;
}

export function getWondergreenLineReferences(line: Pick<WondergreenProductLine, "family">): WondergreenReference[] {
  return wondergreenReferences.filter((reference) => reference.family === line.family);
}

export function getWondergreenLineCommercialReferences(line: Pick<WondergreenProductLine, "family">): WondergreenReference[] {
  return getWondergreenLineReferences(line).filter((reference) => reference.truthStatus === "commercial-reconciled");
}

export function getWondergreenLineTechnicalReferences(line: Pick<WondergreenProductLine, "family">): WondergreenReference[] {
  return getWondergreenLineReferences(line).filter((reference) => reference.truthStatus !== "commercial-reconciled");
}
