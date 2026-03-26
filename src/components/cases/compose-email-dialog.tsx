"use client";

import { useEffect, useMemo, useState } from "react";

import { renderTemplate } from "@/lib/email/renderer";
import type { CaseVariableInput, SettlementVariableInput, TemplateVariableContextInput } from "@/lib/email/variables";
import { buildTemplateVariablesFromCase } from "@/lib/email/variables";
import type { CaseEmailItem, EmailTemplateItem } from "@/types";

type ComposerState = {
  templateId: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
};

export function ComposeEmailDialog({
  caseId,
  clientEmail,
  caseData,
  settlementData,
  onLogged,
}: {
  caseId: string;
  clientEmail?: string | null;
  caseData: CaseVariableInput;
  settlementData?: SettlementVariableInput;
  onLogged: (item: CaseEmailItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState<ComposerState>({
    templateId: "",
    to: clientEmail ?? "",
    cc: "",
    subject: "",
    body: "",
  });

  const context: TemplateVariableContextInput = useMemo(
    () => ({
      brokerName: "CargoShield Broker",
    }),
    [],
  );

  const variableMap = useMemo(
    () => buildTemplateVariablesFromCase(caseData, context, settlementData),
    [caseData, context, settlementData],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      const response = await fetch("/api/email-templates", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { items?: EmailTemplateItem[]; error?: string } | null;
      if (!response.ok) {
        if (!cancelled) {
          setError(payload?.error ?? "Failed to load templates");
        }
        return;
      }
      if (!cancelled) {
        const nextTemplates = payload?.items ?? [];
        setTemplates(nextTemplates);
        const firstTemplateId = nextTemplates[0]?.templateId ?? "";
        if (firstTemplateId) {
          selectTemplate(firstTemplateId, nextTemplates);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, variableMap]);

  function selectTemplate(templateId: string, source?: EmailTemplateItem[]) {
    const all = source ?? templates;
    const selected = all.find((item) => item.templateId === templateId);
    if (!selected) {
      return;
    }
    const rendered = renderTemplate({
      template: selected,
      vars: variableMap,
    });

    setState((prev) => ({
      ...prev,
      templateId,
      subject: rendered.subject,
      body: rendered.body,
    }));
  }

  const canSend = state.to.trim().length > 0 && state.subject.trim().length > 0 && state.body.trim().length > 0;

  async function handleSend() {
    if (!canSend) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/cases/${caseId}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: state.templateId,
        to: state.to.trim(),
        cc: state.cc.trim() || null,
        subject: state.subject,
        body: state.body,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string; item?: CaseEmailItem } | null;
    if (!response.ok) {
      setError(payload?.error ?? "Failed to log email");
      setBusy(false);
      return;
    }

    if (payload?.item) {
      onLogged(payload.item);
    }
    setMessage(payload?.message ?? "Email logged (sending disabled in dev mode).");
    setBusy(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" onClick={() => setOpen(true)}>
        Compose Email
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded border bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Compose Email</h3>
        <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setOpen(false)} disabled={busy}>
          Close
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <label className="block space-y-1 text-sm">
        <span>Template</span>
        <select
          value={state.templateId}
          onChange={(event) => selectTemplate(event.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          {templates.map((template) => (
            <option key={template.templateId} value={template.templateId}>
              {template.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1 text-sm">
        <span>To</span>
        <input
          className="w-full rounded border px-2 py-1"
          value={state.to}
          onChange={(event) => setState((prev) => ({ ...prev, to: event.target.value }))}
          type="email"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>CC</span>
        <input
          className="w-full rounded border px-2 py-1"
          value={state.cc}
          onChange={(event) => setState((prev) => ({ ...prev, cc: event.target.value }))}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>Subject</span>
        <input
          className="w-full rounded border px-2 py-1"
          value={state.subject}
          onChange={(event) => setState((prev) => ({ ...prev, subject: event.target.value }))}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>Body</span>
        <textarea
          className="h-40 w-full rounded border px-2 py-1"
          value={state.body}
          onChange={(event) => setState((prev) => ({ ...prev, body: event.target.value }))}
        />
      </label>

      <div className="rounded border bg-white p-2 text-sm">
        <p className="mb-1 font-semibold">Preview</p>
        <p className="mb-1">
          <strong>Subject:</strong> {state.subject || "-"}
        </p>
        <pre className="whitespace-pre-wrap">{state.body || "-"}</pre>
      </div>

      <button
        type="button"
        className="rounded bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-50"
        disabled={!canSend || busy}
        onClick={() => void handleSend()}
      >
        {busy ? "Saving..." : "Send"}
      </button>
    </div>
  );
}

