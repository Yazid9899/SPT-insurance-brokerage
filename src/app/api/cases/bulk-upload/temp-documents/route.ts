import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { createTempDocument } from "@/lib/bulk-upload/temp-documents-store";
import { getDocumentStorage } from "@/lib/document-storage";
import { bulkUploadTempDocumentSchema, validateDocumentFile } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const formData = await request.formData();
  const parsed = bulkUploadTempDocumentSchema.safeParse({
    draftId: formData.get("draftId"),
  });

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  if (files.length === 0) {
    return NextResponse.json(apiError("At least one file is required"), { status: 400 });
  }

  const storage = getDocumentStorage();
  const created = [];
  for (const file of files) {
    const error = validateDocumentFile(file);
    if (error) {
      return NextResponse.json(apiError(error), { status: 400 });
    }

    const saved = await storage.save({
      buffer: Buffer.from(await file.arrayBuffer()),
      originalName: file.name,
      mimeType: file.type,
    });

    const tempDoc = createTempDocument({
      draftId: parsed.data.draftId,
      uploadedById: session.user.id,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      storageKey: saved.storageKey,
    });

    created.push({
      tempDocId: tempDoc.tempDocId,
      fileName: tempDoc.fileName,
      mimeType: tempDoc.mimeType,
      fileSize: tempDoc.fileSize,
    });
  }

  return NextResponse.json({ items: created }, { status: 201 });
}

