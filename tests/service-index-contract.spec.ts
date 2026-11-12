import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { crops } from "../src/data/crops";
import { digitalTools, isLocalRuntime } from "../src/data/digital-tools";
import { products } from "../src/data/products";
import { relatedServiceDetails, relatedServiceSlugs, serviceAudienceLabels, serviceCaseRoutes, services } from "../src/data/services";
import type { ServiceSlug } from "../src/data/services";
import { serviceVisuals } from "../src/data/service-visuals";

const canonicalServiceEntrypoints = [
  { id: "S01", entry: "/servicios/diagnostico-residuos/", contactKey: "diagnostico-residuos" },
  { id: "S02", entry: "/servicios/pgirs-pmirs/#pgirs-municipal", contactKey: "pgirs-municipal", contactHref: "/contacto/?servicio=pgirs-municipal&perfil=municipio" },
  { id: "S03", entry: "/servicios/pgirs-pmirs/#pmirs-organizacional", contactKey: "pmirs-organizacional", contactHref: "/contacto/?servicio=pmirs-organizacional&perfil=empresa" },
  { id: "S04", entry: "/contacto/?servicio=prefactibilidad", contactKey: "prefactibilidad" },
  { id: "S05", entry: "/servicios/plantas-modulares/", contactKey: "plantas-modulares" },
  { id: "S06", entry: "/servicios/microrrutas-motocarguero/", contactKey: "microrrutas-motocarguero" },
  { id: "S07", entry: "/servicios/microrrutas-motocarguero/", contactKey: "microrrutas-motocarguero" },
  { id: "S08", entry: "/servicios/plantas-modulares/", contactKey: "plantas-modulares" },
  { id: "S09", entry: "/servicios/rehabilitacion-infraestructura/", contactKey: "rehabilitacion-infraestructura", contactHref: "/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio" },
  { id: "S10", entry: "/servicios/operacion-delegada/", contactKey: "operacion-delegada" },
  { id: "S11", entry: "/servicios/operacion-delegada/", contactKey: "operacion-delegada" },
  { id: "S12", entry: "/servicios/recoleccion-tratamiento/", contactKey: "recoleccion-tratamiento", contactHref: "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio" },
  { id: "S13", entry: "/servicios/greenatics-ops/", nextStep: "/app/", contactKey: "greenatics-ops", contactHref: "/contacto/?interes=greenatics-ops&modalidad=configuracion" },
  { id: "S14", entry: "/contacto/?servicio=clima-carbono", contactKey: "clima-carbono" },
  { id: "S15", entry: "/contacto/?servicio=regulatorio-residuos-esp", contactKey: "regulatorio-residuos-esp" },
  { id: "S16", entry: "/contacto/?servicio=remuneracion-tratamiento", contactKey: "remuneracion-tratamiento" },
  { id: "S17", entry: "/contacto/?servicio=desarrollo-productos-derivados", contactKey: "desarrollo-productos-derivados" },
  { id: "S18", entry: "/servicios/programas-wondergreen/", contactKey: "programas-wondergreen" },
  { id: "S19", entry: "/contacto/?servicio=idi-agroindustrial", contactKey: "idi-agroindustrial" },
  { id: "S20", entry: "/servicios/optimizacion-composteras/", contactKey: "optimizacion-composteras", contactHref: "/contacto/?servicio=optimizacion-composteras" },
  { id: "S21", entry: "/contacto/?servicio=estructuracion-financiera", contactKey: "estructuracion-financiera" },
  { id: "S22", entry: "/contacto/?servicio=gerencia-tecnica", contactKey: "gerencia-tecnica" },
] as const;

const servicePageHeadings = {
  "diagnostico-residuos": ["Conocer la corriente antes de dimensionar la solución", "Medir la corriente antes de elegir la ruta", "¿Qué decisión debe ayudar a tomar este diagnóstico?"],
  "pgirs-pmirs": ["La planeación toma forma cuando cada medida tiene cómo avanzar.", "Partimos del instrumento y de la decisión pendiente."],
  "microrrutas-motocarguero": ["Diseñar recorridos que funcionen en la calle.", "La microrruta funciona dentro de un sistema, no de forma aislada.", "Podemos empezar con el mapa que ya tienes.", "Cuéntanos cómo se mueven hoy los materiales y qué debe resolver la microrruta."],
  "plantas-modulares": ["Diseñar una planta que responda a la corriente y pueda operarse.", "Una conversación útil empieza con el sitio y la corriente.", "Conversemos sobre las corrientes, el predio y el alcance que necesitas evaluar."],
  "operacion-delegada": ["Que la planta avance no debería depender de quién estuvo en el turno.", "Una mejora que se puede sostener empieza con la operación que ya existe."],
  "greenatics-ops": ["Del plan de trabajo al historial operativo, sin perder el hilo.", "Explora la muestra o conversemos sobre una operación real."],
  "aprovechamiento-productivo": ["Antes de elegir una tecnología, entendemos la corriente y lo que puede sostenerla.", "El estudio puede dejar una ruta concreta para decidir qué sigue.", "Empezamos por lo que ya conoces", "Evaluemos qué ruta vale la pena estudiar para tu biomasa."],
  "programas-wondergreen": ["Del potencial de tu cultivo a un programa de nutrición que puedas evaluar en campo.", "Cada lote pide una lectura propia. El programa también.", "Podemos empezar con la información que ya tienes", "Conversemos sobre tu cultivo, la meta productiva y la información del lote."],
} as const;

const serviceActivityIntros = {
  "diagnostico-residuos": "El muestreo se define por la decisión que debe orientar: reconocer generadores, estimar oferta y comparar alternativas requiere una línea base trazable.",
  "pgirs-pmirs": "El acompañamiento conecta la información del territorio o de la organización con prioridades realizables, responsabilidades y una manera de revisar avances.",
  "microrrutas-motocarguero": "El recorrido se contrasta con generadores, accesos, frecuencias, capacidad de carga y puntos de entrega; un piloto permite identificar qué ajustar en contexto.",
  "plantas-modulares": "Conectamos el estudio de la corriente y el sitio con los criterios de proceso, capacidad, costos y destino de las salidas.",
  "operacion-delegada": "Greenatics trabaja con la infraestructura y el equipo disponibles para coordinar el flujo completo.",
  "greenatics-ops": "GREENATICS OPS sigue el ciclo de la planta: programación mensual o semanal, calendario, actividad, ejecución, registro técnico, evidencia o incidencia, revisión, indicadores e histórico.",
  "aprovechamiento-productivo": "El análisis reúne conocimiento técnico, condiciones de operación y criterio de negocio para identificar qué alternativa merece estudiarse con mayor detalle.",
  "programas-wondergreen": "Agricultura de precisión es decidir con información del cultivo, el suelo, el agua, la etapa y el manejo; no presupone sensores ni dosificación automatizada.",
} as const;

const serviceHeroActions = {
  "diagnostico-residuos": { primaryHref: "#actividades", primary: "Cómo construimos la línea base", secondaryHref: "#punto-de-partida", secondary: "Preparar el diagnóstico" },
  "pgirs-pmirs": { primaryHref: "#actividades", primary: "Ver formulación y seguimiento", secondaryHref: "#rutas-de-planeacion", secondary: "Distinguir PGIRS y PMIRS" },
  "microrrutas-motocarguero": { primaryHref: "#actividades", primary: "Ver diseño de microrrutas", secondaryHref: "#punto-de-partida", secondary: "Preparar el diseño de ruta" },
  "plantas-modulares": { primaryHref: "#fases-del-proyecto", primary: "Explorar las fases", secondaryHref: "#punto-de-partida", secondary: "Conversar sobre mi proyecto" },
  "operacion-delegada": { primaryHref: "#actividades", primary: "Ver cómo organizamos la operación", secondaryHref: "#modalidades", secondary: "Comparar modalidades" },
  "greenatics-ops": { primaryHref: "#muestra-ops", primary: "Explorar la muestra de OPS", secondaryHref: "#configuracion-ops", secondary: "Consultar configuración" },
  "aprovechamiento-productivo": { primaryHref: "#actividades", primary: "Ver cómo evaluamos tu corriente", secondaryHref: "#rutas-de-valorizacion", secondary: "Cómo comparamos rutas" },
  "programas-wondergreen": { primaryHref: "#programa-agronomico", primary: "Cómo se diseña el programa", secondaryHref: "/wondergreen/cultivos/", secondary: "Explorar programas por cultivo" },
} as const;

test("operation continuity heading keeps readable contrast on its dark surface", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");
  expect(styles).toMatch(/\.service-operation-work\s*\{[^}]*color:\s*#f5f4eb;[^}]*background:\s*#12372c;/s);
  expect(styles).toMatch(/\.service-operation-work h2\s*\{\s*color:\s*#f5f4eb;\s*\}/);
});

test("specialist service summaries retain readable body typography", async ({ page }) => {
  await page.goto("/servicios/");
  const summaries = page.locator(".gt-service-capabilities__service-summary");
  await expect(summaries).toHaveCount(10);
  const viewports = test.info().project.name === "desktop"
    ? [1440, 1024, 768, 390, 320]
    : [page.viewportSize()!.width];

  for (const width of viewports) {
    if (test.info().project.name === "desktop") {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 });
    }
    const typography = await summaries.evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      return { fontSize: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight) };
    }));
    expect(typography.every(({ fontSize, lineHeight }) => fontSize >= 16 && lineHeight >= 25.5)).toBe(true);
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow, `unexpected horizontal overflow at ${width}px`).toBe(false);
  }
});

test("S07 service index keeps the route first and makes pilot records conditional", async ({ page }) => {
  await page.goto("/servicios/");

  const offer = page.locator(".gt-service-offer").filter({ hasText: "Diseño de Microrrutas con Motocarguero" });
  await expect(offer).toHaveCount(1);
  await expect(offer.locator("p")).toHaveText(
    "Diseñamos la ruta entre generadores y recepción y evaluamos la integración del motocarguero al territorio. Si se contrata un piloto, acordamos los registros para evaluar la calidad del material y los costos operativos.",
  );
  await expect(offer.getByRole("link", { name: "Ver diseño de microrrutas" })).toHaveAttribute(
    "href",
    "/servicios/microrrutas-motocarguero/",
  );

  const widths = test.info().project.name === "desktop" ? [1440, 1024, 768, 390, 320] : [390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 });
    await expect(offer.locator("p")).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow, `unexpected horizontal overflow at ${width}px`).toBe(false);
  }
});

test("S20 index summary distinguishes process optimization from rehabilitation and daily operation", async ({ page }) => {
  await page.goto("/servicios/");
  const summary = page.locator("#optimizacion-composteras");

  await expect(summary).toContainText("compostaje que ya está en marcha");
  await expect(summary).toContainText("no sustituye la rehabilitación de infraestructura");
  await expect(summary).toContainText("ni la operación física diaria");
  await expect(summary.getByRole("link", { name: "Optimización técnica de composteras" }))
    .toHaveAttribute("href", "/servicios/optimizacion-composteras/");

  const viewports = test.info().project.name === "desktop"
    ? [1440, 1024, 768, 390, 320]
    : [page.viewportSize()!.width];
  const referenceTypography = await page.locator("#recoleccion-recurrente").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: style.fontSize, lineHeight: style.lineHeight };
  });

  for (const width of viewports) {
    if (test.info().project.name === "desktop") {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    }
    const metrics = await summary.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const linkRect = element.querySelector("a")!.getBoundingClientRect();
      return {
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        left: linkRect.left,
        right: linkRect.right,
        viewport: document.documentElement.clientWidth,
        visible: rect.width > 0 && linkRect.width > 0,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    expect(metrics.visible, `S20 summary/link should remain visible at ${width}px`).toBe(true);
    expect(metrics.fontSize, `S20 typography should match related offers at ${width}px`).toBe(referenceTypography.fontSize);
    expect(metrics.lineHeight, `S20 leading should match related offers at ${width}px`).toBe(referenceTypography.lineHeight);
    expect(metrics.left, `S20 link should not clip at ${width}px`).toBeGreaterThanOrEqual(0);
    expect(metrics.right, `S20 link should fit at ${width}px`).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.overflow, `S20 page should not overflow at ${width}px`).toBe(false);
  }
});

