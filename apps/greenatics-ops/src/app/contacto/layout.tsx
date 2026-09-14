import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Contacto | Greenatics",
  description: "Agenda una conversación con Greenatics sobre Wondergreen, residuos orgánicos, proyectos territoriales, plantas y soluciones empresariales.",
  path: "/contacto",
});

export const metadata: Metadata = {
  alternates: { canonical: "/contacto" },
  ...social,
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
