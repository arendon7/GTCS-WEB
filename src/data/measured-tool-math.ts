export function readingRatio(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || numerator < 0 || denominator <= 0 || !Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

export function formatReading(value: number | null, digits = 1): string {
  return value === null || !Number.isFinite(value) ? "Por calcular" : value.toLocaleString("es-CO", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
