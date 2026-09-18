export type CasaJardinProductDetail = {
  slug: string;
  name: string;
  label: string;
  formula: string;
  role: string;
  prompt: string;
  image: string | null;
  technicalHref: string;
  formats: string;
  context: string;
};

export const casaJardinProducts: readonly CasaJardinProductDetail[] = [
  { slug: "compost", name: "COMPOST", label: "La base del sistema", formula: "Materia orgánica y acondicionamiento", role: "Prepara el suelo y el sustrato antes de pensar en la siguiente etapa de nutrición.", prompt: "Empieza por el suelo.", image: null, technicalHref: "/wondergreen/", formats: "Orientación para uso doméstico", context: "Trasplante, preparación de materas y establecimiento de huertas." },
  { slug: "crece", name: "CRECE", label: "2GROW · crecimiento vegetativo", formula: "15-3-3", role: "Acompaña crecimiento, brotación y recuperación vegetativa cuando la planta está activa.", prompt: "Cuando la planta crece, cambia lo que necesita.", image: "/products/wondergreen-2grow.webp", technicalHref: "/wondergreen/productos/2grow/", formats: "Orientación de presentación: 500 g · 1 kg · 2 kg · 5 kg", context: "Plantas de follaje, establecimiento, brotes y recuperación después de poda o estrés." },
  { slug: "equilibra", name: "EQUILIBRA", label: "2BALANCE · mantenimiento", formula: "7-7-7", role: "Acompaña el mantenimiento y una nutrición balanceada cuando la planta ya está estable.", prompt: "No siempre necesita empuje. A veces necesita equilibrio.", image: "/products/wondergreen-2balance.webp", technicalHref: "/wondergreen/productos/2balance/", formats: "Orientación de presentación: 500 g · 1 kg · 2 kg · 5 kg", context: "Plantas estables, colecciones ornamentales y mantenimiento de huertas." },
  { slug: "florece", name: "FLORECE", label: "2BLOOM · transición reproductiva", formula: "3-8-3", role: "Acompaña transición, prefloración y floración sin convertir la nutrición en una promesa de flores.", prompt: "Si cambia a floración, cambia su nutrición.", image: "/products/wondergreen-2bloom.webp", technicalHref: "/wondergreen/productos/2bloom/", formats: "Orientación de presentación: 500 g · 1 kg · 2 kg · 5 kg", context: "Plantas ornamentales y cultivos que ya muestran una transición reproductiva reconocible." },
  { slug: "fructifica", name: "FRUCTIFICA", label: "2FRUIT · etapa productiva", formula: "3-3-8", role: "Se orienta a cuajado, desarrollo y llenado de fruto dentro de una estrategia completa de manejo.", prompt: "La etapa productiva tiene otra lógica nutricional.", image: "/products/wondergreen-2fruit.webp", technicalHref: "/wondergreen/productos/2fruit/", formats: "Orientación de presentación: 500 g · 1 kg · 2 kg · 5 kg", context: "Huertas domésticas y plantas productivas en cuajado, desarrollo o llenado." },
] as const;

export function getCasaJardinProduct(slug: string) {
  return casaJardinProducts.find((product) => product.slug === slug);
}

export type CasaJardinKitDetail = {
  slug: string;
  name: string;
  audience: string;
  promise: string;
  composition: readonly string[];
  image: string | null;
  note: string;
};

export const casaJardinKits: readonly CasaJardinKitDetail[] = [
  { slug: "plantas-verdes", name: "Plantas Verdes", audience: "Follaje, interior y exterior", promise: "Crece cuando lo necesita. Equilibra cuando está estable.", composition: ["CRECE · 2GROW 15-3-3 · orientación 500 g", "EQUILIBRA · 2BALANCE 7-7-7 · orientación 500 g"], image: "/kits/kit-plantas-verdes.png", note: "La composición organiza dos momentos de cuidado; no significa aplicar las dos líneas al mismo tiempo." },
  { slug: "plantas-con-flor", name: "Plantas con Flor", audience: "Ornamentales en transición", promise: "La floración se acompaña después de revisar luz, agua, edad y sanidad.", composition: ["EQUILIBRA · 2BALANCE 7-7-7 · orientación 500 g", "FLORECE · 2BLOOM 3-8-3 · orientación 500 g"], image: "/kits/kit-plantas-con-flor.png", note: "El kit acompaña la etapa de floración cuando la planta está estable y en transición." },
  { slug: "mi-huerta", name: "Mi Huerta", audience: "Aromáticas y plantas productivas", promise: "Del sustrato al fruto, con una secuencia que se puede observar.", composition: ["COMPOST · orientación 2 kg", "CRECE · orientación 500 g", "FLORECE · orientación 500 g", "FRUCTIFICA · orientación 500 g"], image: "/kits/kit-mi-huerta.png", note: "La secuencia representa etapas; el acompañamiento define qué referencia usar, cuándo y cómo aplicarla." },
  { slug: "casa-completa", name: "Casa Completa", audience: "Hogares con plantas en etapas distintas", promise: "Muchas plantas pueden compartir una lógica, pero cada una entra por su momento.", composition: ["CRECE · orientación 500 g", "EQUILIBRA · orientación 500 g", "FLORECE · orientación 500 g", "FRUCTIFICA · orientación 500 g"], image: "/kits/kit-casa-completa.webp", note: "Tener cuatro líneas disponibles no significa usarlas juntas. La condición y la etapa de cada planta mandan." },
  { slug: "casa-completa-xl", name: "Casa Completa XL", audience: "Colecciones y jardines pequeños", promise: "Una ruta de mayor volumen para necesidades recurrentes.", composition: ["CRECE · orientación 1 kg", "EQUILIBRA · orientación 1 kg", "FLORECE · orientación 1 kg", "FRUCTIFICA · orientación 1 kg"], image: "/kits/kit-casa-completa-xl.png", note: "La colección organiza una ruta completa de cuidado. La presentación, logística y acompañamiento se definen con el equipo Greenatics." },
] as const;

export function getCasaJardinKit(slug: string) {
  return casaJardinKits.find((kit) => kit.slug === slug);
}
