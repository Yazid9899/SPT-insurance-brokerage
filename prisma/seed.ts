
import { hash } from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  CaseStatus,
  CargoProduct,
  CoverType,
  Currency,
  PartyStatus,
  PrismaClient,
  ProductLine,
  SettlementStatus,
  TransportMode,
  type Client,
  type Insurer,
  type OpenCover,
} from "@prisma/client";

type SeedProfile = "small" | "medium" | "large";
type SeedStory = "healthy-growth";

type ProductBucket =
  | "CARGO:CPO"
  | "CARGO:BIODIESEL"
  | "CARGO:SHORTENING"
  | "PROPERTY"
  | "MARINE_HULL"
  | "UTILITY";

type CasePlan = {
  caseNumber: string;
  createdAt: Date;
  status: CaseStatus;
  productBucket: ProductBucket;
  client: Client;
  insurer: Insurer;
  openCover: OpenCover | null;
  currency: Currency;
  sumInsured: string;
  clientRate: string;
  insurerRate: string;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  coverType: CoverType | null;
  transportMode: TransportMode | null;
  cargoProduct: CargoProduct | null;
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: string | null;
  etd: Date | null;
  eta: Date | null;
  closedAt: Date | null;
};

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = "casemaker@cargoshield.local";
const DEMO_USER_PASSWORD = "ChangeMe123!";

const PROFILE_MONTH_COUNTS: Record<SeedProfile, number[]> = {
  small: [2, 3, 4, 5, 6, 8],
  medium: [5, 7, 8, 10, 12, 14],
  large: [10, 13, 16, 19, 23, 27],
};

const PROFILE_STATUS_COUNTS: Record<SeedProfile, Array<[CaseStatus, number]>> = {
  small: [
    [CaseStatus.DRAFT, 2],
    [CaseStatus.DOCUMENTATION, 4],
    [CaseStatus.UNDERWRITING, 4],
    [CaseStatus.ACTIVE, 7],
    [CaseStatus.BILLING, 5],
    [CaseStatus.SETTLING, 4],
    [CaseStatus.CLOSED, 2],
  ],
  medium: [
    [CaseStatus.DRAFT, 4],
    [CaseStatus.DOCUMENTATION, 7],
    [CaseStatus.UNDERWRITING, 8],
    [CaseStatus.ACTIVE, 15],
    [CaseStatus.BILLING, 11],
    [CaseStatus.SETTLING, 6],
    [CaseStatus.CLOSED, 5],
  ],
  large: [
    [CaseStatus.DRAFT, 8],
    [CaseStatus.DOCUMENTATION, 14],
    [CaseStatus.UNDERWRITING, 16],
    [CaseStatus.ACTIVE, 30],
    [CaseStatus.BILLING, 22],
    [CaseStatus.SETTLING, 10],
    [CaseStatus.CLOSED, 8],
  ],
};

const PROFILE_PRODUCT_COUNTS: Record<SeedProfile, Array<[ProductBucket, number]>> = {
  small: [
    ["CARGO:CPO", 7],
    ["CARGO:BIODIESEL", 6],
    ["CARGO:SHORTENING", 4],
    ["PROPERTY", 5],
    ["MARINE_HULL", 3],
    ["UTILITY", 3],
  ],
  medium: [
    ["CARGO:CPO", 13],
    ["CARGO:BIODIESEL", 10],
    ["CARGO:SHORTENING", 7],
    ["PROPERTY", 10],
    ["MARINE_HULL", 8],
    ["UTILITY", 8],
  ],
  large: [
    ["CARGO:CPO", 26],
    ["CARGO:BIODIESEL", 20],
    ["CARGO:SHORTENING", 14],
    ["PROPERTY", 20],
    ["MARINE_HULL", 14],
    ["UTILITY", 14],
  ],
};

const MONTHLY_COMMISSION_MULTIPLIER = [0.9, 1.0, 1.4, 0.95, 1.3, 1.55] as const;

const INSURER_SHARE = [0.324, 0.241, 0.176, 0.148, 0.111] as const;
const INSURER_EXPOSURE_FACTOR = [1.18, 1.09, 1.0, 0.93, 0.87] as const;
const INSURER_MARGIN_POINTS = [0.16, 0.12, 0.1, 0.085, 0.07] as const;

