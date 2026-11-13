import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { editorialPosts, getPublishedEditorialPosts } from "../src/data/editorial-blog";
import { editorialDrafts } from "../src/data/editorial-blog-drafts";

const builtHtml = (route: string) => path.join(process.cwd(), "out", route.replace(/^\/+|\/+$/g, ""), "index.html");

function publicTextFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return publicTextFiles(file);
    return /\.(?:html?|js|json|txt|xml|css|webmanifest)$/i.test(entry.name) ? [file] : [];
  });
}

test("Biblioteca solo enlaza artículos publicados y cada lectura tiene una ruta estática", () => {
  const published = getPublishedEditorialPosts();
  expect(new Set(published.map(({ slug }) => slug)).size).toBe(published.length);
  expect(published.every(({ status }) => status === "published")).toBe(true);
  expect(editorialPosts.every(({ status }) => status === "published")).toBe(true);
  expect(editorialDrafts.map(({ slug }) => slug)).toEqual([
    "del-biogas-potencial-al-biogas-aprovechable",
  ]);

  const indexPath = builtHtml("biblioteca/ideas");
  expect(fs.existsSync(indexPath)).toBe(true);
  const indexHtml = fs.readFileSync(indexPath, "utf8");
  const libraryHtml = fs.readFileSync(builtHtml("biblioteca"), "utf8");
  expect(libraryHtml).toContain('href="/biblioteca/ideas/"');
  const siteSource = fs.readFileSync(path.join(process.cwd(), "src/data/site.ts"), "utf8");
  expect(siteSource).toContain('href: "/biblioteca/ideas/", label: "Ideas y análisis"');
  for (const post of published) {
    const route = `/biblioteca/ideas/${post.slug}/`;
    expect(indexHtml).toContain(`href="${route}"`);
    expect(fs.existsSync(builtHtml(route))).toBe(true);
  }
  for (const draft of editorialDrafts) {
    expect(indexHtml).not.toContain(draft.slug);
    expect(indexHtml).not.toContain(draft.title);
    expect(fs.existsSync(builtHtml(`biblioteca/ideas/${draft.slug}`))).toBe(false);
    for (const file of publicTextFiles(path.join(process.cwd(), "out"))) {
      const content = fs.readFileSync(file, "utf8");
      expect(content, `draft slug must not leak into ${path.relative(process.cwd(), file)}`).not.toContain(draft.slug);
      expect(content, `draft title must not leak into ${path.relative(process.cwd(), file)}`).not.toContain(draft.title);
    }
  }

  const routeSource = fs.readFileSync(path.join(process.cwd(), "src/app/biblioteca/ideas/[slug]/page.tsx"), "utf8");
  expect(routeSource).toContain("export const dynamicParams = false");
  expect(routeSource).toContain("getPublishedEditorialPosts().map(({ slug }) => ({ slug }))");
  expect(routeSource).toContain("if (!post) notFound()");
});

test("el artículo de biogás identifica fuentes y limita su alcance a evaluación inicial", () => {
  const post = editorialPosts.find(({ slug }) => slug === "antes-de-invertir-en-biogas");
  expect(post).toBeDefined();
  expect(post?.sources.map(({ href }) => href)).toEqual(expect.arrayContaining([
    "https://www.epa.gov/agstar/agstar-project-development-handbook",
    "https://www.epa.gov/agstar/project-planning-and-financing",
    "https://www.epa.gov/agstar/anaerobic-system-design-and-technology",
  ]));
  expect(post?.blocks.some((block) => block.type === "callout")).toBe(true);
  expect(post?.blocks.some((block) => block.type === "studyComparison")).toBe(false);

  const articlePath = builtHtml("biblioteca/ideas/antes-de-invertir-en-biogas");
  expect(fs.existsSync(articlePath)).toBe(true);
  const articleHtml = fs.readFileSync(articlePath, "utf8");
  expect(articleHtml).toContain("las reglas y autorizaciones deben verificarse para cada proyecto en Colombia");
  expect(articleHtml).toContain('href="/agroindustria/"');
  expect(articleHtml).not.toContain("t CO₂e");
  expect(articleHtml).not.toContain("garantiza la producción");
});

test("el artículo de digestato versiona los dos estudios sin atribuirlos a 2GROW", () => {
  const post = editorialPosts.find(({ slug }) => slug === "digestato-nitrogeno-eficiencia-volatilizacion");
  expect(post).toBeDefined();
  expect(post?.sources.map(({ href }) => href)).toEqual(expect.arrayContaining([
    "https://link.springer.com/article/10.1007/s11119-025-10275-9",
    "https://acsess.onlinelibrary.wiley.com/doi/full/10.1002/agj2.70050",
  ]));
  const study = post?.blocks.find((block) => block.type === "studyComparison");
  expect(study?.panels).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "metricBars", scaleMax: 70, metrics: expect.arrayContaining([
      expect.objectContaining({ label: "Fertilizante mineral", value: 69, displayValue: "69%" }),
      expect.objectContaining({ label: "Digestato líquido · tasa variable", value: 49, displayValue: "49%" }),
    ]) }),
    expect.objectContaining({ kind: "highlight", value: "+58%", boundary: expect.stringContaining("no corresponde a 2GROW") }),
  ]));
  expect(post?.blocks.at(-1)).toMatchObject({ type: "callout" });

  const articlePath = builtHtml("biblioteca/ideas/digestato-nitrogeno-eficiencia-volatilizacion");
  expect(fs.existsSync(articlePath)).toBe(true);
  const articleHtml = fs.readFileSync(articlePath, "utf8");
  expect(articleHtml).toContain("Piccoli et al. evaluaron trigo de invierno");
  expect(articleHtml).toContain("Sigdel et al. compararon inyección y aplicación superficial");
  expect(articleHtml).toContain("Resultado externo; no corresponde a 2GROW.");
});

test("el borrador de medición diferencia potencial, producción y uso del biogás", () => {
  const draft = editorialDrafts.find(({ slug }) => slug === "del-biogas-potencial-al-biogas-aprovechable");
  expect(draft).toMatchObject({ status: "draft", relatedHref: "/agroindustria/" });
  expect(draft?.publishedAt).toBeUndefined();
  expect(draft?.sources.map(({ href }) => href)).toEqual(expect.arrayContaining([
    "https://www.epa.gov/agstar/agstar-project-development-handbook",
    "https://www.epa.gov/agstar/anaerobic-digesterbiogas-system-operator-guidebook",
    "https://www.epa.gov/agstar/anaerobic-system-design-and-technology",
    "https://www.epa.gov/agstar/how-does-anaerobic-digestion-work",
  ]));
  expect(draft?.blocks.some((block) => block.type === "paragraph" && block.text.includes("no equivale automáticamente a la producción"))).toBe(true);
  expect(draft?.blocks.some((block) => block.type === "callout")).toBe(true);
  expect(draft?.blocks.flatMap((block) => block.type === "paragraph" ? block.sourceRefs ?? [] : [])
    .every((sourceRef) => sourceRef > 0 && sourceRef <= (draft?.sources.length ?? 0))).toBe(true);
  expect(editorialPosts.some(({ slug }) => slug === draft?.slug)).toBe(false);
  expect(getPublishedEditorialPosts().some(({ slug }) => slug === draft?.slug)).toBe(false);
});
