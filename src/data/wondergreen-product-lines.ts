import { wondergreenReferences, type WondergreenReference } from "./wondergreen-public";

export type WondergreenProductLine = Readonly<{
  slug: "2grow" | "2balance" | "2bloom" | "2fruit";
  family: "2Grow" | "2Balance" | "2Bloom" | "2Fruit";
  number: string;
  headline: string;
  description: string;
}>;

export const wondergreenProductLines: readonly WondergreenProductLine[] = [
  {
    slug: "2grow",
    family: "2Grow",
    number: "01",
    headline: "Crecimiento vegetativo y recuperación dentro del sistema Wondergreen.",
    description: "La familia reúne referencias sólidas y líquidas asociadas a objetivos vegetativos. Cada formulación conserva su propio estado comercial, presentación, documentación y condiciones de uso.",
  },
  {
    slug: "2balance",
    family: "2Balance",
    number: "02",
    headline: "Balance y mantenimiento, referencia por referencia.",
    description: "La familia agrupa formulaciones sólidas y líquidas para programas de continuidad nutricional. La ficha individual gobierna fórmula, formato, presentaciones y condición comercial.",
  },
  {
    slug: "2bloom",
    family: "2Bloom",
    number: "03",
    headline: "Referencias para programas asociados a transición reproductiva y floración.",
    description: "La familia organiza productos vinculados a esa etapa sin convertir el nombre de la línea en una promesa de floración. El contexto agronómico y la documentación vigente gobiernan la aplicación.",
  },
  {
    slug: "2fruit",
    family: "2Fruit",
    number: "04",
    headline: "Referencias para programas de producción, desarrollo y llenado.",
    description: "La familia reúne formulaciones asociadas a etapas productivas sin prometer rendimiento o calibre. La selección final depende de cultivo, etapa, suelo, agua y manejo.",
  },
] as const;

export function getWondergreenProductLine(slug: string) {
  return wondergreenProductLines.find((line) => line.slug === slug);
}

export function getWondergreenProductLineByFamily(family: string) {
  return wondergreenProductLines.find((line) => line.family === family);
}

export function getWondergreenLineReferences(line: Pick<WondergreenProductLine, "family">): WondergreenReference[] {
  return wondergreenReferences.filter((reference) => reference.family === line.family);
}

export function getCommercialWondergreenLineReferences(line: Pick<WondergreenProductLine, "family">): WondergreenReference[] {
  return getWondergreenLineReferences(line).filter((reference) => reference.truthStatus === "commercial-reconciled");
}
