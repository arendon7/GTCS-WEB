import { expect, test } from "@playwright/test";

const widths = [1440, 1024, 900, 768, 390, 320];

test("the homepage polish keeps its editorial hierarchy and stable audience routes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Consultoría, ciencia y operación para retos ambientales reales.",
  );
  await expect(page.getByRole("link", { name: "Conocer servicios y soluciones" })).toHaveAttribute(
    "href",
    "/servicios/",
  );
  await expect(page.getByRole("link", { name: "Ver casos y experiencia" })).toHaveAttribute(
    "href",
    "/proyectos/",
  );

  await page.locator(".home-audience-paths").scrollIntoViewIfNeeded();
  await expect.poll(async () => page.locator(".home-audience-paths img").evaluateAll((images) =>
    images.length === 3 && images.every((image) => {
      const current = image as HTMLImageElement;
      return current.complete && current.naturalWidth > 0 && Boolean(current.alt);
    }),
  )).toBe(true);

  await expect(page.locator(".home-audience-paths a").first()).toHaveAttribute("href", "/municipios/");
  await expect(page.locator(".home-audience-path--compact")).toHaveCount(2);

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const compactPaths = [...document.querySelectorAll<HTMLElement>(".home-audience-path--compact")];
      const bounds = compactPaths.map((path) => {
        const rect = path.getBoundingClientRect();
        return { left: rect.left, width: rect.width };
      });
      return {
        viewport: root.clientWidth,
        content: root.scrollWidth,
        compactPaths: bounds,
      };
    });

    expect(layout.content, `homepage overflow at ${width}px`).toBe(layout.viewport);
    expect(layout.compactPaths).toHaveLength(2);
    if (width > 900) {
      const ratio = layout.compactPaths[0].width / layout.compactPaths[1].width;
      expect(ratio, `the longer organization path should receive more width at ${width}px`).toBeGreaterThan(1.2);
      expect(ratio).toBeLessThan(1.6);
    } else {
      expect(Math.abs(layout.compactPaths[0].width - layout.compactPaths[1].width)).toBeLessThan(2);
      expect(Math.abs(layout.compactPaths[0].left - layout.compactPaths[1].left)).toBeLessThan(2);
    }
  }
});

test("the primary action has clear contrast, keyboard focus, and reduced-motion support", async ({ page }) => {
  await page.goto("/");

  const primaryAction = page.getByRole("link", { name: "Conocer servicios y soluciones" });
  const button = await primaryAction.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      background: style.backgroundColor,
      color: style.color,
    };
  });

  expect(button.height).toBeGreaterThanOrEqual(48);
  expect(button.background).toBe("rgb(152, 207, 79)");
  expect(button.color).toBe("rgb(5, 31, 23)");

  let reachedPrimaryAction = false;
  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press("Tab");
    const focus = await page.locator(":focus").evaluate((element) => ({
      href: element instanceof HTMLAnchorElement ? element.getAttribute("href") : null,
      visible: element.matches(":focus-visible"),
    }));
    if (focus.href === "/servicios/") {
      reachedPrimaryAction = true;
      expect(focus.visible).toBe(true);
      break;
    }
  }

  expect(reachedPrimaryAction).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/servicios\/$/);

  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const heroImage = page.locator(".home-hero-figure img");
  await page.locator(".home-hero-figure").hover();
  const motion = await heroImage.evaluate((image) => {
    const style = getComputedStyle(image);
    return { duration: style.transitionDuration, transform: style.transform };
  });

  expect(motion.duration.split(",").every((value) => Number.parseFloat(value) === 0)).toBe(true);
  expect(motion.transform).toBe("none");
});

test("the four service entries use distinct visuals and keep the full-services route visible", async ({ page }) => {
  await page.goto("/");

  const shortlist = page.locator("#home-service-shortlist");
  const cards = shortlist.locator("article");
  await expect(cards).toHaveCount(4);
  await expect(shortlist.getByRole("link", { name: "Explorar más servicios" })).toHaveAttribute(
    "href",
    "/servicios/",
  );

  const media = await shortlist.locator("img").evaluateAll((images) => images.map((node) => {
    const image = node as HTMLImageElement;
    return { src: image.getAttribute("src"), alt: image.alt, loaded: image.complete && image.naturalWidth > 0 };
  }));
  expect(media).toHaveLength(4);
  expect(new Set(media.map(({ src }) => src)).size).toBe(4);
  expect(media.every(({ alt, loaded }) => alt.trim().length > 30 && loaded)).toBe(true);
  expect(media[1].src).toContain("microroutes-collection-editorial-v01.jpg");

  await page.setViewportSize({ width: 1676, height: 834 });
  const contact = page.getByRole("link", { name: "Hablar con nosotros" });
  await expect(contact).toBeVisible();
  await expect(contact).toHaveCSS("color", "rgb(244, 248, 239)");

  for (const width of [1440, 1024, 900, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const entries = [...document.querySelectorAll<HTMLElement>(".home-service-shortlist article")];
      const rects = entries.map((entry) => {
        const rect = entry.getBoundingClientRect();
        return { x: Math.round(rect.x), y: Math.round(rect.y), width: rect.width, height: rect.height };
      });
      return { viewport: root.clientWidth, content: root.scrollWidth, rects };
    });
    expect(layout.content, `homepage overflow at ${width}px`).toBe(layout.viewport);
    expect(new Set(layout.rects.map(({ x }) => x)).size, `service card columns at ${width}px`).toBe(
      width > 1020 ? 4 : width > 680 ? 2 : 1,
    );
    if (width > 1020) {
      const heights = layout.rects.map(({ height }) => height);
      expect(Math.max(...heights) - Math.min(...heights), `unequal desktop service cards at ${width}px`).toBeLessThan(2);
    }
  }
});
