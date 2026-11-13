import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { getProductMedia, getPublicProductImage, hasExplicitProductMedia, productMediaRegistry } from "../src/data/product-media";
import { getCommercialPresentations, getProductPublication, hasExplicitProductPublication } from "../src/data/product-publication";
import { catalogOffers, technicalCatalogInquiries } from "../src/data/catalog";
import { casaJardinKits as casaJardinV4Kits } from "../src/data/casa-jardin-v4-review";
import { products, productsList } from "../src/data/products";
import { crops, getCropForProductLabel, getProductSlugForCropStageLine } from "../src/data/crops";

const canonicalFormulas = {
  "2grow": "15-3-3",
  "2balance": "7-7-7",
  "2bloom": "3-8-3",
  "2fruit": "3-3-8",
} as const;

test("Wondergreen quote offers match current commercial publication states", () => {
  expect(catalogOffers).toHaveLength(20);
  expect(new Set(catalogOffers.map(({ id }) => id)).size).toBe(catalogOffers.length);

  const solidOffers = catalogOffers.filter(({ presentation }) => presentation.includes("kg"));
  expect(solidOffers.map(({ product, formula, presentation }) => [product, formula ?? "", presentation])).toEqual([
    ["Wondergreen Compost", "", "40 kg"],
    ["Wondergreen 2GROW", "15-3-3", "40 kg"],
    ["Wondergreen 2BALANCE", "7-7-7", "40 kg"],
    ["Wondergreen 2BLOOM", "3-8-3", "40 kg"],
    ["Wondergreen 2FRUIT", "3-3-8", "40 kg"],
  ]);
  expect(getCommercialPresentations("compost")).toEqual(["40 kg"]);
  for (const slug of ["2grow", "2balance", "2bloom", "2fruit"]) {
    expect(getCommercialPresentations(slug)).toEqual(["40 kg"]);
  }

  for (const [family, slug] of [
    ["2GROW", "2grow-liquido"],
    ["2BALANCE", "2balance-liquido"],
    ["2FRUIT", "2fruit-liquido"],
  ]) {
    const offers = catalogOffers.filter((offer) => offer.family === family && offer.product.includes("Líquido"));
    expect(offers.map(({ presentation }) => presentation)).toEqual(getCommercialPresentations(slug));
  }

  expect(catalogOffers.some(({ product }) => product.includes("2GROW 200-0-0"))).toBe(false);
  expect(catalogOffers.some(({ product }) => product.includes("2BLOOM Líquido"))).toBe(false);
  expect(catalogOffers.every((offer) => !("priceCop" in offer))).toBe(true);
  expect(technicalCatalogInquiries).toHaveLength(12);
  expect(new Set(technicalCatalogInquiries.map(({ id }) => id)).size).toBe(technicalCatalogInquiries.length);
  expect(technicalCatalogInquiries.some(({ id }) => id === "2grow-200-0-0")).toBe(true);
  expect(technicalCatalogInquiries.some(({ id }) => id === "2bloom-liquido")).toBe(true);
  expect(technicalCatalogInquiries.every((inquiry) => !("priceCop" in inquiry) && !("quantity" in inquiry))).toBe(true);
});

test("catalog and quote builder use the nine current Casa & Jardín kit artworks", () => {
  expect(casaJardinV4Kits).toHaveLength(9);
  for (const kit of casaJardinV4Kits) {
    expect(kit.image).toMatch(/^\/wondergreen\/v4\/kits\//);
    expect(fs.existsSync(path.join(process.cwd(), "public", kit.image.slice(1)))).toBe(true);
  }
  expect(casaJardinV4Kits.map(({ slug }) => slug)).toEqual([
    "mi-primera-matera",
    "plantas-verdes",
    "plantas-con-flor",
    "aromaticas-y-hojas",
    "trasplanta-y-activa",
    "mi-huerta",
    "casa-completa",
    "casa-completa-xl",
    "proteccion-de-hojas",
  ]);
});

test("Wondergreen public catalog keeps canonical families and explicit publication/media states", async () => {
  const slugs = products.map((product) => product.slug);
  expect(new Set(slugs).size, "product slugs must be unique").toBe(slugs.length);
  expect(slugs).toHaveLength(16);

  const solids = products.filter((product) => product.category === "solidos");
  expect(Object.fromEntries(solids.map(({ slug, formula }) => [slug, formula]))).toEqual(canonicalFormulas);
  const solidGrow = solids.find((product) => product.slug === "2grow");
  expect(solidGrow?.notes).not.toContain("Conservar bajo techo en un lugar seco.");
  expect(solidGrow?.cautions).toContain("Conservar en lugar techado y seco.");
  expect(solidGrow?.intro).not.toMatch(/ayuda a proteger el nutriente/i);
  expect(solidGrow?.intro).toMatch(/estructura orientada a una liberación gradual/i);
  for (const product of solids) {
    expect(product.benefits.join(" ")).not.toMatch(/reduc(?:ir|e|en) pérdidas/i);
    expect(product.benefits.join(" ")).toMatch(/suelo|lote|manejo/i);
  }

  const liquids = products.filter((product) => product.category === "liquidos");
  expect(liquids.map((product) => product.slug).sort()).toEqual([
    "2balance-liquido",
    "2bloom-liquido",
    "2fruit-liquido",
    "2grow-liquido",
  ]);
  const growLiquid = liquids.find((product) => product.slug === "2grow-liquido");
  for (const liquid of liquids) {
    expect(liquid.headline).toContain("Fertilizante líquido de base biológica");
    expect(liquid.headline).not.toContain("Bioinsumo fertilizante");
    expect(liquid.technicalRole).not.toContain("Bioinsumo fertilizante");
  }
  expect(growLiquid?.technicalRole).toContain("nutrición soluble");
  expect(growLiquid?.focus).toContain("200-0-0, la formulación de mayor concentración de nitrógeno");
  expect(growLiquid?.concentrations).toEqual([
    "100-20-20",
    "200-0-0 · mayor concentración de nitrógeno de la línea",
  ]);
  expect(getCommercialPresentations("2grow-liquido")).toEqual(["1 L", "3,75 L", "20 L", "200 L", "1.000 L"]);
  expect(getProductPublication("2grow-liquido").summary).toContain("200-0-0, su formulación de mayor concentración de nitrógeno");
  expect(getProductPublication("2grow-liquido").presentationGroups[1]).toMatchObject({
    label: "2GROW 200-0-0 · mayor concentración de nitrógeno de la línea",
    shortLabel: "2GROW 200-0-0",
    status: "technical",
  });
  expect(getCommercialPresentations("2bloom-liquido")).toEqual([]);
  expect(getProductPublication("2bloom-liquido").label).toBe("Portafolio técnico");
  const bloomLiquid = liquids.find((product) => product.slug === "2bloom-liquido");
  expect(bloomLiquid?.presentations).toEqual(["Formato por consultar"]);
  expect(bloomLiquid?.commercialStatus).toBe("Portafolio técnico; presentación y suministro por consultar");
  expect(bloomLiquid?.specs.find(({ label }) => label === "Estado")?.value).toBe(
    "Portafolio técnico; presentación y suministro por consultar",
  );
  expect(productsList.find((product) => product.id === "2bloom-liquido")?.presentation).toBe("Formato por consultar");
  expect(getCommercialPresentations("2grow")).toEqual(["40 kg"]);
  expect(getProductPublication("2grow").presentationGroups[1].items).toEqual(["5 kg"]);
  expect(products.find((product) => product.slug === "compost")?.commercialStatus).toBe(
    "Disponible bajo solicitud y acompañamiento técnico",
  );
  expect(getProductPublication("bioinsumo-neem").presentationGroups[0]).toMatchObject({
    items: ["1 L", "5 L", "20 L"],
    status: "technical",
  });
  const bioinputPortfolio = products.find((product) => product.slug === "bioinsumos");
  expect(bioinputPortfolio?.commercialStatus).toBe("Portafolio técnico; presentación y suministro por consultar");
  expect(bioinputPortfolio?.specs.find(({ label }) => label === "Estado")?.value).toBe(
    "Portafolio técnico; presentación y suministro por consultar",
  );
  expect(bioinputPortfolio?.crops).toEqual([]);
  expect(getProductPublication("bioinsumos")).toMatchObject({
    label: "Portafolio técnico",
    showPublicPrice: false,
    presentationGroups: [{ items: ["1 L", "5 L", "20 L"], status: "technical" }],
  });
  for (const slug of [
    "bioinsumo-ajo-aji",
    "bioinsumo-neem",
    "bioinsumo-beauveria",
    "bioinsumo-metarhizium",
    "bioinsumo-bacillus-subtilis",
    "bioinsumo-trichoderma",
  ]) {
    const product = products.find((candidate) => candidate.slug === slug);
    expect(product?.presentations, `${slug} records the technical reference formats`).toEqual(["1 L", "5 L", "20 L"]);
    expect(product?.commercialStatus).toContain("Portafolio técnico");
    expect(getProductPublication(slug).label).toBe("Portafolio técnico");
    expect(getProductPublication(slug).presentationGroups[0]).toMatchObject({
      items: ["1 L", "5 L", "20 L"],
      status: "technical",
    });
  }

  const individualBioinputs = products.filter(
    (product) => product.category === "bioinsumos" && product.slug !== "bioinsumos",
  );
  expect(individualBioinputs).toHaveLength(6);
  const bioinputCopy = individualBioinputs.map((product) => [
    product.headline,
    product.intro,
    product.focus,
    product.objective,
    product.technicalRole,
    product.idealFor,
    product.notes,
    product.benefits,
    product.application,
    product.cautions,
  ].flat().join(" "));
  for (const [index, product] of individualBioinputs.entries()) {
    expect(product.crops, `${product.slug} does not imply unverified crop authorization`).toEqual([]);
    expect(product.stage, `${product.slug} leaves agronomic scope to current documentation`).toMatch(/Uso por (?:confirmar|validar)/);
    expect(bioinputCopy[index]).toMatch(/ficha.*etiqueta.*registro/i);
    expect(bioinputCopy[index]).not.toMatch(/Drench|Fertirriego|aspersión foliar|aplicación foliar|aplicación al suelo|enraizamiento|desarrollo radicular|suelo activo|programa preventivo/i);
    expect(bioinputCopy[index]).not.toMatch(/entregada con la solicitud|entregada con solicitud/i);
  }
  const trichoderma = products.find((product) => product.slug === "bioinsumo-trichoderma");
  expect(trichoderma).toMatchObject({
    headline: "Bioinsumo microbiológico · Alcance por confirmar",
    stage: "Uso por validar",
    crops: [],
    cautions: [
      "No inferir cultivos, objetivos, vías, dosis ni efectos por el nombre Trichoderma.",
      "No definir aplicaciones, mezclas ni compatibilidades sin ficha, etiqueta y registro vigentes.",
    ],
  });
  expect(trichoderma?.intro).toContain("ficha, etiqueta y registro vigentes");
  expect(trichoderma?.application.join(" ")).toContain("uso autorizado");
  expect(trichoderma?.application.join(" ")).not.toMatch(/Drench|Fertirriego|Café|Aguacate|Cacao|Hortalizas|Viveros|Frutales/i);
  expect(trichoderma?.benefits.join(" ")).not.toMatch(/acompañamiento radicular|manejo del entorno biológico/i);
  expect(products.filter((product) => product.category === "acondicionadores").map((product) => product.slug)).toEqual([
    "compost",
  ]);

  for (const product of products) {
    expect(hasExplicitProductPublication(product.slug), `${product.slug} needs an explicit publication state`).toBe(true);
    expect(hasExplicitProductMedia(product.slug), `${product.slug} needs an explicit asset state`).toBe(true);
  }
});

test("Wondergreen product copy does not expose internal image-production notes", async () => {
  const productPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/wondergreen/productos/[slug]/page.tsx"),
    "utf8",
  );
  const productVisual = fs.readFileSync(path.join(process.cwd(), "src/components/product-visual.tsx"), "utf8");
  const publicImageCopy = [
    "src/data/product-media.ts",
    "src/components/wondergreen-liquid-lines.tsx",
    "src/components/home-product-family-explorer.tsx",
    "src/app/wondergreen/page.tsx",
    "src/app/portafolio/page.tsx",
    "src/data/portfolio.ts",
  ].map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8")).join("\n");
  expect(productPage).not.toMatch(/las escenas son editoriales|generada con ia|no documenta/i);
  expect(productVisual).not.toMatch(/no es packshot vigente confirmado|imagen referencial; no confirma/i);
  expect(publicImageCopy).not.toMatch(/alt:\s*"Referencia visual|cropperReference\([^,]+,\s*"Referencia visual/i);
  expect(productVisual).toContain("Te confirmamos el envase, la etiqueta y la disponibilidad vigentes de esta formulación.");
});

