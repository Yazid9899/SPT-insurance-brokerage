import { notFound } from "next/navigation";

import { OpenCoverDetail } from "@/components/open-covers/open-cover-detail";
import { prisma } from "@/lib/prisma";

export default async function OpenCoverDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const caseStatus = typeof query.caseStatus === "string" ? query.caseStatus : undefined;

  const agreement = await prisma.openCover.findUnique({
    where: { id },
    include: {
      cases: {
        where: {
          ...(caseStatus ? { status: caseStatus as never } : {}),
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agreement) {
    notFound();
  }

  const now = new Date();

  return (
    <div className="space-y-3">
      <form className="rounded border bg-white p-3" method="GET">
        <label className="mr-2 text-sm" htmlFor="caseStatus">
          Declaration status
        </label>
        <select id="caseStatus" name="caseStatus" defaultValue={caseStatus ?? ""} className="rounded border px-2 py-1">
          <option value="">All</option>
          <option value="DRAFT">DRAFT</option>
          <option value="DOCUMENTATION">DOCUMENTATION</option>
          <option value="UNDERWRITING">UNDERWRITING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BILLING">BILLING</option>
          <option value="SETTLING">SETTLING</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <button type="submit" className="ml-2 rounded border px-3 py-1 text-sm">
          Apply
        </button>
      </form>

      <OpenCoverDetail
        agreement={{
          id: agreement.id,
          reference: agreement.reference,
          clientName: agreement.clientName,
          clientCompany: agreement.clientCompany,
          cargoProduct: agreement.cargoProduct,
          insurerName: agreement.insurerName,
          insurerRate: agreement.insurerRate.toFixed(6),
          effectiveFrom: agreement.effectiveFrom.toISOString(),
          effectiveTo: agreement.effectiveTo.toISOString(),
          status: agreement.effectiveFrom <= now && agreement.effectiveTo >= now ? "ACTIVE" : "EXPIRED",
          declarationCount: agreement.cases.length,
          transportMode: agreement.transportMode,
          currency: agreement.currency,
          notes: agreement.notes,
        }}
        declarations={agreement.cases.map((item) => ({
          id: item.id,
          caseNumber: item.caseNumber,
          status: item.status,
          productLine: item.productLine,
          coverType: item.coverType,
          clientName: item.clientName,
          clientCompany: item.clientCompany,
          currency: item.currency,
          clientRate: item.clientRate.toFixed(6),
          insurerRate: item.insurerRate.toFixed(6),
          clientPremium: item.clientPremium.toFixed(2),
          insurerPremium: item.insurerPremium.toFixed(2),
          brokerCommission: item.brokerCommission.toFixed(2),
          createdAt: item.createdAt.toISOString(),
          openCoverId: item.openCoverId,
        }))}
      />
    </div>
  );
}
