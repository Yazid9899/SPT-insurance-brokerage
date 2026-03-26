import { describe, expect, it } from "vitest";

import { getEmailTemplates } from "@/lib/email/templates";
import { emailTemplatePreviewSchema } from "@/lib/validations";

describe("/api/email-templates and /api/email-templates/preview contracts", () => {
  it("returns exactly seven predefined templates", () => {
    const templates = getEmailTemplates();
    expect(templates).toHaveLength(7);
  });

  it("includes metadata and variable list for each template", () => {
    const template = getEmailTemplates()[0];
    expect(template?.name).toBeTruthy();
    expect(template?.description).toBeTruthy();
    expect(template?.subjectTemplate).toBeTruthy();
    expect(template?.variables.length).toBeGreaterThan(0);
  });

  it("accepts preview payload schema", () => {
    const parsed = emailTemplatePreviewSchema.safeParse({
      templateId: "NEW_CASE_NOTIFICATION",
      vars: {
        caseNumber: "BRK-2026-0001",
      },
    });
    expect(parsed.success).toBe(true);
  });
});

