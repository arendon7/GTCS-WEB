import { JsonLd } from "@/components/json-ld";
import { site } from "@/data/site";

type ArticleJsonLdProps = {
  headline: string;
  description: string;
  url: string;
  dateModified?: string;
  about?: string[];
};

export function ArticleJsonLd({ headline, description, url, dateModified, about = [] }: ArticleJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        url,
        inLanguage: "es-CO",
        ...(dateModified ? { dateModified } : {}),
        author: { "@id": `${site.url}/#organization` },
        publisher: { "@id": `${site.url}/#organization` },
        ...(about.length ? { about: about.map((name) => ({ "@type": "Thing", name })) } : {}),
      }}
    />
  );
}
