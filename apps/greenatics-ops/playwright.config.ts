import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const portText = process.env.OPS_E2E_PORT ?? "3000";
const port = Number(portText);
if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("OPS_E2E_PORT debe ser un puerto entre 1024 y 65535.");
}
const baseURL = `http://127.0.0.1:${port}`;
const productionDemo = process.env.OPS_E2E_PRODUCTION === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: productionDemo
      ? `npm run start -- --hostname 127.0.0.1 --port ${port}`
      : `npm run dev -- --webpack --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    // Never attach a test that writes demo data to another chat's preview.
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_DATA_MODE: "local",
      // Explicit loopback-only QA runtime; never enables a deployed demo.
      ...(productionDemo ? { GREENATICS_OPS_LOCAL_BYPASS: "true" } : {}),
    },
    timeout: 120_000,
  },
});
