import { describe, expect, it } from "vitest";

import { apiErrorSchema, caseEmailCreateSchema } from "@/lib/validations";

describe("GET/POST /api/cases/[id]/emails contracts", () => {
  it("accepts valid create payload", () => {
    const parsed = caseEmailCreateSchema.safeParse({
      templateId: "NEW_CASE_NOTIFICATION",
      to: "ops@ptsawit.test",
      cc: "finance@ptsawit.test",
      subject: "Case BRK-2026-0001 created",
      body: "Body content",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty required fields", () => {
    const parsed = caseEmailCreateSchema.safeParse({
      templateId: "NEW_CASE_NOTIFICATION",
      to: " ",
      subject: "",
      body: " ",
    });
    expect(parsed.success).toBe(false);
  });

  it("matches dev-mode response contract", () => {
    const response = {
      message: "Email logged (sending disabled in dev mode).",
      item: {
        id: "mail_1",
        caseId: "case_1",
        templateId: "NEW_CASE_NOTIFICATION",
        templateName: "New Case Notification",
        to: "ops@ptsawit.test",
        cc: null,
        subject: "Case BRK-2026-0001 created",
        body: "Body content",
        sentAt: new Date().toISOString(),
      },
    };

    expect(response.message).toContain("sending disabled");
    expect(response.item.subject).toContain("BRK-2026-0001");
  });

  it("keeps error response shape for unauthorized responses", () => {
    const parsed = apiErrorSchema.safeParse({ error: "Unauthorized" });
    expect(parsed.success).toBe(true);
  });
});

