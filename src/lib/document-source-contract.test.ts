import { describe, expect, it } from "vitest";
import {
  documentReferenceKey,
  parseSharePointSourceConfig,
  validateSharePointDocumentReference,
} from "@/lib/document-source-contract";

describe("SharePoint document source contract", () => {
  it("normalizes a complete private source configuration", () => {
    const result = parseSharePointSourceConfig({
      SHAREPOINT_SITE_HOSTNAME: " Tenant.SharePoint.com ",
      SHAREPOINT_SITE_PATH: "sites/Operations/",
      SHAREPOINT_DRIVE_ID: "b!Drive_123",
      SHAREPOINT_DOCUMENT_ROOT: "Company / Operations / Evidence",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        provider: "sharepoint",
        hostname: "tenant.sharepoint.com",
        sitePath: "/sites/Operations",
        driveId: "b!Drive_123",
        documentRoot: "Company/Operations/Evidence",
      },
    });
  });

  it("fails explicitly when configuration is incomplete or unsafe", () => {
    expect(parseSharePointSourceConfig({}).ok).toBe(false);
    expect(parseSharePointSourceConfig({
      SHAREPOINT_SITE_HOSTNAME: "https://tenant.sharepoint.com/sites/Operations",
      SHAREPOINT_SITE_PATH: "/sites/Operations",
      SHAREPOINT_DRIVE_ID: "b!Drive_123",
      SHAREPOINT_DOCUMENT_ROOT: "Company/Operations",
    }).ok).toBe(false);
    expect(parseSharePointSourceConfig({
      SHAREPOINT_SITE_HOSTNAME: "tenant.sharepoint.com",
      SHAREPOINT_SITE_PATH: "/sites/Operations",
      SHAREPOINT_DRIVE_ID: "b!Drive_123",
      SHAREPOINT_DOCUMENT_ROOT: "Company/../Secrets",
    }).ok).toBe(false);
  });

  it("validates SharePoint references and creates a stable provider/drive/item key", () => {
    const result = validateSharePointDocumentReference({
      provider: "sharepoint",
      driveId: "b!Drive_123",
      itemId: "01ITEM_ABC",
      title: "Daily operations evidence.pdf",
      webUrl: "https://tenant.sharepoint.com/sites/Operations/Shared%20Documents/evidence.pdf?web=1",
      mimeType: "application/pdf",
      modifiedAt: "2026-08-12T10:15:00-05:00",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(documentReferenceKey(result.value)).toBe("sharepoint:b!Drive_123:01ITEM_ABC");
    expect(result.value.modifiedAt).toBe("2026-08-12T15:15:00.000Z");
  });

  it("rejects insecure, non-SharePoint or malformed document references", () => {
    for (const webUrl of [
      "http://tenant.sharepoint.com/file.pdf",
      "https://example.com/file.pdf",
      "not-a-url",
    ]) {
      expect(validateSharePointDocumentReference({
        provider: "sharepoint",
        driveId: "b!Drive_123",
        itemId: "01ITEM_ABC",
        title: "Evidence",
        webUrl,
      }).ok).toBe(false);
    }

    expect(() => documentReferenceKey({ provider: "sharepoint", driveId: "bad:id", itemId: "01ITEM_ABC" })).toThrow();
  });
});
