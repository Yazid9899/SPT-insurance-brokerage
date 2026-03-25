import { z } from "zod";

import { CARGO_SUB_PRODUCTS, CASE_LIFECYCLE, COVER_TYPES, CURRENCIES, PRODUCT_LINES, TRANSPORT_MODES } from "@/lib/constants";

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

export const caseUpsertSchema = z.object({
  productLine: z.enum(PRODUCT_LINES),
  cargoProduct: z.enum(CARGO_SUB_PRODUCTS).optional().nullable(),
  coverType: z.enum(COVER_TYPES).optional().nullable(),
  transportMode: z.enum(TRANSPORT_MODES).optional().nullable(),
  openCoverId: z.string().cuid().optional().nullable(),
  clientName: z.string().min(1),
  clientCompany: z.string().optional().nullable(),
  currency: z.enum(CURRENCIES),
  sumInsured: positiveAmount,
  clientRate: decimalRate,
  insurerRate: decimalRate,
  notes: z.string().max(2000).optional().nullable(),
});

export const caseStatusTransitionSchema = z.object({
  toStatus: z.enum(CASE_LIFECYCLE),
  note: z.string().max(1000).optional().nullable(),
});

export const caseListFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  status: z.enum(CASE_LIFECYCLE).optional(),
  productLine: z.enum(PRODUCT_LINES).optional(),
  coverType: z.enum(COVER_TYPES).optional(),
  openCoverId: z.string().cuid().optional(),
});

export const openCoverListFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "ALL"]).optional(),
  activeOnly: z.enum(["true", "false"]).optional(),
});
