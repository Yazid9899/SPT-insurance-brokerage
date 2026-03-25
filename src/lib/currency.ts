import Decimal from "decimal.js";

export function toDecimal(value: string | number): Decimal {
  return new Decimal(value);
}

export function decimalToString(value: Decimal | null | undefined): string {
  return value ? value.toString() : "0";
}

export function formatCurrency(amount: string | number, currency = "USD"): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numeric);
}
