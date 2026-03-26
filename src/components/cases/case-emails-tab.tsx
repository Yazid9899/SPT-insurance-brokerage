"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ComposeEmailDialog } from "@/components/cases/compose-email-dialog";
import type { CaseVariableInput, SettlementVariableInput } from "@/lib/email/variables";
import type { CaseEmailItem } from "@/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export function CaseEmailsTab({
  caseId,
  clientEmail,
  caseData,
  settlementData,
}: {
  caseId: string;
  clientEmail?: string | null;
  caseData: CaseVariableInput;
  settlementData?: SettlementVariableInput;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CaseEmailItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/cases/${caseId}/emails`, { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as { items?: CaseEmailItem[]; error?: string } | null;
    if (!response.ok) {
      window.alert(payload?.error ?? "Failed to load emails");
      setLoading(false);
      return;
    }
    setItems(payload?.items ?? []);
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    void fetchEmails();
  }, [fetchEmails]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
    [items],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Logged emails are stored for audit. Sending is disabled in dev mode.</p>
        <ComposeEmailDialog
          caseId={caseId}
          clientEmail={clientEmail}
          caseData={caseData}
          settlementData={settlementData}
          onLogged={(item) => setItems((prev) => [item, ...prev])}
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading emails...</p>
      ) : sorted.length === 0 ? (
        <p className="rounded border bg-white p-3 text-sm text-slate-600">No emails logged yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="rounded border bg-white p-3 text-sm">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 text-left"
                  onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                >
                  <span>
                    <strong>{item.templateName ?? item.templateId ?? "Custom Email"}</strong> · {item.to}
                    <br />
                    <span className="text-slate-600">{item.subject}</span>
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(item.sentAt)}</span>
                </button>
                {expanded ? (
                  <div className="mt-2 space-y-2 border-t pt-2">
                    {item.cc ? <p>CC: {item.cc}</p> : null}
                    <pre className="whitespace-pre-wrap rounded border bg-slate-50 p-2">{item.body}</pre>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

