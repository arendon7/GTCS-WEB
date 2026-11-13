import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { services } from "../src/data/services";
import { serviceVisuals } from "../src/data/service-visuals";

const root = process.cwd();

test("service detail heroes use the Next.js 16 preload API for their single above-fold visual", () => {
  const source = fs.readFileSync(path.join(root, "src/app/servicios/[slug]/page.tsx"), "utf8");

  expect(source).toMatch(/<Image src=\{visual\.src\} alt=\{visual\.alt\} fill preload sizes=/);
  expect(source).not.toMatch(/<Image\b[^>]*\bpriority(?:\s|=|\/|>)/);
});

test("all service hero visuals resolve to documented local assets outside the active holdback list", () => {
  const publicRoot = path.join(root, "public");
  const rights = JSON.parse(fs.readFileSync(path.join(root, "docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"), "utf8")) as {
    holdbacks: Array<{ asset: string }>;
  };
  const assetSources = fs.readFileSync(path.join(root, "docs/knowledge/VISUAL_ASSET_SOURCES.md"), "utf8");
  const publicNote = /escena editorial|imagen generada con IA|no documenta|registro de archivo|fotografía de archivo|cropper/i;
  const visuals = Object.values(serviceVisuals);

  expect(Object.keys(serviceVisuals).sort()).toEqual(services.map(({ slug }) => slug).sort());
  expect(new Set(visuals.map(({ src }) => src)).size).toBe(services.length);

  for (const [slug, visual] of Object.entries(serviceVisuals)) {
    expect(visual.src, `${slug} should use a root-relative local asset`).toMatch(/^\/[\w./-]+\.(?:jpe?g|png|webp|svg)$/i);
    const assetPath = path.resolve(publicRoot, visual.src.slice(1));
    expect(assetPath.startsWith(`${publicRoot}${path.sep}`), `${slug} asset must stay inside public/`).toBe(true);
    expect(fs.existsSync(assetPath), `${slug} asset ${visual.src} must exist`).toBe(true);
    expect(rights.holdbacks.some(({ asset }) => asset === visual.src), `${slug} asset must not be in the external-use holdback list`).toBe(false);
    expect(assetSources, `${slug} asset should have internal source documentation`).toContain(`public${visual.src}`);
    expect(visual.alt.trim().length, `${slug} needs useful alternative text`).toBeGreaterThan(30);
    expect(visual.caption.trim().length, `${slug} needs a client-facing caption`).toBeGreaterThan(40);
    expect(`${visual.alt} ${visual.caption}`, `${slug} must not expose production notes`).not.toMatch(publicNote);
  }

  expect(serviceVisuals["microrrutas-motocarguero"].alt).toMatch(/^Representación/);
  expect(serviceVisuals["plantas-modulares"].alt).toMatch(/^Propuesta/);
});
