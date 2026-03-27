import { z } from "zod";

import {
  CARGO_SUB_PRODUCTS,
  CASE_LIFECYCLE,
  COVER_TYPES,
  CURRENCIES,
  DOCUMENT_ALLOWED_EXTENSIONS,
  DOCUMENT_ALLOWED_MIME_TYPES,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  OPEN_COVER_CLIENT_LINK_MIN,
  PARTY_STATUSES,
  PRODUCT_LINES,
  TRANSPORT_MODES,
} from "@/lib/constants";
import { BULK_UPLOAD_TARGET_FIELDS } from "@/lib/bulk-upload/header-aliases";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const apiErrorSchema = z.object({
  error: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

const decimalRate = z.coerce.number().min(0).max(100);
const positiveAmount = z.coerce.number().positive();

export const openCoverUpsertSchema = z
  .object({
    reference: z.string().min(1),
    clientName: z.string().min(1),
    clientCompany: z.string().min(1),
    insurerName: z.string().min(1),
    insurerId: z.string().cuid().optional().nullable(),
    clientIds: z.array(z.string().cuid()).optional().default([]),
    productLine: z.literal("CARGO"),
    cargoProduct: z.enum(CARGO_SUB_PRODUCTS),
    transportMode: z.enum(TRANSPORT_MODES),
    currency: z.enum(CURRENCIES),
    insurerRate: decimalRate,
    effectiveFrom: z.coerce.date(),
    effectiveTo: z.coerce.date(),
    notes: z.string().max(2000).optional().nullable(),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((value, ctx) => {
    if (value.effectiveFrom > value.effectiveTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveFrom"],
        message: "effectiveFrom must be before or equal to effectiveTo",
      });
    }

    if (value.isActive && value.clientIds.length < OPEN_COVER_CLIENT_LINK_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["clientIds"],
        message: "Active open cover requires at least one linked client",
      });
    }
  });

export const caseUpsertSchema = z
  .object({
    productLine: z.enum(PRODUCT_LINES),
    cargoProduct: z.enum(CARGO_SUB_PRODUCTS).optional().nullable(),
    coverType: z.enum(COVER_TYPES).optional().nullable(),
    transportMode: z.enum(TRANSPORT_MODES).optional().nullable(),
    openCoverId: z.string().cuid().optional().nullable(),
    clientName: z.string().min(1),
    clientEmail: z.string().email().optional().nullable(),
    clientPhone: z.string().optional().nullable(),
    clientCompany: z.string().optional().nullable(),
    clientId: z.string().cuid().optional().nullable(),
    insurerId: z.string().cuid().optional().nullable(),
    currency: z.enum(CURRENCIES),
    sumInsured: positiveAmount,
    clientRate: decimalRate,
    insurerRate: decimalRate,
    origin: z.string().optional().nullable(),
    destination: z.string().optional().nullable(),
    vessel: z.string().optional().nullable(),
    quantity: z.coerce.number().positive().optional().nullable(),
    etd: z.coerce.date().optional().nullable(),
    eta: z.coerce.date().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.productLine === "CARGO") {
      if (!value.cargoProduct) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cargoProduct"], message: "cargoProduct is required for CARGO" });
      }
      if (!value.coverType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coverType"], message: "coverType is required for CARGO" });
      }
      if (!value.transportMode) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["transportMode"], message: "transportMode is required for CARGO" });
      }
    }

    if (value.coverType === "OPEN_COVER") {
      if (!value.openCoverId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["openCoverId"], message: "openCoverId is required for OPEN_COVER" });
      }
      if (!value.clientId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["clientId"], message: "clientId is required for OPEN_COVER" });
      }
    } else {
      if (!value.clientId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["clientId"], message: "clientId is required" });
      }
      if (!value.insurerId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["insurerId"], message: "insurerId is required" });
      }
    }

    if (value.clientRate < value.insurerRate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["clientRate"], message: "clientRate must be greater than or equal to insurerRate" });
    }
  });

export const caseStatusTransitionSchema = z.object({
  toStatus: z.enum(CASE_LIFECYCLE),
  note: z.string().max(1000).optional().nullable(),
  debitNoteAcknowledged: z.boolean().optional(),
});

export const caseListFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().refine((v) => v === 20, { message: "pageSize must be 20" }).default(20),
  q: z.string().optional(),
  clientId: z.string().cuid().optional(),
  insurerId: z.string().cuid().optional(),
  status: z
    .preprocess((value) => {
      if (typeof value !== "string" || value.trim() === "") {
        return undefined;
      }
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }, z.array(z.enum(CASE_LIFECYCLE)).optional())
    .optional(),
  productLine: z.enum(PRODUCT_LINES).optional(),
  cargoProduct: z.enum(CARGO_SUB_PRODUCTS).optional(),
  coverType: z.enum(COVER_TYPES).optional(),
  sortBy: z
    .enum([
      "caseNumber",
      "clientName",
      "productLine",
      "cargoProduct",
      "coverType",
      "status",
      "sumInsured",
      "brokerCommission",
      "createdAt",
    ])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const openCoverListFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "ALL"]).optional(),
  activeOnly: z.enum(["true", "false"]).optional(),
});

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);

export const documentUploadMetaSchema = z.object({
  documentType: documentTypeSchema,
  note: z.string().max(2000).optional(),
});

export const emailTemplatePreviewSchema = z.object({
  templateId: z.string().min(1),
  vars: z.record(z.string(), z.string()),
});

