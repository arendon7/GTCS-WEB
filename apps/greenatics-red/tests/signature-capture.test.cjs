const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/signature-capture.js"), "utf8");

function setup({
  fetchImpl = async () => ({ ok: false, status: 500, redirected: false, headers: { get: () => "" } }),
  canvasRect = { left: 0, top: 0, width: 600, height: 180 },
  devicePixelRatio = 1,
} = {}) {
  const formListeners = new Map();
  const canvasListeners = new Map();
  const capturedPointers = [];
  let canvasFocused = false;
  const strokesField = { value: "" };
  const submit = { disabled: false };
  const status = { textContent: "" };
  const clear = { addEventListener: (type, handler) => { if (type === "click") clear.click = handler; } };
  const context = {
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, stroke() {},
    set strokeStyle(_value) {}, set lineWidth(_value) {}, set lineCap(_value) {}, set lineJoin(_value) {},
  };
  const canvas = {
    width: 600,
    height: 180,
    focus() { canvasFocused = true; },
    getContext: () => context,
    getBoundingClientRect: () => canvasRect,
    setPointerCapture: (pointerId) => capturedPointers.push(pointerId),
    addEventListener: (type, handler) => canvasListeners.set(type, handler),
  };
  const form = {
    action: "/records/synthetic/sign",
    addEventListener: (type, handler) => formListeners.set(type, handler),
    querySelector(selector) {
      return ({
        "[data-signature-canvas]": canvas,
        "[data-signature-strokes]": strokesField,
        "[data-signature-submit]": submit,
        "[data-signature-status]": status,
        "[data-signature-clear]": clear,
      })[selector] || null;
    },
  };
  const document = { querySelectorAll: () => [form] };
  const navigations = [];
  const windowListeners = new Map();
  const window = {
    devicePixelRatio,
    fetch: fetchImpl,
    FormData: class { constructor(value) { this.form = value; } },
    location: { assign: (url) => navigations.push(url) },
    addEventListener: (type, handler) => windowListeners.set(type, handler),
  };
  vm.runInNewContext(source, { document, window });
  return { capturedPointers, canvas, canvasFocused: () => canvasFocused, canvasListeners, clear, form, formListeners, navigations, status, strokesField, submit, window, windowListeners };
}

function pointer(pointerId, clientX, clientY) {
  return { pointerId, pointerType: "touch", clientX, clientY, preventDefault() { this.defaultPrevented = true; } };
}

test("keeps simultaneous touch pointers from mixing or ending the active signature stroke", () => {
  const ui = setup();
  const event = (name, value) => ui.canvasListeners.get(name)(value);

  event("pointerdown", pointer(1, 60, 90));
  event("pointerdown", pointer(2, 300, 90));
  event("pointermove", pointer(2, 540, 120));
  event("pointerup", pointer(2, 540, 120));
  event("pointermove", pointer(1, 300, 90));
  event("pointerup", pointer(1, 300, 90));

  assert.deepEqual(ui.capturedPointers, [1]);
  assert.deepEqual(JSON.parse(ui.strokesField.value), [[[0.1, 0.5], [0.5, 0.5]]]);
  assert.equal(ui.submit.disabled, false);
  assert.match(ui.status.textContent, /Firma dibujada/);
});

test("a touch can start a new stroke after the previous pointer ends, and clear resets capture", () => {
  const ui = setup();
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("pointerdown", pointer(7, 30, 30));
  event("pointermove", pointer(7, 180, 30));
  event("pointerup", pointer(7, 180, 30));
  event("pointerdown", pointer(8, 60, 60));
  event("pointermove", pointer(8, 240, 60));
  event("pointerup", pointer(8, 240, 60));
  assert.equal(JSON.parse(ui.strokesField.value).length, 2);

  ui.clear.click();
  assert.deepEqual(JSON.parse(ui.strokesField.value), []);
  assert.equal(ui.submit.disabled, true);
});

