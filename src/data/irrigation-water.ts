export function parseWaterNumber(value: string): number | null {
  const text = value.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) return null;
  const number = Number(text.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

export function calculateSodiumAdsorptionRatio(sodium: number | null, calcium: number | null, magnesium: number | null): number | null {
  if (sodium === null || calcium === null || magnesium === null) return null;
  if ([sodium, calcium, magnesium].some((value) => !Number.isFinite(value) || value < 0)) return null;
  // Halving each ion before adding avoids an overflowing intermediate sum.
  const denominator = Math.sqrt(calcium / 2 + magnesium / 2);
  if (denominator === 0) return null;
  const ratio = sodium / denominator;
  return Number.isFinite(ratio) ? ratio : null;
}
