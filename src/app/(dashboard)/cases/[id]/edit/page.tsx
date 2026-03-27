import { notFound } from "next/navigation";

import { CaseForm } from "@/components/cases/case-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [found, clients, insurers, openCovers] = await Promise.all([
    prisma.case.findFirst({ where: { id, deletedAt: null } }),
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
    prisma.insurer.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
    prisma.openCover.findMany({
      where: { isActive: true },
      include: { clientLinks: { include: { client: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!found) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Case" description={found.caseNumber} />
      <CaseForm
        mode="edit"
        caseId={found.id}
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
        openCovers={openCovers.map((item) => ({
          id: item.id,
          reference: item.reference,
          insurerRate: item.insurerRate.toFixed(6),
          currency: item.currency,
          insurerId: item.insurerId,
          linkedClients: item.clientLinks.map((link) => ({
            id: link.client.id,
            displayName: link.client.displayName,
            company: link.client.company,
            email: link.client.email,
            phone: link.client.phone,
            status: link.client.status,
          })),
        }))}
        initialValues={{
          productLine: found.productLine,
          cargoProduct: found.cargoProduct,
          coverType: found.coverType,
          transportMode: found.transportMode,
          openCoverId: found.openCoverId,
          clientId: found.clientId,
          insurerId: found.insurerId,
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
