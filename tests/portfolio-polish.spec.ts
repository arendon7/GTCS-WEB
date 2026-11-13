import { expect, test } from "@playwright/test";

const widths = [1440, 1024, 900, 768, 390, 320];

const contrastRatio = (foreground: string, background: string) => {
  const luminance = (color: string) => {
    const channels = color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length !== 3) throw new Error(`Unexpected color: ${color}`);
    const linear = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

test("portfolio hero uses a clear primary route and a quieter diagnostic action", async ({ page }) => {
  await page.goto("/portafolio/");

  await expect(page).toHaveTitle(/Servicios, productos y herramientas \| Greenatics/);
  await expect(page.getByText("Greenatics 2.0", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Consultoría ambiental: de la ciencia a la operación.",
  );

  const primary = page.getByRole("link", { name: "Ver las rutas del portafolio" });
  const secondary = page.getByRole("link", { name: "Orientar mi proyecto" });
  await expect(primary).toHaveAttribute("href", "#portafolio-servicios");
  await expect(secondary).toHaveAttribute("href", "/diagnostico/");

  const styles = await Promise.all([primary, secondary].map((button) => button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      background: style.backgroundColor,
      color: style.color,
      borderColor: style.borderColor,
    };
  })));

  expect(styles[0].height).toBeGreaterThanOrEqual(48);
  expect(styles[0].background).toBe("rgb(152, 207, 79)");
  expect(contrastRatio(styles[0].color, styles[0].background)).toBeGreaterThanOrEqual(4.5);
  expect(styles[1].height).toBeGreaterThanOrEqual(48);
  expect(styles[1].background).toBe("rgba(0, 0, 0, 0)");
  expect(styles[1].borderColor).toBe("rgba(244, 246, 239, 0.78)");
  expect(contrastRatio(styles[1].color, "rgb(7, 57, 43)")).toBeGreaterThanOrEqual(4.5);

  let reachedPrimary = false;
  for (let index = 0; index < 32; index += 1) {
    await page.keyboard.press("Tab");
    const focus = await page.locator(":focus").evaluate((element) => ({
      href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : null,
      visible: element.matches(":focus-visible"),
    })).catch(() => ({ href: null, visible: false }));
    if (focus.href === "#portafolio-servicios") {
      reachedPrimary = true;
      expect(focus.visible).toBe(true);
      break;
    }
  }
  expect(reachedPrimary).toBe(true);
  await expect(primary).toHaveCSS("outline-color", "rgb(184, 220, 110)");
  await expect(primary).toHaveCSS("outline-width", "3px");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#portafolio-servicios$/);
});

test("portfolio keeps approved product references and fits common screen widths", async ({ page }) => {
  await page.goto("/portafolio/");
  const products = page.locator("#portafolio-productos");
  await products.scrollIntoViewIfNeeded();
  await expect(products.getByRole("group", { name: "Sacos de referencia de fertilizantes sólidos Wondergreen" })).toBeVisible();
  await expect(products.getByText("2GROW · 15-3-3")).toBeVisible();
  await expect(products.getByText("2BALANCE · 7-7-7")).toBeVisible();
  await expect(products.getByText("2BLOOM · 3-8-3")).toBeVisible();
  await expect(products.getByText("2FRUIT · 3-3-8")).toBeVisible();
  await expect(products.getByText(/sacos de referencia de 20 kg/)).toBeVisible();

  const images = products.locator("img");
  await expect(images).toHaveCount(4);
  await expect.poll(() => images.evaluateAll((elements) => elements.every((element) => {
    const image = element as HTMLImageElement;
    return image.complete && image.naturalWidth > 0 && image.alt.length > 0;
  }))).toBe(true);

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      buttons: [...document.querySelectorAll<HTMLElement>(".portfolio-v5-hero .button")].map((button) => {
        const rect = button.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
      }),
    }));
    expect(layout.content, `horizontal overflow at ${width}px`).toBe(layout.viewport);
    expect(layout.buttons).toHaveLength(2);
    for (const button of layout.buttons) {
      expect(button.left).toBeGreaterThanOrEqual(0);
      expect(button.right).toBeLessThanOrEqual(width);
      expect(button.height).toBeGreaterThanOrEqual(48);
    }
  }
});

test("portfolio hero buttons honor reduced motion", async ({ page }) => {
  await page.goto("/portafolio/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const primary = page.getByRole("link", { name: "Ver las rutas del portafolio" });
  await primary.hover();

  const motion = await primary.evaluate((element) => {
    const style = getComputedStyle(element);
    return { transition: style.transitionDuration, transform: style.transform };
  });
  expect(motion.transition).toBe("0s");
  expect(motion.transform).toBe("none");
});
