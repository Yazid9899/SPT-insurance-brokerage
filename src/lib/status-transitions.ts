import type { CaseLifecycleStatus } from "@/lib/constants";

export const STATUS_TRANSITIONS: Record<CaseLifecycleStatus, CaseLifecycleStatus[]> = {
  DRAFT: ["DOCUMENTATION"],
  DOCUMENTATION: ["UNDERWRITING"],
  UNDERWRITING: ["ACTIVE"],
  ACTIVE: ["BILLING"],
  BILLING: ["SETTLING"],
  SETTLING: ["CLOSED"],
  CLOSED: [],
};

export function getAllowedTransitions(status: CaseLifecycleStatus): CaseLifecycleStatus[] {
  return STATUS_TRANSITIONS[status] ?? [];
}

export function canTransition(fromStatus: CaseLifecycleStatus, toStatus: CaseLifecycleStatus): boolean {
  return getAllowedTransitions(fromStatus).includes(toStatus);
}
