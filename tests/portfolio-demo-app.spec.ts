import { expect, test } from "@playwright/test";

test.describe("muestras SANA y AGROWAY", () => {
  test("la landing AGROWAY presenta su demo y mantiene la visión conectada del producto", async ({ page }) => {
    await page.goto("/agroway/", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Conecta lo que ocurre en cada lote con las decisiones del ciclo." })).toBeVisible();
    await expect(page.getByText(/La demo usa datos ficticios/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir la demo navegable" })).toHaveAttribute("href", "/agroway/app/");
    await expect(page.getByRole("link", { name: "Conversar sobre AgroWay" })).toHaveAttribute("href", "/contacto/?interes=agroway");

    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      expect(geometry.document, `AGROWAY landing should fit at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 2);
    }
  });

  test("el inicio de SANA explica el recorrido y abre sus tres etapas principales", async ({ page }) => {
    await page.goto("/sana/app/", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Sigue una oportunidad hasta una decisión." })).toBeVisible();
    await expect(page.getByText("Los datos de estas vistas son ficticios y no representan proyectos, clientes ni inversiones reales.")).toBeVisible();
    await expect(page.getByText("COP 420 M")).toHaveCount(0);

    for (const [action, hash, heading] of [
      ["Abrir oportunidades", "opportunities", "Oportunidades"],
      ["Ver portafolio", "portfolio", "Portafolio"],
      ["Explorar revisión", "committee", "Revisión"],
    ]) {
      await page.goto("/sana/app/", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: action }).click();
      await expect(page).toHaveURL(new RegExp(`#${hash}$`));
      await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    }
  });

  test("SANA enlaza secciones y recupera el recorrido con Atrás/Adelante", async ({ page }) => {
    await page.goto("/sana/app/#opportunities", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Oportunidades", exact: true }).first()).toBeVisible();
    await expect(page.getByText("Demostración con datos ficticios. La navegación, búsqueda y selección son locales; no se guarda ni comparte información.")).toBeVisible();

    const sectionSelector = page.getByRole("combobox", { name: "Sección activa del recorrido SANA" });
    if (await sectionSelector.isVisible()) {
      await sectionSelector.selectOption("portfolio");
    } else {
      await page.getByRole("navigation", { name: "Secciones del recorrido SANA" }).getByRole("button", { name: /^03 Portafolio/ }).click();
    }

    await expect(page).toHaveURL(/#portfolio$/);
    await expect(page.getByRole("heading", { name: "Portafolio", exact: true }).first()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/#opportunities$/);
    await expect(page.getByRole("heading", { name: "Oportunidades", exact: true }).first()).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/#portfolio$/);
    await expect(page.getByRole("heading", { name: "Portafolio", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Conversar sobre un proyecto agrícola" })).toHaveAttribute("href", "/contacto/?interes=sana");
  });

  test("Atrás vuelve a Resumen cuando el recorrido comenzó sin fragmento", async ({ page }) => {
    for (const [kind, moduleName, moduleId] of [
      ["sana", "Oportunidades", "opportunities"],
      ["agroway", "Proyectos", "projects"],
    ] as const) {
      await page.goto(`/${kind}/app/`, { waitUntil: "networkidle" });
      const mobilePicker = page.getByRole("combobox", { name: new RegExp(`Sección activa del recorrido`) });
      if (await mobilePicker.isVisible()) {
        await mobilePicker.selectOption(moduleId);
      } else {
        const nav = page.getByRole("navigation", { name: new RegExp(`Secciones del recorrido`) });
        await nav.getByRole("button", { name: new RegExp(moduleName) }).first().click();
      }
      await expect(page).toHaveURL(new RegExp(`#${moduleId}$`));
      await expect(page.locator(".portfolio-demo__workspace-head h1")).toHaveText(moduleName);

      await page.goBack();
      await expect(page).toHaveURL(new RegExp(`/${kind}/app/$`));
      await expect(page.locator(".portfolio-demo__workspace-head h1")).toHaveText("Resumen");

      await page.goForward();
      await expect(page).toHaveURL(new RegExp(`#${moduleId}$`));
      await expect(page.locator(".portfolio-demo__workspace-head h1")).toHaveText(moduleName);

      const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
      await skipLink.focus();
      await skipLink.press("Enter");
      await expect(page).toHaveURL(/#contenido$/);
      await page.goBack();
      await page.goForward();
      await expect(page.locator(".portfolio-demo__workspace-head h1")).toHaveText(moduleName);
    }
  });

  test("SANA permite filtrar oportunidades, revisar el detalle y volver al registro", async ({ page }) => {
    await page.goto("/sana/app/#opportunities", { waitUntil: "networkidle" });

    const search = page.getByRole("searchbox", { name: "Buscar en Oportunidades" });
    const record = page.getByRole("button", { name: /detalle de Café regenerativo · Proyecto de muestra 01/ });
    await record.click();
    await expect(record).toHaveAttribute("aria-expanded", "true");
    const detail = page.locator("#portfolio-demo-record-detail");
    await expect(detail.getByText("Qué revisar a continuación · OP-014")).toBeVisible();
    await expect(detail.getByText("Aclarar la oportunidad")).toBeVisible();
    await expect(detail.getByText("Café regenerativo · Proyecto de muestra 01")).toHaveCount(0);
    await expect(detail.getByText("En estructuración", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Cerrar detalle y volver al registro" }).click();
    await expect(record).toBeFocused();

    await search.fill("no existe");
    await expect(page.getByText(/No hay registros de ejemplo que coincidan con/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Ver detalle de/ })).toHaveCount(0);
  });

  test("AGROWAY conserva el estado del módulo y distingue el catálogo de muestra", async ({ page }) => {
    await page.goto("/agroway/app/#catalog", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Catálogo técnico", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("img", { name: "AGROWAY" })).toHaveAttribute("src", "/brand/agroway/agroway-logo.png");
    await expect(page.getByText(/Demo navegable con datos ficticios.*no conecta fincas reales/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Consultar catálogo Wondergreen" })).toHaveAttribute("href", "/wondergreen/#productos");

    const growLiquid = page.getByRole("button", { name: /detalle de Wondergreen 2GROW Líquido/ });
    await growLiquid.click();
    await expect(page.getByText(/200-0-0; esta última es la de mayor concentración de nitrógeno/)).toBeVisible();
    await expect(growLiquid).toHaveAttribute("aria-expanded", "true");
    const detail = page.locator("#portfolio-demo-record-detail");
    await expect(detail.getByText("Contrastar la referencia")).toBeVisible();
    await expect(detail.getByText("Wondergreen 2GROW Líquido")).toHaveCount(0);
    await expect(detail.getByText("Muestra", { exact: true })).toHaveCount(0);

    await page.reload();
    await expect(page).toHaveURL(/#catalog$/);
    await expect(page.getByRole("heading", { name: "Catálogo técnico", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Ver detalle de Wondergreen 2GROW Líquido" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("link", { name: "Conversar sobre trazabilidad agrícola" })).toHaveAttribute("href", "/contacto/?interes=agroway");
  });

  test("cada módulo abre una pauta útil sin repetir el resumen de su registro", async ({ page }) => {
    const modules = [
      ["/sana/app/#opportunities", "Aclarar la oportunidad", "Delimita la oportunidad antes de estructurarla."],
      ["/sana/app/#portfolio", "Relacionar alcance y avance", "Lee alcance, etapa y avance en conjunto."],
      ["/sana/app/#followup", "Definir la próxima acción", "Convierte el seguimiento en una próxima acción."],
      ["/sana/app/#data-room", "Comprobar el documento", "Ubica cada documento en su contexto."],
      ["/sana/app/#committee", "Hacer explícita la decisión", "Haz visible qué decisión está pendiente."],
      ["/agroway/app/#projects", "Delimitar el ciclo", "Ubica el ciclo antes de seguirlo."],
      ["/agroway/app/#lots", "Verificar el contexto del lote", "Lee el lote desde su contexto agronómico."],
      ["/agroway/app/#field", "Relacionar labor y evidencia", "Registra qué ocurrió en el lote."],
      ["/agroway/app/#evidence", "Revisar el soporte", "Comprueba el soporte detrás del registro."],
      ["/agroway/app/#harvest", "Conciliar la cosecha", "Concilia la cosecha con su soporte."],
      ["/agroway/app/#catalog", "Contrastar la referencia", "Conecta cada referencia con su uso."],
    ];

    for (const [route, guidance, sectionTitle] of modules) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: sectionTitle, exact: true })).toBeVisible();
      const record = page.locator(".portfolio-demo__records > button").first();
      const recordTitle = await record.locator("strong").innerText();
      await record.click();
      const detail = page.locator("#portfolio-demo-record-detail");
      await expect(detail.getByText(guidance, { exact: true })).toBeVisible();
      await expect(detail).not.toContainText(recordTitle);
    }
  });

  test("SANA y AGROWAY mantienen lectura, navegación y marcas sin desbordamiento móvil", async ({ page }) => {
    for (const [route, module, brand, selectorLabel] of [
      ["sana", "opportunities", "SANA", "Sección activa del recorrido SANA"],
      ["agroway", "projects", "AGROWAY", "Sección activa del recorrido AGROWAY"],
    ]) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${route}/app/#${module}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("region", { name: `Área de trabajo de ${brand}` })).toBeVisible();
      const mobileControl = page.getByRole("combobox", { name: selectorLabel });
      await expect(mobileControl).toBeVisible();

      const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      expect(geometry.document, `${brand} should fit at 390px`).toBeLessThanOrEqual(geometry.viewport + 2);
      expect(await mobileControl.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      const recordCopyWidth = await page.locator(".portfolio-demo__records > button").first().evaluate((button) => {
        return button.querySelector(":scope > div")?.getBoundingClientRect().width ?? 0;
      });
      expect(recordCopyWidth, `${brand} record copy should remain readable at 390px`).toBeGreaterThan(180);

      await page.setViewportSize({ width: 320, height: 740 });
      const narrowGeometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      expect(narrowGeometry.document, `${brand} should fit at 320px`).toBeLessThanOrEqual(narrowGeometry.viewport + 2);
      const narrowRecordCopyWidth = await page.locator(".portfolio-demo__records > button").first().evaluate((button) => {
        return button.querySelector(":scope > div")?.getBoundingClientRect().width ?? 0;
      });
      expect(narrowRecordCopyWidth, `${brand} record copy should remain readable at 320px`).toBeGreaterThan(150);
    }
  });

  test("los títulos de módulos de SANA y AGROWAY tienen contraste suficiente", async ({ page }) => {
    for (const route of ["/sana/app/#opportunities", "/agroway/app/#field"]) {
      await page.goto(route, { waitUntil: "networkidle" });
      const panelTitle = page.locator(".portfolio-demo__section-intro h2");
      await expect(panelTitle).toBeVisible();
      const contrast = await panelTitle.evaluate((element) => {
        const luminance = (color: string) => {
          const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
          const linear = channels.map((channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
        };
        const text = luminance(getComputedStyle(element).color);
        const background = luminance(getComputedStyle(element.closest(".portfolio-demo__section-intro")!).backgroundColor);
        return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
      });
      expect(contrast, `${route} module heading contrast`).toBeGreaterThanOrEqual(3);
    }
  });
});
