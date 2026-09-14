import { downloadPublicWondergreenPdf, getPublicWondergreenPdf } from "@/lib/sharepoint/public-resource-download";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ resourceId: string }> },
) {
  const { resourceId } = await context.params;
  const approved = getPublicWondergreenPdf(resourceId);
  if (!approved) return new Response("Recurso no encontrado.", { status: 404 });

  try {
    const download = await downloadPublicWondergreenPdf(resourceId);
    if (!download) return new Response("Recurso no encontrado.", { status: 404 });

    const attachmentRequested = new URL(request.url).searchParams.get("download") === "1";
    const disposition = attachmentRequested ? "attachment" : "inline";
    const headers = new Headers({
      "content-type": "application/pdf",
      "content-disposition": `${disposition}; filename="${download.asset.filename}"`,
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    });
    if (download.contentLength) headers.set("content-length", download.contentLength);
    if (download.etag) headers.set("etag", download.etag);

    return new Response(download.body, { status: 200, headers });
  } catch {
    return new Response("El documento no está disponible temporalmente.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
