const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/network-status.js"), "utf8");

function harness(onLine = true) {
  const listeners = new Map();
  const documentListeners = new Map();
  const message = { textContent: "" };
  const buttonListeners = new Map();
  const recheckButton = {
    disabled: false,
    addEventListener: (event, callback) => buttonListeners.set(event, callback),
  };
  const banner = {
    dataset: {},
    querySelector: (selector) => {
      if (selector === "[data-network-message]") return message;
      if (selector === "[data-network-recheck]") return recheckButton;
      return null;
    },
  };
  const document = {
    visibilityState: "visible",
    querySelector: (selector) => selector === "[data-network-status]" ? banner : null,
    addEventListener: (event, callback) => documentListeners.set(event, callback),
  };
  const navigator = { onLine };
  const requests = [];
  let timerId = 0;
  const window = {
    addEventListener: (event, callback) => listeners.set(event, callback),
    setTimeout: () => ++timerId,
    clearTimeout: () => {},
  };
  const fetch = (url, options) => new Promise((resolve, reject) => requests.push({ url, options, resolve, reject }));
  vm.runInNewContext(source, { document, navigator, window, fetch, AbortController });
  async function resolveRequest(index, response) {
    requests[index].resolve(response);
    await new Promise((resolve) => setImmediate(resolve));
  }
  return { banner, buttonListeners, documentListeners, listeners, message, navigator, recheckButton, requests, resolveRequest, window };
}

test("online indicator checks RED health before saying the runtime is reachable", async () => {
  const ui = harness(true);
  assert.equal(ui.banner.dataset.networkState, "checking");
  assert.equal(ui.requests[0].url, "/api/health");
  assert.equal(ui.requests[0].options.credentials, "same-origin");
  assert.equal(ui.requests[0].options.cache, "no-store");
  await ui.resolveRequest(0, {
    ok: true,
    json: async () => ({ status: "ok", application: "GREENATICS RED" }),
  });
  assert.equal(ui.banner.dataset.networkState, "connected");
  assert.match(ui.message.textContent, /la base de datos y el almacenamiento responden/);
  assert.match(ui.message.textContent, /espera su confirmación antes de salir/);
  assert.equal(ui.recheckButton.disabled, false);
  assert.ok(ui.listeners.has("online"));
  assert.ok(ui.listeners.has("offline"));
  assert.ok(ui.buttonListeners.has("click"));
});

test("health errors do not claim that the form can be saved", async () => {
  const ui = harness(true);
  await ui.resolveRequest(0, { ok: false, status: 503 });
  assert.equal(ui.banner.dataset.networkState, "unavailable");
  assert.match(ui.message.textContent, /no confirmó/);
});

test("health network errors keep the form in a clear unconfirmed state", async () => {
  const ui = harness(true);
  ui.requests[0].reject(new Error("synthetic network error"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(ui.banner.dataset.networkState, "unavailable");
  assert.match(ui.message.textContent, /No se pudo confirmar/);
  assert.equal(ui.recheckButton.disabled, false);
});

test("offline browser still checks RED before concluding the server is unavailable", async () => {
  const ui = harness(false);
  assert.equal(ui.banner.dataset.networkState, "checking");
  assert.equal(ui.requests.length, 1);
  await ui.resolveRequest(0, {
    ok: true,
    json: async () => ({ status: "ok", application: "GREENATICS RED" }),
  });
  assert.equal(ui.banner.dataset.networkState, "connected");
  assert.match(ui.message.textContent, /la base de datos y el almacenamiento responden/);
});

test("offline browser and unreachable RED keep the connection warning", async () => {
  const ui = harness(false);
  await ui.resolveRequest(0, { ok: false, status: 503 });
  assert.equal(ui.banner.dataset.networkState, "offline");
  assert.match(ui.message.textContent, /RED no respondió/);
  assert.match(ui.message.textContent, /no guarda este formulario sin conexión/);
  assert.match(ui.message.textContent, /contingencia aprobada/);
});

test("unknown browser network state still waits for RED health confirmation", () => {
  const ui = harness(undefined);
  assert.equal(ui.banner.dataset.networkState, "checking");
  assert.equal(ui.requests.length, 1);
});

test("network changes update the status and recheck RED without persisting form values", async () => {
  const ui = harness(true);
  ui.navigator.onLine = false;
  ui.listeners.get("offline")();
  assert.equal(ui.banner.dataset.networkState, "checking");
  ui.navigator.onLine = true;
  ui.listeners.get("online")();
  assert.equal(ui.banner.dataset.networkState, "checking");
  assert.equal(ui.requests.length, 3);
  await ui.resolveRequest(2, {
    ok: true,
    json: async () => ({ status: "ok", application: "GREENATICS RED" }),
  });
  assert.equal(ui.banner.dataset.networkState, "connected");
  ui.documentListeners.get("visibilitychange")();
  assert.equal(ui.requests.length, 4);
});

test("manual recheck requests the health endpoint and disables its button until the response", async () => {
  const ui = harness(true);
  ui.requests[0].resolve({
    ok: true,
    json: async () => ({ status: "ok", application: "GREENATICS RED" }),
  });
  await new Promise((resolve) => setImmediate(resolve));
  ui.buttonListeners.get("click")();
  assert.equal(ui.requests.length, 2);
  assert.equal(ui.recheckButton.disabled, true);
  await ui.resolveRequest(1, {
    ok: true,
    json: async () => ({ status: "ok", application: "GREENATICS RED" }),
  });
  assert.equal(ui.recheckButton.disabled, false);
  assert.equal(ui.banner.dataset.networkState, "connected");
});
