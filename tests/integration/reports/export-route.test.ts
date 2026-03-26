import { describe, expect, it } from "vitest";

import { REPORT_EXPORT_COLUMNS, serializeReportCsv } from "@/lib/reports-csv";
import { reportQuerySchema } from "@/lib/validations";

describe("GET /api/reports/export", () => {
  it("keeps required CSV header order", () => {
    const csv = serializeReportCsv([]);
    expect(csv.split("\n")[0]).toBe(REPORT_EXPORT_COLUMNS.join(","));
  });

  it("supports parity filter query shape with report cases endpoint", () => {
    const parsed = reportQuerySchema.safeParse({
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
      status: "ACTIVE",
      search: "PT",
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    expect(parsed.success).toBe(true);
  });
});
