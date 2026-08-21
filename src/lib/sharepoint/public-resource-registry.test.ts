import { describe, expect, it } from "vitest";
import { getPublicWondergreenPdf, publicWondergreenPdfs } from "./public-resource-registry";

describe("public Wondergreen PDF registry", () => {
  it("contains exactly the catalog and five crop guides", () => {
    expect(publicWondergreenPdfs).toHaveLength(6);
    expect(publicWondergreenPdfs.map((item) => item.slug)).toEqual([
      "catalogo-wondergreen",
      "guia-cafe",
      "guia-cacao",
      "guia-aguacate",
      "guia-citricos",
      "guia-pastos-praderas",
    ]);
  });

  it("keeps resource, item and slug identifiers unique", () => {
    for (const field of ["slug", "resourceId", "itemId"] as const) {
      const values = publicWondergreenPdfs.map((item) => item[field]);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("stores only identifiers and public filenames, never Graph or SharePoint URLs", () => {
    for (const item of publicWondergreenPdfs) {
      expect(item.fileName).toMatch(/\.pdf$/);
      expect(JSON.stringify(item)).not.toMatch(/https?:\/\/|sharepoint\.com|graph\.microsoft\.com/i);
    }
  });

  it("does not resolve an unknown public slug", () => {
    expect(getPublicWondergreenPdf("no-existe")).toBeUndefined();
  });
});