test("touch coordinates stay normalized when the signature canvas is scaled to a mobile viewport", () => {
  const rect = { left: 18, top: 64, width: 342, height: 102.6 };
  const ui = setup({ canvasRect: rect });
  const event = (name, value) => ui.canvasListeners.get(name)(value);

  event("pointerdown", pointer(19, rect.left + rect.width * 0.2, rect.top + rect.height * 0.25));
  event("pointermove", pointer(19, rect.left + rect.width * 0.8, rect.top + rect.height * 0.75));
  event("pointerup", pointer(19, rect.left + rect.width * 0.8, rect.top + rect.height * 0.75));

  const stroke = JSON.parse(ui.strokesField.value)[0];
  const expected = [[0.2, 0.25], [0.8, 0.75]];
  stroke.forEach((point, index) => point.forEach((coordinate, axis) => {
    assert.ok(Math.abs(coordinate - expected[index][axis]) < 1e-12);
  }));
  assert.equal(ui.submit.disabled, false);
});

test("signature canvas follows screen density changes without changing normalized strokes", () => {
  const ui = setup({
    canvasRect: { left: 20, top: 30, width: 300, height: 160 },
    devicePixelRatio: 2,
  });
  assert.equal(ui.canvas.width, 600);
  assert.equal(ui.canvas.height, 320);

  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("pointerdown", pointer(1, 50, 70));
  event("pointermove", pointer(1, 200, 150));
  event("pointerup", pointer(1, 200, 150));
  const normalizedStrokes = JSON.parse(ui.strokesField.value);
  assert.deepEqual(normalizedStrokes, [[[0.1, 0.25], [0.6, 0.75]]]);

  ui.window.devicePixelRatio = 4;
  ui.windowListeners.get("resize")();
  assert.equal(ui.canvas.width, 900);
  assert.equal(ui.canvas.height, 480);
  assert.deepEqual(JSON.parse(ui.strokesField.value), normalizedStrokes);
});

test("keyboard drawing serializes the same normalized strokes and enables saving", () => {
  const ui = setup();
  const event = (name, key, extra = {}) => {
    const value = { key, preventDefault() { this.defaultPrevented = true; }, ...extra };
    ui.canvasListeners.get(name)(value);
    return value;
  };

  const space = event("keydown", " ");
  event("keydown", "ArrowRight");
  event("keydown", "ArrowDown", { shiftKey: true });
  const end = event("keyup", " ");

  assert.equal(space.defaultPrevented, true);
  assert.equal(end.defaultPrevented, true);
  assert.deepEqual(JSON.parse(ui.strokesField.value), [[[0.5, 0.5], [0.51, 0.5], [0.51, 0.54]]]);
  assert.equal(ui.submit.disabled, false);
  assert.match(ui.status.textContent, /Trazo terminado/);
});

test("keyboard clear resets the cursor and a second pointer cannot mix into its active stroke", () => {
  const ui = setup();
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("keydown", { key: " ", preventDefault() {} });
  event("keydown", { key: "ArrowRight", preventDefault() {} });
  const touch = pointer(9, 240, 90);
  event("pointerdown", touch);
  assert.equal(touch.defaultPrevented, true);
  event("keyup", { key: " ", preventDefault() {} });

  ui.clear.click();
  assert.deepEqual(JSON.parse(ui.strokesField.value), []);
  assert.equal(ui.submit.disabled, true);
  event("keydown", { key: " ", preventDefault() {} });
  event("keydown", { key: "ArrowLeft", preventDefault() {} });
  event("keyup", { key: " ", preventDefault() {} });
  assert.deepEqual(JSON.parse(ui.strokesField.value), [[[0.5, 0.5], [0.49, 0.5]]]);
});

