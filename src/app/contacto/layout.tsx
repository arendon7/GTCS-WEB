import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  alternates: { canonical: "/contacto" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
