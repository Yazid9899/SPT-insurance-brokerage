import { notFound } from "next/navigation";

import { CaseForm } from "@/components/cases/case-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await prisma.case.findFirst({ where: { id, deletedAt: null } });
  if (!found) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Case" description={found.caseNumber} />
      <CaseForm
        mode="edit"
        caseId={found.id}
        initialValues={{
          productLine: found.productLine,
          cargoProduct: found.cargoProduct,
          coverType: found.coverType,
          transportMode: found.transportMode,
          openCoverId: found.openCoverId,
          clientName: found.clientName,
          clientEmail: found.clientEmail,
          clientPhone: found.clientPhone,
          clientCompany: found.clientCompany,
          currency: found.currency,
          sumInsured: Number(found.sumInsured),
          clientRate: Number(found.clientRate),
          insurerRate: Number(found.insurerRate),
          origin: found.origin,
          destination: found.destination,
          vessel: found.vessel,
          quantity: found.quantity ? Number(found.quantity) : null,
          etd: found.etd,
          eta: found.eta,
          notes: found.notes,
        }}
      />
    </div>
  );
}
