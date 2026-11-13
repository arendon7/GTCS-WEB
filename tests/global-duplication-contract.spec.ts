import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const read = (file: string) => {
  const snapshotRoot = process.env.GREENATICS_STATIC_OUTPUT_ROOT;
  const snapshotPath = snapshotRoot && file.startsWith("out/")
    ? path.join(snapshotRoot, file.slice("out/".length))
    : path.join(process.cwd(), file);
  return fs.readFileSync(snapshotPath, "utf8");
};

test("the homepage keeps proof and territory storytelling complementary", async () => {
  const home = read("out/index.html");
  const territorySource = read("src/components/home-territory-showcase.tsx");
  const normalizedTerritorySource = territorySource.replace(/\s+/g, " ");
  const heroSource = read("src/components/home-hero.tsx");
  const visibleHome = home.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  expect(home.match(/class="home-claims-rail"/g)).toHaveLength(1);
  expect(home).toContain("Consultoría, ciencia y operación para retos ambientales reales.");
  expect(home).toContain("Del territorio al cultivo.");
  expect(home).toContain("Acompañamos a municipios, empresas, grandes generadores y agroindustrias");
  expect(home).toContain("Una ruta selectiva que conecta recolección y tratamiento.");
  expect(home).toContain("grupo A1");
  expect(home).toContain("GIEM, grupo A1 de la Universidad de Antioquia");
  expect(visibleHome.match(/140 km/g)).toHaveLength(1);
  expect(normalizedTerritorySource).toContain("Más de cinco años en Yarumal y tres en Támesis");
  expect(territorySource).toContain("consolidamos la ruta selectiva");
  expect(normalizedTerritorySource).toContain("prevenir vectores, lixiviados y olores");
  expect(normalizedTerritorySource).not.toContain("fertilizantes orgánicos con registro ICA");
  expect(normalizedTerritorySource).toContain("GIEM, grupo A1");
  expect(normalizedTerritorySource).toContain("Escenario preliminar de CO₂e:");
  expect(normalizedTerritorySource).toContain("no una reducción medida ni verificada");
  expect(normalizedTerritorySource).toContain("reactor UASB de {tamesisImpactScenario.metrics[0].value}");
  expect(territorySource).not.toContain("tamesisImpactScenario.metrics[1].value");
  expect(territorySource).not.toContain("tamesisImpactScenario.metrics[2].value");
  expect(territorySource).not.toContain("55 °C");
  expect(territorySource).not.toContain("Más de tres años de experiencia");
  expect(home).not.toContain("Territorio, bioprocesos, Wondergreen y datos que continúan después del proyecto.");
  expect(home).not.toContain("home-territory__metrics");
  expect(heroSource).toContain("/services/service-consulting-editorial.webp");
  expect(heroSource).not.toContain("/projects/plant/plant-evidence-01.webp");
  expect(heroSource).toContain("Consultoría técnica aplicada");
  expect(heroSource).toContain("Leer materiales, proceso y contexto antes de definir cada solución");
  expect(fs.existsSync(path.join(process.cwd(), "public/services/service-consulting-editorial.webp"))).toBe(true);
  const holdbacks = JSON.parse(read("docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"));
  expect(holdbacks.holdbacks.some((entry: { asset: string }) => entry.asset === "/services/service-consulting-editorial.webp")).toBe(false);
  expect(heroSource).toContain("Conocemos el sector de aseo, la ciencia detrás de los procesos");
  expect(heroSource).not.toContain("cuatro fertilizantes sólidos");
  expect(heroSource).not.toContain("cinco líquidos basados en bioles");
  expect(heroSource).toContain("<em> Del territorio al cultivo.</em>");
  expect(heroSource).not.toContain("claim.context");
  expect(territorySource).toContain("/projects/plant/plant-evidence-10.webp");
  expect(territorySource).toContain("/projects/tamesis/planta-aerea.jpg");
  expect(territorySource).toContain('href="/proyectos/tamesis/#impacto"');
  expect(territorySource).toContain("Ver proceso, escenarios y metodología");
  expect(territorySource).not.toContain("home-territory__tamesis-facts");
  expect(territorySource).not.toContain("home-territory__scenario-note");
  expect(territorySource).not.toContain("/projects/tamesis/sistema-uasb.png");
  expect(heroSource).not.toContain("route-evidence-");
  expect(territorySource).toContain("/impacto/");
});

