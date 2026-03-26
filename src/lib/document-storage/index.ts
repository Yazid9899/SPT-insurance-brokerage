import { LocalDocumentStorage } from "@/lib/document-storage/local-storage";
import type { DocumentStorage } from "@/lib/document-storage/types";

let cachedStorage: DocumentStorage | null = null;

export function getDocumentStorage(): DocumentStorage {
  if (cachedStorage) {
    return cachedStorage;
  }

  // Placeholder for future S3-compatible provider selection.
  cachedStorage = new LocalDocumentStorage();
  return cachedStorage;
}
