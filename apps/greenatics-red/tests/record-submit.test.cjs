const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/record-submit.js"), "utf8");

function input(name, value, type = "text", files = []) {
  return { name, value, type, files, tagName: "INPUT", checked: false, disabled: false };
}

test("server-rendered record-form errors receive focus when the page loads", () => {
  let focused = false;
  const alert = { tabIndex: 0, focus() { focused = true; } };
  const document = {
    querySelector(selector) {
      if (selector === "form.record-form") return {};
      if (selector === '[role="alert"]') return alert;
      return null;
    },
    addEventListener() {},
  };

  vm.runInNewContext(source, { document });

  assert.equal(alert.tabIndex, -1);
  assert.equal(focused, true);
});

test("422 keeps the selected file and copies server-rendered values back into the live form", async () => {
  let submitHandler;
  let postedData;
  let fetchUrl;
  const statusMessage = { textContent: "", append() {} };
  const banner = {
    dataset: {},
    querySelector: (selector) => selector === "[data-network-message]" ? statusMessage : null,
  };
  const alert = {
    textContent: "",
    tabIndex: 0,
    focus() {},
    append(node) { this.textContent += node.textContent; },
    replaceChildren(...nodes) { this.childNodes = nodes; this.fileNotice = nodes.find((node) => node.kind === "file-note"); this.textContent = nodes.map((node) => node.textContent).join(" "); },
    querySelector(selector) { return selector === "[data-file-error-note]" ? this.fileNotice : null; },
  };
  const validationLink = {
    href: "#D07-001", textContent: "Campo requerido: Jornada",
    cloneNode() { return { ...this }; },
  };
  const errorList = {
    textContent: validationLink.textContent,
    querySelector(selector) { return selector === "[data-validation-errors]" ? this : null; },
    cloneNode() {
      const link = validationLink.cloneNode(true);
      return { textContent: link.textContent, querySelector: () => link, cloneNode: this.cloneNode };
    },
  };
  const fileNotice = {
    kind: "file-note",
    textContent: "Los archivos nuevos no se guardaron; selecciónalos de nuevo.",
    cloneNode() { return { ...this }; },
  };
  const renderedAlert = {
    childNodes: [
      { textContent: "No se puede enviar a revisión todavía:", cloneNode() { return { ...this }; } },
      errorList,
      fileNotice,
    ],
    querySelector(selector) { return selector === "[data-validation-errors]" ? errorList : null; },
    get textContent() { return this.childNodes.map((node) => node.textContent).join(" "); },
  };
  const selectedPhoto = { name: "photo.jpg" };
  const textField = input("record_title", "Valor escrito");
  const fileField = input("evidence__D11-001", "", "file", [selectedPhoto]);
  const submitButton = { name: "action", value: "submit", disabled: false };
  const form = {
    actionUrl: "https://red.test/projects/1/records/new",
    action: { 0: submitButton, length: 1 },
    dataset: {},
    elements: [textField, fileField],
    closest: () => form,
    getAttribute: (name) => name === "action" ? form.actionUrl : null,
    querySelectorAll(selector) {
      if (selector === 'button[type="submit"]') return [submitButton];
      if (selector === 'input[type="file"]') return [fileField];
      if (selector === 'input:not([type="hidden"]), select, textarea, button[type="button"]') return [textField, fileField];
      return [];
    },
    before() {},
  };
  const renderedForm = {
    elements: [input("record_title", "Valor escrito"), input("evidence__D11-001", "", "file")],
  };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    querySelector(selector) {
      if (selector === "[data-network-status]") return banner;
      if (selector === '[role="alert"]') return alert;
      if (selector === "[data-network-message]") return statusMessage;
      return null;
    },
    createTextNode(text) { return { textContent: text }; },
  };
  class FormDataMock {
    constructor() { this.entries = []; postedData = this; }
    append(name, value) { this.entries.push([name, value]); }
  }
  class DOMParserMock {
    parseFromString() {
      return { querySelector: (selector) => selector === "form.record-form" ? renderedForm : renderedAlert };
    }
  }

  vm.runInNewContext(source, {
    document,
    fetch: async (url) => {
      fetchUrl = url;
      return ({
      url: form.actionUrl,
      status: 422,
      ok: false,
      text: async () => "<html></html>",
      });
    },
    FormData: FormDataMock,
    DOMParser: DOMParserMock,
    URL,
    window: { location: { href: form.actionUrl, assign() { assert.fail("422 must not navigate"); } } },
  });

  await submitHandler({
    target: form,
    submitter: submitButton,
    preventDefault() {},
  });

  assert.equal(textField.value, "Valor escrito");
  assert.equal(fetchUrl, form.actionUrl);
  assert.equal(fileField.files[0], selectedPhoto);
  assert.match(alert.textContent, /Campo requerido: Jornada/);
  assert.equal(alert.childNodes[1].querySelector().href, "#D07-001");
  assert.equal(alert.fileNotice.textContent, "Los archivos siguen seleccionados en esta pantalla; corrige los campos y vuelve a enviar.");
  assert.equal(alert.tabIndex, -1);
  assert.deepEqual(postedData.entries, [["action", "submit"]]);
  assert.equal(submitButton.disabled, false);
  assert.equal(banner.dataset.networkState, "validation-error");
});

