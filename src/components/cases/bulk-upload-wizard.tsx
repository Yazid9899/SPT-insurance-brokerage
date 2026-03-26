"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BulkUploadConfirmStep } from "@/components/cases/bulk-upload-confirm-step";
import { BulkUploadReviewStep } from "@/components/cases/bulk-upload-review-step";
import { BulkUploadSetupStep } from "@/components/cases/bulk-upload-setup-step";
import {
  BULK_UPLOAD_REQUIRED_FIELDS,
  autoMapHeaders,
  coerceDate,
  coerceNumber,
  coerceString,
  parseXlsBuffer,
  validateBatchSize,
  validateShipmentRow,
  type BulkUploadTargetField,
} from "@/lib/bulk-upload";
import { applyManualMappings } from "@/lib/bulk-upload/mapping";
import type { BulkUploadColumnMapping, BulkUploadRowDraft } from "@/types";

type WizardStep = 1 | 2 | 3;

type OpenCoverOption = {
  id: string;
  reference: string;
  clientName: string;
  clientCompany: string;
  cargoProduct: string | null;
  insurerRate: string;
};

type TempDocumentItem = {
  tempDocId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

type RawRow = Record<string, string | number | Date | null>;

type PersistedWizardState = {
  selectedOpenCoverId: string;
  clientRate: string;
  xlsFileName: string | null;
  headers: string[];
  rawRows: RawRow[];
  mappings: BulkUploadColumnMapping[];
  rows: BulkUploadRowDraft[];
  tempDocuments: TempDocumentItem[];
  step: WizardStep;
};

function generateDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft_${Date.now()}`;
}

function getMappedValue(row: RawRow, mappings: BulkUploadColumnMapping[], targetField: BulkUploadTargetField) {
  const mapping = mappings.find((m) => m.targetField === targetField);
  if (!mapping) {
    return null;
  }
  return row[mapping.sourceHeader] ?? null;
}

function toDraftRows(rawRows: RawRow[], mappings: BulkUploadColumnMapping[], clientRate: number, insurerRate: number): BulkUploadRowDraft[] {
  return rawRows.map((row, idx) => {
    const validated = validateShipmentRow(
      {
        rowIndex: idx + 1,
        origin: coerceString(getMappedValue(row, mappings, "origin")),
        destination: coerceString(getMappedValue(row, mappings, "destination")),
        vessel: coerceString(getMappedValue(row, mappings, "vessel")),
        quantity: coerceNumber(getMappedValue(row, mappings, "quantity")),
        sumInsured: coerceNumber(getMappedValue(row, mappings, "sumInsured")),
        etd: coerceDate(getMappedValue(row, mappings, "etd")),
        eta: coerceDate(getMappedValue(row, mappings, "eta")),
        notes: coerceString(getMappedValue(row, mappings, "notes")),
      },
      { clientRate, insurerRate },
    );

    return {
      ...validated,
      eta: validated.eta ?? null,
      notes: validated.notes ?? null,
    };
  });
}

export function BulkUploadWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftId] = useState(() => generateDraftId());
  const [openCovers, setOpenCovers] = useState<OpenCoverOption[]>([]);
  const [selectedOpenCoverId, setSelectedOpenCoverId] = useState("");
  const [clientRate, setClientRate] = useState("");
  const [xlsFileName, setXlsFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [mappings, setMappings] = useState<BulkUploadColumnMapping[]>([]);
  const [rows, setRows] = useState<BulkUploadRowDraft[]>([]);
  const [tempDocuments, setTempDocuments] = useState<TempDocumentItem[]>([]);

  const selectedOpenCover = useMemo(
    () => openCovers.find((item) => item.id === selectedOpenCoverId) ?? null,
    [openCovers, selectedOpenCoverId],
  );
  const insurerRate = Number(selectedOpenCover?.insurerRate ?? 0);
  const clientRateNumber = Number(clientRate || 0);

  useEffect(() => {
    void fetch("/api/open-covers?activeOnly=true&pageSize=100")
      .then(async (response) => {
        const payload = (await response.json()) as { items?: OpenCoverOption[] };
        setOpenCovers(payload.items ?? []);
      })
      .catch(() => setOpenCovers([]));
  }, []);

  useEffect(() => {
    const key = `bulk-upload:${draftId}`;
    const value: PersistedWizardState = {
      selectedOpenCoverId,
      clientRate,
      xlsFileName,
      headers,
      rawRows,
      mappings,
      rows,
      tempDocuments,
      step,
    };
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [clientRate, draftId, headers, mappings, rawRows, rows, selectedOpenCoverId, step, tempDocuments, xlsFileName]);

  useEffect(() => {
    const key = `bulk-upload:${draftId}`;
    const saved = sessionStorage.getItem(key);
    if (!saved) {
      return;
    }
    try {
      const parsed = JSON.parse(saved) as PersistedWizardState;
      setSelectedOpenCoverId(parsed.selectedOpenCoverId ?? "");
      setClientRate(parsed.clientRate ?? "");
      setXlsFileName(parsed.xlsFileName ?? null);
      setHeaders(parsed.headers ?? []);
      setRawRows(parsed.rawRows ?? []);
      setMappings(parsed.mappings ?? []);
      setRows(parsed.rows ?? []);
      setTempDocuments(parsed.tempDocuments ?? []);
      setStep(parsed.step ?? 1);
    } catch {
      // noop
    }
  }, [draftId]);

  const unresolvedRequiredFields = useMemo(
    () => BULK_UPLOAD_REQUIRED_FIELDS.filter((field) => !mappings.some((mapping) => mapping.targetField === field)),
    [mappings],
  );

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        sumInsured: (Number(acc.sumInsured) + Number(row.sumInsured ?? 0)).toFixed(2),
        clientPremium: (Number(acc.clientPremium) + Number(row.clientPremium)).toFixed(2),
        insurerPremium: (Number(acc.insurerPremium) + Number(row.insurerPremium)).toFixed(2),
        brokerCommission: (Number(acc.brokerCommission) + Number(row.brokerCommission)).toFixed(2),
      }),
      {
        sumInsured: "0.00",
        clientPremium: "0.00",
        insurerPremium: "0.00",
        brokerCommission: "0.00",
      },
    );
  }, [rows]);

  async function handleXlsFileChange(file: File | null) {
    setError(null);
    if (!file) {
      setXlsFileName(null);
      setHeaders([]);
      setRawRows([]);
      setRows([]);
      setMappings([]);
      return;
    }
    const parsed = parseXlsBuffer(await file.arrayBuffer());
    setXlsFileName(file.name);
    setHeaders(parsed.headers);
    setRawRows(parsed.rows);

    const auto = autoMapHeaders(parsed.headers);
    setMappings(auto.mappings);
    const recomputed = toDraftRows(parsed.rows, auto.mappings, clientRateNumber, insurerRate);
    setRows(recomputed);
  }

  function handleMappingChange(targetField: BulkUploadTargetField, header: string) {
    const index = headers.findIndex((h) => h === header);
    const nextMappings = applyManualMappings(mappings, {
      [targetField]: header ? { header, index } : undefined,
    });
    setMappings(nextMappings);
    setRows(toDraftRows(rawRows, nextMappings, clientRateNumber, insurerRate));
  }

  function handleRowCellChange(
    rowIndex: number,
    field: "origin" | "destination" | "vessel" | "quantity" | "sumInsured" | "etd" | "eta" | "notes",
    value: string,
  ) {
    const nextRows = rows.map((row) => {
      if (row.rowIndex !== rowIndex) {
        return row;
      }
      const candidate = {
        ...row,
        [field]: field === "quantity" || field === "sumInsured" ? (value ? Number(value) : null) : value || null,
      };
      const validated = validateShipmentRow(candidate, { clientRate: clientRateNumber, insurerRate });
      return { ...validated, eta: validated.eta ?? null, notes: validated.notes ?? null };
    });
    setRows(nextRows);
  }

  async function handleUploadSharedDocuments(files: File[]) {
    if (files.length === 0) {
      return;
    }
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.append("draftId", draftId);
    files.forEach((file) => formData.append("files", file));
    const response = await fetch("/api/cases/bulk-upload/temp-documents", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to upload shared documents");
      setBusy(false);
      return;
    }
    const body = (await response.json()) as { items: TempDocumentItem[] };
    setTempDocuments((prev) => [...prev, ...body.items]);
    setBusy(false);
  }

  function goToReview() {
    setError(null);
    if (!selectedOpenCover) {
      setError("Select an open cover first");
      return;
    }
    if (clientRateNumber <= 0) {
      setError("Client rate must be greater than 0");
      return;
    }
    const sizeError = validateBatchSize(rows);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    if (!xlsFileName) {
      setError("Upload an XLS file before continuing");
      return;
    }
    setRows(toDraftRows(rawRows, mappings, clientRateNumber, insurerRate));
    setStep(2);
  }

  function goToConfirm() {
    setError(null);
    if (unresolvedRequiredFields.length > 0) {
      setError("Resolve required mappings first");
      return;
    }
    if (rows.some((row) => row.errors.length > 0)) {
      setError("Fix row validation errors before continuing");
      return;
    }
    setStep(3);
  }

  async function submitBatch() {
    if (!selectedOpenCover) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch("/api/cases/bulk-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openCoverId: selectedOpenCover.id,
        clientRate: clientRateNumber,
        mappings,
        rows: rows.map((row) => ({
          rowIndex: row.rowIndex,
          origin: row.origin,
          destination: row.destination,
          vessel: row.vessel,
          quantity: row.quantity,
          sumInsured: row.sumInsured,
          etd: row.etd,
          eta: row.eta,
          notes: row.notes,
        })),
        tempDocumentIds: tempDocuments.map((d) => d.tempDocId),
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to create bulk draft cases");
      setBusy(false);
      return;
    }

    const body = (await response.json()) as { redirectTo?: string; bulkUploadId: string };
    setBusy(false);
    router.push(body.redirectTo ?? `/cases?bulkUploadId=${encodeURIComponent(body.bulkUploadId)}`);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded border bg-white p-4">
      <div className="flex items-center gap-2 text-sm">
        <span className={step === 1 ? "font-semibold" : "text-slate-500"}>1. Setup</span>
        <span>/</span>
        <span className={step === 2 ? "font-semibold" : "text-slate-500"}>2. Review</span>
        <span>/</span>
        <span className={step === 3 ? "font-semibold" : "text-slate-500"}>3. Confirm</span>
      </div>

      {step === 1 ? (
        <BulkUploadSetupStep
          openCovers={openCovers}
          selectedOpenCoverId={selectedOpenCoverId}
          clientRate={clientRate}
          xlsFileName={xlsFileName}
          tempDocuments={tempDocuments}
          busy={busy}
          onOpenCoverChange={setSelectedOpenCoverId}
          onClientRateChange={(value) => {
            setClientRate(value);
            if (rawRows.length > 0 && mappings.length > 0) {
              setRows(toDraftRows(rawRows, mappings, Number(value || 0), insurerRate));
            }
          }}
          onXlsFileChange={(file) => void handleXlsFileChange(file)}
          onUploadSharedDocuments={(files) => void handleUploadSharedDocuments(files)}
        />
      ) : null}

      {step === 2 ? (
        <BulkUploadReviewStep
          headers={headers}
          mappings={mappings}
          unresolvedRequiredFields={unresolvedRequiredFields}
          rows={rows}
          totals={totals}
          onMappingChange={handleMappingChange}
          onRowCellChange={handleRowCellChange}
        />
      ) : null}

      {step === 3 ? (
        <BulkUploadConfirmStep openCoverReference={selectedOpenCover?.reference ?? "-"} caseCount={rows.length} totals={totals} />
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm"
          disabled={busy || step === 1}
          onClick={() => setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as WizardStep)))}
        >
          Back
        </button>
        {step === 1 ? (
          <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" disabled={busy} onClick={goToReview}>
            Continue to Review
          </button>
        ) : null}
        {step === 2 ? (
          <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" disabled={busy} onClick={goToConfirm}>
            Continue to Confirm
          </button>
        ) : null}
        {step === 3 ? (
          <button type="button" className="rounded bg-slate-900 px-3 py-1 text-sm text-white" disabled={busy} onClick={() => void submitBatch()}>
            {busy ? "Creating..." : "Confirm & Create Draft Cases"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

