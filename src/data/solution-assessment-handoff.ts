import {
  buildToolContactHref,
  consumeToolContactDraft,
  storeToolContactDraft,
  TOOL_CONTACT_DRAFT_KEY,
} from "./tool-contact-handoff";

export const SOLUTION_ASSESSMENT_DRAFT_KEY = TOOL_CONTACT_DRAFT_KEY;

export interface AssessmentDraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type SolutionAssessmentProfile = "municipio" | "empresa" | "territorio" | "agroindustria";

export function buildSolutionAssessmentContactHref(
  title: string,
  nextStep: string,
  profile: SolutionAssessmentProfile,
): string {
  return buildToolContactHref("solucion", profile, title, nextStep);
}

export function storeSolutionAssessmentDraft(details: string, storage?: AssessmentDraftStorage): boolean {
  return storeToolContactDraft(details, storage);
}

export function consumeSolutionAssessmentDraft(storage?: AssessmentDraftStorage): string | null {
  return consumeToolContactDraft(storage);
}
