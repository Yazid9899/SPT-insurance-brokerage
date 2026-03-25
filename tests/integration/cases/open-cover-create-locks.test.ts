import { describe, expect, it } from "vitest";

import { calculatePremiums } from "@/lib/calculations";

describe("open cover case create locks", () => {
  it("recomputes premiums server-side", () => {
    const result = calculatePremiums({ sumInsured: 100000, clientRate: 0.3, insurerRate: 0.15 });
    expect(result.clientPremium).toBe("300.00");
    expect(result.insurerPremium).toBe("150.00");
  });
});
