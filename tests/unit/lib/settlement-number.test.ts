import { describe, expect, it } from "vitest";

import { formatSettlementNumber, parseSettlementNumber } from "@/lib/settlement-number";

describe("settlement number helpers", () => {
  it("formats settlement number with padded sequence", () => {
    expect(formatSettlementNumber("2026-03", 7)).toBe("STL-2026-03-007");
  });

  it("parses valid settlement numbers", () => {
    expect(parseSettlementNumber("STL-2026-03-007")).toEqual({ period: "2026-03", sequence: 7 });
  });

  it("returns null for invalid settlement numbers", () => {
    expect(parseSettlementNumber("SEED-STL-2026-03-DRAFT")).toBeNull();
    expect(parseSettlementNumber("STL-2026-03-000")).toBeNull();
    expect(parseSettlementNumber("INVALID")).toBeNull();
  });
});
