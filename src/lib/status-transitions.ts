import type { CaseStatus } from "@prisma/client";

type TransitionValidationInput = {
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  caseData: {
    productLine: string;
    clientName: string;
    cargoProduct: string | null;
    coverType: string | null;
    origin: string | null;
    destination: string | null;
    sumInsured: unknown;
    clientRate: unknown;
    insurerRate: unknown;
  };
  documentCount?: number;
  note?: string | null;
  debitNoteAcknowledged?: boolean;
  fromSettlementFlow?: boolean;
  settlementPaid?: boolean;
};

export const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  DRAFT: ["DOCUMENTATION"],
  DOCUMENTATION: ["UNDERWRITING", "DRAFT"],
  UNDERWRITING: ["ACTIVE", "DOCUMENTATION"],
  ACTIVE: ["BILLING"],
  BILLING: ["SETTLING"],
  SETTLING: ["CLOSED"],
  CLOSED: [],
};

export function getAllowedTransitions(status: CaseStatus): CaseStatus[] {
  return STATUS_TRANSITIONS[status] ?? [];
}

export function canTransition(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
  return getAllowedTransitions(fromStatus).includes(toStatus);
}

export function isBackwardTransition(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
  return (fromStatus === "DOCUMENTATION" && toStatus === "DRAFT") || (fromStatus === "UNDERWRITING" && toStatus === "DOCUMENTATION");
}

function hasGt(value: unknown): value is { gt: (x: number) => boolean } {
  return typeof value === "object" && value !== null && "gt" in value && typeof value.gt === "function";
}

function hasGte(value: unknown): value is { gte: (x: number | string) => boolean } {
  return typeof value === "object" && value !== null && "gte" in value && typeof value.gte === "function";
}

function gtZero(value: unknown): boolean {
  if (typeof value === "number") {
    return value > 0;
  }
  if (hasGt(value)) {
    return value.gt(0);
  }
  return Number(value) > 0;
}

function gte(left: unknown, right: unknown): boolean {
  if (typeof left === "number") {
    return left >= Number(right);
  }
  if (hasGte(left)) {
    return left.gte(String(right));
  }
  return Number(left) >= Number(right);
}

export function validateTransitionInput(input: TransitionValidationInput): string | null {
  const { fromStatus, toStatus, caseData } = input;

  if (!canTransition(fromStatus, toStatus)) {
    return "Invalid status transition";
  }

  if (isBackwardTransition(fromStatus, toStatus) && !input.note?.trim()) {
    return "A note is required for backward transitions";
  }

  if (fromStatus === "DRAFT" && toStatus === "DOCUMENTATION") {
    if (!caseData.clientName || !caseData.productLine) {
      return "Client name and product line are required";
    }
    if (caseData.productLine === "CARGO" && (!caseData.cargoProduct || !caseData.coverType)) {
      return "cargoProduct and coverType are required for cargo cases";
    }
  }

  if (fromStatus === "DOCUMENTATION" && toStatus === "UNDERWRITING") {
    if (!input.documentCount || input.documentCount < 1) {
      return "At least one document is required";
    }
    if (caseData.productLine === "CARGO" && (!caseData.origin || !caseData.destination)) {
      return "origin and destination are required for cargo cases";
    }
  }

  if (fromStatus === "UNDERWRITING" && toStatus === "ACTIVE") {
    if (!gtZero(caseData.sumInsured) || !gtZero(caseData.clientRate) || !gtZero(caseData.insurerRate)) {
      return "sum insured and rates must be greater than zero";
    }
    if (!gte(caseData.clientRate, caseData.insurerRate)) {
      return "clientRate must be greater than or equal to insurerRate";
    }
  }

  if (fromStatus === "ACTIVE" && toStatus === "BILLING" && !input.debitNoteAcknowledged) {
    return "Debit note acknowledgment is required before moving to BILLING";
  }

  if (fromStatus === "BILLING" && toStatus === "SETTLING" && !input.fromSettlementFlow) {
    return "BILLING to SETTLING must be triggered from settlement flow";
  }

  if (fromStatus === "SETTLING" && toStatus === "CLOSED" && !input.settlementPaid) {
    return "SETTLING to CLOSED requires paid settlement trigger";
  }

  return null;
}
