import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guía de señales y deficiencias", description: "Organiza síntomas y contexto de la planta para orientar la observación sin convertir una señal en diagnóstico automático.", alternates: { canonical: "/wondergreen/quiz-deficiencias/" } };
export default function QuizDeficienciasLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
