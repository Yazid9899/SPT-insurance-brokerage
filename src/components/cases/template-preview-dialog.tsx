"use client";

export function TemplatePreviewDialog({
  open,
  title,
  subject,
  body,
  onClose,
}: {
  open: boolean;
  title: string;
  subject: string;
  body: string;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="rounded border bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" className="rounded border px-2 py-1 text-xs" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Subject:</strong> {subject}
        </p>
        <pre className="whitespace-pre-wrap rounded border bg-white p-2">{body}</pre>
      </div>
    </div>
  );
}