test("PGIRS planning heading keeps large-text contrast on its dark surface", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");
  const luminance = (hex: string) => {
    const channels = hex.match(/[a-f\d]{2}/gi)!.map((channel) => parseInt(channel, 16) / 255);
    const [red, green, blue] = channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const ratio = (foreground: string, background: string) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };

  expect(styles).toMatch(/\.service-planning-work\s*\{[^}]*color:\s*#f5f4eb;[^}]*background:\s*#12372c;/s);
  expect(styles).toMatch(/\.service-planning-work h2\s*\{\s*color:\s*#f5f4eb;\s*\}/);
  expect(ratio("#f5f4eb", "#12372c")).toBeGreaterThanOrEqual(3);
});

test("Wondergreen program hero artwork aligns with the reading column at tablet widths", async ({ page }) => {
  await page.goto("/servicios/programas-wondergreen/");
  const artwork = page.locator(".service-detail-page--wondergreen .service-detail-visual--wondergreen .service-detail-visual__artwork");
  await expect(artwork).toBeVisible();

  for (const width of [1440, 1024, 1001, 1000, 900, 842, 768, 701, 700, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    const metrics = await artwork.evaluate((element) => {
      const artworkRect = element.getBoundingClientRect();
      const visualRect = element.parentElement!.getBoundingClientRect();
      return {
        artworkLeft: artworkRect.left,
        artworkWidth: artworkRect.width,
        visualLeft: visualRect.left,
        visualWidth: visualRect.width,
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(metrics.scrollWidth, `page overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewportWidth);
    if (width > 1000) {
      expect(metrics.artworkWidth, `desktop artwork should retain its approved scale at ${width}px`).toBeLessThanOrEqual(500);
    } else if (width >= 701) {
      expect(metrics.artworkWidth, `tablet artwork should use the available visual space at ${width}px`).toBeGreaterThan(500);
      expect(Math.abs(metrics.artworkLeft - metrics.visualLeft), `tablet artwork should align with the reading column at ${width}px`).toBeLessThanOrEqual(1);
      expect(metrics.artworkWidth, `tablet artwork should keep its maximum width at ${width}px`).toBeLessThanOrEqual(680);
    } else {
      expect(Math.abs(metrics.artworkLeft - metrics.visualLeft), `mobile artwork should align with the reading column at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("service hero anchors exist in the route components they serve", () => {
  const pageSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "[slug]", "page.tsx"), "utf8");
  const actionSource = pageSource.match(/const serviceHeroActions:[\s\S]*?=\s*\{([\s\S]*?)\n\};/)?.[1] ?? "";
  const primaryHrefSource = pageSource.match(/const primaryHref = ([^;]+);/)?.[1] ?? "";
  const sourceAnchors = new Set(Array.from(pageSource.matchAll(/\bid="([^"]+)"/g), ([, id]) => id));

  expect(actionSource, "the service hero action map should be present in the page source").not.toBe("");
  expect(primaryHrefSource, "the primary hero href selection should be present in the page source").not.toBe("");
  for (const [, href] of primaryHrefSource.matchAll(/"(#[^"]+)"/g)) {
    expect(sourceAnchors, `primary hero href points to missing ${href}`).toContain(href.slice(1));
  }

  for (const [slug, actions] of Object.entries(serviceHeroActions)) {
    const href = actions.secondaryHref;
    if (!href.startsWith("#")) continue;
    const anchor = href.slice(1);
    expect(actionSource, `${slug} secondaryHref should match the page's action map`).toContain(`secondaryHref: "${href}"`);
    expect(sourceAnchors, `${slug} secondaryHref points to missing #${anchor}`).toContain(anchor);
  }
});

test("S13 exported configuration CTA retains its contextual contact route", () => {
  const detailPath = path.join(process.cwd(), "out", "servicios", "greenatics-ops", "index.html");
  const detailHtml = fs.readFileSync(detailPath, "utf8").replaceAll("&amp;", "&");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");

  expect(detailHtml).toContain('href="/contacto/?interes=greenatics-ops&modalidad=configuracion"');
  expect(contactSource).toContain('key === "greenatics-ops" && params.get("modalidad") === "configuracion"');
  expect(contactSource).toContain('title: "Definir cómo OPS podría ajustarse a tu operación"');
});

test("services index keeps direct family navigation and delegates full scope to service fichas", async () => {
  const pagePath = path.join(process.cwd(), "out", "servicios", "index.html");
  expect(fs.existsSync(pagePath)).toBe(true);
  const html = fs.readFileSync(pagePath, "utf8");
  const serviceStyles = fs.readFileSync(path.join(process.cwd(), "src", "app", "routes-v3.css"), "utf8");
  const serviceDetailStyles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");
  const normalizedHtml = html.replaceAll("&amp;", "&");
  const renderedHtml = normalizedHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  expect(serviceStyles).toContain(".gt-service-category__head > div > small {");
  expect(serviceDetailStyles).toMatch(/\.service-detail-hero-actions\s*\{[^}]*display:\s*flex;[^}]*gap:\s*12px;/s);
  expect(serviceStyles).not.toContain(".gt-service-category__head small {");
  expect(serviceStyles).toContain(".gt-service-offers--pair {");
  expect(serviceStyles).toContain(".gt-service-offer--featured {");
  expect(serviceStyles).toContain("@media (max-width: 760px)");
  expect(serviceStyles).not.toContain(".gt-service-cards");
  expect(serviceStyles).not.toContain(".gt-service-card--text");
  expect(serviceStyles).toMatch(/\.gt-service-capabilities__list\s*\{[^}]*align-items:\s*start;/s);
  expect(serviceStyles).toMatch(/@media \(min-width: 681px\)[\s\S]*\.gt-service-capabilities__list > article:first-child\s*\{[^}]*grid-column:\s*1 \/ -1;/s);
  expect(serviceStyles).toContain("scroll-margin-top: 150px;");
  expect(serviceStyles).toMatch(/\.gt-service-hero__figure--editorial\s*\{[^}]*aspect-ratio:/s);

  const families = ["planeacion", "recoleccion", "infraestructura", "operacion", "datos", "valorizacion"];
  for (const family of families) {
    expect(normalizedHtml).toContain(`href="#${family}"`);
    expect(normalizedHtml).toContain(`id="${family}"`);
  }

  expect(normalizedHtml).toContain("Consultoría y ciencia aplicada, del diagnóstico a la operación.");
  expect(normalizedHtml).toContain("Acompañamos a municipios, empresas de servicios públicos, grandes generadores y agroindustrias a entender sus retos");
  expect(normalizedHtml).toContain('src="/services/service-consulting-editorial.webp"');
  expect(normalizedHtml).toContain("La solución empieza por entender el contexto.");
  expect(normalizedHtml).not.toContain("Escena editorial ilustrativa; no documenta");
  expect(normalizedHtml).not.toContain('src="/tools/service-capabilities-map.svg"');
  expect(normalizedHtml).not.toContain("Organizar un suministro selectivo y previsible para la planta.");
  expect(normalizedHtml).toContain("Asegurar entregas selectivas y previsibles para la planta.");
  expect(normalizedHtml).toContain('href="#familias-de-servicios">Explorar familias de servicios');
  expect(normalizedHtml).toContain('href="/diagnostico/">Definir el punto de partida');
  expect(normalizedHtml).toContain('id="familias-de-servicios"');

  const familyNavigation = normalizedHtml.match(/<nav class="gt-service-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  expect(familyNavigation).not.toMatch(/<span>0[1-6]<\/span>/);
  for (const [slug, label] of Object.entries({
    "diagnostico-residuos": "Ver aforos y entregables",
    "pgirs-pmirs": "Distinguir PGIRS y PMIRS",
    "microrrutas-motocarguero": "Ver diseño de microrrutas",
    "plantas-modulares": "Ver fases de ingeniería",
    "operacion-delegada": "Comparar modalidades de operación",
    "greenatics-ops": "Conocer GREENATICS OPS",
    "aprovechamiento-productivo": "Explorar rutas de valorización",
  })) {
    expect(normalizedHtml).toContain(`href="/servicios/${slug}/">${label}<!-- --> <span aria-hidden="true">→</span></a>`);
  }

  for (const service of services) {
    expect(normalizedHtml).toContain(`href="/servicios/${service.slug}/"`);
    expect(normalizedHtml).toContain(service.name);

    const detailPath = path.join(process.cwd(), "out", "servicios", service.slug, "index.html");
    expect(fs.existsSync(detailPath), `${service.slug} needs a published detail route`).toBe(true);
    const detailHtml = fs.readFileSync(detailPath, "utf8").replaceAll("&amp;", "&");
    const heroHtml = detailHtml.match(/<section class="[^"]*\bservice-detail-hero\b[^"]*"[\s\S]*?<\/section>/)?.[0] ?? "";
    const heroActions = serviceHeroActions[service.slug];
    expect(heroHtml).toContain(`href="${heroActions.primaryHref}">${heroActions.primary}</a>`);
    expect(heroHtml.split(`href="${heroActions.primaryHref}"`).length - 1).toBe(1);
    expect(heroHtml).toContain(`href="${heroActions.secondaryHref}">${heroActions.secondary}</a>`);
    expect(heroHtml).not.toContain("¿Es esta mi ruta?");
    expect(heroHtml).not.toContain('href="/diagnostico/">');
    if (heroActions.secondaryHref.startsWith("#")) {
      expect(detailHtml).toContain(`id="${heroActions.secondaryHref.slice(1)}"`);
    }
    if (service.slug === "pgirs-pmirs") {
      expect(detailHtml).toContain('href="#rutas-de-planeacion">Distinguir PGIRS y PMIRS');
      expect(detailHtml).toContain('id="rutas-de-planeacion"');
      expect(serviceStyles).toMatch(/\.service-detail-context__grid\.service-planning-types\s*\{[^}]*scroll-margin-top:\s*150px;/s);
    }
    const expectedContactHref = service.slug === "greenatics-ops"
      ? "/contacto/?interes=greenatics-ops&modalidad=configuracion"
      : `/contacto/?servicio=${service.slug}`;
    if (service.slug === "pgirs-pmirs") {
      expect(detailHtml).toContain('href="/contacto/?servicio=pgirs-municipal&perfil=municipio"');
      expect(detailHtml).toContain('href="/contacto/?servicio=pmirs-organizacional&perfil=empresa"');
    } else {
      expect(detailHtml).toContain(`href="${expectedContactHref}"`);
    }
    expect(detailHtml).toContain(service.slug === "programas-wondergreen" ? "Cada lote pide una lectura propia. El programa también." : service.solution);
    if (!["microrrutas-motocarguero", "diagnostico-residuos", "plantas-modulares", "aprovechamiento-productivo", "operacion-delegada", "greenatics-ops", "pgirs-pmirs"].includes(service.slug)) {
      expect(detailHtml, `${service.slug} should explain its service-specific decision criteria`).toContain(serviceActivityIntros[service.slug as keyof typeof serviceActivityIntros]);
    }
    expect(detailHtml).not.toContain("La secuencia y el nivel de detalle se ajustan a la corriente, la escala y las responsabilidades acordadas.");
    expect(detailHtml).not.toContain("Qué incluye esta ruta");
    expect(detailHtml).not.toContain("Cómo se convierte en trabajo");
    expect(detailHtml).not.toContain("Cuando aparece este problema");
    if (!["programas-wondergreen", "microrrutas-motocarguero", "diagnostico-residuos", "plantas-modulares", "aprovechamiento-productivo", "operacion-delegada", "greenatics-ops", "pgirs-pmirs"].includes(service.slug)) {
      expect(detailHtml, `${service.slug} should use unnumbered editorial activity lists`).toContain('<ul class="service-detail-activities">');
      expect(detailHtml).not.toContain('<ol class="service-detail-activities">');
      expect(detailHtml).toContain('<ul class="deliverable-list">');
      expect(detailHtml).toContain('<section class="service-detail-offer" id="punto-de-partida">');
      expect(detailHtml).not.toContain("Cómo lo abordamos");
      expect(detailHtml).not.toContain("El reto que resolvemos");
      expect(detailHtml).not.toContain("<dt>Ámbito habitual</dt>");
      expect(detailHtml).not.toContain("class=\"service-detail-problem\"><span>Problema que abordamos</span>");
      expect(detailHtml).not.toContain(">ACTIVIDADES DEL SERVICIO</span>");
      expect(detailHtml).not.toContain(">PUNTO DE PARTIDA</span>");
      expect(detailHtml).not.toContain(">SIGUIENTE PASO</span>");
    }
    for (const heading of servicePageHeadings[service.slug as keyof typeof servicePageHeadings]) {
      expect(detailHtml, `${service.slug} should use its tailored editorial heading`).toContain(heading);
    }
    const serviceItems = service.slug === "programas-wondergreen"
      ? []
      : ["microrrutas-motocarguero", "diagnostico-residuos", "plantas-modulares", "aprovechamiento-productivo", "operacion-delegada", "greenatics-ops", "pgirs-pmirs"].includes(service.slug)
        ? []
      : [...service.activities, ...service.deliverables];
    for (const item of serviceItems) {
      expect(detailHtml, `${service.slug} should preserve: ${item}`).toContain(item);
    }
    for (const caseName of service.slug === "plantas-modulares" ? ["Támesis"] : service.cases) {
      const caseHref = serviceCaseRoutes[caseName];
      expect(caseHref, `${service.slug} should only name a public case`).toBeTruthy();
      const evidencePath = path.join(process.cwd(), "out", caseHref, "index.html");
      expect(fs.existsSync(evidencePath), `${caseName} needs a published evidence route`).toBe(true);
      if (service.slug === "microrrutas-motocarguero") {
        expect(detailHtml).toContain(`href="${caseHref}?perfil=municipio"`);
        expect(detailHtml.replaceAll("<!-- -->", "")).toContain("Conocer el caso de Yarumal");
      } else if (service.slug === "plantas-modulares") {
        expect(detailHtml).toContain(`href="${caseHref}"`);
        expect(detailHtml.replaceAll("<!-- -->", "")).toContain("Támesis · caso territorial");
      } else if (service.slug === "diagnostico-residuos") {
        expect(detailHtml).toContain(`href="${caseHref}"`);
        expect(detailHtml.replaceAll("<!-- -->", "")).toContain("Ver la experiencia de Yarumal");
      }
    }
    const publicCasesLabel = "<h3>Experiencia relacionada</h3>";
    expect(detailHtml.includes(publicCasesLabel), `${service.slug} should not add a generic case row`).toBe(false);
    const relatedSlugs: ServiceSlug[] = service.slug === "greenatics-ops"
      ? ["operacion-delegada"]
      : relatedServiceSlugs[service.slug] ?? [];
    expect(relatedSlugs.length > 0 || service.slug === "plantas-modulares", `${service.slug} should offer relevant onward routes`).toBe(true);
    expect(relatedSlugs.length).toBeLessThanOrEqual(2);
    for (const relatedSlug of relatedSlugs) {
      expect(detailHtml).toContain(`href="/servicios/${relatedSlug}/"`);
      const relation = relatedServiceDetails[service.slug]?.[relatedSlug];
      expect(relation, `${service.slug} → ${relatedSlug} needs a contextual reason and action`).toBeDefined();
      if (service.slug === "diagnostico-residuos") {
        expect(detailHtml).toContain("Podemos empezar con la información que ya tienes.");
      } else if (service.slug === "microrrutas-motocarguero") {
        expect(detailHtml).toContain("Según el proyecto, también puede ser útil:");
      } else if (service.slug === "pgirs-pmirs") {
        expect(detailHtml).toContain("cada enlace conduce al formulario con su servicio y audiencia identificados");
        expect(detailHtml).toContain("Caracterizar residuos cuando falta una línea base");
        expect(detailHtml).toContain("Diseñar recolección selectiva desde las medidas del plan");
      } else if (service.slug === "plantas-modulares") {
        expect(detailHtml).toContain("Definir quién operará la planta");
        expect(detailHtml).toContain("Evaluar las rutas de valorización");
      } else if (service.slug === "operacion-delegada") {
        expect(detailHtml).toContain("Explorar GREENATICS OPS");
        expect(detailHtml).toContain("Revisar fases de ingeniería");
      } else if (service.slug === "greenatics-ops") {
        expect(detailHtml).toContain("El historial de activos, mantenimientos e inventarios aporta contexto para organizar el trabajo de la planta.");
        expect(detailHtml).toContain("Conoce también las modalidades de operación y dirección técnica");
      } else if (service.slug === "aprovechamiento-productivo") {
        expect(detailHtml).toContain("Acompañamiento agronómico Wondergreen");
        expect(detailHtml).toContain("Ingeniería para dimensionar una planta");
      } else {
        expect(detailHtml).toContain(relation!.reason);
        expect(detailHtml).toContain(relation!.action);
      }
    }
    expect(detailHtml).not.toContain("Ver servicio →");
  }

  expect(normalizedHtml).toContain("gt-service-capabilities__list");
  expect(normalizedHtml).toContain("Servicios especializados para decisiones concretas.");
  expect(normalizedHtml).not.toContain("<details class=\"gt-service-capabilities__details\"");
  expect(normalizedHtml).not.toContain("Ver clima, SUI, auditoría y estructuración");
  expect(normalizedHtml).not.toContain("Ver formación y adopción de capacidades");
  expect(normalizedHtml).not.toContain("Explorar 6 servicios relacionados");
  expect(normalizedHtml).not.toContain("Explorar 1 servicios relacionados");
  for (const title of [
    "Estudios, clima y cumplimiento",
    "Ingeniería y gerencia de proyectos",
    "Desarrollo, formación y adopción",
    "Clima, carbono y reportabilidad",
    "Si necesitas definir el alcance y la línea base, revisar tus datos y factores y preparar un reporte con supuestos trazables, conversemos. Si primero buscas reunir y organizar los datos del inventario, puedes empezar con Back 2 Green.",
    "Preparamos variables, fuentes y soportes por prestador y periodo, y revisamos su consistencia antes del reporte.",
    "Preparación SUI",
    "Prefactibilidad técnica y económica",
    "Comparamos alternativas técnicas y costos de inversión y operación para decidir si avanzar; las estimaciones son preliminares, no un presupuesto definitivo.",
    "I+D+i agroindustrial y bioeconomía",
    "Gerencia técnica e ingeniería del propietario",
    "Educación, adopción y transferencia",
    "Preparamos formación y acompañamiento para incorporar procedimientos, herramientas y prácticas al trabajo cotidiano de equipos y comunidades.",
    "Auditoría y aseguramiento técnico",
    "Revisamos registros, balances, procedimientos y evidencias para identificar brechas y orientar acciones según el alcance acordado.",
    "I+D+i agroindustrial y bioeconomía · pilotos",
    "Probamos biomasa, proceso y producto para decidir con evidencia si avanzar, ajustar o detener un desarrollo.",
    "Recolección, trazabilidad y tratamiento recurrentes",
    "Planta en Marcha · rehabilitación de infraestructura existente",
    "Optimización técnica de composteras",
    "Desarrollo técnico de productos derivados",
    "Acompañamiento jurídico y regulatorio para residuos, plantas y ESP",
    "Estructuración técnico-documental para remunerar el tratamiento",
    "Estructuración técnico-económica y financiera de proyectos",
    "Integramos alternativas, inversión, costos, riesgos y necesidades de capital para estructurar un caso de inversión. Complementa la prefactibilidad; no promete financiación.",
    "Representamos técnicamente al propietario para coordinar entregables e interfaces y dar seguimiento a hitos, cambios, pruebas y puesta en marcha según el alcance acordado. El diseño de cada disciplina y la ejecución de obra permanecen bajo sus responsables y contratos.",
    "Conectamos generadores, retiro periódico, recepción y tratamiento en un alcance acordado para cada operación.",
    "Evaluamos estado, proceso y registros para priorizar intervenciones y definir condiciones de arranque.",
    "Revisamos materiales, mezcla, humedad, aireación y maduración para ajustar un compostaje que ya está en marcha. El acompañamiento no sustituye la rehabilitación de infraestructura ni la operación física diaria.",
    "Para desarrollar un producto definido, evaluamos formulación, proceso, calidad y ruta regulatoria, fuera del catálogo Wondergreen vigente.",
  ]) expect(normalizedHtml).toContain(title);
  expect(normalizedHtml).toContain("/contacto/?servicio=prefactibilidad");
  expect(normalizedHtml).toContain('href="/contacto/?servicio=gerencia-tecnica"');
  expect(normalizedHtml).toContain("Acompañamos al propietario en las decisiones e interfaces que conectan diseño, compras y puesta en marcha.");
  expect(normalizedHtml).toContain("/contacto/?servicio=clima-carbono");
  expect(normalizedHtml).toContain('href="/huella/">Organizar el inventario con Back 2 Green');
  const servicesMainHtml = normalizedHtml.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] ?? "";
  expect(servicesMainHtml.match(/href="\/huella\/"/g)).toHaveLength(1);
  expect(normalizedHtml).toContain("/contacto/?servicio=preparacion-sui");
  expect(normalizedHtml).toContain("/contacto/?servicio=idi-agroindustrial");
  expect(normalizedHtml).toContain("/contacto/?servicio=gerencia-tecnica");
  const s21Offer = normalizedHtml.match(/<li\b[^>]*>[\s\S]*?Estructuración técnico-económica y financiera de proyectos[\s\S]*?<\/li>/i)?.[0] ?? "";
  expect(s21Offer).toContain('href="/contacto/?servicio=estructuracion-financiera"');
  expect(s21Offer).toContain('href="/servicios/plantas-modulares/#fases-del-proyecto">Explorar prefactibilidad e ingeniería');
  const plantPagePath = path.join(process.cwd(), "out", "servicios", "plantas-modulares", "index.html");
  expect(fs.existsSync(plantPagePath)).toBe(true);
  expect(fs.readFileSync(plantPagePath, "utf8")).toContain('id="fases-del-proyecto"');
  expect(normalizedHtml).toContain("/contacto/?servicio=educacion-adopcion");
  expect(normalizedHtml).toContain("/contacto/?servicio=aseguramiento-tecnico");
  for (const serviceKey of ["desarrollo-productos-derivados", "regulatorio-residuos-esp", "remuneracion-tratamiento", "estructuracion-financiera"]) {
    expect(normalizedHtml).toContain(`/contacto/?servicio=${serviceKey}`);
  }
  expect(normalizedHtml).toContain('href="/servicios/optimizacion-composteras/"');
  expect(normalizedHtml).toContain("Estructuración técnico-documental para remunerar el tratamiento");
  expect(normalizedHtml).toContain('id="recoleccion-recurrente"');
  expect(normalizedHtml).toContain('href="/servicios/recoleccion-tratamiento/"');
  expect(normalizedHtml).toContain('href="/servicios/rehabilitacion-infraestructura/"');
  for (const summary of [
    "Analizamos obligaciones y jurisdicción para trazar una ruta jurídica y regulatoria en residuos, plantas o servicios públicos. La decisión final corresponde a la autoridad competente.",
    "Integramos contrato, costos, operación y soportes para estructurar la remuneración del tratamiento bajo el marco aplicable. El reconocimiento y el recaudo dependen de cada caso.",
  ]) expect(normalizedHtml).toContain(summary);
  expect(normalizedHtml).not.toContain("Explorar esta capacidad");
  expect(normalizedHtml).not.toContain("Tres modos de intervención");
  expect(normalizedHtml).not.toContain("Modalidad 01");
  expect(normalizedHtml).not.toContain("Qué queda instalado");
  expect(normalizedHtml).not.toContain("¿Cuándo empezar aquí?");
  expect(normalizedHtml).toContain('class="gt-service-evidence"');
  expect(normalizedHtml).not.toContain("gt-service-impact");
  expect(normalizedHtml).not.toContain("gt-service-case-bridge");
  expect((normalizedHtml.match(/class="gt-service-card__media(?: gt-service-card__media--diagram)?"/g) || []).length).toBe(0);
  expect((normalizedHtml.match(/class="gt-service-offer(?: gt-service-offer--featured)?"/g) || []).length).toBe(7);
  expect(normalizedHtml).toContain('src="/services/service-consulting-editorial.webp"');
  expect(normalizedHtml).toContain('src="/services/operation-follow-up-concept-v1.jpg"');
  const familySections = [...normalizedHtml.matchAll(/<section class="gt-service-category"[\s\S]*?<\/section>/g)].map(([section]) => section).join("");
  expect(familySections).not.toContain('src="/products/wondergreen-soil-roots-editorial.jpg"');
  expect(normalizedHtml).toContain("El alcance puede reunir estudios, ingeniería, revisión regulatoria, implementación u operación.");
  expect(normalizedHtml).toContain('href="/contacto/?interes=servicios">Contar el punto de partida');
  expect(normalizedHtml).not.toContain("Definir el siguiente paso →");
  expect(normalizedHtml).not.toContain("Revisar un alcance");
  expect(normalizedHtml).not.toContain("greenatics-dashboard-concept.jpg");
  expect(normalizedHtml).not.toContain("8–14 t CO₂e/mes");
  expect(normalizedHtml).not.toContain("Estimación preliminar por validar");
  expect(renderedHtml).toContain("infraestructura instalada de los rangos de diseño y del escenario preliminar de CO₂e");
  expect(renderedHtml).toContain("+120 t/mes");
  expect(renderedHtml).toContain("96,4 %");
  expect(renderedHtml).not.toContain("140 km");
  expect(renderedHtml).not.toContain("$180 M COP/año");
  expect((renderedHtml.match(/href="\/proyectos\/yarumal\//g) || []).length).toBe(1);
});

test("S12 source keeps the service journey narrative and avoids the ledger layout", async () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "recoleccion-tratamiento", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "recoleccion-tratamiento", "recoleccion-tratamiento.module.css"), "utf8");

  for (const copy of [
    "Recolección de orgánicos con trazabilidad hasta su tratamiento.",
    "Primero ubicamos los puntos de generación",
    "acordamos cobertura, frecuencia, logística y responsables",
    "La recepción se realiza de acuerdo con la capacidad y los criterios del destino.",
    "/servicios/microrrutas-motocarguero/",
    "GREENATICS OPS es otro componente",
    "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio",
    "/contacto/?servicio=recoleccion-tratamiento&perfil=empresa",
  ]) expect(page).toContain(copy);

  expect(page).not.toContain("DEL ORIGEN A LA RECEPCIÓN");
  expect(page).not.toContain("ALCANCES QUE SE COMPLEMENTAN");
  expect(page).not.toContain("Siguiente paso");
  expect(styles).not.toContain(".stages");
  expect(styles).not.toContain(".note {");
  expect(styles).toContain(".closing h2 { max-width: 17ch; color: #f8f6ed; }");
});

test("S12 uses the release-attested route photo without implying Greenatics affiliation", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "recoleccion-tratamiento", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "recoleccion-tratamiento", "recoleccion-tratamiento.module.css"), "utf8");
  const photo = path.join(process.cwd(), "public", "projects", "tamesis", "ruta-selectiva.jpeg");
  const publicHeldPhoto = path.join(process.cwd(), "public", "services", "municipal-collection-archive-ai-edited.jpg");
  const heldPhoto = path.join(process.cwd(), "docs", "knowledge", "asset-holdbacks", "municipal-collection-archive-ai-edited.jpg");
  const holdbacks = JSON.parse(fs.readFileSync(path.join(process.cwd(), "docs", "knowledge", "PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"), "utf8")) as { holdbacks: Array<{ asset: string }> };

  expect(fs.existsSync(photo)).toBe(true);
  expect(fs.existsSync(publicHeldPhoto)).toBe(false);
  expect(fs.existsSync(heldPhoto)).toBe(true);
  expect(holdbacks.holdbacks.some(({ asset }) => asset === "/services/municipal-collection-archive-ai-edited.jpg")).toBe(true);
  expect(page).toContain('src="/projects/tamesis/ruta-selectiva.jpeg"');
  expect(page).not.toContain("municipal-collection-archive-ai-edited.jpg");
  expect(page).not.toContain("00_greenatics_logo.png");
  expect(page).toContain("vehículo convencional");
  expect(page).toContain("destino acordado");
  expect(page).toContain("className={styles.heroImageFrame}");
  expect(page).not.toContain("brandMark");
  expect(styles).not.toContain(".brandMark");
  expect(styles).toMatch(/\.heroImageFrame\s*\{[^}]*position:\s*relative;[^}]*aspect-ratio:\s*4\s*\/\s*3;/s);
  expect(styles).not.toMatch(/@media \(max-width: 680px\)[\s\S]*?\.heroImageFrame\s*\{[^}]*aspect-ratio:/);
});

test("S12 service landing explains recurrent collection and keeps its audience-specific contact paths", async () => {
  const routePath = path.join(process.cwd(), "out", "servicios", "recoleccion-tratamiento", "index.html");
  expect(fs.existsSync(routePath)).toBe(true);
  const html = fs.readFileSync(routePath, "utf8").replaceAll("&amp;", "&");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "recoleccion-tratamiento", "recoleccion-tratamiento.module.css"), "utf8");

  for (const copy of [
    "Recolección de orgánicos con trazabilidad hasta su tratamiento.",
    "Primero ubicamos los puntos de generación",
    "acordamos cobertura, frecuencia, logística y responsables",
    "La recepción se realiza de acuerdo con la capacidad y los criterios del destino.",
    "Retirar de forma periódica no es lo mismo que diseñar una microrruta nueva.",
    "Coordinamos el retiro periódico de orgánicos separados",
    "/servicios/microrrutas-motocarguero/",
    "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio",
    "/contacto/?servicio=recoleccion-tratamiento&perfil=empresa",
  ]) expect(html).toContain(copy);

  expect(html).toContain('src="/projects/tamesis/ruta-selectiva.jpeg"');
  expect(html).toContain("La selección del vehículo depende de la capacidad");
  expect(html).toContain("vehículo convencional");
  expect(html).not.toContain("municipal-collection-archive-ai-edited.jpg");
  expect(html).not.toContain("00_greenatics_logo.png");
  expect(html).not.toContain("DEL ORIGEN A LA RECEPCIÓN");
  expect(html).not.toContain("ALCANCES QUE SE COMPLEMENTAN");
  expect(html).not.toContain("Siguiente paso");
  expect(styles).not.toContain(".stages");
  expect(styles).not.toContain(".note {");

  for (const internalNote of ["imagen generada con IA", "escena editorial", "no documenta", "uniforme no validado"]) {
    expect(html.toLowerCase()).not.toContain(internalNote);
  }
});

test("S09 service landing explains assessment, intervention limits and audience-specific contact paths", async () => {
  const routePath = path.join(process.cwd(), "out", "servicios", "rehabilitacion-infraestructura", "index.html");
  expect(fs.existsSync(routePath)).toBe(true);
  const html = fs.readFileSync(routePath, "utf8").replaceAll("&amp;", "&");

  for (const copy of [
    "Recuperar una planta empieza por saber qué puede volver a operar.",
    "Revisamos el estado, la disponibilidad, el deterioro visible, los repuestos y la relación entre los equipos existentes.",
    "los registros de operación, mantenimiento y calidad",
    "qué conservar",
    "qué priorizar por condición, riesgo, dependencia y objetivo operativo",
    "La capacidad recuperable se establece después de la revisión técnica, no antes.",
    "/servicios/plantas-modulares/",
    "/servicios/operacion-delegada/#modalidades",
    "Comparar dirección técnica y modalidades de operación",
    "/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio",
    "/contacto/?servicio=rehabilitacion-infraestructura&perfil=empresa",
    "/contacto/?servicio=rehabilitacion-infraestructura&perfil=agroindustria",
  ]) expect(html).toContain(copy);

  expect(html).toContain('src="/services/plant-rehabilitation-assessment-v1.jpg"');
  for (const ledgerLabel of ["ENTENDER ANTES DE INTERVENIR", "DE LA EVALUACIÓN A UNA DECISIÓN", "CADA NECESIDAD TIENE SU ALCANCE", "SIGUIENTE PASO"]) {
    expect(html).not.toContain(ledgerLabel);
  }
  for (const internalNote of ["imagen generada con IA", "escena editorial", "no documenta", "uniforme no validado"]) {
    expect(html.toLowerCase()).not.toContain(internalNote);
  }
});

test("S09 routes operation-seeking visitors to the S10/S11 modality comparison", async ({ page }) => {
  await page.goto("/servicios/rehabilitacion-infraestructura/");
  const operationLink = page.getByRole("link", { name: "Comparar dirección técnica y modalidades de operación" });
  await expect(operationLink).toHaveAttribute("href", "/servicios/operacion-delegada/#modalidades");

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(operationLink).toBeVisible();
    const geometry = await operationLink.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const container = element.parentElement;
      return {
        viewport: document.documentElement.clientWidth,
        left: bounds.left,
        right: bounds.right,
        containerWidth: container?.clientWidth ?? 0,
        containerScrollWidth: container?.scrollWidth ?? 0,
      };
    });
    expect(geometry.left, `link starts outside viewport at ${width}px`).toBeGreaterThanOrEqual(-1);
    expect(geometry.right, `link ends outside viewport at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
    expect(geometry.containerScrollWidth, `link container overflows at ${width}px`)
      .toBeLessThanOrEqual(geometry.containerWidth + 1);
  }

  await operationLink.click();
  await expect(page).toHaveURL(/\/servicios\/operacion-delegada\/#modalidades$/);
  await expect(page.locator("#modalidades")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operación integral", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operación compartida", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dirección técnica", exact: true })).toBeVisible();
});

test("S09 closing actions fit their column without horizontal overflow", async ({ page }) => {
  await page.goto("/servicios/rehabilitacion-infraestructura/");
  const actions = page.locator("#conversemos a.button");
  const expectedHrefs = [
    "/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio",
    "/contacto/?servicio=rehabilitacion-infraestructura&perfil=empresa",
    "/contacto/?servicio=rehabilitacion-infraestructura&perfil=agroindustria",
  ];

  await expect(actions).toHaveCount(expectedHrefs.length);
  for (const [index, href] of expectedHrefs.entries()) {
    await expect(actions.nth(index)).toHaveAttribute("href", href);
  }

  for (const width of [1440, 1024, 900, 768, 681, 680, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll<HTMLElement>("#conversemos a.button")];
      const container = buttons[0]?.parentElement;
      return {
        viewport: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        containerWidth: container?.clientWidth ?? 0,
        containerScrollWidth: container?.scrollWidth ?? 0,
        buttons: buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          return {
            left: bounds.left,
            right: bounds.right,
            width: bounds.width,
            height: bounds.height,
            whiteSpace: getComputedStyle(button).whiteSpace,
          };
        }),
      };
    });

    expect(geometry.documentWidth, `document overflows at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
    expect(geometry.containerScrollWidth, `CTA column overflows at ${width}px`)
      .toBeLessThanOrEqual(geometry.containerWidth + 1);
    for (const button of geometry.buttons) {
      expect(button.left, `CTA starts outside the viewport at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(button.right, `CTA ends outside the viewport at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
      expect(button.width, `CTA exceeds its column at ${width}px`).toBeLessThanOrEqual(geometry.containerWidth + 1);
      expect(button.height, `CTA touch target is too short at ${width}px`).toBeGreaterThanOrEqual(44);
      if (width <= 900) expect(button.whiteSpace).toBe("normal");
    }
  }

  await page.setViewportSize({ width: 768, height: 900 });
  let firstActionFocused = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await page.keyboard.press("Tab");
    firstActionFocused = await actions.first().evaluate((element) => document.activeElement === element);
    if (firstActionFocused) break;
  }
  expect(firstActionFocused, "keyboard navigation reaches the first closing action").toBe(true);
  const focusStyle = await actions.first().evaluate((element) => ({
    visible: element.matches(":focus-visible"),
    outline: getComputedStyle(element).outlineStyle,
  }));
  expect(focusStyle.visible).toBe(true);
  expect(focusStyle.outline).not.toBe("none");
  await page.keyboard.press("Tab");
  await expect(actions.nth(1)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(actions.nth(2)).toBeFocused();
});

