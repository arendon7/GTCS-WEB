import type { Metadata } from "next";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const title = "Productos Wondergreen | Portafolio técnico y comercial";
const description = "Explora fertilizantes sólidos y líquidos Wondergreen por línea, formulación, presentación, estado comercial y documentación pública vinculada.";
const path = "/wondergreen/productos" as const;

export const metadata: Metadata = {
  ...publicSocialMetadata({ title, description, path }),
};

export default function WondergreenProductsDiscoveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