test("leaving the canvas ends an active keyboard stroke and allows a later touch stroke", () => {
  const ui = setup();
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("keydown", { key: " ", preventDefault() {} });
  event("keydown", { key: "ArrowRight", preventDefault() {} });
  event("blur", {});
  assert.deepEqual(JSON.parse(ui.strokesField.value), [[[0.5, 0.5], [0.51, 0.5]]]);
  assert.match(ui.status.textContent, /al salir del recuadro/);

  event("pointerdown", pointer(10, 180, 90));
  event("pointermove", pointer(10, 360, 90));
  event("pointerup", pointer(10, 360, 90));
  assert.equal(JSON.parse(ui.strokesField.value).length, 2);
});

test("a rejected signature stays in the form and explains how to recover", async () => {
  let request;
  const ui = setup({ fetchImpl: async (url, options) => {
    request = { url, options };
    return {
      ok: false, status: 403, redirected: false,
      headers: { get: () => "application/json" },
      json: async () => ({ detail: "La contraseña no coincide. No se guardó la firma." }),
    };
  } });
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("pointerdown", pointer(12, 60, 90));
  event("pointermove", pointer(12, 300, 90));
  event("pointerup", pointer(12, 300, 90));
  const submitEvent = { preventDefault() { this.defaultPrevented = true; } };

  await ui.formListeners.get("submit")(submitEvent);

  assert.equal(submitEvent.defaultPrevented, true);
  assert.equal(request.url, ui.form.action);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.credentials, "same-origin");
  assert.equal(request.options.body.form, ui.form);
  assert.equal(ui.submit.disabled, false);
  assert.equal(JSON.parse(ui.strokesField.value).length, 1);
  assert.match(ui.status.textContent, /La contraseña no coincide/);
  assert.deepEqual(ui.navigations, []);
});

test("a confirmed save navigates to RED's returned page", async () => {
  const ui = setup({ fetchImpl: async () => ({
    ok: true, status: 200, redirected: true,
    url: "http://red.local/records/synthetic?notice=signed",
    headers: { get: () => "text/html" },
  }) });
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("pointerdown", pointer(13, 60, 90));
  event("pointermove", pointer(13, 300, 90));
  event("pointerup", pointer(13, 300, 90));

  await ui.formListeners.get("submit")({ preventDefault() {} });

  assert.deepEqual(ui.navigations, ["http://red.local/records/synthetic?notice=signed"]);
});

test("a save in progress blocks duplicate submissions and changes to the captured stroke", async () => {
  let complete;
  let requests = 0;
  const ui = setup({ fetchImpl: () => {
    requests += 1;
    return new Promise((resolve) => { complete = resolve; });
  } });
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("pointerdown", pointer(15, 60, 90));
  event("pointermove", pointer(15, 300, 90));
  event("pointerup", pointer(15, 300, 90));

  const firstSubmission = ui.formListeners.get("submit")({ preventDefault() {} });
  assert.equal(ui.submit.disabled, true);
  assert.match(ui.status.textContent, /Guardando/);
  await ui.formListeners.get("submit")({ preventDefault() {} });
  ui.clear.click();
  assert.equal(requests, 1);
  assert.equal(JSON.parse(ui.strokesField.value).length, 1);

  complete({
    ok: true, status: 200, redirected: true,
    url: "http://red.local/records/synthetic?notice=signed",
    headers: { get: () => "text/html" },
  });
  await firstSubmission;
  assert.deepEqual(ui.navigations, ["http://red.local/records/synthetic?notice=signed"]);
});

test("a lost connection keeps the drawing and tells the user to check before retrying", async () => {
  const ui = setup({ fetchImpl: async () => { throw new Error("network failure"); } });
  const event = (name, value) => ui.canvasListeners.get(name)(value);
  event("pointerdown", pointer(14, 60, 90));
  event("pointermove", pointer(14, 300, 90));
  event("pointerup", pointer(14, 300, 90));

  await ui.formListeners.get("submit")({ preventDefault() {} });

  assert.equal(ui.submit.disabled, false);
  assert.equal(JSON.parse(ui.strokesField.value).length, 1);
  assert.match(ui.status.textContent, /Actualiza la ficha y revisa si la constancia aparece/);
  assert.deepEqual(ui.navigations, []);
});
