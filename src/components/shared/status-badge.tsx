import type { CaseLifecycleStatus } from "@/lib/constants";
import { STATUS_COLOR_MAP } from "@/lib/constants";

export function StatusBadge({ status }: { status: CaseLifecycleStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR_MAP[status]}`}>
      {status}
    </span>
  );
}