test("liquid fertilizer copy stays within documented product truth", () => {
  const expectedLiquidTruth = {
    "2grow-liquido": {
      formula: "100-20-20",
      stage: "Arranque & Crecimiento",
      presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
      commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
      priceCop: 17000,
    },
    "2balance-liquido": {
      formula: "70-70-70",
      stage: "Equilibrio & Transición",
      presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
      commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
      priceCop: 19100,
    },
    "2bloom-liquido": {
      formula: "30-80-30",
      stage: "Floración & Cuajado",
      presentations: ["Formato por consultar"],
      commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
      priceCop: undefined,
    },
    "2fruit-liquido": {
      formula: "30-30-80",
      stage: "Llenado & Maduración",
      presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
      commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
      priceCop: 18000,
    },
  } as const;
  const unsupportedLiquidClaim = /\b(?:Bacillus|Trichoderma|Beauveria|Metarhizium)\b|(?:controla|elimina|combate|reduce)\s+(?:plagas?|patógenos?|enfermedades?)/i;

  for (const [slug, expected] of Object.entries(expectedLiquidTruth)) {
    const product = products.find((candidate) => candidate.slug === slug);
    expect(product, `${slug} remains in the public product source`).toBeDefined();
    const { priceCop, ...expectedPublicFields } = expected;
    expect(product).toMatchObject(expectedPublicFields);
    expect(product?.priceCop).toBe(priceCop);
    const productCopy = [
      product?.headline,
      product?.intro,
      product?.focus,
      product?.objective,
      product?.technicalRole,
      product?.stage,
      product?.idealFor,
      product?.notes,
      product?.benefits,
      product?.application,
      product?.cautions,
    ].flat().join(" ");
    expect(productCopy, `${slug} avoids undocumented strains, targets, or efficacy claims`).not.toMatch(unsupportedLiquidClaim);
  }

  const balanceLiquid = products.find((product) => product.slug === "2balance-liquido");
  const balanceCopy = [balanceLiquid?.intro, balanceLiquid?.objective, balanceLiquid?.technicalRole, balanceLiquid?.benefits].flat().join(" ");
  expect(balanceCopy).toContain("relación numérica 1:1:1");
  expect(balanceCopy).toContain("análisis de suelo o tejido");
  expect(balanceCopy).toContain("etiqueta vigente");
  expect(balanceCopy).not.toContain("ajustar la conversación");

  const liquidLines = fs.readFileSync(path.join(process.cwd(), "src/components/wondergreen-liquid-lines.tsx"), "utf8");
  const sciencePage = fs.readFileSync(path.join(process.cwd(), "src/app/wondergreen/ciencia/page.tsx"), "utf8");
  const biolConnectionCopy = sciencePage.match(/\["Bioles de digestión anaerobia", "([^"]+)"\]/)?.[1] ?? "";
  const liquidProgramCopy = sciencePage.match(/<h3>Fertilizantes líquidos<\/h3><p>([^<]+)<\/p>/)?.[1] ?? "";
  expect(liquidLines).not.toMatch(unsupportedLiquidClaim);
  expect(biolConnectionCopy).not.toMatch(unsupportedLiquidClaim);
  expect(liquidProgramCopy).not.toMatch(unsupportedLiquidClaim);
  expect(liquidLines).toContain("Las líneas líquidas se elaboran a partir de bioles de digestión anaerobia multietapa.");
  expect(biolConnectionCopy).toContain("La concentración y el uso de cada referencia se consultan en su ficha vigente");
  expect(liquidProgramCopy).toContain("La concentración, la etapa y las condiciones de uso se consultan en la ficha vigente");
});

test("public Wondergreen image labels never expose internal production metadata", () => {
  const productVisual = fs.readFileSync(path.join(process.cwd(), "src/components/product-visual.tsx"), "utf8");
  const publicAlts = Object.values(productMediaRegistry).flatMap((media) => [
    media.alt,
    media.editorial?.alt,
    media.reference?.alt,
  ]).filter((alt): alt is string => Boolean(alt));

  expect(productVisual).not.toMatch(/media\.(?:note|source)|(?:editorial|reference)\.(?:note|source)/);
  for (const alt of publicAlts) {
    expect(alt).not.toMatch(/escena editorial|escena conceptual|generada con imagegen|no representa|no documenta|\bcropper\b/i);
  }
});

test("aggregate bioinputs detail keeps technical availability separate from the Croper store link", () => {
  const detail = fs.readFileSync(
    path.join(process.cwd(), "out", "wondergreen", "productos", "bioinsumos", "index.html"),
    "utf8",
  );

  expect(detail).toContain("Portafolio técnico");
  expect(detail).toContain("Consulta con el equipo la presentación, disponibilidad y condiciones de suministro de esta referencia.");
  expect(detail).toContain("Ver tienda Greenatics en Croper");
  expect(detail).not.toContain("Disponible bajo solicitud y acompañamiento técnico");
});

test("Wondergreen liquid and bioinput catalogs explain how to confirm package details", () => {
  const liquidLines = fs.readFileSync(path.join(process.cwd(), "src/components/wondergreen-liquid-lines.tsx"), "utf8");
  const bioinputLines = fs.readFileSync(path.join(process.cwd(), "src/components/wondergreen-bioinput-lines.tsx"), "utf8");
  const liquidNote = liquidLines.match(/<p className="wg-liquid-lines__presentation-note">([^<]+)<\/p>/)?.[1] ?? "";
  const bioinputNote = bioinputLines.match(/<p className="wg-bio-lines__presentation-note">([^<]+)<\/p>/)?.[1] ?? "";

  expect(liquidNote).toBe("Las imágenes ayudan a reconocer cada línea; consulta la ficha y confirma con nuestro equipo la presentación y la etiqueta vigentes.");
  expect(bioinputNote).toBe("Las imágenes disponibles ayudan a reconocer cada referencia; la de Trichoderma se mantiene pendiente mientras se confirma su especie, ficha y etiqueta vigentes.");
  expect(bioinputLines).toContain('"bioinsumo-trichoderma": "Especie, ficha, etiqueta y alcance autorizado por confirmar."');
  expect(`${liquidNote}\n${bioinputNote}`).not.toMatch(/Cropper|REFERENCE_ONLY|escena editorial|no documenta/i);
});