test("common service fichas follow the current Greenatics visual direction", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");
  const designRules = fs.readFileSync(path.join(process.cwd(), "docs", "knowledge", "WEB_EDITORIAL_DESIGN_RULES_GREENATICS.md"), "utf8");

  expect(styles).toContain("background: #f3f0e5;");
  expect(styles).toContain(".service-detail-page:not(.service-detail-page--wondergreen) .service-detail-offer");
  expect(styles).toContain("grid-template-columns: minmax(0, 1.35fr) minmax(220px, .72fr);");
  expect(styles).toContain("background: #fff;");
  expect(styles).toContain(".service-detail-page:not(.service-detail-page--wondergreen) .service-detail-activities li::before");
  expect(designRules).toContain("No usar una plantilla editorial única para todas las fichas.");
  expect(designRules).toContain("No reemplazar tablas por filas subrayadas en serie.");
  expect(designRules).toContain("No convertir el hero de Municipios en plantilla para cada servicio.");
  expect(designRules).toContain("No publicar expresiones como “escena editorial”");

  for (const service of services) {
    const detailHtml = fs.readFileSync(path.join(process.cwd(), "out", "servicios", service.slug, "index.html"), "utf8");
    expect(detailHtml, `${service.slug} must keep visual-production notes internal`).not.toMatch(/escena editorial|imagen generada con IA|no documenta|registro de archivo/i);
  }

  for (const route of ["servicios", "servicios/recoleccion-tratamiento", "servicios/rehabilitacion-infraestructura", "municipios", "portafolio", "nosotros", "parque-ambiental", "proyectos", "impacto", "recursos"]) {
    const pageHtml = fs.readFileSync(path.join(process.cwd(), "out", route, "index.html"), "utf8");
    expect(pageHtml, `${route} must keep image-production notes internal`).not.toMatch(/escena editorial|imagen generada con IA|no documenta|registro de archivo|archivo fotográfico|fotografía de archivo/i);
  }
});

test("microrrutas uses Yarumal as an image-led case without presenting the plant photo as vehicle evidence", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "microrrutas-motocarguero", "index.html"), "utf8");
  const visibleBodyHtml = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "") ?? "";
  const source = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "[slug]", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");

  expect(html).toContain('class="service-route-evidence"');
  expect(html).toContain('class="service-route-design"');
  expect(html).toContain('class="service-route-start"');
  expect(html).toContain('id="yarumal-route-case"');
  expect(html).toContain("/projects/plant/plant-evidence-05.webp");
  expect(html).toContain("Compostaje en hileras bajo cubierta en la planta de Yarumal.");
  expect(html).toContain("La microrruta funciona dentro de un sistema, no de forma aislada.");
  expect(html).toContain("/services/microroutes-organics-handoff-editorial-v01.jpg");
  expect(html).toContain("Convertimos la generación y las condiciones de calle en un recorrido operable.");
  expect(html).toContain("tiempo de ciclo como restricciones");
  expect(html).toContain("probamos el diseño antes de ampliar la cobertura");
  expect(html).toContain("96,4 %");
  expect((visibleBodyHtml.match(/96,4 %/g) ?? [])).toHaveLength(1);
  expect((visibleBodyHtml.match(/Greenatics y Auteco Mobility/g) ?? [])).toHaveLength(1);
  expect(html).toContain("La representación del diseño Greenatics–Auteco acompaña el análisis de ruta, capacidad y recepción para cada operación.");
  expect(html).toContain("de pureza orgánica en recepción");
  expect(html).toContain('href="/proyectos/yarumal/?perfil=municipio"');
  expect(html).not.toContain('class="service-detail-context"');
  expect(html).not.toContain('class="service-detail-practice"');
  expect(html).not.toContain('class="service-detail-offer"');
  expect(html).not.toContain('class="service-related-grid"');
  expect(source).toContain("Convertimos la generación y las condiciones de calle en un recorrido operable.");
  expect(source).toContain("Si hace falta, probamos el diseño antes de ampliar la cobertura.");
  expect(source).not.toContain("service-route-design__levers");
  expect(styles).toContain(".service-route-design__story {");
  expect(styles).toContain("grid-template-columns: minmax(260px, .78fr) minmax(0, 1.22fr);");
});

test("all 22 canonical service offers keep a public entry and an appropriate next step", async () => {
  expect(canonicalServiceEntrypoints).toHaveLength(22);
  const canonicalIds = canonicalServiceEntrypoints.map(({ id }) => id);
  expect(new Set(canonicalIds).size).toBe(22);
  expect([...canonicalIds].sort()).toEqual(
    Array.from({ length: 22 }, (_, index) => `S${String(index + 1).padStart(2, "0")}`),
  );
  const indexHtml = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "index.html"), "utf8").replaceAll("&amp;", "&");
  const detailHtml = services.map((service) => fs.readFileSync(path.join(process.cwd(), "out", "servicios", service.slug, "index.html"), "utf8")).join("\n").replaceAll("&amp;", "&");
  const specialServiceHtml = ["recoleccion-tratamiento", "rehabilitacion-infraestructura", "optimizacion-composteras"].map((slug) => fs.readFileSync(path.join(process.cwd(), "out", "servicios", slug, "index.html"), "utf8")).join("\n").replaceAll("&amp;", "&");
  const serviceHtml = `${indexHtml}\n${detailHtml}\n${specialServiceHtml}`;
  expect(serviceHtml).toContain("Comparamos alternativas para transformar biomasa en compost, bioenergía o insumos agrícolas. La decisión parte de la corriente y su contexto, no de una tecnología predeterminada.");
  expect(serviceHtml).not.toContain("Empresas Medellín");
  expect(serviceHtml).not.toContain("avanzar en NUIT");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const expectedProfiles: Record<string, string> = {
    S01: "territorio",
    S02: "esp",
    S03: "agroindustria",
    S04: "proyecto",
    S05: "territorio",
    S06: "territorio",
    S07: "territorio",
    S08: "territorio",
    S09: "territorio",
    S10: "territorio",
    S11: "territorio",
    S12: "territorio",
    S13: "digital",
    S14: "clima",
    S15: "esp",
    S16: "esp",
    S17: "agroindustrial",
    S18: "agro",
    S19: "agroindustrial",
    S20: "territorio",
    S21: "proyecto",
    S22: "proyecto",
  };

  for (const service of canonicalServiceEntrypoints) {
    if (service.entry.startsWith("/servicios/")) {
      const [route, anchor] = service.entry.split("#");
      const routePath = path.join(process.cwd(), "out", route, "index.html");
      expect(fs.existsSync(routePath), `${service.id} needs a published route: ${route}`).toBe(true);
      if (anchor) {
        const routeHtml = fs.readFileSync(routePath, "utf8");
        expect(routeHtml.includes(`id="${anchor}"`), `${service.id} needs its ${anchor} anchor`).toBe(true);
      }
    } else {
      expect(serviceHtml.includes(`href="${service.entry}"`), `${service.id} needs a public entry: ${service.entry}`).toBe(true);
    }
    if ("contactKey" in service) {
      const contactHref = "contactHref" in service ? service.contactHref : `/contacto/?servicio=${service.contactKey}`;
      const contactMarkup = ["S09", "S12", "S13", "S20"].includes(service.id)
        ? fs.readFileSync(path.join(process.cwd(), "out", "servicios", service.id === "S09" ? "rehabilitacion-infraestructura" : service.id === "S12" ? "recoleccion-tratamiento" : service.id === "S13" ? "greenatics-ops" : "optimizacion-composteras", "index.html"), "utf8")
        : serviceHtml;
      const normalizedContactMarkup = contactMarkup.replaceAll("&amp;", "&");
      if (service.id === "S09" || service.id === "S12") {
        const profiles = service.id === "S09" ? ["municipio", "empresa", "agroindustria"] : ["municipio", "empresa"];
        for (const profile of profiles) {
          const contextualHref = `/contacto/?servicio=${service.contactKey}&perfil=${profile}`;
          expect(normalizedContactMarkup.includes(`href="${contextualHref}"`), `${service.id} needs a matching ${profile} contact link`).toBe(true);
        }
      } else {
        expect(normalizedContactMarkup.includes(`href="${contactHref}"`), `${service.id} needs a matching contact link: ${contactHref}`).toBe(true);
      }
      expect(contactSource, `${service.id} needs a tailored form context`).toMatch(new RegExp(`"${service.contactKey}":\\s*(?:\\{|[A-Za-z_$])`));
      const contextLine = contactSource.split("\n").find((line) => line.trimStart().startsWith(`"${service.contactKey}":`)) || "";
      let declaredProfile = contextLine.match(/profile:\s*"([^"]+)"/)?.[1];
      if (!declaredProfile) {
        const contextAlias = contextLine.match(/:\s*([A-Za-z_$][\w$]*)\s*,?\s*$/)?.[1];
        if (contextAlias) {
          const aliasBlock = contactSource.match(new RegExp(`const ${contextAlias} = \\{([\\s\\S]*?)\\};`))?.[1] || "";
          declaredProfile = aliasBlock.match(/profile:\s*"([^"]+)"/)?.[1];
        }
      }
      expect(declaredProfile, `${service.id} contact context should resolve a profile`).toBe(expectedProfiles[service.id]);
    }
    if ("nextStep" in service) {
      expect(serviceHtml.includes(`href="${service.nextStep}"`), `${service.id} needs its public exploration step`).toBe(true);
    }
  }
});

test("all 22 canonical service offers complete their browser journey to the contextual contact form", async ({ page }) => {
  for (const service of canonicalServiceEntrypoints) {
    const contactHref = "contactHref" in service
      ? service.contactHref
      : `/contacto/?servicio=${service.contactKey}`;

    await test.step(`${service.id} reaches ${contactHref}`, async () => {
      await page.goto(service.entry);

      if (service.entry.startsWith("/servicios/")) {
        const contactLink = page.locator(`a[href="${contactHref}"]`).first();
        await expect(contactLink, `${service.id} should expose its contextual contact CTA`).toBeVisible();
        await contactLink.click();
      }

      await expect(page).toHaveURL(new URL(contactHref, "http://127.0.0.1:4174/").toString());
      await expect(page.getByRole("status"), `${service.id} should show a contextual service summary`).toBeVisible();
    });
  }
});

test("source inventory maps all 22 canonical offers, audience origins and contact contexts without export", () => {
  const crosswalk = fs.readFileSync(path.join(process.cwd(), "docs", "knowledge", "SERVICE_CANON_WEB_CROSSWALK_2026-09-25.md"), "utf8");
  const indexSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "page.tsx"), "utf8");
  const detailSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "[slug]", "page.tsx"), "utf8");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const audienceSources = {
    Municipios: fs.readFileSync(path.join(process.cwd(), "src", "app", "municipios", "page.tsx"), "utf8"),
    Empresas: fs.readFileSync(path.join(process.cwd(), "src", "app", "empresas", "page.tsx"), "utf8"),
    Agroindustria: fs.readFileSync(path.join(process.cwd(), "src", "app", "agroindustria", "page.tsx"), "utf8"),
  };
  const specialRoutes = new Set(["rehabilitacion-infraestructura", "recoleccion-tratamiento", "optimizacion-composteras"]);
  const expectedProfiles: Record<(typeof canonicalServiceEntrypoints)[number]["id"], string> = {
    S01: "territorio",
    S02: "esp",
    S03: "agroindustria",
    S04: "proyecto",
    S05: "territorio",
    S06: "territorio",
    S07: "territorio",
    S08: "territorio",
    S09: "territorio",
    S10: "territorio",
    S11: "territorio",
    S12: "territorio",
    S13: "digital",
    S14: "clima",
    S15: "esp",
    S16: "esp",
    S17: "agroindustrial",
    S18: "agro",
    S19: "agroindustrial",
    S20: "territorio",
    S21: "proyecto",
    S22: "proyecto",
  };

  expect(canonicalServiceEntrypoints).toHaveLength(22);
  for (const service of canonicalServiceEntrypoints) {
    expect(crosswalk, `${service.id} should remain in the canonical crosswalk`).toMatch(new RegExp(`^\\| ${service.id} \\|`, "m"));
    expect(contactSource, `${service.id} needs a form context for ${service.contactKey}`).toContain(`"${service.contactKey}":`);
    const contextLine = contactSource.split("\n").find((line) => line.trimStart().startsWith(`"${service.contactKey}":`)) ?? "";
    let declaredProfile = contextLine.match(/profile:\s*"([^"]+)"/)?.[1];
    if (!declaredProfile) {
      const contextAlias = contextLine.match(/:\s*([A-Za-z_$][\w$]*)\s*,?\s*$/)?.[1];
      if (contextAlias) {
        const aliasBlock = contactSource.match(new RegExp(`const ${contextAlias} = \\{([\\s\\S]*?)\\};`))?.[1] ?? "";
        declaredProfile = aliasBlock.match(/profile:\s*"([^"]+)"/)?.[1];
      }
    }
    expect(declaredProfile, `${service.id} contact context should resolve to ${expectedProfiles[service.id]}`).toBe(expectedProfiles[service.id]);

    if (service.entry.startsWith("/servicios/")) {
      const [, slug, anchor] = service.entry.match(/^\/servicios\/([^/#]+)\/?(?:#(.+))?$/) ?? [];
      expect(slug, `${service.id} needs a parseable service route`).toBeTruthy();
      expect(
        services.some((candidate) => candidate.slug === slug) || specialRoutes.has(slug),
        `${service.id} route ${slug} must resolve to a canonical or dedicated service page`,
      ).toBe(true);

      if (services.some((candidate) => candidate.slug === slug)) {
        expect(indexSource, `${service.id} should be linked from the public service index`).toContain("href={`/servicios/${service.slug}/`}");
      } else {
        expect(fs.existsSync(path.join(process.cwd(), "src", "app", "servicios", slug, "page.tsx")), `${service.id} needs a dedicated page source`).toBe(true);
        expect(indexSource, `${service.id} dedicated page should be linked from the service index`).toContain(slug);
      }

      if (anchor) {
        expect(detailSource, `${service.id} anchor ${anchor} needs a source definition`).toContain(anchor);
      }
    } else {
      expect(indexSource, `${service.id} direct contact entry should be linked from the public services index`).toContain(service.entry);
    }

    if ("nextStep" in service) {
      expect(detailSource, `${service.id} next step ${service.nextStep} should be wired in the service template`).toContain(service.nextStep);
    }
  }

  const requiredAudienceDestinations = {
    Municipios: [
      "/servicios/diagnostico-residuos/?perfil=municipio",
      "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal",
      "/servicios/recoleccion-tratamiento/?perfil=municipio",
      "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio",
      "/servicios/microrrutas-motocarguero/?perfil=municipio",
      "/servicios/plantas-modulares/?perfil=municipio",
      "/servicios/rehabilitacion-infraestructura/?perfil=municipio",
      "/servicios/operacion-delegada/?perfil=municipio",
      "/servicios/aprovechamiento-productivo/?perfil=municipio",
    ],
    Empresas: [
      "/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional",
      "/servicios/diagnostico-residuos/?perfil=empresa",
      "/servicios/recoleccion-tratamiento/?perfil=empresa",
      "/contacto/?servicio=recoleccion-tratamiento&perfil=empresa",
      "/servicios/microrrutas-motocarguero/?perfil=empresa",
      "/servicios/operacion-delegada/?perfil=empresa",
      "/servicios/aprovechamiento-productivo/?perfil=empresa",
      "/servicios/greenatics-ops/?perfil=empresa",
      "/huella/",
    ],
    Agroindustria: [
      "/servicios/diagnostico-residuos/?perfil=agroindustria",
      "/contacto/?servicio=prefactibilidad&perfil=agroindustria",
      "/servicios/plantas-modulares/?perfil=agroindustria",
      "/servicios/rehabilitacion-infraestructura/?perfil=agroindustria",
      "/servicios/operacion-delegada/?perfil=agroindustria#modalidad-direccion-tecnica",
      "/servicios/operacion-delegada/?perfil=agroindustria#modalidad-operacion-integral",
      "/contacto/?servicio=idi-agroindustrial&perfil=agroindustria",
      "/contacto/?servicio=desarrollo-productos-derivados&perfil=agroindustria",
      "/servicios/aprovechamiento-productivo/?perfil=agroindustria",
      "/servicios/greenatics-ops/?perfil=agroindustria",
      "/servicios/programas-wondergreen/?perfil=agroindustria",
    ],
  } as const;

  for (const [audience, destinations] of Object.entries(requiredAudienceDestinations)) {
    for (const destination of destinations) {
      expect(audienceSources[audience as keyof typeof audienceSources], `${audience} should expose ${destination}`).toContain(destination);

      const target = new URL(destination, "https://greenatics.test");
      if (!target.pathname.startsWith("/servicios/") || !target.hash) continue;

      const slug = target.pathname.split("/").filter(Boolean).at(-1) ?? "";
      const anchor = target.hash.slice(1);
      const detailPage = services.some((service) => service.slug === slug)
        ? detailSource
        : fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", slug, "page.tsx"), "utf8");
      const literalAnchor = new RegExp(`\\bid="${anchor}"`).test(detailPage);
      const operatingModeAnchor = detailPage.includes("id={mode.id}")
        && detailPage.match(/const operatingModes = \[([\s\S]*?)\] as const;/)?.[1].includes(`id: "${anchor}"`);
      const planningInstrumentAnchor = detailPage.includes("id={instrument.id}")
        && detailPage.match(/const planningInstrumentTypes = \[([\s\S]*?)\] as const;/)?.[1].includes(`id: "${anchor}"`);

      expect(
        literalAnchor || operatingModeAnchor || planningInstrumentAnchor,
        `${audience} destination ${destination} must resolve to an anchor rendered by ${slug}`,
      ).toBe(true);
    }
  }
});

test("waste diagnosis keeps neutral scope and form context for both territories and organizations", () => {
  const diagnosis = services.find((service) => service.slug === "diagnostico-residuos");
  const formSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const detailHtml = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "diagnostico-residuos", "index.html"), "utf8").replaceAll("&amp;", "&");

  expect(diagnosis?.audience).toBe("Ambos");
  expect(diagnosis?.scope).toContain("empresarial y agroindustrial");
  expect(diagnosis?.cta).toBe("Solicitar diagnóstico de residuos");
  expect(formSource).toMatch(/"diagnostico-residuos":\s*\{[^\n]+profile: "territorio"/);
  expect(detailHtml).toContain('href="/contacto/?servicio=diagnostico-residuos">Solicitar diagnóstico de residuos');
  expect(detailHtml).toContain('class="service-diagnosis-story"');
  expect(detailHtml).toContain('class="service-diagnosis-method"');
  expect(detailHtml).toContain('class="service-diagnosis-method__starting" id="punto-de-partida"');
  expect(detailHtml).toContain("Conocer la corriente antes de dimensionar la solución");
  expect(detailHtml).toContain("El estudio ubica quién genera el material");
  expect(detailHtml).toContain("el nivel de representatividad se acuerdan para cada municipio o región");
  expect(detailHtml).toContain("no sustituyen por sí solos la ingeniería ni garantizan la viabilidad");
  expect(detailHtml).not.toContain("service-diagnosis-method__questions");
  expect(detailHtml).not.toContain('class="service-diagnosis-start"');
  expect(detailHtml).not.toContain('class="service-diagnosis-start__inner"');
  expect(detailHtml).toContain('href="/proyectos/yarumal/">Ver la experiencia de Yarumal');
  expect(detailHtml).toContain('href="/servicios/pgirs-pmirs/">Planeación PGIRS o PMIRS');
  expect(detailHtml).toContain('href="/servicios/plantas-modulares/">Ingeniería y dimensionamiento de plantas');
  expect(detailHtml).not.toContain('class="service-detail-context"');
  expect(detailHtml).not.toContain('class="service-detail-practice"');
  expect(detailHtml).not.toContain('class="service-detail-offer"');
  expect(detailHtml).not.toContain('class="service-related-grid"');
  expect(detailHtml).toContain("96,4 %");
  expect(detailHtml).toContain("de pureza orgánica en recepción");
});