test("an expired session can refresh CSRF and retry without losing selected files", async () => {
  let submitHandler;
  let postCount = 0;
  const selectedPhoto = { name: "synthetic.jpg" };
  const fileField = input("evidence__D11-001", "", "file", [selectedPhoto]);
  const csrfField = input("csrf", "old-session-token", "hidden");
  const submitButton = { name: "action", value: "submit", disabled: false, focus() { this.focused = true; } };
  const listeners = {};
  const form = {
    dataset: {}, elements: [csrfField, fileField],
    closest: () => form,
    getAttribute: () => "/projects/1/records/new",
    querySelector(selector) {
      if (selector === 'input[name="csrf"]') return csrfField;
      if (selector === 'button[type="submit"]') return submitButton;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'button[type="submit"]') return [submitButton];
      if (selector === 'input[type="file"]') return [fileField];
      return [];
    },
  };
  const statusMessage = {
    children: [],
    _textContent: "",
    set textContent(value) { this._textContent = value; this.children = []; },
    get textContent() { return this._textContent; },
    append(child) { this.children.push(child); },
  };
  const sessionActions = {
    hidden: true,
    children: [],
    replaceChildren(...children) { this.children = children; },
  };
  const banner = { dataset: {}, querySelector: () => statusMessage };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    querySelector(selector) {
      if (selector === "form.record-form") return form;
      if (selector === "[data-network-status]") return banner;
      if (selector === "[data-network-message]") return statusMessage;
      if (selector === "[data-session-actions]") return sessionActions;
      if (selector === '[role="alert"]') return null;
      return null;
    },
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        addEventListener(type, callback) { listeners[`${tag}:${type}`] = callback; },
        focus() { this.focused = true; },
      };
    },
  };
  class FormDataMock {
    constructor() {}
    append() {}
  }
  let sessionChecks = 0;

  vm.runInNewContext(source, {
    document,
    fetch: async (url) => {
      if (url === "/api/me") {
        sessionChecks += 1;
        if (sessionChecks === 1) {
          return { url: "https://red.test/login", status: 200, ok: true, json: async () => ({}) };
        }
        return { url: "https://red.test/api/me", status: 200, ok: true, json: async () => ({ csrf_token: "fresh-session-token" }) };
      }
      postCount += 1;
      return { url: "https://red.test/login", status: 200, ok: true };
    },
    FormData: FormDataMock,
    URL,
    window: { location: { href: "https://red.test/projects/1/records/new" } },
  });

  await submitHandler({ target: form, submitter: submitButton, preventDefault() {} });
  assert.equal(postCount, 1);
  assert.equal(banner.dataset.networkState, "auth-required");
  const loginLink = sessionActions.children.find((child) => child.tagName === "A");
  const recoveryButton = sessionActions.children.find((child) => child.tagName === "BUTTON");
  assert.equal(loginLink.href, "https://red.test/login");
  assert.equal(loginLink.className, "button secondary");
  assert.equal(recoveryButton.textContent, "Ya inicié sesión; recuperar formulario");
  assert.equal(statusMessage.children.length, 0);
  assert.equal(sessionActions.hidden, false);
  assert.equal(fileField.files[0], selectedPhoto);

  await listeners["button:click"]();
  assert.equal(banner.dataset.networkState, "auth-required");
  assert.equal(sessionActions.children.length, 2);
  assert.equal(sessionActions.children.filter((child) => child.tagName === "A").length, 1);
  assert.equal(sessionActions.children.filter((child) => child.tagName === "BUTTON").length, 1);
  assert.equal(recoveryButton.disabled, false);

  await listeners["button:click"]();
  assert.equal(csrfField.value, "fresh-session-token");
  assert.equal(fileField.files[0], selectedPhoto);
  assert.equal(banner.dataset.networkState, "session-restored");
  assert.equal(sessionActions.children.length, 0);
  assert.equal(sessionActions.hidden, true);
  assert.equal(submitButton.focused, true);
});

