import { describe, expect, it } from "vitest";

import { renderTemplate } from "@/lib/email/renderer";
import { assertTemplateVariablesConsistency, extractTemplateVariables, getEmailTemplates } from "@/lib/email/templates";
import { buildTemplateVariablesFromCase } from "@/lib/email/variables";
import { CASE_EMAIL_FIXTURE, EMAIL_CONTEXT_FIXTURE, SETTLEMENT_EMAIL_FIXTURE } from "../../fixtures/email";

describe("email template variable matrix", () => {
  it("keeps template metadata and placeholders consistent", () => {
    expect(() => assertTemplateVariablesConsistency()).not.toThrow();
  });

  it("renders every template with known variable values", () => {
    const vars = buildTemplateVariablesFromCase(CASE_EMAIL_FIXTURE, EMAIL_CONTEXT_FIXTURE, SETTLEMENT_EMAIL_FIXTURE);
    for (const template of getEmailTemplates()) {
      const rendered = renderTemplate({
        template,
        vars,
      });
      expect(rendered.subject.length).toBeGreaterThan(0);
      expect(rendered.body.length).toBeGreaterThan(0);
    }
  });

  it("extracts variables from template content", () => {
    const tokens = extractTemplateVariables("{{caseNumber}} {{clientName}}");
    expect(tokens).toEqual(["caseNumber", "clientName"]);
  });
});
