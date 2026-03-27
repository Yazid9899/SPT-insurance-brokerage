import { CaseStatus, CargoProduct, CoverType, Prisma, ProductLine } from "@prisma/client";
import Decimal from "decimal.js";

import { convertToUsdExposure } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";

export const REPORT_CASE_SORT_FIELDS = [
  "caseNumber",
  "clientName",
  "productLine",
  "cargoProduct",
  "coverType",
  "status",
  "currency",
  "sumInsured",
  "clientRate",
  "insurerRate",
  "clientPremium",
  "insurerPremium",
  "brokerCommission",
  "origin",
  "destination",
  "vessel",
  "quantity",
  "etd",
  "eta",
  "openCoverRef",
  "createdAt",
  "closedAt",
] as const;

type ReportCaseSortField = (typeof REPORT_CASE_SORT_FIELDS)[number];

export type ReportFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  status?: CaseStatus[];
  productLine?: ProductLine[];
  cargoProduct?: CargoProduct[];
  coverType?: CoverType[];
  clientId?: string;
  insurerId?: string;
  search?: string;
  sortBy?: ReportCaseSortField;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type DashboardSummary = {
  totalCases: number;
  activeCases: number;
  pendingBillingCount: number;
  totalExposureUsd: string;
  monthlyCommission: string;
  unsettledAmount: string;
  excludedCurrencyCount: number;
  statusDistribution: Array<{ status: CaseStatus; count: number }>;
  productDistribution: Array<{ productLine: ProductLine; cargoProduct: CargoProduct | null; count: number }>;
  monthlyCommissionTrend: Array<{ month: string; value: string }>;
  recentCases: Array<{
    id: string;
    caseNumber: string;
    clientName: string;
    productLine: ProductLine;
    status: CaseStatus;
    createdAt: string;
  }>;
};

export type ReportSummary = {
  totalCases: number;
  totalSumInsured: string;
  totalClientPremium: string;
  totalInsurerPremium: string;
  totalBrokerCommission: string;
  monthlyCaseVolume: Array<{ month: string; value: string }>;
};

export type CommissionBreakdown = {
  byInsurer: Array<{ insurerName: string; totalBrokerCommission: string; caseCount: number }>;
  monthlyCommission: Array<{ month: string; value: string }>;
};

export type ReportCaseRow = {
  caseNumber: string;
  clientName: string;
  insurerName: string | null;
  productLine: ProductLine;
  cargoProduct: CargoProduct | null;
  coverType: CoverType | null;
  status: CaseStatus;
  currency: string;
  sumInsured: string;
  clientRate: string;
  insurerRate: string;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: string | null;
  etd: string | null;
  eta: string | null;
  openCoverRef: string | null;
  createdAt: string;
  closedAt: string | null;
};