const PRODUCT_RATE_MAP: Record<ProductBucket, { clientRatePct: number; sumInsuredUsd: number }> = {
  "CARGO:CPO": { clientRatePct: 0.45, sumInsuredUsd: 550_000 },
  "CARGO:BIODIESEL": { clientRatePct: 0.42, sumInsuredUsd: 520_000 },
  "CARGO:SHORTENING": { clientRatePct: 0.39, sumInsuredUsd: 500_000 },
  PROPERTY: { clientRatePct: 0.34, sumInsuredUsd: 430_000 },
  MARINE_HULL: { clientRatePct: 0.36, sumInsuredUsd: 470_000 },
  UTILITY: { clientRatePct: 0.31, sumInsuredUsd: 400_000 },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const profileArg = args.find((arg) => arg.startsWith("--profile="))?.split("=")[1];
  const storyArg = args.find((arg) => arg.startsWith("--story="))?.split("=")[1];

  const profile: SeedProfile =
    profileArg === "small" || profileArg === "medium" || profileArg === "large" ? profileArg : "large";
  const story: SeedStory = storyArg === "healthy-growth" || !storyArg ? "healthy-growth" : "healthy-growth";

  return { profile, story };
}

function normalizePart(input: string | null | undefined): string {
  if (!input) {
    return "";
  }
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeClientIdentityKey(name: string, company: string | null): string {
  return `${normalizePart(name)}::${normalizePart(company)}`;
}

function makeInsurerIdentityKey(name: string): string {
  return normalizePart(name);
}

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function expandCounts<T extends string>(items: Array<[T, number]>): T[] {
  return items.flatMap(([value, count]) => Array.from({ length: count }, () => value));
}

function shuffle<T>(input: T[], random: () => number): T[] {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

function formatDecimal(value: number, fractionDigits = 2): string {
  return value.toFixed(fractionDigits);
}

function monthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getRollingMonthStarts(totalMonths: number): Date[] {
  const now = new Date();
  const starts: Date[] = [];
  for (let offset = totalMonths - 1; offset >= 0; offset -= 1) {
    starts.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1, 0, 0, 0)));
  }
  return starts;
}

function buildInsurerSlots(total: number): number[] {
  const raw = INSURER_SHARE.map((share) => share * total);
  const base = raw.map((value) => Math.floor(value));
  let remainder = total - base.reduce((sum, n) => sum + n, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < order.length && remainder > 0; i += 1) {
    base[order[i].index] += 1;
    remainder -= 1;
  }

  return base.flatMap((count, insurerIndex) => Array.from({ length: count }, () => insurerIndex));
}

function nextStatusHistory(status: CaseStatus, createdAt: Date, changedBy: string) {
  const lifecycle: CaseStatus[] = [
    CaseStatus.DRAFT,
    CaseStatus.DOCUMENTATION,
    CaseStatus.UNDERWRITING,
    CaseStatus.ACTIVE,
    CaseStatus.BILLING,
    CaseStatus.SETTLING,
    CaseStatus.CLOSED,
  ];
  const targetIndex = lifecycle.indexOf(status);
  const entries: Array<{ fromStatus: CaseStatus | null; toStatus: CaseStatus; changedAt: Date; changedBy: string; note: string }> =
    [];

  for (let i = 0; i <= targetIndex; i += 1) {
    const toStatus = lifecycle[i];
    const fromStatus = i === 0 ? null : lifecycle[i - 1];
    entries.push({
      fromStatus,
      toStatus,
      changedAt: new Date(createdAt.getTime() + i * 24 * 60 * 60 * 1000),
      changedBy,
      note: `Seeded transition to ${toStatus}`,
    });
  }

  return entries;
}
async function upsertUser() {
  const passwordHash = await hash(DEMO_USER_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { name: "Case Maker", passwordHash },
    create: {
      email: DEMO_USER_EMAIL,
      name: "Case Maker",
      passwordHash,
    },
  });
}

