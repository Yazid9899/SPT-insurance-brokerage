"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SettlementDetailHeader } from "@/components/settlements/settlement-detail-header";
import { SettlementMatchingTable } from "@/components/settlements/settlement-matching-table";
import { SettlementTotalsCard } from "@/components/settlements/settlement-totals-card";
import type { SettlementDetail } from "@/types";

export function SettlementDetailClient({ initial }: { initial: SettlementDetail }) {
  const router = useRouter();
  const [detail, setDetail] = useState(initial);
  const [pendingItems, setPendingItems] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  function currentItems() {
    return detail.items.map((item) => ({
      ...item,
      matched: pendingItems[item.caseId] ?? item.matched,
    }));
  }

  function computedTotals() {
    const items = currentItems().filter((i) => i.matched);
    return {
      caseCount: items.length,
      totalInsurerPremium: items.reduce((sum, item) => sum + Number(item.insurerPremium), 0).toFixed(2),
      totalBrokerCommission: items.reduce((sum, item) => sum + Number(item.brokerCommission), 0).toFixed(2),
    };
  }

  async function persistMatching() {
    if (detail.status !== "DRAFT" || Object.keys(pendingItems).length === 0) {
      return;
    }
    setSaving(true);
    const response = await fetch(`/api/settlements/${detail.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: Object.entries(pendingItems).map(([caseId, matched]) => ({ caseId, matched })),
      }),
    });
    const body = (await response.json().catch(() => null)) as SettlementDetail | { error?: string } | null;
    setSaving(false);
    if (!response.ok || !body || ("error" in body && body.error)) {
      throw new Error(("error" in (body ?? {}) ? (body as { error?: string }).error : null) ?? "Failed to save matching");
    }
    setDetail(body as SettlementDetail);
    setPendingItems({});
    router.refresh();
  }

  async function handleConfirm(note?: string) {
    await persistMatching();
    const response = await fetch(`/api/settlements/${detail.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const body = (await response.json().catch(() => null)) as SettlementDetail | { error?: string } | null;
    if (!response.ok || !body || ("error" in body && body.error)) {
      throw new Error(("error" in (body ?? {}) ? (body as { error?: string }).error : null) ?? "Failed to confirm settlement");
    }
    setDetail(body as SettlementDetail);
    router.refresh();
  }

  async function handlePay(payload: { paymentDate: string; bankTransferReference: string; note?: string }) {
    await persistMatching();
    const response = await fetch(`/api/settlements/${detail.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as SettlementDetail | { error?: string } | null;
    if (!response.ok || !body || ("error" in body && body.error)) {
      throw new Error(("error" in (body ?? {}) ? (body as { error?: string }).error : null) ?? "Failed to mark settlement paid");
    }
    setDetail(body as SettlementDetail);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SettlementDetailHeader settlement={detail} onConfirm={handleConfirm} onPay={handlePay} />
      <SettlementTotalsCard totals={{ ...computedTotals() }} />
      <SettlementMatchingTable
        items={currentItems()}
        status={detail.status}
        onToggle={(caseId, matched) => setPendingItems((prev) => ({ ...prev, [caseId]: matched }))}
      />
      {detail.status === "DRAFT" ? (
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          disabled={saving || Object.keys(pendingItems).length === 0}
          onClick={() => void persistMatching()}
        >
          {saving ? "Saving..." : "Save Matching"}
        </button>
      ) : null}
    </div>
  );
}

