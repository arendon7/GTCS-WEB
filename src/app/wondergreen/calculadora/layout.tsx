import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calculadora agronómica Wondergreen", description: "Explora una orientación inicial por cultivo, etapa y área para preparar una recomendación y una cotización técnica.", alternates: { canonical: "/wondergreen/calculadora/" } };
export default function CalculadoraLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
