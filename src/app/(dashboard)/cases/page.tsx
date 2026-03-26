import { PageHeader } from "@/components/shared/page-header";
import { CaseTable, type CaseListRow } from "@/components/cases/case-table";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export default async function CasesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = (await searchParams) ?? {};
  const q = typeof query.q === "string" ? query.q : "";
  const statusCsv = typeof query.status === "string" ? query.status : "";
  const productLine = typeof query.productLine === "string" ? query.productLine : "";
  const cargoProduct = typeof query.cargoProduct === "string" ? query.cargoProduct : "";
  const coverType = typeof query.coverType === "string" ? query.coverType : "";
  const page = Math.max(1, Number(typeof query.page === "string" ? query.page : "1") || 1);

  const statuses = statusCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { caseNumber: { contains: q, mode: "insensitive" as const } },
            { clientName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(statuses.length > 0 ? { status: { in: statuses as never[] } } : {}),
    ...(productLine ? { productLine: productLine as never } : {}),
    ...(cargoProduct ? { cargoProduct: cargoProduct as never } : {}),
    ...(coverType ? { coverType: coverType as never } : {}),
  };

  const [total, cases] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);

  const rows: CaseListRow[] = cases.map((item) => ({
    id: item.id,
    caseNumber: item.caseNumber,
    clientName: item.clientName,
    productLine: item.productLine,
    cargoProduct: item.cargoProduct,
    coverType: item.coverType,
    status: item.status,
    sumInsured: item.sumInsured.toFixed(2),
    brokerCommission: item.brokerCommission.toFixed(2),
    createdAt: item.createdAt.toISOString(),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <PageHeader title="Cases" description="Search, filter, and manage insurance cases" />

      <form className="grid gap-2 rounded border bg-white p-3 md:grid-cols-6" method="GET">
        <input type="text" name="q" defaultValue={q} placeholder="Search case/client" className="rounded border px-2 py-1 md:col-span-2" />
        <input type="text" name="status" defaultValue={statusCsv} placeholder="status CSV" className="rounded border px-2 py-1" />
        <input type="text" name="productLine" defaultValue={productLine} placeholder="product line" className="rounded border px-2 py-1" />
        <input type="text" name="cargoProduct" defaultValue={cargoProduct} placeholder="cargo product" className="rounded border px-2 py-1" />
        <input type="text" name="coverType" defaultValue={coverType} placeholder="cover type" className="rounded border px-2 py-1" />
        <input type="hidden" name="page" value="1" />
        <button type="submit" className="rounded border px-3 py-1 text-sm">Apply</button>
        <a href="/cases/new" className="rounded bg-slate-900 px-3 py-1 text-center text-sm text-white">New Case</a>
      </form>

      <CaseTable rows={rows} />

      <div className="flex items-center justify-between rounded border bg-white p-3 text-sm">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <a
            className={`rounded border px-2 py-1 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
            href={`?q=${encodeURIComponent(q)}&status=${encodeURIComponent(statusCsv)}&productLine=${encodeURIComponent(productLine)}&cargoProduct=${encodeURIComponent(cargoProduct)}&coverType=${encodeURIComponent(coverType)}&page=${Math.max(1, page - 1)}`}
          >
            Prev
          </a>
          <a
            className={`rounded border px-2 py-1 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            href={`?q=${encodeURIComponent(q)}&status=${encodeURIComponent(statusCsv)}&productLine=${encodeURIComponent(productLine)}&cargoProduct=${encodeURIComponent(cargoProduct)}&coverType=${encodeURIComponent(coverType)}&page=${Math.min(totalPages, page + 1)}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
