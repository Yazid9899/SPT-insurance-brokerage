import { describe, expect, it } from "vitest";

import { aggregateSettlementTotals } from "@/lib/settlement-service";

describe("settlement totals aggregation", () => {
  it("aggregates only matched items using decimal-safe strings", () => {
    const totals = aggregateSettlementTotals([
      { matched: true, insurerPremium: "10.10", brokerCommission: "1.05" },
      { matched: true, insurerPremium: "20.20", brokerCommission: "2.10" },
      { matched: false, insurerPremium: "999.99", brokerCommission: "999.99" },
    ]);

    expect(totals.totalInsurerPremium).toBe("30.30");
    expect(totals.totalBrokerCommission).toBe("3.15");
  });
});

