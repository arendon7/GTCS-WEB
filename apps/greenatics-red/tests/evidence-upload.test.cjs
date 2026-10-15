const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/evidence-upload.js"), "utf8");

function harness({ online = true, fetchImpl = async () => { throw new Error("network"); } } = {}) {
  let submitHandler;
  let assignedUrl = "";
  let fetchCount = 0;
  const file = { name: "acta-sintetica.txt", size: 120, contents: "synthetic" };
  const fileInput = { name: "file", type: "file", files: [file], disabled: false, focus() {} };
  const button = { type: "submit", textContent: "Adjuntar evidencia", disabled: false, dataset: {} };
  const message = { textContent: "" };
  const actionSlot = { replaceChildren(...items) { this.items = items; } };
  const status = {
    hidden: true, dataset: {}, attributes: {},
    querySelector(selector) {
      if (selector === "[data-evidence-upload-message]") return message;
      if (selector === "[data-evidence-upload-actions]") return actionSlot;
      return null;
    },
    setAttribute(name, value) { this.attributes[name] = value; },
  };
  const csrf = { name: "csrf", value: "csrf-synthetic" };
  const key = { name: "submission_key", value: "stable-synthetic-upload-key-00001" };
  const form = {
    dataset: {},
    getAttribute(name) { return name === "action" ? "/records/record-synthetic/evidence" : null; },
    querySelector(selector) {
      if (selector === 'input[type="file"]') return fileInput;
      if (selector === '[data-evidence-upload-status]') return status;
      if (selector === 'button[type="submit"]') return button;
      if (selector === 'input[name="csrf"]') return csrf;
      if (selector === 'input[name="submission_key"]') return key;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'input[type="file"], button[type="submit"]') return [fileInput, button];
      if (selector === 'button[type="submit"]') return [button];
      return [];
    },
  };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    createElement() { return { dataset: {}, addEventListener() {} }; },
  };
  class FormDataMock {
    constructor(sourceForm) {
      this.form = sourceForm;
      this.keyAtCreation = key.value;
      this.fileAtCreation = fileInput.files[0];
    }
  }
  const window = {
    location: {
      href: "https://red.test/records/record-synthetic",
      assign(value) { assignedUrl = value; },
    },
    setTimeout() { return 1; },
    clearTimeout() {},
  };
  const context = {
    document, FormData: FormDataMock, AbortController,
    navigator: { onLine: online }, window, URL,
    async fetch(...args) { fetchCount += 1; return fetchImpl(...args); },
  };
  vm.runInNewContext(source, context);
  return {
    form, file, fileInput, button, key, status, message, window,
    get assignedUrl() { return assignedUrl; },
    get fetchCount() { return fetchCount; },
    async submit() {
      const event = { target: { closest: () => form }, preventDefault() {} };
      await submitHandler(event);
    },
  };
}

test("offline upload sends nothing and retains the selected file and stable key", async () => {
  const ui = harness({ online: false });
  const originalKey = ui.key.value;
  const selectedFile = ui.fileInput.files[0];
  await ui.submit();
  assert.equal(ui.fetchCount, 0);
  assert.equal(ui.key.value, originalKey);
  assert.equal(ui.fileInput.files[0], selectedFile);
  assert.match(ui.message.textContent, /no guarda este archivo sin conexión/i);
});

test("a lost response keeps the same file and key available for an idempotent retry", async () => {
  const ui = harness();
  const originalKey = ui.key.value;
  const selectedFile = ui.fileInput.files[0];
  await ui.submit();
  assert.equal(ui.fetchCount, 1);
  assert.equal(ui.key.value, originalKey);
  assert.equal(ui.fileInput.files[0], selectedFile);
  assert.match(ui.message.textContent, /misma clave/i);
  assert.match(ui.message.textContent, /sin duplicarlo/i);
  assert.equal(ui.button.disabled, false);
});

test("a confirmed upload navigates to the server's returned evidence list", async () => {
  const ui = harness({
    fetchImpl: async () => ({
      ok: true, redirected: true, url: "https://red.test/records/record-synthetic?notice=Evidencia%20adjuntada",
      status: 200, headers: { get: () => "text/html" },
    }),
  });
  await ui.submit();
  assert.equal(ui.assignedUrl, "https://red.test/records/record-synthetic?notice=Evidencia%20adjuntada");
  assert.equal(ui.form.dataset.saved, "true");
});

test("an expired CSRF token offers session recovery without losing the pending upload", async () => {
  const ui = harness({
    fetchImpl: async () => ({
      ok: false, redirected: false, url: "https://red.test/records/record-synthetic/evidence",
      status: 403, headers: { get: (name) => name === "X-RED-Error-Code" ? "csrf-expired" : "application/json" },
      json: async () => ({ detail: "La seguridad del formulario venció." }),
    }),
  });
  const originalKey = ui.key.value;
  const selectedFile = ui.fileInput.files[0];
  await ui.submit();
  assert.equal(ui.key.value, originalKey);
  assert.equal(ui.fileInput.files[0], selectedFile);
  assert.match(ui.message.textContent, /sesión parece haber vencido/i);
  assert.equal(ui.status.querySelector("[data-evidence-upload-actions]").items.length, 2);
});
