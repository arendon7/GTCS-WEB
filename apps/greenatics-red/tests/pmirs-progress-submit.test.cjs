const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/pmirs-progress-submit.js"), "utf8");

function input(name, value, type = "text") {
  return { name, value, type, tagName: "INPUT", disabled: false };
}

function makeHarness({ fetch, online = true }) {
  let submitHandler;
  const csrf = input("csrf", "csrf-before", "hidden");
  const version = input("expected_version", "1", "hidden");
  const key = input("submission_key", "same-progress-key-12345678901234567890", "hidden");
  const note = input("progress_note", "Se completó la inspección de prueba.");
  const button = {
    type: "submit", name: "", value: "", textContent: "Guardar avance", disabled: false, dataset: {},
    focus() { this.focused = true; },
  };
  const message = { textContent: "" };
  const unsavedNotice = { hidden: true };
  const actions = { children: [], replaceChildren(...children) { this.children = children; } };
  const status = {
    hidden: true, dataset: {}, attributes: {},
    querySelector(selector) {
      if (selector === "[data-pmirs-status-message]") return message;
      if (selector === "[data-pmirs-status-actions]") return actions;
      return null;
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    focus() { this.focused = true; },
  };
  const form = {
    dataset: {}, elements: [csrf, version, key, note],
    closest: () => form,
    getAttribute: (name) => name === "action" ? "/pmirs/items/action-1/progress" : null,
    querySelector(selector) {
      if (selector === "[data-pmirs-submit-status]") return status;
      if (selector === "[data-unsaved-notice]") return unsavedNotice;
      if (selector === 'input[name="csrf"]') return csrf;
      if (selector === 'button[type="submit"]') return button;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'button[type="submit"]') return [button];
      if (selector === 'input:not([type="hidden"]), select, textarea, button[type="button"]') return [note];
      return [];
    },
  };
  const document = {
    addEventListener(type, handler) { if (type === "submit") submitHandler = handler; },
    createElement(tagName) {
      return {
        tagName, dataset: {}, addEventListener(type, handler) { this[`on${type}`] = handler; },
      };
    },
  };
  class FormDataMock {
    constructor(sourceForm) {
      this.entries = sourceForm.elements.map((field) => [field.name, field.value]);
      this.append = (name, value) => this.entries.push([name, value]);
    }
  }
  const window = {
    location: { href: "https://red.test/projects/p1/pmirs", assign(url) { this.assigned = url; } },
    setTimeout() { return 1; }, clearTimeout() {},
  };
  vm.runInNewContext(source, {
    document,
    navigator: { onLine: online },
    fetch,
    FormData: FormDataMock,
    URL,
    AbortController,
    window,
  });
  return {
    submit: async () => submitHandler({ target: form, preventDefault() {}, submitter: button }),
    csrf, version, key, note, button, status, message, actions, unsavedNotice, form,
    window,
    getSubmitHandler() { return submitHandler; },
  };
}

test("a lost response keeps the PMIRS progress in memory and retries with the same key", async () => {
  let calls = 0;
  let navigation = "";
  const saved = new Map();
  const harness = makeHarness({
    fetch: async (_url, options) => {
      assert.equal(harness.note.disabled, true);
      calls += 1;
      const key = options.body.entries.find(([name]) => name === "submission_key")[1];
      if (!saved.has(key)) saved.set(key, options.body.entries.find(([name]) => name === "progress_note")[1]);
      if (calls === 1) throw new TypeError("response lost after save");
      return {
        url: "https://red.test/projects/p1/pmirs?notice=already-saved", status: 200,
        ok: true, redirected: true, headers: { get: () => "text/html" },
      };
    },
  });
  harness.window.location.assign = (url) => { navigation = url; };

  await harness.submit();
  assert.match(harness.message.textContent, /pudo haberse guardado/);
  assert.match(harness.message.textContent, /misma clave/);
  assert.equal(harness.note.value, "Se completó la inspección de prueba.");
  assert.equal(harness.key.value, "same-progress-key-12345678901234567890");
  assert.equal(harness.note.disabled, false);
  assert.equal(harness.button.disabled, false);
  await harness.submit();

  assert.equal(calls, 2);
  assert.equal(saved.size, 1);
  assert.equal(harness.form.dataset.saved, "true");
  assert.equal(harness.unsavedNotice.hidden, true);
  assert.equal(navigation, "https://red.test/projects/p1/pmirs?notice=already-saved");
  assert.equal(harness.button.disabled, false);
});

