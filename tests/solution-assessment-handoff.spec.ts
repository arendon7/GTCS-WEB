import { expect, test } from "@playwright/test";
import {
  buildSolutionAssessmentContactHref,
  consumeSolutionAssessmentDraft,
  SOLUTION_ASSESSMENT_DRAFT_KEY,
  storeSolutionAssessmentDraft,
} from "../src/data/solution-assessment-handoff";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    has: (key: string) => values.has(key),
  };
}

test("biogas assessment keeps user-entered operating details out of the contact URL", () => {
  const details = "Sustrato o corriente: biomasa de prueba\nCaudal o masa disponible: 1 m³/día";
  const href = buildSolutionAssessmentContactHref("Biogás y bioenergía", "Evaluar demanda térmica", "empresa");
  const url = new URL(href, "https://greenatics.test");

  expect(url.pathname).toBe("/contacto/");
  expect(url.searchParams.get("interes")).toBe("solucion");
  expect(url.searchParams.get("perfil")).toBe("empresa");
  expect(url.searchParams.get("diagnostico")).toBe("Biogás y bioenergía");
  expect(url.searchParams.get("prioridad")).toBe("Evaluar demanda térmica");
  expect(url.searchParams.get("transferencia")).toBe("sesion");
  expect(href).not.toContain("biomasa");
  expect(href).not.toContain("1 m³/día");

  const storage = createMemoryStorage();
  expect(storeSolutionAssessmentDraft(details, storage)).toBe(true);
  expect(storage.has(SOLUTION_ASSESSMENT_DRAFT_KEY)).toBe(true);
  expect(consumeSolutionAssessmentDraft(storage)).toBe(details);
  expect(storage.has(SOLUTION_ASSESSMENT_DRAFT_KEY)).toBe(false);
  expect(consumeSolutionAssessmentDraft(storage)).toBeNull();

  const agroindustryHref = buildSolutionAssessmentContactHref("Biogás y bioenergía", "Evaluar demanda térmica", "agroindustria");
  expect(new URL(agroindustryHref, "https://greenatics.test").searchParams.get("perfil")).toBe("agroindustria");
});

test("solution assessment routes declare a matching service audience", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const routes: Array<[string, string]> = [
    ["beneficio-tributario", "empresa"],
    ["biogas-energia", "empresa"],
    ["flota-recoleccion", "territorio"],
    ["riesgo-lixiviados", "territorio"],
    ["viabilidad-municipal", "municipio"],
  ];

  for (const [route, profile] of routes) {
    const source = fs.readFileSync(path.join(process.cwd(), "src/app/soluciones", route, "page.tsx"), "utf8");
    expect(source, `${route} should declare the right contact profile`).toContain(`contactProfile="${profile}"`);
    const html = fs.readFileSync(path.join(process.cwd(), "out/soluciones", route, "index.html"), "utf8").replaceAll("&amp;", "&");
    expect(html, `${route} should export a contact URL for ${profile}`).toContain(`/contacto/?interes=solucion&perfil=${profile}`);
  }

  const pruningRoute = fs.readFileSync(path.join(process.cwd(), "src/app/soluciones/podas-municipales/page.tsx"), "utf8");
  const pruningIntake = fs.readFileSync(path.join(process.cwd(), "src/components/municipal-pruning-intake.tsx"), "utf8");
  expect(pruningRoute).toContain("<MunicipalPruningIntake />");
  expect(pruningIntake).toContain(': "municipio"');
  expect(pruningIntake).toContain('"Ruta de valorización de podas municipales"');
});

test("fleet assessment explains the Greenatics-Auteco configuration and its evidence limits", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/soluciones/flota-recoleccion/page.tsx"), "utf8");

  expect(source).toContain("sobre base Ceronte desarrollada por Greenatics con Auteco Mobility");
  expect(source).toContain("Greenatics diseñó el contenedor verde");
  expect(source).toContain("no vender el vehículo por separado");
  expect(source).toContain("El diseño descrito no acredita fabricación, entrega, operación ni homologación");
});

test("circularity has a descriptive canonical route and preserves the legacy URL safely", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const search = fs.readFileSync(path.join(process.cwd(), "src/components/universal-search-modal.tsx"), "utf8");
  const sharedPage = fs.readFileSync(path.join(process.cwd(), "src/components/circularity-assessment-page.tsx"), "utf8");
  const sitemapSource = fs.readFileSync(path.join(process.cwd(), "src/app/sitemap.ts"), "utf8");
  const canonical = "/soluciones/circularidad-empresarial/";
  const oldPath = "/soluciones/vertimiento-cero/";

  expect(search).toContain(`url: "${canonical}"`);
  expect(search).not.toContain(`url: "${oldPath}"`);
  expect(sharedPage).toContain('contactProfile="empresa"');
  expect(sitemapSource).toContain('"circularidad-empresarial"');

  for (const route of ["circularidad-empresarial", "vertimiento-cero"]) {
    const html = fs.readFileSync(path.join(process.cwd(), "out/soluciones", route, "index.html"), "utf8");
    expect(html).toContain(`href="https://greenatics.com.co${canonical}"`);
    expect(html).toContain("Circularidad y trazabilidad empresarial");
    expect(html).toContain("Una meta de desvío necesita balance, destinos y evidencia.");
    expect(html).toContain("/contacto/?interes=solucion&amp;perfil=empresa");
    expect(html).not.toContain("Garantizamos cero vertimientos");
  }

  const sitemap = fs.readFileSync(path.join(process.cwd(), "out/sitemap.xml"), "utf8");
  expect(sitemap).toContain(canonical.slice(0, -1));
  expect(sitemap).not.toContain(oldPath.slice(0, -1));
});

