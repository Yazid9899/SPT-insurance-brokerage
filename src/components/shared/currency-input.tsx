"use client";

import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/currency";

export function CurrencyInput({
  currency = "USD",
  value,
  onChange,
}: {
  currency?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = useState(value ?? "");

  useEffect(() => {
    setInternalValue(value ?? "");
  }, [value]);

  const numericValue = Number(internalValue || 0);

  return (
    <div className="space-y-1">
      <input
        className="w-full rounded border px-3 py-2"
        inputMode="decimal"
        value={internalValue}
        onChange={(event) => {
          const next = event.target.value.replace(/[^0-9.]/g, "");
          setInternalValue(next);
          onChange?.(next);
        }}
      />
      <p className="text-xs text-slate-500">{formatCurrency(numericValue, currency)}</p>
    </div>
  );
}