test("contact form defaults follow the visitor's scope instead of presuming a municipality", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const profileBlock = source.split("const profileOptions = [")[1]?.split("\n];")[0] ?? "";
  const declaredProfiles = new Set([...profileBlock.matchAll(/id: "([^"]+)"/g)].map((match) => match[1]));
  const usedProfiles = [...source.matchAll(/profile:\s*"([^"]+)"/g)].map((match) => match[1]);

  expect(usedProfiles.filter((profile) => !declaredProfiles.has(profile))).toEqual([]);
  expect(source).toContain('id: "clima"');
  expect(source).toContain('scaleLabel: "Fuentes, sedes o periodo"');
  expect(source).toContain('placeholderVol: "Ej.: energía, transporte y residuos; periodo del inventario"');
  expect(source).toContain('const [profile, setProfile] = useState<ContactProfile>("proyecto")');
  expect(source).toContain('type ContactProfile = typeof profileOptions[number]["id"]');
  expect(source).toContain('const diagnosticProfiles: Record<string, ContactProfile> = {');
  expect(source).toContain('profile === "territorio" || profile === "digital"');

  for (const [key, profile] of [
    ["diagnostico", "proyecto"],
    ["pgirs-pmirs", "territorio"],
    ["plantas-modulares", "territorio"],
    ["operacion-delegada", "territorio"],
    ["calcula-tu-huella", "clima"],
    ["clima-datos", "clima"],
    ["clima-carbono", "clima"],
    ["instituciones-alianzas", "proyecto"],
    ["aprovechamiento-productivo", "territorio"],
    ["valorizacion", "proyecto"],
    ["prefactibilidad", "proyecto"],
    ["gerencia-tecnica", "proyecto"],
    ["esg", "clima"],
    ["impacto", "proyecto"],
    ["solucion", "proyecto"],
    ["educacion-adopcion", "proyecto"],
    ["aseguramiento-tecnico", "territorio"],
    ["recoleccion-tratamiento", "territorio"],
    ["rehabilitacion-infraestructura", "territorio"],
    ["optimizacion-composteras", "territorio"],
    ["estructuracion-financiera", "proyecto"],
  ]) {
    expect(source).toMatch(new RegExp(`"${key}": \\{[^\\n]+profile: "${profile}"`));
  }

  expect(source).toMatch(/const servicesContactContext = \{[^}]+profile: "proyecto"/s);
  expect(source).toMatch(/const microrrutasContactContext = \{[^}]+profile: "territorio"/s);
  expect(source).toMatch(/"pgirs-municipal": \{[^\n]+profile: "esp"/);
  expect(source).toMatch(/"preparacion-sui": \{[^\n]+profile: "esp"/);
  expect(source).toMatch(/"agroindustria": \{[^\n]+profile: "agroindustrial"/);
  expect(source).toMatch(/"idi-agroindustrial": \{[^\n]+profile: "agroindustrial"/);
  expect(source).toMatch(/"desarrollo-productos-derivados": \{[^\n]+profile: "agroindustrial"/);
});

test("project case contact links preserve the distinct Yarumal and Támesis audiences", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src", "app", "proyectos", "page.tsx"), "utf8");

  expect(page).toContain('href="/contacto/?interes=solucion&perfil=municipio&diagnostico=Adaptar%20la%20experiencia%20de%20Yarumal&prioridad=Ruta%20selectiva%2C%20recepci%C3%B3n%20y%20tratamiento%20por%20lote"');
  expect(page).toContain("Conversar sobre Yarumal · Municipio / ESP");
  expect(page).toContain('href="/contacto/?interes=solucion&perfil=agroindustria&diagnostico=Evaluar%20una%20ruta%20como%20la%20de%20T%C3%A1mesis&prioridad=Biomasa%2C%20infraestructura%20existente%20y%20alternativas%20de%20aprovechamiento"');
  expect(page).toContain("Conversar sobre Támesis · Agroindustria");
  expect(page).not.toContain("perfil=municipio&diagnostico=Conversar%20sobre%20un%20caso%20territorial");
});

test("every contact CTA context used by the site resolves to a form definition", () => {
  const srcRoot = path.join(process.cwd(), "src");
  const sourceFiles = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
  const contactSource = fs.readFileSync(path.join(srcRoot, "components", "interactive-contact-form.tsx"), "utf8");
  const contextBlock = contactSource.split("const contactContexts = {")[1]?.split("} as const;")[0] ?? "";
  const contexts = new Set([...contextBlock.matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]));
  const referenced = new Set<string>();

  for (const file of sourceFiles(srcRoot)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/(?:interes|servicio)=([a-z0-9-]+)/g)) referenced.add(match[1]);
  }

  const missing = [...referenced].filter((key) => !contexts.has(key)).sort();
  expect(missing, "literal contact links should have a tailored form context").toEqual([]);
  for (const service of services) expect(contexts.has(service.slug), `${service.slug} needs a form context`).toBe(true);
  for (const tool of digitalTools) expect(contexts.has(tool.implementationInterest), `${tool.name} needs an access context`).toBe(true);
});

test("Wondergreen assistance CTAs describe the specific next step", () => {
  const read = (route: string) => fs.readFileSync(path.join(process.cwd(), "out", route, "index.html"), "utf8").replaceAll("&amp;", "&");
  const wondergreen = read("wondergreen");
  const home = read("wondergreen/hogar");

  expect(wondergreen).toContain('href="/servicios/programas-wondergreen/">Conocer el acompañamiento agronómico');
  expect(wondergreen).toContain("Comprar en Croper");
  expect(wondergreen).not.toContain("Hablar con el equipo</a>");
  expect(home).toContain('href="/contacto/?interes=wondergreen-hogar">Pedir orientación para mis plantas →');
  expect(home).not.toContain("Hablar con el equipo");
});

test("Back 2 Green presents the digital tool separately from climate consulting", () => {
  const toolPage = fs.readFileSync(path.join(process.cwd(), "out", "huella", "index.html"), "utf8").replaceAll("&amp;", "&");
  const huellaRuntime = digitalTools.find(({ implementationInterest }) => implementationInterest === "calcula-tu-huella")?.runtimeHref ?? "";
  expect(toolPage).toContain('href="/contacto/?servicio=clima-carbono"');
  expect(toolPage).toContain("Tu inventario GEI.");
  expect(toolPage).toContain("Reúne consumos, procesos y soportes por periodo.");
  expect(toolPage).toContain("la empresa carga lo que tiene, identifica los pendientes");
  expect(toolPage).toContain("Precios promocionales para Negocios Verdes de Corantioquia.");
  expect(toolPage).toContain("$450.000");
  expect(toolPage).toContain("$990.000");
  expect(toolPage).toContain("$2.490.000");
  expect(toolPage).toContain("4 horas de acompañamiento profesional");
  expect(toolPage).toContain("10 horas de acompañamiento profesional");
  expect(toolPage).toContain("Alcance 3 priorizado");
  expect(toolPage).toContain("Plan de reducción de emisiones");
  expect(toolPage).toContain("COP / año");
  expect(toolPage).not.toContain("COP / mes");
  expect(toolPage).not.toContain("$390.000");
  expect(toolPage).not.toContain("$3.900.000");
  expect(toolPage).not.toContain("$9.900.000");
  expect(toolPage).not.toContain("$24.900.000");
  const planCards = [...toolPage.matchAll(/<article\b[\s\S]*?<\/article>/g)]
    .map(([card]) => card)
    .filter((card) => ["Huella Esencial", "Huella Empresarial", "Gestión Corporativa"].some((name) => card.includes(`<h3>${name}</h3>`)));
  const planCard = (name: string) => planCards.find((card) => card.includes(`<h3>${name}</h3>`)) ?? "";
  expect(planCard("Huella Esencial")).toContain("$450.000");
  expect(planCard("Huella Esencial")).toContain("4 horas de acompañamiento profesional");
  expect(planCard("Huella Esencial")).toContain("Alcances 1 y 2");
  expect(planCard("Huella Empresarial")).toContain("$990.000");
  expect(planCard("Huella Empresarial")).toContain("Alcance 3 priorizado");
  expect(planCard("Huella Empresarial")).toContain("10 horas de acompañamiento profesional");
  expect(planCard("Gestión Corporativa")).toContain("$2.490.000");
  expect(planCard("Gestión Corporativa")).toContain("10 horas de acompañamiento profesional");
  expect(planCard("Gestión Corporativa")).toContain("Alcances 1, 2 y 3");
  expect(planCard("Gestión Corporativa")).toContain("Plan de reducción de emisiones");
  expect(planCard("Gestión Corporativa")).not.toContain("Alcance 3 avanzado");
  expect(planCard("Gestión Corporativa")).not.toContain("Portal de revisión");
  for (const [name, card] of [["Huella Esencial", planCard("Huella Esencial")], ["Huella Empresarial", planCard("Huella Empresarial")], ["Gestión Corporativa", planCard("Gestión Corporativa")]]) {
    expect(card).toContain("COP / año");
    expect(card).toContain(`href="/contacto/?interes=calcula-tu-huella&plan=${encodeURIComponent(name)}"`);
  }
  expect(toolPage).toContain("Un método documentado. Información organizada para revisar los requerimientos aplicables.");
  expect(toolPage).toContain("La empresa confirma su obligación y entrega el reporte ante la autoridad cuando aplique");
  expect(toolPage).toContain("ALCANCE 1");
  expect(toolPage).toContain("ALCANCE 2");
  expect(toolPage).toContain("ALCANCE 3");
  expect(toolPage).toContain('href="https://www.cancilleria.gov.co/sites/default/files/Normograma/docs/ley_2169_2021.htm"');
  expect(toolPage).toContain('href="https://ghgprotocol.org/corporate-standard"');
  expect(toolPage).toContain('href="https://www.minambiente.gov.co/consulta/por-la-cual-se-reglamenta-el-reporte-obligatorio-de-emisiones-de-gases-de-efecto-invernadero-roe-se-adoptan-el-protocolo-de-cuantificacion-y-reporte-de-emisiones-del-roe-la-guia-tecnica-de-la-plataforma-roe-y-se-dictan-otras-disposiciones-d/"');
  expect(toolPage).not.toContain("Cualquier acceso a un entorno de trabajo se confirma por separado.");
  expect(toolPage).not.toContain("ToolAccessRail");
  expect(toolPage).not.toContain("carbon-v4-legend");
  expect(toolPage).not.toContain('href="#calculadora"');
  expect(toolPage.match(/href="\/contacto\/\?servicio=clima-carbono"/g)).toHaveLength(1);
  const heroActions = toolPage.match(/<div class="button-row carbon-v4-hero__actions">([\s\S]*?)<\/div>/)?.[1] ?? "";
  expect([...heroActions.matchAll(/<a\b/g)]).toHaveLength(3);
  if (huellaRuntime && !isLocalRuntime(huellaRuntime)) {
    expect(heroActions).toContain(`href="${huellaRuntime}/login"`);
    expect(heroActions).toContain("Entrar a la plataforma");
  } else if (huellaRuntime) {
    expect(heroActions).toContain('href="#plataforma">Ver cómo funciona');
  } else {
    expect(heroActions).toContain('href="/contacto/?interes=calcula-tu-huella">Conversar sobre mi inventario');
  }
  expect(heroActions).toContain('href="#punto-de-partida">Elegir mi punto de partida');
  expect(heroActions).toContain('href="#planes">Conocer planes y precios');
  expect(heroActions).not.toContain("servicio=clima-carbono");
  expect(toolPage).toContain('href="/contacto/?servicio=clima-carbono">Hablar con un especialista');
  expect(toolPage.indexOf("Tu inventario GEI.")).toBeLessThan(toolPage.indexOf("Empieza por lo que tu empresa necesita resolver."));
  expect([...toolPage.matchAll(/<a\b[^>]*href="\/contacto\/\?interes=calcula-tu-huella&plan=/g)]).toHaveLength(3);
});

test("service families use specific visuals with useful customer-facing captions", () => {
  const indexHtml = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "index.html"), "utf8");
  const assets = [
    "pmirs-large-generators-editorial.jpg",
    "motocarguero-verde-operacion-real.webp",
    "plant-engineering-concept-v1.webp",
    "operation-follow-up-concept-v1.jpg",
    "digital-tools-field-v1.jpg",
    "organic-valorization-concept-v1.jpg",
    "plant-evidence-05.webp",
  ];
  for (const asset of assets) expect(indexHtml).toContain(asset);
  for (const caption of [
    "Ordenar corrientes y responsables permite definir acciones de PGIRS y PMIRS.",
    "El recorrido, la carga y la recepción se evalúan como partes de una misma operación.",
    "La imagen muestra una configuración propuesta; las fases y tecnologías se definen según la corriente, el predio y la operación prevista.",
    "Observar variables del proceso ayuda a orientar ajustes de operación.",
    "Los registros de operación ayudan a relacionar lo que ocurre en planta con decisiones técnicas.",
    "Las alternativas se estudian desde la biomasa, el proceso y el uso previsto.",
  ]) expect(indexHtml).toContain(caption);
  expect(indexHtml).toContain('alt="Representación de una configuración propuesta de planta regional, con áreas techadas, zonas de recepción y tanques de proceso."');
  expect(indexHtml).toContain("Compostaje en hileras bajo cubierta en la planta de Yarumal.");
  expect(indexHtml).not.toContain("Escena editorial");
  expect(indexHtml).not.toContain("Ilustración conceptual;");
  expect(indexHtml).not.toContain("no documenta");
  expect(indexHtml).not.toContain("plant-evidence-02.webp");
  expect(indexHtml).not.toContain("access-governance-map.svg");
  expect(indexHtml).not.toContain("Referencia visual del motocarguero sobre base Ceronte con contenedor verde Greenatics; no documenta una unidad fabricada u homologada.");
  expect(indexHtml).toContain("Diseñamos la ruta desde los generadores hasta la recepción y evaluamos si esta configuración vehicular responde a las condiciones del territorio.");
  expect(indexHtml).not.toContain("Greenatics y Auteco Mobility desarrollaron una configuración de motocarguero");
  expect(indexHtml).not.toContain("recepcion-organicos.jpg");
  expect(indexHtml).not.toContain("residuos orgánicos separados que ingresan a la ruta de tratamiento de Támesis");
  expect(indexHtml.match(/class="gt-service-offer__visual(?: gt-service-offer__visual--diagram)?"/g)).toHaveLength(6);
  expect(indexHtml).not.toContain('class="gt-service-card__media');
});

test("service index uses a readable contextual photo instead of the small governance diagram", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "page.tsx"), "utf8");
  expect(source).toContain('Datos: { src: "/tools/digital-tools-field-v1.jpg"');
  expect(source).toContain("Dos profesionales revisan información en una tableta");
  expect(source).toContain("Los registros de operación ayudan a relacionar lo que ocurre en planta con decisiones técnicas.");
  expect(source).not.toContain('Datos: { src: "/tools/access-governance-map.svg"');
});

test("Wondergreen agronomic accompaniment is distinct from biomass valorization in the service index", () => {
  const indexHtml = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "index.html"), "utf8").replaceAll("&amp;", "&");
  const valorization = indexHtml.match(/<section class="gt-service-category"[^>]*id="valorizacion"[\s\S]*?<\/section>/)?.[0] ?? "";
  const agronomy = indexHtml.match(/<section class="gt-service-agronomy"[\s\S]*?<\/section>/)?.[0] ?? "";

  expect(valorization).toContain("Aprovechamiento Productivo y Bioeconomía");
  expect(valorization).not.toContain("Programas Agronómicos Wondergreen");
  expect(agronomy).toContain('id="acompanamiento-agronomico"');
  expect(agronomy).toContain("Programas Agronómicos Wondergreen");
  expect(agronomy).toContain('src="/products/wondergreen-program-multicrop-context-v1.jpg"');
  expect(agronomy).toContain("La estrategia nutricional se plantea según el cultivo, el lote y la etapa.");
  expect(agronomy).toContain('href="/servicios/programas-wondergreen/">Conocer el acompañamiento agronómico');
  expect(agronomy).toContain('href="/wondergreen/cultivos/">Explorar programas por cultivo');
  expect(agronomy).toContain('href="/wondergreen/#productos">Explorar productos Wondergreen');
  expect(agronomy).toContain("programas de nutrición por cultivo y etapa");
  expect(agronomy).toContain("fertilizantes organominerales ocluidos de liberación gradual");
  expect(agronomy).toContain("las metas de huella o carbono requieren línea base y medición");
});

test("climate and case calls to action lead to the capability they describe", () => {
  const read = (route: string) => fs.readFileSync(path.join(process.cwd(), "out", route, "index.html"), "utf8").replaceAll("&amp;", "&");
  const home = read("");
  const impact = read("impacto");
  const tamesis = read("proyectos/tamesis");

  expect(home).toContain("¿Qué reto ambiental necesitas resolver?");
  expect(home).toContain('href="/diagnostico/"');
  expect(home).toContain('href="/contacto/?interes=soluciones"');
  expect(home).toContain("Escenario preliminar de CO₂e:");
  expect(home).toContain("no una reducción medida ni verificada.");
  expect(home).toContain('href="/impacto/"');
  expect(home).not.toContain('href="/contacto/?servicio=clima-carbono&perfil=clima"');
  expect(home).not.toContain("se actualiza con cada corte de operación");
  expect(impact).toContain("proyecta generación y meta de desvío; no calcula emisiones ni usa distancias");
  expect(impact).not.toContain("explorar volumen, desvío y distancia");
  expect(impact).toContain('href="/contacto/?servicio=clima-carbono&perfil=clima&diagnostico=');
  expect(tamesis).toContain('href="/contacto/?servicio=clima-carbono&perfil=clima&diagnostico=');
  expect(tamesis).toContain("Evaluar el escenario de GEI");
  expect(tamesis).not.toContain('href="/huella/#calculadora"');

  const scenarioSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "huella-scenario-explorer.tsx"), "utf8");
  const diagnosticRoutes = fs.readFileSync(path.join(process.cwd(), "src", "data", "diagnostic-routes.ts"), "utf8");
  expect(scenarioSource).toContain('buildToolContactHref("estimador-organicos", "territorio", "Flujo de materia orgánica")');
  expect(diagnosticRoutes).toMatch(/"empresa:trazabilidad":\s*\{[\s\S]*?contactInterest: "clima-carbono",\s*contactProfile: "clima"/);
});

test("published climate contact links do not override the matching data profile", () => {
  const outputRoot = path.join(process.cwd(), "out");
  const htmlFiles = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(entryPath);
    return entry.name.endsWith(".html") ? [entryPath] : [];
  });
  const climateIntents = new Set(["clima-carbono", "clima-datos", "calcula-tu-huella", "esg"]);
  const incompatibleLinks: string[] = [];
  let inspectedLinks = 0;

  for (const file of htmlFiles(outputRoot)) {
    const html = fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith("/contacto/?")) continue;
      const url = new URL(href, "https://greenatics.com.co");
      const intent = url.searchParams.get("servicio") || url.searchParams.get("interes") || "";
      if (!climateIntents.has(intent)) continue;
      inspectedLinks += 1;
      const profile = url.searchParams.get("perfil");
      if (profile && profile !== "clima") incompatibleLinks.push(`${path.relative(outputRoot, file)}: ${href}`);
    }
  }

  expect(inspectedLinks, "the export should include climate contact routes").toBeGreaterThan(0);
  expect(incompatibleLinks).toEqual([]);
});

test("contact copy and the Huella landing distinguish inventory from the public organic-flow estimator", () => {
  const contact = fs.readFileSync(path.join(process.cwd(), "out", "contacto", "index.html"), "utf8");
  const huella = fs.readFileSync(path.join(process.cwd(), "out", "huella", "index.html"), "utf8");
  const impact = fs.readFileSync(path.join(process.cwd(), "out", "impacto", "index.html"), "utf8");
  const impactSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "impacto", "page.tsx"), "utf8");
  const estimatorRoute = fs.readFileSync(path.join(process.cwd(), "src", "app", "herramientas", "estimador-organicos", "page.tsx"), "utf8");
  const estimatorSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "huella-scenario-explorer.tsx"), "utf8");
  expect(contact).toContain("Inventario GEI autogestionado con acompañamiento");
  expect(contact).toContain("Proyección de flujo y desvío; no calcula emisiones");
  expect(contact).not.toContain("Calculadora de huella y metano ESG");
  expect(huella).toContain('name="description" content="Organiza los datos y evidencias de emisiones');
  expect(huella).toContain("GHG Protocol");
  expect(huella).toContain("La empresa confirma su obligación y entrega el reporte ante la autoridad cuando aplique");
  expect(huella).not.toContain("Ese estimador proyecta toneladas y metas de desvío; no calcula la huella corporativa ni las emisiones evitadas.");
  expect(impact).toContain("Prueba una hipótesis. Luego llévala a una línea base.");
  expect(impactSource).not.toContain("<HuellaScenarioExplorer />");
  expect(impactSource).toContain('href="/herramientas/estimador-organicos/"');
  expect(estimatorRoute).toContain("<HuellaScenarioExplorer />");
  expect(estimatorRoute).toContain("Dimensiona el flujo. Después, evalúa su impacto.");
  expect(estimatorSource).toContain('id="calculadora-organicos"');
  expect(estimatorSource).toContain("no representa una medición ni una reducción de GEI atribuible a un proyecto");
  expect(huella).not.toContain("Explora escenarios públicos y conoce el recorrido");
});

test("contact landing promises the WhatsApp handoff without implying direct booking", () => {
  const contact = fs.readFileSync(path.join(process.cwd(), "out", "contacto", "index.html"), "utf8");
  expect(contact).toContain("Contacto Greenatics");
  expect(contact).toContain("productos, servicios o herramientas Greenatics");
  expect(contact).toContain("Cuéntanos qué");
  expect(contact).toContain("Revisa el resumen de tu consulta antes de enviarlo por WhatsApp.");
  expect(contact).toContain("Si quieres explorar por tu cuenta");
  expect(contact).toContain("Entra directamente a una herramienta.");
  expect(contact).toContain('href="/herramientas/"');
  expect(contact).toContain('href="/huella/"');
  expect(contact).not.toContain("Simulador de descuento en renta del 25%");
  expect(contact).not.toContain("Agenda directamente una sesión técnica");
  expect(contact).not.toContain("Canal Directo de Ingeniería");
  expect(contact).not.toContain("Respuesta técnica");
  expect(contact).not.toContain("¿Prefieres simular antes de hablar?");
});

test("climate service links open the matching climate-data contact profile", async ({ page }) => {
  await page.goto("/contacto/?servicio=clima-carbono&perfil=clima", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Clima / datos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Municipio / ESP" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByLabel("Fuentes, sedes o periodo")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Preparar un inventario y un reporte climático");
});

test("GREENATICS OPS separates its public station from configuration support", async () => {
  const opsPage = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "greenatics-ops", "index.html"), "utf8").replaceAll("&amp;", "&");
  expect(opsPage).toContain('href="#muestra-ops">Explorar la muestra de OPS');
  expect(opsPage).toContain('id="muestra-ops"');
  expect(opsPage).toContain('href="/app/">Abrir muestra de OPS');
  expect(opsPage).toContain("La muestra pública usa datos ficticios");
  expect(opsPage).toContain("Del plan de trabajo al historial operativo, sin perder el hilo.");
  expect(opsPage).toContain("contrasta plan y ejecución");
  expect(opsPage).toContain("El tablero operativo se alimenta del flujo de captura");
  expect(opsPage).not.toContain('class="service-detail-practice"');
  expect(opsPage).not.toContain('class="service-detail-offer"');
  expect(opsPage).toContain('href="/contacto/?interes=greenatics-ops"');
  expect(opsPage).toContain('href="#configuracion-ops">Consultar configuración');
  expect(opsPage).toContain('id="configuracion-ops"');
  expect(opsPage).toContain("Consultar alcance y configuración");
});

