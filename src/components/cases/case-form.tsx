"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { calculatePremiums } from "@/lib/calculations";
import { CARGO_SUB_PRODUCTS, CURRENCIES, COVER_TYPES, PRODUCT_LINES, TRANSPORT_MODES } from "@/lib/constants";
import { caseUpsertSchema } from "@/lib/validations";
import type { PartyOption } from "@/types";

type OpenCoverOption = {
  id: string;
  reference: string;
  insurerRate: string;
  currency: string;
  insurerId: string | null;
  linkedClients: PartyOption[];
};

const formSchema = caseUpsertSchema;

type FormInput = z.input<typeof caseUpsertSchema>;
type FormValues = z.output<typeof caseUpsertSchema>;

const defaultValues: FormValues = {
  productLine: "CARGO",
  cargoProduct: "CPO",
  coverType: "SINGLE_SHIPMENT",
  transportMode: "MARINE",
  openCoverId: null,
  clientId: null,
  insurerId: null,
  clientName: "",
  clientEmail: null,
  clientPhone: null,
  clientCompany: "",
  currency: "USD",
  sumInsured: 0,
  clientRate: 0,
  insurerRate: 0,
  origin: null,
  destination: null,
  vessel: null,
  quantity: null,
  etd: null,
  eta: null,
  notes: null,
};

export function CaseForm({
  mode = "create",
  caseId,
  initialValues,
  clients = [],
  insurers = [],
  openCovers = [],
}: {
  mode?: "create" | "edit";
  caseId?: string;
  initialValues?: Partial<FormInput>;
  clients?: PartyOption[];
  insurers?: PartyOption[];
  openCovers?: OpenCoverOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  const productLine = form.watch("productLine");
  const coverType = form.watch("coverType");
  const selectedOpenCoverId = form.watch("openCoverId");
  const selectedClientId = form.watch("clientId");
  const sumInsured = Number(form.watch("sumInsured") ?? 0);
  const clientRate = Number(form.watch("clientRate") ?? 0);
  const insurerRate = Number(form.watch("insurerRate") ?? 0);

  const selectedOpenCover = useMemo(() => openCovers.find((item) => item.id === selectedOpenCoverId) ?? null, [openCovers, selectedOpenCoverId]);
  const availableClients = useMemo(() => {
    if (coverType === "OPEN_COVER") {
      return selectedOpenCover?.linkedClients ?? [];
    }
    return clients;
  }, [clients, coverType, selectedOpenCover]);

  const selectedClient = useMemo(() => availableClients.find((item) => item.id === selectedClientId) ?? null, [availableClients, selectedClientId]);

  const premiums = useMemo(() => {
    if (!sumInsured || sumInsured <= 0) {
      return { clientPremium: "0.00", insurerPremium: "0.00", brokerCommission: "0.00" };
    }

    return calculatePremiums({ sumInsured, clientRate: clientRate ?? 0, insurerRate: insurerRate ?? 0 });
  }, [clientRate, insurerRate, sumInsured]);

  useEffect(() => {
    if (coverType !== "OPEN_COVER" || !selectedOpenCover) {
      return;
    }

    form.setValue("insurerId", selectedOpenCover.insurerId ?? null);
    form.setValue("insurerRate", Number(selectedOpenCover.insurerRate));
    form.setValue("currency", selectedOpenCover.currency as FormValues["currency"]);
  }, [coverType, form, selectedOpenCover]);

  useEffect(() => {
    if (!selectedClient) {
      return;
    }

    form.setValue("clientName", selectedClient.displayName);
    form.setValue("clientCompany", selectedClient.company ?? null);
    form.setValue("clientEmail", selectedClient.email ?? null);
    form.setValue("clientPhone", selectedClient.phone ?? null);
  }, [selectedClient, form]);

  useEffect(() => {
    if (productLine !== "CARGO") {
      form.setValue("cargoProduct", null);
      form.setValue("coverType", null);
      form.setValue("transportMode", null);
      form.setValue("openCoverId", null);
      form.setValue("origin", null);
      form.setValue("destination", null);
      form.setValue("vessel", null);
      form.setValue("quantity", null);
      form.setValue("etd", null);
      form.setValue("eta", null);
    } else {
      if (!form.getValues("cargoProduct")) {
        form.setValue("cargoProduct", "CPO");
      }
      if (!form.getValues("coverType")) {
        form.setValue("coverType", "SINGLE_SHIPMENT");
      }
      if (!form.getValues("transportMode")) {
        form.setValue("transportMode", "MARINE");
      }
    }
  }, [form, productLine]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    setError(null);

    const payload = {
      ...values,
      etd: values.etd ? new Date(values.etd).toISOString() : null,
      eta: values.eta ? new Date(values.eta).toISOString() : null,
    };

    const url = mode === "edit" && caseId ? `/api/cases/${caseId}` : "/api/cases";
    const method = mode === "edit" ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to save case");
      setSaving(false);
      return;
    }

    if (mode === "edit" && caseId) {
      router.push(`/cases/${caseId}`);
    } else {
      router.push("/cases");
    }
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

        {productLine === "CARGO" ? (
          <>
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

            {coverType === "OPEN_COVER" ? (
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm">Open Cover Agreement</span>
                <select className="w-full rounded border px-2 py-1" {...form.register("openCoverId")}>
                  <option value="">Select active open cover</option>
                  {openCovers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.reference}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </>
        ) : null}

        <label className="space-y-1">
          <span className="text-sm">Client</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("clientId")}>
            <option value="">Select client</option>
            {availableClients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName} {item.company ? `(${item.company})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm">Insurer</span>
          <select className="w-full rounded border px-2 py-1" {...form.register("insurerId")} disabled={coverType === "OPEN_COVER"}>
            <option value="">Select insurer</option>
            {insurers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Name Snapshot</span>
          <input className="w-full rounded border px-2 py-1" {...form.register("clientName")} readOnly />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Company Snapshot</span>
          <input className="w-full rounded border px-2 py-1" {...form.register("clientCompany")} readOnly />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Email Snapshot</span>
          <input className="w-full rounded border px-2 py-1" type="email" {...form.register("clientEmail")} readOnly />
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Phone Snapshot</span>
          <input className="w-full rounded border px-2 py-1" {...form.register("clientPhone")} readOnly />
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

        {productLine === "CARGO" ? (
          <>
            <label className="space-y-1">
              <span className="text-sm">Origin</span>
              <input className="w-full rounded border px-2 py-1" {...form.register("origin")} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Destination</span>
              <input className="w-full rounded border px-2 py-1" {...form.register("destination")} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Vessel/Fleet ID</span>
              <input className="w-full rounded border px-2 py-1" {...form.register("vessel")} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Quantity (MT)</span>
              <input type="number" step="0.01" className="w-full rounded border px-2 py-1" {...form.register("quantity", { valueAsNumber: true })} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">ETD</span>
              <input type="date" className="w-full rounded border px-2 py-1" onChange={(e) => form.setValue("etd", e.target.value ? new Date(e.target.value) : null)} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">ETA</span>
              <input type="date" className="w-full rounded border px-2 py-1" onChange={(e) => form.setValue("eta", e.target.value ? new Date(e.target.value) : null)} />
            </label>
          </>
        ) : null}
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
        {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Case"}
      </button>
    </form>
  );
}
