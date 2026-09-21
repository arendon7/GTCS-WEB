import Link from "next/link";

const entries = [
  { label: "Herramientas", href: "#plataformas", note: "elige tu punto de entrada" },
  { label: "Evidencia", href: "/impacto/", note: "casos, método y claims" },
  { label: "Campo", href: "/agroway/", note: "trazabilidad por lote" },
  { label: "Operación", href: "/app/", note: "bitácora y control" },
  { label: "Acceso", href: "/acceso/", note: "demo o entorno real" },
] as const;

export function DigitalToolsIndex() {
  return (
    <nav className="digital-tools-index" aria-label="Recorrido por el ecosistema digital">
      <div className="container digital-tools-index__inner">
        <span className="digital-tools-index__label">Recorrido digital</span>
        <div className="digital-tools-index__links">
          {entries.map((entry) => (
            <Link href={entry.href} key={entry.label}>
              <strong>{entry.label}</strong>
              <small>{entry.note}</small>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
