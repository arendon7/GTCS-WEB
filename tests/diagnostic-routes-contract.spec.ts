import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { buildDiagnosticContactHref, buildDiagnosticRequestDetails, buildDiagnosticSecondaryHref, diagnosticNeeds, diagnosticProfiles, diagnosticRoutes } from "../src/data/diagnostic-routes";

const outputRoot = path.join(process.cwd(), "out");
const contactSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");

function outputPathFor(route: string) {
  const url = new URL(route, "https://greenatics.test");
  return path.join(outputRoot, url.pathname.replace(/^\/+|\/+$/g, ""), "index.html");
}

test("the diagnostic guide covers every need for each audience", () => {
  expect(diagnosticProfiles.map(({ id }) => id).sort()).toEqual(Object.keys(diagnosticNeeds).sort());

  const expectedRouteKeys = Object.entries(diagnosticNeeds)
    .flatMap(([profile, items]) => items.map(({ id }) => `${profile}:${id}`))
    .sort();
  expect(Object.keys(diagnosticRoutes).sort()).toEqual(expectedRouteKeys);
  expect(expectedRouteKeys).toHaveLength(20);
  expect(diagnosticProfiles.map(({ id }) => id)).toContain("hogar");
});

test("the public diagnostic page uses the maintained route guide instead of legacy generic downloads", () => {
  const pageSource = fs.readFileSync(path.join(process.cwd(), "src/app/diagnostico/page.tsx"), "utf8");
  const pageHtml = fs.readFileSync(path.join(outputRoot, "diagnostico/index.html"), "utf8");
  expect(pageSource).toContain("import { DiagnosticRouter }");
  expect(pageHtml).toContain("Cinco contextos. Veinte rutas de entrada.");
  for (const staleCopy of [
    "certificado de aprovechamiento SUI",
    "mitigación de CO2",
    "Descargar Guía Oficial en PDF",
    "catalogo-wondergreen.pdf",
  ]) {
    expect(pageSource).not.toContain(staleCopy);
    expect(pageHtml).not.toContain(staleCopy);
  }
});

test("diagnostic router keeps functional progress numbers without duplicate decorative section numbers", () => {
  const componentSource = fs.readFileSync(path.join(process.cwd(), "src/components/diagnostic-router.tsx"), "utf8");
  expect(componentSource.match(/className="step-circle"/g)).toHaveLength(3);
  expect(componentSource).toContain('role="group" aria-label={`Paso ${currentStep} de 3:');
  expect(componentSource).not.toContain('className="diagnostic-number"');
  expect(componentSource).not.toMatch(/<span className="diagnostic-number">0[1-9]<\/span>/);
  expect(componentSource).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
  expect(componentSource).toContain('behavior: prefersReducedMotion ? "auto" : "smooth"');
});

test("each recommendation resolves to a published destination and a matching contact context", () => {
  const componentSource = fs.readFileSync(path.join(process.cwd(), "src/components/diagnostic-router.tsx"), "utf8");
  const climateInterests = new Set(["clima-carbono", "clima-datos", "calcula-tu-huella", "esg"]);
  expect(componentSource).toContain("buildDiagnosticSecondaryHref(profile, result, selectedNeed.label)");
  expect(componentSource).toContain("const selectedNeed = diagnosticNeeds[profile]?.find((item) => item.id === need)");

  const organizationRoute = diagnosticRoutes["empresa:residuos"];
  expect(organizationRoute.href).toBe("/contacto/");
  expect(organizationRoute.contactInterest).toBe("recoleccion-tratamiento");
  expect(organizationRoute.contactProfile).toBe("empresa");

  const distributorRoute = diagnosticRoutes["agro:distribucion"];
  expect(distributorRoute.contactProfile).toBe("empresa");
  expect(contactSource).toContain('empresa: "agroindustria"');
  expect(contactSource).toContain('agroindustria: "agroindustrial"');
  expect(contactSource).toContain('label: "Agroindustria / proyecto productivo"');
  expect(contactSource).toContain('"distribucion-wondergreen": {');

  for (const [key, route] of Object.entries(diagnosticRoutes)) {
    const targetPath = outputPathFor(route.href);
    expect(fs.existsSync(targetPath), `${key} destination should be exported: ${route.href}`).toBe(true);
    expect(contactSource, `${key} should resolve to a configured contact context`).toContain(`"${route.contactInterest}":`);

    const [profileId, needId] = key.split(":");
    const selectedNeed = diagnosticNeeds[profileId].find((item) => item.id === needId);
    expect(selectedNeed, `${key} should resolve to its selected need`).toBeDefined();
    const contactUrl = new URL(buildDiagnosticContactHref(profileId, route, selectedNeed!.label), "https://greenatics.test");
    expect(contactUrl.searchParams.get("interes")).toBe(route.contactInterest);
    expect(contactUrl.searchParams.get("perfil")).toBe(route.contactProfile ?? profileId);
    if (climateInterests.has(route.contactInterest)) {
      expect(route.contactProfile ?? profileId, `${key} should open climate-specific fields`).toBe("clima");
    }
    expect(contactUrl.searchParams.get("diagnostico")).toBe(route.title);
    expect(contactUrl.searchParams.get("prioridad")).toBe(selectedNeed!.label);

    if (route.secondary) {
      const secondaryHref = buildDiagnosticSecondaryHref(profileId, route, selectedNeed!.label);
      expect(secondaryHref, `${key} should resolve its secondary action`).toBeDefined();
      const sourceSecondaryUrl = new URL(route.secondary.href, "https://greenatics.test");
      if (sourceSecondaryUrl.pathname === "/contacto/") {
        const secondaryUrl = new URL(secondaryHref!, "https://greenatics.test");
        expect(secondaryUrl.searchParams.get("interes")).toBe(route.contactInterest);
        expect(secondaryUrl.searchParams.get("perfil")).toBe(route.contactProfile ?? profileId);
        expect(secondaryUrl.searchParams.get("diagnostico")).toBe(route.title);
        expect(secondaryUrl.searchParams.get("prioridad")).toBe(selectedNeed!.label);
      } else {
        expect(secondaryHref).toBe(route.secondary.href);
      }
    }

    const requestDetails = buildDiagnosticRequestDetails(route.title, selectedNeed!.label, profileId === "hogar" ? "home" : "route");
    expect(requestDetails).toContain(route.title);
    expect(requestDetails).toContain(selectedNeed!.label);

    const anchor = new URL(route.href, "https://greenatics.test").hash.slice(1);
    if (anchor) {
      const targetHtml = fs.readFileSync(targetPath, "utf8");
      expect(targetHtml, `${key} anchor should exist: #${anchor}`).toContain(`id="${anchor}"`);
    }
  }

  const contactRoute = diagnosticRoutes["municipio:diagnostico"];
  const routeWithContactAnchor = {
    ...contactRoute,
    secondary: { ...contactRoute.secondary!, href: "/contacto/?origen=diagnostico#formulario" },
  };
  const anchoredSecondaryUrl = new URL(
    buildDiagnosticSecondaryHref("municipio", routeWithContactAnchor, "Conocer la generación")!,
    "https://greenatics.test",
  );
  expect(anchoredSecondaryUrl.searchParams.get("origen")).toBe("diagnostico");
  expect(anchoredSecondaryUrl.hash).toBe("#formulario");
});

