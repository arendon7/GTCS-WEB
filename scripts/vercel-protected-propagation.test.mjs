import { describe, expect, it, vi } from "vitest";
import {
  VercelProtectedPreflightError,
  createProtectionPropagationFetch,
} from "./vercel-protected-preflight-lib.mjs";

const config = {
  deploymentUrl: "https://greenatics-preview.vercel.app",
};

function redirect(location, status = 302) {
  return new Response(null, { status, headers: { location } });
}

describe("Vercel protection propagation fetch", () => {
  it("retries cross-origin protection redirects and keeps the bypass header", async () => {
    const secret = "a".repeat(32);
    const sleepImpl = vi.fn(async () => {});
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(redirect("https://vercel.com/login?token=secret"))
      .mockResolvedValueOnce(redirect("https://vercel.com/sso-api?next=secret"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));

    const protectedFetch = createProtectionPropagationFetch(config, secret, {
      fetchImpl,
      sleepImpl,
      retryDelays: [10, 20],
    });

    const response = await protectedFetch(`${config.deploymentUrl}/api/health`, {
      headers: { "user-agent": "test" },
    });

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleepImpl.mock.calls.map(([ms]) => ms)).toEqual([10, 20]);
    for (const [, init] of fetchImpl.mock.calls) {
      expect(init.headers.get("x-vercel-protection-bypass")).toBe(secret);
      expect(init.redirect).toBe("manual");
    }
  });

  it("preserves same-origin application redirects without retrying", async () => {
    const secret = "b".repeat(32);
    const sleepImpl = vi.fn(async () => {});
    const fetchImpl = vi.fn(async () => redirect(`${config.deploymentUrl}/login?next=%2Fapp`));

    const protectedFetch = createProtectionPropagationFetch(config, secret, {
      fetchImpl,
      sleepImpl,
      retryDelays: [10, 20, 40],
    });

    const response = await protectedFetch(`${config.deploymentUrl}/app`);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("/login");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleepImpl).not.toHaveBeenCalled();
  });

  it("fails bounded persistent cross-origin redirects with a sanitized target", async () => {
    const secret = "c".repeat(32);
    const sensitive = "do-not-log-me";
    const sleepImpl = vi.fn(async () => {});
    const fetchImpl = vi.fn(async () => redirect(`https://vercel.com/login?token=${sensitive}`));

    const protectedFetch = createProtectionPropagationFetch(config, secret, {
      fetchImpl,
      sleepImpl,
      retryDelays: [1, 2],
    });

    let thrown;
    try {
      await protectedFetch(`${config.deploymentUrl}/sitemap.xml`);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(VercelProtectedPreflightError);
    expect(thrown.message).toContain("/sitemap.xml");
    expect(thrown.message).toContain("redirect=https://vercel.com/login");
    expect(thrown.message).not.toContain(sensitive);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleepImpl.mock.calls.map(([ms]) => ms)).toEqual([1, 2]);
  });
});
