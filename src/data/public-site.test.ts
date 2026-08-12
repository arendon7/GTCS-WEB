import { describe, expect, it } from "vitest";
import { publicSite } from "./public-site";

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
});
