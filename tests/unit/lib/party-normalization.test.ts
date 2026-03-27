import { describe, expect, it } from "vitest";

import { makeClientIdentityKey, makeInsurerIdentityKey, normalizeCompany, normalizeName } from "@/lib/party-normalization";

describe("party-normalization", () => {
  it("normalizes name and company values deterministically", () => {
    expect(normalizeName("  ACME   Trading, Ltd. ")).toBe("acme trading ltd");
    expect(normalizeCompany(" PT. Nusantara   Jaya ")).toBe("pt nusantara jaya");
  });

  it("builds stable client and insurer identity keys", () => {
    expect(makeClientIdentityKey(" ACME ", " PT. Nusantara ")).toBe("acme::pt nusantara");
    expect(makeInsurerIdentityKey("  Great   Insurer  ")).toBe("great insurer");
  });
});

