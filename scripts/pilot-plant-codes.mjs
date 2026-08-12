export const DEFAULT_PILOT_PLANT_CODES = Object.freeze(["TAM", "YAR"]);

const PILOT_PLANT_ALIASES = new Map([
  ["tam", "TAM"],
  ["tamesis", "TAM"],
  ["yar", "YAR"],
  ["yarumal", "YAR"],
]);

function fold(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizePilotPlantCodes(input = DEFAULT_PILOT_PLANT_CODES) {
  const values = Array.isArray(input) ? input : String(input ?? "").split(",");
  const normalized = [];

  for (const rawValue of values) {
    const value = String(rawValue ?? "").trim();
    if (!value) continue;

    const alias = PILOT_PLANT_ALIASES.get(fold(value));
    const code = alias ?? value.toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(code)) {
      throw new Error(`Código de planta inválido: ${value}.`);
    }
    if (normalized.includes(code)) {
      throw new Error(`La planta ${code} no puede aparecer dos veces.`);
    }
    normalized.push(code);
  }

  if (!normalized.length) throw new Error("Selecciona al menos una planta.");
  if (normalized.length > 20) throw new Error("No se permiten más de 20 plantas.");
  return Object.freeze(normalized);
}
