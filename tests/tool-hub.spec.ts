import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { digitalTools, getRuntimeEntryHref, isLocalRuntime } from "../src/data/digital-tools";

test("public digital visuals explain their subject without production notes", () => {
  const portfolio = fs.readFileSync(path.join(process.cwd(), "src/data/portfolio.ts"), "utf8");
  const opsEditorial = fs.statSync(path.join(process.cwd(), "public/tools/greenatics-ops-documentary-v01.jpg"));
  const ops = fs.readFileSync(path.join(process.cwd(), "public/tools/ops-workflow-concept.svg"), "utf8");
  const red = fs.readFileSync(path.join(process.cwd(), "public/tools/red-territorial-workflow.svg"), "utf8");
  const access = fs.readFileSync(path.join(process.cwd(), "public/tools/access-governance-map.svg"), "utf8");
  const publicPage = fs.readFileSync(path.join(process.cwd(), "src/app/red/page.tsx"), "utf8");

  expect(portfolio).toContain('image: "/tools/greenatics-ops-documentary-v01.jpg"');
  expect(portfolio).toContain('imageAlt: "Dos trabajadores registran el pesaje y reciben material orgánico en una planta de compostaje."');
  expect(portfolio).toContain('imageCaption: "La recepción y el pesaje pueden integrarse con los registros de cada lote."');
  expect(opsEditorial.size).toBeGreaterThan(100_000);
  expect(portfolio).toContain('imageAlt: "Mapa de trabajo territorial que conecta organizaciones, generadores, cobertura, evidencia, hallazgos y acciones"');
  expect(portfolio).toContain('imageAlt: "Diagrama de acceso que relaciona organización, entorno, aplicación, rol y permiso"');
  expect(publicPage).toContain('title="Pantalla de resumen de GREENATICS Red con datos ficticios"');
  expect(ops).toContain("OPERACIÓN Y TRAZABILIDAD DE PLANTA");
  expect(ops).toContain("Flujo de información operativa en GREENATICS OPS");
  expect(red).toContain("COBERTURA · CAMPO · SEGUIMIENTO");
  expect(access).toContain("ORGANIZACIÓN · ENTORNO · PERMISOS");
  for (const diagram of [ops, red, access]) {
    expect(diagram).not.toMatch(/esquema conceptual|no es una captura|mapa esquemático|no representa un territorio real|diagrama sin datos reales|no muestra usuarios|no muestra datos/i);
  }
});

test("OPS identifies fictitious sample data across public entry points", () => {
  const toolsHtml = fs.readFileSync(path.join(process.cwd(), "out/herramientas/index.html"), "utf8");
  const accessHtml = fs.readFileSync(path.join(process.cwd(), "out/acceso/index.html"), "utf8");
  const opsHtml = fs.readFileSync(path.join(process.cwd(), "out/app/index.html"), "utf8");
  const toolsSource = fs.readFileSync(path.join(process.cwd(), "src/app/herramientas/page.tsx"), "utf8");

  expect(toolsHtml).toContain("Muestra pública · datos ficticios");
  expect(toolsHtml).not.toContain("requiere que OPS esté iniciado");
  expect(toolsHtml).not.toContain("Abrir demo OPS local");
  expect(accessHtml).toContain("Muestra pública · datos ficticios");
  expect(opsHtml).toContain("Muestra interactiva · datos ficticios");
  expect(opsHtml).toContain("Los datos son ficticios y no describen una operación real.");
  expect(opsHtml).not.toContain("Los valores son ilustrativos y están identificados como tales.");
  expect(toolsHtml).toContain('href="/app/"');
  expect(toolsSource).toContain('{process.env.NODE_ENV === "development" && !hasRuntime && platform.code === "OPS" ?');
});

test("the OPS public station identifies fictional data before the interactive sample", async ({ page }) => {
  await page.goto("/app/", { waitUntil: "networkidle" });

  const station = page.locator("#estacion");
  await expect(page.getByText("MUESTRA INTERACTIVA · DATOS FICTICIOS")).toBeVisible();
  await expect(station).toContainText("Los datos son ficticios y no describen una operación real.");
  await expect(page.getByRole("link", { name: "Explorar la estación" })).toHaveAttribute("href", "#estacion");
  await expect(page.getByRole("link", { name: "Ver modelo de acceso" })).toHaveAttribute("href", "/acceso/");
  await expect(page.getByRole("heading", { name: "Explora cómo se relacionan los registros." })).toBeVisible();

  const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 2);
});

test("the ecosystem visual explains its shared work principle without production notes", () => {
  const map = fs.readFileSync(path.join(process.cwd(), "public/tools/greenatics-ecosystem-map.svg"), "utf8");
  expect(map).toContain("ÁMBITOS DE TRABAJO DIGITAL");
  expect(map).toContain("Cinco contextos donde los datos ayudan a decidir");
  expect(map).toContain("los registros y la evidencia ayudan a definir el siguiente paso de trabajo");
  expect(map).not.toMatch(/mapa conceptual|esquema conceptual|no representa|sincronización automática/i);
  expect(map).not.toContain("Cada plataforma atiende una necesidad y puede configurarse para su contexto.");
  const portfolio = fs.readFileSync(path.join(process.cwd(), "src/data/portfolio.ts"), "utf8");
  expect(portfolio).toContain("Ilustración de cinco ámbitos de trabajo");
  expect(portfolio).not.toContain("Mapa conceptual del ecosistema");
});

test("the static tool contract verifies Huella entry from the access portal", () => {
  const contract = fs.readFileSync(path.join(process.cwd(), "scripts/check-tool-contracts.mjs"), "utf8");
  expect(contract).toContain('["/acceso/", null, null]');
  expect(contract).toContain("function hasHuellaAccessPortal(body)");
  expect(contract).toContain('const hasExpectedAction = route === "/acceso/"');
  expect(contract).toContain('route !== "/acceso/" || hasHuellaAccessPortal(body)');
  expect(contract).toContain("function hasHonestHuellaEntry(body)");
  expect(contract).toContain("body.includes('href=\"/acceso/#calcula-tu-huella\"')");
  expect(contract).toContain('body.includes(\'href="#planes"\') && /planes y precios/i.test(body)');
  expect(contract).toContain('route !== "/huella/" || hasHuellaPricingLink(body)');
});

test("public Huella entry keeps its landing, configured login and local-test fallback distinct", () => {
  const huella = digitalTools.find((tool) => tool.code === "CO₂");
  const home = fs.readFileSync(path.join(process.cwd(), "src/components/home-tools-bridge.tsx"), "utf8");
  const toolsHub = fs.readFileSync(path.join(process.cwd(), "src/app/herramientas/page.tsx"), "utf8");
  const accessHub = fs.readFileSync(path.join(process.cwd(), "src/app/acceso/page.tsx"), "utf8");

  expect(huella?.landingHref).toBe("/huella/");
  expect(huella?.publicHref).toBe("/huella/");
  expect(getRuntimeEntryHref({ code: "CO₂", runtimeHref: "https://greenatics-huella-staging.onrender.com" }))
    .toBe("https://greenatics-huella-staging.onrender.com/login");
  expect(getRuntimeEntryHref({ code: "CO₂", runtimeHref: "" })).toBe("");

  expect(home).toContain('runtimeLinks.huella ? `${runtimeLinks.huella}/login` : ""');
  expect(home).toContain('"/acceso/#calcula-tu-huella"');
  expect(home).toContain("href={huellaAccessHref}");
  expect(toolsHub).toContain("href={runtimeEntryHref}");
  expect(toolsHub).toContain("href={platform.publicHref}");
  expect(accessHub).toContain("href={runtimeEntryHref}");
  expect(accessHub).toContain("href={tool.publicHref}");
  expect(`${home}\n${toolsHub}\n${accessHub}`).not.toMatch(/127\.0\.0\.1:8765|localhost:8765/);
});

test("the public Huella card describes account access without exposing a connection check", async ({ page }) => {
  await page.goto("/herramientas/", { waitUntil: "networkidle" });

  const huella = page.locator(".digital-v4-platforms article").filter({
    hasText: "Organiza el inventario de emisiones a tu ritmo.",
  });
  await expect(huella.locator(".digital-v4-platforms__meta")).toHaveText("Acceso con cuenta");
  await expect(huella).not.toContainText("validar conexión");
  await expect(huella.getByRole("link", { name: /Entrar a Back 2 Green/ }))
    .toHaveAttribute("href", "https://greenatics-huella-staging.onrender.com/login");
  await expect(huella.getByRole("link", { name: /Ver plataforma y planes/ }))
    .toHaveAttribute("href", "/huella/");

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `page should not overflow at ${width}px`).toBe(false);
  }
});

test("Huella landing routes a prospective customer by need and preserves that context in contact", () => {
  const huellaSource = fs.readFileSync(path.join(process.cwd(), "src/app/huella/page.tsx"), "utf8");
  const formSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/digital-v4.css"), "utf8");

  expect(huellaSource).toContain('const huellaContactHref = "/contacto/?interes=calcula-tu-huella"');
  expect(huellaSource).toContain("Conversar sobre mi inventario");
  expect(huellaSource).toContain("id=\"punto-de-partida\"");
  expect(huellaSource).toContain("Me pidieron entregar un reporte");
  expect(huellaSource).toContain("Tengo una duda normativa");
  expect(huellaSource).toContain("Quiero medir para gestionar");
  expect(huellaSource).toContain("motivo=solicitud-externa");
  expect(huellaSource).toContain("motivo=duda-normativa");
  expect(huellaSource).toContain("motivo=gestion-interna");
  expect(formSource).toContain("const huellaContactRoutes = {");
  expect(formSource).toContain('"solicitud-externa"');
  expect(formSource).toContain('"duda-normativa"');
  expect(formSource).toContain('"gestion-interna"');
  expect(formSource).toContain("const nextContext = diagnosticContext || huellaRoute || contextualProfile || null");
  expect(styles).toContain(".huella-landing--editorial .huella-entry__routes");
  expect(styles).toContain("@media (max-width: 520px)");
  expect(styles).toContain(".huella-landing--editorial .huella-entry :is(a, button):focus-visible");
});

