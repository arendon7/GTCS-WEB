import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demostración de usuarios y permisos",
  description:
    "Recorre un modelo local de usuarios y permisos con datos ficticios. No administra cuentas reales ni habilita accesos a las plataformas Greenatics.",
  alternates: { canonical: "/plataforma/usuarios/" },
  openGraph: {
    title: "Demostración de usuarios | Greenatics",
    description:
      "Ejemplo interactivo con información ficticia; los cambios permanecen en este navegador.",
    url: "/plataforma/usuarios/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function PlatformUsersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
