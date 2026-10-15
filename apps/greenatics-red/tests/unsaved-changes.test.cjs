const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/unsaved-changes.js"), "utf8");

function harness() {
  const formListeners = new Map();
  const windowListeners = new Map();
  const form = {
    dataset: {},
    addEventListener: (event, callback) => formListeners.set(event, callback),
  };
  const notice = { hidden: true };
  const document = {
    querySelector: (selector) => {
      if (selector === "form.record-form") return form;
      if (selector === "[data-unsaved-notice]") return notice;
      return null;
    },
    querySelectorAll: (selector) => selector === "form[data-pmirs-progress-form]" ? [] : [],
  };
  const window = { addEventListener: (event, callback) => windowListeners.set(event, callback) };
  vm.runInNewContext(source, { document, window });
  return { form, formListeners, notice, windowListeners };
}

test("shows an unsaved warning and asks before leaving after edits", () => {
  const ui = harness();
  ui.formListeners.get("input")();

  assert.equal(ui.form.dataset.dirty, "true");
  assert.equal(ui.notice.hidden, false);
  const event = { prevented: false, preventDefault() { this.prevented = true; } };
  ui.windowListeners.get("beforeunload")(event);
  assert.equal(event.prevented, true);
  assert.equal(event.returnValue, "");
});

test("warns while a submission is pending and clears only after confirmed save", () => {
  const ui = harness();
  let event = { prevented: false, preventDefault() { this.prevented = true; } };
  ui.windowListeners.get("beforeunload")(event);
  assert.equal(event.prevented, false);

  ui.formListeners.get("submit")();
  ui.form.dataset.submitting = "true";
  event = { prevented: false, preventDefault() { this.prevented = true; } };
  ui.windowListeners.get("beforeunload")(event);
  assert.equal(event.prevented, true);

  ui.form.dataset.saved = "true";
  event = { prevented: false, preventDefault() { this.prevented = true; } };
  ui.windowListeners.get("beforeunload")(event);
  assert.equal(event.prevented, false);
});

test("leaves edits in memory only and preserves the warning after repeated changes", () => {
  const ui = harness();
  ui.formListeners.get("input")();
  ui.formListeners.get("change")();

  assert.deepEqual(Object.keys(ui.form.dataset), ["dirty"]);
  assert.equal(ui.notice.hidden, false);
});

test("marks subtable and location capture actions as unsaved but ignores navigation buttons", () => {
  const ui = harness();
  const onClick = ui.formListeners.get("click");
  onClick({ target: { closest: (selector) => selector.includes("[data-add-row]") ? {} : null } });
  assert.equal(ui.notice.hidden, false);

  const untouched = harness();
  untouched.formListeners.get("click")({ target: { closest: () => null } });
  assert.equal(untouched.form.dataset.dirty, undefined);
  assert.equal(untouched.notice.hidden, true);
});

test("protects PMIRS progress edits and pending submissions until RED confirms save", () => {
  const listeners = new Map();
  const windowListeners = new Map();
  const notice = { hidden: true };
  const form = {
    dataset: {},
    addEventListener: (event, callback) => listeners.set(event, callback),
    querySelector: (selector) => selector === "[data-unsaved-notice]" ? notice : null,
  };
  const document = {
    querySelector: () => null,
    querySelectorAll: (selector) => selector === "form[data-pmirs-progress-form]" ? [form] : [],
  };
  const window = { addEventListener: (event, callback) => windowListeners.set(event, callback) };
  vm.runInNewContext(source, { document, window });

  listeners.get("input")();
  assert.equal(notice.hidden, false);
  listeners.get("submit")();
  let event = { prevented: false, preventDefault() { this.prevented = true; } };
  windowListeners.get("beforeunload")(event);
  assert.equal(event.prevented, true);

  form.dataset.saved = "true";
  event = { prevented: false, preventDefault() { this.prevented = true; } };
  windowListeners.get("beforeunload")(event);
  assert.equal(event.prevented, false);
});