test("every digital tool implementation request has a matching contact context", () => {
  const toolsSource = fs.readFileSync(path.join(process.cwd(), "src/data/digital-tools.ts"), "utf8");
  const formSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  const interests = [...toolsSource.matchAll(/implementationInterest:\s*"([^"]+)"/g)].map((match) => match[1]);
  const contextKeys = new Set([...formSource.matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]));

  expect(interests).toHaveLength(5);
  for (const interest of interests) expect(contextKeys, `${interest} needs a form context`).toContain(interest);
  expect(formSource).toContain('label: "GREENATICS Red · alcance territorial y organizacional"');
  expect(formSource).toContain('title: "Definir los componentes de trabajo para un territorio u organización"');
  expect(formSource).toContain("organizaciones o grandes generadores");
  expect(formSource).toContain("no equivale a una plataforma organizacional habilitada");
  expect(formSource).not.toContain('title: "Diagnóstico territorial y PMIRS"');
  expect(toolsSource).toContain('title: "Del diagnóstico a la gestión con seguimiento."');
  expect(toolsSource).toContain('requestLabel: "Conversar sobre territorio u organización"');
  expect(toolsSource).toContain('scope: "PGIRS · PMIRS · Campo"');
});

test("Back 2 Green describes verified guidance and does not advertise unavailable AI", () => {
  const huella = digitalTools.find((tool) => tool.code === "CO₂");
  expect(huella).toBeDefined();
  expect(huella?.copy).toContain("guía por tareas");
  expect(huella?.includes).toContain("Guía de uso y recorrido para organizar cada etapa");
  expect(`${huella?.copy} ${huella?.includes.join(" ")}`).not.toMatch(/\bIA\b|inteligencia artificial|asistente/i);

  const publicHtml = fs.readFileSync(path.join(process.cwd(), "out/herramientas/index.html"), "utf8");
  expect(publicHtml).not.toMatch(/asistente con IA|inteligencia artificial/i);
});

test("private runtime URLs are kept out of public links and identified as local in development", () => {
  for (const url of [
    "http://localhost:3001",
    "http://127.0.0.1:8765",
    "http://192.168.23.171:3002",
    "http://10.0.0.4:3000",
    "http://[::1]:3000",
  ]) {
    expect(isLocalRuntime(url), `${url} is private/local`).toBe(true);
  }

  expect(isLocalRuntime("https://tools.greenatics.co")).toBe(false);
  expect(isLocalRuntime("not a URL")).toBe(false);
});

test("SANA and AGROWAY record modules use distinct contextual guidance", () => {
  const demoSource = fs.readFileSync(path.join(process.cwd(), "src/components/portfolio-demo-app.tsx"), "utf8");
  const moduleHeadings = [
    "Delimita la oportunidad antes de estructurarla.",
    "Lee alcance, etapa y avance en conjunto.",
    "Convierte el seguimiento en una próxima acción.",
    "Ubica cada documento en su contexto.",
    "Haz visible qué decisión está pendiente.",
    "Ubica el ciclo antes de seguirlo.",
    "Lee el lote desde su contexto agronómico.",
    "Registra qué ocurrió en el lote.",
    "Comprueba el soporte detrás del registro.",
    "Concilia la cosecha con su soporte.",
    "Conecta cada referencia con su uso.",
  ];

  expect(demoSource).toContain("const sectionGuidance:");
  for (const heading of moduleHeadings) expect(demoSource).toContain(heading);
  expect(demoSource).not.toContain("La oportunidad se acompaña con información.");
});

test("AGROWAY public copy presents the current demo and preserves the product vision", () => {
  const agroway = fs.readFileSync(path.join(process.cwd(), "src/app/agroway/page.tsx"), "utf8");
  const agrowayApp = fs.readFileSync(path.join(process.cwd(), "src/app/agroway/app/page.tsx"), "utf8");
  const portfolio = fs.readFileSync(path.join(process.cwd(), "src/data/portfolio.ts"), "utf8");
  const tool = digitalTools.find((item) => item.code === "AG");

  expect(tool?.status).toBe("Demo navegable · desarrollo en curso");
  expect(tool?.publicLabel).toBe("Abrir demo navegable AGROWAY");
  expect(tool?.copy).toContain("Su visión integra trabajo de campo, Greenatics Control y datos de ciclo para SANA");
  expect(agroway).toContain("La demo usa datos ficticios");
  expect(agroway).toContain("La verdad financiera y la verdad de campo no pueden vivir separadas.");
  expect(agroway).toContain("Greenatics Control");
  expect(agroway).toContain("AGROWAY entrega información relacionada y oportuna del ciclo productivo");
  expect(agroway).toContain("MIPFRE: manejo integrado por zona, con revisión profesional.");
  expect(agroway).toContain("La conexión con SANA, la sincronización con fincas reales y el uso multiusuario");
  expect(agroway).toContain("Abrir la demo navegable");
  expect(agroway).not.toMatch(/recorrido ilustrativo|este recorrido|escena editorial|imagen generada|no documenta/i);
  expect(agrowayApp).toContain("AGROWAY · Ejemplo de trazabilidad agrícola");
  expect(portfolio).toContain('imageAlt: "Productora técnica observa un cultivo de café y registra una nota en una finca andina."');
  expect(portfolio).not.toContain("utilizada como referencia visual del ciclo agrícola");
});

test("SANA public copy calls the demo a sample and keeps its fictional-data disclosure", () => {
  const sana = fs.readFileSync(path.join(process.cwd(), "src/app/sana/page.tsx"), "utf8");
  const sanaApp = fs.readFileSync(path.join(process.cwd(), "src/app/sana/app/page.tsx"), "utf8");
  const demo = fs.readFileSync(path.join(process.cwd(), "src/components/portfolio-demo-app.tsx"), "utf8");
  const userDirectory = fs.readFileSync(path.join(process.cwd(), "src/app/plataforma/usuarios/page.tsx"), "utf8");
  const tool = digitalTools.find((item) => item.code === "SANA");

  expect(tool?.homeKind).toBe("Muestra pública · proyectos agrícolas");
  expect(tool?.publicLabel).toBe("Explorar muestra SANA");
  expect(sana).toContain("Recorrer la muestra");
  expect(sana).not.toMatch(/recorrido ilustrativo|escena editorial|imagen generada|no documenta/i);
  expect(sanaApp).toContain("SANA · Muestra de estructuración de proyectos");
  expect(demo).toContain("Los datos de estas vistas son ficticios y no representan proyectos, clientes ni inversiones reales.");
  expect(demo).not.toContain("ilustrativo");
  expect(userDirectory).toContain('lastAccess: "Dato de ejemplo"');
  expect(userDirectory).not.toContain("ilustrativo");
  expect(userDirectory).not.toContain("Criterio de diseño");
  expect(userDirectory).toContain("Explora ejemplos de roles y permisos locales");
});

test("published contact links resolve to a named contact context", () => {
  const outputRoot = path.join(process.cwd(), "out");
  const formSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  const contextKeys = new Set([...formSource.matchAll(/^\s*"([^"]+)":/gm)].map((match) => match[1]));
  const htmlFiles: string[] = [];

  const collectHtml = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(entryPath);
      else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(entryPath);
    }
  };

  collectHtml(outputRoot);

  const missingContexts: string[] = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8").replaceAll("&amp;", "&");
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!/^\/contacto\/?\?/.test(href)) continue;
      const url = new URL(href, "https://greenatics.test");
      const key = url.searchParams.get("servicio") || url.searchParams.get("interes");
      const carriesDiagnosticContext = Boolean(key && url.searchParams.has("diagnostico"));
      if (key && !contextKeys.has(key) && !carriesDiagnosticContext) missingContexts.push(`${path.relative(outputRoot, file)} -> ${href}`);
    }
  }

  expect(htmlFiles.length).toBeGreaterThan(0);
  expect(formSource).toContain('const diagnosticContext = diagnosticTitle');
  expect(formSource).toContain('params.get("servicio") || params.get("interes")');
  expect(formSource).toContain('baseContext?.profile || "esp"');
  expect(missingContexts).toEqual([]);
});

test("the tools hub directs each request to a scope-aware next step", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "out/herramientas/index.html"), "utf8").replaceAll("&amp;", "&");
  const formSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");

  expect(html).toContain('href="/contacto/?interes=herramientas"');
  expect(html).toContain("Ayudarme a elegir una herramienta");
  expect(html).toContain("Conversar sobre una configuración");
  expect(html).toContain("Conversar sobre territorio u organización");
  expect(html).toContain("Conocer alcance de Red");
  expect(html).toContain("Conocer AGROWAY");
  expect(html).toContain("Conocer SANA");
  expect(html).toContain('href="/herramientas/estimador-organicos/"');
  expect(html).toContain("El estimador público proyecta masa y desvío; no calcula emisiones ni forma parte del inventario de Back 2 Green.");
  expect(html).not.toContain("Back 2 Green organiza inventarios y ofrece una proyección pública de flujo orgánico");
  expect(html).not.toContain("Ver alcance y casos");
  expect(html).not.toContain("Revisar una implementación");
  expect(formSource).toContain('title: "Elegir el siguiente paso para tu organización"');
  for (const tool of ["GREENATICS OPS", "GREENATICS Red", "Back 2 Green", "AGROWAY", "SANA"]) {
    expect(formSource).toContain(tool);
  }
  expect(formSource).toContain('"plataformas": toolsContactContext');
  expect(formSource).toContain('"herramientas": toolsContactContext');
  expect(formSource).toContain("visitar una demo no habilita por sí solo un entorno operativo");
  expect(formSource).toContain("los derechos de uso y cualquier implementación se confirman para cada herramienta");
});

