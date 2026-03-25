import type { CaseLifecycleStatus } from "@/lib/constants";

const transitions: Record<CaseLifecycleStatus, CaseLifecycleStatus[]> = {
  DRAFT: ["DOCUMENTATION"],
  DOCUMENTATION: ["UNDERWRITING"],
  UNDERWRITING: ["ACTIVE"],
  ACTIVE: ["BILLING"],
  BILLING: ["SETTLING"],
  SETTLING: ["CLOSED"],
  CLOSED: [],
};

export function getAllowedTransitions(status: CaseLifecycleStatus): CaseLifecycleStatus[] {
  return transitions[status];
}
