import { describe, expect, it } from "vitest";

import { renderTemplateText } from "@/lib/email/renderer";
import { getEmailTemplateById } from "@/lib/email/templates";
import { buildTemplateVariablesFromCase } from "@/lib/email/variables";
import { CASE_EMAIL_FIXTURE, EMAIL_CONTEXT_FIXTURE } from "../../fixtures/email";

describe("template preview fallback behavior", () => {
  it("keeps unresolved tokens unchanged", () => {
    const rendered = renderTemplateText("Settlement {{settlementNumber}}", {});
    expect(rendered).toBe("Settlement {{settlementNumber}}");
  });

  it("renders settlement template without settlement context by preserving missing tokens", () => {
    const template = getEmailTemplateById("SETTLEMENT_CONFIRMATION");
    expect(template).toBeTruthy();
    if (!template) {
      return;
    }

    const vars = buildTemplateVariablesFromCase(CASE_EMAIL_FIXTURE, EMAIL_CONTEXT_FIXTURE);
    const rendered = renderTemplateText(template.bodyTemplate, vars);
    expect(rendered).toContain("{{settlementNumber}}");
  });
});
