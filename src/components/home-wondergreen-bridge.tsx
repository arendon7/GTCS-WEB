import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const products = [
  { src: "/products/wondergreen-2grow.webp", alt: "Wondergreen 2GROW" },
  { src: "/products/wondergreen-2balance.webp", alt: "Wondergreen 2BALANCE" },
  { src: "/products/wondergreen-2bloom.webp", alt: "Wondergreen 2BLOOM" },
  { src: "/products/wondergreen-2fruit.webp", alt: "Wondergreen 2FRUIT" },
] as const;

const tools = [
  { label: "Orientación por cultivo", href: "/wondergreen/cultivos/" },
  { label: "Estimador de requerimientos", href: "/wondergreen/calculadora/" },
  { label: "Interpretación de suelo", href: "/wondergreen/analisis-suelo/" },
] as const;

export function HomeWondergreenBridge() {
  return (
    <section className="home-wondergreen-bridge" aria-labelledby="wondergreen-bridge-title">
      <div className="container home-wondergreen-bridge__grid">
        <div className="home-wondergreen-bridge__copy">
          <span className="eyebrow">Valorización que vuelve al territorio</span>
          <h2 id="wondergreen-bridge-title">
            Wondergreen organiza la nutrición del suelo y del cultivo por objetivo y etapa.
          </h2>
          <p className="lead">
            Compost, fertilizantes organominerales, bioinsumos y herramientas agronómicas
            para pasar de una referencia de producto a una decisión ajustada al suelo,
            el cultivo, la etapa y el objetivo productivo.
          </p>

          <div className="home-wondergreen-bridge__sequence" aria-label="Secuencia de acompañamiento">
            <span>Diagnóstico</span>
            <span>Fórmula</span>
            <span>Programa</span>
            <span>Seguimiento</span>
          </div>

          <div className="home-wondergreen-bridge__actions">
            <Link className="button button--primary" href="/wondergreen/">
              Conocer el sistema Wondergreen
            </Link>
            <Link className="button button--ghost" href="/wondergreen/cotizador/">
              Solicitar orientación comercial
            </Link>
          </div>
        </div>

        <div className="home-wondergreen-bridge__visual">
          <div className="home-wondergreen-products" aria-label="Línea organomineral Wondergreen">
            {products.map((product, index) => (
              <figure key={product.src} style={{ "--product-index": index } as CSSProperties}>
                <Image src={product.src} alt={product.alt} fill sizes="(max-width: 800px) 38vw, 12vw" />
              </figure>
            ))}
          </div>
          <div className="home-wondergreen-tools">
            <span>Herramientas para decidir mejor</span>
            {tools.map((tool) => (
              <Link href={tool.href} key={tool.href}>
                {tool.label} <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