test("the access hub is a compact status directory, not a second tool catalog", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/acceso/page.tsx"), "utf8");
  const toolsSource = fs.readFileSync(path.join(process.cwd(), "src/app/herramientas/page.tsx"), "utf8");

  expect(source).toContain("Muestras públicas y accesos de trabajo.");
  expect(source).toContain('id="entornos-disponibles"');
  expect(source).toContain('href="/herramientas/"');
  expect(source).toContain("Una muestra no crea una cuenta ni habilita permisos.");
  expect(source).not.toContain("access-governance-map.svg");
  expect(source).not.toContain("Primero se entiende el proyecto; luego se define el alcance.");
  expect(source).toContain("{digitalTools.map((tool) =>");
  expect(source).not.toContain("tool.copy");
  expect(source).not.toContain("tool.includes");
  expect(source).not.toContain("tool.result");
  expect(source).toContain('className="access-v4-environment__sample"');
  expect(source).toContain("href={tool.publicHref}");
  expect(source).toContain("{tool.publicLabel}");
  expect(source).toContain("Ver recorrido y planes");
  expect(source).toContain("Ver planes y recorrido");

  for (const tool of digitalTools) {
    expect(source, `${tool.name} should be rendered from the shared tool directory`).toContain("{tool.name}");
    expect(tool.scope, `${tool.name} needs a client-facing scope`).toBeTruthy();
    expect(tool.publicLabel, `${tool.name} needs a public next step`).toBeTruthy();
    expect(source).toContain(`href={tool.publicHref}`);
    expect(source).toContain('className="access-v4-environment__actions-primary"');
    expect(source).toContain('className="access-v4-environment__actions-supporting"');
    expect(tool.requestHref ?? `/contacto/?interes=${tool.implementationInterest}`).toBeTruthy();
  }
  expect(digitalTools.find((tool) => tool.code === "CO₂")?.requestHref).toBe("/contacto/?interes=calcula-tu-huella");
  expect(source).not.toContain("localhost");
  expect(source).not.toContain('href="/huella/#calculadora"');
  expect(source).toContain('process.env.NODE_ENV === "development"');
  expect(source).toContain("URL local configurada · requiere servidor activo");
  expect(toolsSource).toContain("Acceso local de desarrollo · servidor requerido");
  expect(toolsSource).toContain("Enlace local · requiere que Huella esté iniciada");
  expect(source).toContain("Estado y siguiente paso por herramienta.");
  expect(source).toContain('aria-label={tool.code === "CO₂" ? "Entrar a Back 2 Green" : `Abrir entorno configurado de ${tool.name}`}');
  expect(source).toContain('aria-label={`${tool.publicLabel}: ${tool.name}`}');
});

test("the OPS access entry identifies the sample and preserves its public destinations", async ({ page }) => {
  await page.goto("/acceso/", { waitUntil: "networkidle" });

  const opsEntry = page.locator(".access-v4-environment").filter({
    has: page.getByRole("heading", { name: "GREENATICS OPS" }),
  });
  await expect(opsEntry).toContainText("Muestra pública · datos ficticios");
  await expect(opsEntry.getByRole("link", { name: /Abrir muestra de GREENATICS OPS/ })).toHaveAttribute("href", "/app/");
  await expect(opsEntry.getByRole("link", { name: "Conversar sobre una configuración" })).toHaveAttribute(
    "href",
    "/contacto/?interes=greenatics-ops",
  );

  const localPreviewLink = opsEntry.getByRole("link", { name: "Abrir la demo local de GREENATICS OPS" });
  if (await localPreviewLink.count()) {
    await expect(localPreviewLink).toHaveAttribute("href", /^http:\/\/(localhost|127\.0\.0\.1):3002\/app$/);
    await expect(localPreviewLink).toHaveAttribute("title", "Solo aparece en un preview local; requiere que el servidor de la herramienta esté activo.");
  }

  const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 2);
});

test("each public tool landing exposes its intended demo or pricing destination", () => {
  const contracts = [
    ["src/app/app/page.tsx", "Explorar la estación", 'href="#estacion"'],
    ["src/app/huella/page.tsx", "Tarifas promocionales para Negocios Verdes de Corantioquia.", 'id="planes"'],
    ["src/app/red/page.tsx", "Abrir la estación con datos ficticios", 'href="/red/app/"'],
    ["src/app/agroway/page.tsx", "Explorar ejemplo de trazabilidad", 'href="/agroway/app/"'],
    ["src/app/sana/page.tsx", "Recorrer la muestra", 'href="/sana/app/#overview"'],
  ] as const;

  for (const [sourcePath, label, destination] of contracts) {
    const source = fs.readFileSync(path.join(process.cwd(), sourcePath), "utf8");
    expect(source, `${sourcePath} landing`).toContain(label);
    expect(source, `${sourcePath} destination`).toContain(destination);
  }
  const siteHeader = fs.readFileSync(path.join(process.cwd(), "src/components/site-header.tsx"), "utf8");
  const siteNavigation = fs.readFileSync(path.join(process.cwd(), "src/data/site.ts"), "utf8");
  expect(siteNavigation).toContain('href: "/herramientas/"');
  expect(siteHeader).toContain("href={item.href}");
  expect(siteHeader).toContain('href="/"');
});

test("GREENATICS Red explains its modules and exposes the interactive fictional sample", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/red/page.tsx"), "utf8");
  const html = fs.readFileSync(path.join(process.cwd(), "out/red/index.html"), "utf8");

  expect(source).toContain('runtimeLabel="Abrir entorno GREENATICS Red"');
  expect(source).toContain('demoHref="/red/app/"');
  expect(source).toContain('name="red-sample-preview"');
  expect(source).toContain('src="/red/app/#overview"');
  expect(source).toContain("Doce módulos conectan cinco momentos del trabajo.");
  expect(source).toContain('href={`/red/app/#${id}`} target="red-sample-preview"');
  expect(source).toContain("Sus nombres, cifras y estados son ficticios");
  expect(source).toContain('accessHref="/contacto/?interes=greenatics-red"');
  expect(html).toContain('href="/red/app/"');
  expect(html).toContain('title="Pantalla interactiva de GREENATICS Red con datos ficticios"');
  expect(html).toContain("Doce módulos conectan cinco momentos del trabajo.");
  expect(html).toContain("Conversar sobre la configuración de RED");
  expect(html).toContain("PMIRS · gestión organizacional");
});

test("the tools hub exposes the five public entry contracts", async ({ page }) => {
  await page.goto("/herramientas/", { waitUntil: "networkidle" });

  const cards = page.locator(".digital-v4-platforms__grid > article");
  await expect(cards).toHaveCount(5);
  await expect(page.locator(".digital-v4-product-proof")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Cinco experiencias para operar, medir y decidir." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Elige la herramienta por la decisión que necesitas sostener." })).toBeVisible();
  await expect(page.locator(".digital-tools-index, .digital-v4-entry-legend")).toHaveCount(0);
  await expect(page.locator(".digital-v4-implementation")).toHaveCount(0);
  await expect(page.locator(".digital-v4-flow, .digital-v4-governance")).toHaveCount(0);
  await expect(page.getByText("Cada herramienta parte de una necesidad concreta", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir estimador de flujo orgánico" })).toHaveAttribute("href", "/herramientas/estimador-organicos/");
  await expect(page.locator(".digital-v4-hero img")).toHaveAttribute("src", /digital-tools-field-v1\.jpg/);
  await expect(page.locator(".digital-v4-hero img")).toHaveAttribute("alt", /Profesionales ambientales revisan información/);
  await expect(page.locator(".digital-v4-hero figcaption")).toContainText("La tecnología cobra sentido en el contexto del trabajo");
  await expect(page.getByRole("link", { name: "Ayudarme a elegir una herramienta" })).toHaveAttribute("href", "/contacto/?interes=herramientas");

  const dashboardImages = await page.locator("main img").evaluateAll((items) => items.filter((image) => (image as HTMLImageElement).getAttribute("src")?.includes("06_dashboard_indicadores")));
  expect(dashboardImages).toHaveLength(0);

  for (const [code, landing, landingLabel, publicHref] of [
    ["OPS", "/app/", "", "/app/"],
    ["RED", "/red/", "Conocer alcance de Red", "/red/app/"],
    ["CO₂", "/huella/", "", "/huella/"],
    ["AG", "/agroway/", "Conocer AGROWAY", "/agroway/app/"],
    ["SANA", "/sana/", "Conocer SANA", "/sana/app/"],
  ] as const) {
    const tool = digitalTools.find((item) => item.code === code);
    expect(tool, `${code} has a central public-entry contract`).toBeDefined();
    const card = cards.filter({ has: page.locator(`figure > span`, { hasText: code }) });
    await expect(card, `${code} card`).toHaveCount(1);
    await expect(card.locator("details.digital-v4-platforms__details")).toHaveCount(1);
    await expect(card.getByText("Ver alcance y resultado")).toBeVisible();
    await expect(card.locator("details")).not.toHaveAttribute("open", "");
    if (code === "RED") {
      await expect(card).toContainText("organizaciones y grandes generadores");
      await expect(card).toContainText("Muestra pública · datos ficticios");
      await expect(card).toContainText("no representa una operación real");
    }
    if (code === "OPS") {
      await expect(card).toContainText("Muestra pública · datos ficticios");
      await expect(card).not.toContainText("Enlace local · requiere que OPS esté iniciado");
      await expect(card.getByRole("link", { name: "Conocer alcance de OPS" })).toHaveCount(0);
    } else {
      const landingLink = card.getByRole("link", { name: new RegExp(code === "CO₂" ? "Ver plataforma y planes" : landingLabel) });
      await expect(landingLink).toHaveAttribute("href", landing);
      await expect(landingLink).toBeVisible();
    }
    await expect(card.getByRole("link", { name: new RegExp(tool!.publicLabel) })).toHaveAttribute("href", publicHref);
    if (code === "CO₂") {
      await expect(card.getByRole("link", { name: /Probar estimador público/ })).toHaveCount(0);
      const runtimeLogin = card.getByRole("link", { name: /Entrar a Back 2 Green/ });
      const runtimeLoginCount = await runtimeLogin.count();
      expect([0, 1]).toContain(runtimeLoginCount);
      if (isLocalRuntime(tool!.runtimeHref)) {
        await expect(runtimeLogin).toHaveCount(0);
        const localLogin = card.getByRole("link", { name: "Abrir el login local de Back 2 Green" });
        await expect(localLogin).toHaveAttribute("href", /^http:\/\/(localhost|127\.0\.0\.1):8765\/login$/);
        await expect(card).toContainText("el servidor local de Huella debe estar iniciado");
      } else if (runtimeLoginCount === 1) {
        await expect(runtimeLogin).toHaveAttribute("href", /^https:\/\/[^/]+\/login$/);
        await expect(runtimeLogin).toHaveAttribute("target", "_blank");
        await expect(runtimeLogin).toHaveAttribute("rel", /noopener noreferrer/);
      }
      const huellaLanding = card.getByRole("link", { name: /Ver plataforma y planes/ });
      await expect(huellaLanding).toHaveAttribute("href", "/huella/");
      await expect(huellaLanding).toHaveCount(1);
    }
    await expect(card.getByRole("link", { name: `${tool!.requestLabel} →` })).toHaveAttribute(
      "href",
      tool!.requestHref ?? `/contacto/?interes=${tool!.implementationInterest}`,
    );
    const hrefs = await card.locator("a").evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute("href")));
    expect(new Set(hrefs).size, `${code} card should not repeat an access href`).toBe(hrefs.length);
  }
});