test("high-risk service links hydrate the expected context in the contact form", async ({ page }) => {
  const cases = [
    ["pmirs-organizacional", "Organizar la gestión de residuos en cada operación"],
    ["microrrutas-motocarguero", "Diseñar una ruta alrededor de una solución desarrollada para el sector"],
    ["clima-carbono", "Preparar un inventario y un reporte climático"],
    ["preparacion-sui", "Preparar información y soportes para el SUI"],
    ["prefactibilidad", "Comparar alternativas antes de comprometer la inversión"],
    ["gerencia-tecnica", "Coordinar un proyecto desde el lado del propietario"],
    ["estructuracion-financiera", "Estructurar alternativas para decidir una inversión"],
    ["greenatics-ops", "Conversar sobre el alcance y la configuración de OPS"],
    ["recoleccion-tratamiento", "Coordinar la recolección y el tratamiento recurrentes"],
    ["regulatorio-residuos-esp", "Definir la ruta jurídica y regulatoria aplicable"],
    ["remuneracion-tratamiento", "Estructurar la base del servicio de tratamiento"],
    ["desarrollo-productos-derivados", "Desarrollar una ruta técnica para un producto de biomasa"],
    ["idi-agroindustrial", "Diseñar un piloto que permita decidir el siguiente paso"],
    ["rehabilitacion-infraestructura", "Evaluar la recuperación de una planta existente"],
    ["optimizacion-composteras", "Mejorar un proceso de compostaje en funcionamiento"],
    ["operacion-delegada", "Estabilizar una planta en funcionamiento"],
    ["aseguramiento-tecnico", "Revisar técnicamente una operación"],
  ] as const;

  for (const [service, title] of cases) {
    await page.goto(`/contacto/?servicio=${service}`);
    await expect(page.getByRole("status")).toContainText(title);
  }
});

test("S22 states the owner's engineering boundary and opens its contact context", async ({ page }) => {
  await page.goto("/servicios/#service-capabilities-title");
  const offer = page.locator(".gt-service-capabilities__services li").filter({
    has: page.getByRole("link", { name: "Gerencia técnica e ingeniería del propietario" }),
  });
  const action = offer.getByRole("link", { name: "Gerencia técnica e ingeniería del propietario" });

  await expect(offer).toHaveCount(1);
  await expect(offer).toContainText("Representamos técnicamente al propietario");
  await expect(offer).toContainText("El diseño de cada disciplina y la ejecución de obra permanecen bajo sus responsables y contratos.");
  await expect(action).toHaveAttribute("href", "/contacto/?servicio=gerencia-tecnica");

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(action).toBeVisible();
    const layoutWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(layoutWidth).toBeLessThanOrEqual(width);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  let reachedWithKeyboard = false;
  for (let tab = 0; tab < 80 && !reachedWithKeyboard; tab += 1) {
    await page.keyboard.press("Tab");
    reachedWithKeyboard = await action.evaluate((element) => element === document.activeElement);
  }
  expect(reachedWithKeyboard).toBe(true);
  await expect(action).toBeFocused();
  const visibleKeyboardFocus = await action.evaluate((element) => {
    const styles = getComputedStyle(element);
    return element.matches(":focus-visible") && styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
  });
  expect(visibleKeyboardFocus).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contacto\/\?servicio=gerencia-tecnica$/);
  await expect(page.getByRole("status")).toContainText("Coordinar un proyecto desde el lado del propietario");
  await expect(page.getByRole("status")).toContainText("no sustituimos los diseños de cada disciplina ni la ejecución de obra");
  await expect(page.locator("form")).toBeVisible();
});

