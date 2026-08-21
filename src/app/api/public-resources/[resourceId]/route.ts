import { getPublicWondergreenPdf } from "@/lib/sharepoint/public-resource-download";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ resourceId: string }> },
) {
  const { resourceId } = await context.params;
  const approved = getPublicWondergreenPdf(resourceId);
  if (!approved) return new Response("Recurso no encontrado.", { status: 404 });

  return new Response(null, {
    status: 307,
    headers: {
      location: approved.downloadUrl,
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
