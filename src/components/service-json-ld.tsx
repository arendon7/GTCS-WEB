import { JsonLd } from "@/components/json-ld";
import { publicSite } from "@/data/public-site";
import type { GreenaticsService } from "@/data/services";

export function ServiceJsonLd({ service }: { service: GreenaticsService }) {
  const url = new URL(`/soluciones/${service.slug}`, `${publicSite.publicDomainTarget}/`).toString();

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.name,
        description: service.summary,
        url,
        serviceType: service.category,
        provider: { "@id": `${publicSite.publicDomainTarget}/#organization` },
        audience: {
          "@type": "Audience",
          audienceType: service.audience,
        },
      }}
    />
  );
}