test("every service CTA carries its service-specific context into the contact form", async () => {
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  for (const service of services) {
    expect(contactSource, `${service.slug} needs a matching contact context`).toMatch(new RegExp(`"${service.slug}":\\s*(?:\\{|[A-Za-z_$])`));
  }
  for (const capability of ["clima-carbono", "preparacion-sui", "idi-agroindustrial", "prefactibilidad", "gerencia-tecnica", "educacion-adopcion", "aseguramiento-tecnico", "recoleccion-tratamiento", "rehabilitacion-infraestructura", "optimizacion-composteras", "desarrollo-productos-derivados", "regulatorio-residuos-esp", "remuneracion-tratamiento", "estructuracion-financiera"]) {
    expect(contactSource, `${capability} needs a matching contact context`).toContain(`"${capability}": {`);
  }
  expect(contactSource).not.toContain("visita técnica a la Planta Yarumal");
  expect(contactSource).toContain("Evaluar la recuperación de una planta existente");
  expect(contactSource).toContain("La evaluación define el potencial de recuperación, las intervenciones recomendadas");
  expect(contactSource).toContain("La propuesta integra logística, trazabilidad de cargas y tratamiento en el destino acordado");
  expect(contactSource).toContain("El diseño de nuevas microrrutas y la configuración de GREENATICS OPS son componentes específicos");
  expect(contactSource).toContain("Este alcance optimiza el proceso en marcha; se diferencia de rehabilitar equipos o infraestructura y de asumir la operación diaria");
  expect(contactSource).toContain("operación integral, compartida o dirección técnica");
  expect(contactSource).toContain("El acompañamiento define alcance y línea base, revisa datos y factores de emisión");
  expect(contactSource).toContain("Back 2 Green organiza el inventario y sus soportes.");
  expect(contactSource).toContain('"estimador-organicos": {');
  expect(contactSource).toContain("La presentación oficial queda a cargo del prestador y del responsable designado");
  expect(contactSource).toContain("Revisamos obligaciones y soportes para proponer una ruta jurídica y regulatoria; la decisión final corresponde a la autoridad competente");
  expect(contactSource).toContain("Estructuramos la base técnica y documental para analizar la remuneración aplicable");
  expect(contactSource).toContain("Complementa la prefactibilidad; no garantiza financiación ni cierre financiero");
  expect(contactSource).toContain("Desde la ingeniería del propietario alineamos entregables e interfaces");
  expect(contactSource).toContain("sus permisos y cualquier configuración se confirman según el proyecto; la estación pública es una muestra");
  expect(contactSource).toMatch(/"aprovechamiento-productivo": \{[^\n]+profile: "territorio"/);
  expect(contactSource).toContain("un municipio o ESP, una empresa u organización, un gran generador o una agroindustria");
  expect(contactSource).not.toContain("Revisión independiente de una operación");
});

test("territorial services and digital tools use audience-appropriate contact profiles", async () => {
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const namedContext = (name: string) => {
    const start = contactSource.indexOf(`const ${name} = {`);
    const end = contactSource.indexOf("} satisfies ContactContext;", start);
    return start >= 0 && end > start ? contactSource.slice(start, end) : "";
  };
  const contextLine = (key: string) => contactSource.split("\n").find((line) => line.trimStart().startsWith(`"${key}":`)) || "";

  expect(namedContext("greenaticsRedContactContext")).toContain('profile: "territorio"');
  expect(namedContext("toolsContactContext")).toContain('profile: "digital"');
  for (const key of ["greenatics-ops", "greenatics-ops-recorrido", "operacion-digital"]) {
    expect(contextLine(key), `${key} should use the organization/platform profile`).toContain('profile: "digital"');
  }
  expect(contextLine("red")).toContain("greenaticsRedContactContext");
  expect(contextLine("herramientas")).toContain("toolsContactContext");
  expect(contextLine("plataformas")).toContain("toolsContactContext");
});

test("digital tool requests hydrate organization fields and RED requests territorial context", async ({ page }) => {
  for (const interest of ["greenatics-ops", "greenatics-ops-recorrido", "plataformas", "operacion-digital"]) {
    await page.goto(`/contacto/?interes=${interest}`);
    await expect(page.getByRole("button", { name: "Equipo / plataforma" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Organización o proyecto *")).toBeVisible();
    await expect(page.getByLabel("Sedes, usuarios o procesos")).toBeVisible();
  }
  await page.goto("/contacto/?interes=red");
  await expect(page.getByRole("button", { name: "Territorio / Organización" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Municipio, organización o gran generador *")).toBeVisible();
  await expect(page.getByLabel("Generadores, sedes o rutas")).toBeVisible();
});

test("operation detail explains client outcomes, modalities, and OPS traceability", async () => {
  const detailPath = path.join(process.cwd(), "out", "servicios", "operacion-delegada", "index.html");
  const html = fs.readFileSync(detailPath, "utf8");
  for (const term of ["Más continuidad y control para tu planta", "Operación integral", "Operación compartida", "Dirección técnica y transferencia", "Del material que llega al producto despachado: una operación bajo control.", "priorizar una corrección y revisar su efecto en el siguiente ciclo", "balance de masa", "La entrada debe alimentar el proceso con el material adecuado.", "El control cambia con la tecnología y la condición de la planta.", "El balance se cierra con producto terminado e inventario.", "GREENATICS OPS convierte cada turno en información para el siguiente", "compara lo planeado con lo realizado", "acción correctiva o una mejora", "el indicador acordado ayuda a valorar si la intervención produjo el cambio esperado", "la herramienta organiza el seguimiento, no corrige la planta por sí sola", "Verificar", "asignar responsable y fecha, adjuntar evidencia y revisar el cierre", "no transfiere por sí sola la operación física"]) {
    expect(html).toContain(term);
  }
});

test("operation process is presented as one connected narrative instead of three equal columns", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "[slug]", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");
  expect(page).toContain("La entrada debe alimentar el proceso con el material adecuado.");
  expect(page).toContain("El control cambia con la tecnología y la condición de la planta.");
  expect(page).toContain("El balance se cierra con producto terminado e inventario.");
  expect(styles).toMatch(/\.service-operation-work__areas\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  expect(styles).not.toMatch(/\.service-operation-work__areas\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
});

test("plant engineering route presents one phased decision path without repeating the generic ficha", async () => {
  const detailPath = path.join(process.cwd(), "out", "servicios", "plantas-modulares", "index.html");
  const html = fs.readFileSync(detailPath, "utf8");
  const normalizedHtml = html.toLocaleLowerCase("es");
  expect(html).toContain("/projects/concepts/plant-engineering-concept-v1.webp");
  expect(html).toContain('alt="Representación de una configuración propuesta de planta regional, con áreas techadas, zonas de recepción y tanques de proceso."');
  expect(normalizedHtml).toContain("la imagen muestra una configuración propuesta");
  expect(normalizedHtml).toContain("las fases y tecnologías se definen según la corriente, el predio y la operación prevista");
  expect(normalizedHtml).not.toContain("no documenta una planta construida");
  expect(html).not.toContain("/projects/tamesis/sistema-uasb.png");
  expect(html).toContain('class="service-plant-journey"');
  expect(html).toContain('class="service-plant-journey__entry"');
  expect(html).toContain('class="service-plant-journey__continuation"');
  expect(html).not.toContain("INGENIERÍA POR ETAPAS");
  expect(html).toContain('class="service-plant-start"');
  expect(html).not.toContain('class="service-detail-practice"');
  expect(html).not.toContain('class="service-detail-offer"');
  expect(html).not.toContain('class="service-related-grid"');
  expect(html).toContain("Información para orientar el alcance");
  expect(html).toContain("infraestructura, servicios y equipos existentes");
  expect(html).toContain('href="/servicios/operacion-delegada/">Definir quién operará la planta');
  expect(html).toContain('href="/servicios/aprovechamiento-productivo/">Evaluar las rutas de valorización');
  for (const term of ["Prefactibilidad", "Factibilidad e ingeniería", "Construcción y puesta en marcha", "rangos preliminares de inversión y operación", "permite decidir si vale la pena avanzar", "no sustituye un presupuesto definitivo", "cuando forman parte del alcance contratado", "el contrato define las disciplinas, el nivel de detalle y los entregables aplicables a la alternativa seleccionada", "la ingeniería puede incluir memorias, planos y cantidades", "los análisis de precios unitarios (apu) se incorporan si el alcance los contempla", "pruebas y arranque"]) {
    expect(normalizedHtml).toContain(term.toLocaleLowerCase("es"));
  }
});

test("S05 contractual scope stays readable without overflow across desktop, tablet and narrow mobile", async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/servicios/plantas-modulares/");
    const engineering = page.locator("#fases-del-proyecto article").nth(1);
    await expect(engineering).toContainText(/El contrato define las disciplinas/i);
    await expect(engineering).toContainText(/los análisis de precios unitarios \(APU\) se incorporan si el alcance los contempla/i);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("PGIRS and PMIRS have distinct scopes, decision owners and contact routes", async () => {
  const detailPath = path.join(process.cwd(), "out", "servicios", "pgirs-pmirs", "index.html");
  const html = fs.readFileSync(detailPath, "utf8").replaceAll("&amp;", "&");
  const serviceSource = fs.readFileSync(path.join(process.cwd(), "src", "data", "services.ts"), "utf8");
  expect(serviceSource).toContain("la adopción formal del PGIRS corresponde a la autoridad territorial; el alcance del PMIRS depende de la actividad, operación, jurisdicción y obligaciones aplicables");
  expect(serviceSource).not.toContain("su adopción responde a autoridades y obligaciones diferentes");
  expect(html).toContain('class="service-planning-work__narrative"');
  expect(html).not.toContain('class="service-planning-work__areas"');
  for (const step of ["Leemos la situación actual.", "Priorizamos acciones posibles.", "Preparamos el seguimiento."]) {
    expect(html).toContain(step);
  }
  expect(html).toContain("pgirs-pmirs-planning-editorial-v1.jpg");
  expect(html).toContain("La planeación conecta las necesidades del territorio y de cada organización");
  expect(html).not.toContain("pgirs-pmirs-scales.svg");
  expect(html).not.toContain('class="service-detail-visual__diagram"');
  expect(html).toContain('class="service-detail-visual__media"');
  expect(html).not.toContain("/projects/yarumal/aerial-01.webp");
  for (const term of ["PGIRS · municipio o región", "PMIRS · organizaciones y grandes generadores", "unidades residenciales", "centros comerciales", "la adopción corresponde a la autoridad competente según la figura territorial aplicable", "no son el mismo instrumento", "/contacto/?servicio=pgirs-municipal", "/contacto/?servicio=pmirs-organizacional"]) {
    expect(html).toContain(term);
  }
  expect(html).toContain("la adopción formal del PGIRS corresponde a la autoridad territorial; el alcance del PMIRS depende de la actividad, operación, jurisdicción y obligaciones aplicables");
  expect(html).toContain("que necesitan ordenar su manejo de residuos");
  expect(html).not.toContain("Aplica a unidades y conjuntos residenciales");
  expect(html).toContain('href="/contacto/?servicio=pgirs-municipal&perfil=municipio"');
  expect(html).toContain('href="/contacto/?servicio=pmirs-organizacional&perfil=empresa"');
  expect(html).toContain('class="service-pgirs-transition"');
  expect(html).toContain('id="service-pgirs-transition-title"');
  expect(fs.readFileSync(path.join(process.cwd(), "src", "app", "routes-v3.css"), "utf8")).toMatch(/\.service-detail-context__grid\.service-planning-types\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  expect(html).toContain("Resolución 0555 de 2026");
  expect(html).toContain("derogó la 754 de 2014");
  expect(html).not.toContain("derogó la 0754 de 2014");
  expect(html).toContain("12 de agosto de 2026");
  expect(html).toContain("actualizaciones iniciadas después deben aplicar la nueva metodología");
  expect(html).toContain('href="https://normas.cra.gov.co/Gestor/docs/resolucion_minviviendact_0555_2026.htm"');
  const municipalities = fs.readFileSync(path.join(process.cwd(), "out", "municipios", "index.html"), "utf8");
  const companies = fs.readFileSync(path.join(process.cwd(), "out", "empresas", "index.html"), "utf8");
  expect(municipalities).toContain("/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal");
  expect(companies).toContain("/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional");
  for (const audience of [
    "Unidades residenciales",
    "Conjuntos y copropiedades",
    "Centros comerciales y plazas",
    "Instituciones y campus",
    "Industrias y otros grandes generadores",
  ]) expect(companies.toLocaleLowerCase("es")).toContain(audience.toLocaleLowerCase("es"));
  const glossary = fs.readFileSync(path.join(process.cwd(), "out", "biblioteca", "glosario", "index.html"), "utf8");
  expect(glossary).toContain("unidad o conjunto residencial");
  expect(glossary).toContain("Plan de Manejo Integral de Residuos Sólidos");
  expect(glossary).toContain("no certifica por sí sola resultados ambientales");
  expect(glossary).toContain("la Resolución 0555 de 2026");
  expect(glossary).toContain("derogó la Resolución 754 de 2014");
  expect(glossary).toContain("no todas las organizaciones comparten automáticamente las mismas obligaciones");
  expect(glossary).not.toContain("Res. 0754/2014");
  expect(glossary).not.toContain("certificar desvío y vertimiento cero");
});

test("Companies translates PMIRS into site-level routines without exposing internal image notes", () => {
  const companies = fs.readFileSync(path.join(process.cwd(), "out", "empresas", "index.html"), "utf8");
  for (const detail of [
    "Una gestión que se sostiene cuando cambia el turno.",
    "En el punto de generación",
    "Entre áreas y gestores",
    "En el seguimiento",
    "Ver actividades y alcance del PMIRS",
    "/services/pmirs-large-generators-editorial.jpg",
    "Una rutina visible para todas las áreas.",
  ]) expect(companies).toContain(detail);
  expect(companies).not.toContain("Escena editorial");
  expect(companies).not.toContain("Escena ilustrativa");
  expect(companies).not.toContain("imagen ilustrativa generada");
  expect(companies).not.toContain("no documenta una planta Greenatics");
  expect(companies).toContain("la muestra no equivale a un entorno propio habilitado.");
  expect(companies).not.toContain("Cuatro decisiones para llevar el PMIRS a la operación");
});

test("service audience labels include organizations beyond industrial companies", async () => {
  expect(serviceAudienceLabels.Empresas).toBe("Organizaciones y grandes generadores");
  expect(serviceAudienceLabels.Ambos).toBe("Municipios, ESP y organizaciones");
});

test("service detail audiences match each offer in visible copy and structured data", () => {
  const expectedAudiences = {
    "diagnostico-residuos": "Territorios, organizaciones y agroindustria",
    "pgirs-pmirs": "Territorios, organizaciones y grandes generadores",
    "microrrutas-motocarguero": "Municipios, ESP y organizaciones",
    "plantas-modulares": "Municipios, ESP, empresas y agroindustria",
    "operacion-delegada": "Municipios, ESP, empresas y agroindustria",
    "greenatics-ops": "Operadores de planta y organizaciones",
    "aprovechamiento-productivo": "Territorios, empresas y agroindustria",
    "programas-wondergreen": "Productores, asociaciones y agroindustria",
  } as const;

  for (const service of services) {
    const expected = expectedAudiences[service.slug];
    const html = fs.readFileSync(path.join(process.cwd(), "out", "servicios", service.slug, "index.html"), "utf8");
    expect(service.audienceLabel).toBe(expected);
    expect(html.replaceAll("<!-- -->", "")).toContain(`${service.categoryLabel} · ${expected}`);
    expect(html).toContain(`"audienceType":"${expected}"`);
  }
});

test("Wondergreen agronomic service guides visitors from crop evidence to an evaluable program", () => {
  const service = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "programas-wondergreen", "index.html"), "utf8");
  const catalogue = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "index.html"), "utf8");

  expect(service).toContain("Del potencial de tu cultivo a un programa de nutrición que puedas evaluar en campo.");
  expect(service).toContain("Por eso, el programa parte de la meta del productor y de la evidencia disponible");
  expect(service).toContain("Un mismo producto no responde igual en todos los cultivos ni en todos los lotes.");
  expect(service).toContain("fertilizantes sólidos organominerales ocluidos de liberación gradual");
  expect(service).toContain("La línea reúne 2GROW 100-20-20 y 200-0-0");
  expect(service).toContain("2GROW 200-0-0 tiene la mayor concentración de nitrógeno de la línea");
  expect(service).toContain("Primero leemos el cultivo y la meta");
  expect(service).toContain("Con esa base diseñamos una estrategia nutricional");
  expect(service).toContain("Si se acuerda un ensayo, definimos la comparación, las variables y las fechas");
  expect(service).toContain('class="service-program-story"');
  expect(service).not.toContain('class="service-program-steps"');
  expect(service).toContain("no presupone sensores ni dosificación automatizada");
  expect(service).toContain("Reducir costos es una posibilidad que se evalúa, no un resultado garantizado.");
  expect(service).toContain("Cada lote pide una lectura propia. El programa también.");
  expect(service).toContain("Si también se quiere evaluar carbono del suelo o huella, definimos línea base, límites, método e indicadores.");
  expect(service).toContain("línea base, límites, método e indicadores");
  expect(service).toContain("no se atribuye al fertilizante por sí solo.");
  expect(service).toContain("Cada referencia se selecciona y usa según su ficha y etiqueta vigentes.");
  expect(service).toContain("La lectura cambia con cada cultivo");
  expect(service).toContain("La matriz explica el diseño. El lote confirma la respuesta.");
  expect(service).toContain("La liberación o interacción gradual es un objetivo de diseño");
  expect(service).toContain("la oclusión no demuestra una respuesta específica ni “cero pérdidas”.");
  expect(service).toContain("Cuatro fórmulas del portafolio sólido");
  expect(service).toContain("La proporción visual repite los valores N-P-K publicados; no es una dosis ni una recomendación de uso.");
  expect(service).toContain("Si el alcance incluye una comparación, acordamos área, periodo y manejo de partida");
  expect(service).toContain("registramos insumos, costos y una variable productiva pertinente");
  expect(service).not.toMatch(/(?:ahorra|reduce|disminuye)\s+\d+(?:[.,]\d+)?\s*%/i);
  expect(service).toContain("Reducir costos es una posibilidad que se evalúa, no un resultado garantizado.");
  expect(service).toContain("A quién acompaña el programa");
  expect(service).toContain("Una estrategia pensada para el cultivo y el equipo que la llevará a campo.");
  expect(service).not.toContain("Actividades del servicio");
  expect(service).not.toContain("Precisar cultivo, variedad, lote, etapa, objetivo productivo y prácticas actuales");
  expect(service).toContain('src="/products/wondergreen-program-multicrop-context-v1.jpg"');
  const manualCrops = crops.filter((crop) => crop.pdfFile && crop.technicalManualFile);
  expect(manualCrops).toHaveLength(3);
  for (const crop of manualCrops) {
    expect(service).toContain(`href="/wondergreen/cultivos/${crop.slug}/"`);
    expect(service).toContain(`src="${crop.coverImage}"`);
    const cropHtml = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "cultivos", crop.slug, "index.html"), "utf8");
    expect(cropHtml).toContain(`href="${crop.pdfFile}"`);
    expect(cropHtml).toContain(`href="${crop.technicalManualFile}"`);
    expect(fs.existsSync(path.join(process.cwd(), "public", crop.pdfFile!.replace(/^\//, "")))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "public", crop.technicalManualFile!.replace(/^\//, "")))).toBe(true);
  }
  const solidChartProducts = products.filter((product) => ["2grow", "2balance", "2bloom", "2fruit"].includes(product.slug));
  expect(solidChartProducts).toHaveLength(4);
  for (const product of solidChartProducts) {
    expect(service).toContain(product.family);
    expect(service).toContain((product.formula ?? "").split("-").join(" : "));
    expect((product.formula ?? "").split("-")).toHaveLength(3);
  }
  expect(service).toContain('src="/products/wondergreen-catalog-editorial-v1.webp"');
  expect(service).toMatch(/fertilizantes sólidos organominerales/i);
  expect(service).toContain("2GROW 100-20-20 y 200-0-0, 2BALANCE 70-70-70, 2BLOOM 30-80-30 y 2FRUIT 30-30-80");
  expect(service).toContain("Su presentación y la de 2BLOOM se consultan por separado");
  expect(service).toContain("extractos de ajo + ají y neem, además de Beauveria, Metarhizium, Bacillus subtilis y Trichoderma");
  expect(service).toContain("sin atribuir efectos específicos que no estén respaldados");
  expect(service).toContain('href="#programa-agronomico">Ver diseño del programa');
  expect(service).toContain('href="/wondergreen/cultivos/">Ver programas por cultivo');
  const renderedService = service.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const hero = renderedService.match(/<section class="[^\"]*\bservice-detail-hero\b[^\"]*"[\s\S]*?<\/section>/)?.[0] ?? "";
  expect(hero).toContain('href="#programa-agronomico">Ver diseño del programa');
  expect(hero).not.toContain("/contacto/");
  expect((renderedService.match(/href="\/contacto\/\?servicio=programas-wondergreen"/g) ?? []).length).toBe(1);
  expect(renderedService).toContain("Conversemos sobre tu cultivo, la meta productiva y la información del lote.");
  expect(service).toContain('href="/wondergreen/#productos">Explorar productos y fichas');
  expect(service).toContain("Si se acuerda un ensayo, definimos la comparación, las variables y las fechas para decidir qué ajustar o repetir.");
  expect(service).toContain("Reducir costos es una posibilidad que se evalúa, no un resultado garantizado.");
  const decisionSection = service.match(/<section class="[^"]*service-program-start[^"]*"[\s\S]*?<\/section>/)?.[0] ?? "";
  expect(decisionSection).toContain('id="punto-de-partida"');
  expect(decisionSection).toContain("Podemos empezar con la información que ya tienes");
  expect(decisionSection).toContain("Los análisis de suelo o agua, registros de manejo, síntomas, costos, fechas, fotografías y observaciones amplían la lectura del lote.");
  expect(decisionSection).toContain("acordamos qué información conviene completar primero");
  expect(decisionSection).not.toContain("condiciones de uso verificadas en la ficha y etiqueta vigentes");
  expect(decisionSection).not.toContain("Si el alcance incluye un ensayo");
  expect(decisionSection).not.toMatch(/<(?:ul|ol)\b/i);
  expect(decisionSection).not.toContain("Entregables");
  expect(decisionSection).not.toContain("Punto de partida");
  expect(catalogue).toContain('id="productos"');
  expect(catalogue).toContain("Comprar en Croper");
});

test("Wondergreen program page keeps its crop-program CTA usable across key viewport widths", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/servicios/programas-wondergreen/");
  const widths = [1440, 1024, 768, 390, 320];

  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 980 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      overflow: Array.from(document.querySelectorAll("body *"))
        .map((element) => ({
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${typeof element.className === "string" && element.className ? `.${element.className.trim().replace(/\s+/g, ".")}` : ""}`,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
          parent: element.parentElement?.className,
          parentRight: Math.round(element.parentElement?.getBoundingClientRect().right ?? 0),
        }))
        .filter((element) => element.right > document.documentElement.clientWidth + 1)
        .slice(0, 6),
    }));
    expect(dimensions.content, `page should not overflow at ${width}px: ${JSON.stringify(dimensions.overflow)}`).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.getByRole("heading", { name: "Cada lote pide una lectura propia. El programa también." })).toBeVisible();
    const story = page.locator("#programa-agronomico .service-program-story");
    await expect(story).toBeVisible();
    await expect(story).toContainText("Primero leemos el cultivo y la meta");
    await expect(story).toContainText("Con esa base diseñamos una estrategia nutricional");
    await expect(story).toContainText("Si se acuerda un ensayo, definimos la comparación");
    await expect(page.locator("#programa-agronomico .service-program-steps")).toHaveCount(0);
    await expect(page.getByText("Primero entendemos la decisión que quieres tomar", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Arte editorial conceptual; no documenta una finca, ensayo, aplicación ni resultado de Wondergreen.", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Diseñar un programa para mi cultivo" }).first()).toBeVisible();
    const decisionSection = page.locator("#punto-de-partida");
    await expect(decisionSection).toHaveCount(1);
    await expect(decisionSection.getByRole("heading", { level: 2 })).toHaveText("Podemos empezar con la información que ya tienes");
    await expect(decisionSection).toContainText("no necesitas reunirlo todo");
    await expect(decisionSection.locator("ul, ol")).toHaveCount(0);
    await expect(decisionSection).toContainText("meta productiva o el objetivo relacionado con suelo o carbono");
    await expect(decisionSection).not.toContainText("programa de nutrición y seguimiento");

    if ([1440, 768, 390].includes(width)) {
      await page.evaluate(() => {
        const section = document.querySelector("#punto-de-partida");
        if (!section) return;
        const top = window.scrollY + section.getBoundingClientRect().top - 150;
        window.scrollTo(0, Math.max(0, top));
      });
      await page.screenshot({ path: testInfo.outputPath(`wondergreen-a197-${width}.png`) });
    }
  }

  await expect(page.getByRole("link", { name: "Diseñar un programa para mi cultivo" }).first())
    .toHaveAttribute("href", "/contacto/?servicio=programas-wondergreen");
});

test("Wondergreen program guide shelf opens the short guide and technical manual for every crop", async ({ page }) => {
  const manualCrops = crops.filter((crop) => crop.pdfFile && crop.technicalManualFile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/servicios/programas-wondergreen/");

  const shelf = page.getByRole("navigation", { name: "Guías y manuales Wondergreen por cultivo" });
  await expect(shelf.getByRole("link")).toHaveCount(manualCrops.length);

  const reviewDir = path.join(process.cwd(), "review");
  fs.mkdirSync(reviewDir, { recursive: true });
  for (const viewport of [
    { width: 1440, height: 1000, label: "desktop-1440" },
    { width: 768, height: 980, label: "tablet-768" },
    { width: 390, height: 844, label: "mobile-390" },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.evaluate(() => {
      const section = document.querySelector(".service-program-editorial");
      if (!section) return;
      window.scrollTo(0, Math.max(0, window.scrollY + section.getBoundingClientRect().top - 112));
    });
    await expect(shelf).toBeVisible();
    await page.screenshot({ path: path.join(reviewDir, `mi-a197-s18-guides-${viewport.label}.png`) });
    await page.evaluate(() => {
      const section = document.querySelector(".service-program-science");
      if (!section) return;
      window.scrollTo(0, Math.max(0, window.scrollY + section.getBoundingClientRect().top - 112));
    });
    await page.screenshot({ path: path.join(reviewDir, `mi-a197-s18-science-${viewport.label}.png`) });
  }

  for (const crop of manualCrops) {
    const route = `/wondergreen/cultivos/${crop.slug}/`;
    const guideLink = shelf.getByRole("link", { name: `Abrir la ruta de documentos Wondergreen para ${crop.name}` });
    await expect(guideLink).toHaveAttribute("href", route);
    await guideLink.click();
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}(?:#.*)?$`));
    await expect(page.getByRole("heading", { name: crop.name, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Descargar guía breve PDF/i })).toHaveAttribute("href", crop.pdfFile!);
    await expect(page.getByRole("link", { name: /Abrir manual técnico · 20 páginas/i })).toHaveAttribute("href", crop.technicalManualFile!);

    const [briefResponse, manualResponse] = await Promise.all([
      page.request.get(crop.pdfFile!),
      page.request.get(crop.technicalManualFile!),
    ]);
    expect(briefResponse.ok(), `${crop.name} short guide should be served`).toBe(true);
    expect(manualResponse.ok(), `${crop.name} technical manual should be served`).toBe(true);
    await page.goto("/servicios/programas-wondergreen/");
  }
});

test("Wondergreen pellet visual is contextual, accessible, and responsive", async ({ page }) => {
  await page.goto("/servicios/programas-wondergreen/");

  const figure = page.locator(".service-program-pellet");
  const image = figure.getByRole("img", { name: "Ilustración de pellets sólidos alargados sobre suelo cultivado" });
  await expect(figure).toBeVisible();
  await expect(figure).toContainText("Esquema sin escala");
  await expect(figure).toContainText("diagnóstico del lote y de la ficha vigente");
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(image).toBeVisible();
    const dimensions = await figure.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      imageWidth: element.querySelector("img")?.getBoundingClientRect().width ?? 0,
    }));
    expect(dimensions.scrollWidth, `figure should not overflow at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.imageWidth, `image should have a rendered width at ${width}px`).toBeGreaterThan(0);
  }
});

test("plant engineering and operations identify agroindustry where their scope includes it", () => {
  for (const slug of ["plantas-modulares", "operacion-delegada"] as const) {
    const service = services.find((candidate) => candidate.slug === slug);
    expect(service).toBeDefined();
    expect(service?.scope.toLocaleLowerCase("es")).toContain("agroindustrial");
    expect(service?.audienceLabel.toLocaleLowerCase("es")).toContain("agroindustria");
  }
});

test("every published contextual contact link resolves to a supported intent and profile", async () => {
  const root = path.join(process.cwd(), "out");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const contextsStart = contactSource.indexOf("const contactContexts = {");
  const contextsEnd = contactSource.indexOf("\n} as const satisfies Record<string, ContactContext>;", contextsStart);
  expect(contextsStart).toBeGreaterThanOrEqual(0);
  expect(contextsEnd).toBeGreaterThan(contextsStart);
  const contextKeys = new Set(
    [...contactSource.slice(contextsStart, contextsEnd).matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]),
  );

  const profileOptionsStart = contactSource.indexOf("const profileOptions = [");
  const profileOptionsEnd = contactSource.indexOf("\n];", profileOptionsStart);
  const profileIds = new Set(
    [...contactSource.slice(profileOptionsStart, profileOptionsEnd).matchAll(/id: "([^"]+)"/g)].map((match) => match[1]),
  );
  const profileAliasesStart = contactSource.indexOf("const diagnosticProfiles:");
  const profileAliasesEnd = contactSource.indexOf("\n};", profileAliasesStart);
  const profileAliases = new Map(
    [...contactSource.slice(profileAliasesStart, profileAliasesEnd).matchAll(/^\s*([a-z-]+):\s*"([^"]+)"/gm)]
      .map((match) => [match[1], match[2]]),
  );

  const htmlFiles: string[] = [];
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
    }
  };
  visit(root);

  for (const file of htmlFiles) {
    const route = `/${path.relative(root, path.dirname(file)).replaceAll(path.sep, "/")}/`;
    const html = fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      if (!match[1].startsWith("/contacto/")) continue;
      const destination = new URL(match[1], "https://greenatics.test");
      const intent = destination.searchParams.get("servicio") || destination.searchParams.get("interes");
      if (intent) {
        expect(contextKeys.has(intent), `${route} references unsupported contact intent: ${intent}`).toBe(true);
      }
      const profile = destination.searchParams.get("perfil");
      if (profile) {
        expect(
          profileIds.has(profile) || profileAliases.has(profile),
          `${route} references unsupported contact profile: ${profile}`,
        ).toBe(true);
        expect(
          profileIds.has(profileAliases.get(profile) || profile),
          `${route} profile ${profile} does not resolve to a form profile`,
        ).toBe(true);
      }
      const destinationFile = path.join(root, destination.pathname.replace(/^\/+/, ""), "index.html");
      expect(fs.existsSync(destinationFile), `${route} links to a missing contact page`).toBe(true);
    }
  }
});

test("motocarguero copy describes the approved design without unsupported legal claims", () => {
  const routes = [
    "servicios/index.html",
    "servicios/microrrutas-motocarguero/index.html",
    "municipios/index.html",
    "empresas/index.html",
    "index.html",
  ].map((route) => fs.readFileSync(path.join(process.cwd(), "out", route), "utf8"));
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");

  for (const html of [...routes, contactSource]) {
    expect(html).not.toContain("requerimientos técnicos y jurídicos más exigentes");
    expect(html).not.toContain("necesidades y los requerimientos más exigentes del sector aseo");
  }
  expect(routes[0]).toContain("Representación del motocarguero sobre base Ceronte");
  expect(routes[1]).toContain("Su integración se define según el diagnóstico y las condiciones de cada microrruta");
  expect(routes[2]).toContain("se integra a microrrutas según las condiciones de cada territorio");
  expect(routes[3]).toContain("frecuencia, carga, topografía y accesos definen su integración a cada ruta");
  expect(routes[4]).toContain("para apoyar la recolección selectiva de orgánicos");
  expect(contactSource).toContain("La adaptación y el alcance se definen para cada proyecto.");
});

test("compost optimization keeps customer-useful scope and a descriptive portfolio image alt", () => {
  const portfolio = fs.readFileSync(path.join(process.cwd(), "out", "portafolio", "valorizacion", "index.html"), "utf8");

  expect(portfolio).toContain('src="/services/compost-optimization-concept-v1.jpg"');
  expect(portfolio).toContain('alt="Material de compost en proceso bajo una cubierta."');
  expect(portfolio).toContain("El acompañamiento revisa las condiciones del material y las etapas del proceso.");
  expect(portfolio).not.toContain("plant-evidence-04.webp");
  expect(portfolio).not.toContain("no es una fotografía de la operación de una planta");
  expect(portfolio).toContain("Este alcance no sustituye la rehabilitación de infraestructura ni la operación diaria de la planta.");
  expect(portfolio).toContain('href="/servicios/optimizacion-composteras/"');
});

test("the motocarguero detail keeps its approved co-design claim, contextual evidence, and distinct route scope without repeat cards", async ({ page }) => {
  const detailPath = path.join(process.cwd(), "out", "servicios", "microrrutas-motocarguero", "index.html");
  const html = fs.readFileSync(detailPath, "utf8");
  expect(html).toContain("/projects/routes/motocarguero-verde-operacion-real.webp");
  expect(html).toContain("La integración del vehículo se evalúa con la carga, los accesos y el punto de recepción.");
  expect(html).not.toContain("/projects/yarumal/aerial-01.webp");
  for (const term of ["Greenatics y Auteco Mobility", "configuración de motocarguero sobre base Ceronte", "contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos", "Su integración se define según el diagnóstico y las condiciones de cada microrruta", "Diseñar recorridos que funcionen en la calle.", "de pureza orgánica en recepción", "Ese resultado corresponde al caso", "Para municipios, ESP y organizaciones", "No se ofrece como venta minorista de vehículo"]) {
    expect(html).toContain(term);
  }
  expect(html).not.toContain("requerimientos técnicos y jurídicos más exigentes");
  expect(html).not.toContain("Desarrollo conjunto</span>");
  expect(html).not.toContain("Integración a la microrruta</span>");
  await page.goto("/servicios/microrrutas-motocarguero/");
  await expect(page.locator(".service-detail-hero-copy .lead")).toContainText("Greenatics y Auteco Mobility desarrollaron una configuración de motocarguero sobre base Ceronte, con un contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos");
  await expect(page.locator(".service-detail-visual figcaption")).toHaveText("La representación del diseño Greenatics–Auteco acompaña el análisis de ruta, capacidad y recepción para cada operación.");
  await expect(page.locator(".service-detail-hero-copy .lead")).not.toContainText("96,4 %");
  const visibleEvidenceText = await page.locator(".service-route-evidence__copy").innerText();
  expect((visibleEvidenceText.match(/96,4 %/g) ?? [])).toHaveLength(1);
  await expect(page.locator(".service-route-evidence")).toContainText("de pureza orgánica en recepción");
  await expect(page.locator(".service-detail-hero-copy .lead")).toContainText("Greenatics y Auteco Mobility desarrollaron una configuración de motocarguero sobre base Ceronte");
  await expect(page.locator(".service-detail-visual figcaption")).not.toContainText("Greenatics y Auteco Mobility");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "interactive-contact-form.tsx"), "utf8");
  const contactContext = contactSource.split("const microrrutasContactContext = {")[1]?.split("} satisfies ContactContext;")[0] ?? "";
  expect(contactContext).toContain("evaluar la integración de un motocarguero a la operación");
  expect(contactContext).toContain("Comparte generadores, material, volumen, recorrido, accesos, frecuencia y punto de recepción.");
  expect(contactContext).not.toMatch(/Greenatics y Auteco Mobility|96,4 %/);
  const routesSource = fs.readFileSync(path.join(process.cwd(), "src", "data", "diagnostic-routes.ts"), "utf8");
  const routeContext = routesSource.split('"esp:ruta": {')[1]?.split("\n  },")[0] ?? "";
  expect(routeContext).toContain("Describe los generadores, las frecuencias, el recorrido y los puntos de recepción.");
  expect(routeContext).not.toMatch(/96,4 %|Greenatics y Auteco Mobility/);
  await page.goto("/contacto/?servicio=microrrutas-motocarguero");
  const renderedContactContext = page.getByRole("status");
  await expect(renderedContactContext).toContainText("Diseñar una ruta alrededor de una solución desarrollada para el sector");
  await expect(renderedContactContext).toContainText("Comparte generadores, material, volumen, recorrido, accesos, frecuencia y punto de recepción.");
  await expect(renderedContactContext).not.toContainText(/96,4 %|Greenatics y Auteco Mobility/);

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/servicios/",
      "/servicios/microrrutas-motocarguero/",
      "/contacto/?servicio=microrrutas-motocarguero",
    ]) {
      await page.goto(route);
      const layout = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }));
      expect(layout.documentWidth, `${route} must not overflow at ${width}px`).toBeLessThanOrEqual(layout.viewportWidth);

      if (route === "/servicios/microrrutas-motocarguero/") {
        const hierarchy = await page.evaluate(() => {
          const territory = document.querySelector<HTMLElement>(".service-route-design__territory");
          const pilot = document.querySelector<HTMLElement>(".service-route-design__pilot");
          const territoryTitle = territory?.querySelector("h3");
          const pilotTitle = pilot?.querySelector("h3");
          if (!territory || !pilot || !territoryTitle || !pilotTitle) return null;
          return {
            territoryTop: territory.getBoundingClientRect().top,
            territoryBottom: territory.getBoundingClientRect().bottom,
            territoryWidth: territory.getBoundingClientRect().width,
            pilotTop: pilot.getBoundingClientRect().top,
            pilotWidth: pilot.getBoundingClientRect().width,
            territoryTitleSize: Number.parseFloat(getComputedStyle(territoryTitle).fontSize),
            pilotTitleSize: Number.parseFloat(getComputedStyle(pilotTitle).fontSize),
          };
        });

        expect(hierarchy, "route and optional pilot must remain distinct, ordered sections").not.toBeNull();
        expect(hierarchy!.pilotTop).toBeGreaterThan(hierarchy!.territoryBottom);
        expect(hierarchy!.pilotTitleSize).toBeLessThan(hierarchy!.territoryTitleSize);
        if (width > 850) {
          expect(hierarchy!.territoryWidth).toBeGreaterThan(hierarchy!.pilotWidth);
        }
      }
    }
  }
});

test("service detail visuals are specific, complete, and do not repeat between service pages", async () => {
  expect(Object.keys(serviceVisuals).sort()).toEqual(services.map(({ slug }) => slug).sort());
  const visualPaths = Object.values(serviceVisuals).map(({ src }) => src);
  expect(new Set(visualPaths).size).toBe(visualPaths.length);

  for (const service of services) {
    const html = fs.readFileSync(path.join(process.cwd(), "out", "servicios", service.slug, "index.html"), "utf8");
    const visual = serviceVisuals[service.slug];
    expect(html, `${service.slug} should render its specific visual`).toContain(visual.src);
    expect(html, `${service.slug} should render descriptive alternative text`).toContain(visual.alt);
    if (service.slug === "programas-wondergreen") {
      expect(visual.alt).toContain("Cultivos de café, cacao y aguacate");
      expect(html, "Wondergreen hero intentionally uses descriptive alt text instead of a visible caption").not.toContain(visual.caption);
    } else {
      expect(html, `${service.slug} should disclose the visual's role`).toContain(visual.caption);
    }
  }

  const diagnosis = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "diagnostico-residuos", "index.html"), "utf8");
  expect(diagnosis).toContain("diagnostic-characterization-editorial.jpg");
  expect(diagnosis).toContain("Dos profesionales separan una muestra de residuos vegetales en una bandeja y registran la actividad.");
  expect(diagnosis).toContain("Caracterizar la corriente permite reconocer oportunidades y definir el siguiente paso.");
  expect(diagnosis).not.toContain("cropper-diagnostic-method.jpg");
  expect(diagnosis).not.toContain("GREENATICS BASE");
  const operation = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "operacion-delegada", "index.html"), "utf8");
  expect(operation).toContain("operation-follow-up-concept-v1.jpg");
  expect(operation).toContain("Los controles de proceso se ajustan a la modalidad y al alcance acordados.");
  expect(operation).not.toContain("plant-evidence-05.webp");
  const valorization = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "aprovechamiento-productivo", "index.html"), "utf8");
  expect(valorization).toContain("/services/valorization-characterization-editorial.jpg");
  expect(valorization).toContain("Las características de la biomasa orientan qué alternativas de aprovechamiento conviene estudiar.");
  expect(valorization).toContain('class="service-valorization-story"');
  expect(valorization).toContain("/services/organic-valorization-concept-v1.jpg");
  expect(valorization).toContain("El uso agrícola es una alternativa cuando la calidad del material y su destino lo permiten.");
  expect(valorization).toContain("Antes de elegir una tecnología, entendemos la corriente y lo que puede sostenerla.");
  expect(valorization).toContain("su origen, composición, volumen, continuidad, humedad, contaminantes y manejo actual");
  expect(valorization).toContain("la logística, el espacio, los servicios disponibles, la infraestructura y las capacidades del equipo");
  expect(valorization).toContain("qué productos, energía o usos podrían cumplir las condiciones técnicas y contar con un destino viable");
  expect(valorization).not.toContain('class="service-valorization-path__questions"');
  expect(valorization).toContain("Compost, bioenergía e insumos agrícolas son opciones por evaluar, no resultados automáticos.");
  expect(valorization).toContain("El estudio puede dejar una ruta concreta para decidir qué sigue.");
  expect(valorization).not.toContain('class="service-detail-practice"');
  expect(valorization).not.toContain('class="service-detail-offer"');
  expect(valorization).not.toContain('class="service-related-grid"');
  expect(valorization).toContain('href="/servicios/plantas-modulares/">Ingeniería para dimensionar una planta');
  expect(valorization).toContain('href="/servicios/programas-wondergreen/">Acompañamiento agronómico Wondergreen');
  expect(valorization).not.toContain("cropper-valorization-method.jpg");
  expect(valorization).not.toContain("organic-valorization-pathways.svg");
  expect(valorization).toContain("id=\"rutas-de-valorizacion\"");
  const microroutes = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "microrrutas-motocarguero", "index.html"), "utf8");
  expect(microroutes).toContain("motocarguero-verde-operacion-real.webp");
});

