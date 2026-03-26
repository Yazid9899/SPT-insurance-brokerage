import { describe, expect, it } from "vitest";

import { renderTemplate, renderTemplateText } from "@/lib/email/renderer";
import { caseEmailCreateSchema } from "@/lib/validations";

describe("email renderer", () => {
  it("replaces known variables", () => {
    const output = renderTemplateText("Case {{caseNumber}} for {{clientName}}", {
      caseNumber: "BRK-2026-0001",
      clientName: "PT Sawit Makmur",
    });
    expect(output).toBe("Case BRK-2026-0001 for PT Sawit Makmur");
  });

  it("keeps unresolved variables unchanged", () => {
    const output = renderTemplateText("Settlement {{settlementNumber}}", {});
    expect(output).toBe("Settlement {{settlementNumber}}");
  });

  it("renders subject and body together", () => {
    const rendered = renderTemplate({
      template: {
        subjectTemplate: "Hello {{clientName}}",
        bodyTemplate: "Case {{caseNumber}}",
      },
      vars: {
        clientName: "Client A",
        caseNumber: "BRK-2026-0001",
      },
    });
    expect(rendered.subject).toBe("Hello Client A");
    expect(rendered.body).toBe("Case BRK-2026-0001");
  });
});

describe("case email payload validation", () => {
  it("accepts required fields", () => {
    const parsed = caseEmailCreateSchema.safeParse({
      templateId: "NEW_CASE_NOTIFICATION",
      to: "ops@ptsawit.test",
      cc: "",
      subject: "Subject",
      body: "Body",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty to", () => {
    const parsed = caseEmailCreateSchema.safeParse({
      templateId: "NEW_CASE_NOTIFICATION",
      to: "",
      subject: "Subject",
      body: "Body",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty subject and body", () => {
    const parsed = caseEmailCreateSchema.safeParse({
      templateId: "NEW_CASE_NOTIFICATION",
      to: "ops@ptsawit.test",
      subject: " ",
      body: " ",
    });
    expect(parsed.success).toBe(false);
  });
});

