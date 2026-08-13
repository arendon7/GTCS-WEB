import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/biblioteca/guia-deficiencias" },
};

export default function DeficiencyGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