test("the tools hub opens each public experience and its distinct landing", async ({ page }) => {
  for (const tool of digitalTools) {
    await page.goto("/herramientas/", { waitUntil: "networkidle" });
    const card = page.locator(".digital-v4-platforms__grid > article").filter({
      has: page.locator("figure > span", { hasText: tool.code }),
    });

    await card.getByRole("link", { name: new RegExp(tool.publicLabel) }).click();
    await expect(page).toHaveURL(new RegExp(`${tool.publicHref.replaceAll("/", "\\/")}$`));
    await expect(page.locator("main h1").first()).toBeVisible();

    if (tool.publicHref !== tool.landingHref) {
      await page.goto("/herramientas/", { waitUntil: "networkidle" });
      const landingCard = page.locator(".digital-v4-platforms__grid > article").filter({
        has: page.locator("figure > span", { hasText: tool.code }),
      });
      await landingCard.getByRole("link", { name: new RegExp(tool.landingLabel) }).click();
      await expect(page).toHaveURL(new RegExp(`${tool.landingHref.replaceAll("/", "\\/")}$`));
      await expect(page.locator("main h1").first()).toBeVisible();
    }
  }
});

test("the independent organic-flow estimator opens outside the Huella card", async ({ page }) => {
  await page.goto("/herramientas/", { waitUntil: "domcontentloaded" });
  const estimatorLink = page.getByRole("link", { name: "Abrir estimador de flujo orgánico" });
  await expect(page.locator(".digital-v4-platforms__grid").getByRole("link", { name: "Abrir estimador de flujo orgánico" })).toHaveCount(0);
  await estimatorLink.click();
  await expect(page).toHaveURL(/\/herramientas\/estimador-organicos\/$/);
  await expect(page.getByRole("heading", { name: "Dimensiona el flujo. Después, evalúa su impacto." })).toBeVisible();
});

test("the last tool spans every two-column layout and stays full-width on mobile", async ({ page }) => {
  await page.goto("/herramientas/", { waitUntil: "networkidle" });

  for (const width of [1440, 1051, 1024, 845, 768, 761, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const layout = await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>(".digital-v4-platforms__grid");
      const cards = grid ? Array.from(grid.querySelectorAll<HTMLElement>(":scope > article")) : [];
      const card = cards.at(-1);
      return {
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0,
        columnEnd: card ? getComputedStyle(card).gridColumnEnd : "missing",
        cardWidth: card?.getBoundingClientRect().width ?? 0,
        firstCardWidth: cards[0]?.getBoundingClientRect().width ?? 0,
      };
    });

    expect(layout.document, `document should not overflow at ${width}px`).toBeLessThanOrEqual(width + 2);
    if (width >= 761) {
      expect(layout.gridColumns, `grid should retain two columns at ${width}px`).toBe(2);
      expect(layout.columnEnd, `last card should span the row at ${width}px`).toBe("-1");
      expect(layout.cardWidth, `last card should be visibly wider at ${width}px`).toBeGreaterThan(layout.firstCardWidth * 1.8);
    } else {
      expect(layout.gridColumns, `grid should stack at ${width}px`).toBe(1);
      expect(layout.cardWidth, `last card should fill the single column at ${width}px`).toBeGreaterThan(250);
    }
  }

  await page.setViewportSize({ width: 845, height: 900 });
  await page.goto("/herramientas/", { waitUntil: "networkidle" });
  let sanaEntryReached = false;
  for (let index = 0; index < 40; index += 1) {
    await page.keyboard.press("Tab");
    const activeLink = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        href: active instanceof HTMLAnchorElement ? active.getAttribute("href") : null,
        focusVisible: active instanceof HTMLElement && active.matches(":focus-visible"),
      };
    });
    if (activeLink.href === "/sana/app/") {
      sanaEntryReached = true;
      expect(activeLink.focusVisible).toBe(true);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/sana\/app\/$/);
      break;
    }
  }
  expect(sanaEntryReached, "keyboard order should reach the SANA sample link").toBe(true);
});

test("SANA status stays explicit in the public tool and access directories", async ({ page }) => {
  for (const route of ["/herramientas/", "/acceso/"]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route, { waitUntil: "networkidle" });

    const sanaEntry = route === "/herramientas/"
      ? page.locator(".digital-v4-platforms__grid > article").filter({ has: page.locator("figure > span", { hasText: "SANA" }) })
      : page.locator(".access-v4-environment").filter({ has: page.getByRole("heading", { name: "SANA" }) });
    await expect(sanaEntry).toContainText("En desarrollo · muestra conceptual");
    await expect(sanaEntry.getByRole("link", { name: /Explorar muestra SANA/ })).toHaveAttribute("href", "/sana/app/");
    await expect(sanaEntry.getByRole("link", { name: /Conversar sobre un proyecto/ })).toHaveAttribute("href", "/contacto/?interes=sana");

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileLayout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(mobileLayout.document).toBeLessThanOrEqual(mobileLayout.viewport + 2);
    await expect(sanaEntry).toBeVisible();
  }
});