test("the homepage presents one segment map and separates municipal PGIRS from organizational PMIRS", async () => {
  const home = read("out/index.html");
  const serviceMap = home.match(/<section class="home-system-map"[\s\S]*?<\/section>/)?.[0] ?? "";

  expect(home).not.toContain("home-audience-router");
  expect(home).not.toContain("home-proof-list");
  expect(home).not.toContain("home-offer-bridge");
  expect(home.match(/class="home-audience-paths"/g)).toHaveLength(1);
  expect(serviceMap.match(/class="home-audience-path home-audience-path--/g)).toHaveLength(3);
  expect(serviceMap).not.toContain("Wondergreen");
  expect(serviceMap).not.toContain("Casa y Jardín");
  expect(serviceMap).toContain("/services/pmirs-generators-editorial.jpg");
  expect(serviceMap).toContain("/services/agroindustry-biomass-editorial.jpg");
  expect(serviceMap).toContain("Gestión por sede");
  expect(serviceMap).toContain("Análisis de biomasa");
  expect(home).toContain("Municipios y empresas de servicios públicos");
  expect(home).toContain("Empresas y grandes generadores");
  expect(home).toContain("unidades residenciales, centros comerciales, instituciones");
  expect(home).toContain('href="/municipios/"');
  expect(home).toContain('href="/empresas/"');
  expect(home).toContain('href="/agroindustria/"');
  expect(home).toContain('href="/casa-jardin/"');
  expect(home).toContain("Ver servicios y entregables");
  expect(home).toContain("Recolección selectiva de orgánicos en Támesis.");
  expect(home).not.toContain("Registro fotográfico de la ruta selectiva");
  expect(home).toContain("Entendemos la operación antes de diseñar la solución.");
  expect(home).toContain("Del PGIRS a un servicio que pueda ponerse en marcha.");
  expect(home).toContain("Ordenar residuos y responsabilidades en cada sede.");
  expect(home).toContain("Encontrar una ruta viable para cada corriente.");
  expect(home).not.toContain("Incluye:");
  expect(home.match(/class="home-wondergreen-bridge"/g)).toHaveLength(1);
  expect(home.match(/class="home-tools-bridge"/g)).toHaveLength(1);
  expect(home.indexOf('id="wondergreen-bridge-title"')).toBeLessThan(home.indexOf('id="home-territory-title"'));
  expect(home).toContain("Wondergreen: nutrición para suelo y cultivo, con una línea para cada etapa.");
  expect(home).toContain("Fórmulas organominerales ocluidas para acompañar distintas etapas del cultivo.");
  expect(home).toContain("Cinco formulaciones elaboradas a partir de bioles de digestión anaerobia multietapa.");
  expect(home).toContain('class="home-product-family-grid"');
  expect(home).not.toContain("el catálogo contempla 40 kg");
  expect(home).not.toContain("Cropper");
  expect(home).toContain("Envase de fertilizante líquido Wondergreen 2GROW 100-20-20.");
  expect(home).toContain("Envase de bioinsumo microbiológico Wondergreen Bacillus subtilis.");
  expect(home).not.toContain("alt=\"Referencia visual");
  expect(home).toContain("Fórmulas organominerales ocluidas para acompañar distintas etapas del cultivo.");
  expect(home).toContain("wondergreen-line-2grow.jpg");
  expect(home).not.toContain("wondergreen-cropper-ref-2grow-solid.jpg");
  for (const image of [
    "wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg",
    "wondergreen-cropper-ref-bioinput-bacillus-subtilis.jpg",
  ]) {
    expect(home).toContain(image);
  }
});

test("the footer has two useful navigation groups without repeated routes or admin links", async () => {
  const home = read("out/index.html");
  const footer = home.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? "";

  expect(footer).not.toBe("");
  expect(footer.match(/class="site-footer__group"/g)).toHaveLength(2);
  expect(footer.match(/href="\/proyectos\/"/g)).toHaveLength(1);
  expect(footer.match(/href="\/wondergreen\/"/g)).toHaveLength(1);
  expect(footer.match(/href="\/casa-jardin\/"/g)).toHaveLength(1);
  expect(footer).toContain("Municipios y ESP · PGIRS");
  expect(footer).toContain("grandes generadores · PMIRS");
  expect(footer).toContain("Herramientas digitales");
  expect(footer).not.toContain("Usuarios y permisos");
  expect(footer).not.toContain("site-footer__diagnostic");
});

test("the homepage closes with distinct diagnosis and concrete-inquiry paths", async () => {
  const home = read("out/index.html");
  const closing = home.match(/<section class="home-conversion-block"[\s\S]*?<\/section>/)?.[0] ?? "";

  expect(closing.match(/class="home-conversion-block__action(?:\s|\")/g)).toHaveLength(2);
  expect(closing).toContain('href="/diagnostico/">');
  expect(closing).toContain('href="/contacto/?interes=soluciones">');
  expect(closing).toContain("Si todavía defines el alcance");
  expect(closing).toContain("Para conversar sobre una corriente, una planta o un proyecto.");
  expect(closing).toContain("Hablar sobre mi proyecto");
  expect(closing).not.toContain('href="/municipios/"');
  expect(home).toContain("Ver servicios y entregables");
});

test("the portfolio has one catalog architecture and no repeated summary sections", async () => {
  const portfolio = read("out/portafolio/index.html");
  const source = read("src/app/portafolio/page.tsx");

  expect(portfolio.match(/class="portfolio-offer-card portfolio-offer-card--/g)).toHaveLength(5);
  expect(portfolio).not.toContain("Servicios para decidir y ejecutar");
  expect(portfolio).not.toContain("El trabajo termina en una capacidad que alguien puede usar.");
  expect(source).toContain("/services/nosotros-consulting-field-v1.jpg");
  expect(portfolio).toContain("Dos profesionales observan material orgánico mientras revisan notas de campo.");
  expect(portfolio).toContain("Ciencia aplicada y trabajo de campo para definir el siguiente paso.");
  expect(portfolio).not.toContain("registro fotográfico de archivo");
  expect(portfolio).not.toContain("no representa el estado actual de la operación");
  expect(portfolio).toContain("Servicios para territorios y organizaciones");
  expect(portfolio).toContain("Herramientas para operar y decidir");
  expect(portfolio).toContain("Consultoría ambiental: de la ciencia a la operación.");
  expect(portfolio).toContain("Greenatics reúne ciencia aplicada, conocimiento del sector aseo");
  expect(portfolio).toContain("Municipios y ESP");
  expect(portfolio).toContain("Empresas y grandes generadores");
  expect(portfolio).toContain("PMIRS, logística interna y aprovechamiento en cada sede.");
  expect(portfolio).toContain("Casa y Jardín");
  expect(portfolio).toContain("¿Buscas productos y guías para tus plantas?");
  expect(portfolio).toContain("Wondergreen reúne Compost, cuatro referencias sólidas organominerales ocluidas");
  expect(portfolio).toContain("cinco formulaciones líquidas elaboradas a partir de bioles de digestión anaerobia multietapa");
  expect(portfolio).toContain("Los programas agronómicos integran diagnóstico, nutrición y seguimiento");
  expect(portfolio).not.toContain("200-0-0; esta última es la formulación con mayor concentración de nitrógeno");
  expect(portfolio).toContain('href="/servicios/programas-wondergreen/">Diseñar un programa para mi cultivo</a>');
  expect(portfolio).toContain("Organizar la separación por sede facilita coordinar equipos y gestores.");
  expect(portfolio.indexOf("Empresas, grandes generadores y agroindustria")).toBeLessThan(
    portfolio.indexOf("Productos agrícolas · Wondergreen"),
  );
  expect(portfolio).toContain('href="/portafolio/territorio/"');
  expect(portfolio).toContain('href="/portafolio/empresas/"');
  expect(portfolio).toContain('href="/portafolio/valorizacion/"');
  expect(portfolio).toContain('href="/portafolio/wondergreen/"');
  expect(portfolio).toContain('href="/portafolio/clima-datos/"');
  expect(portfolio).toContain('href="/portafolio/operacion-digital/"');
  expect(source).not.toContain("/projects/tamesis/reactor-uasb.jpeg");
  expect(source).not.toContain("portfolio-v5-layers");
  expect(source).not.toContain("portfolio-v5-delivery");
});

test("portfolio-line CTAs lead to distinct, specific next steps", () => {
  for (const slug of ["territorio", "valorizacion", "wondergreen", "clima-datos", "operacion-digital", "empresas"]) {
    const html = read(`out/portafolio/${slug}/index.html`);
    const entrySection = html.match(/<section id="oferta"[\s\S]*?<\/section>/)?.[0] ?? "";
    const destinations = [...entrySection.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(entrySection, `${slug} should render its portfolio entries`).not.toBe("");
    expect(new Set(destinations).size, `${slug} repeats an entry destination`).toBe(destinations.length);
  }

  const valorizacion = read("out/portafolio/valorizacion/index.html");
  expect(valorizacion).toContain("Optimización técnica de composteras");
  expect(valorizacion).toContain('href="/servicios/optimizacion-composteras/"');
  expect(valorizacion).toContain('href="/servicios/aprovechamiento-productivo/"');
  expect(valorizacion).toContain("Támesis · Reactor UASB de 30 m³");
  expect(valorizacion).not.toContain("Registro fotográfico");
  expect(valorizacion).not.toContain("infraestructura documentada");
});

test("broad solution inquiries use a clear action and a non-municipal default profile", async () => {
  const home = read("out/index.html");
  const portfolio = read("out/portafolio/index.html");
  const solutions = read("out/soluciones/index.html");
  const contactForm = read("src/components/interactive-contact-form.tsx");

  expect(home).toContain("Hablar sobre mi proyecto");
  expect(portfolio).toContain('href="/diagnostico/">Orientar mi proyecto</a>');
  expect(solutions).toContain('href="/contacto/?interes=soluciones">Describir mi necesidad</a>');
  expect(contactForm.match(/"soluciones": \{[^\n]+profile: "proyecto"/)).not.toBeNull();
  expect(contactForm).not.toMatch(/"soluciones": \{[^\n]+profile: "esp"/);
});

test("the solutions page separates its three service audiences from alliances and agricultural products", () => {
  const solutions = read("out/soluciones/index.html");
  const styles = read("src/app/routes-v3.css");
  const audienceSection = solutions.match(/<section class="gt-route-section gt-route-section--white">([\s\S]*?)<section class="gt-case-band">/)?.[1] ?? "";
  const audienceCopy = [...audienceSection.matchAll(/<div class="gt-pathway-grid__content">([\s\S]*?)<\/div>/g)].map((match) => match[1]);
  const audienceLayout = styles.match(/\.gt-pathway-grid\s*\{[\s\S]*?\.gt-solution-product-path > div:last-child\s*\{[^}]*\}/)?.[0] ?? "";

  expect(audienceCopy).toHaveLength(3);
  expect(audienceSection.match(/class="gt-pathway-grid__visual"/g)).toHaveLength(3);
  expect(audienceCopy[0]).toContain('href="/municipios/"');
  expect(audienceCopy[0]).toContain("PGIRS");
  expect(audienceCopy[1]).toContain('href="/empresas/"');
  expect(audienceCopy[1]).toContain("PMIRS");
  expect(audienceCopy[2]).toContain('href="/agroindustria/"');
  expect(audienceCopy[2]).toContain("subproductos");
  expect(audienceCopy.join(" ")).not.toContain("Casa");
  expect(audienceCopy.join(" ")).not.toContain("alianza");
  expect(audienceSection).toContain('href="/contacto/?interes=instituciones-alianzas"');
  expect(audienceSection).toContain('href="/wondergreen/"');
  expect(audienceSection).toContain('href="/servicios/programas-wondergreen/"');
  expect(audienceSection).toContain('href="/casa-jardin/"');
  expect(audienceSection).toContain("productos y guías");
  expect(audienceLayout).toContain("grid-template-columns: repeat(12, minmax(0, 1fr))");
  expect(audienceLayout).toContain(".gt-pathway-grid article:first-child");
  expect(audienceLayout).toContain("grid-column: 2 / span 5");
  expect(audienceLayout).not.toContain("border-bottom: 1px solid var(--line)");
  expect(styles).toContain(".gt-pathway-grid article:nth-child(3)");
  expect(styles).toContain("@media (max-width: 760px)");
  expect(styles).toContain(".gt-pathway-grid article:nth-child(3) {");
});

test("the solutions tool entry is a direct action without decorative numbering", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src", "app", "soluciones", "page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "app", "routes-v3.css"), "utf8");

  expect(source).toContain('href="/herramientas/">Explorar plataformas y herramientas');
  expect(source).not.toContain("<span>01</span>");
  expect(styles).not.toContain(".gt-tools-panel__links > a > span");
  expect(styles).toContain(".gt-tools-panel__links .button");
  expect(styles).toContain("white-space: normal;");
});

test("the solutions audience journeys and images remain usable at required viewport widths", async ({ page }) => {
  const response = await page.goto("/soluciones/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await page.locator(".gt-pathway-grid__visual img").evaluateAll((images) => {
    for (const image of images) (image as HTMLImageElement).loading = "eager";
  });
  await page.evaluate(() => Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined))));

  const pathwayImages = await page.locator(".gt-pathway-grid__visual img").evaluateAll((images) =>
    images.map((image) => ({ alt: image.getAttribute("alt"), naturalWidth: (image as HTMLImageElement).naturalWidth })),
  );
  expect(pathwayImages).toHaveLength(3);
  expect(pathwayImages.every((image) => image.alt && image.naturalWidth > 0)).toBe(true);

  for (const width of [1440, 1024, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(Math.max(geometry.document, geometry.body), `/soluciones/ should not overflow at ${width}px`).toBeLessThanOrEqual(width + 2);

    const routeActions = await page.locator(".gt-pathway-grid__content > a").evaluateAll((links) =>
      links.map((link) => {
        const rect = link.getBoundingClientRect();
        return { visible: rect.width > 0 && rect.height > 0, insideViewport: rect.left >= -1 && rect.right <= window.innerWidth + 1 };
      }),
    );
    expect(routeActions).toHaveLength(3);
    expect(routeActions.every((action) => action.visible && action.insideViewport)).toBe(true);
  }
});

test("Wondergreen keeps editorial artwork in its hero instead of repeating it in the reading library", async () => {
  const wondergreen = read("out/wondergreen/index.html");
  const librarySource = read("src/components/wondergreen-technical-library.tsx");

  expect(librarySource).not.toContain("/products/wondergreen-soil-roots-editorial.jpg");
  expect(librarySource).toContain('className={document.image ? undefined : "wg-docs__article--reading"}');
  expect(librarySource).not.toContain("plant-evidence-");
  const rootsImages = [...wondergreen.matchAll(/<img\b[^>]*>/g)].filter((match) => match[0].includes("/products/wondergreen-soil-roots-editorial.webp"));
  expect(rootsImages).toHaveLength(1);
});

test("case studies and service routes avoid repeating illustrative or case-specific artwork", () => {
  const readRoute = (route: string) => read(`out/${route}/index.html`);
  const countAsset = (html: string, asset: string) => {
    const encodedAsset = encodeURIComponent(asset);
    return [...html.matchAll(/<img\b[^>]*>/g)].filter((match) => match[0].includes(asset) || match[0].includes(encodedAsset)).length;
  };

  const services = readRoute("servicios");
  expect(countAsset(services, "/services/service-consulting-editorial.webp")).toBe(1);
  expect(countAsset(services, "/tools/service-capabilities-map.svg")).toBe(0);
  // Operation uses one contextual photo in the current editorial layout.
  expect(countAsset(services, "/services/operation-follow-up-concept-v1.jpg")).toBe(1);
  expect(countAsset(services, "/tools/ops-workflow-concept.svg")).toBe(0);
  expect(countAsset(services, "/products/wondergreen-soil-roots-editorial.jpg")).toBe(0);

  const projects = readRoute("proyectos");
  const about = readRoute("nosotros");
  const environmentalPark = readRoute("parque-ambiental");
  const impact = readRoute("impacto");
  const solutions = readRoute("soluciones");
  const resources = readRoute("recursos");
  const red = readRoute("red");
  for (const route of [projects, about, environmentalPark, impact, solutions, resources]) {
    expect(countAsset(route, "/projects/yarumal/aerial-01.webp")).toBe(0);
    expect(countAsset(route, "/projects/yarumal/aerial-02.webp")).toBe(0);
  }
  expect(countAsset(projects, "/projects/plant/plant-evidence-04.webp")).toBe(1);
  expect(projects).toContain("Yarumal · Compostaje bajo cubierta");
  expect(countAsset(impact, "/projects/plant/plant-evidence-04.webp")).toBe(1);
  expect(impact).toContain("dos describen resultados de un periodo validado");
  expect(countAsset(solutions, "/projects/plant/plant-evidence-04.webp")).toBe(0);
  expect(countAsset(solutions, "/projects/plant/plant-evidence-09.webp")).toBe(0);
  expect(fs.existsSync(path.join(process.cwd(), "public/projects/plant/plant-evidence-09.webp"))).toBe(false);
  expect(countAsset(solutions, "/services/service-consulting-editorial.webp")).toBe(1);
  expect(solutions).toContain("Tres profesionales revisan material orgánico durante una caracterización en un área de compostaje.");
  expect(solutions).toContain("Analizar el material y el proceso ayuda a definir una ruta de tratamiento adecuada.");
  expect(countAsset(solutions, "/projects/tamesis/paisaje-tamesis.jpg")).toBe(0);
  expect(countAsset(resources, "/projects/plant/plant-evidence-04.webp")).toBe(1);
  expect(countAsset(resources, "/projects/tamesis/planta-aerea.jpg")).toBe(1);
  expect(resources).not.toContain("infraestructura documentada");
  expect(countAsset(resources, "/tools/digital-tools-field-v1.jpg")).toBe(1);
  expect(countAsset(about, "/projects/plant/plant-evidence-07.webp")).toBe(0);
  expect(countAsset(about, "/projects/yarumal/aerial-02.webp")).toBe(0);
  expect(countAsset(environmentalPark, "/projects/plant/plant-evidence-03.webp")).toBe(0);
  expect(fs.existsSync(path.join(process.cwd(), "public", "projects", "plant", "plant-evidence-03.webp"))).toBe(false);
  expect(fs.existsSync(path.join(process.cwd(), "public", "projects", "plant", "plant-evidence-07.webp"))).toBe(false);
  expect(fs.existsSync(path.join(process.cwd(), "docs", "knowledge", "held-visual-assets", "plant-evidence-03.webp"))).toBe(true);
  expect(fs.existsSync(path.join(process.cwd(), "docs", "knowledge", "held-visual-assets", "plant-evidence-07.webp"))).toBe(true);
  expect(environmentalPark).toContain("una propuesta de arquitectura Greenatics");
  expect(red).not.toContain("/projects/yarumal/aerial-01.webp");
  expect(countAsset(projects, "/projects/tamesis/sistema-uasb.png")).toBe(0);
  expect(countAsset(projects, "/projects/tamesis/paisaje-tamesis.jpg")).toBe(1);

  const tamesis = readRoute("proyectos/tamesis");
  expect(countAsset(tamesis, "/projects/tamesis/sistema-uasb.png")).toBe(0);
  expect(fs.existsSync(path.join(process.cwd(), "public", "projects", "tamesis", "sistema-uasb.png"))).toBe(true);
  expect(tamesis).toContain("gt-tamesis-map__diagram");

  const home = read("out/index.html");
  const yarumal = readRoute("proyectos/yarumal");
  for (const route of [home, yarumal]) {
    expect(countAsset(route, "/projects/yarumal/aerial-01.webp")).toBe(0);
    expect(countAsset(route, "/projects/yarumal/aerial-02.webp")).toBe(0);
  }
  expect(countAsset(home, "/services/service-consulting-editorial.webp")).toBe(1);
  expect(countAsset(home, "/projects/plant/plant-evidence-01.webp")).toBe(0);
  expect(fs.existsSync(path.join(process.cwd(), "public/projects/plant/plant-evidence-01.webp"))).toBe(false);
  expect(countAsset(home, "/projects/plant/plant-evidence-04.webp")).toBe(0);
  expect(countAsset(home, "/projects/plant/plant-evidence-10.webp")).toBe(1);
  expect(countAsset(readRoute("municipios"), "/projects/routes/motocarguero-verde-operacion-real.webp")).toBe(1);
  expect(countAsset(yarumal, "/projects/plant/plant-evidence-06.webp")).toBe(1);
  expect(countAsset(yarumal, "/projects/plant/plant-evidence-03.webp")).toBe(0);
  expect(countAsset(yarumal, "/projects/plant/plant-evidence-09.webp")).toBe(0);

  const portfolio = readRoute("portafolio");
  const portfolioValorization = readRoute("portafolio/valorizacion");
  expect(countAsset(portfolio, "/projects/tamesis/planta-aerea.jpg")).toBe(1);
  expect(countAsset(portfolioValorization, "/projects/tamesis/reactor-uasb.jpeg")).toBe(1);

  const outputRoot = path.join(process.cwd(), "out");
  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(outputRoot);
  // The source artwork is retained in public assets, but the accessible HTML process diagram is now the public representation.
  const diagramRoutes = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return countAsset(html, "/projects/tamesis/sistema-uasb.png") > 0
      ? [path.relative(outputRoot, file)]
      : [];
  });
  expect(diagramRoutes).toEqual([]);

  const archivePhotos = [
    "/projects/tamesis/planta-aerea.jpg",
    "/projects/tamesis/reactor-uasb.jpeg",
    "/projects/tamesis/paisaje-tamesis.jpg",
  ];
  const repeatedPhotosPerRoute = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return archivePhotos
      .filter((asset) => countAsset(html, asset) > 1)
      .map((asset) => `${path.relative(outputRoot, file)} -> ${asset}`);
  });
  expect(repeatedPhotosPerRoute).toEqual([]);

  const ops = readRoute("app");
  expect(countAsset(ops, "/projects/yarumal/aerial-02.webp")).toBe(0);
  expect(countAsset(ops, "/projects/tamesis/sistema-uasb.png")).toBe(0);

  const agroindustry = readRoute("agroindustria");
  expect(countAsset(agroindustry, "/projects/tamesis/sistema-uasb.png")).toBe(0);
  expect(agroindustry).toContain("agroindustry-v4-hero__photo");
  expect(agroindustry).toContain("/services/agroindustry-characterization-editorial.jpg");
  expect(agroindustry.toLowerCase()).toContain("corriente");
  expect(fs.existsSync(path.join(process.cwd(), "public", "tools", "plant-engineering-factors.svg"))).toBe(true);

  const gardenGuides = readRoute("casa-jardin/guias");
  expect(countAsset(gardenGuides, "/products/wondergreen-soil-roots-editorial.jpg")).toBe(0);
});

