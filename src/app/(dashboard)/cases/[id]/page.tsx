import { notFound } from "next/navigation";

import { CaseDetail } from "@/components/cases/case-detail";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await prisma.case.findFirst({
    where: { id, deletedAt: null },
    include: {
      insurer: { select: { displayName: true } },
      openCover: { select: { reference: true, insurerName: true } },
      settlementItems: {
        include: { settlement: true },
        orderBy: { settlement: { createdAt: "desc" } },
        take: 1,
      },
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });

  if (!found) {
    notFound();
  }

  const latestSettlement = found.settlementItems[0]?.settlement;

  return (
    <div className="space-y-4">
      <PageHeader title="Case Detail" description={found.caseNumber} />
      <CaseDetail
        data={{
          id: found.id,
          caseNumber: found.caseNumber,
          status: found.status,
          productLine: found.productLine,
          cargoProduct: found.cargoProduct,
          coverType: found.coverType,
          clientName: found.clientName,
          clientId: found.clientId,
          insurerId: found.insurerId,
          clientEmail: found.clientEmail,
          currency: found.currency,
          sumInsured: found.sumInsured.toFixed(2),
          clientRate: found.clientRate.toFixed(6),
          insurerRate: found.insurerRate.toFixed(6),
          clientPremium: found.clientPremium.toFixed(2),
          insurerPremium: found.insurerPremium.toFixed(2),
          brokerCommission: found.brokerCommission.toFixed(2),
          origin: found.origin,
          destination: found.destination,
          vessel: found.vessel,
          quantity: found.quantity?.toFixed(2) ?? null,
          etd: found.etd?.toISOString() ?? null,
          eta: found.eta?.toISOString() ?? null,
          notes: found.notes,
          openCoverId: found.openCoverId,
          openCoverReference: found.openCover?.reference ?? null,
          insurerName: found.insurer?.displayName ?? found.openCover?.insurerName ?? null,
          documentsApiUrl: `/api/cases/${found.id}/documents`,
          settlementData: latestSettlement
            ? {
                settlementNumber: latestSettlement.settlementNumber,
                settlementPeriod: latestSettlement.period,
                totalInsurerPremium: latestSettlement.totalInsurerPremium.toFixed(2),
                caseCount: null,
              }
            : undefined,
          statusHistory: found.statusHistory.map((h) => ({
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            changedAt: h.changedAt.toISOString(),
            changedBy: h.changedBy,
            note: h.note,
          })),
        }}
      />
    </div>
  );
}
