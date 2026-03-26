"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CaseDocumentsTab } from "@/components/cases/case-documents-tab";
import { StatusBadge } from "@/components/shared/status-badge";

const TAB_KEYS = ["Details", "Documents", "Emails", "History"] as const;
type TabKey = (typeof TAB_KEYS)[number];

type HistoryItem = {
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
  changedBy: string;
  note: string | null;
};

type CaseDetailData = {
  id: string;
  caseNumber: string;
  status: "DRAFT" | "DOCUMENTATION" | "UNDERWRITING" | "ACTIVE" | "BILLING" | "SETTLING" | "CLOSED";
  productLine: string;
  cargoProduct: string | null;
  coverType: string | null;
  clientName: string;
  currency: string;
  sumInsured: string;
  clientRate: string;
  insurerRate: string;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: string | null;
  etd: string | null;
  eta: string | null;
  notes: string | null;
  openCoverId: string | null;
  documentsApiUrl: string;
  statusHistory: HistoryItem[];
};

function allowedNext(status: CaseDetailData["status"]) {
  switch (status) {
    case "DRAFT":
      return ["DOCUMENTATION"];
    case "DOCUMENTATION":
      return ["UNDERWRITING", "DRAFT"];
    case "UNDERWRITING":
      return ["ACTIVE", "DOCUMENTATION"];
    case "ACTIVE":
      return ["BILLING"];
    default:
      return [];
  }
}

export function CaseDetail({ data }: { data: CaseDetailData }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Details");
  const [status, setStatus] = useState(data.status);
  const [history, setHistory] = useState<HistoryItem[]>(data.statusHistory ?? []);
  const [busy, setBusy] = useState(false);

  const nextTransitions = useMemo(() => allowedNext(status), [status]);
  const canDelete = status === "DRAFT";
  const canEdit = status === "DRAFT" || status === "DOCUMENTATION" || status === "UNDERWRITING";

  async function handleTransition(next: string) {
    const note = window.prompt("Optional note (required for backward transitions)", "") ?? "";

    let debitNoteAcknowledged: boolean | undefined;
    if (status === "ACTIVE" && next === "BILLING") {
      debitNoteAcknowledged = window.confirm("Attach/acknowledge debit note before moving to BILLING?");
      if (!debitNoteAcknowledged) {
        return;
      }
    }

    setBusy(true);
    const response = await fetch(`/api/cases/${data.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toStatus: next, note, debitNoteAcknowledged }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(body?.error ?? "Failed to transition case");
      setBusy(false);
      return;
    }

    const updated = (await response.json()) as { status: CaseDetailData["status"] };
    setStatus(updated.status);
    setHistory((prev) => [
      {
        fromStatus: status,
        toStatus: updated.status,
        changedAt: new Date().toISOString(),
        changedBy: "current-user",
        note: note || null,
      },
      ...prev,
    ]);
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this Draft case? This action requires confirmation.")) {
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/cases/${data.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(body?.error ?? "Failed to delete case");
      setBusy(false);
      return;
    }

    router.push("/cases");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">{data.caseNumber}</h1>
          <StatusBadge status={status} />
          <span className="text-sm text-slate-600">{data.clientName}</span>
          <span className="text-sm text-slate-600">
            {data.productLine} {data.cargoProduct ? `· ${data.cargoProduct}` : ""} {data.coverType ? `· ${data.coverType}` : ""}
          </span>
        </div>
        {data.openCoverId ? (
          <p className="mt-2 text-sm">
            Open Cover: <a href={`/open-covers/${data.openCoverId}`} className="text-blue-600 underline">{data.openCoverId}</a>
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {canEdit ? (
            <a className="rounded border px-3 py-1 text-sm" href={`/cases/${data.id}/edit`}>
              Edit
            </a>
          ) : null}
          <button className="rounded border px-3 py-1 text-sm" disabled={!canDelete || busy} onClick={handleDelete}>
            Delete
          </button>
          {nextTransitions.map((next) => (
            <button key={next} className="rounded bg-slate-900 px-3 py-1 text-sm text-white" disabled={busy} onClick={() => void handleTransition(next)}>
              Move to {next}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="mb-3 flex gap-2">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              className={`rounded px-3 py-1 text-sm ${tab === key ? "bg-slate-900 text-white" : "border"}`}
              onClick={() => setTab(key)}
            >
              {key}
            </button>
          ))}
        </div>

        {tab === "Details" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 text-sm">
              <p><strong>Origin:</strong> {data.origin ?? "-"}</p>
              <p><strong>Destination:</strong> {data.destination ?? "-"}</p>
              <p><strong>Vessel/Fleet:</strong> {data.vessel ?? "-"}</p>
              <p><strong>Quantity:</strong> {data.quantity ?? "-"}</p>
              <p><strong>ETD:</strong> {data.etd ? new Date(data.etd).toLocaleDateString() : "-"}</p>
              <p><strong>ETA:</strong> {data.eta ? new Date(data.eta).toLocaleDateString() : "-"}</p>
            </div>
            <div className="rounded border bg-slate-50 p-3 text-sm">
              <p><strong>Sum Insured:</strong> {data.currency} {data.sumInsured}</p>
              <p><strong>Client Rate:</strong> {data.clientRate}% {"->"} {data.currency} {data.clientPremium}</p>
              <p><strong>Insurer Rate:</strong> {data.insurerRate}% {"->"} {data.currency} {data.insurerPremium}</p>
              <p className="text-base font-semibold"><strong>Broker Commission:</strong> {data.currency} {data.brokerCommission}</p>
            </div>
          </div>
        ) : null}

        {tab === "Documents" ? <CaseDocumentsTab caseId={data.id} status={status} endpoint={data.documentsApiUrl} /> : null}
        {tab === "Emails" ? <p className="text-sm text-slate-600">Emails tab placeholder.</p> : null}
        {tab === "History" ? (
          <div className="space-y-2 text-sm">
            {history.length === 0 ? <p className="text-slate-600">No transitions logged yet.</p> : null}
            {history.map((item, index) => (
              <div key={`${item.changedAt}-${index}`} className="rounded border p-2">
                <p>
                  <strong>{item.fromStatus ?? "-"}</strong> {"->"} <strong>{item.toStatus}</strong>
                </p>
                <p>{new Date(item.changedAt).toLocaleString()}</p>
                {item.note ? <p>Note: {item.note}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

