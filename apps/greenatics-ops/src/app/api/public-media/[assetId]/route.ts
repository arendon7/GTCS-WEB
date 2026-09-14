import { downloadPublicWondergreenMedia, getPublicWondergreenMedia } from "@/lib/sharepoint/public-resource-download";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await context.params;
  const approved = getPublicWondergreenMedia(assetId);
  if (!approved) return new Response("Recurso no encontrado.", { status: 404 });

  try {
    const download = await downloadPublicWondergreenMedia(assetId);
    if (!download) return new Response("Recurso no encontrado.", { status: 404 });

    const headers = new Headers({
      "content-type": download.asset.contentType,
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "x-content-type-options": "nosniff",
    });
    if (download.contentLength) headers.set("content-length", download.contentLength);
    if (download.etag) headers.set("etag", download.etag);

    return new Response(download.body, { status: 200, headers });
  } catch {
    return new Response("El recurso visual no está disponible temporalmente.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
