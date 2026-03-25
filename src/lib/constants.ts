export const APP_NAME = "CargoShield";

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "cases", label: "Cases", href: "/cases" },
  { key: "open-covers", label: "Open Covers", href: "/open-covers" },
  { key: "settlements", label: "Settlements", href: "/settlements" },
  { key: "reports", label: "Reports", href: "/reports" },
  { key: "email-templates", label: "Email Templates", href: "/email-templates" },
] as const;

export const PRODUCT_LINES = ["CARGO", "PROPERTY", "MARINE_HULL", "UTILITY"] as const;
export const CARGO_SUB_PRODUCTS = ["CPO", "BIODIESEL", "SHORTENING"] as const;
export const COVER_TYPES = ["OPEN_COVER", "SINGLE_SHIPMENT"] as const;
export const TRANSPORT_MODES = ["MARINE", "TRUCKING"] as const;
export const CURRENCIES = ["IDR", "USD", "SGD", "MYR"] as const;

export const CASE_LIFECYCLE = [
  "DRAFT",
  "DOCUMENTATION",
  "UNDERWRITING",
  "ACTIVE",
  "BILLING",
  "SETTLING",
  "CLOSED",
] as const;

export type CaseLifecycleStatus = (typeof CASE_LIFECYCLE)[number];
export type OpenCoverStatus = "ACTIVE" | "EXPIRED";

export const STATUS_COLOR_MAP: Record<CaseLifecycleStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  DOCUMENTATION: "bg-sky-100 text-sky-700",
  UNDERWRITING: "bg-indigo-100 text-indigo-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  BILLING: "bg-amber-100 text-amber-700",
  SETTLING: "bg-orange-100 text-orange-700",
  CLOSED: "bg-zinc-200 text-zinc-700",
};

export const OPEN_COVER_STATUS_COLORS: Record<OpenCoverStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};
