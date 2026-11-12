import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { digitalTools } from "../src/data/digital-tools";
import { portfolioGroups } from "../src/data/portfolio";
import { environmentalParkModules, services } from "../src/data/services";
import { casaJardinKits, casaJardinProducts } from "../src/data/casa-jardin-detail";

const htmlFor = (route: string) => {
  const file = path.join(process.cwd(), "out", route, "index.html");
  expect(fs.existsSync(file), `Expected a built page for ${route}`).toBe(true);
  return fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
};

function expectBuiltDestination(target: string) {
  const url = new URL(target, "https://greenatics.local");
  const route = url.pathname.replace(/^\/+|\/+$/g, "");
  const file = path.join(process.cwd(), "out", route, "index.html");
  expect(fs.existsSync(file), `${target} should resolve to a built page`).toBe(true);

  if (url.hash) {
    const html = fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
    expect(html, `${target} should resolve to a rendered section`).toContain(`id="${decodeURIComponent(url.hash.slice(1))}"`);
  }
}

function expectCanonicalServiceLinks(html: string, segment: string) {
  const slugs = [...html.matchAll(/href="\/servicios\/([^/?#]+)\/"/g)].map((match) => match[1]);
  const specialServices: Record<string, { route: string; title: string }> = {
    "recoleccion-tratamiento": { route: "servicios/recoleccion-tratamiento", title: "Recolección de orgánicos con trazabilidad hasta su tratamiento." },
    "rehabilitacion-infraestructura": { route: "servicios/rehabilitacion-infraestructura", title: "Recuperar una planta empieza por saber qué puede volver a operar." },
  };
  for (const slug of new Set(slugs)) {
    const service = services.find((item) => item.slug === slug);
    const special = specialServices[slug];
    expect(service || special, `${segment} should link to a canonical service, not an ad hoc duplicate: ${slug}`).toBeDefined();
    const detail = htmlFor(special?.route ?? `servicios/${slug}`);
    expect(detail, `${segment} should lead to the named service detail: ${slug}`).toContain(service?.name ?? special!.title);
  }
}

test("service detail pages give each CTA a distinct next step", () => {
  const countHref = (html: string, href: string) => html.split(`href="${href}"`).length - 1;
  const countCtaHref = (html: string, href: string) => {
    const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [...html.matchAll(new RegExp(`<a class="[^"]*button[^"]*" href="${escapedHref}"`, "g"))].length;
  };

  const compost = htmlFor("servicios/optimizacion-composteras");
  expect(compost).toContain('href="#lectura-tecnica">Cómo se orienta el ajuste');
  expect(compost).toContain('href="#alternativas-de-apoyo">Comparar rutas de apoyo');
  expect(countHref(compost, "/contacto/?servicio=optimizacion-composteras")).toBe(1);

  const wondergreen = htmlFor("servicios/programas-wondergreen");
  expect(wondergreen).toContain('href="#programa-agronomico">Cómo se diseña el programa');
  expect(wondergreen).toContain('href="/wondergreen/cultivos/">Explorar programas por cultivo');
  expect(wondergreen).toContain('id="programa-agronomico"');
  expect(countCtaHref(wondergreen, "/wondergreen/cultivos/")).toBe(1);
  expect(countHref(wondergreen, "/wondergreen/#productos")).toBe(1);
  expect(countCtaHref(wondergreen, "/contacto/?servicio=programas-wondergreen")).toBe(1);

  const ops = htmlFor("servicios/greenatics-ops");
  expect(ops).toContain('href="#muestra-ops">Ver la muestra y sus datos');
  expect(ops).toContain('href="#configuracion-ops">Consultar configuración');
  expect(ops).toContain('id="muestra-ops"');
  expect(ops).toContain('id="configuracion-ops"');
  expect(countCtaHref(ops, "/app/")).toBe(1);
  expect(countCtaHref(ops, "/contacto/?interes=greenatics-ops")).toBe(1);
});

test("mobile home, product and agroindustry heroes keep a readable, bounded headline scale", async () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  const homeStyles = fs.readFileSync(path.join(process.cwd(), "src/app/site-v3.css"), "utf8");
  expect(styles).toMatch(/\.wg-v4-hero h1,\s*\.homegarden-v4-hero h1,\s*\.agroindustry-v4-hero h1 \{ font-size: clamp\(2\.5rem, 8vw, 3\.5rem\); \}/);
  expect(styles).toMatch(/\.homegarden-subpage-hero h1 \{ font-size: clamp\(2\.5rem, 8vw, 3\.5rem\); \}/);
  expect(styles).not.toContain("clamp(2.65rem, 13vw, 4.2rem)");
  expect(homeStyles).toMatch(/@media \(max-width: 680px\)[\s\S]*?\.home-system-hero h1 \{\s*font-size: clamp\(2\.5rem, 8vw, 3\.5rem\);/);
  expect(homeStyles).not.toContain("clamp(2.5rem, 11.6vw, 3.4rem)");
});

test("agroindustry hero actions wrap with a visible gap and retain their useful destinations", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");
  const page = htmlFor("agroindustria");
  expect(page).toContain('class="container agroindustry-v4-hero__grid gt-segment-hero-grid"');
  expect(page).not.toContain('class="button-row"><a class="button button--light" href="/servicios/diagnostico-residuos/"');
  expect(page).toContain('href="/servicios/diagnostico-residuos/?perfil=agroindustria">Caracterizar mi corriente</a>');
  expect(page).toContain('href="#rutas-de-valorizacion">Ver rutas de aprovechamiento</a>');
  expect(styles).toContain("section.agroindustry-v4-hero .gt-segment-hero-grid figure.agroindustry-v4-hero__photo");
  expect(styles).toContain('grid-template-areas: "copy" "primary" "visual" "secondary";');
  expect(styles).toContain("width: min(100%, 380px);");
  expect(page).toContain('href="/proyectos/tamesis/?perfil=agroindustria">Ver proceso y evidencias');
});

