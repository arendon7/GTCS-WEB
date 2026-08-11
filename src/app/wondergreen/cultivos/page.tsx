import type { Metadata } from "next";
import Link from "next/link";
import { crops } from "@/data/crops";

export const metadata: Metadata = {
  title: "Wondergreen por cultivo",
  description: "Guías orientativas Wondergreen organizadas por cultivo y momento fisiológico.",
};

export default function CropsPage() {
  return (
    <>
      <section className="crop-index-hero">
        <div className="container crop-index-grid">
          <div>
            <span className="eyebrow">Wondergreen por cultivo</span>
            <h1>Primero entiende el cultivo. Después elige la línea.</h1>
            <p className="lead">Estas rutas convierten nuestras guías técnico-comerciales en una experiencia simple por etapa. No son recetas cerradas ni reemplazan el diagnóstico agronómico.</p>
          </div>
          <div className="crop-rule-card">
            <span>Regla de recomendación</span>
            <strong>Objetivo → etapa → línea → formato → validación técnica</strong>
            <p>Las dosis, frecuencias y compatibilidades se confirman con documentación vigente y condición real del lote.</p>
          </div>
        </div>
      </section>

      <section className="crop-index-list">
        <div className="container crop-card-grid">
          {crops.map((crop, index) => (
            <Link className="crop-card" href={`/wondergreen/cultivos/${crop.slug}/`} key={crop.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{crop.name}</h2>
              <p>{crop.headline}</p>
              <strong>Ver programa orientativo →</strong>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