test("public output does not expose conceptual dashboards as evidence", () => {
  const outputRoot = path.join(process.cwd(), "out");
  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(outputRoot);

  const unsafeAssetReferences = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return ["/campaign/06_dashboard_indicadores.jpg", "/tools/greenatics-dashboard-concept.jpg"]
      .filter((asset) => html.includes(asset))
      .map((asset) => `${path.relative(outputRoot, file)} -> ${asset}`);
  });
  expect(htmlFiles.length).toBeGreaterThan(0);
  expect(unsafeAssetReferences).toEqual([]);

  const ops = fs.readFileSync(path.join(outputRoot, "app", "index.html"), "utf8");
  expect(ops).toContain("Los datos son ficticios y no describen una operación real.");
  expect(ops).not.toContain("gt-ops-proof");
});

test("public captions do not expose visual-production notes", () => {
  const outputRoot = path.join(process.cwd(), "out");
  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(outputRoot);

  const productionNotes = /escena editorial|imagen editorial|generada con IA|no documenta|registro de archivo/i;
  const exposedNotes = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return productionNotes.test(html) ? [path.relative(outputRoot, file)] : [];
  });

  expect(exposedNotes).toEqual([]);
});

test("page titles do not append the Greenatics suffix twice", () => {
  const outputRoot = path.join(process.cwd(), "out");
  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(outputRoot);

  const duplicatedTitles = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    return /\|\s*Greenatics\s*\|\s*Greenatics/i.test(title)
      ? [`${path.relative(outputRoot, file)} -> ${title}`]
      : [];
  });

  expect(duplicatedTitles).toEqual([]);
});

