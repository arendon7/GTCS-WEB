import { expect, test } from "@playwright/test";

test("home territory evidence keeps its reading order and fits desktop and mobile", async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    await page.locator(".home-territory").scrollIntoViewIfNeeded();
    await expect.poll(async () => page.locator(".home-territory img").evaluateAll((images) =>
      images.length === 2 && images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
    ), { timeout: 10_000 }).toBe(true);

    const layout = await page.locator(".home-territory").evaluate((section) => {
      const bounds = (selector: string) => {
        const element = section.querySelector<HTMLElement>(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return { top: rect.top, left: rect.left, right: rect.right, width: rect.width };
      };
      const images = [...section.querySelectorAll("img")];
      const tamesis = section.querySelector<HTMLElement>(".home-territory__tamesis-bridge");
      return {
        viewportWidth: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        yarumalStory: bounds(".home-territory__story"),
        yarumalImage: bounds(".home-territory__figure"),
        tamesisImage: bounds(".home-territory__tamesis-media"),
        tamesisCopy: bounds(".home-territory__tamesis-bridge > div:last-child"),
        tamesisContentWidth: tamesis?.scrollWidth ?? 0,
        tamesisClientWidth: tamesis?.clientWidth ?? 0,
        imagesLoaded: images.length === 2 && images.every((image) => image.complete && image.naturalWidth > 0),
      };
    });

    expect(layout.pageWidth, `homepage should not overflow at ${width}px`).toBe(layout.viewportWidth);
    expect(layout.imagesLoaded, `both territorial photographs should load at ${width}px`).toBe(true);
    expect(layout.yarumalStory).not.toBeNull();
    expect(layout.yarumalImage).not.toBeNull();
    expect(layout.tamesisImage).not.toBeNull();
    expect(layout.tamesisCopy).not.toBeNull();
    expect(layout.tamesisContentWidth).toBeLessThanOrEqual(layout.tamesisClientWidth);

    if (width > 1050) {
      expect(layout.yarumalImage!.left).toBeGreaterThan(layout.yarumalStory!.left);
      expect(layout.tamesisCopy!.left).toBeGreaterThan(layout.tamesisImage!.left);
    } else {
      expect(layout.yarumalImage!.top).toBeGreaterThan(layout.yarumalStory!.top);
      expect(layout.tamesisCopy!.top).toBeGreaterThan(layout.tamesisImage!.top);
    }
  }
});