test("Wondergreen bioinput overview does not infer benefits or uses from the ingredient name", () => {
  const overview = fs.readFileSync(path.join(process.cwd(), "out/wondergreen/index.html"), "utf8");
  const sectionStart = overview.indexOf('id="bioinsumos"');
  const sectionEnd = overview.indexOf('class="wg-bio-lines__footer"', sectionStart);
  expect(sectionStart).toBeGreaterThan(-1);
  expect(sectionEnd).toBeGreaterThan(sectionStart);

  const bioinputSection = overview.slice(sectionStart, sectionEnd);
  expect(bioinputSection).toContain("Seis referencias botánicas y microbiológicas.");
  expect(bioinputSection).toContain("su alcance y uso autorizado se confirman en la ficha, etiqueta y registro vigentes.");
  expect(bioinputSection).not.toMatch(/suelo activo|desarrollo radicular|aplicación dirigida|acompañamiento preventivo|programas definidos por cultivo|Todos los cultivos|Drench|Fertirriego/i);
});

test("Wondergreen science page uses client-facing guidance instead of editorial labels or unsourced statistics", () => {
  const sciencePage = fs.readFileSync(path.join(process.cwd(), "src/app/wondergreen/ciencia/page.tsx"), "utf8");

  expect(sciencePage).not.toMatch(/lectura editorial|evidencia de contexto|traducción al portafolio|pasar de la lectura|relación conceptual/i);
  expect(sciencePage).not.toMatch(/219 estudios|6,81 a \+17,47%|0,78 ± 0,13/);
  expect(sciencePage).not.toMatch(/<span>0[1-4]<\/span>/);
  expect(sciencePage).toContain("La nutrición del cultivo empieza por leer el suelo.");
  expect(sciencePage).toContain("La recomendación se define con información del lote.");
  expect(sciencePage).toContain("Conocer los programas agronómicos Wondergreen");
});

test("Wondergreen catalog explains formulation principles without claiming formula efficacy", () => {
  const catalog = fs.readFileSync(path.join(process.cwd(), "src/app/biblioteca/catalogo-wondergreen/page.tsx"), "utf8");

  expect(catalog).toContain('className="wg-catalog-brand-lockup"');
  expect(catalog).toContain('src="/brand/wondergreen-nutrients.webp"');
  expect(catalog).not.toContain('className="lead editorial-justify"');
  expect(catalog).toContain("Dos familias. Dos bases de formulación.");
  expect(catalog).toContain("La matriz integra nutrientes minerales y materia orgánica.");
  expect(catalog).toContain("Su comportamiento depende de la fórmula, el suelo y el manejo del cultivo.");
  expect(catalog).toContain("Fermentación anaerobia multietapa");
  expect(catalog).toContain("Formulación y estabilización");
  expect(catalog).toContain("Las referencias parten de bioles obtenidos mediante fermentación anaerobia multietapa.");
  expect(catalog).toContain("microorganismos benéficos al sistema suelo-planta");
  expect(catalog).toContain('casaJardinKits as casaJardinV4Kits');
  expect(catalog).toContain("kit.proposedTotals");
  expect(catalog).toContain("kit.note");
  expect(catalog).toContain('href={`/casa-jardin/kits/v4/${kit.slug}/`}');
  expect(catalog).toContain("Solicitar revisión y cotización");
  expect(catalog).toContain("La evidencia general explica principios; no demuestra por sí sola el desempeño de una fórmula Wondergreen.");
  expect(catalog).toContain('href="/wondergreen/ciencia/#evidencia-cientifica"');
  expect(catalog).not.toMatch(/mejora el rendimiento|aumenta la productividad|reduce pérdidas/i);
});

test("Wondergreen family selectors distinguish cultivation visuals from package references", () => {
  const visual = fs.readFileSync(path.join(process.cwd(), "src/components/product-visual.tsx"), "utf8");
  const catalog = fs.readFileSync(path.join(process.cwd(), "src/app/biblioteca/catalogo-wondergreen/page.tsx"), "utf8");
  const homeExplorer = fs.readFileSync(path.join(process.cwd(), "src/components/home-product-family-explorer.tsx"), "utf8");
  const showcase = fs.readFileSync(path.join(process.cwd(), "src/components/wondergreen-packshots.tsx"), "utf8");

  for (const slug of ["2grow", "2balance", "2bloom", "2fruit"]) {
    expect(visual).toContain("getProductMedia(product.slug).editorial");
    expect(catalog).toContain("getProductMedia(product.slug).editorial");
    expect(homeExplorer).toContain(`solid40kgPackshot("${slug}"`);
    expect(showcase).toContain("familyMedia.editorial ?? skuMedia.reference");
  }
  expect(homeExplorer).toContain('variant: "editorial" | "reference" = "reference"');
  expect(homeExplorer).toContain("variant === \"editorial\" ? media.editorial : media.reference");
  expect(homeExplorer).toContain("image: image.src");
  expect(catalog).toContain("Los sacos corresponden a la presentación comercial de 40 kg; el equipo confirma precio y disponibilidad para cada solicitud.");
  expect(catalog).toContain("Las imágenes ayudan a reconocer cada línea; consulta la ficha y confirma con nuestro equipo la presentación y la etiqueta vigentes.");
  expect(catalog).toContain("Las imágenes disponibles identifican las referencias; Trichoderma se muestra con nombre genérico hasta confirmar su ficha y etiqueta vigentes.");
});

test("home liquid family carousel exposes all five formulation packshot references", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/components/home-product-family-explorer.tsx"), "utf8");
  const start = source.indexOf('name: "Fertilizantes líquidos"');
  const end = source.indexOf('name: "Bioinsumos"', start);
  const liquidFamily = start >= 0 && end > start ? source.slice(start, end) : "";
  const references = [...liquidFamily.matchAll(/\{ name: "([^"]+)", image: "([^"]+)", alt:/g)];

  expect(references.map(([, name]) => name)).toEqual([
    "2GROW · 100-20-20",
    "2GROW · 200-0-0",
    "2BALANCE · 70-70-70",
    "2BLOOM · 30-80-30",
    "2FRUIT · 30-30-80",
  ]);
  for (const [, , image] of references) {
    expect(fs.existsSync(path.join(process.cwd(), "public", image.slice(1))), `${image} exists`).toBe(true);
  }
});

test("Wondergreen hero guides customers to confirm reference package details", () => {
  const hero = fs.readFileSync(path.join(process.cwd(), "src/app/wondergreen/page.tsx"), "utf8");
  const note = hero.match(/<p className="wg-v4-family-gallery__note">([^<]+)<\/p>/)?.[1] ?? "";
  expect(hero.match(/type: "reference"/g)).toHaveLength(2);
  expect(note).toBe("Las imágenes de envase ayudan a reconocer las líneas; consulta la ficha y confirma con nuestro equipo la presentación y la etiqueta vigentes.");
  expect(note).not.toMatch(/Cropper|REFERENCE_ONLY|escena editorial|no documenta/i);
});

