import type { EmailTemplateId } from "@/lib/email/templates";

export type CaseVariableInput = {
  caseNumber: string;
  status: string;
  clientName: string;
  clientEmail?: string | null;
  productLine: string;
  cargoProduct?: string | null;
  coverType?: string | null;
  transportMode?: string | null;
  openCoverReference?: string | null;
  insurerName?: string | null;
  currency: string;
  sumInsured: string;
  clientRate: string;
  insurerRate: string;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  origin?: string | null;
  destination?: string | null;
  vessel?: string | null;
  quantity?: string | null;
  etd?: string | null;
  eta?: string | null;
};

export type SettlementVariableInput = {
  settlementNumber?: string | null;
  settlementPeriod?: string | null;
  totalInsurerPremium?: string | null;
  caseCount?: string | null;
};

export type TemplateVariableContextInput = {
  brokerName?: string | null;
  today?: string | null;
};

export type TemplateVariableMap = Record<string, string>;

function normalizeValue(value: string | null | undefined) {
  return value ?? "";
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function buildTemplateVariablesFromCase(
  caseData: CaseVariableInput,
  context?: TemplateVariableContextInput,
  settlement?: SettlementVariableInput,
): TemplateVariableMap {
  return {
    caseNumber: normalizeValue(caseData.caseNumber),
    status: normalizeValue(caseData.status),
    clientName: normalizeValue(caseData.clientName),
    clientEmail: normalizeValue(caseData.clientEmail),
    productLine: normalizeValue(caseData.productLine),
    cargoProduct: normalizeValue(caseData.cargoProduct),
    coverType: normalizeValue(caseData.coverType),
    transportMode: normalizeValue(caseData.transportMode),
    openCoverReference: normalizeValue(caseData.openCoverReference),
    insurerName: normalizeValue(caseData.insurerName),
    currency: normalizeValue(caseData.currency),
    sumInsured: normalizeValue(caseData.sumInsured),
    clientRate: normalizeValue(caseData.clientRate),
    insurerRate: normalizeValue(caseData.insurerRate),
    clientPremium: normalizeValue(caseData.clientPremium),
    insurerPremium: normalizeValue(caseData.insurerPremium),
    brokerCommission: normalizeValue(caseData.brokerCommission),
    origin: normalizeValue(caseData.origin),
    destination: normalizeValue(caseData.destination),
    vessel: normalizeValue(caseData.vessel),
    quantity: normalizeValue(caseData.quantity),
    etd: normalizeValue(caseData.etd),
    eta: normalizeValue(caseData.eta),
    brokerName: normalizeValue(context?.brokerName) || "CargoShield Broker",
    today: normalizeValue(context?.today) || todayIsoDate(),
    settlementNumber: normalizeValue(settlement?.settlementNumber),
    settlementPeriod: normalizeValue(settlement?.settlementPeriod),
    totalInsurerPremium: normalizeValue(settlement?.totalInsurerPremium),
    caseCount: normalizeValue(settlement?.caseCount),
  };
}

export function buildTemplateVariablesFromInput(vars: Record<string, string>): TemplateVariableMap {
  return Object.fromEntries(Object.entries(vars).map(([key, value]) => [key, normalizeValue(value)]));
}

const SAMPLE_BY_TEMPLATE: Record<EmailTemplateId, TemplateVariableMap> = {
  NEW_CASE_NOTIFICATION: {
    caseNumber: "BRK-2026-0001",
    clientName: "PT Sawit Makmur",
    productLine: "CARGO",
    currency: "USD",
    sumInsured: "1200000.00",
    brokerName: "CargoShield Broker",
  },
  DOCUMENTATION_REQUEST: {
    clientName: "PT Sawit Makmur",
    caseNumber: "BRK-2026-0001",
    status: "DOCUMENTATION",
    today: "2026-03-26",
    brokerName: "CargoShield Broker",
  },
  OPEN_COVER_DECLARATION: {
    openCoverReference: "OC-2026-001",
    caseNumber: "BRK-2026-0001",
    cargoProduct: "CPO",
    origin: "Belawan",
    destination: "Port Klang",
    etd: "2026-03-28",
    eta: "2026-04-02",
  },
  BILLING_PREMIUM_NOTICE: {
    clientName: "PT Sawit Makmur",
    caseNumber: "BRK-2026-0001",
    currency: "USD",
    clientPremium: "22000.00",
    insurerPremium: "20000.00",
    brokerCommission: "2000.00",
    brokerName: "CargoShield Broker",
  },
  CASE_CLOSURE_NOTICE: {
    clientName: "PT Sawit Makmur",
    caseNumber: "BRK-2026-0001",
    today: "2026-03-26",
    brokerName: "CargoShield Broker",
  },
  BULK_DECLARATION: {
    caseNumber: "BRK-2026-0001",
    clientName: "PT Sawit Makmur",
    caseCount: "14",
    currency: "USD",
    totalInsurerPremium: "125000.00",
  },
  SETTLEMENT_CONFIRMATION: {
    settlementNumber: "SET-2026-0004",
    settlementPeriod: "2026-03",
    caseCount: "14",
    currency: "USD",
    totalInsurerPremium: "125000.00",
    caseNumber: "BRK-2026-0001",
  },
};

export function buildSampleVariables(templateId: EmailTemplateId): TemplateVariableMap {
  return SAMPLE_BY_TEMPLATE[templateId];
}
