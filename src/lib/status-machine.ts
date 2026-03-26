import type { CaseStatus } from "@prisma/client";

import { getAllowedTransitions as nextAllowedTransitions } from "@/lib/status-transitions";

export function getAllowedTransitions(status: CaseStatus): CaseStatus[] {
  return nextAllowedTransitions(status);
}