test("segment heroes keep the first action, evidence and next step in a usable responsive sequence", async ({ page }) => {
  const routes = ["/municipios/", "/empresas/", "/agroindustria/"];

  for (const route of routes) {
    for (const width of [1440, 1280, 1024, 800, 760, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(route, { waitUntil: "networkidle" });
      const hero = page.locator(".gt-segment-hero-grid");
      const result = await hero.evaluate((element) => {
        const box = (selector: string) => {
          const target = element.querySelector<HTMLElement>(selector);
          if (!target) return null;
          const rect = target.getBoundingClientRect();
          return { top: rect.top + window.scrollY, left: rect.left, right: rect.right, bottom: rect.bottom + window.scrollY };
        };
        const image = element.querySelector(".gt-segment-hero__visual img") as HTMLImageElement | null;
        const figure = element.querySelector<HTMLElement>(".gt-segment-hero__visual figure, figure.gt-segment-hero__visual");
        const caption = figure?.querySelector<HTMLElement>("figcaption");
        return {
          pageWidth: document.documentElement.clientWidth,
          pageScrollWidth: document.documentElement.scrollWidth,
          copy: box(".gt-segment-hero__copy"),
          primary: box(".gt-segment-hero__primary"),
          visual: box(".gt-segment-hero__visual"),
          figureBottom: figure ? figure.getBoundingClientRect().bottom + window.scrollY : null,
          caption: caption ? (() => {
            const rect = caption.getBoundingClientRect();
            return { bottom: rect.bottom + window.scrollY, height: rect.height };
          })() : null,
          secondary: box(".gt-segment-hero__secondary"),
          visualReady: Boolean(image?.complete && image.naturalWidth > 0),
          primaryHref: element.querySelector<HTMLAnchorElement>(".gt-segment-hero__primary")?.getAttribute("href"),
          secondaryHref: element.querySelector<HTMLAnchorElement>(".gt-segment-hero__secondary")?.getAttribute("href"),
        };
      });

      expect(result.copy, `${route} should render its segment message at ${width}px`).not.toBeNull();
      expect(result.primary, `${route} should render its main action at ${width}px`).not.toBeNull();
      expect(result.visual, `${route} should render its evidence visual at ${width}px`).not.toBeNull();
      expect(result.secondary, `${route} should render its secondary route at ${width}px`).not.toBeNull();
      expect(result.pageScrollWidth, `${route} should not overflow at ${width}px`).toBe(result.pageWidth);
      expect(result.visual!.left, `${route} hero visual should stay inside the viewport at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(result.visual!.right, `${route} hero visual should not be clipped at ${width}px`).toBeLessThanOrEqual(result.pageWidth + 1);
      expect(result.visualReady, `${route} hero visual should be ready at ${width}px`).toBe(true);
      expect(result.caption, `${route} hero visual should retain its descriptive caption at ${width}px`).not.toBeNull();
      if (route !== "/empresas/") {
        expect(result.figureBottom! - result.caption!.bottom, `${route} figure should not leave a dead band after its caption at ${width}px`).toBeLessThanOrEqual(12);
      }
      if (route === "/empresas/" && width > 760 && width <= 1100) {
        expect(result.visual!.left, "the company photo should sit beside the message at intermediate widths").toBeGreaterThan(result.copy!.left);
        expect(result.visual!.top).toBeLessThanOrEqual(result.copy!.top + 2);
        expect(result.primary!.top).toBeGreaterThanOrEqual(result.copy!.bottom - 1);
        expect(result.secondary!.top).toBeGreaterThanOrEqual(result.primary!.bottom - 1);
      } else if (width <= 1100) {
        expect(result.primary!.top).toBeGreaterThanOrEqual(result.copy!.bottom - 1);
        expect(result.visual!.top).toBeGreaterThanOrEqual(result.primary!.bottom - 1);
        expect(result.secondary!.top).toBeGreaterThanOrEqual(result.visual!.bottom - 1);
      } else {
        expect(result.visual!.left).toBeGreaterThan(result.copy!.left);
        expect(Math.abs(result.primary!.top - result.secondary!.top)).toBeLessThan(4);
        expect(result.visual!.top).toBeLessThan(result.primary!.top + 2);
      }
    }
  }
});

test("company hero preserves a balanced split between message and image at intermediate widths", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");

  expect(styles).toContain(".gt-route-hero--company-editorial .gt-company-hero-grid {");
  expect(styles).toContain('grid-template-areas: "copy copy visual" "primary secondary visual";');
  expect(styles).toContain('grid-template-areas: "copy visual" "primary visual" "secondary visual";');
  expect(styles).toContain(".gt-route-hero--company-editorial .gt-company-hero-visual");
  expect(styles).toContain("aspect-ratio: 1.03;");
  expect(styles).toContain('grid-template-areas: "copy" "primary" "visual" "secondary";');
});

test("company services read as an open offer and the PMIRS sequence as connected prose", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src/app/empresas/page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");
  const offers = page.match(/const companyRoutes = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const valorizationOffer = offers.match(/\{\s*title: "Aprovechamiento Productivo y Bioeconomía"[\s\S]*?\n  \}/)?.[0] ?? "";

  expect(offers.match(/title:/g)).toHaveLength(4);
  expect(fs.existsSync(path.join(process.cwd(), "public/services/valorization-characterization-editorial.jpg"))).toBe(true);
  expect(valorizationOffer).toContain('href: "/servicios/aprovechamiento-productivo/?perfil=empresa"');
  expect(valorizationOffer).toContain('cta: "Explorar rutas de valorización"');
  expect(valorizationOffer).toContain('image: "/services/valorization-characterization-editorial.jpg"');
  expect(valorizationOffer).toContain('imageAlt: "Una profesional compara muestras de subproductos orgánicos sobre una mesa de caracterización."');
  expect(valorizationOffer).not.toContain("reactor-uasb.jpeg");
  for (const image of offers.matchAll(/image: "([^"]+)"/g)) {
    expect(fs.existsSync(path.join(process.cwd(), "public", image[1].replace(/^\//, ""))), image[1]).toBe(true);
  }
  expect(page).toContain("gt-company-service-list");
  expect(page).not.toContain("{route.imageNote}");
  expect(page).toContain("En el punto de generación,");
  expect(styles).toContain(".gt-company-service-list {");
  expect(styles).toContain(".gt-company-pmirs-copy__story {");
  expect(styles).toContain(".gt-company-pmirs-copy__story strong {");
  expect(styles).not.toContain(".gt-company-pmirs-copy__list");
});

test("company journey exposes named landmarks from audience entry through the next step", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src/app/empresas/page.tsx"), "utf8");

  for (const [landmark, headingId] of [
    ["gt-route-hero--company", "company-page-title"],
    ["gt-route-section--paper", "company-audiences-title"],
    ["gt-route-section--company-story", "company-pmirs-story-title"],
    ["gt-route-section--company-offers", "company-routes-title"],
    ["gt-route-closing--company", "company-next-step-title"],
  ]) {
    const sectionPattern = new RegExp(
      `<section\\b(?=[^>]*className="[^"]*\\b${landmark}\\b[^"]*")(?=[^>]*aria-labelledby="${headingId}")[^>]*>`,
      "s",
    );
    expect(page).toMatch(sectionPattern);
    expect(page).toContain(`id="${headingId}"`);
  }

  const digitalTools = fs.readFileSync(path.join(process.cwd(), "src/components/segment-digital-tools.tsx"), "utf8");
  expect(digitalTools).toContain('<section className="gt-audience-tools" id={id} aria-labelledby={`${id}-title`}>');
});

test("municipal and agroindustry journeys expose named regions without changing their anchors", () => {
  const pages = {
    municipalities: fs.readFileSync(path.join(process.cwd(), "src/app/municipios/page.tsx"), "utf8"),
    agroindustry: fs.readFileSync(path.join(process.cwd(), "src/app/agroindustria/page.tsx"), "utf8"),
  };
  const landmarks = [
    [pages.municipalities, "gt-route-hero--municipal", "municipal-page-title"],
    [pages.municipalities, "gt-proof-ribbon", "Resultados de gestión de orgánicos en Yarumal"],
    [pages.municipalities, "gt-microroute", "municipal-microroute-title"],
    [pages.municipalities, "gt-route-section--municipal-park", "municipal-park-title"],
    [pages.municipalities, "gt-route-section--municipal-services", "municipal-services-heading"],
    [pages.municipalities, "gt-route-closing", "municipal-next-step-title"],
    [pages.agroindustry, "agroindustry-v4-hero", "agroindustry-page-title"],
    [pages.agroindustry, "agroindustry-v4-currents", "agroindustry-currents-title"],
    [pages.agroindustry, "agroindustry-v4-service-paths", "agroindustry-services-title"],
    [pages.agroindustry, "agroindustry-v4-biogas", "agroindustry-biogas-title"],
    [pages.agroindustry, "agroindustry-v4-outcomes", "agroindustry-outcomes-title"],
    [pages.agroindustry, "agroindustry-v4-products", "agroindustry-products-title"],
    [pages.agroindustry, "agroindustry-v4-closing", "agroindustry-next-step-title"],
  ] as const;

  for (const [page, className, label] of landmarks) {
    const labelledById = page.includes(`aria-labelledby="${label}"`);
    const labelledByText = page.includes(`aria-label="${label}"`);
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameAttribute = labelledById
      ? `aria-labelledby="${escapedLabel}"`
      : `aria-label="${escapedLabel}"`;
    const regionPattern = new RegExp(
      `<section\\b(?=[^>]*className="[^"]*\\b${className}\\b[^"]*")(?=[^>]*${nameAttribute})[^>]*>`,
      "s",
    );
    expect(page, `${className} should have an accessible name`).toMatch(regionPattern);
    if (labelledById) expect(page, `${className} should point to an existing heading`).toContain(`id="${label}"`);
  }

  expect(pages.agroindustry).toContain('className="agroindustry-v4-biogas__gallery" role="group" aria-label="Etapas de la ruta de digestión anaerobia en Támesis"');
  expect(pages.municipalities).toContain('href: "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal"');
  expect(pages.agroindustry).toContain('id="rutas-de-valorizacion"');
});

test("municipal park story uses documented process imagery and matches the five shared modules", () => {
  const municipalities = htmlFor("municipios");
  const park = htmlFor("parque-ambiental");

  expect(environmentalParkModules).toHaveLength(5);
  expect(municipalities).toContain('src="/projects/plant/plant-evidence-02.webp"');
  expect(municipalities).toContain("Una experiencia de tratamiento y aprovechamiento que orienta la planeación territorial.");
  expect(municipalities).not.toContain("una etapa documentada, no un Parque Ambiental completo");
  expect(municipalities).not.toContain("Registro de archivo");
  expect(municipalities).toContain("Recibir con control");
  expect(municipalities).toContain("Tratar según la corriente");
  expect(municipalities).toContain("Preparar salidas con destino");
  expect(park).toContain("Cinco módulos conectan el material con un uso posible.");
  expect(park).not.toContain("Ocho capas que pueden combinarse");

  for (const [title] of environmentalParkModules) {
    expect(municipalities, `The municipal story should preserve ${title}`).toContain(title);
    expect(park, `The concept page should preserve ${title}`).toContain(title);
  }
});

test("municipal service offers preserve five named services and canonical destinations", () => {
  const municipalities = htmlFor("municipios");
  const serviceTitles = [
    "Formulación y actualización del PGIRS municipal",
    "Recolección selectiva, trazabilidad y tratamiento",
    "Diseño de plantas y recuperación de infraestructura",
    "Operación integral y continuidad técnica de plantas",
    "Aprovechamiento productivo y bioeconomía",
  ];
  const serviceHrefs = [
    "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal",
    "/servicios/recoleccion-tratamiento/?perfil=municipio",
    "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio",
    "/servicios/plantas-modulares/?perfil=municipio",
    "/servicios/rehabilitacion-infraestructura/?perfil=municipio",
    "/servicios/operacion-delegada/?perfil=municipio",
    "/servicios/aprovechamiento-productivo/?perfil=municipio",
  ];
  const serviceImages = [
    "/tools/red-territory-editorial.jpg",
    "/projects/tamesis/ruta-selectiva.jpeg",
    "/services/service-consulting-editorial.webp",
    "/tools/ops-plant-editorial.jpg",
    "/services/valorization-characterization-editorial.jpg",
  ];
  expect(municipalities).toContain('href="/proyectos/yarumal/?perfil=municipio">Ver el caso Yarumal');
  expect(municipalities).not.toContain("municipal-collection-archive-ai-edited.jpg");
  expect(municipalities).not.toContain("gt-municipal-offer__brand-mark");

  expect(municipalities).toContain("Servicios municipales para resolver necesidades concretas.");
  expect(municipalities).toContain("La selección del vehículo depende de la capacidad, los puntos de carga, el acceso y el destino acordado.");
  expect(municipalities).not.toContain('src="/campaign/00_greenatics_logo.png"');
  expect(municipalities).not.toContain("municipal-collection-archive-ai-edited.jpg");
  expect(municipalities).not.toContain("gt-municipal-offer__brand-mark");
  expect(municipalities).toContain('class="gt-municipal-offer gt-municipal-offer--featured"');
  expect(municipalities).toContain("Explorar la formulación del PGIRS");
  expect(municipalities.match(/class="gt-municipal-offer(?: gt-municipal-offer--featured)?(?: gt-municipal-offer--reverse)?"/g)).toHaveLength(5);
  for (const title of serviceTitles) expect(municipalities).toContain(title);
  for (const href of serviceHrefs) expect(municipalities).toContain(`href="${href}"`);
  for (const image of serviceImages) {
    expect(municipalities).toContain(`src="${image}"`);
    expect(fs.existsSync(path.join(process.cwd(), "public", image.slice(1)))).toBe(true);
  }
  expect(municipalities).toContain('href="/servicios/plantas-modulares/?perfil=municipio">Diseñar una planta nueva');
  expect(municipalities).toContain('href="/servicios/rehabilitacion-infraestructura/?perfil=municipio">Conocer Planta en Marcha');
  expect(municipalities).toContain("El alcance se concreta según la fase del proyecto");
  expect(municipalities).toContain("Articular actores y prioridades ayuda a convertir el PGIRS en una ruta de trabajo.");
  expect(municipalities).toContain('src="/projects/tamesis/ruta-selectiva.jpeg"');
  expect(municipalities).not.toContain("Escena ilustrativa");
  expect(municipalities).not.toContain("intervenida con IA para proteger la identidad");
});

test("municipal landing distinguishes territorial, operator and regional decision paths", () => {
  const municipalities = htmlFor("municipios");
  expect(municipalities).toContain('aria-labelledby="municipal-buying-roles-title"');
  expect(municipalities).toContain("La ruta depende de quién decide, contrata y opera.");
  for (const label of ["Municipio o entidad territorial", "ESP, prestador u operador", "Esquema o proyecto regional"]) {
    expect(municipalities).toContain(label);
  }
  for (const href of [
    "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal",
    "/servicios/recoleccion-tratamiento/?perfil=municipio",
    "/soluciones/viabilidad-municipal/",
  ]) {
    expect(municipalities).toContain(`href="${href}"`);
    expectBuiltDestination(href);
  }
});

test("companies page presents CCB waste-practice figures with sample context", () => {
  const companies = htmlFor("empresas").replaceAll("&amp;", "&");
  for (const value of ["60,2 %", "43,3 %", "25,1 %", "20,7 %"]) {
    expect(companies).toContain(value);
  }
  expect(companies).toContain("Prácticas de manejo de residuos reportadas en la encuesta CCB 2023");
  expect(companies).toContain("1.500 encuestas en Bogotá y 59 municipios de la jurisdicción CCB");
  expect(companies).toContain("La pregunta permitía varias respuestas");
  expect(companies).toContain("no un resultado de clientes Greenatics");
  expect(companies).toContain('href="https://bibliotecadigital.ccb.org.co/bitstreams/300c8fb5-e67f-4004-963b-da9e6f1cc557/download"');
  expect((companies.match(/class="gt-company-evidence__track" aria-hidden="true"/g) ?? [])).toHaveLength(4);
});

test("municipal storytelling avoids ledger labels and decorative stage numbers", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src", "app", "municipios", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "routes-v3.css"), "utf8");

  expect(source).toContain('aria-label="Cinco etapas para diseñar y validar una microrruta selectiva"');
  expect(source).toContain('aria-label="Tres decisiones para configurar el proceso"');
  expect(source).not.toContain('["01",');
  expect(source).not.toContain('"Te sirve si"');
  expect(source).not.toContain('"Qué se define contigo"');
  expect(source).not.toContain('String(index + 1).padStart(2, "0")');
  expect(styles).toContain(".gt-microroute .gt-pilot-steps li::before {");
  expect(styles).toContain(".gt-park-process__details {");
  expect(styles).not.toMatch(/\.gt-park-process\s*\{[^}]*border-top:/s);
  expect(styles).not.toMatch(/\.gt-municipal-offer__scope\s*\{[^}]*border-top:/s);
});

test("case labels avoid decorative numbers while meaningful process steps stay ordered", () => {
  const yarumal = fs.readFileSync(path.join(process.cwd(), "src", "app", "proyectos", "yarumal", "page.tsx"), "utf8");
  const tamesis = fs.readFileSync(path.join(process.cwd(), "src", "app", "proyectos", "tamesis", "page.tsx"), "utf8");
  const opsLanding = fs.readFileSync(path.join(process.cwd(), "src", "app", "app", "page.tsx"), "utf8");

  expect(yarumal).toContain("responsibilities.map((role) => (");
  expect(yarumal).toContain("<span>{role.label}</span>");
  expect(yarumal).not.toContain('String(index + 1).padStart(2, "0")');
  expect(yarumal).toContain('<ol className="gt-case-system__steps">');
  expect(yarumal).toContain('["01", "Separar"');
  expect(yarumal).toContain('["05", "Mejorar"');

  expect(tamesis).toContain("operatingRecords.map(([title, copy]) => (");
  expect(tamesis).toContain("consolidation.map((item) => (");
  expect(tamesis).toContain("<span>{item.label}</span>");
  expect(tamesis).not.toContain('String(index + 1).padStart(2, "0")');
  expect(tamesis).toContain('<ol className="gt-tamesis-map__intake">');
  expect(tamesis).toContain("La biomasa acondicionada se separa en una ruta líquida para digestión anaerobia y otra sólida para estabilización y compostaje.");
  expect(tamesis).not.toContain("no es un plano, una imagen a escala");

  expect(opsLanding).toContain("roles.map(([role, title, copy]) =>");
  expect(opsLanding).toContain("<span>{role}</span>");
  expect(opsLanding).not.toContain('String(index + 1).padStart(2, "0")');
  expect(opsLanding).toContain('<ol className="gt-ops-data-chain__steps">');
  expect(opsLanding).toContain('["01", "Capturar"');
  expect(opsLanding).toContain('["06", "Reportar"');
});

test("municipal infrastructure choices remain distinct and readable at narrow widths", async ({ page }) => {
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/municipios/#municipal-services-heading", { waitUntil: "networkidle" });

    const article = page.locator(".gt-municipal-offer").filter({
      has: page.getByRole("heading", { name: "Diseño de plantas y recuperación de infraestructura" }),
    });
    const newPlant = article.getByRole("link", { name: "Diseñar una planta nueva" });
    const existingPlant = article.getByRole("link", { name: "Conocer Planta en Marcha" });
    await expect(newPlant).toBeVisible();
    await expect(existingPlant).toBeVisible();

    const geometry = await article.evaluate((element) => {
      const articleRect = element.getBoundingClientRect();
      const actions = [...element.querySelectorAll<HTMLElement>(".gt-municipal-offer__link")].map((link) => {
        const rect = link.getBoundingClientRect();
        return { left: rect.left, right: rect.right, clientWidth: link.clientWidth, scrollWidth: link.scrollWidth };
      });
      return {
        viewport: window.innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        articleLeft: articleRect.left,
        articleRight: articleRect.right,
        actions,
      };
    });

    expect(geometry.pageWidth, `municipal page should fit ${width}px`).toBeLessThanOrEqual(width + 2);
    for (const action of geometry.actions) {
      expect(action.left).toBeGreaterThanOrEqual(geometry.articleLeft - 1);
      expect(action.right).toBeLessThanOrEqual(geometry.articleRight + 1);
      expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth + 1);
    }
  }
});

test("municipal infrastructure CTAs preserve the new-build and recovery journeys", async ({ page }) => {
  await page.goto("/municipios/");
  await page.getByRole("link", { name: "Diseñar una planta nueva" }).click();
  await expect(page).toHaveURL(/\/servicios\/plantas-modulares\/?\?perfil=municipio$/);
  await page.getByRole("link", { name: "Definir la fase de mi proyecto" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=plantas-modulares&perfil=municipio$/);
  await expect(page.getByRole("button", { name: "Municipio \/ ESP" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Definir la fase adecuada para una planta")).toBeVisible();

  await page.goto("/municipios/");
  await page.getByRole("link", { name: "Conocer Planta en Marcha" }).click();
  await expect(page).toHaveURL(/\/servicios\/rehabilitacion-infraestructura\/?\?perfil=municipio$/);
  await page.getByRole("link", { name: "Municipio o ESP" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=rehabilitacion-infraestructura&perfil=municipio$/);
  await expect(page.getByRole("status")).toContainText("Evaluar la recuperación de una planta existente");
  await expect(page.getByRole("button", { name: "Municipio \/ ESP" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Municipio o empresa de servicios públicos *")).toBeVisible();
});

test("municipal and company offers resolve to built service pages, forms and anchors", () => {
  const destinations = [
    ["municipios", "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal"],
    ["municipios", "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio"],
    ["municipios", "/servicios/plantas-modulares/?perfil=municipio"],
    ["municipios", "/servicios/rehabilitacion-infraestructura/?perfil=municipio"],
    ["servicios/rehabilitacion-infraestructura", "/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio"],
    ["municipios", "/servicios/operacion-delegada/?perfil=municipio"],
    ["municipios", "/servicios/aprovechamiento-productivo/?perfil=municipio"],
    ["empresas", "/contacto/?servicio=recoleccion-tratamiento&perfil=empresa"],
    ["empresas", "/servicios/microrrutas-motocarguero/?perfil=empresa"],
    ["empresas", "/servicios/operacion-delegada/?perfil=empresa"],
    ["empresas", "/servicios/aprovechamiento-productivo/?perfil=empresa"],
    ["empresas", "/servicios/greenatics-ops/?perfil=empresa"],
    ["empresas", "/huella/"],
  ] as const;

  for (const [segment, destination] of destinations) {
    const html = htmlFor(segment);
    expect(html, `${segment} should link to ${destination}`).toContain(`href="${destination}"`);
    expectBuiltDestination(destination);
  }
});

test("agroindustry currents use one approved visual and a readable editorial sequence", () => {
  const agroindustry = htmlFor("agroindustria").replaceAll("&amp;", "&");
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  const currentsStart = agroindustry.indexOf('class="agroindustry-v4-currents"');
  const servicesStart = agroindustry.indexOf('class="agroindustry-v4-service-paths"');
  const currents = agroindustry.slice(currentsStart, servicesStart);
  const currentTitles = [
    "Biomasa y subproductos",
    "Efluentes y aguas de proceso",
    "Lodos y fracciones semisólidas",
    "Pérdidas y excedentes de producción",
  ];
  const offers = agroindustry.match(/data-service-id="S\d+"/g) || [];

  expect(agroindustry).toContain("<title>Biomasa agroindustrial: evaluación y valorización | Greenatics</title>");
  expect(agroindustry).not.toContain("| Greenatics | Greenatics</title>");
  expect(currentsStart).toBeGreaterThanOrEqual(0);
  expect(servicesStart).toBeGreaterThan(currentsStart);
  expect(offers).toHaveLength(8);
  expect(agroindustry).not.toContain("Te sirve si");
  expect(agroindustry).toContain("¿Esta corriente justifica caracterizar, pilotear o invertir?");
  expect(agroindustry).toContain("Evaluamos una corriente, un sitio y un periodo");
  expect(currents).toContain('class="agroindustry-v4-currents__visual"');
  expect(currents.match(/src="\/services\/agroindustry-biomass-editorial\.jpg"/g)).toHaveLength(1);
  expect(currents).toContain('alt="Técnica y productor revisan subproductos de una operación agroindustrial."');
  expect(currents).toContain("Caracterizar la corriente permite comparar rutas antes de comprometer inversión.");
  expect(currents).toContain('src="/diagrams/agroindustria-decision-v02/agroindustria-decision-desktop.svg"');
  expect(currents).toContain('srcSet="/diagrams/agroindustria-decision-v02/agroindustria-decision-mobile.svg"');
  const diagramDir = path.join(process.cwd(), "public/diagrams/agroindustria-decision-v02");
  const desktopSvg = fs.readFileSync(path.join(diagramDir, "agroindustria-decision-desktop.svg"), "utf8");
  const mobileSvg = fs.readFileSync(path.join(diagramDir, "agroindustria-decision-mobile.svg"), "utf8");
  for (const svg of [desktopSvg, mobileSvg]) {
    expect(svg).toContain('href="agroindustria-material-stream-v02.jpg"');
    expect(svg).toContain('href="greenatics-horizontal-logo-v1.png"');
    expect(svg).toContain("ESQUEMA CONCEPTUAL");
  }
  expect(desktopSvg).toContain("<title id=\"desktop-title\">");
  expect(mobileSvg).toContain("<title id=\"mobile-title\">");
  expect(fs.existsSync(path.join(diagramDir, "agroindustria-material-stream-v02.jpg"))).toBe(true);
  expect(fs.existsSync(path.join(diagramDir, "greenatics-horizontal-logo-v1.png"))).toBe(true);
  expect(currents).toContain("Las salidas dependen de los criterios definidos para cada proyecto.");
  expect(agroindustry.slice(servicesStart)).not.toMatch(/src="\/services\/agroindustry-biomass-editorial\.jpg"/);
  expect(currents).not.toContain("agroindustry-v4-currents__grid");
  let previousTitle = -1;
  for (const title of currentTitles) {
    const index = currents.indexOf(title);
    expect(index, `${title} should remain in the editorial sequence`).toBeGreaterThan(previousTitle);
    previousTitle = index;
  }
  expect(agroindustry).toContain('id="herramientas-agroindustria"');
  expect(agroindustry).toContain('href="/app/">Recorrer la muestra de OPS');
  expect(agroindustry).toContain('href="/servicios/greenatics-ops/?perfil=agroindustria">Consultar configuración para una planta');
  for (const href of [
    "/soluciones/biogas-energia/?perfil=agroindustria",
    "/servicios/aprovechamiento-productivo/?perfil=agroindustria",
    "/servicios/greenatics-ops/?perfil=agroindustria",
    "/servicios/programas-wondergreen/?perfil=agroindustria",
  ]) expect(agroindustry).toContain(`href="${href}"`);
  expect(styles).toContain(".agroindustry-v4-currents__layout { display: grid;");
  expect(styles).toContain(".agroindustry-v4-currents__list { grid-column: 1; grid-row: 1; display: grid;");
  expect(styles).not.toContain(".agroindustry-v4-currents__grid");
  expect(styles).toContain(".agroindustry-v4-service-paths__group--assessment .agroindustry-v4-service-paths__offers");
  expect(styles).toContain(".agroindustry-v4-service-paths__group--operation { display: block;");
});

test("segment landings distinguish professional services from digital tools", () => {
  const companies = htmlFor("empresas").replaceAll("&amp;", "&");
  const companyServicesStart = companies.indexOf('id="puntos-de-entrada"');
  const companyToolsStart = companies.indexOf('id="herramientas-organizaciones"');
  const companyServiceList = companies.slice(companyServicesStart, companyToolsStart);
  expect(companyServicesStart).toBeGreaterThanOrEqual(0);
  expect(companyToolsStart).toBeGreaterThan(companyServicesStart);
  expect(companyServiceList.match(/class="gt-company-route-card"/g)).toHaveLength(4);
  expect(companyServiceList).not.toContain("GREENATICS OPS");
  expect(companyServiceList).not.toContain("Back 2 Green");
  expect(companyServiceList).toContain("Estas cuatro rutas profesionales");
  expect(companies).toContain('href="/huella/">Ver método, planes y acceso');
  expect(companies).toContain('href="/app/">Abrir muestra de GREENATICS OPS');
  expect(companies).toContain('href="/servicios/greenatics-ops/?perfil=empresa">Consultar configuración y acompañamiento');

  const agroindustry = htmlFor("agroindustria").replaceAll("&amp;", "&");
  const agroServicesStart = agroindustry.indexOf('class="agroindustry-v4-service-paths__groups"');
  const agroToolsStart = agroindustry.indexOf('id="herramientas-agroindustria"');
  const agroServiceList = agroindustry.slice(agroServicesStart, agroToolsStart);
  expect(agroServicesStart).toBeGreaterThanOrEqual(0);
  expect(agroToolsStart).toBeGreaterThan(agroServicesStart);
  expect(agroServiceList).not.toContain("GREENATICS OPS");
  expect(agroindustry).toContain("La herramienta complementa el trabajo técnico");
  expect(agroindustry).toContain('href="/app/">Recorrer la muestra de OPS');
});

test("digital-tool rows keep their actions inside tablet layouts", async ({ page }) => {
  for (const width of [1024, 806]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/empresas/#herramientas-organizaciones", { waitUntil: "networkidle" });

    const section = page.locator("#herramientas-organizaciones");
    await expect(section.getByRole("link", { name: "Ver método, planes y acceso" })).toBeVisible();

    const geometry = await section.evaluate((element) => {
      const viewportWidth = window.innerWidth;
      const rows = [...element.querySelectorAll<HTMLElement>(".gt-audience-tools__entry")].map((row) => {
        const actions = row.querySelector<HTMLElement>(".gt-audience-tools__actions")!;
        const button = actions.querySelector<HTMLElement>(".button")!;
        const actionRect = actions.getBoundingClientRect();
        return {
          actionRight: actionRect.right,
          buttonClientWidth: button.clientWidth,
          buttonScrollWidth: button.scrollWidth,
        };
      });

      return { viewportWidth, documentWidth: document.documentElement.scrollWidth, rows };
    });

    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    for (const row of geometry.rows) {
      expect(row.actionRight).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(row.buttonScrollWidth).toBeLessThanOrEqual(row.buttonClientWidth + 1);
    }
  }
});

test("agroindustry currents keep the approved image and editorial order across breakpoints", async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/agroindustria/#agroindustry-currents-title", { waitUntil: "networkidle" });
    const section = page.locator(".agroindustry-v4-currents");
    const image = section.locator(".agroindustry-v4-currents__frame img");
    const diagram = section.locator(".agroindustry-v4-decision-diagram");
    const diagramImage = diagram.locator("img");
    const list = section.locator(".agroindustry-v4-currents__list");
    await expect(section.getByRole("heading", { name: "Una ruta empieza por entender qué material tienes y cómo se produce." })).toBeVisible();
    await expect(list.locator("article")).toHaveCount(4);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect(section.getByText("Caracterizar la corriente permite comparar rutas antes de comprometer inversión.")).toBeVisible();
    await diagram.scrollIntoViewIfNeeded();
    await expect(diagram).toBeVisible();
    await expect(diagramImage).toHaveAttribute("alt", /delimitar, caracterizar, comparar alternativas/);
    await expect(page.locator(".agroindustry-v4-service-paths__offers img")).toHaveCount(0);

    const geometry = await section.evaluate((element) => {
      const rect = (node: Element) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      const visual = element.querySelector(".agroindustry-v4-currents__visual")!;
      const list = element.querySelector(".agroindustry-v4-currents__list")!;
      const diagram = element.querySelector(".agroindustry-v4-decision-diagram")!;
      const diagramPicture = diagram.querySelector("picture")!;
      const diagramImage = diagram.querySelector("img") as HTMLImageElement;
      const img = visual.querySelector("img") as HTMLImageElement;
      return {
        viewport: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        visual: rect(visual),
        list: rect(list),
        imageLoaded: img.complete && img.naturalWidth > 0,
        diagramSource: diagramImage.currentSrc,
        diagramImageLoaded: diagramImage.complete && diagramImage.naturalWidth > 0,
        diagramWidth: diagram.getBoundingClientRect().width,
        diagramAspect: diagramPicture.getBoundingClientRect().width / diagramPicture.getBoundingClientRect().height,
      };
    });

    expect(geometry.imageLoaded, `approved image should load at ${width}px`).toBe(true);
    expect(geometry.diagramImageLoaded, `decision diagram should load at ${width}px`).toBe(true);
    expect(geometry.diagramWidth).toBeLessThanOrEqual(width);
    expect(geometry.diagramSource).toContain(width <= 640 ? "agroindustria-decision-mobile.svg" : "agroindustria-decision-desktop.svg");
    expect(geometry.diagramAspect).toBeCloseTo(width <= 640 ? 390 / 1510 : 1440 / 980, 2);
    expect(geometry.scrollWidth, `agroindustry page should not overflow at ${width}px`).toBeLessThanOrEqual(width + 2);
    expect(geometry.visual.x).toBeGreaterThanOrEqual(0);
    expect(geometry.visual.right).toBeLessThanOrEqual(width + 2);
    if (width > 760) expect(geometry.visual.x).toBeGreaterThan(geometry.list.x);
    else expect(geometry.visual.bottom).toBeLessThanOrEqual(geometry.list.y + 1);
  }
});

test("agroindustry service decisions stay distinct and readable across breakpoints", async ({ page }) => {
  for (const width of [1440, 1024, 901, 900, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/agroindustria/#agroindustry-services-title", { waitUntil: "networkidle" });
    const section = page.locator(".agroindustry-v4-service-paths");
    const layout = await section.evaluate((element) => {
      const rect = (node: Element) => {
        const box = node.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width };
      };
      const groups = [...element.querySelectorAll<HTMLElement>(".agroindustry-v4-service-paths__group")];
      const offers = [...element.querySelectorAll<HTMLElement>(".agroindustry-v4-service-paths__offer")];
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        ids: offers.map((offer) => offer.dataset.serviceId),
        groups: groups.map((group) => ({
          heading: group.querySelector("h3")?.textContent?.trim(),
          box: rect(group),
          offers: [...group.querySelectorAll<HTMLElement>(".agroindustry-v4-service-paths__offer")].map(rect),
        })),
      };
    });

    expect(layout.document, `agroindustry services should not overflow at ${width}px`).toBeLessThanOrEqual(layout.viewport + 2);
    expect(layout.ids).toEqual(["S01", "S04", "S05", "S09", "S10", "S11", "S19", "S17"]);
    expect(layout.groups).toHaveLength(4);
    for (const group of layout.groups) {
      expect(group.box.left).toBeGreaterThanOrEqual(0);
      expect(group.box.right).toBeLessThanOrEqual(width + 2);
      expect(group.heading).toBeTruthy();
      expect(group.offers).toHaveLength(2);
      for (const offer of group.offers) {
        expect(offer.left).toBeGreaterThanOrEqual(0);
        expect(offer.right).toBeLessThanOrEqual(width + 2);
        expect(offer.width).toBeGreaterThan(0);
      }
    }
    await expect(section.getByRole("heading", { level: 2, name: "Servicios agroindustriales para necesidades concretas." })).toBeVisible();
    await expect(section.locator(".agroindustry-v4-service-paths__offer > a")).toHaveCount(8);
  }
});

test("Támesis gallery images load when the agroindustry visitor reaches the evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/agroindustria/", { waitUntil: "networkidle" });
  const photos = page.locator(".agroindustry-v4-biogas__photo");
  await expect(photos).toHaveCount(3);
  for (const photo of await photos.all()) {
    const image = photo.locator("img");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

test("municipal service offers pair clear needs, editorial visuals and direct routes responsively", async ({ page }) => {
  for (const width of [1440, 1280, 1100, 1024, 900, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/municipios/", { waitUntil: "networkidle" });
    const section = page.locator(".gt-route-section--municipal-services");
    const offers = section.locator(".gt-municipal-offer");
    await expect(section.getByRole("heading", { name: "Servicios municipales para resolver necesidades concretas." })).toBeVisible();
    await expect(offers).toHaveCount(5);
    for (const [index, offer] of (await offers.all()).entries()) {
      await expect(offer.locator("h3")).toBeVisible();
      await expect(offer.locator(".gt-municipal-offer__need")).toBeVisible();
      await expect(offer.locator(".gt-municipal-offer__scope")).toBeVisible();
      await expect(offer.locator("figcaption")).toBeVisible();
      await expect(offer.locator(".gt-municipal-offer__frame > img")).toHaveAttribute("alt", /.+/);
      const frame = await offer.locator(".gt-municipal-offer__frame").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          brandMarks: element.querySelectorAll(".gt-municipal-offer__brand-mark").length,
        };
      });
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
      if (index === 1) {
        expect(frame.width / frame.height).toBeCloseTo(4 / 3, 1);
        expect(frame.brandMarks).toBe(0);
        await expect(offer.locator(".gt-municipal-offer__frame > img")).toHaveAttribute("src", /ruta-selectiva\.jpeg/);
        await expect(offer.locator(".gt-municipal-offer__frame > img")).toHaveAttribute("alt", /vehículo convencional/);
        await expect(offer.locator("figcaption")).toContainText("destino acordado");
      }
      const links = offer.getByRole("link");
      await expect(links).toHaveCount(index === 1 || index === 2 ? 2 : 1);
      for (const link of await links.all()) await expect(link).toBeVisible();
    }

    const layout = await section.evaluate((element) => {
      const list = element.querySelector<HTMLElement>(".gt-municipal-offer-list")!;
      const articles = [...list.querySelectorAll<HTMLElement>(".gt-municipal-offer")];
      const listRect = list.getBoundingClientRect();
      return {
        pageWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        columns: getComputedStyle(list).gridTemplateColumns.trim().split(/\s+/).length,
        listWidth: listRect.width,
        closingGap: (() => {
          const closing = document.querySelector<HTMLElement>(".gt-route-section--municipal-services + .gt-route-closing");
          const lastArticle = articles.at(-1);
          return closing && lastArticle
            ? closing.getBoundingClientRect().top - lastArticle.getBoundingClientRect().bottom
            : null;
        })(),
        articles: articles.map((article) => {
          const rect = article.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width };
        }),
      };
    });

    expect(layout.scrollWidth, `Municipal offers should not overflow at ${width}px`).toBeLessThanOrEqual(layout.pageWidth + 1);
    expect(layout.closingGap).not.toBeNull();
    expect(layout.closingGap!).toBeLessThan(155);
    if (width > 1100) {
      expect(layout.columns).toBe(2);
      expect(layout.articles[0].width).toBeGreaterThan(layout.listWidth * 0.98);
      expect(layout.articles[1].left).toBeLessThan(layout.articles[2].left);
      expect(Math.abs(layout.articles[1].top - layout.articles[2].top)).toBeLessThan(2);
      expect(layout.articles[3].left).toBeLessThan(layout.articles[4].left);
    } else {
      expect(layout.columns).toBe(1);
      for (let index = 1; index < layout.articles.length; index += 1) {
        expect(layout.articles[index].top).toBeGreaterThanOrEqual(layout.articles[index - 1].bottom - 1);
      }
    }
  }
});

test("municipal collection journey preserves audience context from offer through contact at supported widths", async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/municipios/", { waitUntil: "networkidle" });
    await page.locator(".gt-municipal-offer").nth(1).getByRole("link", { name: "Conocer recolección y tratamiento" }).click();
    await expect(page).toHaveURL(/\/servicios\/recoleccion-tratamiento\/\?perfil=municipio$/);
    await expect(page.getByRole("heading", { level: 1, name: "Recolección de orgánicos con trazabilidad hasta su tratamiento." })).toBeVisible();
    const heroPhoto = page.locator("figure").first().locator("img");
    await expect(heroPhoto).toHaveCount(1);
    await expect(heroPhoto).toHaveAttribute("src", /ruta-selectiva\.jpeg/);
    await expect(heroPhoto).toHaveAttribute("alt", /vehículo convencional/);
    expect(await page.locator("html").evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(width + 1);

    await page.getByRole("link", { name: "Soy municipio o ESP" }).click();
    await expect(page).toHaveURL(/\/contacto\/\?servicio=recoleccion-tratamiento&perfil=municipio$/);
    await expect(page.getByRole("heading", { level: 1, name: /Cuéntanos qué quieres resolver/ })).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
    expect(await page.locator("html").evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
});

test("technology page distinguishes its conceptual routes and keeps the visual readable across widths", async ({ page }) => {
  await page.goto("/tecnologia/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Tecnología para tratar orgánicos y sostener la operación." })).toBeVisible();
  await expect(page.locator(".tech-process-figure")).toContainText("la corriente y las condiciones del proyecto orientan cuál conviene estudiar");
  await expect(page.locator(".tech-route-notes article")).toHaveCount(2);
  await expect(page.locator(".tech-route-notes")).toContainText("Compostaje");
  await expect(page.locator(".tech-route-notes")).toContainText("Digestión multietapa");
  await expect(page.getByRole("link", { name: "Entender el proceso" })).toHaveAttribute("href", "#proceso-anaerobio");
  await expect(page.getByRole("link", { name: "Ver el caso Támesis" })).toHaveAttribute("href", "#caso-tamesis");

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const figure = document.querySelector(".tech-process-figure")!;
      const routeNotes = document.querySelector(".tech-route-notes")!;
      return {
        pageWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        routeColumns: getComputedStyle(routeNotes).gridTemplateColumns.trim().split(/\s+/).length,
        visualOverflow: figure.scrollWidth > figure.clientWidth + 1,
      };
    });
    expect(layout.scrollWidth, `Technology page should not overflow at ${width}px`).toBe(layout.pageWidth);
    expect(layout.visualOverflow, `Editorial process figure should stay within its column at ${width}px`).toBe(false);
    expect(layout.routeColumns).toBe(width > 620 ? 2 : 1);
  }

  const conceptImage = page.locator(".tech-process-figure__visual img");
  await expect.poll(() => conceptImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const casePhoto = page.locator(".gt-tech-case-proof__main img");
  await casePhoto.scrollIntoViewIfNeeded();
  await expect.poll(() => casePhoto.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: /qué puede salir del proceso depende/i })).toBeVisible();
});

test("company PMIRS audiences read as distinct editorial contexts without a comparison table", async ({ page }) => {
  for (const width of [1440, 1280, 1024, 900, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/empresas/", { waitUntil: "networkidle" });
    const audienceItems = page.locator(".gt-company-audience > li");
    await expect(audienceItems).toHaveCount(4);
    const geometry = await audienceItems.first().evaluate((element) => {
      const list = element.parentElement!;
      const first = element.getBoundingClientRect();
      const second = list.children[1].getBoundingClientRect();
      const third = list.children[2].getBoundingClientRect();
      const firstHeading = element.querySelector("h3")!.getBoundingClientRect();
      const secondHeading = list.children[1].querySelector("h3")!.getBoundingClientRect();
      return {
        columns: getComputedStyle(list).gridTemplateColumns.split(" ").length,
        first: { left: first.left, top: first.top, right: first.right },
        second: { left: second.left, top: second.top },
        third: { left: third.left, top: third.top },
        headingOffset: secondHeading.top - firstHeading.top,
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      };
    });

    expect(geometry.document, `PMIRS audiences should not overflow at ${width}px`).toBe(geometry.viewport);
    if (width > 900) {
      expect(geometry.columns).toBe(2);
      expect(geometry.second.left).toBeGreaterThan(geometry.first.right);
      expect(geometry.headingOffset).toBeGreaterThanOrEqual(22);
      expect(geometry.third.top).toBeGreaterThan(geometry.first.top);
    } else {
      expect(geometry.columns).toBe(1);
      expect(geometry.second.left).toBeCloseTo(geometry.first.left, 0);
      expect(geometry.second.top).toBeGreaterThan(geometry.first.top);
      expect(geometry.headingOffset).toBeGreaterThan(geometry.second.top - geometry.first.top - 1);
    }
  }
});

test("Casa & Jardín hero crops its image into the full visual frame", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  expect(styles).toMatch(/\.homegarden-v4-hero figure\.homegarden-v4-hero__image img \{ object-fit: cover;/);
});

test("Casa & Jardín product index distinguishes kit-art references from standalone packshots", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  const catalog = fs.readFileSync(path.join(process.cwd(), "src/app/casa-jardin/productos/page.tsx"), "utf8");
  const productCardRule = styles.match(/\.homegarden-product-card \{[^}]+\}/)?.[0] ?? "";
  expect(styles).toContain(".homegarden-public-subpage--product-index .homegarden-product-card__media img { object-fit: contain;");
  expect(styles).toContain(".homegarden-product-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));");
  expect(productCardRule).not.toContain("border-top");
  expect(catalog).toContain("src={product.referenceImage}");
  expect(catalog).toContain("alt={product.referenceImageAlt}");
});

test("portfolio entry routes resolve and service destinations retain canonical names", async () => {
  for (const group of portfolioGroups) {
    for (const entry of group.entries) {
      const pathname = entry.href.split(/[?#]/, 1)[0];
      const segments = pathname.split("/").filter(Boolean);
      const destination = path.join(process.cwd(), "out", ...segments, "index.html");
      expect(fs.existsSync(destination), `${group.slug}/${entry.slug} points to a published route`).toBe(true);

      if (!pathname.startsWith("/servicios/")) continue;
      const slug = segments.at(-1);
      const service = services.find((item) => item.slug === slug);
      const specialServiceNames: Record<string, string> = {
        "optimizacion-composteras": "Optimización técnica del compostaje en marcha",
      };
      const canonicalName = service?.name ?? specialServiceNames[slug ?? ""];
      expect(canonicalName, `${entry.name} should map to a canonical service`).toBeDefined();
      expect(fs.readFileSync(destination, "utf8")).toContain(canonicalName);
    }
  }
});

test("portfolio index stays concise and reserves service deliverables for service fichas", async () => {
  const portfolio = htmlFor("portafolio");
  expect(portfolio).toContain("Consultoría ambiental: de la ciencia a la operación.");
  expect(portfolio).toContain("Greenatics reúne ciencia aplicada, conocimiento del sector aseo");
  expect(portfolio).toContain("diagnósticos, PGIRS y PMIRS");
  expect(portfolio).toContain("Servicios para cada tipo de operación");
  expect(portfolio).toContain("Productos agrícolas · Wondergreen");
  expect(portfolio).toContain("Herramientas para operar y decidir");
  expect(portfolio).toContain('href="#portafolio-servicios">Ver las rutas del portafolio</a>');
  expect(portfolio).toContain('href="/diagnostico/">Orientar mi proyecto</a>');
  expect(portfolio).toContain('aria-label="Rutas por tipo de cliente"');
  expect(portfolio).toContain('href="/municipios/">');
  expect(portfolio).toContain('href="/empresas/">');
  expect(portfolio).toContain('href="/agroindustria/">');
  expect(portfolio).toContain('href="/casa-jardin/#kits-v4-title">');
  expect(portfolio).toContain("Municipios y ESP");
  expect(portfolio).toContain("PMIRS, logística y aprovechamiento en unidades residenciales, centros comerciales, instituciones y otras sedes.");
  expect(portfolio).toContain("Kits de cultivo, productos Wondergreen y guías para plantas, jardines y huertas.");
  expect(portfolio).toContain("Compostaje en hileras bajo cubierta en Yarumal.");
  expect(portfolio).not.toContain(
    "Revisamos materiales, mezcla, humedad, aireación, volteo, maduración y controles para fortalecer el proceso existente.",
  );
  expect(portfolio).not.toContain("Registro de archivo de una etapa de compostaje en Yarumal; no representa el estado actual de la planta.");
  expect(portfolio).not.toContain("En esta ruta");
  expect(portfolio).not.toContain("Comenzar conversación");
  expect(portfolio).toContain('href="/portafolio/empresas/"');
  expect(portfolio).toContain('href="/portafolio/wondergreen/"');
  expect(portfolio).toContain('src="/tools/huella/dashboard.png"');
  expect(portfolio).toContain("Ejemplo de inventario climático · datos de muestra");
  expect(portfolio).toContain("datos de ejemplo para organizar fuentes, periodos y evidencias");
  expect(portfolio).toContain("Wondergreen reúne Compost, cuatro referencias sólidas organominerales ocluidas");
  expect(portfolio).toContain('aria-label="Familias de productos Wondergreen"');
  for (const familyHref of [
    "/wondergreen/productos/compost/",
    "/wondergreen/#solidos",
    "/wondergreen/#liquidos",
    "/wondergreen/#bioinsumos",
  ]) expect(portfolio).toContain(`href="${familyHref}"`);
  expect(portfolio).toContain("Referencias botánicas y microbiológicas para integrar al manejo del cultivo.");
  expect(portfolio).toContain("Los programas agronómicos integran diagnóstico, nutrición y seguimiento");
  expect(portfolio).toContain('href="/servicios/programas-wondergreen/">Diseñar un programa para mi cultivo</a>');
  expect(portfolio).not.toContain("Cada línea explica su alcance, sus entregables");
  expect(portfolioGroups).toHaveLength(6);
  for (const group of portfolioGroups) {
    expect(group.intro.length, `${group.name} should have a concise index description`).toBeLessThan(140);
  }

  const serviceDetail = htmlFor("servicios/diagnostico-residuos");
  expect(serviceDetail).toContain("Medir la corriente antes de elegir la ruta");
  expect(serviceDetail).toContain("Podemos empezar con la información que ya tienes");
});

test("portfolio line pages give hero, offer and working criterion different jobs", async () => {
  for (const group of portfolioGroups) {
    expect(group.statement.length, `${group.name} image caption should stay specific and brief`).toBeLessThan(125);
    expect(group.entryIntro.length, `${group.name} offer introduction should orient, not repeat cards`).toBeLessThan(230);
    expect(group.proofLabel).not.toBe("Qué sostiene esta línea");
    expect(group.proofCopy.length, `${group.name} closing section should stay focused`).toBeLessThan(430);
    expect(fs.existsSync(path.join(process.cwd(), "public", group.image.slice(1))), `${group.name} hero image should exist`).toBe(true);

    const page = htmlFor(`portafolio/${group.slug}`);
    expect(page).not.toContain("Qué sostiene esta línea");
    if (group.slug === "wondergreen") {
      expect(page).not.toContain('class="portfolio-v5-proof"');
    } else {
      expect(page).toContain(group.proofLabel);
      expect(page).toContain(group.proofTitle);
    }
  }

  const wondergreen = portfolioGroups.find((group) => group.slug === "wondergreen")!;
  expect(wondergreen.detailImage).toBe("/products/wondergreen-soil-roots-editorial.webp");
  expect(wondergreen.entries.find((entry) => entry.slug === "solidos")?.name).toContain("organominerales ocluidos");
  expect(wondergreen.entries.find((entry) => entry.slug === "liquidos")?.detail).toContain("digestión anaerobia multietapa");
  const wondergreenPage = htmlFor("portafolio/wondergreen");
  expect(wondergreenPage).toContain("Wondergreen Nutrients: nutrición para cada etapa del cultivo.");
  expect(wondergreenPage).toContain('src="/products/wondergreen-soil-roots-editorial.webp"');
  expect(wondergreenPage).toContain("Nutrición y manejo conectados con el suelo y el cultivo.");
  const familyStart = wondergreenPage.indexOf('class="portfolio-v5-entry portfolio-v5-entry--wondergreen"');
  const catalogStart = wondergreenPage.indexOf('class="portfolio-v5-catalog"', familyStart);
  expect(familyStart).toBeGreaterThanOrEqual(0);
  expect(catalogStart).toBeGreaterThan(familyStart);
  const familySection = wondergreenPage.slice(familyStart, catalogStart);
  expect(familySection.match(/<article\b/g)).toHaveLength(5);
  expect(familySection).not.toContain("<ul");
  expect(wondergreenPage).not.toContain('class="portfolio-v5-products"');
  expect(wondergreenPage.slice(catalogStart)).toContain("200-0-0 es la formulación de mayor concentración de nitrógeno");
  expect(wondergreenPage.slice(catalogStart)).toContain('href="/biblioteca/catalogo-wondergreen/#familias"');
  for (const image of [
    "/products/wondergreen-line-2grow.jpg",
    "/products/wondergreen-line-liquidos.jpg",
    "/products/wondergreen-line-bioinsumos-v2.jpg",
  ]) {
    expect(familySection).toContain(`src="${image}"`);
  }
  expect(familySection).toContain('src="/guides/casa-transplante-planting-detail.jpg"');
  expect(familySection).not.toContain("home-garden-not-all-stress.webp");
  expect(familySection).toContain("Planta con cepellón junto a una maceta preparada para trasplante.");
  expect(familySection).not.toMatch(/escena editorial/i);
  expect(wondergreen.entries.find((entry) => entry.slug === "solidos")?.href).toBe("/wondergreen/#solidos");

  const digital = portfolioGroups.find((group) => group.slug === "operacion-digital")!;
  expect(digital.entryIntro).toContain("no duplica las aplicaciones");
});

test("company portfolio offers pair each service with a relevant, qualified visual", () => {
  const companies = htmlFor("portafolio/empresas");
  const expected = [
    "/services/pmirs-large-generators-editorial.jpg",
    "/projects/routes/motocarguero-verde-operacion-real.webp",
    "/services/operation-follow-up-concept-v1.jpg",
  ];
  for (const image of expected) expect(companies).toContain(image);
  expect(companies).toContain("Acordar responsables y rutinas ayuda a llevar el PMIRS a cada sede.");
  expect(companies).toContain("Diseño conjunto para recolección selectiva; la ruta y su adaptación se definen para cada proyecto.");
  expect(companies).toContain("Organizaciones y grandes generadores");
  expect(companies).not.toContain("Caracterización y valorización agroindustrial");
  expect(portfolioGroups.find((group) => group.slug === "empresas")?.entries.some((entry) => entry.slug === "agroindustria")).toBe(false);
  expect(companies).toContain("Relacionar materiales, actividades y seguimiento técnico aporta contexto para la operación diaria.");
  expect(companies).not.toContain("Esquema conceptual de rutas de valorización");
  expect(companies).not.toContain("no es una captura de una planta");
  expect(companies).toContain('href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Ver alcance PMIRS');
  expect(companies).not.toContain("/projects/routes/motocarguero-ceronte-reference.png");

  const valorization = htmlFor("portafolio/valorizacion");
  expect(valorization).toContain("Caracterización y valorización agroindustrial");
  expect(valorization).toContain("La caracterización ayuda a comparar alternativas para cada corriente.");
  expect(valorization).toContain('href="/agroindustria/">Explorar la ruta agroindustrial');
  expect(valorization).toContain("El estudio identifica qué alternativa merece evaluarse y qué información hace falta.");
});

test("portfolio lines preserve their offer and prefill the intended contact profile", async () => {
  const territory = portfolioGroups.find((group) => group.slug === "territorio")!;
  expect(territory.entries.filter((entry) => entry.href === "/servicios/operacion-delegada/")).toHaveLength(1);
  expect(territory.entries.find((entry) => entry.slug === "operacion-y-direccion-tecnica")?.detail).toContain("operación integral");

  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  const expectedProfiles: Record<string, string> = {
    territorio: "esp",
    valorizacion: "proyecto",
    wondergreen: "agro",
    "clima-datos": "clima",
    "operacion-digital": "digital",
    empresas: "agroindustria",
  };
  for (const group of portfolioGroups) {
    const page = htmlFor(`portafolio/${group.slug}`);
    const contactHref = group.slug === "wondergreen" ? "/contacto/?interes=wondergreen&perfil=agro" : `/contacto/?interes=${group.slug}`;
    const contactLabel = group.slug === "wondergreen" ? "Pedir orientación agronómica" : "Conversar sobre mi proyecto";
    expect(page).toContain(`href="${contactHref}"`);
    expect(page).toContain(`class="button button--dark" href="${contactHref}">${contactLabel}</a>`);
    expect(page).not.toContain("Hablar sobre esta línea");
    expect(contactSource, `${group.slug} should arrive with context in the contact form`).toContain(`"${group.slug}": {`);
    const context = contactSource.split("\n").find((line) => line.trimStart().startsWith(`"${group.slug}":`)) || "";
    expect(context, `${group.slug} should select its intended audience`).toContain(`profile: "${expectedProfiles[group.slug]}"`);
  }
});

test("segment landings lead to specific Greenatics services without repeating the full service catalog", async () => {
  const municipalities = htmlFor("municipios");
  expect(municipalities).toContain("Del PGIRS a una operación que el territorio puede sostener.");
  expect(municipalities).toContain("llevamos las metas del PGIRS a una operación territorial viable");
  expect(municipalities).toContain("separación en la fuente, microrrutas, infraestructura de tratamiento");
  expect(municipalities).not.toContain("suministro separado");
  expect(municipalities).toContain('src="/projects/routes/motocarguero-verde-operacion-real.webp"');
  expect(municipalities).toContain('alt="Motocarguero sobre base Ceronte con contenedor verde diseñado por Greenatics para recolección selectiva de orgánicos"');
  expect(municipalities).toContain("Configuración desarrollada por Greenatics y Auteco Mobility");
  expect(municipalities).toContain("El diseño conjunto de Greenatics y Auteco Mobility se integra a microrrutas según las condiciones de cada territorio.");
  expect(municipalities).not.toContain("requerimientos técnicos y jurídicos más exigentes");
  expect(municipalities).toContain('class="container gt-route-hero__grid gt-segment-hero-grid"');
  expect(municipalities).toContain('class="button button--light gt-segment-hero__primary"');
  expect(municipalities).toContain('class="gt-route-hero__figure gt-segment-hero__visual"');
  expect(municipalities).toContain('class="button button--outline-light gt-segment-hero__secondary"');
  expect(municipalities).not.toContain('class="gt-decision-ledger"');
  expect(municipalities).not.toContain('class="gt-decision-grid"');
  expect(municipalities).toContain("El vehículo resuelve el transporte; el servicio exige una ruta que tenga sentido para el territorio y para la planta.");
  expect(municipalities).not.toContain("Antes de dimensionar la ruta, evaluamos generadores");
  expect(municipalities).toContain("Revisamos tiempos, cobertura, calidad y costos junto con el equipo local.");
  expect(municipalities).toContain("una decisión de cobertura, frecuencia y flota respaldada por datos reales.");
  expect(municipalities).toContain('src="/projects/plant/plant-evidence-02.webp"');
  expect(municipalities).toContain("Una experiencia de tratamiento y aprovechamiento que orienta la planeación territorial.");
  for (const context of ["periodo validado"]) {
    expect(municipalities).toContain(`<small>${context}</small>`);
  }
  expect(municipalities).toContain("+120 t/mes");
  expect(municipalities).toContain("96,4 %");
  expect(municipalities).not.toContain("140 km");
  expect(municipalities).not.toContain("$180 M COP/año");
  expect(municipalities).not.toContain("route-evidence-");
  expect(municipalities).not.toContain('src="/projects/routes/motocarguero-ceronte-reference.png"');
  for (const href of [
    "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal",
    "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio",
    "/servicios/plantas-modulares/?perfil=municipio",
    "/servicios/rehabilitacion-infraestructura/?perfil=municipio",
    "/servicios/operacion-delegada/?perfil=municipio",
    "/servicios/aprovechamiento-productivo/?perfil=municipio",
    "/proyectos/yarumal/?perfil=municipio",
  ]) expect(municipalities).toContain(`href="${href}"`);
  expect(municipalities).toContain("Servicios municipales para resolver necesidades concretas.");
  for (const copy of [
    "lo planificado con proyectos, responsables e indicadores de avance",
    "Diseñamos la logística para conectar generadores",
    "Para una planta nueva, comparamos alternativas y las fases de prefactibilidad e ingeniería",
    "dirección técnica, acompañamiento al equipo local o una modalidad integral",
    "Evaluamos alternativas como compostaje y digestión anaerobia",
    "Conocer recolección y tratamiento",
  ]) expect(municipalities).toContain(copy);
  expect(municipalities).toContain("Aprovechamiento productivo y bioeconomía");
  expect(municipalities).toContain("Definamos qué alternativa merece estudiarse y qué información falta.");
  expect(municipalities).not.toContain("definimos una ruta viable");
  expect(municipalities).toContain('href="/contacto/?servicio=diagnostico-residuos&perfil=municipio&diagnostico=Comparar%20alternativas%20de%20gesti%C3%B3n%20territorial&prioridad=Compartir%20el%20PGIRS%20vigente%2C%20fuentes%20y%20periodos%20de%20datos%2C%20actores%20y%20decisi%C3%B3n%20pendiente">Compartir el contexto del territorio</a>');
  expect(municipalities).not.toContain("control digital");
  expect(municipalities).toMatch(/href="\/soluciones\/viabilidad-municipal\/"[^>]*>Evaluar prefactibilidad/);
  expect(municipalities).not.toContain("Tres decisiones frecuentes");
  expectCanonicalServiceLinks(municipalities, "Municipios");

  const companies = htmlFor("empresas");
  const companiesStyles = fs.readFileSync(path.join(process.cwd(), "src/app/routes-v3.css"), "utf8");
  const companyRefreshStyles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");
  const companyContactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  expect(companies).toContain("Organiza la gestión de residuos en cada sede.");
  expect(companies).toContain('class="container gt-route-hero__grid gt-segment-hero-grid gt-company-hero-grid"');
  expect(companies).toContain('class="gt-company-hero-visual gt-segment-hero__visual"');
  expect(companies).toContain('href="/contacto/?interes=empresas&perfil=empresa&diagnostico=Ordenar%20una%20sede%20o%20corriente&prioridad=Comparte%20el%20detonante%2C%20sedes%2C%20corrientes%2C%20responsables%2C%20manejo%20actual%20y%20datos%20disponibles">Conversar sobre mi operación');
  expect(companies).toContain('href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Ver cuándo aplica el PMIRS organizacional');
  expect(companies).toContain("Organizaciones y grandes generadores");
  expect(companies).toContain("unidades residenciales, centros comerciales, instituciones");
  expect(companies).toContain('src="/services/large-generators-editorial-01.jpg"');
  expect(companies).toContain("Una rutina compartida entre sedes y equipos.");
  expect(companies).toContain("Prácticas de manejo de residuos reportadas en la encuesta CCB 2023");
  expect(companies).toContain("60,2 %");
  expect(companies).toContain("43,3 %");
  expect(companies).toContain("25,1 %");
  expect(companies).toContain("20,7 %");
  expect(companies).toContain("La pregunta permitía varias respuestas");
  expect(companies).toContain("no un resultado de clientes Greenatics");
  expect(companies).toContain('href="https://bibliotecadigital.ccb.org.co/bitstreams/300c8fb5-e67f-4004-963b-da9e6f1cc557/download"');
  expect(companies).toContain('class="gt-company-evidence__track" aria-hidden="true"');
  expect(companies).not.toMatch(/no corresponde a un cliente|imagen generada|escena editorial|no documenta/i);
  expect(companies).not.toContain('src="/projects/plant/plant-evidence-10.webp"');
  for (const audience of [
    "Unidades residenciales",
    "Centros comerciales y plazas",
    "Instituciones y campus",
    "Industrias y otros grandes generadores",
  ]) expect(companies).toContain(audience);
  for (const route of [
    'href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Planear el PMIRS de mi copropiedad',
    'href="/servicios/microrrutas-motocarguero/?perfil=empresa">Diseñar la microrruta de mi centro comercial',
    'href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Organizar el PMIRS de mi institución',
    'href="/servicios/diagnostico-residuos/?perfil=empresa">Caracterizar mis corrientes orgánicas',
  ]) expect(companies).toContain(route);
  expect(companies).toContain('href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Ver actividades y alcance del PMIRS');
  expect(companies).toContain('href="#puntos-de-entrada">Explorar las cuatro rutas de servicio');
  expect(companies).toContain("¿Qué frente de tu operación necesitas resolver?");
  expect(companies).toContain("Estas cuatro rutas profesionales abordan recolección, microrrutas, operación de plantas y valorización");
  expect(companies).toContain("Una gestión que se sostiene cuando cambia el turno.");
  expect(companies).toContain("Cuando corresponde, articulamos ese trabajo con el PMIRS");
  expect(companies).toContain("Cuando corresponde, el PMIRS orienta las medidas de cada sede.");
  expect(companies).not.toContain("El PMIRS organiza las medidas para cada sede.");
  expect(companies).not.toContain("quién separa, dónde se almacena, cuándo se entrega");
  expect(companies).not.toContain("De la planeación a la rutina diaria");
  expect(companies).toContain('class="gt-company-pmirs-scene"');
  expect(companies).toContain('src="/services/pmirs-large-generators-editorial.jpg"');
  expect(companies).not.toContain('class="gt-evidence-grid"');
  expect(companies).not.toContain("Qué cambia la ruta");
  expect(companies.split('href="/contacto/?interes=empresas&perfil=empresa&diagnostico=Ordenar%20una%20sede%20o%20corriente').length - 1).toBe(1);
  expect(companies).toContain("Definamos qué necesita funcionar en tu operación.");
  expect(companies).toContain('href="/contacto/?interes=empresas&perfil=empresa&diagnostico=Organizar%20residuos%20en%20una%20o%20varias%20sedes&prioridad=Compartir%20sedes%2C%20corrientes%2C%20responsables%20y%20necesidad%20actual">Compartir el contexto de mi operación</a>');
  for (const href of [
    "/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional",
    "/servicios/recoleccion-tratamiento/?perfil=empresa",
    "/servicios/microrrutas-motocarguero/?perfil=empresa",
    "/servicios/operacion-delegada/?perfil=empresa",
    "/servicios/aprovechamiento-productivo/?perfil=empresa",
    "/servicios/greenatics-ops/?perfil=empresa",
    "/app/",
    "/huella/",
  ]) expect(companies).toContain(`href="${href}"`);
  expect(companies).toContain('href="/contacto/?servicio=recoleccion-tratamiento&perfil=empresa"');
  expect(companies).toContain("Recolección, trazabilidad y tratamiento recurrentes");
  expect(companies).toContain("Diseño de Microrrutas con Motocarguero");
  for (const detail of [
    "Recolección, trazabilidad y tratamiento recurrentes",
    "Diseño de Microrrutas con Motocarguero",
    "Operación Integral y Continuidad Técnica de Plantas",
    "Aprovechamiento Productivo y Bioeconomía",
    "GREENATICS OPS",
    "Back 2 Green",
    "Greenatics y Auteco Mobility desarrollaron una configuración sobre base Ceronte, con un contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos",
    "El retiro periódico es distinto del diseño de una ruta nueva",
    "la dirección técnica no implica por sí sola ejecutar la operación física",
    "La configuración, los usuarios y las integraciones se revisan para cada proyecto",
    "La preparación del reporte no sustituye la revisión de las obligaciones aplicables",
  ]) expect(companies).toContain(detail);
  for (const cta of [
    "Evaluar el servicio para mi organización",
    "Conocer el diseño de microrrutas",
    "Comparar modalidades de operación",
    "Explorar rutas de valorización",
    "Abrir muestra de GREENATICS OPS",
    "Consultar configuración y acompañamiento",
    "Ver método, planes y acceso",
  ]) expect(companies).toContain(cta);
  expect(companies).toContain('class="gt-segment-offer-links gt-segment-offer-links--detailed gt-company-service-list"');
  expect(companies).toContain('class="gt-company-route-card"');
  for (const image of [
    "/services/pmirs-generators-editorial.jpg",
    "/projects/routes/motocarguero-verde-operacion-real.webp",
    "/tools/ops-plant-editorial.jpg",
    "/services/valorization-characterization-editorial.jpg",
    "/tools/huella/dashboard.png",
  ]) expect(companies).toContain(`src="${image}"`);
  expect(companies).toContain("Representación del motocarguero sobre base Ceronte con contenedor diseñado por Greenatics.");
  expect(companies).not.toContain("Diseño representado");
  expect(companies).toContain("Una profesional compara muestras de subproductos orgánicos sobre una mesa de caracterización.");
  expect(companies).toContain("Organiza fuentes, periodos y soportes a tu ritmo");
  expect(companies).toContain("Recorre una muestra pública del flujo de registros de planta.");
  expect(companyContactSource).toContain("Definir el frente adecuado para tu operación");
  expect(companyContactSource).toContain("cuántas sedes comprende y qué corrientes manejas");
  for (const stage of [
    "En el punto de generación,",
    "entre áreas y gestores,",
    "En el seguimiento,",
  ]) {
    expect(companies).toContain(`<strong>${stage}</strong>`);
  }
  expect(companiesStyles).toContain(".gt-company-audience {");
  expect(companiesStyles).not.toContain(".gt-segment-grid");
  expect(companiesStyles).toContain(".gt-segment-offer-links__details a:focus-visible");
  expect(companiesStyles).toContain("@media (max-width: 440px)");
  expect(companyRefreshStyles).toContain(".gt-route-section--company-story");
  expect(companyRefreshStyles).toContain(".gt-company-route-card__visual");
  expect(companyRefreshStyles).toContain("@media (max-width: 360px)");
  expect(companies).not.toContain("route-evidence-");
  expect(companies).not.toContain("Tres niveles de ambición que no deben confundirse.");
  expect(companies).not.toContain("gt-company-chain__photos");
  expectCanonicalServiceLinks(companies, "Empresas");

  const agroindustry = htmlFor("agroindustria");
  const agroindustryStyles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  expect(agroindustry).toContain("¿Esta corriente justifica caracterizar, pilotear o invertir?");
  expect(agroindustry).toContain("Evaluamos una corriente, un sitio y un periodo");
  expect(agroindustry).toContain("bajo qué criterios avanzar, ajustar o detener antes de comprometer inversión.");
  expect(agroindustry).toContain("Efluentes y aguas de proceso");
  expect(agroindustry).toContain("Biomasa y subproductos");
  expect(agroindustry).toContain("Lodos y fracciones semisólidas");
  expect(agroindustry).toContain("Pérdidas y excedentes de producción");
  expect(agroindustry).toContain('href="#rutas-de-valorizacion">Ver rutas de aprovechamiento');
  expect(agroindustry.split('href="/contacto/?servicio=diagnostico-residuos&perfil=agroindustria&diagnostico=Evaluar%20una%20corriente%20agroindustrial').length - 1).toBe(1);
  expect(agroindustry).toContain('aria-labelledby="agroindustry-services-title"');
  expect(agroindustry).toContain("Servicios agroindustriales para necesidades concretas.");
  expect(agroindustry).toContain("no hace falta recorrer una secuencia completa.");
  for (const serviceName of [
    "Diagnóstico y caracterización de corrientes agroindustriales",
    "Prefactibilidad técnico-económica de proyectos de valorización",
    "Diseño e ingeniería de sistemas de tratamiento y aprovechamiento",
    "Planta en Marcha: rehabilitación y puesta en operación de infraestructura existente",
    "Dirección técnica y transferencia operacional de plantas",
    "Operación integral de plantas de tratamiento y valorización",
    "Pilotos de I+D+i para la valorización agroindustrial",
    "Valorización y desarrollo técnico de productos derivados",
  ]) expect(agroindustry).toContain(serviceName);
  for (const href of [
    "/servicios/diagnostico-residuos/?perfil=agroindustria",
    "/contacto/?servicio=prefactibilidad&perfil=agroindustria",
    "/servicios/plantas-modulares/?perfil=agroindustria",
    "/servicios/rehabilitacion-infraestructura/?perfil=agroindustria",
    "/servicios/operacion-delegada/?perfil=agroindustria#modalidad-direccion-tecnica",
    "/servicios/operacion-delegada/?perfil=agroindustria#modalidad-operacion-integral",
    "/contacto/?servicio=idi-agroindustrial&perfil=agroindustria",
    "/contacto/?servicio=desarrollo-productos-derivados&perfil=agroindustria",
  ]) expect(agroindustry).toContain(`href="${href}"`);
  expect(agroindustry).toContain('href="/app/">Recorrer la muestra de OPS');
  expect(agroindustry).toContain('href="/servicios/greenatics-ops/?perfil=agroindustria">Consultar configuración para una planta');
  expect(agroindustry).not.toMatch(/Diagnóstico · S01|S04–S05|Validación · S19/);
  expect(agroindustry).not.toContain("gt-decision-bridge--compact");
  expect(agroindustry).not.toContain("Lixiviados y aguas contaminadas");
  expect(agroindustry).not.toContain('src="/projects/tamesis/sistema-uasb.png"');
  expect(agroindustry).toContain("Más de tres años de experiencia · Támesis");
  expect(agroindustry).toContain("¿Esta corriente justifica caracterizar, pilotear o invertir?");
  expect(agroindustry).toContain("Evaluamos una corriente, un sitio y un periodo");
  expect(agroindustry).toContain('href="/contacto/?servicio=diagnostico-residuos&perfil=agroindustria&diagnostico=Evaluar%20una%20corriente%20agroindustrial&prioridad=Compartir%20sitio%2C%20periodo%20o%20temporada%2C%20cantidad%2C%20calidad%2C%20manejo%20actual%20y%20destino%20posible">Evaluar mi corriente</a>');
  expect(agroindustry).toContain("En Támesis, Greenatics ha acompañado una cadena de digestión anaerobia.");
  expect(agroindustry).toContain("sus resultados se interpretan con registros de operación y se distinguen de los escenarios de diseño.");
  expect(agroindustry.match(/class="agroindustry-v4-biogas"/g)).toHaveLength(1);
  expect(agroindustry).toContain('aria-label="Etapas de la ruta de digestión anaerobia en Támesis"');
  expect(agroindustry).not.toContain("Registro fotográfico");
  expect(agroindustry).not.toContain("infraestructura documentada");
  for (const image of [
    "/projects/tamesis/recepcion-organicos.jpg",
    "/projects/tamesis/reactor-uasb.jpeg",
    "/projects/tamesis/planta-aerea.jpg",
  ]) expect(agroindustry).toContain(`src="${image}"`);
  expect(agroindustry).toContain("Contexto territorial");
  expect(agroindustry).toContain("Recepción");
  expect(agroindustry).toContain("Digestión");
  const visualStyles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  const sharedStyles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");
  expect(visualStyles).toContain(".agroindustry-v4-biogas__photo--featured .agroindustry-v4-biogas__frame { aspect-ratio: 1.85;");
  expect(visualStyles).toContain(".agroindustry-v4-biogas__photo--featured .agroindustry-v4-biogas__frame { aspect-ratio: 2.6; }");
  expect(visualStyles).toContain(".agroindustry-v4-biogas__gallery { width: min(100%, 640px); justify-self: center; }");
  expect(visualStyles).toContain("text-align: justify;");
  expect(visualStyles).toContain("text-align: start; -webkit-hyphens: none; hyphens: none;");
  expect(visualStyles).toMatch(/\.agroindustry-v4-biogas__copy > p[\s\S]*?text-align: left; hyphens: none;/);
  expect(sharedStyles).toContain("aspect-ratio: 1 / 1;");
  expect(sharedStyles).toContain("min-height: clamp(340px, 29vw, 420px);");
  expect(agroindustry.indexOf('class="agroindustry-v4-products"')).toBeGreaterThan(agroindustry.indexOf('class="agroindustry-v4-outcomes"'));
  expect(agroindustry).toContain("La valorización agrícola también depende del cultivo y su destino.");
  expect(agroindustry).toContain("Una salida para uso agronómico exige revisar el material, el proceso y la calidad que requiere el destino.");
  expect(agroindustry).toContain('href="/wondergreen/">Explorar productos Wondergreen');
  expect(agroindustry).toContain('href="/servicios/programas-wondergreen/?perfil=agroindustria">Ver acompañamiento agronómico');
  expect(agroindustry).not.toContain('aria-label="Explorar familias de producto Wondergreen"');
  expect(agroindustry).not.toContain("cinco formulaciones líquidas");
  expect(agroindustry).not.toContain("200-0-0, esta última con mayor concentración de nitrógeno");
  const outcomesStart = agroindustry.indexOf('class="agroindustry-v4-outcomes__grid"');
  const outcomesEnd = agroindustry.indexOf('<div class="button-row">', outcomesStart);
  const outcomesMarkup = agroindustry.slice(outcomesStart, outcomesEnd);
  expect(outcomesMarkup).not.toMatch(/<span>0[1-3]<\/span>/);
  expect(outcomesMarkup).not.toContain("Wondergreen");
  for (const href of [
    "/soluciones/biogas-energia/?perfil=agroindustria",
    "/proyectos/tamesis/?perfil=agroindustria",
    "/servicios/aprovechamiento-productivo/?perfil=agroindustria",
    "/servicios/programas-wondergreen/?perfil=agroindustria",
    "/wondergreen/",
  ]) expect(agroindustry).toContain(`href="${href}"`);
  expect(agroindustry.match(/class="agroindustry-v4-currents__layout"/g)).toHaveLength(1);
  expect(agroindustry.match(/class="agroindustry-v4-outcomes__grid"/g)).toHaveLength(1);
  expect(agroindustry.match(/class="agroindustry-v4-service-paths__groups"/g)).toHaveLength(1);
  expect(agroindustry.match(/class="agroindustry-v4-service-paths__group agroindustry-v4-service-paths__group--[a-z]+"/g)).toHaveLength(4);
  expect(agroindustry.match(/data-service-id="S\d+"/g)).toHaveLength(8);
  expect(agroindustryStyles).toContain(".agroindustry-v4-service-paths__groups { display: grid;");
  expect(agroindustryStyles).toContain(".agroindustry-v4-service-paths__group--assessment .agroindustry-v4-service-paths__offers");
  expect(agroindustryStyles).toContain(".agroindustry-v4-service-paths__group--operation { display: block;");
  expect(agroindustryStyles).toContain(".agroindustry-v4-service-paths__offers a:focus-visible");
  expect(agroindustryStyles).toContain(".agroindustry-v4-products__bridge { display: grid;");
  expect(agroindustryStyles).toContain(".agroindustry-v4-outcomes__grid { display: grid; grid-template-columns: 1fr; }");
  expect(agroindustryStyles).toContain(".agroindustry-v4-service-paths__offers,");
  expect(agroindustryStyles).toContain(".agroindustry-v4-service-paths__group--assessment .agroindustry-v4-service-paths__offers");
  expect(agroindustryStyles).toContain("@media (prefers-reduced-motion: reduce) {\n  .agroindustry-v4-service-paths__offer > a span { transition: none; }");
  expect(agroindustryStyles).not.toContain(".agroindustry-v4-outcomes article { min-height: 260px;");
  expectCanonicalServiceLinks(agroindustry, "Agroindustria");

  const wondergreen = htmlFor("wondergreen");
  expect(wondergreen).toContain('id="solidos"');
  expect(wondergreen).toContain('id="liquidos"');
  expect(wondergreen).toContain('id="bioinsumos"');
  expect(wondergreen).toContain("Cuatro familias. Una decisión informada para cada cultivo.");
  expect(wondergreen).toContain("Comprar en Croper");
  expect(wondergreen).toContain('href="/servicios/programas-wondergreen/">Conocer el acompañamiento agronómico');
  expect(wondergreen).toContain('href="/contacto/?interes=wondergreen&perfil=agro">Solicitar orientación para mi lote');

  const wondergreenHome = htmlFor("wondergreen/hogar");
  expect(wondergreenHome).toContain('href="/casa-jardin/kits/">Explorar kits por uso');
  expect(wondergreenHome.split('href="/contacto/?interes=wondergreen-hogar"').length - 1).toBe(1);

  const red = htmlFor("red");
  expect(red).toContain('href="/contacto/?servicio=pmirs-organizacional&amp;perfil=empresa">Consultar el alcance de un PMIRS');
  expect(red).toContain('href="/red/app/">Explorar la demo');
  expect(red).toContain("conjuntos residenciales");
  expect(red).toContain("El alcance se define según las características");
  expect(red.split('href="/contacto/?servicio=pmirs-organizacional&amp;perfil=empresa"').length - 1).toBeGreaterThanOrEqual(2);

  const technology = htmlFor("tecnologia");
  expect(technology).toContain('href="#proceso-anaerobio">Entender el proceso');
  expect(technology).toContain('href="#caso-tamesis">Ver el caso Támesis');
  expect(technology).toContain("la corriente y las condiciones del proyecto orientan cuál conviene estudiar.");
  expect(technology).toContain("Ruta aeróbica");
  expect(technology).toContain("Ruta anaerobia");
  expect(technology).toContain("Digestión anaerobia · Támesis");
  expect(technology).not.toContain("Registro fotográfico");
  expect(technology).not.toContain("infraestructura documentada");
  expect(technology).toContain("Qué puede salir del proceso depende de la corriente y su calidad.");
  expect(technology).not.toContain('class="complementary-tech"');
  expect(technology).not.toContain('class="cycle-loop"');
  expect(technology).not.toContain('class="technology-principles"');
  expect(technology).toContain('class="science-boundary-note"');
  expect(technology).toContain("esto no significa que Greenatics sea propietaria");
  expect(technology.split('href="/contacto/?servicio=prefactibilidad"').length - 1).toBe(1);

  const solutions = htmlFor("soluciones");
  expect(solutions).toContain('alt="Tres profesionales revisan material orgánico durante una caracterización en un área de compostaje."');
  expect(solutions).toContain("service-consulting-editorial.webp");
  expect(solutions).toContain("Analizar el material y el proceso ayuda a definir una ruta de tratamiento adecuada.");
  expect(solutions).not.toContain("route-evidence-");
  expect(solutions).not.toContain("fotografía documental de archivo");
  expect(solutions).not.toContain("registro de archivo");
  expect(solutions).not.toContain("<span>01</span>");
  for (const href of ["/municipios/", "/empresas/", "/agroindustria/", "/casa-jardin/", "/contacto/?interes=instituciones-alianzas", "/proyectos/yarumal/", "/proyectos/tamesis/", "/herramientas/"]) {
    expect(solutions).toContain(`href="${href}"`);
  }
  expect(solutions).toContain('href="/contacto/?interes=soluciones">Describir mi necesidad</a>');
  expect(solutions).toContain('href="/herramientas/">Explorar plataformas y herramientas');
  expect(solutions).not.toContain("Trazabilidad, indicadores, productos y destinos que conectan el resultado con nuevas decisiones.");
  expect(solutions).not.toContain("gt-system-line");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  expect(contactSource).toContain('"soluciones": {');
  expect(contactSource).toContain('"soluciones": { label: "Soluciones Greenatics", title: "Conectar una necesidad con la ruta adecuada"');
  expect(contactSource.match(/"soluciones": \{[^\n]+profile: "proyecto"/)).not.toBeNull();
});

test("each digital tool has a distinct contextual implementation route", async () => {
  const tools = htmlFor("herramientas");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  expect(tools).toContain('src="/tools/digital-tools-field-v1.jpg"');
  expect(tools).toContain("Cinco experiencias para operar, medir y decidir.");
  expect(tools).toContain("Elige la herramienta por la decisión que necesitas sostener.");
  for (const tool of digitalTools) {
    const requestHref = tool.requestHref ?? `/contacto/?interes=${tool.implementationInterest}`;
    expect(tools, `${tool.name} should expose its contextual next step`).toContain(`href="${requestHref}">${tool.requestLabel}`);
  }

  for (const [interest, expected] of [
    ["greenatics-ops", 'profile: "digital"'],
    ["greenatics-red", 'profile: "territorio"'],
    ["calcula-tu-huella", 'profile: "clima"'],
    ["agroway", 'profile: "agro"'],
    ["sana", 'profile: "proyecto"'],
  ]) {
    const context = interest === "greenatics-red"
      ? contactSource.slice(contactSource.indexOf("const greenaticsRedContactContext"), contactSource.indexOf("const platformAccessContactContext"))
      : contactSource.split("\n").find((line) => line.trimStart().startsWith(`"${interest}":`)) || "";
    expect(context, `${interest} should preselect the corresponding audience`).toContain(expected);
  }
});

test("project index exposes Yarumal's annualized scenario and avoids a second case comparison", async () => {
  const projects = htmlFor("proyectos");
  expect(projects).toContain("Indicadores del caso Yarumal y escenario económico anualizado");
  expect(projects).toContain("Ahorro anualizado en fletes");
  expect(projects).toContain("+120 t/mes");
  expect(projects).not.toContain("96,4 %");
  expect(projects).not.toContain("140 km");
  expect(projects.toLowerCase()).toContain("escenario anualizado");
  expect(projects).toContain("/projects/tamesis/paisaje-tamesis.jpg");
  expect(projects).toContain('alt="Entorno e infraestructura de aprovechamiento en Támesis"');
  expect(projects).not.toContain("Registro de archivo");
  expect(projects).not.toContain("/projects/tamesis/sistema-uasb.png");
  expect(projects).toContain("Ruta de aprovechamiento energético");
  expect(projects).not.toContain("Aprovechamiento en operación");
  expect(projects).not.toContain("gt-projects-compare");
  expect(projects).toContain("GREENATICS OPS ayuda a enlazar pesajes");
});

test("below-the-fold case photos defer loading until they approach the viewport", () => {
  const projectsSource = fs.readFileSync(path.join(process.cwd(), "src", "app", "proyectos", "page.tsx"), "utf8");
  const caseSection = projectsSource.match(/<section className="gt-projects-cases"[\s\S]*?<\/section>/)?.[0] ?? "";
  const projectImages = Array.from(caseSection.matchAll(/<Image\b[\s\S]*?\/>/g), ([markup]) => markup);
  const homeSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "home-territory-showcase.tsx"), "utf8");
  const homeCaseImage = homeSource.match(/<Image\b[\s\S]*?src=\{yarumalProcess\.src\}[\s\S]*?\/>/)?.[0] ?? "";
  const eagerOverrides = /\b(?:loading=["']eager["']|preload(?:\s|=)|fetchPriority=["']high["'])/;

  expect(projectImages).toHaveLength(2);
  expect(projectImages.every((markup) => !eagerOverrides.test(markup))).toBe(true);
  expect(homeCaseImage).not.toBe("");
  expect(homeCaseImage).not.toMatch(eagerOverrides);
});

test("Yarumal and Támesis case pages keep evidence in context and avoid repeating the process", async () => {
  const yarumal = htmlFor("proyectos/yarumal");
  expect(yarumal).toContain("/projects/plant/plant-evidence-10.webp");
  expect(yarumal).toContain("/projects/plant/plant-evidence-02.webp");
  expect(yarumal).toContain("Yarumal · imagen del archivo del proyecto");
  expect(yarumal).toContain("La cadena también se entiende desde lo que ocurre en planta.");
  expect(yarumal).toContain("Indicadores con su alcance visible");
  expect(yarumal).toContain("+120 t/mes");
  expect(yarumal).toContain("96,4 %");
  expect(yarumal).toContain("140 km");
  expect(yarumal).toContain("$180 M COP/año");
  expect(yarumal).toContain("Caso Yarumal · periodo validado");
  expect(yarumal).toContain("Caso Yarumal · ruta validada");
  expect(yarumal).toContain("Caso Yarumal · escenario anualizado");
  expect(yarumal).toContain("Cómo leer los resultados");
  expect(yarumal).not.toContain("Metodología de los claims");
  expect(yarumal).not.toContain("Tres capas de lectura");
  expect(yarumal).not.toContain("Escalar después de aprender.");
  expect(yarumal).not.toContain("Pesaje y trazabilidad en campo");
  expect(yarumal).toContain("Yarumal: más de cinco años articulando separación, microrrutas y compostaje.");
  expect(yarumal).toContain("Hogares y organizaciones separan sus residuos orgánicos; las microrrutas los llevan a recepción y compostaje.");
  expect(yarumal).toContain("la ESP Aguas del Norte");
  expect(yarumal).toContain("Greenatics consolidó la ruta selectiva y acompañó la operación");
  expect(yarumal).toContain("recepción, caracterización y compostaje por lote");
  expect(yarumal).toContain("grupo de investigación indexado");
  expect(yarumal).toContain("plant-evidence-06.webp");
  expect(yarumal).toContain('alt="Material orgánico en proceso de compostaje en Yarumal"');
  expect(yarumal).toContain("Compostaje bajo cubierta en Yarumal");
  expect(yarumal).not.toContain("fotografía de archivo");
  expect(yarumal).not.toContain("Registro de archivo");
  expect(yarumal).not.toContain("no representa el estado actual ni constituye por sí sola un resultado analítico");
  expect(yarumal).not.toContain("gt-case-gallery");
  expect(yarumal).not.toContain("plant-evidence-09.webp");
  expect(yarumal).not.toContain("route-evidence-");
  expect(yarumal).not.toContain("/projects/yarumal/aerial-");

  const tamesis = htmlFor("proyectos/tamesis").toLowerCase();
  expect(tamesis).toContain("cuatro frentes conectan la capacidad instalada con un valor verificable.");
  expect(tamesis).toContain("8–14 t co₂e/mes");
  expect(tamesis).toContain("no es una medición, verificación ni reducción acreditada");
  expect(tamesis).not.toContain("Tres capas de lectura");
  expect(tamesis).not.toContain("gt-tamesis-system__steps");
  expect(tamesis).not.toContain("#lectura");
  expect(tamesis).toContain("href=\"#sistema\">proceso y rutas</a>");
  expect(tamesis).toContain("primero revisemos continuidad, datos y destinos.");
  expect(tamesis).toContain("href=\"/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio");
  expect(tamesis).toContain("href=\"/app/\">explorar greenatics ops</a>");
  expect(tamesis).not.toContain("ruta-selectiva.jpeg");
  expect(tamesis).not.toContain("paisaje-tamesis.jpg");
  expect(tamesis).toContain("del material recibido salen dos rutas de aprovechamiento.");
  expect(tamesis).toContain("reactor-uasb.jpeg");
  expect(tamesis).toContain("fracción líquida · percolado");
  expect(tamesis).toContain("fracción sólida");
  expect(tamesis).toContain("digestión anaerobia en uasb");
  expect(tamesis).toContain("la biomasa acondicionada se separa en una ruta líquida para digestión anaerobia y otra sólida para estabilización y compostaje.");
  expect(tamesis).not.toContain("no es un plano, una imagen a escala");
  expect(tamesis).not.toContain('src="/projects/tamesis/sistema-uasb.png"');
  expect(tamesis).not.toContain("recepcion-organicos.jpg");
});

test("Támesis plant assessment opens the rehabilitation context and keeps the visitor profile", async ({ page }) => {
  await page.goto("/proyectos/tamesis/?perfil=municipio");
  await page.getByRole("link", { name: "Evaluar una planta existente" }).click();

  await expect(page).toHaveURL(/\/contacto\/?\?servicio=rehabilitacion-infraestructura&perfil=municipio(?:&|$)/);
  await expect(page.getByRole("status")).toContainText("Ruta sugerida: Evaluar una planta existente en Támesis");
  await expect(page.getByRole("button", { name: "Municipio \/ ESP" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Municipio o empresa de servicios públicos *")).toBeVisible();

  await page.goto("/proyectos/tamesis/?perfil=agroindustria");
  await page.getByRole("link", { name: "Evaluar una planta existente" }).click();

  await expect(page).toHaveURL(/\/contacto\/?\?servicio=rehabilitacion-infraestructura&perfil=agroindustria(?:&|$)/);
  await expect(page.getByRole("status")).toContainText("Ruta sugerida: Evaluar una planta existente en Támesis");
  await expect(page.getByRole("button", { name: "Agroindustria \/ proyecto productivo" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Agroindustria o proyecto productivo *")).toBeVisible();
});

test("public impact language distinguishes Yarumal results from estimates and preserves case context in climate inquiries", async () => {
  const impact = htmlFor("impacto");
  expect(impact).toContain("Indicadores operativos validados y escenario económico del caso Yarumal");
  expect(impact).toContain("Resultados operativos y escenario anualizado");
  expect(impact).toContain("Ver indicadores y escenario</a>");
  expect(impact).toContain("La distancia comparada describe un cambio de recorrido, no una reducción de gases de efecto invernadero.");
  expect(impact).toContain("En otros territorios, los resultados dependerán de la generación, las rutas, la infraestructura y el periodo evaluado.");
  expect(impact).toContain("diagnostico=Evaluar%20escenario%20GEI%20de%20Yarumal");
  expect(impact).not.toContain("claim climático");
  expect(impact).not.toContain("Claims del caso");
  expect(impact).not.toContain("resultados validados y publicables");

  const impactSource = fs.readFileSync(path.join(process.cwd(), "src/app/impacto/page.tsx"), "utf8");
  expect(impactSource).toContain('<dl className="gt-impact-tamesis__variables">');
  expect(impactSource).not.toContain("padStart(2, \"0\")");
  expect(impactSource).not.toContain("governanceSteps");
  expect(impactSource).toContain("gt-impact-governance__narrative");

  const tamesis = htmlFor("proyectos/tamesis");
  expect(tamesis).toContain("Evaluar el escenario de GEI");
  expect(tamesis).toContain("diagnostico=Evaluar%20escenario%20potencial%20de%20CO%E2%82%82e%20en%20T%C3%A1mesis");
  expect(tamesis).toContain("prioridad=L%C3%ADnea%20base%2C%20entradas%2C%20biog%C3%A1s%20medido");

  const portfolio = htmlFor("portafolio/operacion-digital");
  expect(portfolio).toContain("Casos y metodología para explicar resultados con contexto");
  expect(portfolio).not.toContain("para sustentar claims");

  const digitalIndex = fs.readFileSync(path.join(process.cwd(), "src/components/digital-tools-index.tsx"), "utf8");
  expect(digitalIndex).toContain('note: "casos, método y resultados"');
  expect(digitalIndex).not.toContain("claims");

  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/routes-v3.css"), "utf8");
  expect(styles).toMatch(/\.gt-case-hero__copy \.button-row \{\s*display: flex;\s*flex-wrap: wrap;\s*align-items: flex-start;\s*gap: 12px;/);
  expect(styles).toContain(".gt-yarumal-hero .gt-case-hero__grid");
  expect(styles).toContain(".gt-yarumal-hero .gt-case-hero__main-image");
});

test("public project and impact pages distinguish archive photography, diagram and concept art", async () => {
  const home = htmlFor("");
  expect(home).toContain("Consultoría, ciencia y operación para retos ambientales reales.");
  expect(home).toContain("Wondergreen: nutrición para suelo y cultivo, con una línea para cada etapa.");
  expect(home).toContain("service-consulting-editorial.webp");
  expect(home).not.toContain("plant-evidence-01.webp");
  expect(home).not.toContain("/projects/yarumal/aerial-");
  expect(home).not.toContain("route-evidence-");
  expect(home).toContain("motocarguero-verde-operacion-real");
  expect(home).toContain("Base Ceronte · contenedor verde Greenatics");
  expect(home).toContain("ruta-selectiva.jpeg");
  expect(home).toContain("paisaje-tamesis.jpg");

  const projects = htmlFor("proyectos");
  expect(projects).toContain("Yarumal · Compostaje bajo cubierta");
  expect(projects).toContain("Pilas de compostaje bajo cubierta en Yarumal");
  expect(projects).toContain("+120 t/mes");
  expect(projects).toContain("periodo validado");
  expect(projects).toContain("$180 M COP/año");
  expect(projects).toContain("escenario anualizado");
  expect(projects).toContain("30 m³");
  expect(projects).toContain("Reactor UASB instalado");
  expect(projects).not.toMatch(/escena editorial|no documenta|archivo fotográfico/i);
  expect(projects).not.toContain("infraestructura documentada");
  expect(projects).not.toContain("planta-aerea.jpg");

  const tamesis = htmlFor("proyectos/tamesis");
  expect(tamesis).toContain("60–90 t/mes");
  expect(tamesis).toContain("no es un promedio reportado del periodo actual");
  expect(tamesis).toContain("8–14 t CO₂e/mes");
  expect(tamesis).toContain("No es una medición, verificación ni reducción acreditada");

  const impact = htmlFor("impacto");
  expect(impact).toContain("La estimación de CO₂e se construye a partir de variables y supuestos del proceso.");
  expect(impact).toContain("El escenario de CO₂e tampoco representa una reducción medida o verificada.");
  expect(impact).toContain("Una etapa de la ruta que conecta recolección selectiva, tratamiento y aprovechamiento.");
  expect(impact).not.toContain("route-evidence-");

  const tools = htmlFor("herramientas");
  expect(tools).toContain('src="/tools/digital-tools-field-v1.jpg"');
  expect(tools).toContain("Profesionales ambientales revisan información de operación en una planta de aprovechamiento de orgánicos.");
  for (const status of ["Muestra pública · datos ficticios", "Demo navegable · desarrollo en curso", "En desarrollo · muestra conceptual"]) {
    expect(tools).toContain(status);
  }
  expect(tools).toContain('href="/huella/"');
  const huellaAvailability = [
    "Acceso con cuenta",
    "Acceso remoto no disponible",
    "Entorno remoto configurado · validar conexión",
    "URL local configurada · requiere servidor activo",
  ].find((status) => tools.includes(status));
  expect(huellaAvailability, "Back 2 Green should describe its runtime availability").toBeTruthy();
  if (huellaAvailability === "Acceso remoto no disponible") {
    expect(tools).toContain("Ver plataforma y planes");
    expect(tools).toContain("Solicitar demo guiada o acceso");
  } else {
    expect(tools).toContain("Entrar a Back 2 Green");
  }
  expect(tools).not.toContain("resultado publicable requiere");
  expect(tools).not.toContain("plant-evidence-");
});

test("segment and solution contact links resolve to distinct form contexts", async () => {
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  for (const key of ["empresas", "agroindustria", "wondergreen", "municipios", "instituciones-alianzas", "soluciones"]) {
    expect(contactSource).toContain(`"${key}": {`);
  }
});

test("recurrent collection routes preserve each audience in its service inquiry", async ({ page }) => {
  const municipalities = htmlFor("municipios");
  const organizations = htmlFor("empresas").replaceAll("&amp;", "&");
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");

  expect(municipalities).toContain('href="/contacto/?servicio=recoleccion-tratamiento&perfil=municipio"');
  expect(organizations).toContain('href="/contacto/?servicio=recoleccion-tratamiento&perfil=empresa"');
  expect(contactSource).toMatch(/municipio:\s*"esp"/);
  expect(contactSource).toMatch(/empresa:\s*"agroindustria"/);
  await page.goto("/municipios/");
  await page.getByRole("link", { name: "Evaluar el servicio" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=recoleccion-tratamiento&perfil=municipio$/);
  await expect(page.getByRole("button", { name: "Municipio / ESP" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Coordinar la recolección y el tratamiento recurrentes")).toBeVisible();

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Evaluar el servicio para mi organización" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=recoleccion-tratamiento&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Coordinar la recolección y el tratamiento recurrentes")).toBeVisible();
});

test("company operation and valorization journeys preserve the organization profile to contact", async ({ page }) => {
  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Comparar modalidades de operación" }).click();
  await expect(page).toHaveURL(/\/servicios\/operacion-delegada\/?\?perfil=empresa$/);
  await page.getByRole("link", { name: "Solicitar propuesta de operación" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=operacion-delegada&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Explorar rutas de valorización" }).click();
  await expect(page).toHaveURL(/\/servicios\/aprovechamiento-productivo\/?\?perfil=empresa$/);
  await page.getByRole("link", { name: "Evaluar una ruta de valorización" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=aprovechamiento-productivo&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Biomasa, productos y energía");
});

test("agroindustry operation offers land on the matching operating modality", async ({ page }) => {
  await page.goto("/agroindustria/");
  await page.getByRole("link", { name: "Conocer la dirección técnica" }).click();
  await expect(page).toHaveURL(/\/servicios\/operacion-delegada\/?\?perfil=agroindustria#modalidad-direccion-tecnica$/);
  const technicalDirection = page.locator("#modalidad-direccion-tecnica");
  await expect(technicalDirection).toBeInViewport();
  await expect(technicalDirection.locator("h3")).toHaveText("Dirección técnica");
  await expect(technicalDirection).toContainText("mantiene la operación cotidiana");

  await page.goto("/agroindustria/");
  await page.getByRole("link", { name: "Revisar modalidades de operación" }).click();
  await expect(page).toHaveURL(/\/servicios\/operacion-delegada\/?\?perfil=agroindustria#modalidad-operacion-integral$/);
  const integralOperation = page.locator("#modalidad-operacion-integral");
  await expect(integralOperation).toBeInViewport();
  await expect(integralOperation.locator("h3")).toHaveText("Operación integral");
  await expect(integralOperation).toContainText("asume la ejecución diaria incluida en el contrato");
});

test("company offer arrows stay aligned with their labels at narrow widths", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/empresas/#puntos-de-entrada", { waitUntil: "networkidle" });
    const rows = page.locator(".gt-company-route-card .gt-segment-offer-links__details > a:not(.gt-company-route-card__contact)");
    await expect(rows).toHaveCount(4);
    const offsets = await rows.evaluateAll((links) => links.map((link) => {
      const textNode = [...link.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      const arrow = link.querySelector("span")?.getBoundingClientRect();
      if (!textNode || !arrow) return Number.POSITIVE_INFINITY;
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const lines = [...range.getClientRects()];
      const lastLine = lines.at(-1);
      return lastLine ? Math.abs((lastLine.top + lastLine.bottom) / 2 - (arrow.top + arrow.bottom) / 2) : Number.POSITIVE_INFINITY;
    }));
    expect(offsets, `CTA arrows should remain with their labels at ${width}px`).toEqual(offsets.map(() => expect.any(Number)));
    for (const offset of offsets) expect(offset, `CTA arrow detached from its label at ${width}px`).toBeLessThanOrEqual(8);
  }
});

test("company landing keeps the new general handoff and four service photos legible at five widths", async ({ page }) => {
  const contextualContact = "/contacto/?interes=empresas&perfil=empresa&diagnostico=Organizar%20residuos%20en%20una%20o%20varias%20sedes&prioridad=Compartir%20sedes%2C%20corrientes%2C%20responsables%20y%20necesidad%20actual";

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 920 });
    await page.goto("/empresas/", { waitUntil: "networkidle" });
    const imageLocators = page.locator(".gt-company-route-card figure img");
    for (let index = 0; index < await imageLocators.count(); index += 1) {
      const image = imageLocators.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }

    const result = await page.evaluate(() => {
      const links = [...document.querySelectorAll<HTMLAnchorElement>(".gt-company-hero__primary, .gt-company-hero__routes")];
      const cards = [...document.querySelectorAll<HTMLElement>(".gt-company-route-card")];
      return {
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        primary: document.querySelector<HTMLAnchorElement>(".gt-company-hero__primary")?.getAttribute("href"),
        contextualPmirs: document.querySelector<HTMLAnchorElement>(".gt-route-hero--company-editorial .gt-route-hero__copy .lead a")?.getAttribute("href"),
        routes: document.querySelector<HTMLAnchorElement>(".gt-company-hero__routes")?.getAttribute("href"),
        closingContact: document.querySelector<HTMLAnchorElement>(".gt-route-closing--company .button")?.getAttribute("href"),
        heroActions: links.map((link) => {
          const rect = link.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
        }),
        photos: cards.map((card) => {
          const image = card.querySelector<HTMLImageElement>("figure img");
          const figure = card.querySelector<HTMLElement>("figure");
          return {
            ready: Boolean(image?.complete && image.naturalWidth > 0),
            alt: image?.alt ?? "",
            widthRatio: figure && card.getBoundingClientRect().width > 0
              ? figure.getBoundingClientRect().width / card.getBoundingClientRect().width
              : 0,
          };
        }),
        storyParagraphs: document.querySelectorAll(".gt-company-pmirs-copy__story").length,
        storyLists: document.querySelectorAll(".gt-company-pmirs-copy ul, .gt-company-pmirs-copy ol").length,
        generalContactCount: [...document.querySelectorAll<HTMLAnchorElement>('a[href="/contacto/?interes=empresas"]')].length,
      };
    });

    expect(result.scrollWidth, `company landing should not overflow at ${width}px`).toBeLessThanOrEqual(result.viewport + 1);
    expect(result.primary).toBe("/contacto/?interes=empresas");
    expect(result.contextualPmirs).toBe("/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional");
    expect(result.routes).toBe("#puntos-de-entrada");
    expect(result.closingContact).toBe(contextualContact);
    expect(result.heroActions).toHaveLength(2);
    for (const action of result.heroActions) {
      expect(action.width, `hero action should remain visible at ${width}px`).toBeGreaterThan(0);
      expect(action.left, `hero action should stay inside the viewport at ${width}px`).toBeGreaterThanOrEqual(-1);
      expect(action.right, `hero action should stay inside the viewport at ${width}px`).toBeLessThanOrEqual(result.viewport + 1);
      expect(action.height, `hero action should preserve a usable target at ${width}px`).toBeGreaterThanOrEqual(44);
    }
    expect(result.photos, `all offer photos should load with descriptive alternatives at ${width}px`).toHaveLength(4);
    for (const photo of result.photos) {
      expect(photo.ready, `offer photo should load at ${width}px`).toBe(true);
      expect(photo.alt.trim().length, `offer photo should have alt text at ${width}px`).toBeGreaterThan(10);
      expect(photo.widthRatio, `offer photo should remain prominent at ${width}px`).toBeGreaterThanOrEqual(.3);
    }
    expect(result.storyParagraphs).toBe(1);
    expect(result.storyLists).toBe(0);
    expect(result.generalContactCount).toBe(1);
  }

});

test("company hero focus moves between the general action, route link and PMIRS context with a visible ring", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/empresas/", { waitUntil: "networkidle" });

  const primary = page.locator(".gt-company-hero__primary");
  const routes = page.locator(".gt-company-hero__routes");
  const pmirs = page.locator(".gt-route-hero--company-editorial .gt-route-hero__copy .lead a");

  await primary.focus();
  await page.keyboard.press("Tab");
  await expect(routes).toBeFocused();
  const routesOutline = await routes.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
  });
  expect(routesOutline.style).not.toBe("none");
  expect(routesOutline.width).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Shift+Tab");
  await expect(primary).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(pmirs).toBeFocused();
  const pmirsOutline = await pmirs.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
  });
  expect(pmirsOutline.style).not.toBe("none");
  expect(pmirsOutline.width).toBeGreaterThanOrEqual(2);
});

test("organization audience links stay readable and reachable across screen widths", async ({ page }) => {
  for (const width of [1440, 1024, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/empresas/", { waitUntil: "networkidle" });
    const links = page.locator(".gt-company-audience__action");
    await expect(links).toHaveCount(4);

    const geometry = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      links: [...document.querySelectorAll<HTMLElement>(".gt-company-audience__action")].map((link) => {
        const rect = link.getBoundingClientRect();
        return { width: rect.width, height: rect.height, right: rect.right };
      }),
    }));

    expect(geometry.scrollWidth, `organization landing should fit ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
    for (const [index, link] of geometry.links.entries()) {
      expect(link.width, `audience action ${index + 1} should be visible at ${width}px`).toBeGreaterThan(0);
      expect(link.height, `audience action ${index + 1} should meet the 44px touch target at ${width}px`).toBeGreaterThanOrEqual(44);
      expect(link.right, `audience action ${index + 1} should fit at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 1);
    }
  }
});

test("contact form labels and scale prompts adapt to each audience", async () => {
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  for (const copy of [
    "Municipio o empresa de servicios públicos *",
    "Organización o gran generador *",
    "Finca o unidad productiva *",
    "Hogar, jardín o huerta *",
    "Espacio, plantas o kits de interés",
    "currentProfile.entityLabel",
    "currentProfile.entityPlaceholder",
    "currentProfile.scaleLabel",
  ]) expect(contactSource).toContain(copy);
  expect(contactSource).toContain('currentProfile.entityLabel.replace(" *", "")');
  expect(contactSource).toContain("currentProfile.scaleLabel");
  expect(contactSource).toContain("context?.profile === profile ? context : null");
  expect(contactSource).toContain('context?.title || "Orientación general"');
  expect(contactSource).toContain('placeholder="nombre@correo.com"');
});

test("kit product references are not numbered as a use sequence", () => {
  const kitPage = fs.readFileSync(path.join(process.cwd(), "src/app/casa-jardin/kits/[slug]/page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-v4.css"), "utf8");
  const stageLinksBlock = kitPage.match(/const stageLinks: Record<string, string> = \{([^}]+)\};/)?.[1] ?? "";
  const stageLinks = Object.fromEntries([...stageLinksBlock.matchAll(/([A-Z]+): "([^"]+)"/g)].map(([, stage, href]) => [stage, href]));

  expect(kitPage).toContain("kit.composition.map((item) =>");
  expect(kitPage).not.toContain("<span>0{index + 1}</span>");
  expect(kitPage).toContain("<ol>{kit.route.map((step, index) =>");
  expect(styles).not.toContain(".homegarden-detail-composition article > span");
  expect(styles).toContain(".homegarden-detail-composition h3 { margin: 0 0 8px;");

  expect(casaJardinKits.length).toBeGreaterThan(0);
  for (const kit of casaJardinKits) {
    expect(kit.route.length, `${kit.name} should retain ordered usage guidance`).toBeGreaterThan(0);
    for (const reference of kit.composition) {
      const stage = reference.split(" · ")[0];
      const product = casaJardinProducts.find((item) => item.name === stage);
      expect(product, `${kit.name} should refer to a known Casa & Jardín product: ${stage}`).toBeDefined();
      expect(stageLinks[stage], `${stage} should link to its product detail`).toBe(`/casa-jardin/productos/${product!.slug}/`);
    }
  }
  expect(fs.existsSync(path.join(process.cwd(), "src/app/casa-jardin/productos/[slug]/page.tsx"))).toBe(true);
});

test("kit listing images below the hero keep Next.js lazy loading by default", () => {
  const kitPage = fs.readFileSync(path.join(process.cwd(), "src/app/casa-jardin/kits/page.tsx"), "utf8");
  const listing = kitPage.match(/<section className="homegarden-public-section" id="kits">([\s\S]*?)<\/section>/)?.[1] ?? "";
  const images = Array.from(listing.matchAll(/<Image\b[\s\S]*?\/>/g), ([markup]) => markup);

  expect(images.length).toBeGreaterThan(0);
  expect(images.every((markup) => !/\b(?:priority|preload|fetchPriority|loading\s*=\s*["'](?:eager|auto)["'])/.test(markup))).toBe(true);
});

test("product and kit inquiries carry the selected Casa & Jardín item to contact", async () => {
  const expectSpecificInquiry = (html: string, linkText: string, itemName: string) => {
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    const inquiry = links.find(([, , text]) => text?.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() === linkText);
    expect(inquiry, `${linkText} should be present`).toBeDefined();
    const destination = new URL(inquiry![1], "https://greenatics.test");
    expect(destination.pathname).toBe("/contacto/");
    expect(destination.searchParams.get("interes")).toBe("casa-jardin");
    expect(destination.searchParams.get("perfil")).toBe("hogar");
    expect(destination.searchParams.get("diagnostico")).toContain(itemName);
    expect(destination.searchParams.get("prioridad")).toBeTruthy();
  };

  const productHtml = htmlFor("casa-jardin/productos/crece");
  expectSpecificInquiry(productHtml, "Consultar CRECE", "CRECE");
  const kitHtml = htmlFor("casa-jardin/kits/mi-huerta");
  expectSpecificInquiry(kitHtml, "Consultar este kit", "Mi Huerta");
  expect(kitHtml).not.toContain("Consultar disponibilidad");
});

test("all public contact links resolve to known contexts without duplicate destinations per page", async () => {
  const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  const contextBlock = contactSource.split("const contactContexts = {")[1]?.split("} as const;")[0] ?? "";
  const knownContexts = new Set([...contextBlock.matchAll(/"([^"]+)":/g)].map((match) => match[1]));
  for (const service of services) knownContexts.add(service.slug);

  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(path.join(process.cwd(), "out"));

  const duplicates: string[] = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
    const counts = new Map<string, number>();
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      const url = new URL(href, "https://greenatics.test");
      if (url.pathname !== "/contacto/") continue;
      const context = url.searchParams.get("servicio") || url.searchParams.get("interes");
      if (!context) continue;

      expect(knownContexts.has(context), `${file} links to an unrecognized contact context: ${context}`).toBe(true);
      const query = [...url.searchParams.entries()]
        .sort(([leftKey, leftValue], [rightKey, rightValue]) => leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue))
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      const destination = `${url.pathname}?${query}`;
      counts.set(destination, (counts.get(destination) ?? 0) + 1);
    }

    for (const [destination, count] of counts) {
      if (count > 1) duplicates.push(`${file.replace(`${process.cwd()}/out/`, "/")}: ${destination} (${count})`);
    }
  }

  expect(htmlFiles.length).toBeGreaterThan(0);
  expect(duplicates).toEqual([]);
});

test("primary content buttons do not repeat the same destination on a page", async () => {
  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(path.join(process.cwd(), "out"));

  const duplicates: string[] = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
    const content = main.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, "");
    const destinations = new Map<string, number>();

    for (const [, attributes] of content.matchAll(/<a\b([^>]*)>/g)) {
      const href = attributes.match(/\bhref="([^"]+)"/)?.[1];
      const className = attributes.match(/\bclass="([^"]+)"/)?.[1] ?? "";
      if (!href || !className.split(/\s+/).includes("button")) continue;

      const url = new URL(href, "https://greenatics.test");
      if (url.origin !== "https://greenatics.test") continue;
      const query = [...url.searchParams.entries()]
        .sort(([leftKey, leftValue], [rightKey, rightValue]) => leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue))
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
      const destination = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
      destinations.set(destination, (destinations.get(destination) ?? 0) + 1);
    }

    for (const [destination, count] of destinations) {
      if (count > 1) duplicates.push(`${file.replace(`${process.cwd()}/out/`, "/")}: ${destination} (${count})`);
    }
  }

  expect(htmlFiles.length).toBeGreaterThan(0);
  expect(duplicates).toEqual([]);
});

test("municipal microroute reads as an ordered sequence without horizontal overflow", async ({ page }) => {
  const widths = [1440, 980, 390, 320];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/municipios/", { waitUntil: "networkidle" });

    const steps = page.getByRole("list", { name: "Cinco etapas para diseñar y validar una microrruta selectiva" });
    await expect(steps.locator(":scope > li")).toHaveCount(5);

    const layout = await steps.evaluate((element) => {
      const items = [...element.children];
      return {
        columns: getComputedStyle(element).gridTemplateColumns.split(" ").length,
        pageWidth: document.documentElement.clientWidth,
        pageScrollWidth: document.documentElement.scrollWidth,
        tops: items.map((item) => item.getBoundingClientRect().top),
      };
    });

    expect(layout.pageScrollWidth).toBeLessThanOrEqual(layout.pageWidth);
    expect(layout.columns).toBe(width > 980 ? 5 : 1);
    if (width <= 980) {
      expect(layout.tops.every((top, index, tops) => index === 0 || top > tops[index - 1])).toBe(true);
    }
  }
});
