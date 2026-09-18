import Link from "next/link";

const tools = [
  {
    number: "01",
    name: "GREENATICS OPS",
    summary: "Bitácora, volúmenes, lotes, mantenimiento e indicadores.",
    href: "/app/",
    action: "Ver alcance y acceso",
  },
  {
    number: "02",
    name: "GREENATICS Red",
    summary: "Territorio, generadores, rutas, PMIRS y evidencias.",
    href: "/red/",
    action: "Ver alcance y acceso",
  },
  {
    number: "03",
    name: "Calcula tu Huella",
    summary: "Inventarios, fuentes, validación y reportes climáticos.",
    href: "/huella/",
    action: "Ver alcance y acceso",
  },
  {
    number: "04",
    name: "AGROWAY",
    summary: "Trazabilidad del productor, finca, lote y ciclo agrícola.",
    href: "/agroway/",
    action: "Ver alcance y acceso",
  },
  {
    number: "05",
    name: "SANA",
    summary: "Proyectos productivos, datos de campo e inversión acompañada.",
    href: "/sana/",
    action: "Ver alcance y acceso",
  },
] as const;

export function HomeToolsBridge() {
  return (
    <section className="home-tools-bridge" aria-labelledby="home-tools-title">
      <div className="container">
        <div className="home-tools-bridge__heading">
          <div>
            <span className="eyebrow">Herramientas Greenatics</span>
            <h2 id="home-tools-title">Elige la herramienta y abre su entorno.</h2>
          </div>
          <p>
            Cada plataforma tiene una landing para entender su alcance, sus módulos y la
            forma de entrar. Desde allí puedes abrir la demo pública o acceder al entorno
            operativo con las credenciales de tu organización.
          </p>
        </div>

        <nav className="home-tools-bridge__list" aria-label="Acceso directo a herramientas Greenatics">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.name}>
              <span className="home-tools-bridge__number">{tool.number}</span>
              <span className="home-tools-bridge__content">
                <strong>{tool.name}</strong>
                <small>{tool.summary}</small>
              </span>
              <span className="home-tools-bridge__action">
                {tool.action} <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </nav>

        <Link className="home-tools-bridge__all" href="/herramientas/">
          Ver el centro completo de herramientas <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