test("operation service uses a local, held-rights-free visual for its general offer", () => {
  const visual = serviceVisuals["operacion-delegada"];
  expect(visual.src).toBe("/services/operation-follow-up-concept-v1.jpg");
  expect(fs.existsSync(path.join(process.cwd(), "public", visual.src.slice(1)))).toBe(true);
  expect(visual.alt).toContain("toma una muestra");
  expect(visual.caption).toContain("modalidad y al alcance acordados");
  expect(`${visual.alt} ${visual.caption}`).not.toMatch(/escena editorial|generada con IA|no documenta/i);
});

test("S04 identifies the plant image as proposed from service index through phase selection", async ({ page }, testInfo) => {
  const alt = "Representación de una configuración propuesta de planta regional, con áreas techadas, zonas de recepción y tanques de proceso.";
  const caption = "La imagen muestra una configuración propuesta; las fases y tecnologías se definen según la corriente, el predio y la operación prevista.";

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 });
    await page.goto("/servicios/");

    const infrastructure = page.locator("#infraestructura");
    await expect(infrastructure.getByRole("img", { name: alt })).toBeVisible();
    await expect(infrastructure.locator("figcaption")).toHaveText(caption);
    const indexWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
    expect(indexWidth.document, `service index should not overflow at ${width}px`).toBeLessThanOrEqual(indexWidth.viewport);
    if ((width === 1440 || width === 768) && testInfo.project.name === "desktop" || width === 390 && testInfo.project.name === "mobile") {
      await infrastructure.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`service-index-${width}.png`) });
    }

    await infrastructure.getByRole("link", { name: /Ver fases de ingeniería/ }).click();
    await expect(page).toHaveURL(/\/servicios\/plantas-modulares\/$/);
    const detailVisual = page.locator(".service-detail-visual");
    await expect(detailVisual.getByRole("img", { name: alt })).toBeVisible();
    await expect(detailVisual.locator("figcaption")).toHaveText(caption);
    await expect(detailVisual.locator("figcaption")).toBeVisible();
    const captionGeometry = await detailVisual.locator("figure").evaluate((figure) => {
      const media = figure.querySelector(".service-detail-visual__media")!.getBoundingClientRect();
      const caption = figure.querySelector("figcaption")!.getBoundingClientRect();
      return { imageBottom: media.bottom, captionTop: caption.top };
    });
    expect(captionGeometry.captionTop, `caption should follow the image at ${width}px`).toBeGreaterThanOrEqual(captionGeometry.imageBottom);
    const detailWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
    expect(detailWidth.document, `plant detail should not overflow at ${width}px`).toBeLessThanOrEqual(detailWidth.viewport);
    if ((width === 1440 || width === 768) && testInfo.project.name === "desktop" || width === 390 && testInfo.project.name === "mobile") {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`plant-detail-${width}.png`) });
      await detailVisual.locator("figure").screenshot({ path: testInfo.outputPath(`plant-visual-${width}.png`) });
    }

    await expect(page.locator("#fases-del-proyecto")).toContainText("Prefactibilidad");
    await expect(page.locator('a[href="#fases-del-proyecto"]')).toHaveCount(1);
    await expect(page.locator('a[href="#punto-de-partida"]')).toHaveCount(1);
  }

  const contactLink = page.getByRole("link", { name: "Definir la fase de mi proyecto" });
  await expect(contactLink).toHaveAttribute("href", "/contacto/?servicio=plantas-modulares");
  await contactLink.click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=plantas-modulares$/);
});

test("PGIRS/PMIRS secondary action reaches the instrument chooser, not a generic diagnostic", async ({ page }) => {
  await page.goto("/servicios/pgirs-pmirs/");
  await page.getByRole("link", { name: "Distinguir PGIRS y PMIRS" }).click();
  await expect(page).toHaveURL(/\/servicios\/pgirs-pmirs\/#rutas-de-planeacion$/);
  await expect(page.locator("#rutas-de-planeacion")).toBeInViewport();
});

test("PGIRS and PMIRS page centers implementation and preserves each audience route", async ({ page }) => {
  await page.goto("/servicios/pgirs-pmirs/?perfil=municipio");
  await expect(page.getByRole("heading", { name: "Dos escalas de planeación, dos responsabilidades distintas." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "La planeación toma forma cuando cada medida tiene cómo avanzar." })).toBeVisible();
  await expect(page.locator(".service-planning-work__narrative p")).toHaveCount(3);
  await expect(page.locator(".service-planning-work__areas")).toHaveCount(0);
  for (const step of ["Leemos la situación actual.", "Priorizamos acciones posibles.", "Preparamos el seguimiento."]) {
    await expect(page.locator(".service-planning-work__narrative")).toContainText(step);
  }
  await expect(page.locator(".service-detail-practice, .service-detail-offer, .service-related")).toHaveCount(0);
  await page.getByRole("link", { name: /Conversar sobre un PGIRS/ }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pgirs-municipal&perfil=municipio$/);
  await page.goBack();
  await page.getByRole("link", { name: /Conversar sobre un PMIRS/ }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pmirs-organizacional&perfil=empresa$/);
});

test("valorization presents a decision route and carries audience context to related services", async ({ page }) => {
  await page.goto("/servicios/aprovechamiento-productivo/?perfil=municipio");
  await expect(page.getByRole("heading", { name: "Antes de elegir una tecnología, entendemos la corriente y lo que puede sostenerla." })).toBeVisible();
  await page.getByRole("link", { name: "Cómo comparamos rutas" }).click();
  await expect(page).toHaveURL(/#rutas-de-valorizacion$/);
  await expect(page.locator("#rutas-de-valorizacion")).toContainText("su origen, composición, volumen, continuidad");
  await expect(page.locator("#rutas-de-valorizacion")).toContainText("la logística, el espacio, los servicios disponibles");
  await page.getByRole("link", { name: "Ingeniería para dimensionar una planta" }).click();
  await expect(page).toHaveURL(/\/servicios\/plantas-modulares\/\?perfil=municipio$/);
});

test("valorization analysis reads as open narrative, not three parallel modules", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "[slug]", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "service-detail.css"), "utf8");
  expect(page).toContain('className="service-valorization-path__narrative"');
  expect(page).not.toContain('className="service-valorization-path__questions"');
  expect(styles).toContain(".service-valorization-path__grid {");
  expect(styles).not.toContain(".service-valorization-path__questions {");
  expect(styles).toContain("background: #e9eee5;");
  expect(styles).toContain("grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr);");
});

test("plant and route services connect relevant cases and preserve incoming audience context", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src", "app", "servicios", "[slug]", "page.tsx"), "utf8");
  expect(page).toContain('serviceCaseRoutes["Támesis"]');
  expect(page).toContain('serviceCaseLabels["Támesis"]');
  expect(page).toContain('preferIncomingProfile>{serviceCaseLabels["Támesis"]}');
  expect(page).toContain('ServiceAudienceLink href="/proyectos/yarumal/?perfil=municipio" preferIncomingProfile>Conocer el caso de Yarumal');
  expect(page).toContain('ServiceAudienceLink href="/proyectos/yarumal/">Ver la experiencia de Yarumal');
  expect(page).toContain('ServiceAudienceLink href="/servicios/operacion-delegada/">Definir quién operará la planta');
  expect(page).toContain('ServiceAudienceLink href="/servicios/aprovechamiento-productivo/">Evaluar las rutas de valorización');
  expect(page).toContain('ServiceAudienceLink href="/servicios/pgirs-pmirs/">Planeación PGIRS o PMIRS');
  expect(page).toContain('ServiceAudienceLink href="/servicios/plantas-modulares/">Ingeniería y dimensionamiento de plantas');
});

test("operation service presents its modalities without the generic ledger sections", async ({ page }) => {
  await page.goto("/servicios/operacion-delegada/?perfil=municipio");
  await expect(page.getByRole("heading", { name: "Más continuidad y control para tu planta" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operación integral", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operación compartida", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dirección técnica y transferencia", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Una planta mejora cuando el suministro, el proceso y el producto avanzan juntos." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resultados que tu equipo puede entender, decidir y sostener." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "GREENATICS OPS convierte cada turno en información para el siguiente." })).toBeVisible();
  await expect(page.getByText(/responsable, fecha y evidencia de seguimiento/)).toBeVisible();
  await expect(page.locator(".service-detail-practice, .service-detail-offer, .service-related")).toHaveCount(0);
  await page.getByRole("link", { name: "Conocer GREENATICS OPS y sus alcances" }).click();
  await expect(page).toHaveURL(/\/servicios\/greenatics-ops\/\?perfil=municipio$/);
  await page.goBack();
  await page.getByRole("link", { name: "Solicitar propuesta de operación" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=operacion-delegada&perfil=municipio$/);
});

test("operation detail remains readable across desktop, tablet and mobile widths", async ({ page }) => {
  for (const width of [1440, 1024, 852, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/servicios/operacion-delegada/");
    const layout = await page.evaluate(() => {
      const image = document.querySelector<HTMLImageElement>(".service-detail-visual img");
      const hero = document.querySelector(".service-detail-hero .container")?.getBoundingClientRect();
      const work = document.querySelector("#actividades")?.getBoundingClientRect();
      const ops = document.querySelector("#greenatics-ops")?.getBoundingClientRect();
      const results = document.querySelector("#punto-de-partida")?.getBoundingClientRect();
      return {
        viewport: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        imageLoaded: Boolean(image?.complete && image.naturalWidth > 0),
        heroWidth: hero?.width ?? 0,
        workTop: work?.top ?? 0,
        opsTop: ops?.top ?? 0,
        resultsTop: results?.top ?? 0,
      };
    });
    expect(layout.documentWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.imageLoaded, `hero image failed at ${width}px`).toBe(true);
    expect(layout.heroWidth, `hero container missing at ${width}px`).toBeGreaterThan(0);
    expect(layout.workTop, `work section missing at ${width}px`).toBeGreaterThan(0);
    expect(layout.opsTop, `OPS section missing at ${width}px`).toBeGreaterThan(layout.workTop);
    expect(layout.resultsTop, `results section missing at ${width}px`).toBeGreaterThan(layout.opsTop);
  }
});

test("OPS service separates the fictional public sample from project configuration", async ({ page }) => {
  await page.goto("/servicios/greenatics-ops/?perfil=municipio");
  await expect(page.getByText("La muestra pública usa datos ficticios; no está conectada a una planta ni habilita acceso operativo.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Una operadora revisa información del proceso junto a material orgánico en una planta." })).toHaveAttribute("src", /ops-plant-editorial\.jpg/);
  await expect(page.locator(".service-detail-visual__photo figcaption")).toBeVisible();
  await expect(page.getByText(/no es una captura del sistema/i)).toHaveCount(0);
  await expect(page.locator(".service-detail-practice, .service-detail-offer, .service-related")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Del plan de trabajo al historial operativo, sin perder el hilo." })).toBeVisible();
  await page.getByRole("link", { name: "Abrir muestra de OPS" }).click();
  await expect(page).toHaveURL(/\/app\/$/);
  await expect(page.getByText("DATOS FICTICIOS DE DEMOSTRACIÓN")).toBeVisible();
  await page.goBack();
  const configureLink = page.getByRole("link", { name: "Consultar alcance y configuración" });
  await expect(configureLink).toHaveAttribute("href", /perfil=municipio/);
  await configureLink.click();
  await expect(page).toHaveURL(/\/contacto\/\?interes=greenatics-ops&modalidad=configuracion&perfil=municipio$/);
  await expect(page.getByRole("status")).toContainText("Definir cómo OPS podría ajustarse a tu operación");
  await expect(page.getByRole("status")).toContainText("confirmaremos disponibilidad, derechos de uso y alcance");
  await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Configuración por proyecto.");
  await page.locator("#contact-details").fill("Modalidad de interés: Configuración por proyecto. Revisar sedes y registros prioritarios.");
  await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Configuración por proyecto. Revisar sedes y registros prioritarios.");
});

test("S13 configuration handoff keeps organization intent distinct from tour and generic OPS", async ({ page }) => {
  const audiences = [
    { query: "municipio", button: "Municipio / ESP" },
    { query: "empresa", button: "Organización / Gran generador" },
    { query: "agroindustria", button: "Agroindustria / proyecto productivo" },
  ];
  const viewportWidths = [1440, 1024, 768, 390, 320];

  for (const audience of audiences) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/servicios/greenatics-ops/?perfil=${audience.query}`);
    const action = page.getByRole("link", { name: "Consultar alcance y configuración" });
    await expect(action).toHaveAttribute(
      "href",
      `/contacto/?interes=greenatics-ops&modalidad=configuracion&perfil=${audience.query}`,
    );

    for (const width of viewportWidths) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await action.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(-1);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    if (audience.query === "municipio") {
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      let reachedWithKeyboard = false;
      for (let tab = 0; tab < 80 && !reachedWithKeyboard; tab += 1) {
        await page.keyboard.press("Tab");
        reachedWithKeyboard = await action.evaluate((element) => element === document.activeElement);
      }
      expect(reachedWithKeyboard).toBe(true);
      await expect(action).toBeFocused();
      await page.keyboard.press("Enter");
    } else {
      await action.click();
    }

    await expect(page).toHaveURL(
      new RegExp(`/contacto\\/?\\?interes=greenatics-ops&modalidad=configuracion&perfil=${audience.query}$`),
    );
    await expect(page.getByRole("status")).toContainText("Definir cómo OPS podría ajustarse a tu operación");
    await expect(page.getByRole("status")).toContainText("roles usarían el sistema");
    await expect(page.getByRole("status")).toContainText("confirmaremos disponibilidad, derechos de uso y alcance");
    await expect(page.getByRole("button", { name: audience.button })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Configuración por proyecto.");
    await page.locator("#contact-details").fill("Modalidad de interés: Configuración por proyecto. Revisar sedes y registros prioritarios.");
    await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Configuración por proyecto. Revisar sedes y registros prioritarios.");

    const submit = page.locator(".contact-form__submit");
    await expect(submit.locator("span")).toHaveText("Revisar resumen y abrir WhatsApp →");
    for (const width of viewportWidths) {
      await page.setViewportSize({ width, height: 900 });
      const metrics = await submit.evaluate((element) => ({
        width: element.clientWidth,
        contentWidth: element.scrollWidth,
        pageWidth: document.documentElement.clientWidth,
        pageScrollWidth: document.documentElement.scrollWidth,
        height: element.getBoundingClientRect().height,
      }));
      expect(metrics.contentWidth, `submit text must fit at ${width}px`).toBeLessThanOrEqual(metrics.width);
      expect(metrics.pageScrollWidth, `contact page must not overflow at ${width}px`).toBeLessThanOrEqual(metrics.pageWidth);
      expect(metrics.height, `submit target must remain usable at ${width}px`).toBeGreaterThanOrEqual(50);
      await expect(submit.locator("span")).toBeVisible();
    }
  }

  await page.goto("/contacto/?interes=greenatics-ops&perfil=municipio");
  await expect(page.getByRole("status")).toContainText("Conversar sobre el alcance y la configuración de OPS");
  await expect(page.locator("#contact-details")).not.toHaveValue("Modalidad de interés: Configuración por proyecto.");
  await page.goto("/contacto/?interes=greenatics-ops-recorrido&perfil=municipio");
  await expect(page.getByRole("status")).toContainText("Conocer el flujo de trabajo de la plataforma");
});

test("PGIRS route explains current methodology and transition without assigning it to PMIRS", async ({ page }) => {
  await page.goto("/servicios/pgirs-pmirs/");
  const transition = page.locator(".service-pgirs-transition");
  await expect(transition).toContainText("Resolución 0555 de 2026");
  await expect(transition).toContainText("12 de agosto de 2026");
  await expect(transition).toContainText("actualizaciones iniciadas después deben aplicar la nueva metodología");
  await expect(page.locator("#pmirs-organizacional")).not.toContainText("Resolución 0555 de 2026");
  await expect(transition.getByRole("link", { name: /normograma de la CRA/ })).toHaveAttribute(
    "href",
    "https://normas.cra.gov.co/Gestor/docs/resolucion_minviviendact_0555_2026.htm",
  );
});

test("plant project CTA lands on the three phase comparison below the sticky header", async ({ page }) => {
  await page.goto("/servicios/plantas-modulares/");
  await page.getByRole("link", { name: "Explorar las fases" }).click();
  await expect(page).toHaveURL(/\/servicios\/plantas-modulares\/#fases-del-proyecto$/);
  const phases = page.locator("#fases-del-proyecto");
  await expect(phases).toBeInViewport();
  await expect(phases.locator("article")).toHaveCount(3);
  await expect(phases).toContainText("Prefactibilidad");
  await expect(phases).toContainText("Factibilidad e ingeniería");
  await expect(phases).toContainText("Construcción y puesta en marcha");
  await page.getByRole("link", { name: "Definir la fase de mi proyecto" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=plantas-modulares$/);
  await expect(page.getByText("Definir la fase adecuada para una planta")).toBeVisible();
});

test("plant implementation phase preserves audience and scope through contextual contact", async ({ page }) => {
  const viewportWidths = [1440, 1024, 768, 390, 320];

  for (const audience of [
    { query: "empresa", button: "Organización / Gran generador", profile: "agroindustria" },
    { query: "municipio", button: "Municipio / ESP", profile: "esp" },
  ]) {
    await page.goto(`/servicios/plantas-modulares/?perfil=${audience.query}`);

    const phase = page.locator("#fases-del-proyecto article").filter({
      has: page.getByRole("heading", { name: "Construcción y puesta en marcha" }),
    });
    const contactLink = phase.getByRole("link", { name: "Conversar sobre construcción y puesta en marcha" });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute(
      "href",
      `/contacto/?servicio=plantas-modulares&fase=implementacion&perfil=${audience.query}`,
    );

    for (const width of viewportWidths) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await contactLink.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(-1);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    if (audience.query === "empresa") {
      await contactLink.click();
    } else {
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      let reachedWithKeyboard = false;
      for (let tab = 0; tab < 80 && !reachedWithKeyboard; tab += 1) {
        await page.keyboard.press("Tab");
        reachedWithKeyboard = await contactLink.evaluate((element) => element === document.activeElement);
      }
      expect(reachedWithKeyboard).toBe(true);
      await expect(contactLink).toBeFocused();
      const visibleKeyboardFocus = await contactLink.evaluate((element) => {
        const styles = getComputedStyle(element);
        return element.matches(":focus-visible") && styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
      });
      expect(visibleKeyboardFocus).toBe(true);
      await page.keyboard.press("Enter");
    }

    await expect(page).toHaveURL(
      new RegExp(`/contacto/\\?servicio=plantas-modulares&fase=implementacion&perfil=${audience.query}$`),
    );
    await expect(page.getByRole("status")).toContainText("Revisar el alcance de construcción y puesta en marcha");
    await expect(page.getByRole("status")).toContainText("solo se incluyen cuando forman parte del alcance contratado");
    await expect(page.getByRole("button", { name: audience.button })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contact-details")).toHaveValue("Fase de interés: Construcción y puesta en marcha.");
  }
});

test("S10 direction technical offer stays distinct from S11 in contact", async ({ page }) => {
  await page.goto("/contacto/?servicio=operacion-delegada");
  await expect(page.getByRole("status")).toContainText("Estabilizar una planta en funcionamiento");

  const viewportWidths = [1440, 1024, 768, 390, 320];
  const audiences = [
    { query: "municipio", profile: "esp", button: "Municipio / ESP" },
    { query: "empresa", profile: "agroindustria", button: "Organización / Gran generador" },
    { query: "agroindustria", profile: "agroindustrial", button: "Agroindustria / proyecto productivo" },
  ];

  for (const audience of audiences) {
    await page.goto(`/servicios/operacion-delegada/?perfil=${audience.query}`);
    const technicalMode = page.locator("#modalidad-direccion-tecnica");
    const action = technicalMode.getByRole("link", { name: "Conversar sobre dirección técnica" });
    await expect(action).toBeVisible();
    await expect(action).toHaveAttribute(
      "href",
      `/contacto/?servicio=operacion-delegada&modalidad=direccion-tecnica&perfil=${audience.query}`,
    );
    await expect(page.locator("#modalidad-operacion-integral").getByRole("link", { name: "Conversar sobre operación integral" })).toHaveAttribute(
      "href",
      `/contacto/?servicio=operacion-delegada&modalidad=operacion-integral&perfil=${audience.query}`,
    );
    await expect(page.locator("#modalidad-operacion-compartida").getByRole("link", { name: "Conversar sobre operación compartida" })).toBeVisible();

    for (const width of viewportWidths) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await action.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(-1);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    if (audience.query === "municipio") {
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      let reachedWithKeyboard = false;
      for (let tab = 0; tab < 80 && !reachedWithKeyboard; tab += 1) {
        await page.keyboard.press("Tab");
        reachedWithKeyboard = await action.evaluate((element) => element === document.activeElement);
      }
      expect(reachedWithKeyboard).toBe(true);
      await expect(action).toBeFocused();
      const visibleKeyboardFocus = await action.evaluate((element) => {
        const styles = getComputedStyle(element);
        return element.matches(":focus-visible") && styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
      });
      expect(visibleKeyboardFocus).toBe(true);
      await page.keyboard.press("Enter");
    } else {
      await action.click();
    }

    await expect(page).toHaveURL(
      new RegExp(`/contacto\\/?\\?servicio=operacion-delegada&modalidad=direccion-tecnica&perfil=${audience.query}$`),
    );
    await expect(page.getByRole("status")).toContainText("Acompañar decisiones de proceso con el equipo local");
    await expect(page.getByRole("status")).toContainText("la organización conserva la operación cotidiana");
    await expect(page.getByRole("status")).toContainText("no se incluyen automáticamente");
    await expect(page.getByRole("button", { name: audience.button })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Dirección técnica.");
    await page.locator("#contact-details").fill("Modalidad de interés: Dirección técnica. Revisar variables y frecuencia.");
    await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Dirección técnica. Revisar variables y frecuencia.");
  }
});

test("S11 integral operation offer stays distinct from S10 in contact", async ({ page }) => {
  await page.goto("/contacto/?servicio=operacion-delegada");
  await expect(page.getByRole("status")).toContainText("Estabilizar una planta en funcionamiento");

  const viewportWidths = [1440, 1024, 768, 390, 320];
  const audiences = [
    { query: "municipio", button: "Municipio / ESP" },
    { query: "empresa", button: "Organización / Gran generador" },
    { query: "agroindustria", button: "Agroindustria / proyecto productivo" },
  ];

  for (const audience of audiences) {
    await page.goto(`/servicios/operacion-delegada/?perfil=${audience.query}`);
    const integralMode = page.locator("#modalidad-operacion-integral");
    const action = integralMode.getByRole("link", { name: "Conversar sobre operación integral" });
    await expect(action).toBeVisible();
    await expect(action).toHaveAttribute(
      "href",
      `/contacto/?servicio=operacion-delegada&modalidad=operacion-integral&perfil=${audience.query}`,
    );
    await expect(page.locator("#modalidad-direccion-tecnica").getByRole("link", { name: "Conversar sobre dirección técnica" })).toBeVisible();
    await expect(page.locator("#modalidad-operacion-compartida").getByRole("link", { name: "Conversar sobre operación compartida" })).toBeVisible();

    for (const width of viewportWidths) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await action.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(-1);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    if (audience.query === "municipio") {
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      let reachedWithKeyboard = false;
      for (let tab = 0; tab < 80 && !reachedWithKeyboard; tab += 1) {
        await page.keyboard.press("Tab");
        reachedWithKeyboard = await action.evaluate((element) => element === document.activeElement);
      }
      expect(reachedWithKeyboard).toBe(true);
      await expect(action).toBeFocused();
      const visibleKeyboardFocus = await action.evaluate((element) => {
        const styles = getComputedStyle(element);
        return element.matches(":focus-visible") && styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
      });
      expect(visibleKeyboardFocus).toBe(true);
      await page.keyboard.press("Enter");
    } else {
      await action.click();
    }

    await expect(page).toHaveURL(
      new RegExp(`/contacto\\/?\\?servicio=operacion-delegada&modalidad=operacion-integral&perfil=${audience.query}$`),
    );
    await expect(page.getByRole("status")).toContainText("Definir el alcance de una operación integral");
    await expect(page.getByRole("status")).toContainText("proceso, la capacidad y la continuidad");
    await expect(page.getByRole("status")).toContainText("se delimitan para el sitio y el contrato");
    await expect(page.getByRole("button", { name: audience.button })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Operación integral.");
    await page.locator("#contact-details").fill("Modalidad de interés: Operación integral. Revisar continuidad y recursos.");
    await expect(page.locator("#contact-details")).toHaveValue("Modalidad de interés: Operación integral. Revisar continuidad y recursos.");
  }
});

test("S12 shared operation offer has an accessible contact action at responsive widths", async ({ page }) => {
  await page.goto("/servicios/operacion-delegada/");
  const action = page.locator("#modalidad-operacion-compartida").getByRole("link", { name: "Conversar sobre operación compartida" });
  await expect(action).toBeVisible();
  await expect(action).toHaveAttribute("href", "/contacto/?servicio=operacion-delegada&modalidad=operacion-compartida");
  for (const width of [1440, 1024, 852, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const bounds = await action.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(-1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
});

test("service-to-case journeys keep the visitor profile through the case contact action", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const journeys = [
    {
      service: "/servicios/plantas-modulares/?perfil=agroindustria",
      caseLink: "Támesis · caso territorial",
      casePath: "/proyectos/tamesis/",
      caseAction: "Evaluar una planta",
      profile: "agroindustria",
      selectedProfile: "Agroindustria / proyecto productivo",
    },
    {
      service: "/servicios/microrrutas-motocarguero/?perfil=empresa",
      caseLink: "Conocer el caso de Yarumal",
      casePath: "/proyectos/yarumal/",
      caseAction: "Conversar sobre un proyecto",
      profile: "empresa",
      selectedProfile: "Organización / Gran generador",
    },
    {
      service: "/servicios/diagnostico-residuos/?perfil=empresa",
      caseLink: "Ver la experiencia de Yarumal",
      casePath: "/proyectos/yarumal/",
      caseAction: "Conversar sobre un proyecto",
      profile: "empresa",
      selectedProfile: "Organización / Gran generador",
    },
  ];

  for (const journey of journeys) {
    await page.goto(journey.service);
    await expect(page.getByRole("link", { name: new RegExp(journey.caseLink) })).toHaveAttribute("href", new RegExp(`\\?perfil=${journey.profile}`));
    await page.getByRole("link", { name: new RegExp(journey.caseLink) }).click();
    const casePathPattern = journey.casePath.replace(/\/$/, "").replaceAll("/", "\\/");
    await expect(page).toHaveURL(new RegExp(`${casePathPattern}/?\\?perfil=${journey.profile}`));
    await page.getByRole("link", { name: journey.caseAction }).click();
    await expect(page).toHaveURL(new RegExp(`/contacto\\/?[^#]*perfil=${journey.profile}`));
    await expect(page.getByRole("button", { name: journey.selectedProfile })).toHaveAttribute("aria-pressed", "true");
  }
});

test("related service links keep the audience profile across service pages", async ({ page }) => {
  await page.goto("/servicios/plantas-modulares/?perfil=agroindustria");
  await page.getByRole("link", { name: "Definir quién operará la planta" }).click();
  await expect(page).toHaveURL(/\/servicios\/operacion-delegada\/?\?perfil=agroindustria$/);

  await page.goto("/servicios/diagnostico-residuos/?perfil=empresa");
  await page.getByRole("link", { name: "Planeación PGIRS o PMIRS" }).click();
  await expect(page).toHaveURL(/\/servicios\/pgirs-pmirs\/?\?perfil=empresa$/);
});

test("direct case visits keep the municipal default contact profile", async ({ page }) => {
  await page.goto("/proyectos/tamesis/");
  await page.getByRole("link", { name: "Evaluar una planta" }).click();
  await expect(page).toHaveURL(/\/contacto\/?[^#]*perfil=municipio/);
  await expect(page.getByRole("button", { name: "Municipio \/ ESP" })).toHaveAttribute("aria-pressed", "true");
});

test("coffee and livestock valuation routes explain evidence-led pilots instead of fixed calculators", async () => {
  const coffee = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "beneficio-cafe", "index.html"), "utf8").replaceAll("&amp;", "&");
  const livestock = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "valorizacion-pecuaria", "index.html"), "utf8").replaceAll("&amp;", "&");
  const pages = [coffee, livestock];

  expect(coffee).toContain("Pulpa, mucílago y otras corrientes");
  expect(coffee).toContain("carga estándar de café");
  expect(coffee).toContain("Volúmenes registrados");
  expect(coffee).toContain("/contacto/?servicio=idi-agroindustrial");
  expect(coffee).toContain("perfil=agro");
  expect(livestock).toContain("no convierte automáticamente el número de animales");
  expect(livestock).toContain("Estiércol, porquinaza y gallinaza");
  expect(livestock).toContain("Volúmenes y periodo");
  expect(livestock).toContain("/contacto/?servicio=idi-agroindustrial");
  expect(livestock).toContain("perfil=empresa");

  for (const html of pages) {
    expect([...html.matchAll(/<main(?=[\s>])/g)]).toHaveLength(1);
    expect(html).toContain("avanzar, ajustar o detener");
    expect(html).toContain("Conversar sobre un piloto");
    expect(html).not.toContain("Calculadora");
    expect(html).not.toContain("Bultos (40kg)");
    expect(html).not.toContain("COP $");
    expect(html).not.toContain("Cero contaminación");
    expect(html).not.toContain("Biofertilizantes higienizados de alta graduación");
    expect(html).not.toContain("Ahorro directo");
  }
});

test("service detail heroes fit 320 px and keep each secondary CTA inside its own route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });

  for (const service of services) {
    await page.goto(`/servicios/${service.slug}/`, { waitUntil: "networkidle" });
    const layout = await page.evaluate(() => {
      const secondaryHref = document.querySelector<HTMLAnchorElement>(".service-detail-hero .button-row a:nth-child(2)")?.getAttribute("href") ?? "";
      const copy = document.querySelector(".service-detail-hero-copy")?.getBoundingClientRect();
      const visual = document.querySelector(".service-detail-visual")?.getBoundingClientRect();
      const primaryAction = document.querySelector(".service-detail-hero-actions a:first-child")?.getBoundingClientRect();
      const secondaryAction = document.querySelector(".service-detail-hero-actions a:last-child")?.getBoundingClientRect();
      return {
        viewport: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        heroRight: document.querySelector(".service-detail-hero .container")?.getBoundingClientRect().right ?? 0,
        copyBottom: copy?.bottom ?? 0,
        visualTop: visual?.top ?? 0,
        visualBottom: visual?.bottom ?? 0,
        primaryActionTop: primaryAction?.top ?? 0,
        primaryActionBottom: primaryAction?.bottom ?? 0,
        secondaryActionTop: secondaryAction?.top ?? 0,
        secondaryActionBottom: secondaryAction?.bottom ?? 0,
        secondaryHref,
        secondaryTargetExists: secondaryHref.startsWith("#") ? Boolean(document.querySelector(secondaryHref)) : true,
      };
    });

    expect(layout.documentWidth, service.slug).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.heroRight, service.slug).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.primaryActionTop, service.slug).toBeGreaterThanOrEqual(layout.copyBottom);
    expect(layout.secondaryActionTop, service.slug).toBeGreaterThanOrEqual(layout.primaryActionBottom);
    expect(layout.visualTop, service.slug).toBeGreaterThanOrEqual(layout.secondaryActionBottom);
    expect(layout.secondaryTargetExists, `${service.slug}: ${layout.secondaryHref}`).toBe(true);
  }
});

