export type StoredDocument = {
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  originalName: string;
};

export interface DocumentStorage {
  save(input: { buffer: Buffer; originalName: string; mimeType: string }): Promise<StoredDocument>;
  delete(storageKey: string): Promise<void>;
  resolvePublicUrl(storageKey: string): string;
}
