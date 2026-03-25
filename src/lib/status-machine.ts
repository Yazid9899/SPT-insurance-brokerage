import type { CaseLifecycleStatus } from "@/lib/constants";
import { getAllowedTransitions as nextAllowedTransitions } from "@/lib/status-transitions";

export function getAllowedTransitions(status: CaseLifecycleStatus): CaseLifecycleStatus[] {
  return nextAllowedTransitions(status);
}
