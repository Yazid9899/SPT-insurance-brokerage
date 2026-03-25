import { describe, expect, it } from "vitest";

import { CASE_LIFECYCLE, CARGO_SUB_PRODUCTS, PRODUCT_LINES } from "@/lib/constants";

describe("foundation constants", () => {
  it("keeps lifecycle ordered and taxonomy complete", () => {
    expect(CASE_LIFECYCLE).toEqual([
      "DRAFT",
      "DOCUMENTATION",
      "UNDERWRITING",
      "ACTIVE",
      "BILLING",
      "SETTLING",
      "CLOSED",
    ]);
    expect(PRODUCT_LINES).toEqual(["CARGO", "PROPERTY", "MARINE_HULL", "UTILITY"]);
    expect(CARGO_SUB_PRODUCTS).toEqual(["CPO", "BIODIESEL", "SHORTENING"]);
  });
});
