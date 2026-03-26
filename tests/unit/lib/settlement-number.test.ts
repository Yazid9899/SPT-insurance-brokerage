import { describe, expect, it } from "vitest";

import { formatSettlementNumber } from "@/lib/settlement-number";

describe("settlement number formatting", () => {
  it("formats STL-YYYY-MM-NNN", () => {
    expect(formatSettlementNumber("2026-03", 1)).toBe("STL-2026-03-001");
    expect(formatSettlementNumber("2026-12", 25)).toBe("STL-2026-12-025");
  });
});

