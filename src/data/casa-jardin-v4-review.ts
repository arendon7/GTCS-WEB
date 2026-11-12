export type CasaJardinProductDetail = {
  slug: string;
  name: string;
  label: string;
  formula: string;
  role: string;
  prompt: string;
  context: string;
  image: string;
  imageAlt: string;
  proposedFormat: string;
  status: "catálogo identificado" | "referencia adicional por validar";
  validationNote?: string;
  technicalHref: string;
};

export const casaJardinProducts: readonly CasaJardinProductDetail[] = [
  {
    slug: "compost", name: "COMPOST", label: "Preparación de suelo y sustrato",
    formula: "Materia orgánica y acondicionamiento", role: "Prepara el suelo o sustrato antes de elegir una etapa de nutrición.",
    prompt: "Empieza por la base.", context: "Para trasplantes, materas y preparación de huertas.",
    image: "/wondergreen/v4/products/compost.jpg", imageAlt: "Bolsa rotulada COMPOST junto a una muestra de materia orgánica.", proposedFormat: "500 g propuestos en el arte V4",
    status: "catálogo identificado", technicalHref: "/wondergreen/",
  },
  {
    slug: "crece", name: "CRECE", label: "2GROW · crecimiento vegetativo",
    formula: "15-3-3", role: "Acompaña la brotación y el crecimiento vegetativo cuando la planta está activa.",
    prompt: "Lee el momento de crecimiento.", context: "Para plantas en establecimiento, brotación o crecimiento vegetativo.",
    image: "/wondergreen/v4/products/grow.jpg", imageAlt: "Bolsa rotulada 2GROW y gránulos de producto sobre fondo claro.", proposedFormat: "500 g propuestos en el arte V4",
    status: "catálogo identificado", technicalHref: "/wondergreen/productos/2grow/",
  },
  {
    slug: "equilibra", name: "EQUILIBRA", label: "2BALANCE · mantenimiento",
    formula: "7-7-7", role: "Acompaña el mantenimiento cuando la planta está estable y su condición permite nutrir.",
    prompt: "Sostén una planta estable.", context: "Para plantas estables y mantenimiento de colecciones o huertas.",
    image: "/wondergreen/v4/products/balance.jpg", imageAlt: "Bolsa rotulada 2BALANCE y gránulos de producto sobre fondo claro.", proposedFormat: "500 g propuestos en el arte V4",
    status: "catálogo identificado", technicalHref: "/wondergreen/productos/2balance/",
  },
  {
    slug: "florece", name: "FLORECE", label: "2BLOOM · transición reproductiva",
    formula: "3-8-3", role: "Acompaña la transición reproductiva y floración como parte de un manejo que también considera luz, agua y sanidad.",
    prompt: "Reconoce la transición.", context: "Para especies que muestran una transición reproductiva reconocible.",
    image: "/wondergreen/v4/products/bloom.jpg", imageAlt: "Bolsa rotulada 2BLOOM y gránulos de producto sobre fondo claro.", proposedFormat: "500 g propuestos en el arte V4",
    status: "catálogo identificado", technicalHref: "/wondergreen/productos/2bloom/",
  },
  {
    slug: "fructifica", name: "FRUCTIFICA", label: "2FRUIT · etapa productiva",
    formula: "3-3-8", role: "Acompaña el desarrollo del fruto dentro de una estrategia completa de manejo.",
    prompt: "Lee la etapa productiva.", context: "Para huertas y plantas productivas cuando forman fruto.",
    image: "/wondergreen/v4/products/fruit.jpg", imageAlt: "Bolsa rotulada 2FRUIT y gránulos de producto sobre fondo claro.", proposedFormat: "500 g propuestos en el arte V4",
    status: "catálogo identificado", technicalHref: "/wondergreen/productos/2fruit/",
  },
  {
    slug: "humic", name: "Sustancias Húmicas", label: "Referencia adicional",
    formula: "Composición por validar", role: "La ficha V4 propone esta referencia; su identidad técnica, presentación y uso deben confirmarse antes de recomendarla.",
    prompt: "Consulta si la referencia corresponde a tu caso.", context: "No se publican composición, dosis, compatibilidades ni efectos para esta propuesta.",
    image: "/wondergreen/v4/products/humic.jpg", imageAlt: "Frasco con una etiqueta de Sustancias Húmicas junto a una muestra líquida.", proposedFormat: "250 mL propuestos en el arte V4",
    status: "referencia adicional por validar", technicalHref: "/wondergreen/",
  },
  {
    slug: "potash", name: "Jabón Potásico", label: "Referencia adicional",
    formula: "Composición por validar", role: "La ficha V4 propone este nombre; SKU, etiqueta, condición de uso y disponibilidad requieren validación.",
    prompt: "Confirma la referencia antes de decidir.", context: "No se atribuye control de plagas, dosis, frecuencia o compatibilidad.",
    image: "/wondergreen/v4/products/potash.jpg", imageAlt: "Frasco con una etiqueta de Jabón Potásico junto a una muestra líquida.", proposedFormat: "250 mL propuestos en el arte V4",
    status: "referencia adicional por validar", validationNote: "Product Truth V0.2 no confirma esta referencia. Antes de incorporarla se deben validar el SKU, la etiqueta vigente y su condición de uso.", technicalHref: "/wondergreen/",
  },
  {
    slug: "neem", name: "Extracto de Neem", label: "Portafolio técnico · suministro por validar",
    formula: "Composición por validar", role: "Extracto de Neem figura en el portafolio técnico; esta ficha V4 no confirma etiqueta, uso, presentación ni disponibilidad.",
    prompt: "Revisa la ficha técnica vigente.", context: "No se publica un blanco biológico, una eficacia ni un protocolo de aplicación.",
    image: "/wondergreen/v4/products/neem.jpg", imageAlt: "Frasco con etiqueta Neem junto a una muestra líquida.", proposedFormat: "250 mL propuestos en el arte V4",
    status: "referencia adicional por validar", validationNote: "Product Truth V0.2 incluye Neem en el portafolio técnico y enumera formatos de 1, 5 y 20 L para bioinsumos. El arte V4 propone 250 mL; el formato y suministro requieren conciliación.", technicalHref: "/wondergreen/",
  },
] as const;

