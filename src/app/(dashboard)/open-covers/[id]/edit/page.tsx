import { notFound } from "next/navigation";

import { OpenCoverForm } from "@/components/open-covers/open-cover-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function EditOpenCoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const agreement = await prisma.openCover.findUnique({ where: { id } });
  if (!agreement) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader title={`Edit ${agreement.reference}`} description="Update open cover details" />
      <OpenCoverForm
        mode="edit"
        openCoverId={agreement.id}
        defaultValues={{
          reference: agreement.reference,
          clientName: agreement.clientName,
          clientCompany: agreement.clientCompany,
          insurerName: agreement.insurerName,
          productLine: "CARGO",
          cargoProduct: agreement.cargoProduct ?? "CPO",
          transportMode: agreement.transportMode ?? "MARINE",
          currency: agreement.currency,
          insurerRate: Number(agreement.insurerRate),
          effectiveFrom: agreement.effectiveFrom.toISOString().slice(0, 10),
          effectiveTo: agreement.effectiveTo.toISOString().slice(0, 10),
          notes: agreement.notes ?? "",
        }}
      />
    </div>
  );
}
