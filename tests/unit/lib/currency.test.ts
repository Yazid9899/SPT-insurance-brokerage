import { describe, expect, it } from "vitest";

import { decimalToString, formatCurrency, toDecimal } from "@/lib/currency";

describe("currency helpers", () => {
  it("serializes and formats safely", () => {
    const decimal = toDecimal("1234.50");
    expect(decimalToString(decimal)).toBe("1234.5");
    expect(formatCurrency("1234.5", "USD")).toContain("$");
  });
});
