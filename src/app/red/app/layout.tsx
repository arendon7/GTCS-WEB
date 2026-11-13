import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GREENATICS Red | Espacio de trabajo",
  description: "Muestra navegable de GREENATICS Red para gestión territorial y organizacional, revisión de datos y seguimiento de PGIRS y PMIRS.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "GREENATICS Red | Estación pública",
    description: "Explora la gestión territorial y organizacional, la revisión de datos y el seguimiento de PGIRS y PMIRS con información ilustrativa.",
    url: "/red/app/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function RedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