function toMonthKey(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function addOneDay(date: Date) {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

function parseArrayParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  const list = Array.isArray(value) ? value : value.split(",");
  const parsed = list.map((entry) => entry.trim()).filter(Boolean);
  return parsed.length ? parsed : undefined;
}

function enumValues<T extends readonly string[]>(values: T, input?: string[]) {
  if (!input) return undefined;
  const allowed = new Set(values);
  const parsed = input.filter((item) => allowed.has(item));
  return parsed.length ? (parsed as T[number][]) : undefined;
}

export function parseReportFilters(input: Record<string, unknown>): ReportFilters {
  const dateFromRaw = typeof input.dateFrom === "string" ? input.dateFrom : undefined;
  const dateToRaw = typeof input.dateTo === "string" ? input.dateTo : undefined;
  const dateFrom = dateFromRaw ? new Date(`${dateFromRaw}T00:00:00.000Z`) : undefined;
  const dateTo = dateToRaw ? new Date(`${dateToRaw}T00:00:00.000Z`) : undefined;

  if (dateFrom && Number.isNaN(dateFrom.getTime())) {
    throw new Error("Invalid dateFrom");
  }
  if (dateTo && Number.isNaN(dateTo.getTime())) {
    throw new Error("Invalid dateTo");
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new Error("dateFrom must be before or equal to dateTo");
  }

  const sortBy = typeof input.sortBy === "string" ? input.sortBy : undefined;
  const sortDirection = typeof input.sortDirection === "string" ? input.sortDirection : undefined;
  const pageRaw = typeof input.page === "number" || typeof input.page === "string" ? String(input.page) : undefined;
  const pageSizeRaw =
    typeof input.pageSize === "number" || typeof input.pageSize === "string" ? String(input.pageSize) : undefined;
  const searchRaw = typeof input.search === "string" ? input.search : undefined;

  const filters: ReportFilters = {
    dateFrom,
    dateTo,
    status: enumValues(
      ["DRAFT", "DOCUMENTATION", "UNDERWRITING", "ACTIVE", "BILLING", "SETTLING", "CLOSED"] as const,
      parseArrayParam(typeof input.status === "string" || Array.isArray(input.status) ? input.status : undefined),
    ) as CaseStatus[] | undefined,
    productLine: enumValues(
      ["CARGO", "PROPERTY", "MARINE_HULL", "UTILITY"] as const,
      parseArrayParam(typeof input.productLine === "string" || Array.isArray(input.productLine) ? input.productLine : undefined),
    ) as
      | ProductLine[]
      | undefined,
    cargoProduct: enumValues(
      ["CPO", "BIODIESEL", "SHORTENING"] as const,
      parseArrayParam(typeof input.cargoProduct === "string" || Array.isArray(input.cargoProduct) ? input.cargoProduct : undefined),
    ) as
      | CargoProduct[]
      | undefined,
    coverType: enumValues(
      ["OPEN_COVER", "SINGLE_SHIPMENT"] as const,
      parseArrayParam(typeof input.coverType === "string" || Array.isArray(input.coverType) ? input.coverType : undefined),
    ) as CoverType[] | undefined,
    clientId: typeof input.clientId === "string" ? input.clientId : undefined,
    insurerId: typeof input.insurerId === "string" ? input.insurerId : undefined,
    search: searchRaw?.trim() || undefined,
    sortBy: (REPORT_CASE_SORT_FIELDS as readonly string[]).includes(sortBy ?? "") ? (sortBy as ReportCaseSortField) : "createdAt",
    sortDirection: sortDirection === "asc" ? "asc" : "desc",
    page: pageRaw ? Math.max(1, Number(pageRaw)) : 1,
    pageSize: pageSizeRaw ? Math.min(200, Math.max(1, Number(pageSizeRaw))) : 20,
  };

  return filters;
}

function buildWhere(filters: ReportFilters): Prisma.CaseWhereInput {
  const where: Prisma.CaseWhereInput = {
    deletedAt: null,
  };

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lt: addOneDay(filters.dateTo) } : {}),
    };
  }
  if (filters.status?.length) where.status = { in: filters.status };
  if (filters.productLine?.length) where.productLine = { in: filters.productLine };
  if (filters.cargoProduct?.length) where.cargoProduct = { in: filters.cargoProduct };
  if (filters.coverType?.length) where.coverType = { in: filters.coverType };
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.insurerId) where.insurerId = filters.insurerId;
  if (filters.search) {
    where.OR = [
      { caseNumber: { contains: filters.search, mode: "insensitive" } },
      { clientName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function toCaseRow(item: {
  caseNumber: string;
  clientName: string;
  productLine: ProductLine;
  cargoProduct: CargoProduct | null;
  coverType: CoverType | null;
  status: CaseStatus;
  currency: string;
  sumInsured: Prisma.Decimal;
  clientRate: Prisma.Decimal;
  insurerRate: Prisma.Decimal;
  clientPremium: Prisma.Decimal;
  insurerPremium: Prisma.Decimal;
  brokerCommission: Prisma.Decimal;
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: Prisma.Decimal | null;
  etd: Date | null;
  eta: Date | null;
  createdAt: Date;
  closedAt: Date | null;
  openCover: { reference: string } | null;
  insurer: { displayName: string } | null;
}): ReportCaseRow {
  return {
    caseNumber: item.caseNumber,
    clientName: item.clientName,
    insurerName: item.insurer?.displayName ?? null,
    productLine: item.productLine,
    cargoProduct: item.cargoProduct,
    coverType: item.coverType,
    status: item.status,
    currency: item.currency,
    sumInsured: item.sumInsured.toFixed(2),
    clientRate: item.clientRate.toString(),
    insurerRate: item.insurerRate.toString(),
    clientPremium: item.clientPremium.toFixed(2),
    insurerPremium: item.insurerPremium.toFixed(2),
    brokerCommission: item.brokerCommission.toFixed(2),
    origin: item.origin,
    destination: item.destination,
    vessel: item.vessel,
    quantity: item.quantity ? item.quantity.toFixed(2) : null,
    etd: item.etd?.toISOString() ?? null,
    eta: item.eta?.toISOString() ?? null,
    openCoverRef: item.openCover?.reference ?? null,
    createdAt: item.createdAt.toISOString(),
    closedAt: item.closedAt?.toISOString() ?? null,
  };
}

function sortRows(rows: ReportCaseRow[], sortBy: ReportCaseSortField, sortDirection: "asc" | "desc") {
  const dir = sortDirection === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sortBy] ?? "";
    const bv = b[sortBy] ?? "";
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const allCases = await prisma.case.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      caseNumber: true,
      clientName: true,
      productLine: true,
      cargoProduct: true,
      status: true,
      createdAt: true,
      currency: true,
      sumInsured: true,
      insurerPremium: true,
      brokerCommission: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const currentMonth = toMonthKey(now);
  let exposure = new Decimal(0);
  let excludedCurrencyCount = 0;
  let monthlyCommission = new Decimal(0);
  let unsettledAmount = new Decimal(0);

  const statusCounts: Record<CaseStatus, number> = {
    DRAFT: 0,
    DOCUMENTATION: 0,
    UNDERWRITING: 0,
    ACTIVE: 0,
    BILLING: 0,
    SETTLING: 0,
    CLOSED: 0,
  };
  const productMap = new Map<string, { productLine: ProductLine; cargoProduct: CargoProduct | null; count: number }>();
  const monthCommissionMap = new Map<string, Decimal>();

  allCases.forEach((item) => {
    statusCounts[item.status] += 1;
    const exposureValue = convertToUsdExposure({ amount: item.sumInsured, currency: item.currency as any });
    if (exposureValue) {
      exposure = exposure.plus(exposureValue);
    } else {
      excludedCurrencyCount += 1;
    }

    if (item.status !== "CLOSED") {
      unsettledAmount = unsettledAmount.plus(new Decimal(item.insurerPremium));
    }

    const itemMonth = toMonthKey(item.createdAt);
    if (itemMonth === currentMonth) {
      monthlyCommission = monthlyCommission.plus(new Decimal(item.brokerCommission));
    }
    monthCommissionMap.set(itemMonth, (monthCommissionMap.get(itemMonth) ?? new Decimal(0)).plus(new Decimal(item.brokerCommission)));

    const key = `${item.productLine}:${item.cargoProduct ?? "-"}`;
    const found = productMap.get(key);
    if (found) {
      found.count += 1;
    } else {
      productMap.set(key, { productLine: item.productLine, cargoProduct: item.cargoProduct, count: 1 });
    }
  });

  const monthlyCommissionTrend = [...monthCommissionMap.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([month, value]) => ({ month, value: value.toFixed(2) }));

  return {
    totalCases: allCases.length,
    activeCases: statusCounts.ACTIVE,
    pendingBillingCount: statusCounts.BILLING,
    totalExposureUsd: exposure.toFixed(2),
    monthlyCommission: monthlyCommission.toFixed(2),
    unsettledAmount: unsettledAmount.toFixed(2),
    excludedCurrencyCount,
    statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({ status: status as CaseStatus, count })),
    productDistribution: [...productMap.values()],
    monthlyCommissionTrend,
    recentCases: allCases.slice(0, 5).map((item) => ({
      id: item.id,
      caseNumber: item.caseNumber,
      clientName: item.clientName,
      productLine: item.productLine,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function getReportSummary(filters: ReportFilters): Promise<ReportSummary> {
  const where = buildWhere(filters);
  const items = await prisma.case.findMany({
    where,
    select: {
      createdAt: true,
      sumInsured: true,
      clientPremium: true,
      insurerPremium: true,
      brokerCommission: true,
    },
  });

  const totals = items.reduce(
    (acc, item) => {
      const month = toMonthKey(item.createdAt);
      acc.sumInsured = acc.sumInsured.plus(new Decimal(item.sumInsured));
      acc.clientPremium = acc.clientPremium.plus(new Decimal(item.clientPremium));
      acc.insurerPremium = acc.insurerPremium.plus(new Decimal(item.insurerPremium));
      acc.brokerCommission = acc.brokerCommission.plus(new Decimal(item.brokerCommission));
      acc.monthlyVolume.set(month, (acc.monthlyVolume.get(month) ?? 0) + 1);
      return acc;
    },
    {
      sumInsured: new Decimal(0),
      clientPremium: new Decimal(0),
      insurerPremium: new Decimal(0),
      brokerCommission: new Decimal(0),
      monthlyVolume: new Map<string, number>(),
    },
  );

  return {
    totalCases: items.length,
    totalSumInsured: totals.sumInsured.toFixed(2),
    totalClientPremium: totals.clientPremium.toFixed(2),
    totalInsurerPremium: totals.insurerPremium.toFixed(2),
    totalBrokerCommission: totals.brokerCommission.toFixed(2),
    monthlyCaseVolume: [...totals.monthlyVolume.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, value]) => ({ month, value: String(value) })),
  };
}

export async function getCommissionBreakdown(filters: ReportFilters): Promise<CommissionBreakdown> {
  const where = buildWhere(filters);
  const items = await prisma.case.findMany({
    where,
    select: {
      createdAt: true,
      brokerCommission: true,
      insurer: { select: { displayName: true } },
      openCover: { select: { insurerName: true } },
    },
  });

  const insurerTotals = new Map<string, { total: Decimal; count: number }>();
  const monthTotals = new Map<string, Decimal>();

  items.forEach((item) => {
    const insurerName = item.insurer?.displayName ?? item.openCover?.insurerName ?? "Unassigned";
    const found = insurerTotals.get(insurerName) ?? { total: new Decimal(0), count: 0 };
    found.total = found.total.plus(new Decimal(item.brokerCommission));
    found.count += 1;
    insurerTotals.set(insurerName, found);

    const month = toMonthKey(item.createdAt);
    monthTotals.set(month, (monthTotals.get(month) ?? new Decimal(0)).plus(new Decimal(item.brokerCommission)));
  });

  return {
    byInsurer: [...insurerTotals.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([insurerName, value]) => ({
        insurerName,
        totalBrokerCommission: value.total.toFixed(2),
        caseCount: value.count,
      })),
    monthlyCommission: [...monthTotals.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, value]) => ({ month, value: value.toFixed(2) })),
  };
}

export async function getReportCases(filters: ReportFilters) {
  const where = buildWhere(filters);
  const select = {
    caseNumber: true,
    clientName: true,
    productLine: true,
    cargoProduct: true,
    coverType: true,
    status: true,
    currency: true,
    sumInsured: true,
    clientRate: true,
    insurerRate: true,
    clientPremium: true,
    insurerPremium: true,
    brokerCommission: true,
    origin: true,
    destination: true,
    vessel: true,
    quantity: true,
    etd: true,
    eta: true,
    createdAt: true,
    closedAt: true,
    insurer: { select: { displayName: true } },
    openCover: { select: { reference: true } },
  } satisfies Prisma.CaseSelect;

  const [total, items] = await Promise.all([prisma.case.count({ where }), prisma.case.findMany({ where, select })]);
  const mapped = sortRows(items.map(toCaseRow), filters.sortBy ?? "createdAt", filters.sortDirection ?? "desc");
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const paged = mapped.slice(start, start + pageSize);

  return {
    items: paged,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getExportRows(filters: ReportFilters) {
  const where = buildWhere(filters);
  const items = await prisma.case.findMany({
    where,
    select: {
      caseNumber: true,
      clientName: true,
      productLine: true,
      cargoProduct: true,
      coverType: true,
      status: true,
      currency: true,
      sumInsured: true,
      clientRate: true,
      insurerRate: true,
      clientPremium: true,
      insurerPremium: true,
      brokerCommission: true,
      origin: true,
      destination: true,
      vessel: true,
      quantity: true,
      etd: true,
      eta: true,
      createdAt: true,
      closedAt: true,
      insurer: { select: { displayName: true } },
      openCover: { select: { reference: true } },
    },
  });

  return sortRows(items.map(toCaseRow), filters.sortBy ?? "createdAt", filters.sortDirection ?? "desc");
}
