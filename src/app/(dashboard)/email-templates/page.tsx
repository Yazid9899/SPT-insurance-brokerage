"use client";

import { useEffect, useState } from "react";

import { TemplatePreviewDialog } from "@/components/cases/template-preview-dialog";
import { PageHeader } from "@/components/shared/page-header";
import type { EmailTemplateId } from "@/lib/email/templates";
import { buildSampleVariables } from "@/lib/email/variables";
import type { EmailTemplateItem } from "@/types";

export default function EmailTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [preview, setPreview] = useState<{ title: string; subject: string; body: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const response = await fetch("/api/email-templates", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { items?: EmailTemplateItem[]; error?: string } | null;
      if (!response.ok) {
        if (!cancelled) {
          setError(payload?.error ?? "Failed to load templates");
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setTemplates(payload?.items ?? []);
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openPreview(template: EmailTemplateItem) {
    setError(null);
    const response = await fetch("/api/email-templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: template.templateId,
        vars: buildSampleVariables(template.templateId as EmailTemplateId),
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; subject?: string; body?: string } | null;
    if (!response.ok) {
      setError(payload?.error ?? "Preview failed");
      return;
    }
    setPreview({
      title: template.name,
      subject: payload?.subject ?? "",
      body: payload?.body ?? "",
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Email Templates" description="Predefined templates with sample preview." />

      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="rounded border bg-white p-4 text-sm text-slate-600">Loading templates...</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((template) => (
          <div key={template.templateId} className="rounded border bg-white p-4">
            <h2 className="text-base font-semibold">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{template.description}</p>
            <p className="mt-2 text-sm">
              <strong>Subject:</strong> {template.subjectTemplate}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {template.variables.map((variable) => (
                <span key={variable} className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
            <button type="button" className="mt-3 rounded border px-3 py-1 text-sm" onClick={() => void openPreview(template)}>
              Preview
            </button>
          </div>
        ))}
      </div>

      <TemplatePreviewDialog
        open={Boolean(preview)}
        title={preview?.title ?? "Template Preview"}
        subject={preview?.subject ?? ""}
        body={preview?.body ?? ""}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
