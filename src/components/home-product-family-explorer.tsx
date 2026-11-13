"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProductMedia } from "@/data/product-media";

type ProductReference = {
  name: string;
  image?: string;
  alt?: string;
  placeholder?: string;
  detail: string;
};

type ProductFamily = {
  name: string;
  description: string;
  href: string;
  references: ProductReference[];
  note?: string;
};

function productImage(
  slug: string,
  name: string,
  detail: string,
  variant: "editorial" | "reference" = "reference",
): ProductReference {
  const media = getProductMedia(slug);
  const image = variant === "editorial" ? media.editorial : media.reference;
  if (!image) throw new Error(`Missing ${variant} product image for ${slug}`);

  return { name, image: image.src, alt: image.alt, detail };
}

function solid40kgPackshot(
  slug: "2grow" | "2balance" | "2bloom" | "2fruit",
  name: string,
  formula: string,
  detail: string,
): ProductReference {
  const label = slug.toUpperCase();
  return {
    name,
    image: `/products/wondergreen-cropper-ref-${slug}-solid-40kg.webp`,
    alt: `Saco Wondergreen ${label} ${formula}, presentación de 40 kg.`,
    detail,
  };
}

const families: ProductFamily[] = [
  {
    name: "Compost",
    description: "Acondicionador orgánico para preparar suelo y sustratos antes de definir el programa nutricional.",
    href: "/biblioteca/catalogo-wondergreen/#familias",
    references: [{
      name: "Wondergreen Compost · 40 kg",
      image: "/products/wondergreen-cropper-ref-compost-40kg.webp",
      alt: "Saco Wondergreen Compost, acondicionador orgánico del suelo, presentación de 40 kg.",
      detail: "Acondicionador orgánico · suelo y sustrato",
    }],
  },
  {
    name: "Fertilizantes sólidos",
    description: "Fórmulas organominerales ocluidas para acompañar distintas etapas del cultivo.",
    href: "/biblioteca/catalogo-wondergreen/#familias",
    note: "Sacos de 40 kg. El equipo confirma precio, disponibilidad y condiciones por solicitud.",
    references: [
      solid40kgPackshot("2grow", "2GROW · 15-3-3", "15-3-3", "Establecimiento y crecimiento"),
      solid40kgPackshot("2balance", "2BALANCE · 7-7-7", "7-7-7", "Balance y mantenimiento"),
      solid40kgPackshot("2bloom", "2BLOOM · 3-8-3", "3-8-3", "Transición reproductiva y floración"),
      solid40kgPackshot("2fruit", "2FRUIT · 3-3-8", "3-3-8", "Desarrollo y llenado"),
    ],
  },
  {
    name: "Fertilizantes líquidos",
    description: "Cinco formulaciones elaboradas a partir de bioles de digestión anaerobia multietapa.",
    href: "/biblioteca/catalogo-wondergreen/#familias",
    references: [
      { name: "2GROW · 100-20-20", image: "/products/wondergreen-2grow-liquid-100-20-20-1l-cutout-v2.png", alt: "Envase maestro Wondergreen 2GROW líquido 100-20-20, presentación visual de 1 litro.", detail: "Primera formulación líquida de la línea 2GROW" },
      { name: "2GROW · 200-0-0", image: "/products/wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg", alt: "Envase de fertilizante líquido Wondergreen 2GROW 200-0-0.", detail: "Mayor concentración de nitrógeno en la línea · suministro por consulta" },
      { name: "2BALANCE · 70-70-70", image: "/products/wondergreen-cropper-ref-2balance-liquid.jpg", alt: "Envase de fertilizante líquido Wondergreen 2BALANCE 70-70-70.", detail: "Formulación líquida 2BALANCE" },
      { name: "2BLOOM · 30-80-30", image: "/products/wondergreen-cropper-ref-2bloom-liquid.jpg", alt: "Envase de fertilizante líquido Wondergreen 2BLOOM 30-80-30.", detail: "Portafolio técnico · consulta estado comercial" },
      { name: "2FRUIT · 30-30-80", image: "/products/wondergreen-cropper-ref-2fruit-liquid.jpg", alt: "Envase de fertilizante líquido Wondergreen 2FRUIT 30-30-80.", detail: "Formulación líquida 2FRUIT" },
    ],
  },
  {
    name: "Bioinsumos",
    description: "Referencias botánicas y microbiológicas para integrar al manejo del cultivo.",
    href: "/biblioteca/catalogo-wondergreen/#familias",
    references: [
      { name: "Bacillus subtilis", image: "/products/wondergreen-cropper-ref-bioinput-bacillus-subtilis.jpg", alt: "Envase de bioinsumo microbiológico Wondergreen Bacillus subtilis.", detail: "Referencia microbiológica" },
      { name: "Trichoderma", placeholder: "Especie y ficha por confirmar", detail: "Referencia técnica" },
      { name: "Metarhizium anisopliae", image: "/products/wondergreen-cropper-ref-bioinput-metarhizium.jpg", alt: "Envase de bioinsumo microbiológico Wondergreen Metarhizium anisopliae.", detail: "Referencia microbiológica" },
      { name: "Beauveria bassiana", image: "/products/wondergreen-cropper-ref-bioinput-beauveria.jpg", alt: "Envase de bioinsumo microbiológico Wondergreen Beauveria bassiana.", detail: "Referencia microbiológica" },
      { name: "Neem", image: "/products/wondergreen-cropper-ref-bioinput-neem.jpg", alt: "Envase de bioinsumo botánico Wondergreen Neem.", detail: "Referencia botánica" },
      { name: "Extracto Ajo-Ají", image: "/products/wondergreen-cropper-ref-bioinput-ajo-aji.jpg", alt: "Envase de bioinsumo botánico Wondergreen Extracto Ajo-Ají.", detail: "Referencia botánica" },
    ],
  },
];

