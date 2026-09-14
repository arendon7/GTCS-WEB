import Link from "next/link";

const methodSteps = [
  ["01", "Identificar la función", "Suelo y raíz, manejo integrado o prevención botánica. El ingrediente orienta la decisión dentro de un programa completo de manejo."],
  ["02", "Preparar la aplicación", "La ficha técnica define concentración, dosis, frecuencia, vía, compatibilidad, almacenamiento y condición de uso para la presentación seleccionada."],
  ["03", "Observar la respuesta", "Monitoreamos condición del cultivo, presión del problema y resultado para decidir ajuste, rotación o continuidad."],
] as const;

export function WondergreenBioinputMethod() {
  return (
    <section className="wg-bio-method" aria-labelledby="wg-bio-method-title">
      <div className="wg-bio-method__heading">
        <div>
          <span className="eyebrow">Criterio para bioinsumos</span>
          <h3 id="wg-bio-method-title">La biología se selecciona por función, oportunidad y evidencia.</h3>
        </div>
        <p>Una referencia microbiológica o botánica entra al programa cuando coinciden el problema identificado, el momento de aplicación, las condiciones del lote, la calidad del agua y la documentación del producto.</p>
      </div>

      <ol className="wg-bio-method__steps">
        {methodSteps.map(([number, title, copy]) => (
          <li key={number}>
            <span>{number}</span>
            <div>
              <h4>{title}</h4>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="wg-bio-method__evidence">
        <div>
          <span className="eyebrow">Lo que sí puede afirmarse</span>
          <h4>La materia orgánica no es un adorno de la fórmula.</h4>
          <p>La evidencia revisada respalda hablar de un mejor entorno físico, químico y biológico del suelo, de mayor ciclado de nutrientes y de un posible mejor aprovechamiento del aporte, siempre condicionado por suelo, cultivo, clima, producto y manejo.</p>
        </div>
        <ul>
          <li><strong>Base orgánica funcional</strong><span>Favorece el entorno del suelo y la actividad biológica.</span></li>
          <li><strong>Orgánico + mineral</strong><span>Puede apoyar eficiencia y productividad dentro de un programa.</span></li>
          <li><strong>Producto final</strong><span>La caracterización de cada referencia se entrega con su ficha técnica y protocolo de uso.</span></li>
        </ul>
      </div>

      <div className="wg-bio-method__links">
        <span>Para pasar del criterio a la decisión:</span>
        <Link href="/wondergreen/fitosanidad/">Abrir manejo integrado →</Link>
        <Link href="/wondergreen/compatibilidad/">Revisar compatibilidades →</Link>
        <Link href="#documentos">Consultar fuentes →</Link>
      </div>
    </section>
  );
}
