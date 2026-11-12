import assert from "node:assert/strict";
import test from "node:test";
import { auditServiceIndexHtml } from "../scripts/service-index-static-contract.mjs";

const families = ["planeacion", "recoleccion", "infraestructura", "operacion", "datos", "valorizacion"];

function familySection(id, { attributes = `class="gt-service-category" id="${id}" aria-labelledby="service-${id}"`, image = true } = {}) {
  const visual = image
    ? '<figure class="gt-service-offer__visual"><img alt="Contexto del servicio para cada territorio" width="1200" height="800"></figure>'
    : "";
  return `<section ${attributes}><div>${visual}</div></section>`;
}

test("service index static contract accepts accessible family sections with additional attributes", () => {
  const html = families.map((id) => familySection(id, {
    attributes: `aria-labelledby="service-${id}" id="${id}" class="gt-service-category"`,
  })).join("");

  assert.deepEqual(auditServiceIndexHtml(html), []);
});

test("service index static contract still rejects missing families and visuals", () => {
  const html = families
    .filter((id) => id !== "datos")
    .map((id) => familySection(id, { image: id !== "operacion" }))
    .join("");

  assert.deepEqual(auditServiceIndexHtml(html), [
    "/servicios/: family operacion must have one featured contextual visual, found 0",
    "/servicios/: family datos must have exactly one section, found 0",
  ]);
});
