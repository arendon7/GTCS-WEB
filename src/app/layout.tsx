import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./commerce.css";
import "./brand.css";
import "./solutions.css";
import "./tech-impact.css";
import "./diagnostic.css";
import "./about.css";
import "./library.css";
import "./knowledge.css";
import "./crop-guide.css";
import "./polish.css";
import "./depth.css";
import "./home-depth.css";
import "./catalog-depth.css";
import "./service-detail.css";
import "./park.css";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Greenatics | Transformamos residuos en vida", template: "%s | Greenatics" },
  description: site.description,
  applicationName: "Greenatics",
  category: "environment",
  icons: { icon: "/brand/greenatics-symbol.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: site.url,
    siteName: site.name,
    title: "Greenatics | Transformamos residuos en vida",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenatics | Transformamos residuos en vida",
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#008b4c",
  colorScheme: "light",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: "Greenatics",
  url: site.url,
  logo: `${site.url}/brand/greenatics-horizontal.webp`,
  description: site.description,
  slogan: "Transformamos residuos en vida",
  areaServed: { "@type": "Country", name: "Colombia" },
  brand: {
    "@type": "Brand",
    name: "Wondergreen Nutrients",
    logo: `${site.url}/brand/wondergreen-nutrients.webp`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: "Greenatics",
  description: site.description,
  inLanguage: "es-CO",
  publisher: { "@id": `${site.url}/#organization` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
