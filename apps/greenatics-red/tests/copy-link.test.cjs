const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app/static/copy-link.js"), "utf8");

function setup(writeText) {
  const link = {
    value: "http://localhost/invitations/accept/synthetic-one-time-token",
    focused: false,
    selected: false,
    focus() { this.focused = true; },
    select() { this.selected = true; },
  };
  const status = { textContent: "" };
  const button = {
    dataset: { copyLinkTarget: "invite-link", copyStatusTarget: "invite-status" },
    addEventListener(type, handler) { if (type === "click") this.click = handler; },
  };
  const document = {
    querySelectorAll: () => [button],
    getElementById: (id) => ({ "invite-link": link, "invite-status": status })[id] || null,
  };
  vm.runInNewContext(source, { document, navigator: { clipboard: { writeText } }, Error });
  return { button, link, status };
}

test("copies an invitation link only after the administrator clicks the button", async () => {
  const copied = [];
  const ui = setup(async (value) => copied.push(value));

  assert.deepEqual(copied, []);
  await ui.button.click();

  assert.deepEqual(copied, [ui.link.value]);
  assert.match(ui.status.textContent, /Enlace copiado/);
  assert.match(ui.status.textContent, /solo a la persona destinataria/);
  assert.equal(ui.link.selected, false);
});

test("selects the link and explains manual copy when clipboard access fails", async () => {
  const ui = setup(async () => { throw new Error("clipboard-denied"); });

  await ui.button.click();

  assert.equal(ui.link.focused, true);
  assert.equal(ui.link.selected, true);
  assert.match(ui.status.textContent, /cópialo manualmente/);
  assert.match(ui.status.textContent, /solo a la persona destinataria/);
});
