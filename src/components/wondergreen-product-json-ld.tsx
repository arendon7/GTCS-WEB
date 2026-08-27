import { JsonLd } from "@/components/json-ld";
import { publicSite } from "@/data/public-site";
import type { WondergreenReference } from "@/data/wondergreen-public";

export function WondergreenProductJsonLd({
  reference,
  publicStatus,
}: {
  reference: WondergreenReference;
  publicStatus: string;
}) {
  const url = new URL(
    `/wondergreen/productos/${reference.slug}`,
    `${publicSite.publicDomainTarget}/`,
  ).toString();

  const additionalProperty = [
    ...(reference.formula
      ? [{ "@type": "PropertyValue", name: "Formulación declarada", value: reference.formula }]
      : []),
    { "@type": "PropertyValue", name: "Momento / función", value: reference.stage },
    { "@type": "PropertyValue", name: "Estado público", value: publicStatus },
  ];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${url}#product`,
        name: reference.name,
        description: reference.role,
        url,
        brand: { "@type": "Brand", name: "Wondergreen" },
        category: reference.family,
        additionalProperty,
      }}
    />
  );
}
