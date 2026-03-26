"use client";

type OpenCoverOption = {
  id: string;
  reference: string;
  clientName: string;
  clientCompany: string;
  cargoProduct: string | null;
  insurerRate: string;
};

type UploadedTempDocument = {
  tempDocId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export function BulkUploadSetupStep({
  openCovers,
  selectedOpenCoverId,
  clientRate,
  xlsFileName,
  tempDocuments,
  busy,
  onOpenCoverChange,
  onClientRateChange,
  onXlsFileChange,
  onUploadSharedDocuments,
}: {
  openCovers: OpenCoverOption[];
  selectedOpenCoverId: string;
  clientRate: string;
  xlsFileName: string | null;
  tempDocuments: UploadedTempDocument[];
  busy: boolean;
  onOpenCoverChange: (openCoverId: string) => void;
  onClientRateChange: (rate: string) => void;
  onXlsFileChange: (file: File | null) => void;
  onUploadSharedDocuments: (files: File[]) => void;
}) {
  const selectedOpenCover = openCovers.find((item) => item.id === selectedOpenCoverId) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm">Open Cover</span>
          <select
            className="w-full rounded border px-2 py-1"
            value={selectedOpenCoverId}
            onChange={(event) => onOpenCoverChange(event.target.value)}
          >
            <option value="">Select active open cover</option>
            {openCovers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.reference} - {item.clientName}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm">Client Rate (%)</span>
          <input
            className="w-full rounded border px-2 py-1"
            type="number"
            step="0.000001"
            value={clientRate}
            onChange={(event) => onClientRateChange(event.target.value)}
          />
        </label>
      </div>

      {selectedOpenCover ? (
        <div className="rounded border bg-slate-50 p-3 text-sm">
          <p><strong>Reference:</strong> {selectedOpenCover.reference}</p>
          <p><strong>Client:</strong> {selectedOpenCover.clientName}</p>
          <p><strong>Cargo Product:</strong> {selectedOpenCover.cargoProduct ?? "-"}</p>
          <p><strong>Insurer Rate:</strong> {selectedOpenCover.insurerRate}%</p>
        </div>
      ) : null}

      <label className="block space-y-1">
        <span className="text-sm">Shipment XLS file</span>
        <input
          className="w-full rounded border px-2 py-1"
          type="file"
          accept=".xls,.xlsx"
          onChange={(event) => onXlsFileChange(event.target.files?.[0] ?? null)}
        />
        {xlsFileName ? <span className="text-xs text-slate-600">Loaded: {xlsFileName}</span> : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm">Shared shipping documents (optional)</span>
        <input
          className="w-full rounded border px-2 py-1"
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
          disabled={busy}
          onChange={(event) => onUploadSharedDocuments(Array.from(event.target.files ?? []))}
        />
      </label>

      {tempDocuments.length > 0 ? (
        <div className="rounded border p-3 text-sm">
          <p className="font-medium">Uploaded shared documents</p>
          <ul className="mt-2 space-y-1">
            {tempDocuments.map((item) => (
              <li key={item.tempDocId}>
                {item.fileName} ({Math.round(item.fileSize / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

