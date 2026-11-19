import type { Metadata } from "next";
import HuellaStaticLanding from "@/components/huella-static-landing";

export const metadata: Metadata = {
  title: { absolute: "Back 2 Green · Inventarios GEI con trazabilidad para empresas" },
  description: "Organiza el inventario de gases de efecto invernadero de tu empresa con datos, evidencias y cálculos trazables. Explora la plataforma Back 2 Green, el método y las rutas de reporte aplicables.",
  applicationName: "Back 2 Green",
  alternates: { canonical: "/huella/" },
  openGraph: {
    title: "Back 2 Green · Inventarios GEI con trazabilidad para empresas",
    description: "Organiza el inventario de gases de efecto invernadero de tu empresa con datos, evidencias y cálculos trazables.",
    url: "/huella/",
    images: [{ url: "/huella-static-v67/assets/img/landing-workflow-demo.png", alt: "Recorrido de presentación de Back 2 Green con datos de ejemplo" }],
  },
};

export default function CarbonPage() {
  return <HuellaStaticLanding />;
}
