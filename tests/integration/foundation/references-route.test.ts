import { describe, expect, it } from "vitest";

import { CASE_LIFECYCLE, CARGO_SUB_PRODUCTS, PRODUCT_LINES } from "@/lib/constants";

describe("references route contract", () => {
  it("exposes canonical reference arrays", () => {
    expect(PRODUCT_LINES.length).toBe(4);
    expect(CARGO_SUB_PRODUCTS.length).toBe(3);
    expect(CASE_LIFECYCLE.length).toBe(7);
  });
});
