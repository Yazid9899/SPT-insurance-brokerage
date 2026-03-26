"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SettlementCreateDialog } from "@/components/settlements/settlement-create-dialog";
import { SettlementsTable } from "@/components/settlements/settlements-table";
import type { SettlementDetail, SettlementListItem } from "@/types";

export function SettlementsPageClient({ initialRows }: { initialRows: SettlementListItem[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);

  async function handleCreated(detail: SettlementDetail) {
    const response = await fetch("/api/settlements");
    if (response.ok) {
      const body = (await response.json()) as { items: SettlementListItem[] };
      setRows(body.items);
    }
    router.push(`/settlements/${detail.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SettlementCreateDialog defaultPeriod={new Date().toISOString().slice(0, 7)} onCreated={(detail) => void handleCreated(detail)} />
      <SettlementsTable rows={rows} />
    </div>
  );
}

