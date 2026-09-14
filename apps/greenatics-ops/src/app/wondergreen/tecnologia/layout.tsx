import type { Metadata } from "next";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const description =
  "Tecnología Wondergreen: lectura gobernada de organomineral, oclusión y lenta liberación, con límites de evidencia y relación directa con el Product Master.";

const social = publicSocialMetadata({
  title: "Tecnología Wondergreen | Greenatics",
  description,
  path: "/wondergreen/tecnologia",
});

export const metadata: Metadata = {
  title: "Tecnología Wondergreen | Greenatics",
  description,
  alternates: { canonical: "/wondergreen/tecnologia" },
  ...social,
};

export default function WondergreenTechnologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
