import { describe, expect, it } from "vitest";

import { reportQuerySchema } from "@/lib/validations";

describe("GET /api/reports/summary", () => {
  it("accepts valid date range query", () => {
    const parsed = reportQuerySchema.safeParse({ dateFrom: "2026-03-01", dateTo: "2026-03-31" });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid date ranges", () => {
    const parsed = reportQuerySchema.safeParse({ dateFrom: "2026-03-31", dateTo: "2026-03-01" });
    expect(parsed.success).toBe(false);
  });

  it("accepts sort and paging defaults", () => {
    const parsed = reportQuerySchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.page).toBe(1);
    expect(parsed.data.pageSize).toBe(20);
    expect(parsed.data.sortBy).toBe("createdAt");
  });
});
