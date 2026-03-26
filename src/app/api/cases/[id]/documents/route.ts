import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { getDocumentStorage } from "@/lib/document-storage";
import { prisma } from "@/lib/prisma";
import { documentUploadMetaSchema, validateDocumentFile } from "@/lib/validations";
import type { CaseDocumentItem } from "@/types";

export const runtime = "nodejs";

function toCaseDocumentItem(doc: {
  id: string;
  caseId: string;
  name: string;
  type: string;
  mimeType: string;
  fileSize: number;
  notes: string | null;
  uploadedAt: Date;
  bulkUploadId: string | null;
  sharedDocumentKey: string | null;
  filePath: string;
}): CaseDocumentItem {
  const storage = getDocumentStorage();
  return {
    id: doc.id,
    caseId: doc.caseId,
    name: doc.name,
    type: doc.type,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    note: doc.notes,
    uploadedAt: doc.uploadedAt.toISOString(),
    isShared: Boolean(doc.bulkUploadId || doc.sharedDocumentKey),
    bulkUploadId: doc.bulkUploadId,
    downloadUrl: storage.resolvePublicUrl(doc.filePath),
  };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const found = await prisma.case.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!found) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  const docs = await prisma.caseDocument.findMany({
    where: { caseId: id },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ items: docs.map(toCaseDocumentItem) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const found = await prisma.case.findFirst({ where: { id, deletedAt: null }, select: { id: true, bulkUploadId: true } });
  if (!found) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  const formData = await request.formData();
  const rawFile = formData.get("file");
  const documentType = formData.get("documentType");
  const note = formData.get("note");

  if (!(rawFile instanceof File)) {
    return NextResponse.json(apiError("file is required"), { status: 400 });
  }

  const parsedMeta = documentUploadMetaSchema.safeParse({
    documentType,
    note: typeof note === "string" ? note : undefined,
  });

  if (!parsedMeta.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsedMeta.error.flatten() }), { status: 400 });
  }

  const fileError = validateDocumentFile(rawFile);
  if (fileError) {
    return NextResponse.json(apiError(fileError), { status: 400 });
  }

  const storage = getDocumentStorage();
  const bytes = Buffer.from(await rawFile.arrayBuffer());
  const saved = await storage.save({ buffer: bytes, originalName: rawFile.name, mimeType: rawFile.type });

  const created = await prisma.caseDocument.create({
    data: {
      caseId: found.id,
      name: rawFile.name,
      type: parsedMeta.data.documentType,
      fileName: saved.storageKey,
      filePath: saved.storageKey,
      fileSize: rawFile.size,
      mimeType: rawFile.type,
      notes: parsedMeta.data.note ?? null,
      bulkUploadId: null,
      sharedDocumentKey: null,
    },
  });

  return NextResponse.json(toCaseDocumentItem(created), { status: 201 });
}
