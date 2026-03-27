import { describe, expect, it } from "vitest";

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
  });

  it("parses party filters", () => {
    const parsed = reportQuerySchema.safeParse({
      clientId: "cmaaaaaaaaaaaaaaaaaaaaaa1",
      insurerId: "cmaaaaaaaaaaaaaaaaaaaaaa2",
      sortBy: "clientName",
      sortDirection: "asc",
    });
    expect(parsed.success).toBe(true);
  });
});
