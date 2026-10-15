const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "../app/static/gps-capture.js"), "utf8");

function harness({ value = "", secure = true, geolocation = {} } = {}) {
  const listeners = new Map();
  const events = [];
  const button = {
    dataset: { gpsCapture: "D03-006" },
    disabled: false,
    addEventListener: (name, callback) => listeners.set(name, callback),
    closest: () => group,
  };
  const input = { value, dispatchEvent: (event) => events.push(event.type) };
  const status = { textContent: "" };
  const current = { textContent: "" };
  const group = {
    querySelector: (selector) => selector === "[data-gps-status]" ? status : current,
  };
  const document = {
    querySelectorAll: () => [button],
    getElementById: (id) => id === "D03-006" ? input : null,
  };
  class MockEvent {
    constructor(type) { this.type = type; }
  }
  const window = { isSecureContext: secure };
  const navigator = geolocation ? { geolocation } : {};

  vm.runInNewContext(script, { document, window, navigator, Event: MockEvent });
  return { button, current, events, input, listeners, status };
}

test("captures only after click and stores browser-reported location metadata", () => {
  let callback;
  let options;
  const ui = harness({
    geolocation: { getCurrentPosition: (success, _error, config) => { callback = success; options = config; } },
  });

  ui.listeners.get("click")();
  assert.equal(ui.button.disabled, true);
  assert.deepEqual(JSON.parse(JSON.stringify(options)), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  callback({
    coords: { latitude: 6.123456789, longitude: -75.567891234, accuracy: 12.46 },
    timestamp: Date.parse("2026-10-08T15:30:00.000Z"),
  });

  assert.deepEqual(JSON.parse(ui.input.value), {
    method: "browser_geolocation", latitude: 6.1234568, longitude: -75.5678912,
    accuracy_m: 12.5, captured_at: "2026-10-08T15:30:00.000Z",
  });
  assert.match(ui.current.textContent, /Latitud 6\.1234568, longitud -75\.5678912/);
  assert.match(ui.status.textContent, /Revisa la precisión/);
  assert.deepEqual(ui.events, ["input", "change"]);
  assert.equal(ui.button.disabled, false);
});

test("a denied location permission leaves the saved field unchanged", () => {
  const initial = "6.1, -75.5";
  const ui = harness({
    value: initial,
    geolocation: { getCurrentPosition: (_success, error) => error({ code: 1, PERMISSION_DENIED: 1 }) },
  });
  ui.listeners.get("click")();
  assert.equal(ui.input.value, initial);
  assert.match(ui.status.textContent, /No se concedió permiso/);
  assert.deepEqual(ui.events, []);
  assert.equal(ui.button.disabled, false);
});

test("location capture is blocked outside a secure browser context", () => {
  let requested = false;
  const ui = harness({
    secure: false,
    geolocation: { getCurrentPosition: () => { requested = true; } },
  });
  ui.listeners.get("click")();
  assert.equal(requested, false);
  assert.match(ui.status.textContent, /requiere HTTPS/);
});
