import type { Metadata } from "next";

export const metadata: Metadata = { title: "Preparar una recomendación agronómica | Wondergreen", description: "Organiza cultivo, área y etapa para conversar sobre una referencia Wondergreen. Esta orientación no calcula dosis, cantidades ni costos.", alternates: { canonical: "/wondergreen/calculadora/" } };
export default function CalculadoraLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