test("the header never labels a non-login route as a direct OPS login", () => {
  const pageHtml = (route: string) =>
    fs.readFileSync(path.join(process.cwd(), "out", ...(route === "index" ? ["index.html"] : [route, "index.html"])), "utf8");
  const component = fs.readFileSync("src/components/site-header.tsx", "utf8");

  const headerAction = (html: string) => {
    const anchor = html.match(/<a\b[^>]*class="button button--dark header-ops-btn"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? "";
    return {
      href: anchor.match(/\bhref="([^"]+)"/)?.[1] ?? "",
      label: anchor.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    };
  };

  const accessHubHtml = pageHtml("acceso");
  const accessHubAction = headerAction(accessHubHtml);
  expect(accessHubAction.href).not.toBe("/acceso/");
  if (accessHubAction.href === "/app/#estacion") {
    expect(accessHubAction.label).toContain("Explorar muestra de OPS");
  }

  const opsHtml = pageHtml("app");
  const opsAction = headerAction(opsHtml);
  if (opsAction.href === "/acceso/") {
    expect(opsAction.label).toContain("Herramientas y acceso");
    expect(opsAction.label).not.toContain("Ingresar a OPS");
  }

  const mobileActions = component.match(/className="mobile-drawer-actions"[\s\S]*?<\/div>/)?.[0] ?? "";
  expect(mobileActions).toContain("href={headerAppUrl}");
  expect(mobileActions).toContain("{headerAppLabel}");
  expect(mobileActions).not.toContain("Ingresar a GREENATICS OPS");
});