export function getCasaJardinProduct(slug: string) {
  return casaJardinProducts.find((product) => product.slug === slug);
}

export type CasaJardinKitComponent = {
  productSlug: string;
  quantity: number;
};

export type CasaJardinKitDetail = {
  slug: string;
  name: string;
  audience: string;
  promise: string;
  secondaryPromise?: string;
  approvedDoseClaims?: readonly { title: string; copy: string }[];
  image: string;
  imageAlt: string;
  composition: readonly CasaJardinKitComponent[];
  proposedTotals: string;
  accessories: readonly string[];
  note: string;
  editorialStory?: { eyebrow: string; title: string; intro: string; moments: readonly { label: string; title: string; copy: string; href: string; linkLabel: string }[]; closing: string };
};

const kitRows: readonly Omit<CasaJardinKitDetail, "composition">[] = [
  { slug: "mi-primera-matera", name: "Mi Primera Matera", audience: "Para empezar con plantas en matera", promise: "Una ruta sencilla para observar suelo, etapa y condición antes de elegir.", image: "/wondergreen/v4/kits/mi-primera-matera.jpg", imageAlt: "Arte de referencia de Mi Primera Matera, con una escena de cuidado de plantas en maceta y presentaciones propuestas Wondergreen.", proposedTotals: "2 bolsas · 1 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "La matriz de componentes y sus presentaciones son una propuesta V4; confírmalas antes de comprar o aplicar." },
  { slug: "plantas-verdes", name: "Plantas Verdes", audience: "Follaje, interior y exterior", promise: "Nutrición equilibrada para hojas fuertes y verdes.", secondaryPromise: "Hogares más verdes, plantas más felices.", image: "/wondergreen/v4/kits/plantas-verdes.jpg", imageAlt: "Arte de referencia de Plantas Verdes, con follaje y presentaciones propuestas de productos Wondergreen.", proposedTotals: "3 bolsas · 1,5 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "Cada referencia corresponde a una etapa distinta; la matriz V4 no prescribe aplicarlas juntas.", editorialStory: { eyebrow: "Una ruta para el follaje", title: "Crece cuando lo necesita. Equilibra cuando está estable.", intro: "El kit reúne dos momentos distintos del cuidado. Observa cada planta por separado: una colección puede tener brotes nuevos y ejemplares estables al mismo tiempo.", moments: [{ label: "CRECIMIENTO ACTIVO", title: "CRECE · 2GROW 15-3-3", copy: "Fertilizante sólido organomineral ocluido para acompañar establecimiento, brotación y crecimiento vegetativo. Su matriz aporta materia orgánica y está orientada a favorecer una liberación gradual; el comportamiento depende del suelo o sustrato, el agua y el manejo.", href: "/casa-jardin/productos/crece/", linkLabel: "Conocer CRECE" }, { label: "PLANTA ESTABLE", title: "EQUILIBRA · 2BALANCE 7-7-7", copy: "Una formulación para nutrición balanceada y mantenimiento. Elige esta etapa cuando la planta ya está estable y su condición permite nutrir; la etiqueta vigente define dosis y frecuencia.", href: "/casa-jardin/productos/equilibra/", linkLabel: "Conocer EQUILIBRA" }], closing: "Si hay marchitez, amarillamiento, raíces comprometidas o un trasplante reciente, revisa primero luz, agua, sustrato y drenaje. No apliques todas las referencias como una mezcla: cada planta pide una lectura propia." } },
  { slug: "plantas-con-flor", name: "Plantas con Flor", audience: "Ornamentales en transición", promise: "Nutrición y cuidado para floraciones más abundantes.", secondaryPromise: "Más flores, hogares más vivos.", approvedDoseClaims: [{ title: "Dilución del atomizador · 1:10", copy: "Mezcla 1 parte de producto con 10 partes de agua." }, { title: "Límite anual de fertilizante", copy: "La suma anual de fertilizante no debe superar el 10% del peso del suelo o sustrato. En 1 kg de suelo o sustrato, equivale a un máximo de 100 g al año." }], image: "/wondergreen/v4/kits/plantas-con-flor.jpg", imageAlt: "Arte de referencia de Plantas con Flor, con vegetación en flor y presentaciones propuestas de productos Wondergreen.", proposedTotals: "3 bolsas · 1,5 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "La composición ilustrada y sus presentaciones son propuestas V4; verifica el armado final." },
  { slug: "aromaticas-y-hojas", name: "Aromáticas y Hojas", audience: "Aromáticas y plantas de follaje", promise: "Una ruta para revisar sustrato, crecimiento y estado general.", image: "/wondergreen/v4/kits/aromaticas-y-hojas.jpg", imageAlt: "Arte de referencia de Aromáticas y Hojas, con hierbas y presentaciones propuestas de productos Wondergreen.", proposedTotals: "3 bolsas · 1,5 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "Las referencias, cantidades y presentaciones requieren confirmación técnica y comercial." },
  { slug: "trasplanta-y-activa", name: "Trasplanta y Activa", audience: "Plantas recién trasplantadas", promise: "Revisa raíces, drenaje y humedad antes de decidir el siguiente paso.", image: "/wondergreen/v4/kits/trasplanta-y-activa.jpg", imageAlt: "Arte de referencia de Trasplanta y Activa, con una planta en cambio de recipiente y presentaciones propuestas Wondergreen.", proposedTotals: "2 bolsas · 1 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "La matriz V4 no establece una dosis ni un protocolo universal de trasplante." },
  { slug: "mi-huerta", name: "Mi Huerta", audience: "Aromáticas y plantas productivas", promise: "Observa cada etapa desde la preparación del sustrato hasta la formación de frutos.", secondaryPromise: "Cultiva tu huerta en casa, desde el suelo hasta el fruto.", approvedDoseClaims: [{ title: "Dilución del atomizador · 1:10", copy: "Mezcla 1 parte de producto con 10 partes de agua." }, { title: "Límite anual de fertilizante", copy: "La suma anual de fertilizante no debe superar el 10% del peso del suelo o sustrato. En 1 kg de suelo o sustrato, equivale a un máximo de 100 g al año." }], image: "/wondergreen/v4/kits/mi-huerta.jpg", imageAlt: "Arte de referencia de Mi Huerta, con una huerta doméstica y presentaciones propuestas de productos Wondergreen.", proposedTotals: "4 bolsas · 2 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "El arte incluye una bolsa de EQUILIBRA que no aparece en la matriz propuesta. Confirma contenido, presentaciones y arte antes de cerrar el armado." },
  { slug: "casa-completa", name: "Casa Completa", audience: "Hogares con plantas en etapas distintas", promise: "Organiza una colección para que cada planta se lea por separado.", image: "/wondergreen/v4/kits/casa-completa.jpg", imageAlt: "Arte de referencia de Casa Completa, con varias plantas y presentaciones propuestas de productos Wondergreen.", proposedTotals: "5 bolsas · 2,5 kg total; 2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "La imagen y la matriz pueden diferir; cantidades, referencias y presentación deben conciliarse." },
  { slug: "casa-completa-xl", name: "Casa Completa XL", audience: "Colecciones y jardines pequeños", promise: "Una propuesta ampliada para necesidades recurrentes, definida planta por planta.", image: "/wondergreen/v4/kits/casa-completa-xl.jpg", imageAlt: "Arte de referencia de Casa Completa XL, con una colección ampliada de plantas y presentaciones propuestas Wondergreen.", proposedTotals: "10 bolsas · 5 kg total; 4 frascos · 1 L total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "El armado XL y su arte requieren conciliación SKU por SKU antes de ofrecerse." },
  { slug: "proteccion-de-hojas", name: "Protección de Hojas", audience: "Cuidado foliar por definir", promise: "Una propuesta para revisar con el equipo técnico antes de seleccionar una referencia.", image: "/wondergreen/v4/kits/proteccion-de-hojas.jpg", imageAlt: "Arte de referencia de Protección de Hojas, con productos botánicos propuestos y vegetación de hojas.", proposedTotals: "2 frascos · 500 mL total", accessories: ["1 atomizador verde", "1 bolsa exterior de fique"], note: "El arte V4 muestra productos adicionales que no aparecen en la matriz prevista de dos frascos. Confirma el contenido y las presentaciones antes de cerrar la composición." },
];

const kitComponents: Readonly<Record<string, readonly CasaJardinKitComponent[]>> = {
  "mi-primera-matera": [{ productSlug: "compost", quantity: 1 }, { productSlug: "equilibra", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "plantas-verdes": [{ productSlug: "compost", quantity: 1 }, { productSlug: "crece", quantity: 1 }, { productSlug: "equilibra", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "plantas-con-flor": [{ productSlug: "compost", quantity: 1 }, { productSlug: "equilibra", quantity: 1 }, { productSlug: "florece", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "aromaticas-y-hojas": [{ productSlug: "compost", quantity: 1 }, { productSlug: "crece", quantity: 1 }, { productSlug: "equilibra", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "trasplanta-y-activa": [{ productSlug: "compost", quantity: 1 }, { productSlug: "crece", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "mi-huerta": [{ productSlug: "compost", quantity: 1 }, { productSlug: "crece", quantity: 1 }, { productSlug: "florece", quantity: 1 }, { productSlug: "fructifica", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "casa-completa": [{ productSlug: "compost", quantity: 1 }, { productSlug: "crece", quantity: 1 }, { productSlug: "equilibra", quantity: 1 }, { productSlug: "florece", quantity: 1 }, { productSlug: "fructifica", quantity: 1 }, { productSlug: "humic", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
  "casa-completa-xl": [{ productSlug: "compost", quantity: 2 }, { productSlug: "crece", quantity: 2 }, { productSlug: "equilibra", quantity: 2 }, { productSlug: "florece", quantity: 2 }, { productSlug: "fructifica", quantity: 2 }, { productSlug: "humic", quantity: 2 }, { productSlug: "potash", quantity: 2 }],
  "proteccion-de-hojas": [{ productSlug: "neem", quantity: 1 }, { productSlug: "potash", quantity: 1 }],
};

export const casaJardinKits: readonly CasaJardinKitDetail[] = kitRows.map((kit) => ({
  ...kit,
  composition: kitComponents[kit.slug] ?? [],
}));

export function getCasaJardinKit(slug: string) {
  return casaJardinKits.find((kit) => kit.slug === slug);
}
