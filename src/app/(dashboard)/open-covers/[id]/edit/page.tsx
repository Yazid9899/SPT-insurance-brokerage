import { notFound } from "next/navigation";

import { OpenCoverForm } from "@/components/open-covers/open-cover-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function EditOpenCoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [agreement, clients, insurers] = await Promise.all([
    prisma.openCover.findUnique({ where: { id }, include: { clientLinks: true } }),
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
    prisma.insurer.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
  ]);

  if (!agreement) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader title={`Edit ${agreement.reference}`} description="Update open cover details" />
      <OpenCoverForm
        mode="edit"
        openCoverId={agreement.id}
        clients={clients.map((item) => ({
          id: item.id,
          displayName: item.displayName,
          company: item.company,
          email: item.email,
          phone: item.phone,
          status: item.status,
        }))}
        insurers={insurers.map((item) => ({
          id: item.id,
          displayName: item.displayName,
          email: item.email,
          phone: item.phone,
          status: item.status,
        }))}
        defaultValues={{
          reference: agreement.reference,
          clientName: agreement.clientName,
          clientCompany: agreement.clientCompany,
          insurerName: agreement.insurerName,
          insurerId: agreement.insurerId,
          clientIds: agreement.clientLinks.map((link) => link.clientId),
          isActive: agreement.isActive,
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
