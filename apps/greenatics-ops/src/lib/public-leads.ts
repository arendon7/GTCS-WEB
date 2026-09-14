export const publicLeadAudiences = ["esp", "municipio", "empresa", "ph", "planta", "wondergreen", "otro"] as const;
export const publicLeadNeeds = ["diagnostico", "planeacion", "regulacion", "rutas", "planta", "operacion", "datos", "valorizacion", "nutricion", "distribucion", "otro"] as const;

export type PublicLeadSubmission = {
  requestId: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  roleTitle?: string;
  audience: (typeof publicLeadAudiences)[number];
  need: (typeof publicLeadNeeds)[number];
  location?: string;
  service?: string;
  product?: string;
  crop?: string;
  context?: string;
  details?: string;
  consent: true;
  website?: string;
};

export type PublicLeadValidationCode =
  | "invalid_payload"
  | "invalid_request_id"
  | "name_required"
  | "invalid_email"
  | "invalid_phone"
  | "contact_required"
  | "invalid_audience"
  | "invalid_need"
  | "consent_required"
  | "field_too_long";

type ValidationResult =
  | { ok: true; value: PublicLeadSubmission }
  | { ok: false; code: PublicLeadValidationCode };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanOptional(value: unknown, max: number) {
  if (typeof value !== "string") return { value: undefined as string | undefined, tooLong: false };
  const cleaned = value.trim();
  if (!cleaned) return { value: undefined as string | undefined, tooLong: false };
  return { value: cleaned, tooLong: cleaned.length > max };
}

export function validatePublicLeadSubmission(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, code: "invalid_payload" };
  const raw = input as Record<string, unknown>;
  const requestId = typeof raw.requestId === "string" ? raw.requestId.trim() : "";
  if (!uuidPattern.test(requestId)) return { ok: false, code: "invalid_request_id" };

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name.length < 2) return { ok: false, code: "name_required" };
  if (name.length > 120) return { ok: false, code: "field_too_long" };

  const emailResult = cleanOptional(raw.email, 254);
  const phoneResult = cleanOptional(raw.phone, 40);
  if (emailResult.tooLong || phoneResult.tooLong) return { ok: false, code: "field_too_long" };
  if (emailResult.value && !emailPattern.test(emailResult.value)) return { ok: false, code: "invalid_email" };
  if (phoneResult.value && phoneResult.value.length < 7) return { ok: false, code: "invalid_phone" };
  if (!emailResult.value && !phoneResult.value) return { ok: false, code: "contact_required" };

  const audience = typeof raw.audience === "string" ? raw.audience : "";
  if (!publicLeadAudiences.includes(audience as PublicLeadSubmission["audience"])) return { ok: false, code: "invalid_audience" };
  const need = typeof raw.need === "string" ? raw.need : "";
  if (!publicLeadNeeds.includes(need as PublicLeadSubmission["need"])) return { ok: false, code: "invalid_need" };
  if (raw.consent !== true) return { ok: false, code: "consent_required" };

  const organization = cleanOptional(raw.organization, 180);
  const roleTitle = cleanOptional(raw.roleTitle, 120);
  const location = cleanOptional(raw.location, 180);
  const service = cleanOptional(raw.service, 180);
  const product = cleanOptional(raw.product, 180);
  const crop = cleanOptional(raw.crop, 120);
  const context = cleanOptional(raw.context, 480);
  const details = cleanOptional(raw.details, 1500);
  const website = cleanOptional(raw.website, 200);
  if ([organization, roleTitle, location, service, product, crop, context, details, website].some((item) => item.tooLong)) {
    return { ok: false, code: "field_too_long" };
  }

  return {
    ok: true,
    value: {
      requestId,
      name,
      email: emailResult.value?.toLowerCase(),
      phone: phoneResult.value,
      organization: organization.value,
      roleTitle: roleTitle.value,
      audience: audience as PublicLeadSubmission["audience"],
      need: need as PublicLeadSubmission["need"],
      location: location.value,
      service: service.value,
      product: product.value,
      crop: crop.value,
      context: context.value,
      details: details.value,
      consent: true,
      website: website.value,
    },
  };
}

export function publicLeadValidationMessage(code: PublicLeadValidationCode) {
  if (code === "name_required") return "Indica tu nombre para enviar la consulta.";
  if (code === "invalid_email") return "Revisa el correo electrónico.";
  if (code === "invalid_phone") return "Revisa el número de teléfono.";
  if (code === "contact_required") return "Indica un correo o teléfono para poder contactarte.";
  if (code === "invalid_audience") return "Selecciona desde qué contexto nos escribes.";
  if (code === "invalid_need") return "Selecciona qué necesitas resolver primero.";
  if (code === "consent_required") return "Necesitamos tu autorización para gestionar esta consulta.";
  if (code === "field_too_long") return "Uno de los campos supera la longitud permitida. Resume el contenido e inténtalo de nuevo.";
  return "Revisa la información e inténtalo de nuevo.";
}
