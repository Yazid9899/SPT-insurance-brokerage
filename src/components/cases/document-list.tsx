"use client";

import React from "react";

import { DataTable } from "@/components/shared/data-table";
import type { CaseDocumentItem } from "@/types";

function pretty(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DocumentList({
  items,
  onDeleted,
}: {
  items: CaseDocumentItem[];
  onDeleted: (id: string) => Promise<void>;
}) {
  return (
    <DataTable
      rows={items.map((item) => ({
        id: item.id,
        name: item.name,
        type: (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
            {pretty(item.type)} {item.isShared ? <span className="rounded bg-blue-100 px-1">Shared</span> : null}
          </span>
        ),
        uploadedAt: new Date(item.uploadedAt).toLocaleDateString(),
        fileSize: formatSize(item.fileSize),
        actions: (
          <div className="flex gap-2">
            <a className="rounded border px-2 py-1 text-xs" href={item.downloadUrl} target="_blank" rel="noreferrer">
              Download
            </a>
            <button
              type="button"
              className="rounded border px-2 py-1 text-xs"
              onClick={() => {
                if (window.confirm("Delete this document?")) {
                  void onDeleted(item.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
      }))}
      columns={[
        { key: "name", label: "Document" },
        { key: "type", label: "Type" },
        { key: "uploadedAt", label: "Uploaded" },
        { key: "fileSize", label: "Size" },
        { key: "actions", label: "Actions" },
      ]}
      getRowKey={(row) => String(row.id)}
      emptyState="No documents uploaded yet."
    />
  );
}