test("every Wondergreen product ficha is present and correctly identified in the static export", async () => {
  for (const product of products) {
    const route = `/wondergreen/productos/${product.slug}/`;
    const htmlPath = path.join(process.cwd(), "out", "wondergreen", "productos", product.slug, "index.html");
    expect(fs.existsSync(htmlPath), `${route} must be present in the static export`).toBe(true);
    const html = fs.readFileSync(htmlPath, "utf8").replaceAll("&amp;", "&");
    expect(html, `${route} must not expose internal image-production notes`).not.toMatch(
      /escena editorial|escena conceptual|imagen editorial generada|generada con imagegen|no documenta|no representa un empaque|no representa un caso documentado/i,
    );
    if (product.category === "solidos") {
      expect(html).not.toMatch(/reduc(?:ir|e|en) pérdidas/i);
    }
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .replaceAll("&amp;", "&")
      .trim();
    expect(heading, `${route} should identify ${product.name} as its main heading`).toBe(product.name);
    expect(html).toContain('href="https://croper.com/provider/1231-greenatics" target="_blank" rel="noopener noreferrer">');
    expect(html).toContain("Ver tienda Greenatics en Croper");
    expect(html).toContain("si buscas un formato o concentración que no aparece allí, consúltanos.");
    expect(html).toContain("se abre en una pestaña nueva");
    const primaryContactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(product.name)}&prioridad=${encodeURIComponent(
      product.slug === "2grow-liquido"
        ? "Elegir concentración: 2GROW 100-20-20 o 2GROW 200-0-0"
        : product.category === "bioinsumos"
          ? `Confirmar documentación, uso autorizado y condiciones de ${product.name.replace("Wondergreen ", "")}`
        : `${product.stage || product.focus} · ${product.presentation || product.format}`,
    )}`;
    expect(html).toContain(`href="${primaryContactHref}"`);
    expect(html.split(`href="${primaryContactHref}"`).length - 1).toBe(1);
    expect(html.replaceAll("<!-- -->", "")).toContain(`>Consultar ${product.name}</a>`);
    expect(html).toContain('href="/biblioteca/catalogo-wondergreen/#familias">Ver catálogo Wondergreen →</a>');
    expect(html).toContain("¿Esta referencia corresponde a tu cultivo y objetivo?");
    expect(html).not.toContain("¿Quieres saber si esta familia tiene sentido para tu cultivo?");
    expect(html).not.toContain("Hablar con un asesor</a>");
    if (product.category === "solidos" || product.category === "liquidos") {
      expect(html, `${product.slug} should not repeat hero facts in a second spec card`).not.toContain("Datos técnicos");
    } else {
      expect(html, `${product.slug} should retain its reference-specific technical facts`).toContain("Datos técnicos");
    }
    expect(html).toContain(product.category === "bioinsumos" ? "Qué confirmar antes de considerarlo" : "Qué aporta al programa");
    expect(html).toContain(product.technicalRole);
    expect(html).toContain(product.objective);
    if (product.slug === "2grow-liquido") {
      expect(html).toContain("Una línea, dos concentraciones");
      expect(html).toContain("100-20-20 y 200-0-0 son concentraciones de la misma línea 2GROW");
    } else if (product.category === "solidos") {
      const familyMedia = getProductMedia(product.slug).editorial;
      expect(familyMedia, `${product.slug} has a cultivation image`).toBeDefined();
      expect(html).toContain(`src="${familyMedia?.src}"`);
      expect(html).not.toContain("Referencia visual · no es packshot vigente confirmado");
    } else if (product.slug === "compost") {
      const editorialMedia = getProductMedia(product.slug).editorial;
      expect(editorialMedia, "Compost has an editorial soil image").toBeDefined();
      expect(html).toContain(`src="${editorialMedia?.src}"`);
      expect(html).toContain("Materia orgánica estabilizada para suelo y sustrato.");
      expect(html).toContain("Su aporte se integra a la preparación del suelo o sustrato; la respuesta depende de la madurez y calidad del material, las condiciones del sitio y el manejo.");
      expect(html).not.toContain("Ayuda a mejorar el contexto físico y biológico del suelo");
      expect(html).not.toContain("wondergreen-cropper-ref-compost-5kg");
      expect(html).not.toContain("Referencia visual · no es packshot vigente confirmado");
    } else {
      const visual = getProductMedia(product.slug);
      if (visual.reference) {
        expect(html).toContain("Consulta la presentación disponible");
        expect(html).toContain("Te confirmamos el envase, la etiqueta y la disponibilidad vigentes de esta formulación.");
      }
    }
    expect(html).not.toContain("Cómo se integra esta referencia al manejo del cultivo.");
    expect(html).not.toContain("Enfoque de la referencia:");
    expect(html).toContain("Antes de aplicar");
    expect(html).toContain("Abrir manual de aplicación");
    if (product.category === "bioinsumos") {
      const overview = html.match(/<section class="product-overview"[^>]*id="papel"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
      const application = html.match(/<section class="product-application-section"[^>]*id="aplicacion"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(overview).toContain("Antes de orientar su uso");
      expect(overview).toContain("Qué confirmar antes de considerarlo");
      expect(application).toContain("Cultivos autorizados por confirmar");
      expect(application).toContain("No se publican cultivos recomendados");
      expect(application).not.toContain("product-crop-pill");
      expect(`${overview}\n${application}`).not.toMatch(/Drench|Fertirriego|aplicación foliar|aplicación al suelo|enraizamiento|desarrollo radicular|suelo activo|programa preventivo|Todos los cultivos/i);
      expect(html).toContain("ficha, etiqueta y registro vigentes");
    }
  }

  const biolPath = path.join(process.cwd(), "out", "wondergreen", "productos", "biol", "index.html");
  expect(fs.existsSync(biolPath), "the documented Biol page must be present in the static export").toBe(true);
  const biolHtml = fs.readFileSync(biolPath, "utf8");
  expect(biolHtml).toMatch(/<h1\b[^>]*>Biol:/i);
  expect(biolHtml).toContain("1 L en 100 L de agua");
  expect(biolHtml).toContain("Formatos indicados en ficha técnica");
  expect(biolHtml).not.toContain("Presentaciones disponibles");

  const growLiquidHtml = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "2grow-liquido", "index.html"), "utf8");
  expect(growLiquidHtml).toContain("Fertilizante líquido de base biológica para crecimiento vegetativo");
  expect(growLiquidHtml).toContain("2GROW 200-0-0 · mayor concentración de nitrógeno de la línea");
  const growLiquidVisibleText = growLiquidHtml
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&");
  const growLiquidAltText = [...growLiquidHtml.matchAll(/\balt="([^"]*)"/gi)]
    .map((match) => match[1])
    .join(" ");
  expect(growLiquidVisibleText).not.toMatch(/High-N|muy alto nitr[oó]geno/i);
  expect(growLiquidAltText).not.toMatch(/High-N|muy alto nitr[oó]geno/i);
  expect(growLiquidHtml).toContain("100-20-20 para crecimiento vegetativo");
  expect(growLiquidHtml).toContain("200-0-0, la formulación de mayor concentración de nitrógeno");
  expect(growLiquidHtml).not.toContain("Concentraciones de la línea");
  expect(growLiquidHtml).not.toContain("Portafolio técnico");
  expect(growLiquidHtml).not.toContain("Estado de publicación");
  expect(growLiquidHtml).not.toContain("Formatos por estado del portafolio");
  expect(growLiquidHtml).not.toContain("200-0-0 · portafolio técnico");
  const growLiquidVisibleHtml = growLiquidHtml.replaceAll("&amp;", "&").replaceAll("<!-- -->", "");
  expect(growLiquidVisibleHtml).toContain("Consultar 2GROW 100-20-20 →");
  expect(growLiquidVisibleHtml).toContain("Consultar 2GROW 200-0-0 →");
  expect(growLiquidVisibleHtml).toContain(`diagnostico=${encodeURIComponent("Wondergreen 2GROW 100-20-20")}&prioridad=${encodeURIComponent("100-20-20 · elegir entre 1 L, 3,75 L, 20 L, 200 L o 1.000 L")}`);
  expect(growLiquidVisibleHtml).toContain(`diagnostico=${encodeURIComponent("Wondergreen 2GROW 200-0-0")}&prioridad=${encodeURIComponent("200-0-0 · presentación y suministro por consultar")}`);
  expect(growLiquidVisibleHtml).not.toContain("Arranque & Crecimiento · 1 L");

  const wondergreenHtml = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "index.html"), "utf8");
  expect(wondergreenHtml.replaceAll("<!-- -->", "")).toContain("2GROW");
  expect(wondergreenHtml).toContain("200-0-0");
  expect(wondergreenHtml).toContain("200-0-0 como su formulación de mayor concentración de nitrógeno");
  expect(wondergreenHtml).toContain("/products/wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg");
  expect(wondergreenHtml).toContain("/products/wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg");
  expect(wondergreenHtml).not.toContain("wondergreen-2grow-high-n-reference");
  expect(wondergreenHtml).toContain("Cuatro líneas, cinco formulaciones.");
  expect(wondergreenHtml).toContain("Cuatro líneas y cinco formulaciones líquidas Wondergreen");
  expect(wondergreenHtml).toContain("Seis referencias botánicas y microbiológicas.");
  expect(wondergreenHtml).toContain("Microbiológicos");
  expect(wondergreenHtml).toContain("Botánicos");
  expect(wondergreenHtml).not.toContain("wg-liquid-lines__split");
  expect(wondergreenHtml).not.toContain("wg-liquid-lines__meta");
  expect(wondergreenHtml).not.toContain("wg-liquid-lines__signal");
  const growCard = wondergreenHtml.match(/<article class="wg-liquid-lines__card wg-liquid-lines__card--2grow">([\s\S]*?)<\/article>/)?.[1] ?? "";
  expect(growCard).toContain("2GROW");
  expect(growCard.replaceAll("<!-- -->", "")).toContain("Ver ficha de 2GROW");
  expect(wondergreenHtml.match(/class="wg-liquid-lines__card wg-liquid-lines__card--2grow"/g)).toHaveLength(1);
  expect(wondergreenHtml.match(/class="wg-liquid-lines__card(?: wg-liquid-lines__card--[^"]+)?"/g)).toHaveLength(4);
  expect(growCard).toContain("100-20-20");
  expect(growCard).toContain("200-0-0");
  expect(growCard.match(/<figure class="wg-liquid-lines__card-media"/g)).toHaveLength(2);
  expect(growCard.match(/href="\/wondergreen\/productos\/2grow-liquido\/"/g)).toHaveLength(1);
  expect(wondergreenHtml).toContain("200-0-0");
  expect(wondergreenHtml).not.toContain("Cropper");
  expect(wondergreenHtml).not.toContain("Referencia visual del");
  expect(growCard).not.toContain("inventario, logística");

  const bloomLiquidHtml = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "2bloom-liquido", "index.html"), "utf8");
  expect(bloomLiquidHtml).toContain("2BLOOM líquido 30-80-30");
  expect(bloomLiquidHtml).toContain("Formato por consultar");
  expect(bloomLiquidHtml).not.toContain("Portafolio técnico");
  expect(bloomLiquidHtml).not.toContain("Presentaciones en catálogo comercial");
  expect(bloomLiquidHtml).not.toContain("Disponible bajo validación de suministro");
});

test("five preregistered bioinput routes preserve documentation-first guidance at every breakpoint", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One viewport matrix is sufficient for this route-level regression.");
  const candidates = products.filter((product) => [
    "bioinsumo-bacillus-subtilis",
    "bioinsumo-beauveria",
    "bioinsumo-metarhizium",
    "bioinsumo-ajo-aji",
    "bioinsumo-neem",
  ].includes(product.slug));
  const viewports = [1440, 1024, 768, 390, 320];

  expect(candidates).toHaveLength(5);
  for (const width of viewports) {
    await page.setViewportSize({ width, height: width <= 390 ? 900 : 1000 });
    for (const product of candidates) {
      await page.goto(`/wondergreen/productos/${product.slug}/`);
      await expect(page.locator("h1")).toHaveText(product.name);
      await expect(page.locator("#papel")).toContainText("Qué confirmar antes de considerarlo");
      await expect(page.locator("#aplicacion")).toContainText("No se publican cultivos recomendados");
      await expect(page.locator("#aplicacion .product-crop-pill")).toHaveCount(0);
      await expect(page.locator('a[href="https://croper.com/provider/1231-greenatics"]')).toHaveCount(1);
      await expect(page.locator('a[href^="/contacto/?interes=wondergreen"]')).toHaveCount(1);
      expect(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))).toBeLessThanOrEqual(width);
      if (process.env.MI_A195_CAPTURE === "1" && product.slug === "bioinsumo-bacillus-subtilis" && [1440, 768, 390].includes(width)) {
        await page.screenshot({ path: testInfo.outputPath(`bacillus-${width}.png`), fullPage: true });
      }
      if (process.env.MI_A195_CAPTURE === "1" && product.slug === "bioinsumo-ajo-aji" && [1440, 390].includes(width)) {
        await page.screenshot({ path: testInfo.outputPath(`ajo-aji-${width}.png`), fullPage: true });
      }
    }
  }
});

test("Wondergreen keeps its marketplace action in the hero and explains agronomic guidance", async () => {
  const htmlPath = path.join(process.cwd(), "out", "wondergreen", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8").replaceAll("&amp;", "&");
  const storeUrl = "https://croper.com/provider/1231-greenatics";
  expect(html).toContain(`href="${storeUrl}" target="_blank" rel="noopener noreferrer">Comprar en Croper`);
  expect(html).toContain("La fórmula es el inicio. El cultivo define la decisión.");
  expect(html).toContain("Conocer el acompañamiento agronómico");
  expect(html).toContain("Las imágenes de envase ayudan a reconocer las líneas; consulta la ficha y confirma con nuestro equipo la presentación y la etiqueta vigentes.");
  expect(html).not.toContain("Dos formas de avanzar con Wondergreen.");
});

test("the Wondergreen catalogue routes visitors from product families directly to Croper", async () => {
  const htmlPath = path.join(process.cwd(), "out", "biblioteca", "catalogo-wondergreen", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8").replaceAll("&amp;", "&");
  const storeUrl = "https://croper.com/provider/1231-greenatics";

  expect(html).toContain("Empieza por lo que necesitas atender");
  expect(html).toContain("cuatro líneas sólidas, cinco formulaciones líquidas y seis referencias de bioinsumos");
  expect(html).toContain(`href="${storeUrl}" target="_blank" rel="noopener noreferrer">Comprar en la tienda Greenatics de Croper`);
  expect(html).toContain("(se abre en una pestaña nueva)");
  expect(html).not.toContain("Cropper");
});

test("Wondergreen landing export preserves the lean hierarchy and direct family access", async () => {
  const htmlPath = path.join(process.cwd(), "out", "wondergreen", "index.html");
  expect(fs.existsSync(htmlPath), "the Wondergreen landing must exist in the static export").toBe(true);
  const html = fs.readFileSync(htmlPath, "utf8");

  expect(html).toContain("Wondergreen: nutrición para el suelo y el cultivo.");
  expect(html).toContain("200-0-0 es la de mayor concentración de nitrógeno");
  expect(html).not.toContain("High N");
  expect(html).toContain('aria-label="Wondergreen: cuatro familias de producto"');
  for (const image of [
    "/products/wondergreen-line-compost.jpg",
    "/products/wondergreen-line-2grow.jpg",
    "/products/wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg",
    "/products/wondergreen-cropper-ref-bioinput-bacillus-subtilis.jpg",
  ]) {
    expect(html).toContain(`src="${image}"`);
  }
  expect(html).not.toContain("Cropper");
  expect(html).toContain('href="https://croper.com/provider/1231-greenatics"');
  expect(html).toContain("Comprar en Croper");
  expect(html).toContain("id=\"productos\"");
  expect(html).toContain("id=\"compost\"");
  expect(html).toContain("/wondergreen/productos/compost/");
  expect(html).toContain("/wondergreen/cultivos/");
  expect(html).toContain("Fichas y documentos para decidir con contexto.");
  expect(html).not.toMatch(/reduc(?:ir|e|en) pérdidas/i);
  expect(html).toContain("La disponibilidad que alcanza el cultivo depende del suelo");
  expect(html).toContain("productor en Yarumal de fertilizantes");
  expect(html).toContain("inorgánicos sólidos (mezclas físicas)");
  expect(html).toContain("no equivale al registro de venta de cada producto");
  expect(html).toContain('href="https://www.ica.gov.co/getdoc/90935cf8-c4c1-4093-85ad-5ad06fbfda5d/base_de_datos_empresas.aspx"');
  expect(html).toContain("La fórmula es el inicio. El cultivo define la decisión.");
  expect(html).toContain("Para orientarte, cuéntanos qué cultivas");
  expect(html).not.toContain("wg-v4-guidance__steps");
  expect(html).not.toContain("Comparte lo que conoces");
  expect(html).toContain("wg-v4-guidance__visual");
  expect(html).toContain("Conocer el acompañamiento agronómico");
  expect(html).toContain("Solicitar orientación para mi lote");
  expect(html).not.toContain("Producción y formulación desde la planta Greenatics.");
  expect(html.match(/href="\/wondergreen\/ciencia\/"/g)).toHaveLength(1);
  expect(html.match(/href="\/biblioteca\/catalogo-wondergreen\/"/g)).toHaveLength(2);
  expect(html.match(/class="wg-docs__actions"/g)).toHaveLength(3);
  expect(html).not.toContain("Cinco lecturas antes de convertir una fórmula en recomendación");
  expect(html).not.toContain("4 familias");
  expect(html).not.toContain("12 cultivos");
});

test("public soil-and-plant imagery uses customer-facing captions instead of production notes", () => {
  const about = fs.readFileSync(path.join(process.cwd(), "out", "nosotros", "index.html"), "utf8");
  const catalog = fs.readFileSync(path.join(process.cwd(), "out", "biblioteca", "catalogo-wondergreen", "index.html"), "utf8");

  expect(about).toContain("Del proceso al cultivo");
  expect(about).not.toContain("Imagen editorial conceptual de raíces y suelo");
  expect(catalog).toContain("La nutrición empieza por comprender el suelo y lo que necesita el cultivo.");
  expect(catalog).not.toContain("Imagen editorial del sistema suelo-planta.");
});

test("editorial family images are visible without being promoted to product packshots", async () => {
  const publicDir = path.join(process.cwd(), "public");
  const expected = [
    ["2grow", "/products/wondergreen-line-2grow.jpg"],
    ["2balance", "/products/wondergreen-line-2balance.jpg"],
    ["2bloom", "/products/wondergreen-line-2bloom.jpg"],
    ["2fruit", "/products/wondergreen-line-2fruit.jpg"],
    ["compost", "/products/wondergreen-line-compost.jpg"],
    ["bioinsumos", "/products/wondergreen-line-bioinsumos-v2.jpg"],
  ] as const;

  for (const [slug, src] of expected) {
    const media = getProductMedia(slug);
    expect(media.status, `${slug} remains pending Product Truth`).toBe("PENDING_PRODUCT_TRUTH");
    expect(media.editorial?.src).toBe(src);
    expect(fs.existsSync(path.join(publicDir, src.slice(1))), `${src} exists`).toBe(true);
    expect(getPublicProductImage(slug), `${slug} must not expose editorial art as a packshot`).toBeUndefined();
  }

  const landing = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "index.html"), "utf8");
  for (const src of [
    "/products/wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg",
    "/products/wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg",
    "/products/wondergreen-line-compost.jpg",
    "/products/wondergreen-line-bioinsumos-v2.jpg",
  ]) expect(landing).toContain(src);
  expect(landing).toContain("Cada formulación se orienta a una etapa distinta; confirma concentración, uso y condiciones en la ficha vigente.");
  expect(landing).not.toContain("Integrar biología y seguimiento al manejo de cada cultivo.");
  expect(landing).not.toContain("Escena editorial");

  for (const [slug, src] of expected) {
    const detail = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", slug, "index.html"), "utf8");
    if (slug === "compost") {
      expect(detail, "Compost detail uses its editorial soil image").toContain(src);
      expect(detail).toContain("Materia orgánica estabilizada para suelo y sustrato.");
      expect(detail).not.toContain("wondergreen-cropper-ref-compost-5kg");
      expect(detail).not.toContain("Referencia visual · no es packshot vigente confirmado");
      continue;
    }

    if (["2grow", "2balance", "2bloom", "2fruit"].includes(slug)) {
      expect(detail, `${slug} detail uses its family cultivation image`).toContain(src);
      expect(detail).toContain("Nutrición según cultivo, etapa y manejo del lote.");
      expect(detail).not.toContain("Referencia visual · no es packshot vigente confirmado");
      continue;
    }

    if (getProductMedia(slug).candidate?.status === "CANDIDATE_LOCAL") {
      const media = getProductMedia(slug);
      expect(detail).toContain(`src="${media.candidate?.src}"`);
      expect(detail).toContain("2FRUIT 30-30-80 · envase de 1 L");
      expect(detail).not.toContain(`src="${media.reference?.src}"`);
      expect(getPublicProductImage(slug)).toBeUndefined();
    } else if (getProductMedia(slug).reference) {
      const media = getProductMedia(slug).reference
        ? getProductMedia(slug)
        : getProductMedia(`${slug}-solido-40kg`);
      expect(media.reference, `${slug} uses its Cropper visual`).toBeDefined();
      expect(detail).toContain(`src="${media.reference?.src}"`);
      expect(detail).toContain("Consulta la presentación disponible");
      expect(detail).toContain("Te confirmamos el envase, la etiqueta y la disponibilidad vigentes de esta formulación.");
      expect(detail).not.toContain("Cropper");
    } else {
      expect(detail, `${slug} detail uses its editorial family visual`).toContain(src);
      expect(detail).toContain(slug === "bioinsumos" || slug.startsWith("bioinsumo-")
        ? "Biología para acompañar el manejo del cultivo."
        : "Nutrición según cultivo, etapa y manejo del lote.");
    }
  }

  const beauveriaHtml = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "bioinsumo-beauveria", "index.html"), "utf8");
  const bioinputComparison = beauveriaHtml.match(/<div class="product-related-grid">([\s\S]*?)<\/div><div class="product-related-actions">/)?.[1] ?? "";
  expect(bioinputComparison).not.toContain('/wondergreen/productos/bioinsumos/');
  expect(bioinputComparison).toContain('/wondergreen/productos/bioinsumo-ajo-aji/');
});

test("Cropper source records cover Compost, four solids, five liquid formulations and six bioinputs", async () => {
  const publicDir = path.join(process.cwd(), "public");
  const references = [
    ["compost", "/products/wondergreen-cropper-ref-compost-40kg.webp"],
    ["2grow-solido-40kg", "/products/wondergreen-cropper-ref-2grow-solid-40kg.webp"],
    ["2balance-solido-40kg", "/products/wondergreen-cropper-ref-2balance-solid-40kg.webp"],
    ["2bloom-solido-40kg", "/products/wondergreen-cropper-ref-2bloom-solid-40kg.webp"],
    ["2fruit-solido-40kg", "/products/wondergreen-cropper-ref-2fruit-solid-40kg.webp"],
    ["2grow-liquido", "/products/wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg"],
    ["2grow-liquido-200-0-0", "/products/wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg"],
    ["2balance-liquido", "/products/wondergreen-cropper-ref-2balance-liquid.jpg"],
    ["2bloom-liquido", "/products/wondergreen-cropper-ref-2bloom-liquid.jpg"],
    ["2fruit-liquido", "/products/wondergreen-cropper-ref-2fruit-liquid.jpg"],
    ["bioinsumo-ajo-aji", "/products/wondergreen-cropper-ref-bioinput-ajo-aji.jpg"],
    ["bioinsumo-neem", "/products/wondergreen-cropper-ref-bioinput-neem.jpg"],
    ["bioinsumo-beauveria", "/products/wondergreen-cropper-ref-bioinput-beauveria.jpg"],
    ["bioinsumo-metarhizium", "/products/wondergreen-cropper-ref-bioinput-metarhizium.jpg"],
    ["bioinsumo-bacillus-subtilis", "/products/wondergreen-cropper-ref-bioinput-bacillus-subtilis.jpg"],
    ["bioinsumo-trichoderma", "/products/wondergreen-cropper-ref-bioinput-trichoderma.jpg"],
  ] as const;

  const compost = getProductMedia("compost");
  expect(compost.editorial?.src).toBe("/products/wondergreen-line-compost.jpg");
  expect(compost.reference?.note).toContain("Empaque Wondergreen Compost de 40 kg aprobado para revisión visual en la candidata local");
  expect(compost.reference?.note).toContain("consulta precio y disponibilidad con el equipo");

  for (const slug of ["2grow-liquido", "2balance-liquido", "2bloom-liquido", "2fruit-liquido"]) {
    const media = getProductMedia(slug);
    const candidates = media.candidateVariants ?? (media.candidate ? [media.candidate] : []);
    expect(candidates.length, `${slug} candidate packshots remain local-only`).toBeGreaterThan(0);
    expect(getPublicProductImage(slug)).toBeUndefined();
    for (const candidate of candidates) {
      expect(candidate.status).toBe("CANDIDATE_LOCAL");
      expect(fs.existsSync(path.join(publicDir, candidate.src.slice(1))), `${candidate.src} exists`).toBe(true);
    }
  }

  for (const [slug, src] of references) {
    const media = getProductMedia(slug);
    expect(media.status).toBe("PENDING_PRODUCT_TRUTH");
    expect(getPublicProductImage(slug)).toBeUndefined();
    expect(fs.existsSync(path.join(publicDir, src.slice(1))), `${src} exists`).toBe(true);
    if (slug === "bioinsumo-trichoderma") {
      expect(media.reference, "the unverified species label is not exposed as a public reference").toBeUndefined();
      expect(media.note).toMatch(/especie aún no reconciliada/i);
      const detail = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "bioinsumo-trichoderma", "index.html"), "utf8");
      expect(detail).not.toContain(src);
      expect(detail).not.toMatch(/Trichoderma harzianum/i);
      continue;
    }

    expect(media.reference?.src, `${slug} maps to its Cropper reference`).toBe(src);
    if (slug !== "2grow-liquido-200-0-0") {
      const routeSlug = slug.endsWith("-solido-40kg") ? slug.replace("-solido-40kg", "") : slug;
      const detail = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", routeSlug, "index.html"), "utf8");
      if (slug === "compost") {
        expect(detail, "Compost detail uses editorial soil imagery, not its 5 kg historical reference").toContain("/products/wondergreen-line-compost.jpg");
        expect(detail).not.toContain(`src="${src}"`);
        expect(detail).not.toContain("Referencia visual · no es packshot vigente confirmado");
      } else if (slug.endsWith("-solido-40kg")) {
        expect(detail, `${routeSlug} ficha uses its cultivation image`).toContain(`/products/wondergreen-line-${routeSlug}.jpg`);
        expect(detail).not.toContain(`src="${src}"`);
      } else if (slug === "2fruit-liquido") {
        expect(detail, `${routeSlug} ficha uses the current local 1 L candidate`).toContain("/products/wondergreen-2fruit-liquid-v2-1l-candidate.jpg");
        expect(detail).toContain("La ficha comercial contempla cinco formatos; el equipo confirma presentación y disponibilidad.");
        expect(detail).not.toContain(`src="${src}"`);
      } else if (["2grow-liquido", "2balance-liquido", "2bloom-liquido"].includes(slug)) {
        const candidates = media.candidateVariants ?? (media.candidate ? [media.candidate] : []);
        expect(candidates.length, `${slug} has a local V2 candidate`).toBeGreaterThan(0);
        for (const candidate of candidates) expect(detail).toContain(candidate.src);
        expect(detail).not.toContain(`src="${src}"`);
        expect(detail).not.toMatch(/itemtype="https:\/\/schema\.org\/Product"[^>]*>[\s\S]*?wondergreen-2(?:grow|balance|bloom)-liquid-v2/);
      } else if (media.editorial) {
        expect(detail, `${routeSlug} ficha uses its current editorial image`).toContain(`src="${media.editorial.src}"`);
        expect(detail).not.toContain(`src="${src}"`);
      } else {
        expect(detail, `${routeSlug} ficha must render its reference`).toContain(`src="${src}"`);
        expect(detail).not.toContain("Cropper");
      }
    }
  }

  const landing = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "index.html"), "utf8");
  for (const image of [
    "/products/wondergreen-line-2grow.jpg",
    "/products/wondergreen-line-2balance.jpg",
    "/products/wondergreen-line-2bloom.jpg",
    "/products/wondergreen-line-2fruit.jpg",
  ]) expect(landing).toContain(image);
  expect(landing).not.toContain("/products/wondergreen-cropper-ref-2fruit-liquid.jpg");
  expect(landing).toContain("/products/wondergreen-line-bioinsumos-v2.jpg");
  for (const [, src] of references.slice(10, 15)) expect(landing).not.toContain(src);
  expect(landing).toContain("Trichoderma");
  expect(landing).not.toContain(references[15][1]);
  expect(landing).not.toMatch(/Trichoderma harzianum/i);
  expect(landing).toContain("Especie, ficha, etiqueta y alcance autorizado por confirmar.");
  const catalog = fs.readFileSync(path.join(process.cwd(), "out", "biblioteca", "catalogo-wondergreen", "index.html"), "utf8");
  expect(catalog).toContain("Especie por confirmar");
  expect(catalog).not.toContain(references[15][1]);
  expect(catalog).not.toMatch(/Trichoderma harzianum/i);
  for (const [slug] of references.slice(1, 5)) {
    const family = slug.replace("-solido-40kg", "");
    expect(landing).toContain(`/products/wondergreen-line-${family}.jpg`);
    expect(landing).not.toContain(`/products/wondergreen-cropper-ref-${family}-solid.jpg`);
  }
  const solidDetail = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "2grow", "index.html"), "utf8");
  expect(solidDetail).toContain("/products/wondergreen-line-2grow.jpg");
  expect(landing).not.toContain("Cropper");
});

test("product comparisons and portfolio cards use cultivation imagery for solid families", async () => {
  const related = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "2balance", "index.html"), "utf8");
  const portfolio = fs.readFileSync(path.join(process.cwd(), "out", "portafolio", "wondergreen", "index.html"), "utf8");

  for (const image of [
    "/products/wondergreen-line-2grow.jpg",
    "/products/wondergreen-line-2bloom.jpg",
    "/products/wondergreen-line-2fruit.jpg",
  ]) {
    expect(related).toContain(`src="${image}"`);
  }
  expect(related).not.toContain("wondergreen-cropper-ref-2grow-solid.jpg");
  for (const image of [
    "/products/wondergreen-line-2grow.jpg",
    "/products/wondergreen-line-liquidos.jpg",
    "/products/wondergreen-line-bioinsumos-v2.jpg",
  ]) {
    expect(portfolio).toContain(`src="${image}"`);
  }
  expect(portfolio).toContain('href="/biblioteca/catalogo-wondergreen/#familias"');
  expect(portfolio).not.toContain('class="portfolio-v5-products"');
  expect(getPublicProductImage("2grow")).toBeUndefined();
});

test("editorial comparison-card images load without changing their packshot status", async ({ page }) => {
  await page.goto("/wondergreen/productos/2balance/");
  const comparisonImages = page.locator(".product-related-card__media img");
  await expect(comparisonImages).toHaveCount(3);
  await comparisonImages.evaluateAll((images) => {
    for (const image of images) (image as HTMLImageElement).loading = "eager";
  });
  await expect.poll(() => comparisonImages.evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
});

test("Wondergreen catalog combines family navigation and disclosure without a duplicate index", async () => {
  const htmlPath = path.join(process.cwd(), "out", "biblioteca", "catalogo-wondergreen", "index.html");
  const homePath = path.join(process.cwd(), "out", "index.html");
  expect(fs.existsSync(htmlPath), "the Wondergreen catalog export must exist").toBe(true);
  const html = fs.readFileSync(htmlPath, "utf8");
  const home = fs.readFileSync(homePath, "utf8");
  const familyCount = (html.match(/class="wg-catalog-family wg-catalog-family--/g) ?? []).length;

  expect(home).toContain('href="/biblioteca/catalogo-wondergreen/">Abrir catálogo Wondergreen</a>');
  expect(fs.existsSync(path.join(process.cwd(), "out", "wondergreen", "productos", "index.html"))).toBe(false);
  expect(html).toContain('href="#familias"');
  expect(html).toContain('id="familias"');
  expect(familyCount).toBe(4);
  expect(html).toContain("5 formulaciones");
  expect(html).toContain("4 líneas");
  expect(html).toContain("6 referencias");
  expect(html).not.toContain("Cropper");
  expect(html).not.toContain("4 referencias</span>");
  expect(html).not.toContain("wg-catalog-index__grid");
  expect(html).toContain("Compara la función de cada familia, revisa sus referencias y abre la ficha técnica");
  expect(html).not.toContain("Escena editorial · no es empaque</figcaption>");
  const compostFamilyStart = html.indexOf('id="familia-compost"');
  const compostSummaryEnd = html.indexOf("</summary>", compostFamilyStart);
  const compostSummary = html.slice(compostFamilyStart, compostSummaryEnd);
  expect(compostFamilyStart).toBeGreaterThan(-1);
  expect(compostSummary).toContain("wondergreen-cropper-ref-compost-40kg.webp");
  expect(compostSummary).toContain("Empaque Wondergreen Compost, acondicionador orgánico del suelo, presentación de 40 kg.");
  expect(html).toContain("Una misma línea, dos concentraciones.");
  expect(html).toContain("2GROW 100-20-20 y 2GROW 200-0-0");
  expect(html.replaceAll("<!-- -->", "")).toContain("2GROW 100-20-20: 1 L · 3,75 L · 20 L · 200 L · 1.000 L. 2GROW 200-0-0: formato y suministro por consultar.");
  expect(html).toContain("Seis referencias cuyo alcance se confirma en la ficha, etiqueta y registro vigentes.");
  const bioinputFamilyStart = html.indexOf('id="familia-bioinsumos"');
  const bioinputFamilyEnd = html.indexOf("</details>", bioinputFamilyStart);
  expect(bioinputFamilyStart).toBeGreaterThan(-1);
  expect(bioinputFamilyEnd).toBeGreaterThan(bioinputFamilyStart);
  expect(html.slice(bioinputFamilyStart, bioinputFamilyEnd)).not.toMatch(/suelo activo|desarrollo radicular|aplicación dirigida|acompañamiento preventivo|programas definidos por cultivo|Todos los cultivos|Drench|Fertirriego/i);
  expect(html).toContain('aria-label="Productos de Fertilizantes sólidos"');
  expect(html).toContain("Presentaciones:");
  expect(html).toContain("Las imágenes ayudan a reconocer cada línea; consulta la ficha y confirma con nuestro equipo la presentación y la etiqueta vigentes.");
  expect(html).toContain("Las imágenes disponibles identifican las referencias; Trichoderma se muestra con nombre genérico hasta confirmar su ficha y etiqueta vigentes.");
  for (const image of [
    "wondergreen-cropper-ref-compost-40kg.webp",
    "wondergreen-cropper-ref-2grow-solid-40kg.webp",
    "wondergreen-cropper-ref-2balance-solid-40kg.webp",
    "wondergreen-cropper-ref-2bloom-solid-40kg.webp",
    "wondergreen-cropper-ref-2fruit-solid-40kg.webp",
    "wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg",
    "wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg",
    "wondergreen-cropper-ref-2balance-liquid.jpg",
    "wondergreen-cropper-ref-2bloom-liquid.jpg",
    "wondergreen-cropper-ref-2fruit-liquid.jpg",
    "wondergreen-cropper-ref-bioinput-ajo-aji.jpg",
    "wondergreen-cropper-ref-bioinput-neem.jpg",
    "wondergreen-cropper-ref-bioinput-beauveria.jpg",
    "wondergreen-cropper-ref-bioinput-metarhizium.jpg",
    "wondergreen-cropper-ref-bioinput-bacillus-subtilis.jpg",
  ]) expect(html, `${image} is visible from its catalog reference`).toContain(image);
  expect(html).toContain("Especie por confirmar");
  expect(html).not.toContain("wondergreen-cropper-ref-bioinput-trichoderma.jpg");
  expect(html).not.toContain("Cropper");
  expect(html).toContain(">100-20-20</figcaption>");
  expect(html).toContain(">200-0-0</figcaption>");
});

test("Wondergreen family disclosures open the matching product references", async ({ page }, testInfo) => {
  const widths = process.env.MI_A195_CAPTURE === "1" ? [1440, 768, 390] : [1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 390 ? 900 : 1000 });
    await page.goto("/biblioteca/catalogo-wondergreen/");

    const solidsFamily = page.locator("#familia-solidos");
    await expect(solidsFamily.locator("summary")).toBeVisible();
    await solidsFamily.locator("summary").click();
    await expect(solidsFamily).toHaveAttribute("open", "");
    await expect(solidsFamily.locator(".wg-catalog-product")).toHaveCount(4);
    await expect(solidsFamily).toContainText("2GROW");
    await expect(solidsFamily).toContainText("2BALANCE");

    await solidsFamily.locator("summary").click();
    await expect(solidsFamily).not.toHaveAttribute("open", "");

    const bioinputsFamily = page.locator("#familia-bioinsumos");
    await bioinputsFamily.locator("summary").click();
    await expect(bioinputsFamily).toHaveAttribute("open", "");
    await expect(bioinputsFamily.locator(".wg-catalog-product")).toHaveCount(6);
    await expect(bioinputsFamily).toContainText("Seis referencias cuyo alcance se confirma en la ficha, etiqueta y registro vigentes.");
    await expect(bioinputsFamily).not.toContainText("desarrollo radicular");
    await expect(bioinputsFamily).not.toContainText("acompañamiento preventivo");
    if (process.env.MI_A195_CAPTURE === "1") {
      await page.screenshot({ path: testInfo.outputPath(`bioinput-catalog-${width}.png`), fullPage: true });
    }
  }
});

test("collapsed Wondergreen families identify validated references and holdbacks", async ({ page }) => {
  await page.goto("/biblioteca/catalogo-wondergreen/");

  for (const [family, figureCount, imageCount] of [["solidos", 4, 4], ["liquidos", 5, 5], ["bioinsumos", 6, 5]] as const) {
    const preview = page.locator(`#familia-${family} summary .wg-catalog-family__visual-grid`);
    await expect(preview, `${family} reference strip`).toBeVisible();
    await expect(preview.locator("figure")).toHaveCount(figureCount);
    await expect(preview.locator("img")).toHaveCount(imageCount);
    await expect(page.locator(`#familia-${family}`)).not.toHaveAttribute("open", "");
  }

  await expect(page.locator("#familia-bioinsumos .wg-catalog-family__visual-holdback"))
    .toContainText("Especie por confirmar");
  const liquids = page.locator("#familia-liquidos summary .wg-catalog-family__visual-grid");
  await expect(liquids).toContainText("2GROW · 100-20-20");
  await expect(liquids).toContainText("2GROW · 200-0-0");
  await expect(page.locator("#familia-compost summary .wg-catalog-family__visual-grid")).toHaveCount(0);
});

