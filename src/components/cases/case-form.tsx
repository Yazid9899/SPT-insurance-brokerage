"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { CARGO_SUB_PRODUCTS, COVER_TYPES, CURRENCIES, PRODUCT_LINES, TRANSPORT_MODES } from "@/lib/constants";
import { calculatePremiums } from "@/lib/calculations";
import { caseUpsertSchema } from "@/lib/validations";

const formSchema = caseUpsertSchema.extend({
  sumInsured: z.number(),
  clientRate: z.number(),
  insurerRate: z.number(),
});

type OpenCoverOption = {
  id: string;
  reference: string;
  clientName: string;
  clientCompany: string;
  insurerRate: string;
  currency: string;
};

type FormValues = z.infer<typeof formSchema>;

export function CaseForm() {
  const router = useRouter();
  const [openCoverOptions, setOpenCoverOptions] = useState<OpenCoverOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productLine: "CARGO",
      cargoProduct: "CPO",
      coverType: "SINGLE_SHIPMENT",
      transportMode: "MARINE",
      openCoverId: null,
      clientName: "",
      clientCompany: "",
      currency: "USD",
      sumInsured: 0,
      clientRate: 0,
      insurerRate: 0,
      notes: "",
    },
  });

  const coverType = form.watch("coverType");
  const selectedOpenCoverId = form.watch("openCoverId");
  const sumInsured = form.watch("sumInsured");
  const clientRate = form.watch("clientRate");
  const insurerRate = form.watch("insurerRate");

  const selectedOpenCover = useMemo(
    () => openCoverOptions.find((item) => item.id === selectedOpenCoverId) ?? null,
    [openCoverOptions, selectedOpenCoverId],
  );

  const premiums = useMemo(() => {
    if (!sumInsured || sumInsured <= 0) {
      return { clientPremium: "0.00", insurerPremium: "0.00", brokerCommission: "0.00" };
    }

    return calculatePremiums({ sumInsured, clientRate: clientRate ?? 0, insurerRate: insurerRate ?? 0 });
  }, [clientRate, insurerRate, sumInsured]);

  useEffect(() => {
  if (coverType !== "OPEN_COVER") {
      return;
    }

    void fetch("/api/open-covers?activeOnly=true&pageSize=200")
      .then(async (response) => {
        const body = (await response.json()) as { items?: OpenCoverOption[] };
        setOpenCoverOptions(body.items ?? []);
      })
      .catch(() => setOpenCoverOptions([]));
  }, [coverType]);

  useEffect(() => {
    if (coverType !== "OPEN_COVER" || !selectedOpenCover) {
      return;
    }

    form.setValue("clientName", selectedOpenCover.clientName);
    form.setValue("clientCompany", selectedOpenCover.clientCompany);
    form.setValue("insurerRate", Number(selectedOpenCover.insurerRate));
    form.setValue("currency", selectedOpenCover.currency as FormValues["currency"]);
  }, [coverType, form, selectedOpenCover]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    setError(null);

    const response = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to create case");
      setSaving(false);
      return;
    }

    router.push("/cases");
    router.refresh();
  });

  return (
    <form className="space-y-4 rounded border bg-white p-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm">Product Line</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("productLine")}>
            {PRODUCT_LINES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm">Cover Type</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("coverType")}>
            {COVER_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {coverType === "OPEN_COVER" ? (
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm">Open Cover Agreement</span>
            <select className="w-full rounded border px-2 py-1" {...form.register("openCoverId")}>
              <option value="">Select active open cover</option>
              {openCoverOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.reference} - {item.clientName}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
          <span className="text-sm">Client Name</span>
          <input className="w-full rounded border px-2 py-1" {...form.register("clientName")} />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Company</span>
          <input className="w-full rounded border px-2 py-1" {...form.register("clientCompany")} />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Currency</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("currency")} disabled={coverType === "OPEN_COVER"}>
            {CURRENCIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm">Sum Insured</span>
          <input type="number" step="0.01" className="w-full rounded border px-2 py-1" {...form.register("sumInsured", { valueAsNumber: true })} />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Rate (%)</span>
          <input type="number" step="0.000001" className="w-full rounded border px-2 py-1" {...form.register("clientRate", { valueAsNumber: true })} />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Insurer Rate (%)</span>
          <input
            type="number"
            step="0.000001"
            className="w-full rounded border px-2 py-1"
            {...form.register("insurerRate", { valueAsNumber: true })}
            readOnly={coverType === "OPEN_COVER"}
          />
        </label>
      </div>

      <div className="grid gap-2 rounded border bg-slate-50 p-3 text-sm md:grid-cols-3">
        <p>
          <span className="font-medium">Client Premium:</span> {premiums.clientPremium}
        </p>
        <p>
          <span className="font-medium">Insurer Premium:</span> {premiums.insurerPremium}
        </p>
        <p>
          <span className="font-medium">Broker Commission:</span> {premiums.brokerCommission}
        </p>
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
        {saving ? "Saving..." : "Create Case"}
      </button>
    </form>
  );
}
