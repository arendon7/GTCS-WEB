import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("changing the audience preserves the originating interest in the request", async ({ page }) => {
  await page.goto("/contacto/?interes=casa-jardin");

  const context = page.getByRole("status");
  await expect(context).toContainText("Orientación para tus plantas");

  await page.getByRole("button", { name: "Municipio / ESP" }).click();
  await expect(context).toContainText("El interés de origen se conserva y puedes editar la necesidad");
  await expect(page.getByRole("heading", { name: "Ajusta el perfil de tu solicitud" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Municipio / ESP" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Casa y Jardín" }).click();
  await expect(context).toContainText("Orientación para tus plantas");
  await expect(page.getByPlaceholder("nombre@correo.com")).toBeVisible();
});

test("each contact audience receives matching entity and scale fields", async ({ page }) => {
  const profiles = [
    { interest: "municipios", audience: "Municipio / ESP", entity: "Municipio o empresa de servicios públicos *", scale: "Volumen mensual estimado" },
    { interest: "empresas", audience: "Organización / Gran generador", entity: "Organización o gran generador *", scale: "Sedes, generadores o corrientes" },
    { interest: "agroindustria", audience: "Agroindustria / proyecto productivo", entity: "Agroindustria o proyecto productivo *", scale: "Corrientes o capacidad de proceso" },
    { interest: "agroway", audience: "Productor / Finca", entity: "Finca o unidad productiva *", scale: "Área y cultivo" },
    { interest: "casa-jardin", audience: "Casa y Jardín", entity: "Hogar, jardín o huerta *", scale: "Espacio, plantas o kits de interés" },
    { interest: "red", audience: "Territorio / Organización", entity: "Municipio, organización o gran generador *", scale: "Generadores, sedes o rutas" },
    { interest: "herramientas", audience: "Equipo / plataforma", entity: "Organización o proyecto *", scale: "Sedes, usuarios o procesos" },
    { interest: "sana", audience: "Proyecto / aliado", entity: "Proyecto, organización o aliado *", scale: "Actividad, escala o etapa" },
    { interest: "soluciones", audience: "Proyecto / aliado", entity: "Proyecto, organización o aliado *", scale: "Actividad, escala o etapa" },
  ];

  for (const profile of profiles) {
    await page.goto(`/contacto/?interes=${profile.interest}`);
    await expect(page.getByRole("button", { name: profile.audience })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel(profile.entity)).toBeVisible();
    await expect(page.getByLabel(profile.scale)).toBeVisible();
  }
});

test("agroindustrial service journeys keep the audience through detail and contact", async ({ page }) => {
  await page.goto("/agroindustria/");
  await page.getByRole("link", { name: "Consultar una prefactibilidad" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=prefactibilidad&perfil=agroindustria$/);
  await expect(page.getByRole("button", { name: "Agroindustria \/ proyecto productivo" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Corrientes o capacidad de proceso")).toBeVisible();

  await page.goto("/agroindustria/");
  await page.getByRole("link", { name: "Revisar diseño e ingeniería" }).click();
  await expect(page).toHaveURL(/\/servicios\/plantas-modulares\/?\?perfil=agroindustria$/);
  await page.getByRole("link", { name: "Definir la fase de mi proyecto" }).click();
  await expect(page).toHaveURL(/\/contacto\/?\?servicio=plantas-modulares&perfil=agroindustria$/);
  await expect(page.getByRole("button", { name: "Agroindustria \/ proyecto productivo" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Definir la fase adecuada para una planta")).toBeVisible();
});

test("agroindustrial biogas assessment keeps the audience through contact", async ({ page }) => {
  await page.goto("/agroindustria/");
  await page.getByRole("link", { name: "Conocer la ruta de biogás" }).click();
  await expect(page).toHaveURL(/\/soluciones\/biogas-energia\/?\?perfil=agroindustria$/);

  const handoff = page.getByRole("link", { name: /Solicitar revisión de alcance/ });
  await expect(handoff).toHaveAttribute("href", /perfil=agroindustria/);
  await handoff.click();

  await expect(page).toHaveURL(/\/contacto\/?\?interes=solucion&perfil=agroindustria/);
  await expect(page.getByRole("button", { name: "Agroindustria \/ proyecto productivo" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Agroindustria o proyecto productivo *")).toBeVisible();
});

test("municipal and company service journeys preserve audience through detail and contact", async ({ page }) => {
  await page.goto("/municipios/");
  await page.getByRole("link", { name: "Explorar la formulación del PGIRS" }).click();
  await expect(page).toHaveURL(/\/servicios\/pgirs-pmirs\/\?perfil=municipio#pgirs-municipal$/);
  await page.getByRole("link", { name: "Conversar sobre un PGIRS" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pgirs-municipal&perfil=municipio$/);
  await expect(page.getByRole("button", { name: "Municipio \/ ESP" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Municipio o empresa de servicios públicos *")).toBeVisible();

  await page.goto("/municipios/");
  await page.getByRole("link", { name: "Explorar la formulación del PGIRS" }).click();
  await page.getByRole("link", { name: "Conversar sobre un PMIRS" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pmirs-organizacional&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Conversar sobre mi operación" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?interes=empresas$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Ver actividades y alcance del PMIRS" }).click();
  await expect(page).toHaveURL(/\/servicios\/pgirs-pmirs\/\?perfil=empresa#pmirs-organizacional$/);
  await page.getByRole("link", { name: "Conversar sobre un PMIRS" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pmirs-organizacional&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Ver actividades y alcance del PMIRS" }).click();
  await page.getByRole("link", { name: "Conversar sobre un PGIRS" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pgirs-municipal&perfil=municipio$/);
  await expect(page.getByRole("button", { name: "Municipio \/ ESP" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Conocer el diseño de microrrutas" }).click();
  await expect(page).toHaveURL(/\/servicios\/microrrutas-motocarguero\/\?perfil=empresa$/);
  await page.getByRole("link", { name: "Evaluar una ruta selectiva" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=microrrutas-motocarguero&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Sedes, generadores o corrientes")).toBeVisible();
});

test("company closing inquiry carries the operation context into contact", async ({ page }) => {
  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Compartir el contexto de mi operación" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?interes=empresas&perfil=empresa&diagnostico=/);

  const inquiry = new URL(page.url());
  expect(inquiry.pathname).toBe("/contacto/");
  expect(inquiry.searchParams.get("interes")).toBe("empresas");
  expect(inquiry.searchParams.get("perfil")).toBe("empresa");
  expect(inquiry.searchParams.get("diagnostico")).toBe("Organizar residuos en una o varias sedes");
  expect(inquiry.searchParams.get("prioridad")).toBe("Compartir sedes, corrientes, responsables y necesidad actual");
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Ruta sugerida: Organizar residuos en una o varias sedes");
  await expect(page.getByRole("status")).toContainText("Necesidad seleccionada: Compartir sedes, corrientes, responsables y necesidad actual");
});

test("organization types reach the service and form context that fits their need", async ({ page }) => {
  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Planear el PMIRS de mi copropiedad" }).click();
  await expect(page).toHaveURL(/\/servicios\/pgirs-pmirs\/\?perfil=empresa#pmirs-organizacional$/);
  await page.getByRole("link", { name: "Conversar sobre un PMIRS" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pmirs-organizacional&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("unidad o conjunto residencial");

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Diseñar la microrruta de mi centro comercial" }).click();
  await expect(page).toHaveURL(/\/servicios\/microrrutas-motocarguero\/\?perfil=empresa$/);
  await page.getByRole("link", { name: "Evaluar una ruta selectiva" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=microrrutas-motocarguero&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Sedes, generadores o corrientes")).toBeVisible();

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Organizar el PMIRS de mi institución" }).click();
  await expect(page).toHaveURL(/\/servicios\/pgirs-pmirs\/\?perfil=empresa#pmirs-organizacional$/);
  await page.getByRole("link", { name: "Conversar sobre un PMIRS" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=pmirs-organizacional&perfil=empresa$/);
  await expect(page.getByRole("status")).toContainText("centro comercial, institución");

  await page.goto("/empresas/");
  await page.getByRole("link", { name: "Caracterizar mis corrientes orgánicas" }).click();
  await expect(page).toHaveURL(/\/servicios\/diagnostico-residuos\/\?perfil=empresa$/);
  await page.getByRole("link", { name: "Solicitar diagnóstico de residuos" }).click();
  await expect(page).toHaveURL(/\/contacto\/\?servicio=diagnostico-residuos&perfil=empresa$/);
  await expect(page.getByRole("button", { name: "Organización \/ Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Sedes, generadores o corrientes")).toBeVisible();
});

test("each Huella annual-plan inquiry preserves its selected reference plan without sending it", async ({ page }) => {
  for (const plan of ["Huella Esencial", "Huella Empresarial", "Gestión Corporativa"]) {
    await page.goto(`/contacto/?interes=calcula-tu-huella&plan=${encodeURIComponent(plan)}`);

    const context = page.getByRole("status").filter({ hasText: "Elegir un plan y preparar el inventario GEI" });
    await expect(context).toContainText(`Plan consultado: ${plan}`);
    await expect(context).toContainText("El precio publicado es de referencia");
    await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue(`Plan de interés: ${plan} (precio de referencia; condiciones a confirmar).`);
    await expect(page.getByRole("button", { name: /Revisar resumen y abrir WhatsApp/ })).toBeVisible();
    await expect(page.getByText("El resumen está listo en WhatsApp.")).toHaveCount(0);
  }
});

test("the general annual offer preserves the selected company size through contact", async ({ page }) => {
  const sizes = [
    { slug: "pyme", label: "Empresa Pyme" },
    { slug: "mediana", label: "Empresa mediana" },
    { slug: "grande", label: "Empresa grande" },
  ];

  for (let index = 0; index < sizes.length; index += 1) {
    const size = sizes[index];
    await page.goto("/huella/#planes");
    await page.locator(".carbon-v4-pricing__sizes article").nth(index).getByRole("link", { name: "Solicitar propuesta" }).click();
    await expect(page).toHaveURL(new RegExp(`/contacto/\\?interes=calcula-tu-huella&tamano_empresa=${size.slug}$`));
    await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue(
      `Tamaño indicado para la propuesta anual: ${size.label}. Se confirmará con el equipo según la operación y el trabajo requerido.`,
    );
    await expect(page.getByRole("status")).toContainText(size.label);
  }
});

test("the tools and legacy platforms interests share one clear contact context", async ({ page }) => {
  for (const interest of ["herramientas", "plataformas"]) {
    await page.goto(`/contacto/?interes=${interest}`);

    const context = page.getByRole("status");
    await expect(context).toContainText("Elegir el siguiente paso para tu organización");
    await expect(context).toContainText("visitar una demo no habilita por sí solo un entorno operativo");
    await expect(page.getByRole("button", { name: "Equipo / plataforma" })).toHaveAttribute("aria-pressed", "true");
  }
});

test("the contact form explains when a tool summary was not retained", async ({ page }) => {
  await page.goto("/contacto/?interes=wondergreen&perfil=agro&diagnostico=Calidad%20de%20agua&transferencia=sesion");

  const recovery = page.getByText(/la sesión del navegador no lo conservó/);
  await expect(recovery).toBeVisible();
  await expect(recovery).toHaveAttribute("role", "status");
  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue("Ruta sugerida: Calidad de agua");
});

test("the private tool handoff is reviewable by keyboard without submitting", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("greenatics:tool-contact-draft:v1", JSON.stringify({
      version: 1,
      details: "pH del agua: 6.8\nCultivo: café",
      createdAt: Date.now(),
    }));
  });
  await page.goto("/contacto/?interes=wondergreen&perfil=agro&diagnostico=Calidad%20de%20agua&transferencia=sesion");

  const textarea = page.getByLabel("Qué quieres resolver o decidir");
  await expect(textarea).toHaveValue("Ruta sugerida: Calidad de agua\n\npH del agua: 6.8\nCultivo: café");
  await expect(page.getByText(/Los datos de la herramienta o evaluación se conservan temporalmente/)).toHaveAttribute("role", "status");

  const firstProfile = page.getByRole("button", { name: "Municipio / ESP" });
  const secondProfile = page.getByRole("button", { name: "Organización / Gran generador" });
  await firstProfile.focus();
  await page.keyboard.press("Tab");
  await expect(secondProfile).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(secondProfile).toHaveAttribute("aria-pressed", "true");

  for (const profile of ["Agroindustria / proyecto productivo", "Productor / Finca", "Casa y Jardín", "Territorio / Organización", "Clima / datos", "Equipo / plataforma", "Proyecto / aliado"]) {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: profile })).toBeFocused();
  }

  const fieldsInTabOrder = [
    page.getByLabel("Nombre y cargo *"),
    page.getByLabel("Organización o gran generador *"),
    page.getByLabel("Correo Electrónico *"),
    page.getByLabel("Celular / WhatsApp *"),
    page.getByLabel("Ciudad o municipio y departamento *"),
    page.getByLabel("Sedes, generadores o corrientes"),
    textarea,
    page.getByLabel(/He leído la política y autorizo/),
    page.getByRole("button", { name: /Revisar resumen y abrir WhatsApp/ }),
    page.getByRole("button", { name: "Preparar borrador de correo" }),
  ];
  for (const field of fieldsInTabOrder) {
    await page.keyboard.press("Tab");
    await expect(field).toBeFocused();
  }
  await expect(page.getByText(/El resumen está listo en WhatsApp/)).toHaveCount(0);
});

test("a specific service takes precedence over a broad tool interest", async ({ page }) => {
  await page.goto("/contacto/?interes=red&servicio=microrrutas-motocarguero");

  const context = page.getByRole("status");
  await expect(context).toContainText("Diseñar una ruta alrededor de una solución desarrollada para el sector");
  await expect(context).toContainText("Greenatics y Auteco Mobility desarrollaron conjuntamente una configuración de motocarguero sobre base Ceronte");
  await expect(page.getByRole("button", { name: "Territorio / Organización" })).toHaveAttribute("aria-pressed", "true");
});

test("organic-flow scenario keeps its own context and matching data fields", async ({ page }) => {
  await page.goto("/contacto/?interes=estimador-organicos&perfil=territorio&diagnostico=Flujo%20de%20materia%20org%C3%A1nica&prioridad=proyecci%C3%B3n%20de%20flujo");

  const context = page.getByRole("status");
  await expect(context).toContainText("Revisar el flujo y la meta de desvío");
  await expect(context).toContainText("La proyección describe masa, no emisiones evitadas");
  await expect(context).toContainText("proyección de flujo");
  await expect(page.getByRole("button", { name: "Territorio / Organización" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Generadores, sedes o rutas")).toBeVisible();
});

test("agroindustrial pilot links preserve the source stream and use readable audience labels", async ({ page }) => {
  await page.goto("/contacto/?servicio=idi-agroindustrial&perfil=agro&diagnostico=Valorizaci%C3%B3n%20de%20subproductos%20del%20caf%C3%A9&prioridad=Pulpa%2C%20muc%C3%ADlago%20u%20otras%20corrientes%20del%20beneficio");

  const context = page.getByRole("status");
  await expect(context).toContainText("Describe la biomasa, el proceso y el producto que quieres probar");
  await expect(context).toContainText("Perfil seleccionado: Productor / Finca");
  await expect(context).toContainText("Pulpa, mucílago u otras corrientes del beneficio");
  await expect(page.getByRole("button", { name: "Productor / Finca" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Finca o unidad productiva *")).toBeVisible();
  await expect(page.getByLabel("Área y cultivo")).toBeVisible();

  await page.goto("/contacto/?servicio=idi-agroindustrial&perfil=empresa&diagnostico=Valorizaci%C3%B3n%20de%20corrientes%20pecuarias&prioridad=Esti%C3%A9rcol%2C%20porquinaza%2C%20gallinaza%20u%20otras%20corrientes%20pecuarias");
  await expect(context).toContainText("Perfil seleccionado: Organización / Gran generador");
  await expect(context).toContainText("Estiércol, porquinaza, gallinaza u otras corrientes pecuarias");
  await expect(page.getByRole("button", { name: "Organización / Gran generador" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Organización o gran generador *")).toBeVisible();
});

test("diagnostic selection and original interest are included in the WhatsApp summary", async ({ page }) => {
  await page.goto("/contacto/?interes=calcula-tu-huella&perfil=clima&diagnostico=Preparar%20una%20l%C3%ADnea%20base&prioridad=Organizar%20un%20inventario");

  const details = page.getByLabel("Qué quieres resolver o decidir");
  await expect(details).toHaveValue("Ruta sugerida: Preparar una línea base\nNecesidad seleccionada: Organizar un inventario");
  await page.getByRole("button", { name: "Casa y Jardín" }).click();
  await page.getByLabel("Nombre *").fill("Ana Pérez");
  await page.getByLabel("Hogar, jardín o huerta *").fill("Huerta familiar");
  await page.getByLabel("Correo Electrónico *").fill("ana@example.com");
  await page.getByLabel("Celular / WhatsApp (opcional)").fill("3001234567");
  await page.getByLabel("Ciudad o municipio y departamento *").fill("Medellín, Antioquia");
  await page.getByRole("button", { name: /Revisar resumen y abrir WhatsApp/ }).click();
  await expect(page.getByText("El resumen está listo en WhatsApp.")).toHaveCount(0);
  await page.getByLabel(/He leído la política y autorizo/).check();
  await page.getByRole("button", { name: /Revisar resumen y abrir WhatsApp/ }).click();

  const handoff = page.getByRole("link", { name: "continúa aquí" });
  await expect(handoff).toHaveAttribute("href", /^https:\/\/wa\.me\/573003078822\?text=/);
  const openedUrl = await handoff.getAttribute("href") || "";
  const message = new URL(openedUrl).searchParams.get("text") || "";
  expect(message).toContain("*Interés:* Ruta sugerida: Preparar una línea base");
  expect(message).toContain("*Perfil:* Casa y Jardín");
  expect(message).toContain("*Requerimiento:* Ruta sugerida: Preparar una línea base\nNecesidad seleccionada: Organizar un inventario");
  expect(message).toContain("He leído la política de tratamiento de datos personales y autorizo a GREENATICS S.A.S.");
  await page.getByLabel("Qué quieres resolver o decidir").fill("Solicitud corregida antes de enviar");
  await expect(page.getByText("El resumen está listo en WhatsApp.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "continúa aquí" })).toHaveCount(0);
});

test("a contact request can be prepared as a reviewable email draft without sending it", async ({ page }) => {
  await page.goto("/contacto/?interes=wondergreen&perfil=agro&diagnostico=Solicitud%20de%20cotizaci%C3%B3n%20Wondergreen");
  await page.getByLabel("Nombre *").fill("Ana Prueba");
  await page.getByLabel("Finca o unidad productiva *").fill("Finca de prueba");
  await page.getByLabel("Correo Electrónico *").fill("ana@example.test");
  await page.getByLabel("Ciudad o municipio y departamento *").fill("Támesis, Antioquia");
  await page.getByLabel("Área y cultivo").fill("1 ha de café (dato de prueba)");
  await page.getByLabel("Qué quieres resolver o decidir").fill("Consultar un kit y fertilizante (dato de prueba)");

  await page.getByRole("button", { name: "Preparar borrador de correo" }).click();
  await expect(page.getByRole("link", { name: "Abrir borrador de correo" })).toHaveCount(0);
  await page.getByLabel(/He leído la política y autorizo/).check();
  await page.getByRole("button", { name: "Preparar borrador de correo" }).click();

  const emailDraft = page.getByRole("link", { name: "Abrir borrador de correo" });
  await expect(emailDraft).toBeVisible();
  const href = await emailDraft.getAttribute("href");
  expect(href).toMatch(/^mailto:contacto@greenatics\.com\.co\?/);
  const query = new URLSearchParams(href?.split("?")[1] ?? "");
  expect(query.get("subject")).toContain("Solicitud Greenatics");
  expect(query.get("body")).toContain("Ana Prueba");
  expect(query.get("body")).toContain("Finca de prueba");
  expect(query.get("body")).toContain("Consultar un kit y fertilizante (dato de prueba)");
  expect(query.get("body")).toContain("He leído la política de tratamiento de datos personales y autorizo a GREENATICS S.A.S.");

  await page.getByLabel("Qué quieres resolver o decidir").fill("Solicitud editada antes de enviar");
  await expect(page.getByRole("link", { name: "Abrir borrador de correo" })).toHaveCount(0);
});

test("Wondergreen program inquiry explains how to propose a crop program or field trial", async ({ page }) => {
  await page.goto("/contacto/?servicio=programas-wondergreen");

  const context = page.getByRole("status");
  await expect(context).toContainText("Evaluar un programa o ensayo agronómico");
  await expect(context).toContainText("meta de circularidad o carbono");
  await expect(context).toContainText("cultivo, variedad, lote o área, etapa y objetivo productivo");
  await expect(context).toContainText("si conviene formular un programa o diseñar un ensayo");
  await expect(page.getByRole("button", { name: "Productor / Finca" })).toHaveAttribute("aria-pressed", "true");
});

test("the contact form accepts either email or phone and keeps the other optional", async ({ page }) => {
  await page.goto("/contacto/");

  const email = page.getByLabel("Correo Electrónico *");
  const phone = page.getByLabel("Celular / WhatsApp *");
  await expect(email).toHaveJSProperty("required", true);
  await expect(phone).toHaveJSProperty("required", true);

  await email.fill("equipo@example.com");
  await expect(page.getByLabel("Celular / WhatsApp (opcional)")).toHaveJSProperty("required", false);

  await email.fill("");
  await page.getByLabel("Celular / WhatsApp *").fill("3001234567");
  await expect(page.getByLabel("Correo Electrónico (opcional)")).toHaveJSProperty("required", false);
});

test("contact FAQ answers stay collapsed until the visitor opens one", async ({ page }) => {
  await page.goto("/contacto/");

  const firstAnswer = page.getByText(/Una descripción del flujo o cultivo, ubicación/);
  await expect(firstAnswer).toBeHidden();
  await page.getByText("¿Qué información conviene traer a la primera conversación?").click();
  await expect(firstAnswer).toBeVisible();
});

test("contact draft survives navigation only for the same request and can be cleared", async ({ page }) => {
  await page.goto("/contacto/?interes=empresas");
  await page.getByLabel("Nombre y cargo *").fill("Ana Pérez");
  await page.getByLabel("Organización o gran generador *").fill("Centro Comercial Norte");
  await page.getByLabel("Qué quieres resolver o decidir").fill("Separación y retiro de orgánicos");
  await page.goto("/servicios/");
  await page.goto("/contacto/?interes=empresas");
  await expect(page.getByLabel("Nombre y cargo *")).toHaveValue("Ana Pérez");
  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue("Separación y retiro de orgánicos");
  await expect(page.getByText("Recuperamos tu borrador de esta pestaña.")).toBeVisible();

  await page.goto("/contacto/?interes=municipios");
  await expect(page.getByLabel("Nombre y cargo *")).toHaveValue("");
  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue("");

  await page.goto("/contacto/?interes=empresas");
  await page.getByRole("button", { name: "Borrar borrador local" }).click();
  await expect(page.getByLabel("Nombre y cargo *")).toHaveValue("");
  await page.reload();
  await expect(page.getByLabel("Nombre y cargo *")).toHaveValue("");
});

test("a fresh tool handoff wins over an older contact draft", async ({ page }) => {
  await page.goto("/contacto/?interes=wondergreen&perfil=agro&diagnostico=Calidad%20de%20agua&transferencia=sesion");
  await page.getByLabel("Qué quieres resolver o decidir").fill("Consulta anterior");
  await page.addInitScript(() => {
    window.sessionStorage.setItem("greenatics:tool-contact-draft:v1", JSON.stringify({
      version: 1,
      details: "Nueva lectura del agua: pH 6.8",
      createdAt: Date.now(),
    }));
  });
  await page.reload();
  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue(/Nueva lectura del agua: pH 6\.8/);
  await expect(page.getByLabel("Qué quieres resolver o decidir")).not.toHaveValue(/Consulta anterior/);
});

test("privacy page describes storage, external handoff, rights, and publication review state", async ({ page }) => {
  await page.goto("/legal/privacidad/");
  await expect(page.getByRole("heading", { name: "Tu información, explicada con claridad." })).toBeVisible();
  await expect(page.getByText(/Versión candidata del 1 de noviembre de 2026/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Datos guardados en tu navegador" })).toBeVisible();
  await expect(page.getByText(/El sitio no conserva una constancia separada de la casilla/)).toBeVisible();
  await expect(page.getByText(/Si abres WhatsApp, el sitio pasa la dirección y el texto prellenado a ese servicio/)).toBeVisible();
  await expect(page.getByText(/hasta 30 minutos/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tus derechos y cómo ejercerlos" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Contactar a Greenatics/ })).toHaveAttribute("href", /mailto:contacto@greenatics\.com\.co/);
});

test("the visible draft controls have no serious accessibility blockers", async ({ page }) => {
  await page.goto("/contacto/?interes=empresas");
  await page.getByLabel("Nombre y cargo *").fill("Ana Pérez");
  await expect(page.getByRole("button", { name: "Borrar borrador local" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious").map((violation) => violation.id)).toEqual([]);
});