test("mobile catalog family previews give product references a full-width row", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");
  const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 680px)"));

  expect(mobileStyles).toMatch(/\.wg-catalog-family--solidos summary,[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/);
  for (const family of ["solidos", "liquidos", "bioinsumos"]) {
    expect(mobileStyles).toContain(`.wg-catalog-family--${family} .wg-catalog-family__visual-grid`);
  }
  expect(mobileStyles).toContain("grid-column: 1 / -1;");
  expect(mobileStyles).toContain("font-size: .55rem;");
  expect(mobileStyles).toContain(".wg-catalog-family--compost .wg-catalog-family__identity { grid-column: 2; grid-row: 1; }");
  expect(mobileStyles).toContain(".wg-catalog-family--compost .wg-catalog-family__count");
  expect(mobileStyles).toContain("grid-column: 2;");
  expect(mobileStyles).toContain("grid-row: 2;");
});

test("Wondergreen catalog closing actions keep a clear gap and stack on mobile", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/committee-refresh.css"), "utf8");
  const desktopRule = styles.match(/\.wg-catalog-guidance \.button-row\s*\{([^}]*)\}/)?.[1] ?? "";
  const mobileRule = styles.slice(styles.indexOf("@media (max-width: 680px)"));

  expect(desktopRule).toMatch(/display:\s*flex/);
  expect(desktopRule).toMatch(/flex-wrap:\s*wrap/);
  expect(desktopRule).toMatch(/gap:\s*12px/);
  expect(mobileRule).toMatch(/\.wg-catalog-guidance \.button-row\s*\{[^}]*flex-direction:\s*column/);
});

