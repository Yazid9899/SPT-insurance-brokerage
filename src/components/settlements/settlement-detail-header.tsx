"use client";

import { useState } from "react";

import type { SettlementDetail } from "@/types";

function statusClass(status: SettlementDetail["status"]) {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";
    case "CONFIRMED":
      return "bg-amber-100 text-amber-700";
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export function SettlementDetailHeader({
  settlement,
  onConfirm,
  onPay,
}: {
  settlement: SettlementDetail;
  onConfirm: (note?: string) => Promise<void>;
  onPay: (payload: { paymentDate: string; bankTransferReference: string; note?: string }) => Promise<void>;
}) {
  const [confirmNote, setConfirmNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentRef, setPaymentRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(confirmNote || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm");
    } finally {
      setBusy(false);
    }
  }

  async function handlePay() {
    setBusy(true);
    setError(null);
    try {
      await onPay({ paymentDate, bankTransferReference: paymentRef, note: payNote || undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to pay");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded border bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">{settlement.settlementNumber}</h1>
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(settlement.status)}`}>{settlement.status}</span>
      </div>
      <p className="text-sm text-slate-700">
        {settlement.insurerName} · {settlement.period}
      </p>

      {settlement.status === "DRAFT" ? (
        <div className="space-y-2 rounded border p-3">
          <label className="block space-y-1">
            <span className="text-sm">Confirm note (optional)</span>
            <input className="w-full rounded border px-2 py-1" value={confirmNote} onChange={(e) => setConfirmNote(e.target.value)} />
          </label>
          <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" disabled={busy} onClick={() => void handleConfirm()}>
            {busy ? "Confirming..." : "Confirm Settlement"}
          </button>
        </div>
      ) : null}

      {settlement.status === "CONFIRMED" ? (
        <div className="space-y-2 rounded border p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm">Payment Date</span>
              <input type="date" className="w-full rounded border px-2 py-1" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Bank Transfer Reference</span>
              <input className="w-full rounded border px-2 py-1" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm">Pay note (optional)</span>
            <input className="w-full rounded border px-2 py-1" value={payNote} onChange={(e) => setPayNote(e.target.value)} />
          </label>
          <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" disabled={busy || !paymentRef.trim()} onClick={() => void handlePay()}>
            {busy ? "Marking paid..." : "Mark as Paid"}
          </button>
        </div>
      ) : null}

      {settlement.status === "PAID" ? (
        <div className="rounded border bg-emerald-50 p-3 text-sm">
          Paid on {settlement.paymentDate ?? "-"} · Ref: {settlement.bankTransferReference ?? "-"}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

