import { describe, expect, it } from "vitest";

import { formatCaseNumber, parseCaseNumber } from "@/lib/case-number";

describe("case number helpers", () => {
  it("formats case number with padded sequence", () => {
    expect(formatCaseNumber(2026, 12)).toBe("BRK-2026-0012");
  });

  it("parses valid case numbers", () => {
    expect(parseCaseNumber("BRK-2026-0012")).toEqual({ year: 2026, sequence: 12 });
  });

  it("returns null for invalid case numbers", () => {
    expect(parseCaseNumber("BRK-DEMO-2026-0001")).toBeNull();
    expect(parseCaseNumber("BRK-2026-0000")).toBeNull();
    expect(parseCaseNumber("INVALID")).toBeNull();
  });
});
