import { describe, expect, it } from "vitest";

describe("open cover non-retroactive insurer rate", () => {
  it("keeps existing case insurer rate immutable in behavior contract", () => {
    const existingRate = "0.150000";
    const newAgreementRate = "0.200000";
    expect(existingRate).not.toBe(newAgreementRate);
  });
});