test("the five public app routes distinguish examples from real operating records", () => {
  const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
  const ops = read("src/components/ops-workstation-demo.tsx");
  const redPage = read("src/app/red/page.tsx");
  const red = read("src/app/red/app/page.tsx");
  const huella = read("src/components/huella-scenario-explorer.tsx");
  const huellaLanding = read("src/app/huella/page.tsx");
  const agroway = read("src/app/agroway/page.tsx");
  const sana = read("src/app/sana/page.tsx");
  const portfolioDemo = read("src/components/portfolio-demo-app.tsx");

  expect(ops).toContain("Datos ficticios de demostración");
  expect(ops).toContain("No representan la operación de Yarumal ni Támesis");
  expect(ops).toContain("DEMO-DA-047");
  expect(ops).toContain('src="/brand/greenatics-horizontal.webp"');
  expect(ops).toContain("Las marcas de esta muestra son temporales: no registran ni cierran un turno real.");
  expect(ops).toContain('aria-live="polite">{completedChecks.length}/4');
  expect(ops).toContain("Qué reúne una actividad");
  expect(ops).toContain("Qué valida una recepción");
  expect(ops).toContain("Para leer cada indicador, consulta los registros de origen");
  expect(ops).not.toContain("Cada indicador abre los registros");
  expect(ops).not.toContain("Ver campos de actividad");
  expect(ops).not.toContain("Ver campos de captura");
  expect(ops).not.toContain("REC-TAM-");
  expect(ops).not.toContain("REC-YAR-");
  expect(ops).toContain("Proceso de muestra");

  expect(red).toContain("Nombres, cifras y estados no son de entidades reales");
  expect(red).toContain('src="/brand/greenatics-horizontal.webp"');
  expect(red).toContain("Simular aprobación");
  expect(red).toContain("no aprueban ni modifican datos de un municipio u organización");
  expect(red).toContain("Solicitudes de coordinación");
  expect(red).toContain("Diseño de flujo, no servicio conectado");
  expect(red).toContain("Según el proyecto y los conectores habilitados");
  expect(red).toContain("esta demostración no envía mensajes ni mantiene ese historial");
  expect(red).toContain('type="search"');
  expect(red).toContain("value={priorityFilter}");
  expect(red).toContain("Diseñar un piloto de microrruta");
  expect(red).not.toContain("RED-024 · Támesis");
  expect(red).not.toContain("Abriría hallazgos");

  expect(huella).toContain("proyección de masa");
  expect(huella).toContain("no representa una medición ni una reducción de GEI atribuible");
  expect(huella).toContain("La masa proyectada no equivale a CO₂e evitado");
  expect(huella).toContain('className="sr-only" role="status" aria-live="polite" aria-atomic="true"');
  expect(huella).toContain("Proyección de flujo:");
  expect(huella).not.toContain("0.94");
  expect(huella).not.toContain("1.2 kg CO₂/km");

  expect(agroway).toContain("Conecta lo que ocurre en cada lote con las decisiones del ciclo.");
  expect(agroway).toContain("/tools/agroway-field-editorial.jpg");
  expect(agroway).toContain("El ciclo empieza en la finca.");
  expect(agroway).not.toContain("Esquema conceptual de trazabilidad agrícola; no es una captura de producto");
  expect(agroway).not.toContain('"01", "Productor"');
  expect(agroway).toContain("Demo navegable · desarrollo en curso");
  expect(agroway).toContain("agroway-vision-title");
  expect(agroway).toContain('href="/contacto/?interes=agroway"');
  expect(agroway).toContain("AGROWAY fue estructurado por Grupo Pineal como un servicio de software para trazabilidad agrícola.");
  expect(agroway).not.toContain("derechos de uso");
  expect(agroway).toContain("información real del ciclo");
  expect(agroway).not.toContain("ToolAccessRail");
  expect([...agroway.matchAll(/href="\/contacto\/\?interes=agroway"/g)]).toHaveLength(1);
  expect(sana).toContain("Conectamos conocimiento técnico, proyectos agrícolas e inversión.");
  expect(sana).toContain('src="/tools/sana-project-editorial.jpg"');
  expect(sana).toContain("Del contexto productivo a un siguiente paso claro.");
  expect(sana).toContain("Primero se entiende la oportunidad:");
  expect(sana).toContain("Con esa lectura se acuerda el marco de trabajo:");
  expect(sana).toContain("El acompañamiento conecta el plan con su avance:");
  expect(sana).not.toContain("sana-v1-model");
  expect(sana).not.toContain("sana-v1-journey__grid");
  expect(sana).not.toContain("MARCO DE TRABAJO");
  expect(sana).toContain("Recorrer la muestra");
  expect(sana).not.toContain("Explorar el modelo");
  expect(sana).not.toContain("sana-v1-definition");
  expect(sana).not.toContain("sana-v1-connection");
  expect(sana).not.toContain("paisaje-tamesis.jpg");
  expect(sana).not.toContain("sana-v1-layers");
  expect(sana).not.toContain("sana-v1-data");
  expect(sana).toContain('href="/contacto/?interes=sana"');
  expect(sana).toContain("La muestra usa datos ficticios.");
  expect(sana).toContain("la información no se guarda ni se comparte.");
  expect(sana).not.toContain("ToolAccessRail");
  expect(sana).toContain("Cada iniciativa acuerda el alcance y el");
  expect(sana).not.toContain("El seguimiento puede apoyarse en AGROWAY");
  expect([...sana.matchAll(/href="\/contacto\/\?interes=sana"/g)]).toHaveLength(1);
  const contactForm = read("src/components/interactive-contact-form.tsx");
  expect(contactForm).toContain('"agroway": { label: "AGROWAY · trazabilidad agrícola", title: "Explorar necesidades de trazabilidad agrícola"');
  expect(contactForm).toContain('"sana": { label: "SANA · proyectos agrícolas", title: "Conversar sobre un proyecto agrícola"');
  expect(contactForm).toContain('profile: "proyecto"');
  expect(contactForm).toContain("productor, organización, inversionista o aliado");
  expect(contactForm).toContain("Puedes recorrer la demo navegable de AGROWAY");
  expect(contactForm).not.toContain("Antes de proponer AGROWAY");
  const homeTools = read("src/components/home-tools-bridge.tsx");
  const digitalToolsSource = read("src/data/digital-tools.ts");
  const portfolioData = read("src/data/portfolio.ts");
  const platformUsers = read("src/app/plataforma/usuarios/page.tsx");
  const homeHtml = read("out/index.html");
  const redLanding = read("out/red/index.html");
  expect(homeTools).toContain("Back 2 Green: inventario corporativo, a tu ritmo y con acompañamiento.");
  expect(homeTools).toContain("Tu equipo registra fuentes, actividades y soportes con base en GHG Protocol.");
  expect(homeTools).not.toContain("entra al espacio de tu organización cuando tengas acceso");
  expect(homeHtml).not.toContain("Primera decisión");
  expect(homeHtml).not.toContain("Se activa:");
  expect(homeHtml).toContain("Consultoría, ciencia y operación para retos ambientales reales.");
  expect(homeHtml).toContain("Huella Esencial · $450.000 COP al año");
  expect(homeHtml).toContain("Alcances 1, 2 y 3");
  for (const [name, href, action] of [
    ["GREENATICS OPS", "/app/", "Entrar a la muestra OPS"],
    ["GREENATICS Red", "/red/app/", "Recorrer la muestra Red"],
    ["AGROWAY", "/agroway/app/", "Abrir demo navegable AGROWAY"],
    ["SANA", "/sana/app/", "Explorar el marco SANA"],
  ]) {
    const tool = digitalTools.find((item) => item.name === name);
    expect(tool?.publicHref, `${name} needs its canonical public destination`).toBe(href);
    expect(tool?.homeAction, `${name} needs a clear home-page action`).toBe(action);
    expect(homeHtml).toMatch(new RegExp(`<a\\b[^>]*href="${href}"[^>]*>[\\s\\S]*?${name}[\\s\\S]*?${action}`));
  }
  expect(redLanding).toContain("La ruta de trabajo relaciona actores, cobertura, hallazgos y acciones");
  expect(redLanding).not.toContain("red-v4-deliverables");
  expect(redLanding).not.toContain("Lectura territorial</h3>");
  expect(redLanding).toContain("De los datos de campo a planes que se pueden ejecutar.");
  expect(redLanding).not.toContain("la estación organiza registros reales cuando se configura");
  expect(redPage).toContain('heading="Definamos el alcance para tu territorio u organización."');
  expect(redPage).toContain("Cuéntanos si necesitas formular un PGIRS, organizar un PMIRS o levantar información de campo y seguimiento.");
  expect(redPage).not.toContain("La estación navegable es una muestra; el servicio se define");
  expect(redPage).toContain("Relacionamos los registros con sus fuentes, unidades y contexto antes de priorizar acciones.");
  expect(redPage).not.toContain("workspaceViews");
  expect(redPage).not.toContain("red-v4-workspace");
  expect(redLanding).toContain("Una microrruta aporta información; no reemplaza el diagnóstico del territorio ni el de una organización.");
  expect(redLanding).not.toContain("Una fuente puede servir a varias decisiones.");
  expect(huellaLanding).toContain("Ejemplo de interfaz con información sintética.");
  expect(huellaLanding).toContain('alt="Vista de muestra del recorrido de seis etapas de Back 2 Green, desde configurar el inventario hasta preparar el informe"');
  expect(huellaLanding).toContain('alt="Vista de muestra del centro de trabajo de Back 2 Green con datos sintéticos."');
  expect(digitalToolsSource).toContain("Demo navegable · desarrollo en curso");
  expect(digitalToolsSource).toContain("Abrir demo navegable AGROWAY");
  expect(digitalToolsSource).toContain("Su visión integra trabajo de campo, Greenatics Control y datos de ciclo para SANA");
  expect(digitalToolsSource).toContain("En desarrollo · muestra conceptual");
  expect(digitalTools.find((tool) => tool.code === "AG")?.homeSummary).toContain("visión de producto también conecta trazabilidad, Control y SANA Data");
  expect(portfolioData).toContain("La demo navegable relaciona productor, finca, ciclo, cultivo, MIPFRE, labores, evidencia y cosecha.");
  expect(platformUsers).toContain("esta muestra no asigna permisos ni gestiona cuentas");
  for (const publicCopy of [agroway, contactForm, digitalToolsSource, homeTools, portfolioData, platformUsers]) {
    expect(publicCopy).not.toContain("Antes de proponer AGROWAY");
    expect(publicCopy).not.toContain("disponibilidad y derechos por verificar");
    expect(publicCopy).not.toContain("disponibilidad actual y los derechos");
  }

  const agrowayHtml = read("out/agroway/index.html");
  const agrowayMain = agrowayHtml.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? "";
  const sanaHtml = read("out/sana/index.html");
  const digitalPortfolioHtml = read("out/portafolio/clima-datos/index.html");
  expect(agrowayHtml).toContain("Conecta lo que ocurre en cada lote con las decisiones del ciclo.");
  expect(agrowayHtml).toContain("fue estructurado por Grupo Pineal como un servicio de software para trazabilidad agrícola");
  expect(agrowayHtml).toContain("Greenatics Control");
  expect(agrowayHtml).toContain("AGROWAY entrega información relacionada y oportuna del ciclo productivo");
  expect(agrowayHtml).not.toContain("derechos de uso");
  expect(agrowayMain).toContain("Cuéntanos cómo organizas zonas, planes, labores e inventarios");
  expect(agrowayHtml.match(/href="\/contacto\/\?interes=agroway"/g)).toHaveLength(1);
  expect(sanaHtml).toContain("Conectamos conocimiento técnico, proyectos agrícolas e inversión.");
  expect(sanaHtml).toContain("sana-project-editorial.jpg");
  expect(sanaHtml).not.toContain("MARCO DE TRABAJO");
  expect(sanaHtml).not.toContain("paisaje-tamesis.jpg");
  expect(sanaHtml.match(/href="\/contacto\/\?interes=sana"/g)).toHaveLength(1);
  expect(sanaHtml).toContain("la información no se guarda ni se comparte");
  expect(sanaHtml).not.toContain("en desarrollo");
  expect(digitalPortfolioHtml).toContain("Conocer SANA");
  expect(digitalPortfolioHtml).not.toContain("paisaje-tamesis.jpg");
  expect(portfolioDemo).toContain("Datos ficticios. La navegación y la búsqueda son locales; no se guarda ni comparte información.");
  expect(portfolioDemo).toContain('aria-controls="portfolio-demo-record-detail"');
  expect(portfolioDemo).toContain("aria-expanded={selectedRecordId === record.id}");
  expect(portfolioDemo).toContain("if (!remainsVisible) setSelectedRecordId(null);");
  expect(portfolioDemo).toContain("requestAnimationFrame(() => triggerRefs.current[activeId]?.focus())");
  expect(portfolioDemo).toContain("Prueba con otro código, nombre o estado.");
  expect(portfolioDemo).toContain("SANA organiza la oportunidad productiva, la inversión y el seguimiento del proyecto en una ruta de trabajo.");
  expect(portfolioDemo).not.toContain("Este recorrido conceptual usa datos ficticios y no es una plataforma operativa.");
  expect(portfolioDemo).toContain("Demostración con datos ficticios. La navegación, búsqueda y selección son locales; no se guarda ni comparte información.");
  expect(portfolioDemo).toContain("Demo navegable con datos ficticios. La navegación, búsqueda y selección son locales; no se guarda ni comparte información ni conecta fincas reales.");
  expect(portfolioDemo).toContain('kind === "agroway" ? "Conversar sobre trazabilidad agrícola" : "Conversar sobre un proyecto agrícola"');
  expect(portfolioDemo).not.toContain("portfolio-demo__access-link");
  expect(portfolioDemo).not.toContain("portfolio-demo__context-card");
  expect(portfolioDemo).not.toContain("portfolio-demo__rail-note");
  expect(portfolioDemo).not.toContain("Esta demostración no guarda cambios ni conecta organizaciones");
  expect(portfolioDemo).not.toContain("trazabilidad AGROWAY activa");
  expect(portfolioDemo).not.toContain("Támesis");
  expect(portfolioDemo).not.toContain("Fredonia");

  for (const [file, interest, label, notice] of [
    ["out/agroway/app/index.html", "agroway", "Conversar sobre trazabilidad agrícola", "Datos ficticios. La navegación y la búsqueda son locales; no se guarda ni comparte información."],
    ["out/sana/app/index.html", "sana", "Conversar sobre un proyecto agrícola", "Demostración con datos ficticios. La navegación, búsqueda y selección son locales; no se guarda ni comparte información."],
  ] as const) {
    const html = read(file);
    expect(html).toContain(label);
    expect(html.match(new RegExp(`href="\\/contacto\\/\\?interes=${interest}"`, "g"))).toHaveLength(1);
    expect(html.split(notice)).toHaveLength(2);
  }
});

