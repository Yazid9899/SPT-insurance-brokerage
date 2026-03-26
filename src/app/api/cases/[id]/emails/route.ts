import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { getEmailTemplateById } from "@/lib/email/templates";
import { prisma } from "@/lib/prisma";
import { caseEmailCreateSchema } from "@/lib/validations";

function toCaseEmailItem(item: {
  id: string;
  caseId: string;
  templateId: string | null;
  to: string;
  cc: string | null;
  subject: string;
  body: string;
  sentAt: Date;
}) {
  return {
    id: item.id,
    caseId: item.caseId,
    templateId: item.templateId,
    templateName: item.templateId ? getEmailTemplateById(item.templateId)?.name ?? null : null,
    to: item.to,
    cc: item.cc,
    subject: item.subject,
    body: item.body,
    sentAt: item.sentAt.toISOString(),
  };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const found = await prisma.case.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!found) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  const items = await prisma.caseEmail.findMany({
    where: { caseId: id },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({
    items: items.map(toCaseEmailItem),
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const found = await prisma.case.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!found) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = caseEmailCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  if (!getEmailTemplateById(parsed.data.templateId)) {
    return NextResponse.json(apiError("Template not found"), { status: 404 });
  }

  const created = await prisma.caseEmail.create({
    data: {
      caseId: id,
      templateId: parsed.data.templateId,
      to: parsed.data.to.trim(),
      cc: parsed.data.cc?.trim() ? parsed.data.cc.trim() : null,
      subject: parsed.data.subject.trim(),
      body: parsed.data.body.trim(),
      sentById: session.user.id,
    },
  });

  return NextResponse.json(
    {
      message: "Email logged (sending disabled in dev mode).",
      item: toCaseEmailItem(created),
    },
    { status: 201 },
  );
}

