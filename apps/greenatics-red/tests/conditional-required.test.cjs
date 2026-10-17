const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/conditional-required.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../app/forms.json"), "utf8"));

function harness(statusValue = "Programada") {
  const listeners = new Map();
  const status = {
    value: statusValue,
    addEventListener: (event, callback) => listeners.set(event, callback),
  };
  const attendees = { required: false, dataset: {} };
  const evidence = { required: false, dataset: {} };
  const group = {
    dataset: { requiredWhenField: "P10-013", requiredWhenValues: "Ejecutada", requiredWhenNotValues: "" },
    querySelectorAll: () => [attendees, evidence],
  };
  const form = {
    querySelectorAll: (selector) => selector === "[data-required-when-field]" ? [group] : [],
    contains: (element) => element === status,
  };
  const document = {
    querySelectorAll: (selector) => selector === "form" ? [form] : [],
    getElementById: (id) => id === "P10-013" ? status : null,
  };
  vm.runInNewContext(source, { document });
  return { attendees, evidence, listeners, status };
}

function equipmentReviewHarness(decisionValue = "") {
  const listeners = new Map();
  const decision = {
    value: decisionValue,
    addEventListener: (event, callback) => listeners.set(event, callback),
  };
  const confirmation = { required: false, dataset: {} };
  const group = {
    dataset: { requiredWhenField: "review-decision", requiredWhenValues: "VALIDATED", requiredWhenNotValues: "" },
    querySelectorAll: () => [confirmation],
  };
  const form = {
    querySelectorAll: (selector) => selector === "[data-required-when-field]" ? [group] : [],
    contains: (element) => element === decision,
  };
  const document = {
    querySelectorAll: (selector) => selector === "form" ? [form] : [],
    getElementById: (id) => id === "review-decision" ? decision : null,
  };
  vm.runInNewContext(source, { document });
  return { confirmation, decision, listeners };
}

test("session attendance and evidence become required only when state is executed", () => {
  const ui = harness("Programada");
  assert.equal(ui.attendees.required, false);
  assert.equal(ui.evidence.required, false);

  ui.status.value = "Ejecutada";
  ui.listeners.get("change")();
  assert.equal(ui.attendees.required, true);
  assert.equal(ui.evidence.required, true);

  ui.status.value = "Cancelada";
  ui.listeners.get("change")();
  assert.equal(ui.attendees.required, false);
  assert.equal(ui.evidence.required, false);
});

test("an existing evidence file satisfies the conditional file requirement", () => {
  const ui = harness("Ejecutada");
  ui.evidence.dataset.existingEvidence = "true";
  ui.listeners.get("change")();
  assert.equal(ui.attendees.required, true);
  assert.equal(ui.evidence.required, false);
});

test("D-13 reviewer confirmation is required only when accepting as valid", () => {
  const ui = equipmentReviewHarness("");
  assert.equal(ui.confirmation.required, false);

  ui.decision.value = "VALIDATED";
  ui.listeners.get("change")();
  assert.equal(ui.confirmation.required, true);

  ui.decision.value = "CORRECTION_REQUESTED";
  ui.listeners.get("change")();
  assert.equal(ui.confirmation.required, false);
});

test("every conditional RED field follows its catalog rule in the browser script", () => {
  const conditionalFields = catalog.forms.flatMap((form) => form.fields
    .filter((field) => field.required_when)
    .map((field) => ({ formCode: form.code, field })));
  assert.equal(conditionalFields.length, 9);

  for (const { formCode, field } of conditionalFields) {
    const condition = field.required_when;
    const sourceControl = { value: "", listeners: new Map(), addEventListener(event, callback) { this.listeners.set(event, callback); } };
    const dependentControl = { required: false, dataset: {} };
    const group = {
      dataset: {
        requiredWhenField: condition.field_id,
        requiredWhenValues: (condition.equals_any || []).join("|"),
        requiredWhenNotValues: (condition.not_equals_any || []).join("|"),
      },
      querySelectorAll: () => [dependentControl],
    };
    const form = {
      querySelectorAll: (selector) => selector === "[data-required-when-field]" ? [group] : [],
      contains: (element) => element === sourceControl,
    };
    const document = {
      querySelectorAll: (selector) => selector === "form" ? [form] : [],
      getElementById: (id) => id === condition.field_id ? sourceControl : null,
    };

    vm.runInNewContext(source, { document });
    assert.equal(dependentControl.required, false, `${formCode} ${field.id} starts optional`);

    const matchingValue = (condition.equals_any || [])[0]
      || (condition.not_equals_any || [])[0]
      || "Valor distinto";
    sourceControl.value = matchingValue;
    sourceControl.listeners.get("change")();
    const shouldBeRequired = (condition.equals_any || []).includes(matchingValue)
      || ((condition.not_equals_any || []).length > 0 && !(condition.not_equals_any || []).includes(matchingValue));
    assert.equal(dependentControl.required, shouldBeRequired, `${formCode} ${field.id} active rule`);

    sourceControl.value = (condition.equals_any || []).includes(matchingValue)
      ? "Otra respuesta" : matchingValue;
    sourceControl.listeners.get("input")();
    const shouldStillBeRequired = (condition.equals_any || []).includes(sourceControl.value)
      || ((condition.not_equals_any || []).length > 0 && sourceControl.value && !(condition.not_equals_any || []).includes(sourceControl.value));
    assert.equal(dependentControl.required, Boolean(shouldStillBeRequired), `${formCode} ${field.id} changed rule`);
  }
});