async function upsertClients() {
  const seedClients = [
    {
      displayName: "PT Sawit Nusantara",
      company: "PT Sawit Nusantara",
      email: "ops@sawit.seed.local",
      phone: "+62-21-1001",
    },
    {
      displayName: "PT Bio Energi Sentosa",
      company: "PT Bio Energi Sentosa",
      email: "brokerdesk@bioenergi.seed.local",
      phone: "+62-21-1002",
    },
    { displayName: "PT Pangan Utama", company: "PT Pangan Utama", email: "insurance@pangan.seed.local", phone: "+62-21-1003" },
    {
      displayName: "PT Logistik Laut Timur",
      company: "PT Logistik Laut Timur",
      email: "marine@loglauttimur.seed.local",
      phone: "+62-21-1004",
    },
    {
      displayName: "PT Utility Kargo Mandiri",
      company: "PT Utility Kargo Mandiri",
      email: "risk@utilitykargo.seed.local",
      phone: "+62-21-1005",
    },
    {
      displayName: "PT Mitra Infrastruktur",
      company: "PT Mitra Infrastruktur",
      email: "admin@mitrainfra.seed.local",
      phone: "+62-21-1006",
    },
    { displayName: "PT Samudera Prima", company: "PT Samudera Prima", email: "ops@samuderaprima.seed.local", phone: "+62-21-1007" },
    {
      displayName: "PT Multi Angkut Sejahtera",
      company: "PT Multi Angkut Sejahtera",
      email: "finance@multiangkut.seed.local",
      phone: "+62-21-1008",
    },
  ];

  const clients: Client[] = [];
  for (const seedClient of seedClients) {
    const identityKey = makeClientIdentityKey(seedClient.displayName, seedClient.company);
    const client = await prisma.client.upsert({
      where: { identityKey },
      update: {
        displayName: seedClient.displayName,
        company: seedClient.company,
        email: seedClient.email,
        phone: seedClient.phone,
        normalizedName: normalizePart(seedClient.displayName),
        normalizedCompany: normalizePart(seedClient.company),
        status: PartyStatus.ACTIVE,
      },
      create: {
        displayName: seedClient.displayName,
        company: seedClient.company,
        email: seedClient.email,
        phone: seedClient.phone,
        normalizedName: normalizePart(seedClient.displayName),
        normalizedCompany: normalizePart(seedClient.company),
        identityKey,
        status: PartyStatus.ACTIVE,
      },
    });
    clients.push(client);
  }

  return clients;
}

async function upsertInsurers() {
  const seedInsurers = [
    { displayName: "Nusantara Insurance", email: "uw@nusantara-ins.seed.local", phone: "+62-21-2001" },
    { displayName: "Archipelago Assurance", email: "uw@archipelago.seed.local", phone: "+62-21-2002" },
    { displayName: "Pacific Underwriters", email: "uw@pacific.seed.local", phone: "+62-21-2003" },
    { displayName: "Marina Re Indonesia", email: "uw@marinare.seed.local", phone: "+62-21-2004" },
    { displayName: "Equator General", email: "uw@equator.seed.local", phone: "+62-21-2005" },
  ];

  const insurers: Insurer[] = [];
  for (const seedInsurer of seedInsurers) {
    const identityKey = makeInsurerIdentityKey(seedInsurer.displayName);
    const insurer = await prisma.insurer.upsert({
      where: { identityKey },
      update: {
        displayName: seedInsurer.displayName,
        email: seedInsurer.email,
        phone: seedInsurer.phone,
        normalizedName: normalizePart(seedInsurer.displayName),
        status: PartyStatus.ACTIVE,
      },
      create: {
        displayName: seedInsurer.displayName,
        email: seedInsurer.email,
        phone: seedInsurer.phone,
        normalizedName: normalizePart(seedInsurer.displayName),
        identityKey,
        status: PartyStatus.ACTIVE,
      },
    });
    insurers.push(insurer);
  }

  return insurers;
}

async function upsertOpenCovers(clients: Client[], insurers: Insurer[]) {
  const definitions = [
    { reference: "OC-DEMO-001", insurerIndex: 0, cargoProduct: CargoProduct.CPO, clientIndexes: [0, 1, 6] },
    { reference: "OC-DEMO-002", insurerIndex: 0, cargoProduct: CargoProduct.BIODIESEL, clientIndexes: [1, 2, 7] },
    { reference: "OC-DEMO-003", insurerIndex: 1, cargoProduct: CargoProduct.CPO, clientIndexes: [2, 3, 4] },
    { reference: "OC-DEMO-004", insurerIndex: 1, cargoProduct: CargoProduct.SHORTENING, clientIndexes: [0, 5, 7] },
    { reference: "OC-DEMO-005", insurerIndex: 2, cargoProduct: CargoProduct.BIODIESEL, clientIndexes: [1, 4, 6] },
    { reference: "OC-DEMO-006", insurerIndex: 2, cargoProduct: CargoProduct.CPO, clientIndexes: [2, 5, 6] },
    { reference: "OC-DEMO-007", insurerIndex: 3, cargoProduct: CargoProduct.SHORTENING, clientIndexes: [0, 3, 5] },
    { reference: "OC-DEMO-008", insurerIndex: 3, cargoProduct: CargoProduct.CPO, clientIndexes: [1, 3, 7] },
    { reference: "OC-DEMO-009", insurerIndex: 4, cargoProduct: CargoProduct.BIODIESEL, clientIndexes: [4, 6, 7] },
    { reference: "OC-DEMO-010", insurerIndex: 4, cargoProduct: CargoProduct.CPO, clientIndexes: [0, 2, 5] },
  ] as const;

  const year = new Date().getUTCFullYear();
  const openCovers: OpenCover[] = [];

  for (const definition of definitions) {
    const insurer = insurers[definition.insurerIndex];
    const openCover = await prisma.openCover.upsert({
      where: { reference: definition.reference },
      update: {
        clientName: "Multi-Client Program",
        clientCompany: "Seed Brokerage Portfolio",
        insurerName: insurer.displayName,
        insurerId: insurer.id,
        cargoProduct: definition.cargoProduct,
        transportMode: TransportMode.MARINE,
        insurerRate: "0.280000",
        currency: Currency.USD,
        effectiveFrom: new Date(Date.UTC(year, 0, 1)),
        effectiveTo: new Date(Date.UTC(year, 11, 31)),
        isActive: true,
        notes: "Seeded open cover for dashboard demos",
      },
      create: {
        reference: definition.reference,
        clientName: "Multi-Client Program",
        clientCompany: "Seed Brokerage Portfolio",
        insurerName: insurer.displayName,
        insurerId: insurer.id,
        cargoProduct: definition.cargoProduct,
        transportMode: TransportMode.MARINE,
        insurerRate: "0.280000",
        currency: Currency.USD,
        effectiveFrom: new Date(Date.UTC(year, 0, 1)),
        effectiveTo: new Date(Date.UTC(year, 11, 31)),
        isActive: true,
        notes: "Seeded open cover for dashboard demos",
      },
    });

    for (const clientIndex of definition.clientIndexes) {
      const client = clients[clientIndex];
      await prisma.openCoverClientLink.upsert({
        where: {
          openCoverId_clientId: {
            openCoverId: openCover.id,
            clientId: client.id,
          },
        },
        update: {},
        create: {
          openCoverId: openCover.id,
          clientId: client.id,
        },
      });
    }

    openCovers.push(openCover);
  }

  return openCovers;
}

