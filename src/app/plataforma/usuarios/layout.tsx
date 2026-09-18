import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración de usuarios y permisos",
  description:
    "Administra organizaciones, usuarios, roles y accesos a las plataformas Greenatics desde el Centro de usuarios.",
  alternates: { canonical: "/plataforma/usuarios/" },
};

export default function PlatformUsersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
