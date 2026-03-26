export type EmailTemplateId =
  | "NEW_CASE_NOTIFICATION"
  | "DOCUMENTATION_REQUEST"
  | "OPEN_COVER_DECLARATION"
  | "BILLING_PREMIUM_NOTICE"
  | "CASE_CLOSURE_NOTICE"
  | "BULK_DECLARATION"
  | "SETTLEMENT_CONFIRMATION";

export type EmailTemplateDefinition = {
  templateId: EmailTemplateId;
  name: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: readonly string[];
};

const VARIABLE_TOKEN_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export const EMAIL_TEMPLATE_CATALOG: readonly EmailTemplateDefinition[] = [
  {
    templateId: "NEW_CASE_NOTIFICATION",
    name: "New Case Notification",
    description: "Notify client that a new insurance case has been created.",
    subjectTemplate: "Case {{caseNumber}} created for {{clientName}}",
    bodyTemplate:
      "Dear {{clientName}},\n\nYour case {{caseNumber}} has been created under {{productLine}}.\nSum Insured: {{currency}} {{sumInsured}}\n\nRegards,\n{{brokerName}}",
    variables: ["caseNumber", "clientName", "productLine", "currency", "sumInsured", "brokerName"],
  },
  {
    templateId: "DOCUMENTATION_REQUEST",
    name: "Documentation Request",
    description: "Request outstanding case documents from the client.",
    subjectTemplate: "Documents required for case {{caseNumber}}",
    bodyTemplate:
      "Dear {{clientName}},\n\nPlease provide pending documents for case {{caseNumber}}.\nCurrent status: {{status}}\n\nDate: {{today}}\nRegards,\n{{brokerName}}",
    variables: ["clientName", "caseNumber", "status", "today", "brokerName"],
  },
  {
    templateId: "OPEN_COVER_DECLARATION",
    name: "Open Cover Declaration",
    description: "Declare shipment under linked open cover agreement.",
    subjectTemplate: "Open cover declaration {{caseNumber}}",
    bodyTemplate:
      "Open cover reference: {{openCoverReference}}\nCase: {{caseNumber}}\nCargo: {{cargoProduct}}\nOrigin: {{origin}}\nDestination: {{destination}}\nETD: {{etd}}\nETA: {{eta}}",
    variables: [
      "openCoverReference",
      "caseNumber",
      "cargoProduct",
      "origin",
      "destination",
      "etd",
      "eta",
    ],
  },
  {
    templateId: "BILLING_PREMIUM_NOTICE",
    name: "Billing/Premium Notice",
    description: "Notify client about premium billing details.",
    subjectTemplate: "Billing notice for case {{caseNumber}}",
    bodyTemplate:
      "Dear {{clientName}},\n\nClient Premium: {{currency}} {{clientPremium}}\nInsurer Premium: {{currency}} {{insurerPremium}}\nBroker Commission: {{currency}} {{brokerCommission}}\n\nRegards,\n{{brokerName}}",
    variables: [
      "clientName",
      "caseNumber",
      "currency",
      "clientPremium",
      "insurerPremium",
      "brokerCommission",
      "brokerName",
    ],
  },
  {
    templateId: "CASE_CLOSURE_NOTICE",
    name: "Case Closure Notice",
    description: "Inform client that case lifecycle has completed.",
    subjectTemplate: "Case {{caseNumber}} is now closed",
    bodyTemplate:
      "Dear {{clientName}},\n\nCase {{caseNumber}} has been marked CLOSED on {{today}}.\nThank you.\n\n{{brokerName}}",
    variables: ["clientName", "caseNumber", "today", "brokerName"],
  },
  {
    templateId: "BULK_DECLARATION",
    name: "Bulk Declaration",
    description: "Confirm declaration details for a bulk case set.",
    subjectTemplate: "Bulk declaration update {{caseNumber}}",
    bodyTemplate:
      "Bulk declaration processed.\nReference case: {{caseNumber}}\nClient: {{clientName}}\nCase count: {{caseCount}}\nTotal insurer premium: {{currency}} {{totalInsurerPremium}}",
    variables: ["caseNumber", "clientName", "caseCount", "currency", "totalInsurerPremium"],
  },
  {
    templateId: "SETTLEMENT_CONFIRMATION",
    name: "Settlement Confirmation",
    description: "Confirm settlement details and payment context.",
    subjectTemplate: "Settlement {{settlementNumber}} confirmation",
    bodyTemplate:
      "Settlement Number: {{settlementNumber}}\nPeriod: {{settlementPeriod}}\nCases: {{caseCount}}\nTotal Insurer Premium: {{currency}} {{totalInsurerPremium}}\nCase Reference: {{caseNumber}}",
    variables: ["settlementNumber", "settlementPeriod", "caseCount", "currency", "totalInsurerPremium", "caseNumber"],
  },
] as const;

const templateMap = new Map<EmailTemplateId, EmailTemplateDefinition>(
  EMAIL_TEMPLATE_CATALOG.map((template) => [template.templateId, template]),
);

export function getEmailTemplates() {
  return EMAIL_TEMPLATE_CATALOG;
}

export function getEmailTemplateById(templateId: string) {
  return templateMap.get(templateId as EmailTemplateId) ?? null;
}

export function extractTemplateVariables(input: string) {
  VARIABLE_TOKEN_REGEX.lastIndex = 0;
  const found = new Set<string>();
  let match = VARIABLE_TOKEN_REGEX.exec(input);
  while (match) {
    found.add(match[1] ?? "");
    match = VARIABLE_TOKEN_REGEX.exec(input);
  }
  return [...found].filter(Boolean);
}

export function assertTemplateVariablesConsistency() {
  for (const template of EMAIL_TEMPLATE_CATALOG) {
    const declared = new Set(template.variables);
    const discovered = [
      ...extractTemplateVariables(template.subjectTemplate),
      ...extractTemplateVariables(template.bodyTemplate),
    ];

    for (const variable of discovered) {
      if (!declared.has(variable)) {
        throw new Error(`Template ${template.templateId} uses undeclared variable: ${variable}`);
      }
    }
  }
}

assertTemplateVariablesConsistency();
