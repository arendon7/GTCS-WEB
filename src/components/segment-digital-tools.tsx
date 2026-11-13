import Image from "next/image";
import Link from "next/link";
import { toolByCode, type DigitalToolCode } from "@/data/digital-tools";

type SegmentToolCode = Extract<DigitalToolCode, "OPS" | "CO₂">;

export type SegmentDigitalToolEntry = {
  code: SegmentToolCode;
  summary: string;
  href: string;
  action: string;
  detailsHref?: string;
  detailsAction?: string;
};

type SegmentDigitalToolsProps = {
  id: string;
  heading: string;
  intro: string;
  entries: readonly SegmentDigitalToolEntry[];
};

export function SegmentDigitalTools({ id, heading, intro, entries }: SegmentDigitalToolsProps) {
  return (
    <section className="gt-audience-tools" id={id} aria-labelledby={`${id}-title`}>
      <div className="container">
        <header className="gt-audience-tools__heading">
          <h2 id={`${id}-title`}>{heading}</h2>
          <p>{intro}</p>
        </header>

        <div className="gt-audience-tools__list">
          {entries.map((entry) => {
            const tool = toolByCode(entry.code);
            const imageClass = entry.code === "CO₂" ? "gt-audience-tools__entry--carbon" : "gt-audience-tools__entry--ops";

            return (
              <article className={`gt-audience-tools__entry ${imageClass}`} key={entry.code}>
                <figure className="gt-audience-tools__visual">
                  {tool.image ? (
                    <Image
                      src={tool.image}
                      alt={tool.imageAlt ?? ""}
                      fill
                      sizes="(max-width: 620px) 100vw, (max-width: 960px) 38vw, 25vw"
                    />
                  ) : null}
                  <figcaption>{tool.status}</figcaption>
                </figure>

                <div className="gt-audience-tools__copy">
                  <h3>{tool.name}</h3>
                  <p>{entry.summary}</p>
                </div>

                <div className="gt-audience-tools__actions">
                  <Link className="button button--primary" href={entry.href}>
                    {entry.action}<span aria-hidden="true">→</span>
                  </Link>
                  {entry.detailsHref && entry.detailsAction ? (
                    <Link className="gt-audience-tools__details" href={entry.detailsHref}>
                      {entry.detailsAction}<span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
