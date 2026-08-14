import { describe, expect, it } from "vitest";
import { publicFooterNav, publicNav, publicSite, publicStaticRoutes } from "./public-site";

type PublicLink = { href: string; label: string };

describe("public site contact configuration", () => {
  it("keeps corporate location centralized", () => {
    expect(publicSite.office.line2).toBe("Centro Empresarial Alcalá");
    expect(publicSite.office.city).toBe("Medellín, Colombia");
  });

  it("keeps booking as an https external configuration", () => {
    expect(publicSite.bookingUrl).toMatch(/^https:\/\/outlook\.office\.com\//);
  });

  it("distinguishes target and legacy indexed domains", () => {
    expect(publicSite.publicDomainTarget).toBe("https://greenatics.com.co");
    expect(publicSite.legacyIndexedDomain).toBe("https://greenatics.org");
  });

  it("adds the governed Wondergreen catalog without removing established primary routes", () => {
    const primaryLinks: readonly PublicLink[] = publicNav;
    expect(primaryLinks).toContainEqual({ href: "/wondergreen", label: "Wondergreen" });
    expect(primaryLinks).toContainEqual({ href: "/wondergreen/productos", label: "Productos" });
    expect(primaryLinks).toContainEqual({ href: "/impacto", label: "Impacto" });
  });

  it("keeps impact discoverable and indexable across public navigation", () => {
    const footerLinks: PublicLink[] = publicFooterNav.flatMap(
      (group) => [...group.links] as PublicLink[],
    );
    expect(publicStaticRoutes).toContain("/impacto");
    expect(footerLinks).toContainEqual({ href: "/impacto", label: "Impacto" });
  });
});