test("solution assessment draft falls back to memory if session storage is blocked", () => {
  const details = "Caudal: dato de prueba";
  const blockedStorage = {
    getItem: () => { throw new Error("blocked"); },
    setItem: () => { throw new Error("blocked"); },
    removeItem: () => { throw new Error("blocked"); },
  };

  expect(storeSolutionAssessmentDraft(details, blockedStorage)).toBe(true);
  expect(consumeSolutionAssessmentDraft(blockedStorage)).toBe(details);
  expect(consumeSolutionAssessmentDraft(blockedStorage)).toBeNull();
});

test("expired solution assessment drafts are removed instead of reused", () => {
  const storage = createMemoryStorage();
  const originalNow = Date.now;
  let now = 1_800_000_000_000;
  Date.now = () => now;

  try {
    storeSolutionAssessmentDraft("Dato vencido", storage);
    now += 30 * 60 * 1000 + 1;
    expect(consumeSolutionAssessmentDraft(storage)).toBeNull();
    expect(storage.has(SOLUTION_ASSESSMENT_DRAFT_KEY)).toBe(false);
  } finally {
    Date.now = originalNow;
  }
});

test("solution assessment and contact form are wired to the one-time local handoff", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const assessment = fs.readFileSync(path.join(process.cwd(), "src/components/solution-assessment.tsx"), "utf8");
  const contact = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");

  expect(assessment).toContain("onClick={() => storeSolutionAssessmentDraft(details)}");
  expect(assessment).not.toContain("encodeURIComponent(details || nextStep)");
  expect(contact).toContain('const handoffDraft = hasToolHandoffMarker ? consumeToolContactDraft() : null;');
  expect(contact).toContain('join("\\n\\n")');
  expect(contact).toContain("se conservan temporalmente en esta sesión del navegador");
  expect(contact).toContain("no se incluyen en la dirección web");
});

test("solution pre-assessment starts unanswered and does not promise a calculation", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const assessment = fs.readFileSync(path.join(process.cwd(), "src/components/solution-assessment.tsx"), "utf8");

  expect(assessment).toContain('Object.fromEntries(fields.map((field) => [field.id, ""]))');
  expect(assessment).toContain('<option value="" disabled>Selecciona una opción</option>');
  expect(assessment).toContain("aria-label={`${completed} de ${fields.length} campos con respuesta`}");
  expect(assessment).toContain("Esta preevaluación organiza la conversación y ayuda a definir el alcance. No calcula resultados");
  expect(assessment).toContain("Los resultados dependen de los datos, las condiciones y el alcance que se acuerden.");
});

test("shared solution assessments use route-specific visuals and client-facing captions", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const assessment = fs.readFileSync(path.join(process.cwd(), "src/components/solution-assessment.tsx"), "utf8");
  const routes: Array<[string, string]> = [
    ["viabilidad-municipal", "/services/pgirs-pmirs-planning-editorial-v1.jpg"],
    ["beneficio-tributario", "/services/service-consulting-editorial.webp"],
    ["flota-recoleccion", "/projects/routes/motocarguero-verde-operacion-real.webp"],
    ["biogas-energia", "/technology/organic-treatment-routes-concept.jpg"],
    ["riesgo-lixiviados", "/services/leachate-control-assessment-context-v1.jpg"],
  ];

  expect(assessment).toContain('import Image from "next/image"');
  expect(assessment).not.toContain("eyebrow");
  expect(assessment).not.toContain("linear-gradient");
  for (const [route, image] of routes) {
    const source = fs.readFileSync(path.join(process.cwd(), "src/app/soluciones", route, "page.tsx"), "utf8");
    expect(source, `${route} should provide a relevant visual`).toContain(`src: "${image}"`);
    expect(source, `${route} should give the image a useful caption`).toContain("caption:");
  }

  const circularity = fs.readFileSync(path.join(process.cwd(), "src/components/circularity-assessment-page.tsx"), "utf8");
  expect(circularity).toContain('src: "/services/large-generators-editorial-01.jpg"');
  expect(circularity).toContain("caption:");
  expect(circularity).not.toContain("eyebrow=");
  expect(assessment).not.toMatch(/escena editorial|no documenta|generada con IA/i);
});