test("related service routes read as contextual links rather than repeated inventory rows", async ({ page }) => {
  await page.goto("/servicios/", { waitUntil: "networkidle" });

  const contracts = [
    { id: "recoleccion-recurrente", href: "/servicios/recoleccion-tratamiento/", name: "Recolección, trazabilidad y tratamiento recurrentes" },
    { id: "rehabilitacion-infraestructura", href: "/servicios/rehabilitacion-infraestructura/", name: "Planta en Marcha · rehabilitación de infraestructura existente" },
    { id: "optimizacion-composteras", href: "/servicios/optimizacion-composteras/", name: "Optimización técnica de composteras" },
    {
      id: "desarrollo-productos-derivados",
      href: "/contacto/?servicio=desarrollo-productos-derivados",
      name: "Desarrollo técnico de productos derivados",
      secondary: { href: "/contacto/?servicio=idi-agroindustrial", name: "Piloto de I+D+i agroindustrial" },
    },
  ];

  await expect(page.locator(".gt-service-category__related")).toHaveCount(4);
  await expect(page.getByText("Servicio relacionado", { exact: true })).toHaveCount(0);
  for (const contract of contracts) {
    const entry = page.locator(`#${contract.id}`);
    await expect(entry).toHaveCount(1);
    expect(await entry.evaluate((element) => element.tagName)).toBe("P");
    const link = entry.getByRole("link", { name: contract.name });
    await expect(link).toHaveAttribute("href", contract.href);
    await expect(link).toBeVisible();
    if (contract.secondary) {
      const secondary = entry.getByRole("link", { name: contract.secondary.name });
      await expect(secondary).toHaveAttribute("href", contract.secondary.href);
      await expect(secondary).toBeVisible();
      await expect(entry).toContainText("Para desarrollar un producto definido");
      await expect(entry).toContainText("decidir si avanzar, ajustar o detener");
    } else {
      await expect(entry.getByRole("link")).toHaveCount(1);
    }
  }

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      entries: Array.from(document.querySelectorAll(".gt-service-category__related-entry"), (entry) => {
        const box = entry.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width, scrollWidth: entry.scrollWidth, clientWidth: entry.clientWidth };
      }),
    }));
    expect(geometry.scrollWidth, `document overflow at ${width}px`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.entries).toHaveLength(4);
    for (const entry of geometry.entries) {
      expect(entry.left).toBeGreaterThanOrEqual(-1);
      expect(entry.right).toBeLessThanOrEqual(width + 1);
      expect(entry.scrollWidth).toBeLessThanOrEqual(entry.clientWidth + 1);
    }
  }

  const s17 = page.locator("#desarrollo-productos-derivados");
  const s17Link = s17.getByRole("link", { name: "Desarrollo técnico de productos derivados" });
  await s17Link.focus();
  await expect(s17Link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contacto\/\?servicio=desarrollo-productos-derivados$/);
  await expect(page.getByRole("status")).toContainText("Desarrollar una ruta técnica para un producto de biomasa");

  await page.goto("/servicios/");
  const pilotLink = page.locator("#desarrollo-productos-derivados").getByRole("link", { name: "Piloto de I+D+i agroindustrial" });
  await pilotLink.focus();
  await expect(pilotLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contacto\/\?servicio=idi-agroindustrial$/);
  await expect(page.getByRole("status")).toContainText("Diseñar un piloto que permita decidir el siguiente paso");
});

test("S14 groups climate consultation and Back 2 Green in one offer", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "out", "servicios", "index.html"), "utf8").replaceAll("&amp;", "&");
  const climateOffer = html.match(/<li><a href="\/contacto\/\?servicio=clima-carbono">[\s\S]*?<\/li>/)?.[0] ?? "";
  const climateResources = html.match(/<div class="gt-service-capabilities__resources" aria-label="Herramientas y recursos: Estudios, clima y cumplimiento">[\s\S]*?<\/div>/)?.[0] ?? "";

  expect(climateOffer).not.toBe("");
  expect(climateOffer).toContain("href=\"/contacto/?servicio=clima-carbono\"");
  expect(climateOffer).toContain("href=\"/huella/\">Organizar el inventario con Back 2 Green");
  expect(climateOffer.match(/href="\/(?:contacto\/\?servicio=clima-carbono|huella\/)"/g)).toHaveLength(2);
  expect(climateResources).not.toContain("/huella/");
});

test("mobile service index trims repeated family labels and keeps evidence and secondary offers accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/servicios/", { waitUntil: "networkidle" });

  const assertFamilyNavigationFits = async () => {
    const nav = page.getByRole("navigation", { name: "Familias de servicios" });
    const layout = await nav.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const links = Array.from(element.querySelectorAll("a")).map((link) => {
        const box = link.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, height: box.height };
      });
      return {
        columns: getComputedStyle(element.querySelector(".container")!).gridTemplateColumns.trim().split(/\s+/).length,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        bounds: { left: bounds.left, right: bounds.right },
        links,
      };
    });

    expect(layout.columns).toBe(3);
    expect(layout.links).toHaveLength(6);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    for (const link of layout.links) {
      expect(link.height).toBeGreaterThanOrEqual(44);
      expect(link.left).toBeGreaterThanOrEqual(layout.bounds.left - 1);
      expect(link.right).toBeLessThanOrEqual(layout.bounds.right + 1);
    }
  };

  await assertFamilyNavigationFits();

  const editorialDensity = await page.evaluate(() => {
    const intros = Array.from(document.querySelectorAll(".gt-service-category__copy > p"), (element) => element.textContent?.trim() ?? "");
    const related = Array.from(document.querySelectorAll(".gt-service-category__related-entry"), (element) => ({
      copy: element.textContent?.trim() ?? "",
      links: Array.from(element.querySelectorAll("a"), (link) => ({ text: link.textContent?.trim() ?? "", href: link.getAttribute("href") })),
    }));
    return { intros, related, genericLabels: Array.from(document.querySelectorAll(".gt-service-category__related > span"), (element) => element.textContent?.trim() ?? "") };
  });
  expect(editorialDensity.intros).toHaveLength(6);
  expect(new Set(editorialDensity.intros).size).toBe(6);
  expect(editorialDensity.intros.every((copy) => copy.length >= 60 && copy.length <= 130)).toBe(true);
  expect(editorialDensity.related).toHaveLength(4);
  expect(new Set(editorialDensity.related.map(({ copy }) => copy)).size).toBe(4);
  expect(editorialDensity.related.every(({ copy, links }) => copy.length <= 360 && links.every((link) => link.href?.startsWith("/")))).toBe(true);
  expect(editorialDensity.related.find(({ copy }) => copy.includes("Para desarrollar un producto definido"))?.links).toHaveLength(2);
  expect(editorialDensity.genericLabels).toEqual([]);

  await page.getByRole("link", { name: "Explorar familias de servicios" }).click();
  await expect(page).toHaveURL(/\/servicios\/#familias-de-servicios$/);
  await expect(page.locator("#familias-de-servicios")).toBeInViewport();

  const assertServiceOffersReadWell = async () => {
    const offers = page.locator(".gt-service-offer");
    await expect(offers).toHaveCount(7);
    const figures = page.locator(".gt-service-offer__visual");
    await expect(figures).toHaveCount(6);
    for (const figure of await figures.all()) {
      await figure.scrollIntoViewIfNeeded();
      await expect.poll(() => figure.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    const layouts = await offers.evaluateAll((elements) => elements.map((offer) => {
      const box = offer.getBoundingClientRect();
      const copy = offer.querySelector(".gt-service-offer__copy")!.getBoundingClientRect();
      const action = offer.querySelector(".gt-service-offer__action")!.getBoundingClientRect();
      const figure = offer.querySelector(".gt-service-offer__visual");
      const image = figure?.querySelector("img") as HTMLImageElement | null;
      const caption = figure?.querySelector("figcaption")?.getBoundingClientRect();
      const visual = figure?.getBoundingClientRect();
      return {
        width: box.width,
        copyWidth: copy.width,
        actionInside: action.left >= box.left - 1 && action.right <= box.right + 1,
        stacked: visual ? copy.top >= visual.bottom - 1 : true,
        imageLoaded: image ? image.naturalWidth > 0 : true,
        imageHeight: visual?.height ?? 0,
        captionSize: caption ? Number.parseFloat(getComputedStyle(figure!.querySelector("figcaption")!).fontSize) : 0,
        overflow: offer.scrollWidth > offer.clientWidth + 1,
      };
    }));

    expect(layouts).toHaveLength(7);
    for (const layout of layouts) {
      expect(layout.width).toBeGreaterThan(260);
      expect(layout.copyWidth).toBeGreaterThan(200);
      expect(layout.actionInside).toBe(true);
      expect(layout.imageLoaded).toBe(true);
      expect(layout.overflow).toBe(false);
      if (layout.imageHeight) {
        expect(layout.captionSize).toBeGreaterThanOrEqual(12);
        if (page.viewportSize()!.width <= 760) expect(layout.stacked).toBe(true);
        else expect(layout.imageHeight).toBeGreaterThan(180);
      }
    }
  };

  await assertServiceOffersReadWell();

  const categoryLabels = page.locator(".gt-service-category__copy > small");
  await expect(categoryLabels).toHaveCount(6);
  for (const label of await categoryLabels.all()) {
    expect(await label.evaluate((element) => getComputedStyle(element).display)).toBe("none");
  }
  expect(Number.parseFloat(await page.locator(".gt-service-category").first().evaluate((element) => getComputedStyle(element).paddingBlockStart))).toBeGreaterThanOrEqual(64);

  const evidence = page.locator(".gt-service-evidence");
  await evidence.scrollIntoViewIfNeeded();
  const photo = evidence.locator(".gt-service-evidence__photo img").first();
  await expect.poll(() => photo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await photo.evaluate((image) => image.getBoundingClientRect().height)).toBeLessThanOrEqual(240);
  expect(await evidence.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThan(2300);

  const specialistSection = page.locator(".gt-service-capabilities");
  await specialistSection.scrollIntoViewIfNeeded();
  const specialistLinks = specialistSection.locator(".gt-service-capabilities__services a");
  await expect(specialistLinks).toHaveCount(11);
  for (const name of [
    /Prefactibilidad técnica y económica/,
    /Clima, carbono y reportabilidad/,
    /Preparación SUI/,
    /Auditoría y aseguramiento técnico/,
    /Acompañamiento jurídico y regulatorio/,
    /Estructuración técnico-documental/,
    /Estructuración técnico-económica y financiera/,
    /Gerencia técnica e ingeniería del propietario/,
    /I\+D\+i agroindustrial y bioeconomía/,
    /Educación, adopción y transferencia/,
  ]) await expect(page.getByRole("link", { name })).toBeVisible();
  await expect(specialistSection.locator("details")).toHaveCount(0);

  const climateOffer = specialistSection.locator(".gt-service-capabilities__services li").filter({
    has: page.getByRole("link", { name: /Clima, carbono y reportabilidad/ }),
  });
  await expect(climateOffer).toHaveCount(1);
  const climateConsultation = climateOffer.getByRole("link", { name: /Clima, carbono y reportabilidad/ });
  const inventoryTool = climateOffer.getByRole("link", { name: "Organizar el inventario con Back 2 Green" });
  await expect(climateConsultation).toHaveAttribute("href", "/contacto/?servicio=clima-carbono");
  await expect(inventoryTool).toHaveAttribute("href", "/huella/");
  await expect(specialistSection.locator(".gt-service-capabilities__resources a[href='/huella/']")).toHaveCount(0);

  const testedWidths = test.info().project.name === "desktop" ? [1440, 1024, 768, 390, 320] : [page.viewportSize()!.width];
  for (const width of testedWidths) {
    if (test.info().project.name === "desktop") await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 });
    const geometry = await climateOffer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const tool = element.querySelector(".gt-service-capabilities__service-secondary")!.getBoundingClientRect();
      return { width: rect.width, left: rect.left, right: rect.right, toolLeft: tool.left, toolRight: tool.right, viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth };
    });
    expect(geometry.width).toBeGreaterThan(220);
    expect(geometry.toolLeft).toBeGreaterThanOrEqual(geometry.left - 1);
    expect(geometry.toolRight).toBeLessThanOrEqual(geometry.right + 1);
    expect(geometry.document).toBeLessThanOrEqual(geometry.viewport + 2);
  }

  await climateConsultation.focus();
  await page.keyboard.press("Tab");
  await expect(inventoryTool).toBeFocused();
  const focusOutline = await inventoryTool.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(focusOutline).not.toBe("none");

  await inventoryTool.click();
  await expect(page).toHaveURL(/\/huella\/$/);
  await expect(page.getByRole("heading", { name: "Tu inventario GEI." })).toBeVisible();
  await page.goBack();
  const restoredClimateOffer = page.locator(".gt-service-capabilities__services li").filter({
    has: page.getByRole("link", { name: /Clima, carbono y reportabilidad/ }),
  });
  await restoredClimateOffer.getByRole("link", { name: /Clima, carbono y reportabilidad/ }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=clima-carbono/);
  await expect(page.locator(".contact-context strong")).toHaveText("Preparar un inventario y un reporte climático");
  await page.goBack();
  await expect(page).toHaveURL(/\/servicios\/(?:#familias-de-servicios)?$/);

  await page.setViewportSize({ width: 320, height: 740 });
  await assertFamilyNavigationFits();
  const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
  expect(geometry.document).toBeLessThanOrEqual(geometry.viewport + 2);
  await assertServiceOffersReadWell();

  await page.getByRole("navigation", { name: "Familias de servicios" }).getByRole("link", { name: "Recolección" }).click();
  await expect(page).toHaveURL(/\/servicios\/#recoleccion$/);
  await expect.poll(async () => {
    const categoryTop = await page.locator("#recoleccion").evaluate((element) => element.getBoundingClientRect().top);
    const navBottom = await page.getByRole("navigation", { name: "Familias de servicios" }).evaluate((element) => element.getBoundingClientRect().bottom);
    return categoryTop - navBottom;
  }).toBeGreaterThanOrEqual(-1);
  await expect(page.locator("#recoleccion h2")).toBeInViewport();
});
