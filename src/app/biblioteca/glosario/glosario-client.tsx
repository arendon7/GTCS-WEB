"use client";

import { useState } from "react";
import Link from "next/link";
import "./glossary-public.css";

const terms = [
  { term: "Oclusión en Matriz Orgánica", cat: "Química", def: "Describe una estructura organomineral en la que los nutrientes se integran en una matriz con materia orgánica. En los fertilizantes sólidos Wondergreen, la liberación gradual es un atributo de diseño; el comportamiento depende de la formulación y de las condiciones del lote." },
  { term: "Capacidad de Intercambio Catiónico (C.I.C.)", cat: "Suelos", def: "Medida de las cargas negativas de las superficies minerales y orgánicas del suelo que pueden retener e intercambiar cationes como calcio, magnesio, potasio y amonio. Su valor depende, entre otros factores, de la arcilla, la materia orgánica y el método de medición." },
  { term: "Andisoles", cat: "Suelos", def: "Suelos de origen volcánico predominantes en las cordilleras andinas colombianas. Tienen alta acidez y el mineral alofana que fija químicamente el fósforo, haciéndolo insoluble para las plantas." },
  { term: "Fase termófila", cat: "Bioprocesos", def: "Etapa del compostaje en la que la actividad biológica eleva la temperatura. Su duración y rango se controlan según el proceso y el criterio de higienización aplicable." },
  { term: "Biol Fermentado", cat: "Bioinsumos", def: "Líquido de origen biológico utilizado como base de formulaciones para nutrición vegetal. En Wondergreen, los fertilizantes líquidos se elaboran a partir de bioles de digestión anaerobia multietapa; la composición y las indicaciones dependen de cada ficha vigente." },
  { term: "Resolución CRA 720 de 2015", cat: "Regulatorio", def: "Adoptó una metodología tarifaria para el servicio público de aseo en municipios y distritos con más de 5.000 suscriptores. Sus disposiciones fueron compiladas en la Resolución CRA 943 de 2021; la metodología aplicable debe revisarse según el prestador, el municipio y la regulación vigente." },
  { term: "PGIRS", cat: "Regulatorio", def: "Plan de Gestión Integral de Residuos Sólidos. Instrumento de planeación territorial. La metodología general vigente fue adoptada por la Resolución 0555 de 2026, que derogó la Resolución 754 de 2014 y estableció un régimen de transición para determinados planes y actualizaciones. La ruta concreta depende del estado y la fecha del proceso." },
  { term: "PMIRS", cat: "Regulatorio", def: "Plan de Manejo Integral de Residuos Sólidos que permite organizar medidas y responsables de una organización o gran generador, como una unidad o conjunto residencial, un centro comercial, una institución o una planta productiva. Su alcance se define según las corrientes, la operación, la jurisdicción y las obligaciones aplicables; no todas las organizaciones comparten automáticamente las mismas obligaciones y su formulación no certifica por sí sola resultados ambientales." },
  { term: "SUI (Superintendencia de Servicios Públicos)", cat: "Regulatorio", def: "Sistema Único de Información administrado por la Superintendencia de Servicios Públicos Domiciliarios. En la actividad de aprovechamiento, los prestadores reportan mensualmente las toneladas efectivamente aprovechadas con los soportes y condiciones aplicables; el reporte no equivale a una validación automática ni garantiza por sí solo el reconocimiento tarifario." },
  { term: "Lixiviación de Nutrientes", cat: "Agronomía", def: "Pérdida por lavado de sales minerales solubles (especialmente nitratos y potasio) arrastradas por el agua de lluvia hacia capas profundas del suelo o fuentes hídricas." },
  { term: "Resistencia Sistémica Adquirida (SAR)", cat: "Agronomía", def: "Respuesta de defensa que puede activarse en distintas partes de una planta después de reconocer una infección localizada. Se distingue de la resistencia sistémica inducida (ISR), asociada con otros estímulos, incluidos algunos microorganismos benéficos; no implica eficacia de un producto específico." },
];

const searchKey = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const categories = Array.from(new Set(terms.map((term) => term.cat)));

export function GlosarioClient() {
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("");
  const query = searchKey(filter);
  const filtered = terms.filter((term) =>
    (!category || term.cat === category) &&
    (!query || [term.term, term.def, term.cat].some((value) => searchKey(value).includes(query)))
  );
  function clearFilters() { setFilter(""); setCategory(""); }

  return (
    <div className="glossary-public">
      <div className="container">
        <header className="glossary-public__intro">
          <Link className="back-link" href="/biblioteca/">Volver a Biblioteca</Link>
          <span className="eyebrow">Conocimiento Greenatics</span>
          <h1>Entiende los conceptos detrás de una decisión técnica.</h1>
          <p>Suelos, bioprocesos, agronomía y gestión de residuos: busca una palabra o explora un tema. Estas definiciones ayudan a una primera lectura; el contexto del lote, la operación y las reglas aplicables completan cada caso.</p>
        </header>
        <section className="glossary-public__controls" aria-label="Buscar y filtrar conceptos">
          <div><label htmlFor="glossary-query">Buscar un término del glosario</label><input id="glossary-query" type="search" placeholder="Por ejemplo: oclusión, suelo, PGIRS" value={filter} onChange={(event) => setFilter(event.target.value)} /></div>
          <div><label htmlFor="glossary-category">Tema</label><select id="glossary-category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todos los temas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
          <button type="button" onClick={clearFilters}>Limpiar filtros</button>
        </section>
        <p className="glossary-public__count" role="status">{filtered.length === 1 ? "1 concepto encontrado" : `${filtered.length} conceptos encontrados`}</p>
        {filtered.length ? <section className="glossary-public__terms" aria-label="Conceptos encontrados">
          {filtered.map((term) => <article key={term.term}>
            <div><span className="glossary-public__category">{term.cat}</span><h2>{term.term}</h2></div>
            <p>{term.def}</p>
          </article>)}
        </section> : <section className="glossary-public__empty" aria-labelledby="glossary-empty-title">
          <h2 id="glossary-empty-title">No encontramos un concepto con esos filtros.</h2>
          <p>Prueba una palabra más corta o cambia el tema. También puedes volver al listado completo.</p>
          <button className="button button--dark" type="button" onClick={clearFilters}>Ver todos los conceptos</button>
        </section>}
        <footer className="glossary-public__next"><h2>Del concepto al caso concreto</h2><p>Explora una guía o revisa qué acompañamiento puede responder a la necesidad de tu organización o cultivo.</p><div><Link href="/recursos/">Explorar recursos</Link><Link href="/servicios/">Conocer los servicios Greenatics</Link></div></footer>
      </div>
    </div>
  );
}
