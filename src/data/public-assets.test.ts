import { describe, expect, it } from "vitest";
import { wondergreenReferences } from "@/data/wondergreen-public";
import { brandAssets, getPublicProductAsset, productAssetPolicies } from "./public-assets";

describe("public asset governance", () => {
  it("keeps only authoritative current brand assets approved for public use", () => {
    expect(brandAssets).toHaveLength(3);
    expect(brandAssets.every((asset) => asset.status === "APPROVED_PUBLIC")).toBe(true);
    expect(brandAssets.map((asset) => asset.path)).toEqual([
      "/brand/greenatics-horizontal.webp",
      "/brand/greenatics-symbol.svg",
      "/brand/wondergreen-nutrients.webp",
    ]);
  });

  it("has exactly one product asset policy for every current Wondergreen reference", () => {
    expect(productAssetPolicies).toHaveLength(wondergreenReferences.length);
    expect(new Set(productAssetPolicies.map((policy) => policy.referenceSlug)).size).toBe(wondergreenReferences.length);
    expect(productAssetPolicies.map((policy) => policy.referenceSlug).sort()).toEqual(wondergreenReferences.map((reference) => reference.slug).sort());
    expect(productAssetPolicies.some((policy) => policy.referenceSlug === "micorrizas")).toBe(true);
  });

  it("fails closed until an exact packshot is explicitly approved", () => {
    for (const reference of wondergreenReferences) expect(getPublicProductAsset(reference.slug)).toBeNull();
    expect(productAssetPolicies.every((policy) => policy.status === "PENDING_PRODUCT_TRUTH")).toBe(true);
    expect(productAssetPolicies.every((policy) => policy.publicPath === null)).toBe(true);
  });

  it("does not silently promote historical 2Grow candidate visuals", () => {
    const solid = productAssetPolicies.find((policy) => policy.referenceSlug === "2grow-solido-15-3-3");
    const liquid = productAssetPolicies.find((policy) => policy.referenceSlug === "2grow-liquido-100-20-20");

    expect(solid?.status).toBe("PENDING_PRODUCT_TRUTH");
    expect(liquid?.status).toBe("PENDING_PRODUCT_TRUTH");
    expect(solid?.publicPath).toBeNull();
    expect(liquid?.publicPath).toBeNull();
  });
});
