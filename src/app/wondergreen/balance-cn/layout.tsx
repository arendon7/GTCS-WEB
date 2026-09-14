import type { Metadata } from "next";

export const metadata: Metadata = { title: "Balance carbono-nitrógeno", description: "Organiza masas de residuos y materiales estructurantes para preparar una mezcla y un seguimiento de proceso.", alternates: { canonical: "/wondergreen/balance-cn/" } };
export default function BalanceCnLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
