import { getPublicWondergreenMedia } from "@/lib/sharepoint/public-resource-download";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await context.params;
  const approved = getPublicWondergreenMedia(assetId);
  if (!approved) return new Response("Recurso no encontrado.", { status: 404 });

  return new Response(null, {
    status: 307,
    headers: {
      location: approved.downloadUrl,
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "x-content-type-options": "nosniff",
    },
  });
}
