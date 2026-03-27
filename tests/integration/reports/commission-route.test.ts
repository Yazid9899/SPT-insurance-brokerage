import { describe, expect, it } from "vitest";

import { reportQuerySchema } from "@/lib/validations";

describe("GET /api/reports/commission", () => {
  it("accepts insurer breakdown and monthly trend query", () => {
    const parsed = reportQuerySchema.safeParse({
      dateFrom: "2026-01-01",
      dateTo: "2026-03-31",
      insurerId: "cmaaaaaaaaaaaaaaaaaaaaaa2",
      productLine: "CARGO",
    });
    expect(parsed.success).toBe(true);
  });
});