test("GREENATICS OPS gives the public station one clear entry and explains its architecture once", () => {
  const ops = fs.readFileSync(path.join(process.cwd(), "out", "app", "index.html"), "utf8");

  expect(ops.match(/href="#estacion"/g)).toHaveLength(1);
  expect(ops).not.toContain("tool-access-rail");
  expect(ops).not.toContain("Cinco capas de trabajo, una lógica común");
  expect(ops.match(/class="gt-ops-architecture"/g)).toHaveLength(1);
  expect(ops).toContain("Los datos son ficticios y no describen una operación real.");
  expect(ops).toContain("Solicitar recorrido guiado");
});

test("GREENATICS OPS brand returns to its station while the separate link returns to the public site", () => {
  const station = read("src/components/ops-workstation-demo.tsx");

  expect(station).toContain('<Link className="ops-station__brand" href="/app/#estacion">');
  expect(station).toContain('<Link href="/" aria-label="Volver al sitio Greenatics">');
});

test("public inquiry CTAs describe the visitor's next action, not the site's navigation", () => {
  const outputRoot = path.join(process.cwd(), "out");
  const htmlFiles: string[] = [];
  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };
  collectHtml(outputRoot);

  const internalLabels = [
    "Llevar consulta a Contacto",
    "Llevar esta preparación a Contacto",
    "Llevar escenario a Contacto",
    "Preparar mi consulta",
  ];
  const leaks = htmlFiles.flatMap((file) => {
    const html = fs.readFileSync(file, "utf8");
    return internalLabels
      .filter((label) => html.includes(label))
      .map((label) => `${path.relative(outputRoot, file)} -> ${label}`);
  });

  expect(leaks).toEqual([]);
  const cropPlanner = fs.readFileSync(path.join(outputRoot, "wondergreen", "calculadora", "index.html"), "utf8").replaceAll("&amp;", "&");
  expect(cropPlanner).toContain("Solicitar orientación para el cultivo");
  expect(cropPlanner).toContain('href="/contacto/?interes=wondergreen&perfil=agro&diagnostico=');
  expect(cropPlanner).not.toContain("prioridad=");
  const crops = fs.readFileSync(path.join(outputRoot, "wondergreen", "cultivos", "index.html"), "utf8");
  const coffee = fs.readFileSync(path.join(outputRoot, "wondergreen", "cultivos", "cafe", "index.html"), "utf8");
  expect(crops).toContain("Solicitar orientación por cultivo");
  expect(coffee).toMatch(/Pedir orientación para (?:<!-- -->)?Café/);
});