test("a permission 403 does not offer session recovery", async () => {
  let submitHandler;
  const statusMessage = { textContent: "", append() {} };
  const banner = { dataset: {}, querySelector: () => statusMessage };
  const submitButton = { name: "action", value: "draft", disabled: false };
  const form = {
    dataset: {}, elements: [], closest: () => form, getAttribute: () => "/records/new",
    querySelectorAll: (selector) => selector === 'button[type="submit"]' ? [submitButton] : [],
  };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    querySelector(selector) {
      if (selector === "form.record-form") return form;
      if (selector === "[data-network-status]") return banner;
      if (selector === "[data-network-message]") return statusMessage;
      return null;
    },
  };
  class FormDataMock { append() {} }

  vm.runInNewContext(source, {
    document,
    fetch: async () => ({
      url: "https://red.test/records/new", status: 403, ok: false,
      headers: { get: () => null },
    }),
    FormData: FormDataMock,
    URL,
    window: { location: { href: "https://red.test/records/new" } },
  });

  await submitHandler({ target: form, submitter: submitButton, preventDefault() {} });
  assert.equal(banner.dataset.networkState, "error");
  assert.match(statusMessage.textContent, /estado 403/);
  assert.equal(submitButton.disabled, false);
});

test("a lost response explains how to retry safely and keeps the same key and file", async () => {
  let submitHandler;
  let postCount = 0;
  let navigation = "";
  const serverRecords = new Map();
  const selectedPhoto = { name: "synthetic-evidence.png" };
  const csrfField = input("csrf", "csrf-token", "hidden");
  const keyField = input("submission_key", "synthetic-idempotency-key", "hidden");
  const titleField = input("record_title", "Registro recuperable");
  const fileField = input("evidence__D07-010", "", "file", [selectedPhoto]);
  const submitButton = { name: "action", value: "draft", disabled: false };
  const form = {
    dataset: {}, elements: [csrfField, keyField, titleField, fileField],
    closest: () => form,
    getAttribute: () => "/projects/1/records/new",
    querySelectorAll: (selector) => {
      if (selector === 'button[type="submit"]') return [submitButton];
      if (selector === 'input:not([type="hidden"]), select, textarea, button[type="button"]') return [titleField, fileField];
      return [];
    },
  };
  const statusMessage = { textContent: "" };
  const banner = { dataset: {}, querySelector: () => statusMessage };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    querySelector(selector) {
      if (selector === "form.record-form") return form;
      if (selector === "[data-network-status]") return banner;
      if (selector === "[data-network-message]") return statusMessage;
      return null;
    },
  };
  const requests = [];
  class FormDataMock {
    constructor(sourceForm) {
      this.entries = sourceForm.elements.filter((control) => control.name).map((control) => [control.name, control.type === "file" ? control.files[0] : control.value]);
      requests.push(this);
    }
    append(name, value) { this.entries.push([name, value]); }
  }

  vm.runInNewContext(source, {
    document,
    fetch: async (_url, options) => {
      assert.equal(titleField.disabled, true);
      assert.equal(fileField.disabled, true);
      postCount += 1;
      const key = options.body.entries.find(([name]) => name === "submission_key")[1];
      if (!serverRecords.has(key)) {
        serverRecords.set(key, { id: "record-once", evidence: options.body.entries.find(([name]) => name.startsWith("evidence__"))[1] });
      }
      if (postCount === 1) throw new TypeError("Response lost after the server stored the request");
      return { url: "https://red.test/records/record-once?notice=already-saved", status: 200, ok: true };
    },
    FormData: FormDataMock,
    URL,
    window: {
      location: {
        href: "https://red.test/projects/1/records/new",
        assign(url) { navigation = url; },
      },
    },
  });

  await submitHandler({ target: form, submitter: submitButton, preventDefault() {} });
  assert.equal(banner.dataset.networkState, "error");
  assert.match(statusMessage.textContent, /pulsa de nuevo el mismo botón sin cambiar respuestas ni archivos/);
  assert.match(statusMessage.textContent, /comprobará si el primer intento se guardó y evitará duplicarlo/);
  assert.match(statusMessage.textContent, /No recargues ni abras otro formulario/);
  assert.equal(fileField.files[0], selectedPhoto);
  assert.equal(titleField.disabled, false);
  assert.equal(fileField.disabled, false);
  assert.equal(submitButton.disabled, false);

  await submitHandler({ target: form, submitter: submitButton, preventDefault() {} });
  assert.equal(postCount, 2);
  assert.equal(serverRecords.size, 1);
  assert.equal(requests[0].entries.find(([name]) => name === "submission_key")[1], "synthetic-idempotency-key");
  assert.equal(requests[1].entries.find(([name]) => name === "submission_key")[1], "synthetic-idempotency-key");
  assert.equal(requests[1].entries.find(([name]) => name.startsWith("evidence__"))[1], selectedPhoto);
  assert.equal(serverRecords.get("synthetic-idempotency-key").evidence, selectedPhoto);
  assert.equal(form.dataset.saved, "true");
  assert.equal(navigation, "https://red.test/records/record-once?notice=already-saved");
});