test("a false browser offline signal still submits when RED health responds", async () => {
  const calls = [];
  const harness = makeHarness({ online: false, fetch: async (url) => {
    calls.push(url);
    if (url === "/api/health") return {
      ok: true, status: 200, json: async () => ({ status: "ok", application: "GREENATICS RED" }),
    };
    return {
      url: "https://red.test/projects/p1/pmirs?notice=saved", status: 200, ok: true, redirected: true,
      headers: { get: () => "text/html" },
    };
  } });
  await harness.submit();
  assert.deepEqual(calls, ["/api/health", "/pmirs/items/action-1/progress"]);
  assert.equal(harness.form.dataset.saved, "true");
  assert.equal(harness.note.value, "Se completó la inspección de prueba.");
});

test("unreachable RED health prevents a progress POST and retains the in-memory form", async () => {
  const calls = [];
  const harness = makeHarness({ online: false, fetch: async (url) => {
    calls.push(url);
    throw new TypeError("synthetic network error");
  } });
  await harness.submit();
  assert.deepEqual(calls, ["/api/health"]);
  assert.match(harness.message.textContent, /RED no respondió a la comprobación de conexión/);
  assert.match(harness.message.textContent, /No se envió el avance/);
  assert.equal(harness.note.value, "Se completó la inspección de prueba.");
  assert.equal(harness.key.value, "same-progress-key-12345678901234567890");
  assert.equal(harness.status.focused, true);
});

test("validation errors are announced without clearing the entered progress", async () => {
  const harness = makeHarness({ fetch: async () => ({
    url: "https://red.test/pmirs/items/action-1/progress", status: 422, ok: false, redirected: false,
    headers: { get: () => "application/json" }, json: async () => ({ detail: "La nota debe describir el resultado observable." }),
  }) });
  await harness.submit();
  assert.equal(harness.message.textContent, "La nota debe describir el resultado observable.");
  assert.equal(harness.note.value, "Se completó la inspección de prueba.");
  assert.equal(harness.status.attributes.role, "alert");
  assert.equal(harness.status.focused, true);
  assert.equal(harness.button.disabled, false);
});

test("an expired session can refresh CSRF and keep the progress form", async () => {
  let calls = 0;
  const harness = makeHarness({ fetch: async (url) => {
    calls += 1;
    if (url.includes("/progress")) return {
      url: "https://red.test/login?next=%2Fpmirs", status: 200, ok: true, redirected: true,
      headers: { get: () => "text/html" },
    };
    return {
      url: "https://red.test/api/me", status: 200, ok: true, redirected: false,
      json: async () => ({ csrf_token: "csrf-refreshed" }),
    };
  } });
  await harness.submit();
  assert.match(harness.message.textContent, /sesión parece haber vencido/);
  const recoverButton = harness.actions.children.find((item) => item.textContent.includes("recuperar formulario"));
  assert.ok(recoverButton);
  await recoverButton.onclick();
  assert.equal(harness.csrf.value, "csrf-refreshed");
  assert.match(harness.message.textContent, /Sesión recuperada/);
  assert.equal(harness.note.value, "Se completó la inspección de prueba.");
  assert.equal(calls, 2);
});


test("version conflicts keep the pending progress and the original displayed version", async () => {
  const detail = "La acción cambió. Actualiza PMIRS Studio y revisa el avance vigente antes de enviar.";
  const harness = makeHarness({ fetch: async (_url, options) => {
    assert.equal(options.body.entries.find(([name]) => name === "expected_version")[1], "1");
    return {
      url: "https://red.test/pmirs/items/action-1/progress", status: 409, ok: false, redirected: false,
      headers: { get: () => "application/json" }, json: async () => ({ detail }),
    };
  } });
  harness.unsavedNotice.hidden = false;
  await harness.submit();
  assert.equal(harness.message.textContent, detail);
  assert.equal(harness.note.value, "Se completó la inspección de prueba.");
  assert.equal(harness.version.value, "1");
  assert.equal(harness.key.value, "same-progress-key-12345678901234567890");
  assert.equal(harness.unsavedNotice.hidden, false);
  assert.notEqual(harness.form.dataset.saved, "true");
  assert.equal(harness.window.location.assigned, undefined);
  assert.equal(harness.status.attributes.role, "alert");
  assert.equal(harness.status.focused, true);
  assert.equal(harness.button.disabled, false);
});
