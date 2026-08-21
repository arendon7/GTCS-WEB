import { getPublicWondergreenPdf } from "@/lib/sharepoint/public-resource-registry";
import { getSharePointPublicDownloadClient } from "@/lib/sharepoint/public-download";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function contentDisposition(fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `inline; filename="${safeName}"`;
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const document = getPublicWondergreenPdf(slug);
  if (!document) return new Response("Recurso no encontrado.", { status: 404 });

  try {
    const upstream = await getSharePointPublicDownloadClient().fetchPdf(document.itemId);
    const headers = new Headers({
      "content-type": "application/pdf",
      "content-disposition": contentDisposition(document.fileName),
      "cache-control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      "x-content-type-options": "nosniff",
    });
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("content-length", contentLength);
    const etag = upstream.headers.get("etag");
    if (etag) headers.set("etag", etag);
    const lastModified = upstream.headers.get("last-modified");
    if (lastModified) headers.set("last-modified", lastModified);

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    console.error("Public Wondergreen PDF delivery failed", { slug, error });
    return new Response("El documento no está disponible temporalmente.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
