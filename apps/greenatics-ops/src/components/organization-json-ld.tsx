import { JsonLd } from "@/components/json-ld";
import { publicSite } from "@/data/public-site";

export function OrganizationJsonLd() {
  const siteUrl = publicSite.publicDomainTarget;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: publicSite.name,
        url: siteUrl,
        logo: new URL("/brand/greenatics-horizontal.webp", siteUrl).toString(),
        slogan: "Transformamos residuos en vida.",
        description: publicSite.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${publicSite.office.line1}, ${publicSite.office.line2}`,
          addressLocality: "Medellín",
          addressCountry: "CO",
        },
      }}
    />
  );
}
