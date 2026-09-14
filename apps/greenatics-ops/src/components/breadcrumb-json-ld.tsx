import { JsonLd } from "@/components/json-ld";
import { publicSite } from "@/data/public-site";

export type BreadcrumbItem = {
  name: string;
  path: `/${string}`;
};

function publicUrl(path: `/${string}`) {
  return new URL(path, publicSite.publicDomainTarget).toString();
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: publicUrl(item.path),
        })),
      }}
    />
  );
}
