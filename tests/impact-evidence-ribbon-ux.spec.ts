import { expect, test } from "@playwright/test";

test("impact evidence indicators stay open, readable, and inside the viewport", async ({ page }) => {
  const widths = [1440, 1024, 768, 390, 320];
  const expectedContexts = [
    "periodo validado",
    "periodo validado",
    "ruta validada",
    "escenario anualizado",
  ];

  await page.setViewportSize({ width: widths[0], height: 1000 });
  await page.goto("/impacto/", { waitUntil: "networkidle" });

  const ribbon = page.locator(".gt-impact-proof-ribbon");
  const grid = ribbon.locator(".gt-proof-ribbon__grid");
  const metrics = grid.locator(":scope > div:not(.gt-proof-ribbon__intro)");
  await expect(ribbon).toBeVisible();
  await expect(metrics).toHaveCount(4);
  await expect(metrics.locator("strong")).toHaveText([
    "+120 t/mes",
    "96,4 %",
    "140 km",
    "$180 M COP/año",
  ]);
  await expect(metrics.locator("span")).toHaveText([
    "Orgánicos desviados",
    "Pureza en recepción",
    "Transporte evitado por viaje",
    "Ahorro anualizado en fletes",
  ]);
  await expect(metrics.locator("small")).toHaveText(expectedContexts);
  await expect(page.locator('a[href="#resultados"]')).toHaveCount(1);
  await expect(page.locator('.gt-service-hero .button-row a[href="/proyectos/"]')).toHaveCount(1);

  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 390 || width === 320 ? 844 : 1000 });

    const state = await page.evaluate(() => {
      const ribbonElement = document.querySelector<HTMLElement>(".gt-impact-proof-ribbon");
      const metricElements = [...document.querySelectorAll<HTMLElement>(
        ".gt-impact-proof-ribbon .gt-proof-ribbon__grid > div:not(.gt-proof-ribbon__intro)",
      )];

      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        ribbonLeft: ribbonElement?.getBoundingClientRect().left ?? -1,
        ribbonRight: ribbonElement?.getBoundingClientRect().right ?? Number.POSITIVE_INFINITY,
        metricStyles: metricElements.map((element) => {
          const style = getComputedStyle(element);
          const context = element.querySelector("small");
          return {
            left: element.getBoundingClientRect().left,
            right: element.getBoundingClientRect().right,
            borderLeft: style.borderLeftWidth,
            borderRight: style.borderRightWidth,
            contextFontSize: context ? getComputedStyle(context).fontSize : "missing",
          };
        }),
      };
    });

    expect(state.documentWidth, `document overflow at ${width}px`).toBeLessThanOrEqual(width);
    expect(state.ribbonLeft).toBeGreaterThanOrEqual(0);
    expect(state.ribbonRight).toBeLessThanOrEqual(width);
    expect(state.metricStyles).toHaveLength(4);
    for (const metric of state.metricStyles) {
      expect(metric.left, `metric left edge at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(metric.right, `metric right edge at ${width}px`).toBeLessThanOrEqual(width);
      expect(metric.borderLeft, `vertical divider at ${width}px`).toBe("0px");
      expect(metric.borderRight, `vertical divider at ${width}px`).toBe("0px");
      expect(Number.parseFloat(metric.contextFontSize), `context size at ${width}px`).toBeGreaterThanOrEqual(12);
    }
  }
});
