import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function CasesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = (await searchParams) ?? {};
  const q = typeof query.q === "string" ? query.q : undefined;
  const status = typeof query.status === "string" ? query.status : undefined;

  const cases = await prisma.case.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { caseNumber: { contains: q, mode: "insensitive" } },
              { clientName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Cases" description="Case management core list" />
      <form className="flex flex-wrap gap-2 rounded border bg-white p-3" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by case number/client"
          className="w-full rounded border px-2 py-1 md:w-80"
        />
        <select name="status" defaultValue={status} className="rounded border px-2 py-1">
          <option value="">All statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="DOCUMENTATION">DOCUMENTATION</option>
          <option value="UNDERWRITING">UNDERWRITING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BILLING">BILLING</option>
          <option value="SETTLING">SETTLING</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <button type="submit" className="rounded border px-3 py-1 text-sm">
          Filter
        </button>
        <Link href="/cases/new" className="ml-auto rounded bg-slate-900 px-3 py-1 text-sm text-white">
          New Case
        </Link>
      </form>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="px-3 py-2">Case Number</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Cover Type</th>
              <th className="px-3 py-2">Currency</th>
              <th className="px-3 py-2">Client Premium</th>
              <th className="px-3 py-2">Insurer Premium</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-3 py-2 font-medium">{item.caseNumber}</td>
                <td className="px-3 py-2">{item.status}</td>
                <td className="px-3 py-2">{item.clientName}</td>
                <td className="px-3 py-2">{item.coverType ?? "-"}</td>
                <td className="px-3 py-2">{item.currency}</td>
                <td className="px-3 py-2">{item.clientPremium.toFixed(2)}</td>
                <td className="px-3 py-2">{item.insurerPremium.toFixed(2)}</td>
              </tr>
            ))}
            {cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  No cases found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
