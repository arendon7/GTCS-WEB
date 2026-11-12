"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

const audienceProfiles = new Set([
  "municipio",
  "esp",
  "empresa",
  "agroindustria",
  "agro",
  "hogar",
  "territorio",
  "clima",
  "digital",
  "proyecto",
]);

type ServiceAudienceLinkProps = {
  href: string;
  className?: string;
  preferIncomingProfile?: boolean;
  children: ReactNode;
};

export function ServiceAudienceLink({ href, className, preferIncomingProfile = false, children }: ServiceAudienceLinkProps) {
  const [contextualHref, setContextualHref] = useState(href);

  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search);
    const incomingProfile = incoming.get("perfil");
    const target = new URL(href, window.location.origin);
    if (incomingProfile && audienceProfiles.has(incomingProfile)) {
      const explicitProfile = target.searchParams.get("perfil");
      const keepExplicitProfile = explicitProfile && audienceProfiles.has(explicitProfile) && (!preferIncomingProfile || explicitProfile === incomingProfile);
      if (!keepExplicitProfile) target.searchParams.set("perfil", incomingProfile);
    }

    for (const key of ["diagnostico", "prioridad"] as const) {
      const value = incoming.get(key);
      if (value && !target.searchParams.has(key)) target.searchParams.set(key, value);
    }

    const nextHref = `${target.pathname}${target.search}${target.hash}`;
    if (nextHref !== href) setContextualHref(nextHref);
  }, [href, preferIncomingProfile]);

  return <Link className={className} href={contextualHref}>{children}</Link>;
}
