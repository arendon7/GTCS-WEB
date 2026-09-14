import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const title = "Proyectos | Greenatics";
const description = "Casos documentados y aprendizajes Greenatics en operación, rehabilitación, tratamiento biológico, rutas selectivas y trazabilidad.";

export const metadata: Metadata = {
  ...publicSocialMetadata({ title, description, path: "/proyectos" }),
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
