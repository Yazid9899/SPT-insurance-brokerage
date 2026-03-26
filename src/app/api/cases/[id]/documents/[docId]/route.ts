import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { getDocumentStorage } from "@/lib/document-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string; docId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id, docId } = await context.params;

  const found = await prisma.caseDocument.findFirst({
    where: { id: docId, caseId: id },
    select: {
      id: true,
      filePath: true,
      sharedDocumentKey: true,
      bulkUploadId: true,
      case: { select: { id: true, deletedAt: true } },
    },
  });

  if (!found || found.case.deletedAt) {
    return NextResponse.json(apiError("Document not found"), { status: 404 });
  }

  const docsToDelete = found.sharedDocumentKey
    ? await prisma.caseDocument.findMany({
        where: { sharedDocumentKey: found.sharedDocumentKey },
        select: { id: true, filePath: true },
      })
    : [{ id: found.id, filePath: found.filePath }];

  const uniqueStorageKeys = [...new Set(docsToDelete.map((d) => d.filePath))];
  const storage = getDocumentStorage();

  try {
    for (const key of uniqueStorageKeys) {
      await storage.delete(key);
    }
  } catch {
    return NextResponse.json(apiError("Failed to delete stored file safely"), { status: 409 });
  }

  const ids = docsToDelete.map((d) => d.id);
  await prisma.caseDocument.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ deleted: true, deletedCount: ids.length });
}