test("solution assessments expose an honest recovery status if their session draft is missing", async ({ page }) => {
  await page.goto("/contacto/?interes=solucion&perfil=empresa&diagnostico=Biog%C3%A1s&prioridad=Revisar%20la%20corriente&transferencia=sesion");

  const recovery = page.getByText(/la sesión del navegador no lo conservó/);
  await expect(recovery).toBeVisible();
  await expect(recovery).toHaveAttribute("role", "status");
  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue("Ruta sugerida: Biogás\nNecesidad seleccionada: Revisar la corriente");
});

test("direct solution CTAs do not claim that an assessment handoff was lost", async ({ page }) => {
  await page.goto("/contacto/?interes=solucion&perfil=empresa&diagnostico=Adaptar%20el%20modelo%20Yarumal&prioridad=Log%C3%ADstica%20selectiva");

  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue("Ruta sugerida: Adaptar el modelo Yarumal\nNecesidad seleccionada: Logística selectiva");
  await expect(page.getByText(/intentó transferir un resumen temporal/)).toHaveCount(0);
  await expect(page.getByText(/se conservan temporalmente en esta sesión/)).toHaveCount(0);
});

test("solution assessment details survive blocked sessionStorage through in-app navigation", async ({ page }) => {
  const privateValue = "Detalle privado local 2b91";
  await page.goto("/soluciones/biogas-energia/");
  await page.evaluate(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() { throw new Error("blocked for test"); },
    });
  });

  const firstField = page.locator("label").filter({ has: page.locator("input") }).first();
  const fieldLabel = (await firstField.locator("span").first().innerText()).trim();
  await firstField.locator("input").fill(privateValue);
  const handoff = page.getByRole("link", { name: /Solicitar revisión de alcance/ });
  await handoff.click();

  await expect.poll(() => new URL(page.url()).pathname).toBe("/contacto/");
  const details = page.getByLabel("Qué quieres resolver o decidir");
  await expect(details).toHaveValue(new RegExp(`${fieldLabel}: ${privateValue}`));
  expect(page.url()).not.toContain(privateValue);
  await expect(page.getByText(/Los datos de la herramienta o evaluación se conservan temporalmente/)).toHaveAttribute("role", "status");
});

const solutionProfiles = [
  ["beneficio-tributario", "Organización / Gran generador"],
  ["biogas-energia", "Organización / Gran generador"],
  ["flota-recoleccion", "Territorio / Organización"],
  ["podas-municipales", "Municipio / ESP"],
  ["riesgo-lixiviados", "Territorio / Organización"],
  ["vertimiento-cero", "Organización / Gran generador"],
  ["viabilidad-municipal", "Municipio / ESP"],
] as const;

for (const [slug, audience] of solutionProfiles) {
  test(`${slug} carries its private assessment draft into the matching contact profile`, async ({ page }) => {
    const privateValue = "Dato local de prueba 7f3a";
    await page.goto(`/soluciones/${slug}/`);

    const firstField = page.locator("label").filter({ has: page.locator("input") }).first();
    const fieldLabel = (await firstField.locator("span").first().innerText()).trim();
    await firstField.locator("input").fill(privateValue);
    const assessmentDetails = await page.locator("label").evaluateAll((labels) => labels.flatMap((label) => {
      const field = label.querySelector<HTMLInputElement | HTMLSelectElement>("input, select");
      const labelText = label.querySelector("span")?.textContent?.trim();
      const value = field?.value.trim();
      return field && labelText && value ? [`${labelText}: ${value}`] : [];
    }).join("\n"));

    const handoff = page.getByRole("link", { name: /Solicitar revisión de alcance/ });
    const href = await handoff.getAttribute("href");
    expect(href).toBeTruthy();
    const handoffUrl = new URL(href!, "http://127.0.0.1:4173");
    expect(handoffUrl.pathname).toBe("/contacto/");
    expect(handoffUrl.searchParams.get("interes")).toBe("solucion");
    expect(handoffUrl.searchParams.get("perfil")).toBeDefined();
    expect(handoffUrl.searchParams.get("diagnostico")).toBeTruthy();
    expect(handoffUrl.searchParams.get("prioridad")).toBeTruthy();
    expect(handoffUrl.href).not.toContain(privateValue);

    await handoff.click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/contacto/");
    await expect(page.getByRole("button", { name: audience })).toHaveAttribute("aria-pressed", "true");
    const expectedDetails = [
      `Ruta sugerida: ${handoffUrl.searchParams.get("diagnostico")}\nNecesidad seleccionada: ${handoffUrl.searchParams.get("prioridad")}`,
      assessmentDetails,
    ].join("\n\n");
    expect(assessmentDetails).toContain(`${fieldLabel}: ${privateValue}`);
    await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue(expectedDetails);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("greenatics:solution-assessment-draft:v1"))).toBeNull();
    expect(new URL(page.url()).href).not.toContain(privateValue);
  });
}
