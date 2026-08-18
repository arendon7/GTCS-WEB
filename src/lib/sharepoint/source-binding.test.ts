import { describe, expect, it } from "vitest";
import type { SharePointDocumentReference, SharePointSourceConfig } from "@/lib/document-source-contract";
import { assertSharePointDirectorySource, assertSharePointDocumentSource } from "./source-binding";

const source: SharePointSourceConfig = {
  provider: "sharepoint",
  hostname: "contoso.sharepoint.com",
  sitePath: "/sites/Sanitized",
  driveId: "b!sanitizedDrive_123",
  documentRoot: "Shared Documents/Operations",
};

function document(overrides: Partial<SharePointDocumentReference> = {}): SharePointDocumentReference {
  return {
    provider: "sharepoint",
    driveId: source.driveId,
    itemId: "01SANITIZEDFILE123",
    title: "Control.xlsx",
    webUrl: "https://contoso.sharepoint.com/sites/Sanitized/Shared%20Documents/Operations/Control.xlsx",
    ...overrides,
  };
}

describe("SharePoint configured-source boundary", () => {
  it("accepts a document only when drive, hostname and site path match the configured source", () => {
    expect(assertSharePointDocumentSource(document(), source)).toEqual(document());
    expect(assertSharePointDocumentSource(document({ webUrl: "https://CONTOSO.sharepoint.com/sites/SANITIZED/Shared%20Documents/Operations/Control.xlsx" }), source)).toBeTruthy();
  });

  it("rejects another drive even when the URL is inside the configured site", () => {
    expect(() => assertSharePointDocumentSource(document({ driveId: "b!otherDrive_456" }), source))
      .toThrow(/drive documental autorizado/);
  });

  it("rejects another SharePoint tenant instead of trusting any *.sharepoint.com URL", () => {
    expect(() => assertSharePointDocumentSource(document({ webUrl: "https://other.sharepoint.com/sites/Sanitized/Shared%20Documents/Operations/Control.xlsx" }), source))
      .toThrow(/sitio documental autorizado/);
  });

  it("rejects another site and site-prefix tricks on the configured hostname", () => {
    expect(() => assertSharePointDocumentSource(document({ webUrl: "https://contoso.sharepoint.com/sites/Finance/Shared%20Documents/Control.xlsx" }), source))
      .toThrow(/sitio documental autorizado/);
    expect(() => assertSharePointDocumentSource(document({ webUrl: "https://contoso.sharepoint.com/sites/Sanitized-Evil/Shared%20Documents/Control.xlsx" }), source))
      .toThrow(/sitio documental autorizado/);
  });

  it("fails the whole directory closed when any returned document crosses the source boundary", () => {
    const listing = {
      relativeFolder: "",
      folders: [],
      documents: [
        document(),
        document({ itemId: "01SANITIZEDFILE999", webUrl: "https://contoso.sharepoint.com/sites/Other/Shared%20Documents/Other.pdf" }),
      ],
    };
    expect(() => assertSharePointDirectorySource(listing, source)).toThrow(/sitio documental autorizado/);
  });
});
