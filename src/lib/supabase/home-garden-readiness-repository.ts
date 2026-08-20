import type { SupabaseClient } from "@supabase/supabase-js";
import type { HomeGardenEvidenceKind } from "@/data/home-garden-evidence";
import type {
  HomeGardenEvidenceDisposition,
  HomeGardenLaunchEvidenceRevision,
} from "@/lib/home-garden-readiness-registry";
import { createClient } from "@/lib/supabase/client";

const evidenceKinds = new Set<HomeGardenEvidenceKind>([
  "product-truth",
  "laboratory-report",
  "regulatory-registration",
  "approved-label",
  "sku-master",
  "dose-validation",
  "cost-model",
  "fulfillment-record",
  "public-asset",
]);
const dispositions = new Set<HomeGardenEvidenceDisposition>(["draft", "verified", "rejected", "superseded"]);

type EvidenceRow = {
  id: string;
  revision_no: number | string;
  candidate_id: string;
  evidence_kind: string;
  disposition: string;
  title: string;
  source_reference: string;
  source_date?: string | null;
  same_reference: boolean;
  same_presentation: boolean;
  complete_for_gate: boolean;
  note: string;
  effective_at: string;
  created_at: string;
  created_by: string;
};

export type AppendHomeGardenEvidencePayload = {
  candidateId: string;
  evidenceKind: HomeGardenEvidenceKind;
  disposition: HomeGardenEvidenceDisposition;
  title: string;
  sourceReference: string;
  sourceDate?: string;
  sameReference: boolean;
  samePresentation: boolean;
  completeForGate: boolean;
  note: string;
};

function errorMessage(scope: string, error: { message?: string } | null) {
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function parseEvidenceRow(row: EvidenceRow): HomeGardenLaunchEvidenceRevision {
  const revisionNo = Number(row.revision_no);
  if (!Number.isSafeInteger(revisionNo) || revisionNo <= 0) throw new Error(`Revisión inválida para ${row.id}.`);
  if (!evidenceKinds.has(row.evidence_kind as HomeGardenEvidenceKind)) throw new Error(`Tipo de evidencia desconocido: ${row.evidence_kind}.`);
  if (!dispositions.has(row.disposition as HomeGardenEvidenceDisposition)) throw new Error(`Estado de evidencia desconocido: ${row.disposition}.`);
  return {
    id: row.id,
    revisionNo,
    candidateId: row.candidate_id,
    evidenceKind: row.evidence_kind as HomeGardenEvidenceKind,
    disposition: row.disposition as HomeGardenEvidenceDisposition,
    title: row.title,
    sourceReference: row.source_reference,
    sourceDate: row.source_date || undefined,
    sameReference: row.same_reference,
    samePresentation: row.same_presentation,
    completeForGate: row.complete_for_gate,
    note: row.note,
    effectiveAt: row.effective_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export async function loadHomeGardenLaunchEvidence(
  client: SupabaseClient = createClient(),
): Promise<HomeGardenLaunchEvidenceRevision[]> {
  const { data, error } = await client
    .from("home_garden_launch_evidence_revisions")
    .select("id,revision_no,candidate_id,evidence_kind,disposition,title,source_reference,source_date,same_reference,same_presentation,complete_for_gate,note,effective_at,created_at,created_by")
    .order("revision_no", { ascending: true });
  if (error) throw new Error(errorMessage("No fue posible cargar evidencia de lanzamiento", error));
  return ((data ?? []) as unknown as EvidenceRow[]).map(parseEvidenceRow);
}

export async function appendHomeGardenLaunchEvidence(
  payload: AppendHomeGardenEvidencePayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("admin_append_home_garden_launch_evidence", {
    target_candidate_id: payload.candidateId,
    target_evidence_kind: payload.evidenceKind,
    target_disposition: payload.disposition,
    evidence_title: payload.title,
    evidence_source_reference: payload.sourceReference,
    evidence_source_date: payload.sourceDate || null,
    evidence_same_reference: payload.sameReference,
    evidence_same_presentation: payload.samePresentation,
    evidence_complete_for_gate: payload.completeForGate,
    evidence_note: payload.note,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar evidencia de lanzamiento", error));
  if (typeof data !== "string" || !data) throw new Error("La evidencia fue registrada pero el servidor no devolvió un identificador válido.");
  return data;
}