function parseProductBucket(bucket: ProductBucket) {
  if (bucket.startsWith("CARGO:")) {
    const cargoRaw = bucket.split(":")[1];
    const cargoProduct = cargoRaw as CargoProduct;
    return {
      productLine: ProductLine.CARGO,
      cargoProduct,
      defaultCoverType: CoverType.OPEN_COVER,
      defaultTransportMode: TransportMode.MARINE,
    };
  }

  if (bucket === "PROPERTY") {
    return { productLine: ProductLine.PROPERTY, cargoProduct: null, defaultCoverType: null, defaultTransportMode: null };
  }
  if (bucket === "MARINE_HULL") {
    return { productLine: ProductLine.MARINE_HULL, cargoProduct: null, defaultCoverType: null, defaultTransportMode: null };
  }

  return { productLine: ProductLine.UTILITY, cargoProduct: null, defaultCoverType: null, defaultTransportMode: null };
}

function calculatePremiums(sumInsured: number, clientRatePct: number, insurerRatePct: number) {
  const clientPremium = (sumInsured * clientRatePct) / 100;
  const insurerPremium = (sumInsured * insurerRatePct) / 100;
  const brokerCommission = clientPremium - insurerPremium;

  return {
    clientPremium: formatDecimal(clientPremium),
    insurerPremium: formatDecimal(insurerPremium),
    brokerCommission: formatDecimal(brokerCommission),
  };
}
function buildCasePlans(input: {
  profile: SeedProfile;
  clients: Client[];
  insurers: Insurer[];
  openCovers: OpenCover[];
}) {
  const random = createRng(20260327);
  const monthCounts = PROFILE_MONTH_COUNTS[input.profile];
  const totalCases = monthCounts.reduce((sum, count) => sum + count, 0);

  const statuses = shuffle(expandCounts(PROFILE_STATUS_COUNTS[input.profile]), random);
  const productBuckets = shuffle(expandCounts(PROFILE_PRODUCT_COUNTS[input.profile]), random);
  const insurerSlots = shuffle(buildInsurerSlots(totalCases), random);
  const clientSlots = shuffle(Array.from({ length: totalCases }, (_, i) => i % input.clients.length), random);

  const monthStarts = getRollingMonthStarts(6);
  const casePlans: CasePlan[] = [];
  let caseIndex = 0;

  for (let monthIndex = 0; monthIndex < monthCounts.length; monthIndex += 1) {
    const monthCount = monthCounts[monthIndex];
    const monthStart = monthStarts[monthIndex];

    for (let inMonthIndex = 0; inMonthIndex < monthCount; inMonthIndex += 1) {
      const insurer = input.insurers[insurerSlots[caseIndex]];
      const client = input.clients[clientSlots[caseIndex]];
      const status = statuses[caseIndex];
      const productBucket = productBuckets[caseIndex];
      const productMeta = parseProductBucket(productBucket);
      const baseRate = PRODUCT_RATE_MAP[productBucket];

      const day = 1 + Math.floor(random() * 25);
      const hour = 8 + Math.floor(random() * 9);
      const createdAt = new Date(
        Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), day, hour, Math.floor(random() * 59), 0),
      );

      const monthMultiplier = MONTHLY_COMMISSION_MULTIPLIER[monthIndex];
      const insurerFactor = INSURER_EXPOSURE_FACTOR[insurerSlots[caseIndex]];
      const randomFactor = 0.85 + random() * 0.3;
      const sumInsured = baseRate.sumInsuredUsd * monthMultiplier * insurerFactor * randomFactor;

      const margin = INSURER_MARGIN_POINTS[insurerSlots[caseIndex]];
      const clientRate = baseRate.clientRatePct;
      const insurerRate = clientRate - margin;
      const premiums = calculatePremiums(sumInsured, clientRate, insurerRate);

      const coverEligible = productMeta.productLine === ProductLine.CARGO;
      const insurerOpenCovers = input.openCovers.filter((item) => item.insurerId === insurer.id);
      const openCover =
        coverEligible && insurerOpenCovers.length > 0 && random() < 0.85
          ? insurerOpenCovers[Math.floor(random() * insurerOpenCovers.length)]
          : null;

      const transportMode =
        productMeta.productLine === ProductLine.CARGO ? (random() < 0.7 ? TransportMode.MARINE : TransportMode.TRUCKING) : null;

      const etd = productMeta.productLine === ProductLine.CARGO ? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
      const eta = etd ? new Date(etd.getTime() + (5 + Math.floor(random() * 15)) * 24 * 60 * 60 * 1000) : null;
      const closedAt = status === CaseStatus.CLOSED ? new Date(createdAt.getTime() + 35 * 24 * 60 * 60 * 1000) : null;

      casePlans.push({
        caseNumber: `BRK-DEMO-${monthStart.getUTCFullYear()}-${String(caseIndex + 1).padStart(4, "0")}`,
        createdAt,
        status,
        productBucket,
        client,
        insurer,
        openCover,
        currency: Currency.USD,
        sumInsured: formatDecimal(sumInsured),
        clientRate: formatDecimal(clientRate, 6),
        insurerRate: formatDecimal(insurerRate, 6),
        clientPremium: premiums.clientPremium,
        insurerPremium: premiums.insurerPremium,
        brokerCommission: premiums.brokerCommission,
        coverType:
          productMeta.productLine === ProductLine.CARGO ? (openCover ? CoverType.OPEN_COVER : CoverType.SINGLE_SHIPMENT) : null,
        transportMode,
        cargoProduct: productMeta.cargoProduct,
        origin: productMeta.productLine === ProductLine.CARGO ? ["Dumai", "Balikpapan", "Pekanbaru", "Belawan"][caseIndex % 4] : null,
        destination:
          productMeta.productLine === ProductLine.CARGO ? ["Jakarta", "Surabaya", "Semarang", "Makassar"][caseIndex % 4] : null,
        vessel: productMeta.productLine === ProductLine.CARGO ? `MV Seed ${String((caseIndex % 18) + 1).padStart(2, "0")}` : null,
        quantity: productMeta.productLine === ProductLine.CARGO ? formatDecimal(450 + (caseIndex % 9) * 90) : null,
        etd,
        eta,
        closedAt,
      });

      caseIndex += 1;
    }
  }

  return casePlans;
}

