import { describe, expect, it } from "vitest";

import { parseReportFilters } from "@/lib/reports-service";
import { reportQuerySchema } from "@/lib/validations";

describe("GET /api/reports/cases", () => {
  it("parses inclusive date filtering and pagination", () => {
    const parsed = reportQuerySchema.safeParse({
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
      page: "2",
      pageSize: "50",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const filters = parseReportFilters(parsed.data);
    expect(filters.page).toBe(2);
    expect(filters.pageSize).toBe(50);
  });

  it("parses search/sort/filter behavior", () => {
    const parsed = reportQuerySchema.safeParse({
      search: "BRK-2026",
      status: "ACTIVE,BILLING",
      sortBy: "clientName",
      sortDirection: "asc",
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const filters = parseReportFilters(parsed.data);
    expect(filters.search).toBe("BRK-2026");
    expect(filters.status).toEqual(["ACTIVE", "BILLING"]);
    expect(filters.sortBy).toBe("clientName");
    expect(filters.sortDirection).toBe("asc");
  });

  it("supports DataTable compatible sort/filter field names", () => {
    const parsed = reportQuerySchema.safeParse({
      sortBy: "createdAt",
      sortDirection: "desc",
      productLine: "CARGO",
    });
    expect(parsed.success).toBe(true);
  });
});
