"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DocumentList } from "@/components/cases/document-list";
import { DocumentUploadDialog } from "@/components/cases/document-upload-dialog";
import { ExpectedDocumentsChecklist } from "@/components/cases/expected-documents-checklist";
import type { CaseLifecycleStatus } from "@/lib/constants";
import type { CaseDocumentItem } from "@/types";

export function CaseDocumentsTab({
  caseId,
  status,
  endpoint,
}: {
  caseId: string;
  status: CaseLifecycleStatus;
  endpoint?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CaseDocumentItem[]>([]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const response = await fetch(endpoint ?? `/api/cases/${caseId}/documents`, { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as { items?: CaseDocumentItem[]; error?: string } | null;
    if (!response.ok) {
      window.alert(payload?.error ?? "Failed to load documents");
      setLoading(false);
      return;
    }
    setItems(payload?.items ?? []);
    setLoading(false);
  }, [caseId, endpoint]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const uploadedTypes = useMemo(() => items.map((item) => item.type), [items]);

  async function handleDelete(docId: string) {
    const base = endpoint ?? `/api/cases/${caseId}/documents`;
    const response = await fetch(`${base}/${docId}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(payload?.error ?? "Delete failed");
      return;
    }
    await fetchDocuments();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ExpectedDocumentsChecklist status={status} uploadedTypes={uploadedTypes} />
        <DocumentUploadDialog caseId={caseId} onUploaded={fetchDocuments} />
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading documents...</p> : <DocumentList items={items} onDeleted={handleDelete} />}
    </div>
  );
}
