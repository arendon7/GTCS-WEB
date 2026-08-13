import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/wondergreen/cultivos" },
};

export default function WondergreenCropsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
