import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

export function WondergreenToolTrail({ name, path }: { name: string; path: string }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Wondergreen", url: `${site.url}/wondergreen/` }, { name, url: `${site.url}${path}` }]} />
      <div className="container" style={{ maxWidth: 1080, margin: "0 auto 22px" }}>
        <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
      </div>
    </>
  );
}
