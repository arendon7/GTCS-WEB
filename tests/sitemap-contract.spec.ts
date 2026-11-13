import { expect, test } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import sitemap from "../src/app/sitemap";
import { metadata as glossaryMetadata } from "../src/app/biblioteca/glosario/page";
import { casaJardinKits, casaJardinProducts } from "../src/data/casa-jardin-detail";
import { services } from "../src/data/services";

const appDirectory = join(process.cwd(), "src/app");
const canonicalExceptions = new Set([
  "/red/app/",
  "/wondergreen/cotizador/",
  "/soluciones/vertimiento-cero/",
]);

function listStaticPageRoutes(directory = appDirectory): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("[")) return [];
      return listStaticPageRoutes(entryPath);
    }
    if (entry.name !== "page.tsx") return [];
    const route = relative(appDirectory, directory).split(sep).filter(Boolean).join("/");
    return [route ? `/${route}/` : "/"];
  });
}

test("sitemap URLs use the trailing-slash canonical routes", () => {
  const urls = sitemap().map(({ url }) => new URL(url));
  const paths = new Set(urls.map(({ pathname }) => pathname));
  expect(paths.size, "sitemap should not repeat canonical URLs").toBe(urls.length);

  expect(urls.map(({ href }) => href)).toContain("https://greenatics.com.co/soluciones/");
  expect(urls.map(({ href }) => href)).toContain("https://greenatics.com.co/");
  for (const url of urls) expect(url.pathname.endsWith("/")).toBe(true);
  for (const route of [
    "/municipios/",
    "/empresas/",
    "/agroindustria/",
    "/acceso/",
    "/faq/",
    "/diagnostico/",
    "/herramientas/",
    "/herramientas/estimador-organicos/",
    "/huella/",
    "/parque-ambiental/",
    "/tecnologia/",
    "/app/",
    "/agroway/app/",
    "/sana/app/",
    "/plataforma/usuarios/",
    "/servicios/",
    "/proyectos/yarumal/",
    "/proyectos/tamesis/",
    "/biblioteca/catalogo-wondergreen/",
  ]) expect(paths, `${route} should be discoverable`).toContain(route);
  for (const route of listStaticPageRoutes()) {
    if (canonicalExceptions.has(route)) continue;
    expect(paths, `static canonical route ${route} should be discoverable`).toContain(route);
  }
  for (const slug of [
    "analisis-agua",
    "analisis-suelo",
    "balance-bases",
    "balance-cn",
    "beneficio-cafe",
    "calculadora",
    "calendario-agricola",
    "calibracion-aspersores",
    "ciencia",
    "compatibilidad",
    "costo-unidad-nutriente",
    "cultivos",
    "encalamiento",
    "fitosanidad",
    "hogar",
    "logistica-flete",
    "quiz-deficiencias",
    "valorizacion-pecuaria",
  ]) expect(paths, `Wondergreen resource ${slug} should be discoverable`).toContain(`/wondergreen/${slug}/`);
  for (const { slug } of services) expect(paths, `service ${slug} should be discoverable`).toContain(`/servicios/${slug}/`);
  for (const { slug } of casaJardinProducts) expect(paths, `product ${slug} should be discoverable`).toContain(`/casa-jardin/productos/${slug}/`);
  for (const { slug } of casaJardinKits) expect(paths, `kit ${slug} should be discoverable`).toContain(`/casa-jardin/kits/${slug}/`);
  for (const route of canonicalExceptions) expect(paths).not.toContain(route);
});

test("glossary page declares its own canonical route", () => {
  expect(glossaryMetadata.alternates?.canonical).toBe("/biblioteca/glosario/");
});