async function upsertCases(casePlans: CasePlan[], createdById: string) {
  const caseIds: string[] = [];

  for (const plan of casePlans) {
    const productMeta = parseProductBucket(plan.productBucket);

    const upserted = await prisma.case.upsert({
      where: { caseNumber: plan.caseNumber },
      update: {
        productLine: productMeta.productLine,
        cargoProduct: plan.cargoProduct,
        coverType: plan.coverType,
        transportMode: plan.transportMode,
        clientName: plan.client.displayName,
        clientCompany: plan.client.company,
        clientEmail: plan.client.email,
        clientPhone: plan.client.phone,
        clientId: plan.client.id,
        insurerId: plan.insurer.id,
        openCoverId: plan.openCover?.id ?? null,
        status: plan.status,
        closedAt: plan.closedAt,
        deletedAt: null,
        currency: plan.currency,
        sumInsured: plan.sumInsured,
        clientRate: plan.clientRate,
        insurerRate: plan.insurerRate,
        clientPremium: plan.clientPremium,
        insurerPremium: plan.insurerPremium,
        brokerCommission: plan.brokerCommission,
        origin: plan.origin,
        destination: plan.destination,
        vessel: plan.vessel,
        quantity: plan.quantity,
        etd: plan.etd,
        eta: plan.eta,
        notes: `Seeded ${plan.productBucket} case for dashboard chart realism`,
        createdById,
        createdAt: plan.createdAt,
      },
      create: {
        caseNumber: plan.caseNumber,
        productLine: productMeta.productLine,
        cargoProduct: plan.cargoProduct,
        coverType: plan.coverType,
        transportMode: plan.transportMode,
        clientName: plan.client.displayName,
        clientCompany: plan.client.company,
        clientEmail: plan.client.email,
        clientPhone: plan.client.phone,
        clientId: plan.client.id,
        insurerId: plan.insurer.id,
        openCoverId: plan.openCover?.id ?? null,
        status: plan.status,
        closedAt: plan.closedAt,
        currency: plan.currency,
        sumInsured: plan.sumInsured,
        clientRate: plan.clientRate,
        insurerRate: plan.insurerRate,
        clientPremium: plan.clientPremium,
        insurerPremium: plan.insurerPremium,
        brokerCommission: plan.brokerCommission,
        origin: plan.origin,
        destination: plan.destination,
        vessel: plan.vessel,
        quantity: plan.quantity,
        etd: plan.etd,
        eta: plan.eta,
        notes: `Seeded ${plan.productBucket} case for dashboard chart realism`,
        createdById,
        createdAt: plan.createdAt,
      },
      select: {
        id: true,
      },
    });

    await prisma.caseStatusHistory.deleteMany({ where: { caseId: upserted.id } });
    const history = nextStatusHistory(plan.status, plan.createdAt, createdById);
    await prisma.caseStatusHistory.createMany({
      data: history.map((item) => ({
        caseId: upserted.id,
        fromStatus: item.fromStatus,
        toStatus: item.toStatus,
        changedAt: item.changedAt,
        changedBy: item.changedBy,
        note: item.note,
      })),
    });

    caseIds.push(upserted.id);
  }

  return caseIds;
}
async function seedDocuments(casePlans: CasePlan[]) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "seed");
  await mkdir(uploadDir, { recursive: true });

  const sorted = [...casePlans].sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
  const docCaseCount = Math.floor(sorted.length * 0.4);
  const docCases = sorted.slice(0, docCaseCount);

  for (const casePlan of sorted) {
    const row = await prisma.case.findUnique({ where: { caseNumber: casePlan.caseNumber }, select: { id: true } });
    if (!row) continue;
    await prisma.caseDocument.deleteMany({ where: { caseId: row.id } });
  }

  for (const casePlan of docCases) {
    const row = await prisma.case.findUnique({ where: { caseNumber: casePlan.caseNumber }, select: { id: true, status: true } });
    if (!row) continue;

    const types =
      row.status === CaseStatus.DOCUMENTATION
        ? ["BILL_OF_LADING", "COMMERCIAL_INVOICE"]
        : row.status === CaseStatus.UNDERWRITING
          ? ["POLICY_DOCUMENT", "CERTIFICATE_OF_INSURANCE"]
          : row.status === CaseStatus.BILLING || row.status === CaseStatus.SETTLING || row.status === CaseStatus.CLOSED
            ? ["DEBIT_NOTE"]
            : ["OTHER"];

    for (const type of types) {
      const fileName = `${casePlan.caseNumber.toLowerCase()}-${type.toLowerCase()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      const content = `Seeded ${type} for ${casePlan.caseNumber}\nGenerated at ${new Date().toISOString()}\n`;
      await writeFile(filePath, content, "utf8");

      await prisma.caseDocument.create({
        data: {
          caseId: row.id,
          name: `${type.replaceAll("_", " ")} - ${casePlan.caseNumber}`,
          type: type as
            | "POLICY_DOCUMENT"
            | "BILL_OF_LADING"
            | "COMMERCIAL_INVOICE"
            | "PACKING_LIST"
            | "CERTIFICATE_OF_INSURANCE"
            | "SURVEY_REPORT"
            | "CLAIM_FORM"
            | "ENDORSEMENT"
            | "DEBIT_NOTE"
            | "CREDIT_NOTE"
            | "OTHER",
          fileName,
          filePath: `/uploads/seed/${fileName}`,
          fileSize: Buffer.byteLength(content, "utf8"),
          mimeType: "application/pdf",
          notes: "Seeded document placeholder",
        },
      });
    }
  }
}

async function seedEmails(casePlans: CasePlan[], sentById: string) {
  const sorted = [...casePlans].sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
  const emailCaseCount = Math.floor(sorted.length * 0.25);
  const emailCases = sorted.slice(0, emailCaseCount);

  const allSeedCaseNumbers = sorted.map((item) => item.caseNumber);
  const allSeedCases = await prisma.case.findMany({
    where: { caseNumber: { in: allSeedCaseNumbers } },
    select: { id: true },
  });

  await prisma.caseEmail.deleteMany({
    where: {
      caseId: { in: allSeedCases.map((item) => item.id) },
    },
  });

  for (const casePlan of emailCases) {
    const row = await prisma.case.findUnique({ where: { caseNumber: casePlan.caseNumber }, select: { id: true } });
    if (!row) continue;

    const sentAt = new Date(casePlan.createdAt.getTime() + 2 * 60 * 60 * 1000);
    await prisma.caseEmail.create({
      data: {
        caseId: row.id,
        templateId: "seed-follow-up",
        to: casePlan.client.email ?? "client@seed.local",
        cc: "broker-ops@seed.local",
        subject: `Seed update for ${casePlan.caseNumber}`,
        body: `Dear ${casePlan.client.displayName},\n\nThis is a seeded communication log for dashboard demonstrations.\n\nRegards,\nCargoShield`,
        sentById,
        sentAt,
      },
    });
  }
}

function sumMoney(values: string[]) {
  const total = values.reduce((sum, value) => sum + Number(value), 0);
  return formatDecimal(total);
}

async function upsertSettlement(input: {
  settlementNumber: string;
  period: string;
  insurerName: string;
  createdById: string;
  status: SettlementStatus;
  confirmedAt?: Date | null;
  paidAt?: Date | null;
  paymentRef?: string | null;
  caseIds: string[];
}) {
  const cases = await prisma.case.findMany({
    where: { id: { in: input.caseIds } },
    select: { id: true, insurerPremium: true, brokerCommission: true },
  });

  const totals = {
    totalInsurerPremium: sumMoney(cases.map((item) => item.insurerPremium.toFixed(2))),
    totalBrokerCommission: sumMoney(cases.map((item) => item.brokerCommission.toFixed(2))),
  };

  const settlement = await prisma.settlement.upsert({
    where: { settlementNumber: input.settlementNumber },
    update: {
      insurerName: input.insurerName,
      period: input.period,
      currency: Currency.USD,
      status: input.status,
      confirmedAt: input.confirmedAt ?? null,
      paidAt: input.paidAt ?? null,
      paymentRef: input.paymentRef ?? null,
      totalInsurerPremium: totals.totalInsurerPremium,
      totalBrokerCommission: totals.totalBrokerCommission,
      createdById: input.createdById,
      notes: "Seeded settlement for dashboard realism",
    },
    create: {
      settlementNumber: input.settlementNumber,
      insurerName: input.insurerName,
      period: input.period,
      currency: Currency.USD,
      status: input.status,
      confirmedAt: input.confirmedAt ?? null,
      paidAt: input.paidAt ?? null,
      paymentRef: input.paymentRef ?? null,
      totalInsurerPremium: totals.totalInsurerPremium,
      totalBrokerCommission: totals.totalBrokerCommission,
      createdById: input.createdById,
      notes: "Seeded settlement for dashboard realism",
    },
    select: { id: true },
  });

  await prisma.settlementItem.deleteMany({ where: { settlementId: settlement.id } });
  if (cases.length > 0) {
    await prisma.settlementItem.createMany({
      data: cases.map((item) => ({
        settlementId: settlement.id,
        caseId: item.id,
        insurerPremium: item.insurerPremium,
        brokerCommission: item.brokerCommission,
        matched: true,
      })),
    });
  }
}

function pickInsurerGroup(
  cases: Array<{ id: string; status: CaseStatus; insurerId: string | null; insurerName: string | null }>,
  targetStatus: CaseStatus,
  maxCount: number,
) {
  const statusCases = cases.filter((item) => item.status === targetStatus && item.insurerId && item.insurerName);
  const buckets = new Map<string, Array<{ id: string; insurerName: string }>>();

  for (const row of statusCases) {
    const key = row.insurerId as string;
    const existing = buckets.get(key) ?? [];
    existing.push({ id: row.id, insurerName: row.insurerName as string });
    buckets.set(key, existing);
  }

  const best = [...buckets.values()].sort((a, b) => b.length - a.length)[0] ?? [];
  return best.slice(0, Math.min(maxCount, best.length));
}

async function seedSettlements(casePlans: CasePlan[], createdById: string) {
  const caseRows = await prisma.case.findMany({
    where: { caseNumber: { in: casePlans.map((item) => item.caseNumber) } },
    select: {
      id: true,
      status: true,
      insurerId: true,
      insurer: { select: { displayName: true } },
      createdAt: true,
    },
  });

  const months = [...new Set(casePlans.map((item) => monthKey(item.createdAt)))].sort();
  const latest = months[months.length - 1];
  const previous = months[months.length - 2] ?? latest;
  const older = months[months.length - 3] ?? previous;

  const normalized = caseRows.map((item) => ({
    id: item.id,
    status: item.status,
    insurerId: item.insurerId,
    insurerName: item.insurer?.displayName ?? null,
  }));
  const billingGroup = pickInsurerGroup(normalized, CaseStatus.BILLING, 8);
  const settlingGroup = pickInsurerGroup(normalized, CaseStatus.SETTLING, 6);
  const closedGroup = pickInsurerGroup(normalized, CaseStatus.CLOSED, 5);

  if (billingGroup.length > 0) {
    await upsertSettlement({
      settlementNumber: `SEED-STL-${latest}-DRAFT`,
      period: latest,
      insurerName: billingGroup[0].insurerName,
      createdById,
      status: SettlementStatus.DRAFT,
      caseIds: billingGroup.map((item) => item.id),
    });
  }

  if (settlingGroup.length > 0) {
    await upsertSettlement({
      settlementNumber: `SEED-STL-${previous}-CONF`,
      period: previous,
      insurerName: settlingGroup[0].insurerName,
      createdById,
      status: SettlementStatus.CONFIRMED,
      confirmedAt: new Date(),
      caseIds: settlingGroup.map((item) => item.id),
    });
  }

  if (closedGroup.length > 0) {
    const paidAt = new Date();
    await upsertSettlement({
      settlementNumber: `SEED-STL-${older}-PAID`,
      period: older,
      insurerName: closedGroup[0].insurerName,
      createdById,
      status: SettlementStatus.PAID,
      confirmedAt: new Date(paidAt.getTime() - 5 * 24 * 60 * 60 * 1000),
      paidAt,
      paymentRef: `SEED-TRF-${older.replace("-", "")}`,
      caseIds: closedGroup.map((item) => item.id),
    });
  }
}
async function printSummary(casePlans: CasePlan[]) {
  const rows = await prisma.case.findMany({
    where: { caseNumber: { in: casePlans.map((item) => item.caseNumber) } },
    select: {
      status: true,
      createdAt: true,
      brokerCommission: true,
      productLine: true,
      cargoProduct: true,
      insurer: { select: { displayName: true } },
    },
  });

  const byStatus = new Map<CaseStatus, number>();
  const byProduct = new Map<string, number>();
  const byMonth = new Map<string, { cases: number; commission: number }>();
  const byInsurer = new Map<string, number>();

  for (const row of rows) {
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);

    const productKey = row.cargoProduct ? `${row.productLine}:${row.cargoProduct}` : row.productLine;
    byProduct.set(productKey, (byProduct.get(productKey) ?? 0) + 1);

    const key = monthKey(row.createdAt);
    const month = byMonth.get(key) ?? { cases: 0, commission: 0 };
    month.cases += 1;
    month.commission += Number(row.brokerCommission);
    byMonth.set(key, month);

    const insurer = row.insurer?.displayName ?? "Unassigned";
    byInsurer.set(insurer, (byInsurer.get(insurer) ?? 0) + Number(row.brokerCommission));
  }

  console.log("\nSeed summary");
  console.log("-----------");
  console.log(`Cases: ${rows.length}`);
  console.log(`By status: ${JSON.stringify(Object.fromEntries([...byStatus.entries()].sort((a, b) => a[0].localeCompare(b[0]))))}`);
  console.log(`By product: ${JSON.stringify(Object.fromEntries([...byProduct.entries()].sort((a, b) => a[0].localeCompare(b[0]))))}`);
  console.log(
    `By month: ${JSON.stringify(
      Object.fromEntries(
        [...byMonth.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, values]) => [month, { cases: values.cases, commission: formatDecimal(values.commission) }]),
      ),
    )}`,
  );

  const insurerShare = [...byInsurer.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([insurer, total]) => ({ insurer, total: formatDecimal(total) }));
  console.log(`Commission by insurer: ${JSON.stringify(insurerShare)}`);
}

async function main() {
  const { profile, story } = parseArgs();
  if (story !== "healthy-growth") {
    throw new Error(`Unsupported story: ${story}`);
  }

  const user = await upsertUser();
  const clients = await upsertClients();
  const insurers = await upsertInsurers();
  const openCovers = await upsertOpenCovers(clients, insurers);

  const casePlans = buildCasePlans({
    profile,
    clients,
    insurers,
    openCovers,
  });

  await upsertCases(casePlans, user.id);
  await seedDocuments(casePlans);
  await seedEmails(casePlans, user.id);
  await seedSettlements(casePlans, user.id);
  await printSummary(casePlans);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