export const caseEmailCreateSchema = z.object({
  templateId: z.string().min(1),
  to: z.string().email(),
  cc: z.string().optional().nullable(),
  subject: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

const settlementPeriodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const settlementCreateSchema = z.object({
  insurerName: z.string().trim().min(1),
  period: z
    .string()
    .trim()
    .regex(settlementPeriodRegex, "period must be YYYY-MM"),
});

export const partyUpsertSchema = z.object({
  displayName: z.string().trim().min(1),
  company: z.string().trim().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  status: z.enum(PARTY_STATUSES).optional().default("ACTIVE"),
});

export const settlementListFilterSchema = z.object({
  period: z.string().trim().regex(settlementPeriodRegex).optional(),
  insurer: z.string().trim().optional(),
  status: z.enum(["DRAFT", "CONFIRMED", "PAID"]).optional(),
});

export const settlementMatchingUpdateSchema = z.object({
  items: z.array(
    z.object({
      caseId: z.string().cuid(),
      matched: z.boolean(),
    }),
  ),
});

export const settlementConfirmSchema = z.object({
  note: z.string().max(1000).optional().nullable(),
});

export const settlementPaySchema = z.object({
  paymentDate: z.coerce.date(),
  bankTransferReference: z.string().trim().min(1).max(200),
  note: z.string().max(1000).optional().nullable(),
});

const reportDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date format YYYY-MM-DD");
const reportSortFields = [
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

export const reportQuerySchema = z
  .object({
    dateFrom: reportDateString.optional(),
    dateTo: reportDateString.optional(),
    status: z
      .preprocess((value) => (typeof value === "string" ? value.split(",").map((v) => v.trim()).filter(Boolean) : value), z.array(z.enum(CASE_LIFECYCLE)).optional())
      .optional(),
    productLine: z
      .preprocess((value) => (typeof value === "string" ? value.split(",").map((v) => v.trim()).filter(Boolean) : value), z.array(z.enum(PRODUCT_LINES)).optional())
      .optional(),
    cargoProduct: z
      .preprocess((value) => (typeof value === "string" ? value.split(",").map((v) => v.trim()).filter(Boolean) : value), z.array(z.enum(CARGO_SUB_PRODUCTS)).optional())
      .optional(),
    coverType: z
      .preprocess((value) => (typeof value === "string" ? value.split(",").map((v) => v.trim()).filter(Boolean) : value), z.array(z.enum(COVER_TYPES)).optional())
      .optional(),
    clientId: z.string().cuid().optional(),
    insurerId: z.string().cuid().optional(),
    search: z.string().optional(),
    sortBy: z.enum(reportSortFields).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(20),
  })
  .superRefine((value, ctx) => {
    if (value.dateFrom && value.dateTo) {
      const from = new Date(`${value.dateFrom}T00:00:00.000Z`);
      const to = new Date(`${value.dateTo}T00:00:00.000Z`);
      if (from > to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateFrom"],
          message: "dateFrom must be before or equal to dateTo",
        });
      }
    }
  });

export const bulkUploadTempDocumentSchema = z.object({
  draftId: z.string().min(1),
});

export const bulkUploadColumnMappingSchema = z.object({
  targetField: z.enum(BULK_UPLOAD_TARGET_FIELDS),
  sourceHeader: z.string().min(1),
  sourceColumnIndex: z.coerce.number().int().min(0),
  mappingSource: z.enum(["auto", "manual"]).default("manual"),
});

export const bulkUploadRowSchema = z.object({
  rowIndex: z.coerce.number().int().min(1),
  origin: z.string().trim().min(1),
  destination: z.string().trim().min(1),
  vessel: z.string().trim().min(1),
  quantity: z.coerce.number().positive(),
  sumInsured: z.coerce.number().positive(),
  etd: z.string().trim().min(1),
  eta: z.string().trim().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const bulkUploadCreateSchema = z
  .object({
    openCoverId: z.string().cuid(),
    clientRate: z.coerce.number().positive(),
    mappings: z.array(bulkUploadColumnMappingSchema),
    rows: z.array(bulkUploadRowSchema).min(1).max(10),
    tempDocumentIds: z.array(z.string().min(1)).optional().default([]),
  })
  .superRefine((value, ctx) => {
    const required = new Set(["origin", "destination", "vessel", "quantity", "sumInsured", "etd"]);
    const mapped = new Set(value.mappings.map((m) => m.targetField));
    required.forEach((target) => {
      if (!mapped.has(target as (typeof BULK_UPLOAD_TARGET_FIELDS)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mappings"],
          message: `Missing required mapping: ${target}`,
        });
      }
    });
  });

const ALLOWED_MIME_SET = new Set(DOCUMENT_ALLOWED_MIME_TYPES);
const ALLOWED_EXT_SET = new Set(DOCUMENT_ALLOWED_EXTENSIONS);

function getExtension(name: string) {
  const idx = name.lastIndexOf(".");
  if (idx < 0) {
    return "";
  }
  return name.slice(idx).toLowerCase();
}

export function validateDocumentFile(file: File) {
  const ext = getExtension(file.name);
  if (!ALLOWED_EXT_SET.has(ext as (typeof DOCUMENT_ALLOWED_EXTENSIONS)[number])) {
    return `Unsupported file extension: ${ext || "(none)"}`;
  }

  if (!ALLOWED_MIME_SET.has(file.type as (typeof DOCUMENT_ALLOWED_MIME_TYPES)[number])) {
    return `Unsupported file type: ${file.type || "(unknown)"}`;
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return `File exceeds max size of ${MAX_DOCUMENT_SIZE_BYTES} bytes`;
  }

  return null;
}