test("a stalled record submission times out according to selected file size and keeps a safe retry", async () => {
  let submitHandler;
  let timeoutHandler;
  let timeoutMs = 0;
  let timeoutCleared = false;
  const keyField = input("submission_key", "stable-submission-key-12345678901234567890", "hidden");
  const titleField = input("record_title", "Registro sintético");
  const selectedFile = { name: "synthetic.jpg", size: 2 * 1024 * 1024 };
  const fileField = input("evidence__D11-001", "", "file", [selectedFile]);
  const button = { name: "action", value: "draft", disabled: false };
  const form = {
    dataset: {}, elements: [keyField, titleField, fileField], closest: () => form,
    getAttribute: () => "/projects/p1/records/new",
    querySelectorAll(selector) {
      if (selector === 'button[type="submit"]') return [button];
      if (selector === 'input[type="file"]') return [fileField];
      if (selector === 'input:not([type="hidden"]), select, textarea, button[type="button"]') return [titleField, fileField];
      return [];
    },
  };
  const message = { textContent: "" };
  const banner = { dataset: {}, querySelector: () => message };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    querySelector(selector) {
      if (selector === "form.record-form") return form;
      if (selector === "[data-network-status]") return banner;
      if (selector === "[data-network-message]") return message;
      return null;
    },
  };
  class FormDataMock {
    constructor(sourceForm) { this.entries = sourceForm.elements.map((field) => [field.name, field.type === "file" ? field.files[0] : field.value]); }
    append(name, value) { this.entries.push([name, value]); }
  }
  class AbortControllerMock {
    constructor() {
      const listeners = [];
      this.signal = { addEventListener: (name, callback) => { if (name === "abort") listeners.push(callback); } };
      this.abort = () => listeners.forEach((callback) => callback());
    }
  }
  const window = {
    location: { href: "https://red.test/projects/p1/records/new" },
    setTimeout(callback, duration) { timeoutHandler = callback; timeoutMs = duration; return 5; },
    clearTimeout(id) { timeoutCleared = id === 5; },
  };
  vm.runInNewContext(source, {
    document, FormData: FormDataMock, URL, window, AbortController: AbortControllerMock,
    fetch: async (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new Error("aborted")));
    }),
  });

  const pending = submitHandler({ target: form, submitter: button, preventDefault() {} });
  assert.equal(titleField.disabled, true);
  assert.equal(fileField.disabled, true);
  assert.equal(timeoutMs, 90_000 + 2 * 15_000);
  timeoutHandler();
  await pending;

  assert.equal(timeoutCleared, true);
  assert.equal(titleField.disabled, false);
  assert.equal(fileField.disabled, false);
  assert.equal(button.disabled, false);
  assert.equal(keyField.value, "stable-submission-key-12345678901234567890");
  assert.match(message.textContent, /superó el tiempo de espera/);
  assert.match(message.textContent, /misma clave/);
});

test("a 503 warns that the server may have saved and preserves safe retry guidance", async () => {
  let submitHandler;
  const statusMessage = { textContent: "" };
  const banner = { dataset: {}, querySelector: () => statusMessage };
  const submitButton = { name: "action", value: "draft", disabled: false };
  const keyField = input("submission_key", "stable-edit-key-12345678901234567890", "hidden");
  const form = {
    dataset: {}, elements: [keyField], closest: () => form,
    getAttribute: () => "/records/record-1/edit",
    querySelectorAll: () => [submitButton],
  };
  const document = {
    addEventListener(type, callback) { if (type === "submit") submitHandler = callback; },
    querySelector(selector) {
      if (selector === "form.record-form") return form;
      if (selector === "[data-network-status]") return banner;
      if (selector === "[data-network-message]") return statusMessage;
      return null;
    },
  };
  class FormDataMock {
    constructor(sourceForm) { this.entries = sourceForm.elements.map((control) => [control.name, control.value]); }
    append(name, value) { this.entries.push([name, value]); }
  }

  vm.runInNewContext(source, {
    document,
    fetch: async () => ({ url: "https://red.test/records/record-1/edit", status: 503, ok: false, headers: { get: () => null } }),
    FormData: FormDataMock,
    URL,
    window: { location: { href: "https://red.test/records/record-1/edit", assign() {} } },
  });

  await submitHandler({ target: form, submitter: submitButton, preventDefault() {} });
  assert.equal(banner.dataset.networkState, "error");
  assert.match(statusMessage.textContent, /RED no confirmó el guardado/);
  assert.match(statusMessage.textContent, /comprobará si el primer intento se guardó y evitará duplicarlo/);
  assert.match(statusMessage.textContent, /vuelve a pulsar el mismo botón sin cambiar respuestas ni archivos/);
  assert.equal(keyField.value, "stable-edit-key-12345678901234567890");
  assert.equal(submitButton.disabled, false);
});
