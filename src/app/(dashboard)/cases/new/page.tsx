import { CaseForm } from "@/components/cases/case-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function NewCasePage() {
  const [clients, insurers, openCovers] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
    prisma.insurer.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
    prisma.openCover.findMany({
      where: { isActive: true },
      include: { clientLinks: { include: { client: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader title="New Case" description="Create a case declaration" />
      <CaseForm
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
      />
    </div>
  );
}
