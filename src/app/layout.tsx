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
import "./a11y-v02.css";
import "./motion.css";
import "./site-v3.css";
import "./routes-v3.css";
import "./portfolio-v4.css";
import "./digital-v4.css";
import "./agroway/agroway-v1.css";
import "./sana/sana-v1.css";
import "./portfolio-demo.css";
import "./portfolio-v5.css";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingActionBar } from "@/components/floating-action-bar";
import { site } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Greenatics | Economía circular aplicada", template: "%s | Greenatics" },
  description: site.description,
  applicationName: "Greenatics",
  category: "environment",
  icons: { icon: "/brand/greenatics-symbol.svg" },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    title: "Greenatics | Economía circular aplicada",
    description: site.description,
    images: [
      {
        url: "/brand/greenatics-horizontal.webp",
        width: 1200,
        height: 630,
        alt: "Greenatics - Economía circular aplicada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenatics | Economía circular aplicada",
    description: site.description,
    images: ["/brand/greenatics-horizontal.webp"],
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
        <FloatingActionBar />
      </body>
    </html>
  );
}
