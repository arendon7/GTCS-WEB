import { createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { validatePublicLeadSubmission } from "@/lib/public-leads";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 16 * 1024;

function noStoreJson(body: unknown, status: number) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function requestFingerprint(request: NextRequest) {
  const secret = process.env.PUBLIC_LEAD_RATE_LIMIT_SECRET || process.env.SUPABASE_SECRET_KEY;
  if (!secret) return null;
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    || request.headers.get("x-forwarded-for")
    || request.headers.get("x-real-ip")
    || "unknown";
  const clientAddress = forwarded.split(",")[0]?.trim().slice(0, 128) || "unknown";
  return createHmac("sha256", secret).update(clientAddress).digest("hex");
}

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return noStoreJson({ ok: false, code: "service_unavailable" }, 503);
  }

  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return noStoreJson({ ok: false, code: "payload_too_large" }, 413);
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return noStoreJson({ ok: false, code: "invalid_payload" }, 400);
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return noStoreJson({ ok: false, code: "payload_too_large" }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return noStoreJson({ ok: false, code: "invalid_payload" }, 400);
  }

  const validation = validatePublicLeadSubmission(payload);
  if (!validation.ok) {
    return noStoreJson({ ok: false, code: validation.code }, 400);
  }

  // Honeypot: present a normal success shape to automated submissions without storing PII.
  if (validation.value.website) {
    return noStoreJson({ ok: true }, 201);
  }

  const fingerprint = requestFingerprint(request);
  if (!fingerprint) {
    return noStoreJson({ ok: false, code: "service_unavailable" }, 503);
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("submit_public_lead_service", {
    p_request_id: validation.value.requestId,
    p_request_fingerprint: fingerprint,
    p_name: validation.value.name,
    p_email: validation.value.email ?? null,
    p_phone: validation.value.phone ?? null,
    p_organization: validation.value.organization ?? null,
    p_role_title: validation.value.roleTitle ?? null,
    p_audience: validation.value.audience,
    p_need: validation.value.need,
    p_location: validation.value.location ?? null,
    p_service: validation.value.service ?? null,
    p_product: validation.value.product ?? null,
    p_crop: validation.value.crop ?? null,
    p_context: validation.value.context ?? null,
    p_details: validation.value.details ?? null,
  });

  if (error) {
    if (error.message.includes("PUBLIC_LEAD_RATE_LIMIT")) {
      return noStoreJson({ ok: false, code: "rate_limited" }, 429);
    }
    return noStoreJson({ ok: false, code: "submission_failed" }, 500);
  }

  return noStoreJson({ ok: true }, 201);
}
