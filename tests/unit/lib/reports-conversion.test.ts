import { describe, expect, it } from "vitest";

import { convertToUsdExposure } from "@/lib/calculations";

describe("report currency conversion", () => {
  it("converts supported currencies to USD exposure", () => {
    expect(convertToUsdExposure({ amount: "16000", currency: "IDR" })?.toFixed(2)).toBe("1.00");
    expect(convertToUsdExposure({ amount: "1.35", currency: "SGD" })?.toFixed(2)).toBe("1.00");
    expect(convertToUsdExposure({ amount: "4.70", currency: "MYR" })?.toFixed(2)).toBe("1.00");
    expect(convertToUsdExposure({ amount: "1", currency: "USD" })?.toFixed(2)).toBe("1.00");
  });
});
