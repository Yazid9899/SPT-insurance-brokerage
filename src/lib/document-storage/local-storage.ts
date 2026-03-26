import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { DocumentStorage, StoredDocument } from "@/lib/document-storage/types";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads");

function extensionOf(name: string) {
  const ext = path.extname(name).toLowerCase();
  return ext || "";
}

function normalizeStorageKey(storageKey: string) {
  const normalized = storageKey.replace(/\\/g, "/");
  if (normalized.includes("..") || normalized.includes("/") || normalized.includes("\\")) {
    throw new Error("Invalid storage key");
  }
  return normalized;
}

export class LocalDocumentStorage implements DocumentStorage {
  async save(input: { buffer: Buffer; originalName: string; mimeType: string }): Promise<StoredDocument> {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const storageKey = `${randomUUID()}${extensionOf(input.originalName)}`;
    const absolutePath = path.join(UPLOAD_DIR, storageKey);
    await writeFile(absolutePath, input.buffer);

    return {
      storageKey,
      publicUrl: `/uploads/${storageKey}`,
      mimeType: input.mimeType,
      size: input.buffer.length,
      originalName: input.originalName,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const safeKey = normalizeStorageKey(storageKey);
    const absolutePath = path.resolve(UPLOAD_DIR, safeKey);
    if (!absolutePath.startsWith(UPLOAD_DIR)) {
      throw new Error("Invalid storage path");
    }
    await unlink(absolutePath).catch((error: unknown) => {
      const withCode = error as { code?: string };
      if (withCode?.code === "ENOENT") {
        return;
      }
      throw error;
    });
  }

  resolvePublicUrl(storageKey: string): string {
    const safeKey = normalizeStorageKey(storageKey);
    return `/uploads/${safeKey}`;
  }
}
