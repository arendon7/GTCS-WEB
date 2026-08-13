export type LegacyRouteDisposition = "redirect" | "quarantine" | "manual-review";

export type LegacyPublicRoute = {
  source: string;
  disposition: LegacyRouteDisposition;
  destination?: string;
  reason: string;
};

/**
 * Governed migration registry for paths observed on the indexed greenatics.org
 * WordPress site before the new public platform cutover.
 *
 * Only `redirect` entries become runtime redirects. `quarantine` and
 * `manual-review` entries are deliberately excluded so that stale, compromised
 * or unreconciled content cannot leak into the new public contract.
 */
export const legacyPublicRoutes: readonly LegacyPublicRoute[] = [
  {
    source: "/blog",
    disposition: "redirect",
    destination: "/biblioteca",
    reason: "Preserve the knowledge entry point without cloning the legacy WordPress archive.",
  },
  {
    source: "/el-potencial-de-la-ruta-selectiva-de-recoleccion-de-residuos",
    disposition: "redirect",
    destination: "/soluciones/rutas-selectivas",
    reason: "Preserve search intent around selective collection using the governed service page.",
  },
  {
    source: "/fertilizantes-que-nutren",
    disposition: "redirect",
    destination: "/wondergreen",
    reason: "Preserve organomineral-fertilizer intent without carrying legacy claims forward verbatim.",
  },
  {
    source: "/impacto-y-resultados",
    disposition: "redirect",
    destination: "/impacto",
    reason: "Replace historical impact claims with the governed public-impact contract.",
  },
  {
    source: "/winds-of-change-in-the-turbines-service-industries",
    disposition: "redirect",
    destination: "/wondergreen",
    reason: "The indexed content is about Greenatics/Wondergreen despite a stale template slug.",
  },
  {
    source: "/from-niche-to-100-gw-mainstream-and-beyond-world",
    disposition: "redirect",
    destination: "/biblioteca",
    reason: "Retain generic environmental-knowledge traffic without preserving the stale template slug.",
  },
  {
    source: "/cities-must-show-the-way-forward-on-renewable-energy",
    disposition: "quarantine",
    reason: "Indexed legacy page contains unrelated spam text and must not inherit authority through a redirect.",
  },
  {
    source: "/terminos-y-condiciones",
    disposition: "manual-review",
    reason: "Legal terms require current legal review before publication on the new platform.",
  },
  {
    source: "/privacidad",
    disposition: "manual-review",
    reason: "Privacy content must be reconciled with the new platform, booking flow and OPS boundary before publication.",
  },
  {
    source: "/politicas",
    disposition: "manual-review",
    reason: "Legacy policy content must be reviewed rather than copied automatically.",
  },
] as const;

export const legacyPublicRedirects = legacyPublicRoutes
  .filter((route): route is LegacyPublicRoute & { disposition: "redirect"; destination: string } =>
    route.disposition === "redirect" && typeof route.destination === "string",
  )
  .map(({ source, destination }) => ({ source, destination, permanent: true })) as readonly {
    source: string;
    destination: string;
    permanent: true;
  }[];
