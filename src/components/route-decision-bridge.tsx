import Link from "next/link";

interface DecisionCard {
  label: string;
  title: string;
  copy: string;
  inputs: string[];
  href: string;
  cta: string;
}

interface RouteDecisionBridgeProps {
  eyebrow: string;
  title: string;
  intro: string;
  cards: DecisionCard[];
}

export function RouteDecisionBridge({ eyebrow, title, intro, cards }: RouteDecisionBridgeProps) {
  const bridgeId = `gt-decision-${eyebrow.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section className="gt-decision-bridge" aria-labelledby={`${bridgeId}-title`}>
      <div className="container">
        <header className="gt-decision-bridge__header">
          <div><span className="eyebrow">{eyebrow}</span><h2 id={`${bridgeId}-title`}>{title}</h2></div>
          <p id={`${bridgeId}-intro`}>{intro}</p>
        </header>
        <div className="gt-decision-bridge__grid">
          {cards.map((card, index) => (
            <article key={card.title} aria-labelledby={`${bridgeId}-card-${index + 1}-title`} aria-describedby={`${bridgeId}-card-${index + 1}-copy`}>
              <div className="gt-decision-bridge__number">{String(index + 1).padStart(2, "0")}</div>
              <span>{card.label}</span>
              <h3 id={`${bridgeId}-card-${index + 1}-title`}>{card.title}</h3>
              <p id={`${bridgeId}-card-${index + 1}-copy`}>{card.copy}</p>
              <div className="gt-decision-bridge__inputs">
                <strong>Lo que conviene traer</strong>
                <ul>{card.inputs.map((input) => <li key={input}>{input}</li>)}</ul>
              </div>
              <Link href={card.href} aria-label={`${card.cta}: ${card.title}`}>{card.cta} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
