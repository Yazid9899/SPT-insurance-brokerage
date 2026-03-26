"use client";

import { useMemo, useState } from "react";

import { DOCUMENT_TYPES } from "@/lib/constants";

function pretty(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

export function DocumentUploadDialog({
  caseId,
  onUploaded,
}: {
  caseId: string;
  onUploaded: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<(typeof DOCUMENT_TYPES)[number]>(DOCUMENT_TYPES[0]);
  const [note, setNote] = useState("");

  const isValidSize = useMemo(() => !file || file.size <= 10 * 1024 * 1024, [file]);

  async function handleSubmit() {
    if (!file || !isValidSize) {
      return;
    }

    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    body.append("documentType", documentType);
    if (note.trim()) {
      body.append("note", note.trim());
    }

    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(payload?.error ?? "Upload failed");
      setBusy(false);
      return;
    }

    await onUploaded();
    setBusy(false);
    setOpen(false);
    setFile(null);
    setNote("");
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded bg-slate-900 px-3 py-1 text-sm text-white">
        Upload Document
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded border bg-slate-50 p-3">
      <input
        type="file"
        accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="w-full rounded border p-2"
      />
      {!isValidSize ? <p className="text-sm text-red-600">File must be 10MB or smaller.</p> : null}

      <select
        value={documentType}
        onChange={(event) => setDocumentType(event.target.value as (typeof DOCUMENT_TYPES)[number])}
        className="w-full rounded border p-2"
      >
        {DOCUMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {pretty(type)}
          </option>
        ))}
      </select>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional note"
        className="w-full rounded border p-2"
      />

      <div className="flex gap-2">
        <button type="button" className="rounded border px-3 py-1 text-sm" onClick={() => setOpen(false)} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className="rounded bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-50"
          onClick={() => void handleSubmit()}
          disabled={!file || !isValidSize || busy}
        >
          {busy ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
