import { yarumalClaims } from "@/data/claims";

export function VerifiedMetricsMatrix() {
  return (
    <section className="verified-metrics-matrix" aria-labelledby="verified-metrics-title">
      <div className="verified-metrics-matrix__intro">
        <span className="eyebrow">Caso Yarumal · resultados validados</span>
        <h3 id="verified-metrics-title">Impacto operativo, logístico y económico con contexto.</h3>
        <p>
          Estos resultados corresponden al periodo y al alcance validados del caso Yarumal.
          Cada cifra conserva su evidencia, unidad y método de lectura.
        </p>
      </div>
      <div className="verified-metrics-matrix__grid">
        {yarumalClaims.map((claim) => (
          <article key={claim.id}>
            <span>{claim.evidence}</span>
            <strong>{claim.value}</strong>
            <h4>{claim.label}</h4>
            <p>{claim.method}</p>
          </article>
        ))}
      </div>
      <p className="verified-metrics-matrix__note">
        <strong>Alcance:</strong> un resultado validado describe este caso; un nuevo territorio requiere su propia línea base y revisión.
      </p>
    </section>
  );
}
