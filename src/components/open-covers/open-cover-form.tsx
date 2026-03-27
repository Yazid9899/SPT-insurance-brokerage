"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { CARGO_SUB_PRODUCTS, CURRENCIES, TRANSPORT_MODES } from "@/lib/constants";
import type { PartyOption } from "@/types";

const formSchema = z.object({
  reference: z.string().min(1),
  clientName: z.string().min(1),
  clientCompany: z.string().min(1),
  insurerName: z.string().min(1),
  insurerId: z.string().optional().nullable(),
  clientIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  productLine: z.literal("CARGO"),
  cargoProduct: z.enum(CARGO_SUB_PRODUCTS),
  transportMode: z.enum(TRANSPORT_MODES),
  currency: z.enum(CURRENCIES),
  insurerRate: z.coerce.number().min(0).max(100),
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().min(1),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function OpenCoverForm({
  mode,
  openCoverId,
  defaultValues,
  clients,
  insurers,
}: {
  mode: "create" | "edit";
  openCoverId?: string;
  defaultValues?: Partial<FormValues>;
  clients: PartyOption[];
  insurers: PartyOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      reference: defaultValues?.reference ?? "",
      clientName: defaultValues?.clientName ?? "",
      clientCompany: defaultValues?.clientCompany ?? "",
      insurerName: defaultValues?.insurerName ?? "",
      insurerId: defaultValues?.insurerId ?? null,
      clientIds: defaultValues?.clientIds ?? [],
      isActive: defaultValues?.isActive ?? true,
      productLine: "CARGO",
      cargoProduct: defaultValues?.cargoProduct ?? "CPO",
      transportMode: defaultValues?.transportMode ?? "MARINE",
      currency: defaultValues?.currency ?? "USD",
      insurerRate: defaultValues?.insurerRate ?? 0,
      effectiveFrom: defaultValues?.effectiveFrom ?? "",
      effectiveTo: defaultValues?.effectiveTo ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    setError(null);

    if (values.isActive && values.clientIds.length === 0) {
      setError("Active open cover requires at least one linked client");
      setSaving(false);
      return;
    }

    const selectedInsurer = insurers.find((item) => item.id === values.insurerId);
    const selectedClient = clients.find((item) => values.clientIds.includes(item.id));

    const payload = {
      ...values,
      productLine: "CARGO",
      insurerName: selectedInsurer?.displayName ?? values.insurerName,
      clientName: selectedClient?.displayName ?? values.clientName,
      clientCompany: selectedClient?.company ?? values.clientCompany,
      insurerRate: Number(values.insurerRate),
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo,
      notes: values.notes || null,
    };

    const url = mode === "create" ? "/api/open-covers" : `/api/open-covers/${openCoverId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to save open cover");
      setSaving(false);
      return;
    }

    const body = (await response.json()) as { id: string };
    router.push(`/open-covers/${body.id}`);
    router.refresh();
  });

  return (
    <form className="space-y-4 rounded border bg-white p-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm">Reference</span>
          <input className="w-full rounded border px-2 py-1" {...form.register("reference")} />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Insurer</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("insurerId")}>
            <option value="">Select insurer</option>
            {insurers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm">Linked Clients</span>
          <select className="h-32 w-full rounded border px-2 py-1" multiple {...form.register("clientIds")}>
            {clients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName} {item.company ? `(${item.company})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm">Cargo Product</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("cargoProduct")}>
            {CARGO_SUB_PRODUCTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm">Transport Mode</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("transportMode")}>
            {TRANSPORT_MODES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm">Currency</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("currency")}>
            {CURRENCIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm">Insurer Rate (%)</span>
          <input className="w-full rounded border px-2 py-1" type="number" step="0.000001" {...form.register("insurerRate", { valueAsNumber: true })} />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Effective From</span>
          <input className="w-full rounded border px-2 py-1" type="date" {...form.register("effectiveFrom")} />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Effective To</span>
          <input className="w-full rounded border px-2 py-1" type="date" {...form.register("effectiveTo")} />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Active</span>
          <input type="checkbox" className="h-4 w-4" {...form.register("isActive")} />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm">Notes</span>
        <textarea className="w-full rounded border px-2 py-1" rows={3} {...form.register("notes")} />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : mode === "create" ? "Create Open Cover" : "Save Changes"}
      </button>
    </form>
  );
}
