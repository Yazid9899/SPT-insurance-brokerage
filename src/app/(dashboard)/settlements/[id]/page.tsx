import { notFound } from "next/navigation";

import { SettlementDetailClient } from "@/components/settlements/settlement-detail-client";
import { PageHeader } from "@/components/shared/page-header";
import { getSettlementDetail } from "@/lib/settlement-service";

export default async function SettlementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSettlementDetail(id);
  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader title={detail.settlementNumber} description={`${detail.insurerName} · ${detail.period}`} />
      <SettlementDetailClient initial={detail} />
    </div>
  );
}

