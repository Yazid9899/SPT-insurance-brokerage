import Link from "next/link";

import { OpenCoverTable } from "@/components/open-covers/open-cover-table";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function OpenCoversPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : "ALL";

  const now = new Date();
  const openCovers = await prisma.openCover.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { reference: { contains: q, mode: "insensitive" } },
              { clientName: { contains: q, mode: "insensitive" } },
              { insurerName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status === "ACTIVE"
        ? {
            effectiveFrom: { lte: now },
            effectiveTo: { gte: now },
          }
        : {}),
      ...(status === "EXPIRED"
        ? {
            OR: [{ effectiveFrom: { gt: now } }, { effectiveTo: { lt: now } }],
          }
        : {}),
    },
    include: { cases: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const items = openCovers.map((item) => ({
    id: item.id,
    reference: item.reference,
    clientName: item.clientName,
    clientCompany: item.clientCompany,
    cargoProduct: item.cargoProduct,
    insurerName: item.insurerName,
    insurerRate: item.insurerRate.toFixed(6),
    effectiveFrom: item.effectiveFrom.toISOString(),
    effectiveTo: item.effectiveTo.toISOString(),
    status: (item.effectiveFrom <= now && item.effectiveTo >= now ? "ACTIVE" : "EXPIRED") as
      | "ACTIVE"
      | "EXPIRED",
    declarationCount: item.cases.length,
  }));

  return (
    <div className="space-y-4">
      <PageHeader title="Open Covers" description="Manage standing cargo agreements" />

      <form className="flex flex-wrap gap-2 rounded border bg-white p-3" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search reference/client/insurer"
          className="w-full rounded border px-2 py-1 md:w-80"
        />
        <select name="status" defaultValue={status} className="rounded border px-2 py-1">
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button type="submit" className="rounded border px-3 py-1 text-sm">
          Filter
        </button>
        <Link href="/open-covers/new" className="ml-auto rounded bg-slate-900 px-3 py-1 text-sm text-white">
          New Open Cover
        </Link>
      </form>

      <OpenCoverTable rows={items} />
    </div>
  );
}
