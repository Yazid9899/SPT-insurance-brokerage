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
  cargoProduct: string | null;
  insurerName: string;
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
};

export type CaseSummary = {
  id: string;
  caseNumber: string;
  status: string;
  productLine: string;
  coverType: string | null;
  clientName: string;
  clientCompany: string | null;
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
