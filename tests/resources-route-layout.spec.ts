import { expect, test } from "@playwright/test";

test("resource routes use the full desktop row and remain responsive", async ({ page }) => {
  await page.goto("/recursos/#rutas", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".gt-resource-route-grid article")).toHaveCount(5);

  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const grid = document.querySelector<HTMLElement>(".gt-resource-route-grid");
      const rect = grid?.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".gt-resource-route-grid article"));
      return {
        grid: rect ? { left: rect.left, right: rect.right } : null,
        cards: cards.map((card) => {
          const box = card.getBoundingClientRect();
          return { left: box.left, right: box.right, width: box.width, display: getComputedStyle(card).display };
        }),
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        viewportWidth: window.innerWidth,
      };
    });

    expect(layout.grid, `resource grid exists at ${width}px`).not.toBeNull();
    expect(layout.cards).toHaveLength(5);
    expect(layout.scrollWidth, `resource page fits ${width}px`).toBeLessThanOrEqual(layout.viewportWidth + 2);

    if (width > 1050) {
      const [agronomy, home] = layout.cards.slice(-2);
      expect(agronomy.display).toBe("grid");
      expect(home.display).toBe("grid");
      expect(agronomy.width).toBeGreaterThan(layout.cards[0].width);
      expect(Math.abs(agronomy.width - home.width)).toBeLessThanOrEqual(2);
      expect(Math.abs(agronomy.left - layout.grid!.left)).toBeLessThanOrEqual(2);
      expect(Math.abs(home.right - layout.grid!.right)).toBeLessThanOrEqual(2);
    }

    if (width <= 600) {
      expect(layout.cards.every((card) => Math.abs(card.width - layout.cards[0].width) <= 2)).toBe(true);
      expect(layout.cards[4].display).toBe("block");
    }
  }
});