test("recommendations avoid unsupported performance and reporting guarantees", () => {
  const routeCopy = JSON.stringify(diagnosticRoutes).toLocaleLowerCase("es-CO");
  for (const unsupportedClaim of [
    "pureza > 90%",
    "mitigación de co2",
    "certificados mensuales",
    "sin impacto vecinal",
    "retorno de inversión garantizado",
    "reportes auditables",
  ]) {
    expect(routeCopy).not.toContain(unsupportedClaim);
  }

  const vehicleRoute = diagnosticRoutes["esp:ruta"];
  expect(vehicleRoute.copy).toContain("Greenatics y Auteco Mobility desarrollaron conjuntamente una configuración de motocarguero sobre base Ceronte");
  expect(vehicleRoute.copy).toContain("un contenedor diseñado por Greenatics");
  expect(vehicleRoute.copy).toContain("diseñado por Greenatics para apoyar la recolección selectiva de orgánicos");
  expect(vehicleRoute.copy).not.toContain("requerimientos técnicos y jurídicos más exigentes");
  expect(vehicleRoute.copy).toContain("96,4 %");

  const wondergreenRoute = diagnosticRoutes["agro:producto"];
  expect(wondergreenRoute.copy).toContain("fertilizantes sólidos organominerales ocluidos");
  expect(wondergreenRoute.copy).toContain("200-0-0 es la formulación de mayor concentración de nitrógeno");

  for (const routeKey of ["hogar:kit", "hogar:producto", "hogar:guia", "hogar:planta"]) {
    expect(diagnosticRoutes[routeKey].contactInterest).toBe("casa-jardin");
    expect(diagnosticRoutes[routeKey].contactProfile).toBe("hogar");
  }
});

test("diagnostic handoff preserves the selected need in the editable contact summary", () => {
  const formSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
  expect(formSource).toContain("buildDiagnosticRequestDetails(diagnosticTitle, diagnosticNeed, diagnosticMode)");
  expect(formSource).toContain('const initialDetails = [planDetails, diagnosticDetails, handoffDraft].filter(Boolean).join("\\n\\n");');
  expect(formSource).toContain("if (initialDetails) setDetails(initialDetails);");
  expect(formSource).toContain('`*Interés:* ${context?.title || "Orientación general"}\\n`');
  expect(formSource).toContain("const activeContext = context?.profile === profile ? context : null");
  expect(formSource).toContain("El interés de origen se conserva y puedes editar la necesidad antes de abrir WhatsApp.");

  expect(buildDiagnosticRequestDetails("Ruta municipal", "Conocer la generación", "route")).toBe(
    "Ruta sugerida: Ruta municipal\nNecesidad seleccionada: Conocer la generación",
  );
  expect(buildDiagnosticRequestDetails("Comparar un kit", "Elegir por uso", "home")).toBe(
    "Consulta: Comparar un kit\nContexto de consulta: Elegir por uso",
  );
  expect(buildDiagnosticRequestDetails("Flujo de materia orgánica", "120 t/mes", "organic-flow")).toBe(
    "Escenario consultado: Flujo de materia orgánica\nDato de consulta: 120 t/mes",
  );
});
