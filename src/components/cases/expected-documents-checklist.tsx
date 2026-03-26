"use client";

import { useMemo } from "react";

import { buildExpectedDocumentsChecklist } from "@/lib/document-checklist";
import type { CaseLifecycleStatus } from "@/lib/constants";

function label(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function ExpectedDocumentsChecklist({
  status,
  uploadedTypes,
}: {
  status: CaseLifecycleStatus;
  uploadedTypes: string[];
}) {
  const checklist = useMemo(() => buildExpectedDocumentsChecklist(status, uploadedTypes), [status, uploadedTypes]);

  if (checklist.length === 0) {
    return <p className="text-sm text-slate-500">No expected documents for current stage.</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Expected Documents (Advisory)</h3>
      <ul className="space-y-1 text-sm">
        {checklist.map((item) => (
          <li key={item.type} className="flex items-center gap-2">
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${item.uploaded ? "bg-emerald-100" : "bg-white"}`}>
              {item.uploaded ? "?" : ""}
            </span>
            <span>{label(item.type)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
