import type { Metadata } from "next";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const description = "Explora las líneas Wondergreen 2Grow, 2Balance, 2Bloom y 2Fruit y abre sus referencias sólidas y líquidas, condición comercial, cultivos y documentación vinculada.";

const social = publicSocialMetadata({
  title: "Líneas de producto | Wondergreen",
  description,
  path: "/wondergreen/lineas",
});

export const metadata: Metadata = {
  title: "Líneas de producto | Wondergreen",
  description,
  alternates: { canonical: "/wondergreen/lineas" },
  ...social,
};

export default function WondergreenLinesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