test("the digital portfolio identifies OPS as an interactive sample, not live plant access", () => {
  const digitalPortfolioHtml = fs.readFileSync(
    path.join(process.cwd(), "out/portafolio/clima-datos/index.html"),
    "utf8",
  );
  expect(digitalPortfolioHtml).toContain("Explorar muestra de OPS");
  expect(digitalPortfolioHtml).toContain("Explorar cómo se conectan los registros de una planta.");
  expect(digitalPortfolioHtml).not.toContain("Entrar a OPS");
});

test("AGROWAY demo catalog stays aligned with Wondergreen products and published detail routes", () => {
  const demo = fs.readFileSync(path.join(process.cwd(), "src/components/portfolio-demo-app.tsx"), "utf8");
  const products = fs.readFileSync(path.join(process.cwd(), "src/data/products.ts"), "utf8");
  const biol = fs.readFileSync(path.join(process.cwd(), "src/app/wondergreen/productos/biol/page.tsx"), "utf8");

  expect(demo).toContain("Wondergreen 2GROW Líquido");
  expect(demo).toContain("concentraciones 100-20-20 y 200-0-0; esta última es la de mayor concentración de nitrógeno");
  expect(demo).toContain("Biol Wondergreen");
  expect(demo).toContain("digestión anaerobia multietapa");
  expect(demo).toContain("Wondergreen Trichoderma");
  expect(demo).toContain('href="/wondergreen/#productos"');
  expect(demo).not.toContain("microorganismos eficientes");
  expect(demo).not.toContain("revisión técnica pendiente");
  expect(products).toContain('name: "Wondergreen 2GROW Líquido"');
  expect(products).toContain('concentrations: ["100-20-20", "200-0-0 · mayor concentración de nitrógeno de la línea"]');
  expect(biol).toContain('category: "Fertilizante líquido"');
  expect(biol).toContain('canonical: "/wondergreen/productos/biol/"');
});

test("Huella's public offer separates the Corantioquia promotion from general proposals", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/huella/page.tsx"), "utf8");

  expect(source).toContain("Tarifas promocionales para Negocios Verdes de Corantioquia.");
  expect(source).toContain("Los valores mostrados son anuales y promocionales para Pymes con elegibilidad confirmada en Negocios Verdes de Corantioquia.");
  expect(source).toContain("Propuesta anual según tamaño y complejidad.");
  expect(source).toContain("volumen de datos, almacenamiento, revisión y horas de acompañamiento");
  expect(source).toContain("Las tarifas fijas que siguen son promocionales y requieren elegibilidad para Negocios Verdes de Corantioquia.");
  expect(source).toContain("El sector por sí solo no define el precio");
  expect(source).toContain("Confirmar elegibilidad");
  expect(source).toContain("Los tres precios publicados aplican exclusivamente a Pymes elegibles.");
  expect(source).toContain("Para empresas medianas y grandes acordamos una reunión breve y preparamos una propuesta a la medida");
  expect(source).toContain("Se calcula únicamente sobre el valor de la suscripción anual definido en la propuesta aceptada.");
  expect(source).toContain("preparamos una propuesta anual acorde con el tamaño y el trabajo requerido.");
  expect(source).toContain('/tools/huella/size-complexity-v1.png');
  expect(source).toContain("El tamaño orienta la conversación; el alcance acordado define la propuesta.");
  expect(source).toContain('alt="Tres escenas conectadas muestran cómo una empresa pasa de una operación concentrada a coordinar varias áreas, sedes y fuentes de información."');
  expect(source).not.toContain("inversión anual clara");
});

test("Back 2 Green opens with its product art direction and visual data story", () => {
  const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
  const source = read("src/app/huella/page.tsx");
  const styles = read("src/app/digital-v4.css");
  const hero = source.match(/<section className="carbon-v4-hero huella-opening"[\s\S]*?<\/section>/)?.[0] ?? "";

  expect(hero).not.toContain('/brand/calcula-tu-huella/brand-primary.svg');
  expect(hero).not.toContain('className="huella-opening__brand"');
  expect(hero).toContain("Tu inventario GEI.<br /><span>Claro y explicable.</span>");
  expect(hero).not.toContain("/tools/huella/inventory-city-scene.svg");
  expect(hero).toContain("huella-opening__product-window");
  expect(hero).toContain("/tools/huella/dashboard.png");
  expect(hero).toContain("Vista de muestra");
  expect(hero).toContain("La interfaz mostrada usa información sintética.");
  expect(hero).toContain("De la actividad al resultado, con evidencia para revisar.");
  expect(hero).toContain('href="#planes">Conocer planes y precios</a>');
  expect(hero).toContain("Cuatro pasos para seguir cada dato desde la actividad hasta el resultado");
  expect(hero).toContain("Actividad</span></li><li><span>Evidencia</span></li><li><span>Revisión</span></li><li><span>Resultado");
  expect(styles).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
  expect(styles).toContain(".carbon-v4-hero__copy h1 {\n  max-width: 18ch;");
  expect(hero).not.toContain("brand-reversed.svg");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__artboard");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__story");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__route::before");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__product-window");
  expect(styles).toContain(".huella-landing--editorial .carbon-v4-proof .huella-proof__story");
  expect(styles).toContain(".huella-landing--editorial .carbon-v4-scopes article {");
  expect(styles).toContain(".huella-opening__backdrop-wash");
  expect(source).toContain('src="/tools/huella/login-inventory-story.webp"');
  expect(source.match(/huella-multisector-map\.svg/g)?.length).toBe(1);
  expect(fs.existsSync(path.join(process.cwd(), "public/tools/huella/login-inventory-story.webp"))).toBe(true);
  expect(fs.existsSync(path.join(process.cwd(), "public/tools/huella/dashboard.png"))).toBe(true);
});

