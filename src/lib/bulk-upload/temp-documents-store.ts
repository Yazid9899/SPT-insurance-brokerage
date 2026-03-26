import { randomUUID } from "node:crypto";

export type TempDocumentRecord = {
  tempDocId: string;
  draftId: string;
  uploadedById: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  uploadedAt: string;
};

const STORE_KEY = "__bulkUploadTempDocs";

type GlobalWithStore = typeof globalThis & {
  [STORE_KEY]?: Map<string, TempDocumentRecord>;
};

function getStore(): Map<string, TempDocumentRecord> {
  const g = globalThis as GlobalWithStore;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, TempDocumentRecord>();
  }
  return g[STORE_KEY]!;
}

export function createTempDocument(input: Omit<TempDocumentRecord, "tempDocId" | "uploadedAt">): TempDocumentRecord {
  const record: TempDocumentRecord = {
    ...input,
    tempDocId: randomUUID(),
    uploadedAt: new Date().toISOString(),
  };
  getStore().set(record.tempDocId, record);
  return record;
}

export function getTempDocumentsByIds(ids: string[], userId: string): TempDocumentRecord[] {
  const store = getStore();
  return ids
    .map((id) => store.get(id))
    .filter((item): item is TempDocumentRecord => Boolean(item && item.uploadedById === userId));
}

export function deleteTempDocumentsByIds(ids: string[]): void {
  const store = getStore();
  ids.forEach((id) => store.delete(id));
}

