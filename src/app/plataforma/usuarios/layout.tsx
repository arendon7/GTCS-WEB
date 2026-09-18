import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración de usuarios y permisos",
  description:
    "Administra organizaciones, usuarios, roles y accesos a las plataformas Greenatics desde el Centro de usuarios.",
  alternates: { canonical: "/plataforma/usuarios/" },
  openGraph: {
    title: "Centro de usuarios | Greenatics",
    description:
      "Organiza personas, organizaciones, roles y accesos a OPS, Huella, Red, AGROWAY y SANA.",
    url: "/plataforma/usuarios/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function PlatformUsersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
