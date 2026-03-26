"use client";

import { DataTable } from "@/components/shared/data-table";
import type { SettlementItem, SettlementStatusValue } from "@/types";

export function SettlementMatchingTable({
  items,
  status,
  onToggle,
}: {
  items: SettlementItem[];
  status: SettlementStatusValue;
  onToggle: (caseId: string, matched: boolean) => void;
}) {
  const editable = status === "DRAFT";
  const rows = items.map((item) => ({
    include: (
      <input
        type="checkbox"
        checked={item.matched}
        disabled={!editable}
        onChange={(e) => onToggle(item.caseId, e.target.checked)}
      />
    ),
    caseNumber: item.caseNumber,
    caseStatus: item.caseStatus,
    insurerPremium: item.insurerPremium,
    brokerCommission: item.brokerCommission,
  }));

  return (
    <DataTable
      rows={rows}
      columns={[
        { key: "include", label: "Include" },
        { key: "caseNumber", label: "Case #" },
        { key: "caseStatus", label: "Status" },
        { key: "insurerPremium", label: "Insurer Premium" },
        { key: "brokerCommission", label: "Commission" },
      ]}
      pageSize={20}
      emptyState="No eligible cases."
      getRowKey={(row) => String(row.caseNumber)}
    />
  );
}

