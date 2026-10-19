const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/form-subtables.js"), "utf8");

class Field {
  constructor(name, label) {
    this.name = name;
    this.dataset = { rowField: name.split("__").at(-1), rowLabel: label };
    this.attributes = {};
    this.focused = false;
  }

  setAttribute(name, value) { this.attributes[name] = value; }
  focus() { this.focused = true; }
}

class RemoveButton {
  constructor(row) {
    this.row = row;
    this.hidden = true;
    this.attributes = {};
  }

  setAttribute(name, value) { this.attributes[name] = value; }
  closest(selector) {
    if (selector === "[data-remove-row]") return this;
    if (selector === ".repeatable-row") return this.row;
    return null;
  }
}

class Row {
  constructor(parent, { firstControl = "input" } = {}) {
    this.parent = parent;
    this.legend = { textContent: "Recipiente" };
    this.type = new Field("D04-004__type", "Tipo observado del recipiente");
    this.firstControl = firstControl === "select" ? new Field("D02-021__field_id", "Dato por confirmar") : this.type;
    this.quantity = new Field("D04-004__quantity", "Cantidad de recipientes de la fila");
    this.capacity = new Field("D04-004__capacity", "Capacidad observada en la fila");
    this.removeButton = new RemoveButton(this);
    this.removeButton.dataset = { removeLabel: "Quitar recipiente" };
  }

  get nextElementSibling() {
    const index = this.parent.items.indexOf(this);
    return this.parent.items[index + 1] || null;
  }

  get previousElementSibling() {
    const index = this.parent.items.indexOf(this);
    return this.parent.items[index - 1] || null;
  }

  querySelector(selector) {
    if (selector === "[data-row-field]") return this.firstControl;
    if (selector === "input") return this.type;
    if (selector === "input,select,textarea") return this.firstControl;
    return ({
      legend: this.legend,
      '[name="D04-004__type"]': this.type,
      '[name="D04-004__quantity"]': this.quantity,
      '[name="D04-004__capacity"]': this.capacity,
      "[data-remove-row]": this.removeButton,
    })[selector] || null;
  }

  querySelectorAll(selector) { return selector === "[data-row-field]" ? [this.type, this.quantity, this.capacity] : []; }

  remove() {
    const index = this.parent.items.indexOf(this);
    if (index >= 0) this.parent.items.splice(index, 1);
  }
}

function setupSubtable({ noun = "recipiente", plural = "recipientes", firstControl = "input" } = {}) {
  const rows = {
    items: [],
    querySelectorAll(selector) { return selector === ".repeatable-row" ? this.items : []; },
    append(fragment) { this.items.push(fragment.row); },
    addEventListener(type, handler) { if (type === "click") this.clickHandler = handler; },
  };
  const addButton = {
    hidden: true,
    disabled: false,
    textContent: "",
    focused: false,
    addEventListener(type, handler) { if (type === "click") this.clickHandler = handler; },
    focus() { this.focused = true; },
  };
  const announcement = { textContent: "" };
  const template = {
    content: {
      cloneNode() {
        const row = new Row(rows, { firstControl });
        return { row, querySelector(selector) { return selector === ".repeatable-row" ? row : null; } };
      },
    },
  };
  const table = {
    dataset: { rowNoun: noun, rowNounPlural: plural, maxRows: "50" },
    querySelector(selector) {
      return ({
        "[data-rows]": rows,
        "[data-row-template]": template,
        "[data-add-row]": addButton,
        "[data-row-announcement]": announcement,
      })[selector] || null;
    },
  };
  rows.items.push(new Row(rows, { firstControl }));
  vm.runInNewContext(source, { document: { querySelectorAll: () => [table] } });
  return { rows, addButton, announcement };
}

test("D-04 subtable announces added/removed rows and restores keyboard focus", () => {
  const { rows, addButton, announcement } = setupSubtable();
  const firstRow = rows.items[0];

  assert.equal(addButton.hidden, false);
  assert.equal(firstRow.removeButton.hidden, false);
  assert.equal(firstRow.removeButton.attributes["aria-label"], "Quitar recipiente 1");

  addButton.clickHandler();
  const secondRow = rows.items[1];
  assert.equal(rows.items.length, 2);
  assert.equal(secondRow.legend.textContent, "Recipiente 2");
  assert.equal(secondRow.type.attributes["aria-label"], "Tipo observado del recipiente 2");
  assert.equal(secondRow.quantity.attributes["aria-label"], "Cantidad de recipientes de la fila 2");
  assert.equal(secondRow.capacity.attributes["aria-label"], "Capacidad observada en la fila 2");
  assert.equal(secondRow.type.focused, true);
  assert.equal(announcement.textContent, "Fila agregada. 2 recipientes en total.");

  rows.clickHandler({
    target: { closest: () => secondRow.removeButton },
  });
  assert.equal(rows.items.length, 1);
  assert.equal(firstRow.type.focused, true);
  assert.equal(announcement.textContent, "Fila quitada. 1 recipiente en total.");

  firstRow.removeButton.focused = false;
  rows.clickHandler({
    target: { closest: () => firstRow.removeButton },
  });
  assert.equal(rows.items.length, 0);
  assert.equal(addButton.focused, true);
  assert.equal(announcement.textContent, "Fila quitada. 0 recipientes en total.");

  addButton.focused = false;
  addButton.clickHandler();
  assert.equal(rows.items.length, 1);
  assert.equal(rows.items[0].type.focused, true);
  assert.equal(announcement.textContent, "Fila agregada. 1 recipiente en total.");
});

test("repeatable subrecords use their own labels and plural announcements", () => {
  const { rows, addButton, announcement } = setupSubtable({ noun: "gestor o reciclador", plural: "gestores o recicladores" });
  addButton.clickHandler();
  assert.equal(rows.items[1].legend.textContent, "Gestor o reciclador 2");
  assert.equal(announcement.textContent, "Fila agregada. 2 gestores o recicladores en total.");
});

test("repeatable table restores keyboard focus to a select control", () => {
  const { rows } = setupSubtable({ noun: "dato pendiente", plural: "datos pendientes", firstControl: "select" });
  const firstRow = rows.items[0];
  rows.clickHandler({ target: { closest: () => firstRow.removeButton } });
  assert.equal(rows.items.length, 0);
  rows.items.push(new Row(rows, { firstControl: "select" }));
  rows.items[0].removeButton.focused = false;
  rows.items.push(new Row(rows, { firstControl: "select" }));
  rows.clickHandler({ target: { closest: () => rows.items[1].removeButton } });
  assert.equal(rows.items[0].firstControl.focused, true);
});
