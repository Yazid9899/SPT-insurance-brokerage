"use client";

import { useState } from "react";

import type { SettlementDetail } from "@/types";

export function SettlementCreateDialog({
  defaultPeriod,
  onCreated,
}: {
  defaultPeriod: string;
  onCreated: (detail: SettlementDetail) => void;
}) {
  const [open, setOpen] = useState(false);
  const [insurerName, setInsurerName] = useState("");
  const [period, setPeriod] = useState(defaultPeriod);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/settlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insurerName, period }),
    });
    const body = (await response.json().catch(() => null)) as SettlementDetail | { error?: string } | null;
    if (!response.ok || !body || ("error" in body && body.error)) {
      setError(("error" in (body ?? {}) ? (body as { error?: string }).error : null) ?? "Failed to create settlement");
      setBusy(false);
      return;
    }
    onCreated(body as SettlementDetail);
    setBusy(false);
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <button type="button" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={() => setOpen((v) => !v)}>
        {open ? "Close" : "Create Settlement"}
      </button>
      {open ? (
        <div className="rounded border bg-white p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm">Insurer Name</span>
              <input className="w-full rounded border px-2 py-1" value={insurerName} onChange={(e) => setInsurerName(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Period (YYYY-MM)</span>
              <input className="w-full rounded border px-2 py-1" value={period} onChange={(e) => setPeriod(e.target.value)} />
            </label>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <button type="button" className="mt-3 rounded border px-3 py-1 text-sm" disabled={busy} onClick={() => void submit()}>
            {busy ? "Creating..." : "Create DRAFT Settlement"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