function FamilyCarousel({ family }: { family: ProductFamily }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = family.references[activeIndex];
  const move = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + family.references.length) % family.references.length);
  };

  return (
    <article className="home-product-family" aria-label={family.name}>
      <div className="home-product-family__image-wrap">
        {active.image && active.alt ? (
          <Image
            key={active.image}
            src={active.image}
            alt={active.alt}
            fill
            sizes="(max-width: 680px) 84vw, (max-width: 1050px) 42vw, 24vw"
          />
        ) : (
          <div className="home-product-family__image-placeholder" role="img" aria-label={`${active.name}. ${active.placeholder ?? "Referencia visual no disponible"}.`}>
            <span>Referencia técnica</span>
            <strong>{active.name}</strong>
            <small>{active.placeholder ?? "Imagen no disponible"}</small>
          </div>
        )}
        {active.image && <span className="home-product-family__image-label">Imagen de referencia</span>}
      </div>
      <div className="home-product-family__body">
        <div>
          <h3>{family.name}</h3>
          <p>{family.description}</p>
          {family.note && <p className="home-product-family__note">{family.note}</p>}
        </div>
        <div className="home-product-family__selected" aria-live="polite" aria-atomic="true">
          <strong>{active.name}</strong>
          <span>{active.detail}</span>
        </div>
      </div>
      <div className="home-product-family__footer">
        <Link href={family.href}>Ver referencias en el catálogo <span aria-hidden="true">→</span></Link>
        {family.references.length > 1 ? (
          <div className="home-product-family__controls" role="group" aria-label={`Explorar ${family.name}`}>
            <button type="button" onClick={() => move(-1)} aria-label={`Ver referencia anterior de ${family.name}`}>
              Anterior
            </button>
            <span aria-label={`Referencia ${activeIndex + 1} de ${family.references.length}`}>
              {String(activeIndex + 1).padStart(2, "0")} / {String(family.references.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => move(1)} aria-label={`Ver siguiente referencia de ${family.name}`}>
              Siguiente
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function HomeProductFamilyExplorer() {
  return (
    <div className="home-product-family-grid" aria-label="Explora referencias de las familias Wondergreen">
      {families.map((family) => <FamilyCarousel family={family} key={family.name} />)}
    </div>
  );
}
