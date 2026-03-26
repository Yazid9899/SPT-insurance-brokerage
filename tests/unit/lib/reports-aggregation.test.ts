import { describe, expect, it } from "vitest";

import { parseReportFilters } from "@/lib/reports-service";
import { reportQuerySchema } from "@/lib/validations";

describe("report aggregation/filter primitives", () => {
  it("parses inclusive date range and list filters", () => {
    const parsed = reportQuerySchema.safeParse({
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
      status: "ACTIVE,BILLING",
      productLine: "CARGO",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const filters = parseReportFilters(parsed.data);
    expect(filters.status).toEqual(["ACTIVE", "BILLING"]);
    expect(filters.productLine).toEqual(["CARGO"]);
    expect(filters.dateFrom?.toISOString().startsWith("2026-03-01")).toBe(true);
    expect(filters.dateTo?.toISOString().startsWith("2026-03-31")).toBe(true);
  });
});
