import { describe, expect, it } from "vitest";

import { coerceDate, coerceNumber } from "@/lib/bulk-upload/parser";

describe("bulk upload parser coercion", () => {
  it("coerces currency-like string to number", () => {
    expect(coerceNumber("USD 250,000.50")).toBe(250000.5);
  });

  it("returns null for invalid number", () => {
    expect(coerceNumber("abc")).toBeNull();
  });

  it("coerces ISO string date", () => {
    expect(coerceDate("2026-02-01")).toBe("2026-02-01");
  });
});