test("Wondergreen library uses client-facing source context instead of editorial notes", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src", "components", "wondergreen-technical-library.tsx"), "utf8");
  expect(source).toContain("Edición de agosto de 2026 para consultar el portafolio.");
  expect(source).toContain("Las cifras ofrecen contexto; la respuesta depende del cultivo y las condiciones de manejo.");
  expect(source).not.toMatch(/no usar como maestro comercial actual|no es ensayo propio|Lectura editorial · evidencia/i);
});

test("Wondergreen product and crop routes cross-link only specific, supported references", async () => {
  for (const product of products) {
    for (const label of product.crops) {
      const crop = getCropForProductLabel(label);
      if (crop) expect(crops.some((candidate) => candidate.slug === crop.slug)).toBe(true);
    }
  }

  for (const broadLabel of ["Hortalizas", "Frutales", "Viveros", "Pasifloras", "Huertas y jardín", "Todos los cultivos"]) {
    expect(getCropForProductLabel(broadLabel), `${broadLabel} must not imply a single crop`).toBeUndefined();
  }

  expect(getProductSlugForCropStageLine("Wondergreen 2GROW (15-3-3)")).toBe("2grow");
  expect(getProductSlugForCropStageLine("Wondergreen 2BLOOM (3-8-3)")).toBe("2bloom");
  expect(getProductSlugForCropStageLine("Producto por definir")).toBeUndefined();

  const coffeeProduct = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "productos", "2grow", "index.html"), "utf8");
  expect(coffeeProduct).toContain('href="/wondergreen/cultivos/cafe/"');
  const coffeeGuide = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "cultivos", "cafe", "index.html"), "utf8");
  expect(coffeeGuide).toContain('href="/wondergreen/productos/2grow/"');
  expect(coffeeGuide).toContain("Wondergreen 2GROW (15-3-3)");

  const catalogLibrary = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "index.html"), "utf8");
  expect(catalogLibrary).toContain("Edición de agosto de 2026 para consultar el portafolio.");
  expect(catalogLibrary).toContain("Abrir catálogo web vigente");
  expect(catalogLibrary).toContain("Consultar PDF · agosto 2026");
  expect(catalogLibrary).not.toContain("no usar como maestro comercial actual");
  expect(catalogLibrary).not.toContain("no es ensayo propio");
  expect(catalogLibrary).not.toContain("Lectura editorial · evidencia");
  expect(catalogLibrary).not.toContain("Referencia editorial vigente del portafolio");
});

