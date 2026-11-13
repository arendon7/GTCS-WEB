export const TOOL_CONTACT_DRAFT_KEY = "greenatics:tool-contact-draft:v1";

const DRAFT_MAX_AGE_MS = 30 * 60 * 1000;

interface ToolContactDraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface StoredToolContactDraft {
  version: 1;
  details: string;
  createdAt: number;
}

let inMemoryDraft: StoredToolContactDraft | null = null;

function getSessionStorage(storage?: ToolContactDraftStorage): ToolContactDraftStorage | null {
  if (storage) return storage;
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function isCurrentDraft(value: unknown): value is StoredToolContactDraft {
  if (!value || typeof value !== "object" || !("version" in value) || !("details" in value) || !("createdAt" in value)) return false;
  const draft = value as StoredToolContactDraft;
  const age = Date.now() - draft.createdAt;
  return draft.version === 1
    && typeof draft.details === "string"
    && Boolean(draft.details.trim())
    && Number.isFinite(draft.createdAt)
    && age >= 0
    && age <= DRAFT_MAX_AGE_MS;
}

export function buildToolContactHref(interest: string, profile: string, title: string, priority?: string) {
  const params = new URLSearchParams({
    interes: interest,
    perfil: profile,
    diagnostico: title,
    transferencia: "sesion",
  });
  if (priority?.trim()) params.set("prioridad", priority.trim());
  return `/contacto/?${params.toString()}`;
}

export function storeToolContactDraft(details: string, storage?: ToolContactDraftStorage): boolean {
  const trimmedDetails = details.trim();
  if (!trimmedDetails) {
    inMemoryDraft = null;
    const target = getSessionStorage(storage);
    try {
      target?.removeItem(TOOL_CONTACT_DRAFT_KEY);
    } catch {
      // Do not leave an older draft available for the next contact visit.
    }
    return false;
  }

  const draft: StoredToolContactDraft = { version: 1, details: trimmedDetails, createdAt: Date.now() };
  inMemoryDraft = draft;
  const target = getSessionStorage(storage);
  if (!target) return true;

  try {
    target.setItem(TOOL_CONTACT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    return true;
  }

  return true;
}

export function consumeToolContactDraft(storage?: ToolContactDraftStorage): string | null {
  const target = getSessionStorage(storage);
  let stored: string | null = null;

  if (target) {
    try {
      stored = target.getItem(TOOL_CONTACT_DRAFT_KEY);
      target.removeItem(TOOL_CONTACT_DRAFT_KEY);
    } catch {
      stored = null;
    }
  }

  if (stored) {
    try {
      const draft: unknown = JSON.parse(stored);
      if (isCurrentDraft(draft)) {
        inMemoryDraft = null;
        return draft.details;
      }
    } catch {
      // Fall back to the current-tab copy if browser storage is unavailable or malformed.
    }
  }

  const fallback = inMemoryDraft;
  inMemoryDraft = null;
  return fallback && isCurrentDraft(fallback) ? fallback.details : null;
}
