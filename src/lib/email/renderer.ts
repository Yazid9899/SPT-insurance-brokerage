import type { EmailTemplateDefinition } from "@/lib/email/templates";

export type TemplateRenderInput = {
  template: Pick<EmailTemplateDefinition, "subjectTemplate" | "bodyTemplate">;
  vars: Record<string, string>;
};

const TOKEN_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function renderTemplateText(input: string, vars: Record<string, string>) {
  return input.replace(TOKEN_REGEX, (token, key: string) => {
    const value = vars[key];
    if (value === undefined || value === null || value === "") {
      return token;
    }
    return String(value);
  });
}

export function renderTemplate({ template, vars }: TemplateRenderInput) {
  return {
    subject: renderTemplateText(template.subjectTemplate, vars),
    body: renderTemplateText(template.bodyTemplate, vars),
  };
}