test("Wondergreen cotizador builds quote requests for commercial references and proposed kits", () => {
  const legacyPage = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "cotizador", "index.html"), "utf8").replaceAll("&amp;", "&");
  const quoteBuilder = fs.readFileSync(path.join(process.cwd(), "src/components/quote-builder.tsx"), "utf8");
  const catalogData = fs.readFileSync(path.join(process.cwd(), "src/data/catalog.ts"), "utf8");
  const quoteChunkDirectory = path.join(process.cwd(), "out/_next/static/chunks/app/wondergreen/cotizador");
  const quoteChunks = fs.readdirSync(quoteChunkDirectory).filter((file) => file.endsWith(".js"));
  const quoteBundle = quoteChunks.map((file) => fs.readFileSync(path.join(quoteChunkDirectory, file), "utf8")).join("\n");
  expect(legacyPage).toContain('<meta name="robots" content="noindex, follow"/>');
  expect(legacyPage).toContain("Arma una lista de referencias para revisar con el equipo.");
  expect(legacyPage).toContain("Plantas Verdes");
  expect(legacyPage).toContain("Añadir a la solicitud");
  expect(legacyPage).toContain("Borrador de solicitud");
  expect(legacyPage).toContain("Enviar solicitud al equipo");
  expect(legacyPage).toContain("Greenatics validará precio, disponibilidad, cantidades y condiciones comerciales");
  expect(legacyPage).toContain('href="/wondergreen/#productos">Volver al portafolio Wondergreen</a>');
  expect(legacyPage).not.toContain("Total estimado:");
  expect(legacyPage).not.toContain("Peso estimado:");
  expect(legacyPage).not.toContain("c/u");
  expect(legacyPage).not.toContain("Estimación orientativa Greenatics");
  expect(quoteBuilder).not.toContain("priceCop");
  expect(catalogData).not.toContain("priceCop");
  expect(quoteChunks.length).toBeGreaterThan(0);
  expect(quoteBundle).not.toContain("priceCop");
  for (const historicPrice of [
    "20200", "147400", "115500", "121900", "17000", "39300", "169800", "1644600", "6259900",
    "19100", "46700", "191000", "1909800", "7214800", "18000", "44600", "6896500",
  ]) {
    expect(quoteBundle).not.toContain(historicPrice);
  }
  expect(legacyPage).not.toContain("Agendar pedido o reunión técnica");
  expect(legacyPage).toContain("No se reciben pagos, comprobantes ni pedidos confirmados");
  expect(quoteBuilder).toContain("restoredKitQuantities = { ...restoredKitQuantities, [requestedKit]: Math.max(restoredKitQuantities[requestedKit] ?? 0, 1) }");
  expect(quoteBuilder).toContain('aria-label={`${kitQuantities[kit.slug] ? "Añadir otra consulta sobre" : "Añadir consulta sobre"} ${kit.name} al borrador de cotización`}');
  expect(quoteBuilder).toContain("casaJardinKits as casaJardinV4Kits");
  expect(quoteBuilder).toContain("kit.imageAlt");
  expect(quoteBuilder).toContain("kit.secondaryPromise ?? kit.promise");
  expect(quoteBuilder).not.toContain("kit.composition.join");
  expect(quoteBuilder).not.toContain("aria-pressed={Boolean(kitQuantities[kit.slug])}");
  expect(quoteBuilder).toContain('role="group" aria-label="Filtrar catálogo"');
  expect(quoteBuilder).not.toContain('role="tablist"');
  expect(quoteBuilder).toContain('aria-pressed={isFilterActive("solido")}');
  expect(quoteBuilder).toContain("Reducir cantidad del kit ${kit.name}");
  expect(quoteBuilder).toContain("Aumentar cantidad del kit ${kit.name}");
});

