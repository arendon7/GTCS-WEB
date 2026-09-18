import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    siteName: "Greenatics",
    title: "Casa & Jardín | Wondergreen",
    description: "Kits, guías y productos Wondergreen para cuidar plantas de interior, jardines y huertas por etapa.",
  },
};

export default function CasaJardinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
