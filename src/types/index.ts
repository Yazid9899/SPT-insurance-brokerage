import { NAV_ITEMS } from "@/lib/constants";

export type NavItem = (typeof NAV_ITEMS)[number];

export type FoundationBootstrapResponse = {
  appName: string;
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
  };
  navigation: NavItem[];
  defaultRoute: string;
};

export type FoundationReferencesResponse = {
  productLines: string[];
  cargoSubProducts: string[];
  caseLifecycle: string[];
};

export type OpenCoverStatus = "ACTIVE" | "EXPIRED";

export type OpenCoverListItem = {
  id: string;
  reference: string;
  clientName: string;
  clientCompany: string;
  clientIds?: string[];
  cargoProduct: string | null;
  insurerName: string;
  insurerId?: string | null;
  insurerRate: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: OpenCoverStatus;
  declarationCount: number;
};

export type OpenCoverDetail = OpenCoverListItem & {
  transportMode: string | null;
  currency: string;
  notes: string | null;
  linkedClients?: Array<{ id: string; displayName: string; company: string | null; status: "ACTIVE" | "INACTIVE" }>;
};

export type PartyOption = {
  id: string;
  displayName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export type CaseSummary = {
  id: string;
  caseNumber: string;
  status: string;
  productLine: string;
  coverType: string | null;
  clientName: string;
  clientCompany: string | null;
  clientId?: string | null;
  insurerId?: string | null;
  insurerName?: string | null;
  currency: string;
  clientRate: string;
  insurerRate: string;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  createdAt: string;
  openCoverId: string | null;
};

export type CaseDocumentItem = {
  id: string;
  caseId: string;
  name: string;
  type: string;
  mimeType: string;
  fileSize: number;
  note: string | null;
  uploadedAt: string;
  isShared: boolean;
  bulkUploadId: string | null;
  downloadUrl: string;
};

export type EmailTemplateItem = {
  templateId: string;
  name: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: string[];
};

export type CaseEmailItem = {
  id: string;
  caseId: string;
  templateId: string | null;
  templateName: string | null;
  to: string;
  cc: string | null;
  subject: string;
  body: string;
  sentAt: string;
};

export type BulkUploadColumnMapping = {
  targetField: "origin" | "destination" | "vessel" | "quantity" | "sumInsured" | "etd" | "eta" | "notes";
  sourceHeader: string;
  sourceColumnIndex: number;
  mappingSource: "auto" | "manual";
};

export type BulkUploadRowDraft = {
  rowIndex: number;
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: number | null;
  sumInsured: number | null;
  etd: string | null;
  eta: string | null;
  notes: string | null;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
  errors: string[];
};

export type BulkUploadDraftState = {
  draftId: string;
  openCoverId: string;
  clientRate: number;
  insurerRate: number;
  xlsFileName: string;
  mappings: BulkUploadColumnMapping[];
  rows: BulkUploadRowDraft[];
  tempDocumentIds: string[];
};

export type SettlementStatusValue = "DRAFT" | "CONFIRMED" | "PAID";

export type SettlementListItem = {
  id: string;
  settlementNumber: string;
  period: string;
  insurerName: string;
  status: SettlementStatusValue;
  caseCount: number;
  totalInsurerPremium: string;
  totalBrokerCommission: string;
};

export type SettlementItem = {
  caseId: string;
  caseNumber: string;
  matched: boolean;
  insurerPremium: string;
  brokerCommission: string;
  caseStatus: string;
};

export type SettlementDetail = {
  id: string;
  settlementNumber: string;
  period: string;
  insurerName: string;
  status: SettlementStatusValue;
  paymentDate: string | null;
  bankTransferReference: string | null;
  totalInsurerPremium: string;
  totalBrokerCommission: string;
  caseCount: number;
  items: SettlementItem[];
};

export type ReportsDashboardSummary = {
  totalCases: number;
  activeCases: number;
  pendingBillingCount: number;
  totalExposureUsd: string;
  monthlyCommission: string;
  unsettledAmount: string;
  excludedCurrencyCount: number;
  statusDistribution: Array<{ status: string; count: number }>;
  productDistribution: Array<{ productLine: string; cargoProduct: string | null; count: number }>;
  monthlyCommissionTrend: Array<{ month: string; value: string }>;
  recentCases: Array<{ id: string; caseNumber: string; clientName: string; productLine: string; status: string; createdAt: string }>;
};

export type ReportsSummaryMetrics = {
  totalCases: number;
  totalSumInsured: string;
  totalClientPremium: string;
  totalInsurerPremium: string;
  totalBrokerCommission: string;
  monthlyCaseVolume: Array<{ month: string; value: string }>;
};

export type ReportsCaseRow = {
  caseNumber: string;
  clientName: string;
  insurerName: string | null;
  productLine: string;
  cargoProduct: string | null;
  coverType: string | null;
  status: string;
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

export type ReportsCasesResponse = {
  items: ReportsCaseRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type ReportsCommissionResponse = {
  byInsurer: Array<{ insurerName: string; totalBrokerCommission: string; caseCount: number }>;
  monthlyCommission: Array<{ month: string; value: string }>;
};