test("Huella and its hubs do not repeat a page just to reach a fragment", () => {
  const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8").replaceAll("&amp;", "&");
  const huellaSource = read("src/app/huella/page.tsx");
  const toolsSource = read("src/app/herramientas/page.tsx");
  const styles = read("src/app/digital-v4.css");
  const huellaHero = huellaSource.match(/<section className="carbon-v4-hero huella-opening"[\s\S]*?<\/section>/)?.[0] ?? "";
  const huellaSectors = huellaSource.match(/<section className="carbon-v4-sectors"[\s\S]*?<\/section>/)?.[0] ?? "";
  const huellaProductDeck = huellaSource.match(/<section className="carbon-v4-product-deck"[\s\S]*?<\/section>/)?.[0] ?? "";
  const html = read("out/huella/index.html");
  const toolsHtml = read("out/herramientas/index.html");
  const homeHtml = read("out/index.html");
  const impactHtml = read("out/impacto/index.html");
  const articleFor = (page: string, name: string) =>
    [...page.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(([article]) => article).find((article) => article.includes(name)) ?? "";

  expect(huellaSource).not.toContain("ToolAccessRail");
  expect(huellaSource).toContain("Tu inventario GEI.<br /><span>Claro y explicable.</span>");
  expect(huellaSource).toContain('className="huella-landing huella-landing--editorial"');
  expect(huellaSource).not.toContain("carbon-v4-section-heading__eyebrow");
  expect(huellaHero).toContain("huella-opening__visual");
  expect(huellaHero).toContain("huella-opening__artboard");
  expect(huellaHero).not.toContain('/brand/calcula-tu-huella/brand-primary.svg');
  expect(huellaHero).not.toContain("/tools/huella/inventory-city-scene.svg");
  expect(huellaHero).toContain("huella-opening__product-window");
  expect(huellaHero).toContain("/tools/huella/dashboard.png");
  expect(huellaHero).toContain("Vista de muestra");
  expect(huellaHero).not.toContain("/tools/huella/recorrido.png");
  expect(huellaSectors).toContain("/tools/huella/huella-multisector-map.svg");
  expect(huellaSource).not.toContain("brand-reversed.svg");
  expect(huellaHero).toContain("Actividad</span></li><li><span>Evidencia</span></li><li><span>Revisión</span></li><li><span>Resultado");
  expect(huellaProductDeck).toContain("{huellaMoments.map(([title, copy], index)");
  expect(huellaProductDeck).toContain("/tools/huella/recorrido.png");
  expect(huellaProductDeck).toContain("Ejemplo de interfaz con información sintética.");
  for (const stage of ["Configurar", "Recolectar", "Calcular", "Revisar", "Reducir", "Reportar"]) expect(huellaSource).toContain(`"${stage}"`);
  expect(huellaSource).toContain("/tools/huella/login-inventory-story.webp");
  expect(huellaSource).toContain("/tools/huella/huella-multisector-map.svg");
  expect(huellaSource).toContain("con espacio para distintas sedes, periodos y equipos.");
  expect(huellaSource).toContain("carbon-v4-sectors__grid");
  expect(huellaSource).toContain("La ruta es común. Las fuentes dependen de tu operación.");
  expect(huellaSource).toContain('aria-label="Ejemplos de sectores que pueden organizar su inventario"');
  for (const sector of ["Industria y manufactura", "Agroindustria y alimentos", "Comercio y distribución", "Construcción e infraestructura", "Transporte y logística", "Energía y servicios públicos"]) {
    expect(huellaSource).toContain(`<li>${sector}</li>`);
  }
  expect(huellaSource).toContain("/login");
  expect(huellaSource).toContain("Entrar a la plataforma");
  expect(huellaSource).toContain("hasLocalHuellaRuntime");
  expect(huellaSource).toContain('href="#punto-de-partida">Elegir mi punto de partida');
  expect(huellaSource).toContain("El acceso local es solo para pruebas y requiere que el servidor de Back 2 Green esté iniciado en este equipo.");
  expect(huellaSource).toContain("¿Tu organización aún no tiene acceso?");
  expect(huellaSource).toContain("Tarifas promocionales para Negocios Verdes de Corantioquia.");
  expect(huellaSource).toContain('annualPrice: "$450.000"');
  expect(huellaSource).toContain('annualPrice: "$990.000"');
  expect(huellaSource).toContain('annualPrice: "$2.490.000"');
  expect(huellaSource).toContain("25 % de descuento en la renovación de una suscripción anual recurrente.");
  expect(huellaSource).toContain("Se calcula únicamente sobre el valor de la suscripción anual definido en la propuesta aceptada.");
  expect(huellaSource).toContain("Confirmar elegibilidad");
  expect(huellaSource).toContain("No se acumula automáticamente con la promoción para Negocios Verdes de Corantioquia.");
  expect(huellaSource).toContain("La propuesta comercial confirma elegibilidad, vigencia, impuestos y condiciones.");
  expect(huellaSource).toContain("la empresa carga lo que tiene, identifica los pendientes");
  expect(huellaSource).toContain("10 horas de acompañamiento profesional");
  expect(huellaSource).toContain("Alcances 1, 2 y 3");
  expect(huellaSource).toContain("Alcance 3 priorizado");
  expect(huellaSource).toContain("Plan de reducción de emisiones");
  expect(huellaSource).not.toContain("HuellaScenarioExplorer");
  expect(huellaSource).not.toContain("carbon-v4-calculator");
  expect(huellaSource).toContain("Un trabajo compartido, con responsabilidades claras");
  expect(huellaSource).not.toContain("Hasta 5 sedes");
  expect(huellaSource).not.toContain("Portal de revisión e integraciones");
  expect(toolsSource).toContain('process.env.NODE_ENV === "development"');
  expect(toolsSource).toContain("Entrar a Back 2 Green");
  expect(toolsSource).toContain("platform.publicLabel");
  expect(toolsSource).toContain("getRuntimeEntryHref(platform)");
  expect(toolsSource).toContain("Ver plataforma y planes");
  expect(read("src/app/acceso/page.tsx")).toContain('process.env.NODE_ENV === "development"');
  expect(homeHtml).toMatch(/href="\/huella\/"/);
  expect(homeHtml).toContain("Ver método, planes y precios");
  expect(impactHtml).toContain("Probar estimador público");
  expect(toolsHtml).toContain("Solicitar demo guiada o acceso");
  expect(huellaSource).not.toContain('className="carbon-v4-method"');
  expect(huellaSource).toContain('className="carbon-v4-product-deck__moments"');
  expect(styles).toContain(".huella-landing .carbon-v4-product-deck__moments { position: relative; display: grid;");
  expect(styles).toContain(".carbon-v4-scopes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));");
  expect(styles).toContain(".huella-landing .carbon-v4-hero__primary");
  expect(styles).toContain(".huella-landing .carbon-v4-hero__visual");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__artboard");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__story");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__route::before");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__artboard {\n  min-height: clamp(420px, 39vw, 520px);");
  expect(styles).toContain(".huella-landing--editorial .huella-opening__product-window {\n  right: 0;");
  expect(styles).toContain("@media (max-width: 760px)");
  expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  expect(styles).not.toContain(".huella-landing .carbon-v4-product-deck__city");
  for (const stage of ["Configurar", "Recolectar", "Calcular", "Revisar", "Reducir", "Reportar"]) expect(huellaSource).toContain(`[\"${stage}\"`);
  expect(huellaSource).toContain("Seis etapas para pasar de los datos al reporte.");
  expect(huellaSource).toContain("carbon-v4-product-deck__step");
  expect(html).not.toContain('href="#calculadora"');
  expect(html).not.toContain('id="calculadora"');
  expect(html.match(/href="\/contacto\/\?servicio=clima-carbono"/g)).toHaveLength(1);
  expect(html).toMatch(/href="\/contacto\/\?interes=calcula-tu-huella/);
  expect(html).toContain("Medir las emisiones y confirmar qué reporte aplica son decisiones distintas.");
  expect(huellaSource).toContain("El artículo 16 de la Ley 2169 prevé que personas jurídicas públicas, privadas y mixtas reporten emisiones directas e indirectas");
  expect(huellaSource).toContain("como <strong>proyecto</strong> la propuesta sometida a comentarios");
  expect(huellaSource).toContain("ROE, PNCTE y RUA/RETC: tres rutas que conviene distinguir");
  expect(huellaSource).toContain("La Ley lo prevé; la propuesta de reglamento consultada aún es un proyecto.");
  expect(huellaSource).toContain("Los agentes regulados del programa siguen una ruta relacionada, con criterios propios.");
  expect(huellaSource).toContain("Por establecimiento: actividad del Anexo 1.3 y al menos un umbral —51 empleados promedio o 11.000 tCO₂e/año por combustión.");
  expect(huellaSource).toContain('className="carbon-v4-roe__register-list"');
  expect(styles).toContain(".huella-landing--editorial .carbon-v4-roe__register-list summary:focus-visible");
  expect(styles).toContain("@media (max-width: 760px)");
  expect(huellaSource).toContain("RETC forma parte del RUA y no requiere un reporte separado.");
  expect(huellaSource).toContain("El RUA se diligencia por establecimiento sujeto al registro.");
  expect(huellaSource).toContain('href="https://www.ideam.gov.co/transparencia/normativa/normativa-de-la-entidad-o-autoridad/resoluciones/resolucion-0839-de-2023"');
  expect(huellaSource).toContain("En el programa de cupos, los agentes regulados que MinAmbiente defina reportan emisiones directas e indirectas bajo las disposiciones del ROE.");
  expect(huellaSource).toContain("Esa selección no reemplaza los criterios del artículo 16 de la Ley 2169");
  expect(huellaSource).not.toContain("Solo los agentes que MinAmbiente defina reportan bajo el ROE");
  expect(huellaSource).toContain("promedio de 51 empleados o más, o emisiones por combustión de 11.000 tCO₂e/año o más");
  expect(huellaSource).toContain('href="https://www.ideam.gov.co/sites/default/files/prensa/publicaciones/manual_diligenciamiento_rua_v2.pdf"');
  expect(html).toContain("promedio de 51 empleados o más, o emisiones por combustión de 11.000 tCO₂e/año o más");
  expect(huellaSource).toContain("La subsección cubre emisiones directas de alcance 1");
  expect(huellaSource).toContain('href="https://www.ideam.gov.co/atencion-y-servicios-a-la-ciudadania/preguntas-frecuentes/RUA?page=4"');
  expect(huellaSource).toContain('href="https://quimicos.minambiente.gov.co/ocde_retc/"');
  expect(huellaSource).toContain("La empresa confirma su obligación y entrega el reporte ante la autoridad cuando aplique");
  expect(html).toContain('href="https://ghgprotocol.org/corporate-standard"');
  expect(html).toContain("la empresa carga lo que tiene, identifica los pendientes");
  expect(html).toContain("ALCANCE 1");
  expect(html).toContain("ALCANCE 2");
  expect(html).toContain("ALCANCE 3");
  expect(html).toContain("Tarifas promocionales para Negocios Verdes de Corantioquia.");
  expect(html).toContain("$450.000");
  expect(html).toContain("$990.000");
  expect(html).toContain("$2.490.000");
  expect(html).toContain("25 % de descuento en la renovación de una suscripción anual recurrente.");
  expect(html).toContain("Se calcula únicamente sobre el valor de la suscripción anual definido en la propuesta aceptada.");
  expect(html).toContain("No se acumula automáticamente con la promoción para Negocios Verdes de Corantioquia.");
  expect(html).toContain("COP / año");
  expect(html).not.toContain("COP / mes");
  expect(html).not.toContain("$390.000");
  expect(html).not.toContain("$3.900.000");
  expect(html).not.toContain("$9.900.000");
  expect(html).not.toContain("$24.900.000");
  expect(html).toContain("Hablar con un especialista");
  expect(html).not.toContain("127.0.0.1:8765");

  for (const route of ["out/herramientas/index.html", "out/acceso/index.html"]) {
    const card = articleFor(read(route), "Back 2 Green");
    expect(card, `${route} should render the Huella entry`).not.toBe("");
    expect(card).toContain('href="/huella/"');
    if (route.includes("herramientas")) {
      expect(card).toContain("Ver plataforma y planes");
      expect(card).not.toContain('href="/huella/#calculadora"');
      expect(card).not.toContain("Probar estimador público");
      expect(card).not.toContain('href="http://127.0.0.1:8765/login"');
      expect(card).not.toContain("Solicitar acceso a la plataforma completa");
    } else {
      expect(card).not.toContain('href="/huella/#calculadora"');
      expect(card).toContain("Solicitar demo guiada o acceso");
      expect(card).toContain("Ver recorrido y planes");
    }
  }
});

test("SANA landing reflows to one column without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sana/", { waitUntil: "networkidle" });

  const layout = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".sana-v1-hero__grid");
    const journey = document.querySelector<HTMLElement>(".sana-v1-journey__layout");
    const cta = document.querySelector<HTMLElement>(".sana-v1-cta__inner");
    return {
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      heroColumns: hero ? getComputedStyle(hero).gridTemplateColumns.split(" ").length : 0,
      journeyColumns: journey ? getComputedStyle(journey).gridTemplateColumns.split(" ").length : 0,
      ctaDirection: cta ? getComputedStyle(cta).flexDirection : "",
    };
  });

  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.heroColumns).toBe(1);
  expect(layout.journeyColumns).toBe(1);
  expect(layout.ctaDirection).toBe("column");
  await expect(page.getByRole("heading", { name: "Conectamos conocimiento técnico, proyectos agrícolas e inversión." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Recorrer la muestra" })).toBeVisible();
  await expect(page.locator(".sana-v1-hero__media img")).toBeVisible();

  if (process.env.CAPTURE_GREENATICS_RESPONSIVE === "1") {
    await page.screenshot({ path: "/private/tmp/greenatics-sana-mobile.png", fullPage: true });
  }
});

test("SANA landing preserves its tablet split without clipping content", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/sana/", { waitUntil: "networkidle" });

  const layout = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".sana-v1-hero__grid");
    const media = document.querySelector<HTMLElement>(".sana-v1-hero__media");
    const section = document.querySelector<HTMLElement>(".sana-v1-hero");
    return {
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      heroColumns: hero ? getComputedStyle(hero).gridTemplateColumns.split(" ").length : 0,
      imageLeft: media?.getBoundingClientRect().left ?? -1,
      imageRight: media?.getBoundingClientRect().right ?? Number.POSITIVE_INFINITY,
      sectionWidth: section?.getBoundingClientRect().width ?? 0,
    };
  });

  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 2);
  expect(layout.sectionWidth).toBe(layout.viewport);
  expect(layout.heroColumns).toBe(2);
  expect(layout.imageLeft).toBeGreaterThanOrEqual(0);
  expect(layout.imageRight).toBeLessThanOrEqual(layout.viewport + 2);
  await expect(page.getByRole("heading", { name: "Conectamos conocimiento técnico, proyectos agrícolas e inversión." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Recorrer la muestra" })).toBeVisible();

  if (process.env.CAPTURE_GREENATICS_RESPONSIVE === "1") {
    await page.screenshot({ path: "/private/tmp/greenatics-sana-tablet.png", fullPage: true });
  }
});

test("AGROWAY and SANA keep mobile navigation compact and sync the selected section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [brand, route, option, heading] of [
    ["AGROWAY", "/agroway/app/", "lots", "Lotes"],
    ["SANA", "/sana/app/", "portfolio", "Portafolio"],
  ] as const) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator(".portfolio-demo__rail nav")).toBeHidden();
    const selector = page.getByLabel(`Sección activa del recorrido ${brand}`);
    await expect(selector).toBeVisible();
    await expect(selector).toHaveValue("overview");
    await selector.selectOption(option);
    await expect(selector).toHaveValue(option);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    if (brand === "AGROWAY") {
      await selector.selectOption("catalog");
      await expect(page.getByRole("heading", { name: "Catálogo técnico", level: 1 })).toBeVisible();
      await expect(page.getByText(/no sincroniza inventarios ni reemplaza las fichas técnicas vigentes/)).toBeVisible();
      await expect(page.getByRole("link", { name: "Consultar catálogo Wondergreen" })).toHaveAttribute("href", "/wondergreen/#productos");
    }
  }
});

