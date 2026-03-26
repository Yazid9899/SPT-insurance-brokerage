import type { CaseLifecycleStatus, DocumentTypeValue } from "@/lib/constants";
import { EXPECTED_DOCUMENTS_BY_STATUS } from "@/lib/constants";

export type ChecklistItem = {
  type: DocumentTypeValue;
  uploaded: boolean;
};

export function getExpectedDocuments(status: CaseLifecycleStatus): readonly DocumentTypeValue[] {
  return EXPECTED_DOCUMENTS_BY_STATUS[status] ?? [];
}

export function buildExpectedDocumentsChecklist(
  status: CaseLifecycleStatus,
  uploadedDocumentTypes: readonly string[],
): ChecklistItem[] {
  const uploaded = new Set(uploadedDocumentTypes);
  return getExpectedDocuments(status).map((type) => ({
    type,
    uploaded: uploaded.has(type),
  }));
}
