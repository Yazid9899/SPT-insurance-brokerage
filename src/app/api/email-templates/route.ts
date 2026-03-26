import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { getEmailTemplates } from "@/lib/email/templates";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  return NextResponse.json({
    items: getEmailTemplates().map((template) => ({
      templateId: template.templateId,
      name: template.name,
      description: template.description,
      subjectTemplate: template.subjectTemplate,
      bodyTemplate: template.bodyTemplate,
      variables: [...template.variables],
    })),
  });
}

