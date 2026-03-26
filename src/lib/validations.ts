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
  PRODUCT_LINES,
  TRANSPORT_MODES,
} from "@/lib/constants";

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
    productLine: z.literal("CARGO"),
    cargoProduct: z.enum(CARGO_SUB_PRODUCTS),
    transportMode: z.enum(TRANSPORT_MODES),
    currency: z.enum(CURRENCIES),
    insurerRate: decimalRate,
    effectiveFrom: z.coerce.date(),
    effectiveTo: z.coerce.date(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.effectiveFrom > value.effectiveTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveFrom"],
        message: "effectiveFrom must be before or equal to effectiveTo",
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

    if (value.coverType === "OPEN_COVER" && !value.openCoverId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["openCoverId"], message: "openCoverId is required for OPEN_COVER" });
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