test("Wondergreen catalog presents the current nine Casa & Jardín proposals and routes to review/quote", () => {
  const catalogPage = fs.readFileSync(path.join(process.cwd(), "out", "biblioteca", "catalogo-wondergreen", "index.html"), "utf8").replaceAll("&amp;", "&");
  for (const kit of ["Mi Primera Matera", "Plantas Verdes", "Plantas con Flor", "Aromáticas y Hojas", "Trasplanta y Activa", "Mi Huerta", "Casa Completa", "Casa Completa XL", "Protección de Hojas"]) {
    expect(catalogPage).toContain(kit);
  }
  expect(catalogPage).toContain("Totales propuestos:");
  expect(catalogPage).toContain('href="/casa-jardin/kits/v4/plantas-verdes/"');
  expect(catalogPage).toContain('href="/wondergreen/cotizador/?kit=plantas-verdes#kits"');
  expect(catalogPage).toContain("Solicitar revisión y cotización");
  expect(catalogPage).toContain("La solicitud no confirma una compra ni disponibilidad.");
  expect(catalogPage).not.toContain('href="/casa-jardin/kits/plantas-verdes/"');
  expect(catalogPage).toContain('href="/wondergreen/cotizador/?grupo=2grow-liquido"');
  expect(catalogPage).toContain("Elegir presentación para cotizar");
  expect(catalogPage).not.toContain('href="/wondergreen/cotizador/?grupo=2bloom-liquido"');
});

test("Wondergreen lot planner is a contextual guide, not a calculator or duplicate WhatsApp CTA", () => {
  const planner = fs.readFileSync(path.join(process.cwd(), "out", "wondergreen", "calculadora", "index.html"), "utf8").replaceAll("&amp;", "&");
  expect(planner).toContain("<h1");
  expect(planner).toContain("Organiza el lote antes de solicitar una recomendación.");
  expect(planner).toContain("Solicitar orientación para el cultivo");
  expect(planner).toContain("href=\"/contacto/?interes=wondergreen&perfil=agro&diagnostico=");
  expect(planner).not.toContain("Calculadora agronómica");
  expect(planner).not.toContain("Estima cantidades y organiza una referencia de costos");
  expect(planner).not.toContain("Abrir WhatsApp directo");
  expect(planner).not.toContain("wa.me/573003078822");
});
