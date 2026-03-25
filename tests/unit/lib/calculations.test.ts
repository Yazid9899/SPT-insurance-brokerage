import { describe, expect, it } from "vitest";

import { calculatePremiums } from "@/lib/calculations";

describe("calculatePremiums", () => {
  it("calculates premiums and commission with decimal-safe output", () => {
    const result = calculatePremiums({
      sumInsured: "100000.00",
      clientRate: "0.25",
      insurerRate: "0.15",
    });

    expect(result.clientPremium).toBe("250.00");
    expect(result.insurerPremium).toBe("150.00");
    expect(result.brokerCommission).toBe("100.00");
  });

  it("handles edge precision correctly", () => {
    const result = calculatePremiums({
      sumInsured: "123456789.99",
      clientRate: "0.333333",
      insurerRate: "0.111111",
    });

    expect(result.clientPremium).toBe("411522.22");
    expect(result.insurerPremium).toBe("137174.07");
    expect(result.brokerCommission).toBe("274348.15");
  });
});
