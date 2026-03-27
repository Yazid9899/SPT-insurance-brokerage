import { describe, expect, it } from "vitest";

import { apiError } from "@/lib/api-error";
import { apiErrorSchema } from "@/lib/validations";

describe("party validation error shape", () => {
  it("matches { error, details? } for party validation failures", () => {
    const payload = apiError("Selected client is not linked to open cover", { field: "clientId" });
    const parsed = apiErrorSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });
});
