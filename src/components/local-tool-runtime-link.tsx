"use client";

import { useEffect, useState } from "react";
import { getLocalToolRuntimeHref, type LocalToolCode } from "@/lib/local-tool-runtime";

export function LocalToolRuntimeLink({
  code,
  className,
  children,
  ariaLabel,
}: {
  code: LocalToolCode;
  className: string;
  children: string;
  ariaLabel: string;
}) {
  const [href, setHref] = useState("");

  useEffect(() => {
    const huellaPort = Number(process.env.NEXT_PUBLIC_HUELLA_LOCAL_PORT) || 8765;
    setHref(getLocalToolRuntimeHref(code, window.location.hostname, huellaPort));
  }, [code]);

  if (!href) return null;

  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} title="Solo aparece en un preview local; requiere que el servidor de la herramienta esté activo.">{children}<span aria-hidden="true">↗</span></a>;
}
