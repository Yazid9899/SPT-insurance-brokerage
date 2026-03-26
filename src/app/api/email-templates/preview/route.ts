import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { renderTemplate } from "@/lib/email/renderer";
import { getEmailTemplateById } from "@/lib/email/templates";
import { buildTemplateVariablesFromInput } from "@/lib/email/variables";
import { emailTemplatePreviewSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = emailTemplatePreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid payload", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const template = getEmailTemplateById(parsed.data.templateId);
  if (!template) {
    return NextResponse.json(apiError("Template not found"), { status: 404 });
  }

  const rendered = renderTemplate({
    template,
    vars: buildTemplateVariablesFromInput(parsed.data.vars),
  });

  return NextResponse.json(rendered);
}
