const defaultFamilyAnchors = ["planeacion", "recoleccion", "infraestructura", "operacion", "datos", "valorizacion"];

function attributeValue(attributes, name) {
  const match = attributes.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
  return match?.[1] ?? "";
}

export function auditServiceIndexHtml(html, familyAnchors = defaultFamilyAnchors) {
  const sections = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .map((match) => ({ attributes: match[1], markup: match[2] }))
    .filter(({ attributes }) => attributeValue(attributes, "class").split(/\s+/).includes("gt-service-category"));
  const errors = [];

  for (const anchor of familyAnchors) {
    const familySections = sections.filter(({ attributes }) => attributeValue(attributes, "id") === anchor);
    if (familySections.length !== 1) {
      errors.push(`/servicios/: family ${anchor} must have exactly one section, found ${familySections.length}`);
      continue;
    }

    const categoryFigures = [...familySections[0].markup.matchAll(/<figure\b[^>]*class="[^"]*\bgt-service-offer__visual\b[^"]*"[^>]*>([\s\S]*?)<\/figure>/gi)];
    if (categoryFigures.length !== 1) {
      errors.push(`/servicios/: family ${anchor} must have one featured contextual visual, found ${categoryFigures.length}`);
      continue;
    }

    const image = categoryFigures[0][1].match(/<img\b([^>]*)>/i);
    if (!image) {
      errors.push(`/servicios/: family ${anchor} visual is missing its image`);
      continue;
    }

    const imageAttributes = image[1];
    if (!/\balt="[^"]{12,}"/i.test(imageAttributes)) {
      errors.push(`/servicios/: family ${anchor} image needs a meaningful alt`);
    }
    if (!/\bwidth="\d+"/i.test(imageAttributes) || !/\bheight="\d+"/i.test(imageAttributes)) {
      errors.push(`/servicios/: family ${anchor} image needs intrinsic dimensions`);
    }
  }

  return errors;
}
