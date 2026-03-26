import { describe, expect, it } from "vitest";

import { calculatePremiums } from "@/lib/calculations";

describe("financial calculations regression coverage", () => {
  it("handles zero insured value", () => {
    const result = calculatePremiums({ sumInsured: "0", clientRate: "1", insurerRate: "0.5" });
    expect(result.clientPremium).toBe("0.00");
    expect(result.insurerPremium).toBe("0.00");
    expect(result.brokerCommission).toBe("0.00");
  });

  it("handles invalid rate relationship by still returning deterministic numbers", () => {
    const result = calculatePremiums({ sumInsured: "1000", clientRate: "0.1", insurerRate: "0.2" });
    expect(result.clientPremium).toBe("1.00");
    expect(result.insurerPremium).toBe("2.00");
    expect(result.brokerCommission).toBe("-1.00");
  });

  it("computes settlement-like totals via reduction", () => {
    const rows = [
      calculatePremiums({ sumInsured: "100000", clientRate: "0.25", insurerRate: "0.15" }),
      calculatePremiums({ sumInsured: "50000", clientRate: "0.20", insurerRate: "0.10" }),
    ];
    const totalCommission = rows.reduce((sum, row) => sum + Number(row.brokerCommission), 0);
    expect(totalCommission.toFixed(2)).toBe("150.00");
  });
});