test("AGROWAY and SANA reset a module-specific search when the section changes", async ({ page }) => {
  for (const [route, firstId, firstLabel, query, nextId, nextLabel] of [
    ["/agroway/app/", "field", "Trabajo de campo", "ACT-441", "lots", "Lotes"],
    ["/sana/app/", "followup", "Seguimiento", "SEG-108", "portfolio", "Portafolio"],
  ] as const) {
    await page.goto(route, { waitUntil: "networkidle" });
    const selector = page.getByLabel(/Sección activa del recorrido/);
    const chooseSection = async (id: string, label: string) => {
      if (await selector.isVisible()) {
        await selector.selectOption(id);
        return;
      }
      const rail = page.getByRole("navigation", { name: /Secciones del recorrido/ });
      await rail.getByRole("button").filter({ has: page.getByText(label, { exact: true }) }).click();
    };

    await chooseSection(firstId, firstLabel);
    const firstSearch = page.getByRole("searchbox", { name: `Buscar en ${firstLabel}` });
    await firstSearch.fill(query);
    await expect(page.locator(".portfolio-demo__section-intro > div:last-child strong")).toHaveText("01");

    await chooseSection(nextId, nextLabel);
    const nextSearch = page.getByRole("searchbox", { name: `Buscar en ${nextLabel}` });
    await expect(nextSearch).toHaveValue("");
    await expect(page.locator(".portfolio-demo__section-intro > div:last-child strong")).toHaveText("03");
  }
});

test("SANA uses non-proportional status counts while AGROWAY bars share one denominator", () => {
  const demo = fs.readFileSync(path.join(process.cwd(), "src/components/portfolio-demo-app.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/portfolio-demo.css"), "utf8");

  expect(demo).toContain('["Proyectos de ejemplo", "06", "4 en seguimiento"]');
  expect(demo).toContain('["Inversión de ejemplo", "COP 420 M", "Escenario ficticio"]');
  expect(demo).toContain('["Hitos del ejemplo", "18", "13 confirmados en el escenario"]');
  expect(demo).toContain('["Decisiones del ejemplo", "04", "1 de prioridad alta en el ejemplo"]');
  expect(demo).not.toContain("Proyectos activos");
  expect(demo).not.toContain("Hitos del periodo");
  expect(demo).not.toContain("Decisiones abiertas");
  expect(demo).not.toContain("Capital acompañado");
  expect(demo).toContain('label: "Documentación", detail: "Planes, presupuestos y soportes"');
  expect(demo).toContain('label: "Revisión", detail: "Hitos, evidencias y responsables"');
  expect(demo).toContain("const progressWidths = agroway ? [100, 81, 64, 30] : null;");
  expect(demo).toContain("{progressWidths && <i aria-hidden=\"true\">");
  expect(demo).toContain("Conteos de ejemplo por estado; las categorías no representan partes de un mismo total.");
  expect(demo).not.toContain("[100, 81, 64, 32]");
  expect(styles).toContain(".portfolio-demo__panel.portfolio-demo__panel--dark h2 { max-width: 660px; color: #fff; }");
  expect(styles).toContain(".portfolio-demo__panel.portfolio-demo__panel--dark p { color: #c5dcca; }");
  expect(styles).toContain(".portfolio-demo__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }");
  expect(styles).toContain(".portfolio-demo__primary, .portfolio-demo__secondary, .portfolio-demo__search input { min-height: 44px; }");
  expect(styles).toContain(".portfolio-demo__site-link { display: inline-flex; min-height: 44px;");
  expect(styles).toContain("@media (max-width: 360px)");
});

test("the access hub separates public exploration from organization access", async ({ page }) => {
  await page.goto("/acceso/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Muestras públicas y accesos de trabajo." })).toBeVisible();
  await expect(page.locator(".access-v4-environment")).toHaveCount(5);
  await expect(page.getByRole("link", { name: "Comparar herramientas" })).toHaveAttribute("href", "/herramientas/");
  await expect(page.getByText("Una muestra no crea una cuenta ni habilita permisos.")).toBeVisible();
  for (const tool of digitalTools) {
    const row = page.locator(".access-v4-environment").filter({ hasText: tool.name });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole("link", { name: new RegExp(tool.requestLabel) })).toHaveAttribute("href", tool.requestHref ?? `/contacto/?interes=${tool.implementationInterest}`);
    if (tool.code === "CO₂") {
      await expect(row.getByRole("link", { name: "Ver planes y recorrido" })).toHaveAttribute("href", "/huella/");
      await expect(row.getByRole("link", { name: /Solicitar demo guiada o acceso/ })).toHaveAttribute("href", "/contacto/?interes=calcula-tu-huella");
    }
  }
});

test("the platform center routes to the catalog, access portal and user demo without a duplicate app catalog", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "out/plataforma/index.html"), "utf8");

  expect(html).toContain("Tres rutas, según lo que necesitas hacer.");
  expect(html).toContain('href="/herramientas/"');
  expect(html).toContain('href="/acceso/#entornos-disponibles"');
  expect(html).toContain('href="/plataforma/usuarios/"');
  expect(html).toContain("la administración real requiere un entorno organizacional habilitado.");
  expect(html).toContain("Conocer el modelo de usuarios");
  expect(html).toContain("Ver demostración del modelo");
  expect(html).toContain("Desde aquí puedes comparar su alcance");
  expect(html).not.toContain("sin repetir la descripción de cada app");
  expect(html).not.toContain("Ruta de consolidación");
  expect(html).not.toContain("GREENATICS Red se amplía hacia Proyecto 360");
  expect(html).not.toContain("platform-v4-access-map");
  expect(html).not.toContain("platform-v4-roadmap");
  expect((html.match(/class="platform-v4-card platform-v4-card--/g) || []).length).toBe(3);
});

test("the user-access demo is explicit about local data, tool status, and its contact destination", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "out/plataforma/usuarios/index.html"), "utf8");
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/plataforma/usuarios/page.tsx"), "utf8");

  expect(html).toContain("Demostración local · datos ficticios");
  expect(html).toContain("no administran cuentas reales ni habilitan acceso a las plataformas");
  expect(html).toContain("Demo navegable de trazabilidad agrícola; no conecta fincas reales ni habilita una operación productiva.");
  expect(html).toContain("Estructuración de proyectos agrícolas; esta muestra no asigna permisos ni gestiona cuentas.");
  expect(html).toContain("No disponible para asignación");
  expect(html).not.toContain("AGROWAY · SANA");
  expect(html).toContain("Personas activas en la muestra");
  expect(html).toContain("Auditoría productiva");
  expect(html).toContain("No conectada a esta vista");
  expect(html).toContain("Personas incluidas en la muestra");
  expect(html).toContain("Estado de ejemplo");
  expect(html).toContain("La selección solo cambia la muestra: no concede acceso ni representa disponibilidad operativa.");
  expect(html).toContain("Esta demostración no guarda eventos reales.");
  expect(html).not.toContain("Usuarios activos");
  expect(html).not.toContain("Sin alertas críticas");
  expect(html).not.toContain("Usuarios con acceso al ecosistema");
  expect(html).not.toContain("Hoy, 09:42");
  expect(html).not.toContain("agustin@greenatics.co");
  expect(html).not.toContain("claudia@greenatics.co");
  expect(source).toContain('const demoUsersStorageKey = "greenatics-demo-users-v2"');
  expect(source).toContain('runtimeLinks.opsUserAdmin || "/acceso/"');
  expect(source).not.toContain("/acceso/?interes=greenatics-ops");
  expect(source).toContain("La administración de cuentas autenticadas requiere un entorno OPS habilitado");
});

test("the user demo does not assign tools whose operational status is unresolved", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("greenatics-demo-users-v2", JSON.stringify([{
      initials: "RF",
      name: "Responsable de finca de muestra",
      email: "finca@example.com",
      organization: "Equipo de muestra",
      role: "Responsable de lote",
      access: "AGROWAY · SANA",
      platforms: ["AGROWAY", "SANA"],
      status: "Activo",
      lastAccess: "Dato de ejemplo",
    }]));
  });
  await page.goto("/plataforma/usuarios/", { waitUntil: "networkidle" });

  const toolOptions = page.locator(".platform-admin__platform-options button");
  await expect(toolOptions.filter({ hasText: "AGROWAY" })).toBeDisabled();
  await expect(toolOptions.filter({ hasText: "SANA" })).toBeDisabled();
  await expect(toolOptions.filter({ hasText: "OPS" })).toBeEnabled();
  await expect(page.getByText("Se actualizaron los alcances de esta muestra", { exact: false })).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("Sin plataformas");

  const storedUsers = await page.evaluate(() => JSON.parse(localStorage.getItem("greenatics-demo-users-v2") || "[]"));
  expect(storedUsers[0].platforms).toEqual([]);
  expect(storedUsers[0].access).toBe("Sin plataformas");
});
