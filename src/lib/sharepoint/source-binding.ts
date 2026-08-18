import type { SharePointDocumentReference, SharePointSourceConfig } from "@/lib/document-source-contract";
import type { SharePointDirectoryListing } from "./graph-readonly";

function decodedPathSegments(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment).toLowerCase();
      } catch {
        throw new Error("SharePoint devolvió una URL documental con ruta inválida.");
      }
    });
}

export function assertSharePointDocumentSource(
  reference: SharePointDocumentReference,
  source: SharePointSourceConfig,
) {
  if (reference.provider !== "sharepoint" || reference.driveId !== source.driveId) {
    throw new Error("SharePoint devolvió una referencia fuera del drive documental autorizado.");
  }

  let url: URL;
  try {
    url = new URL(reference.webUrl);
  } catch {
    throw new Error("SharePoint devolvió una URL documental inválida.");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hostname.toLowerCase() !== source.hostname.toLowerCase()
  ) {
    throw new Error("SharePoint devolvió una referencia fuera del sitio documental autorizado.");
  }

  const actualSegments = decodedPathSegments(url.pathname);
  const expectedSegments = decodedPathSegments(source.sitePath);
  const insideConfiguredSite =
    actualSegments.length >= expectedSegments.length &&
    expectedSegments.every((segment, index) => actualSegments[index] === segment);

  if (!insideConfiguredSite) {
    throw new Error("SharePoint devolvió una referencia fuera del sitio documental autorizado.");
  }

  return reference;
}

export function assertSharePointDirectorySource(
  listing: SharePointDirectoryListing,
  source: SharePointSourceConfig,
) {
  for (const document of listing.documents) assertSharePointDocumentSource(document, source);
  return listing;
}
