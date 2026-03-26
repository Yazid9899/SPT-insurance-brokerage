import type { CaseVariableInput, SettlementVariableInput, TemplateVariableContextInput } from "@/lib/email/variables";

export const CASE_EMAIL_FIXTURE: CaseVariableInput = {
  caseNumber: "BRK-2026-0001",
  status: "DOCUMENTATION",
  clientName: "PT Sawit Makmur",
  clientEmail: "ops@ptsawit.test",
  productLine: "CARGO",
  cargoProduct: "CPO",
  coverType: "OPEN_COVER",
  transportMode: "MARINE",
  openCoverReference: "OC-2026-001",
  insurerName: "Great Shield",
  currency: "USD",
  sumInsured: "1200000.00",
  clientRate: "1.500000",
  insurerRate: "1.250000",
  clientPremium: "18000.00",
  insurerPremium: "15000.00",
  brokerCommission: "3000.00",
  origin: "Belawan",
  destination: "Port Klang",
  vessel: "MV Nusantara",
  quantity: "22000.00",
  etd: "2026-03-28",
  eta: "2026-04-02",
};

export const SETTLEMENT_EMAIL_FIXTURE: SettlementVariableInput = {
  settlementNumber: "SET-2026-0001",
  settlementPeriod: "2026-03",
  totalInsurerPremium: "15000.00",
  caseCount: "1",
};

export const EMAIL_CONTEXT_FIXTURE: TemplateVariableContextInput = {
  brokerName: "CargoShield Broker",
  today: "2026-03-26",
};

