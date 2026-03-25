import React from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";

import type { CaseSummary, OpenCoverDetail as OpenCoverDetailType } from "@/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function OpenCoverDetail({
  agreement,
  declarations,
}: {
  agreement: OpenCoverDetailType;
  declarations: CaseSummary[];
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title={`Open Cover ${agreement.reference}`}
        description={`${agreement.clientName} (${agreement.clientCompany})`}
      />

      <section className="grid gap-3 rounded border bg-white p-4 text-sm md:grid-cols-2">
        <p>
          <span className="font-medium">Insurer:</span> {agreement.insurerName}
        </p>
        <p>
          <span className="font-medium">Cargo Product:</span> {agreement.cargoProduct ?? "-"}
        </p>
        <p>
          <span className="font-medium">Transport Mode:</span> {agreement.transportMode ?? "-"}
        </p>
        <p>
          <span className="font-medium">Currency:</span> {agreement.currency}
        </p>
        <p>
          <span className="font-medium">Insurer Rate:</span> {agreement.insurerRate}%
        </p>
        <p>
          <span className="font-medium">Status:</span> <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{agreement.status}</span>
        </p>
        <p>
          <span className="font-medium">Effective Period:</span> {formatDate(agreement.effectiveFrom)} - {formatDate(agreement.effectiveTo)}
        </p>
        <p>
          <span className="font-medium">Declaration Count:</span> {agreement.declarationCount}
        </p>
        <p className="md:col-span-2">
          <span className="font-medium">Notes:</span> {agreement.notes ?? "-"}
        </p>
      </section>

      <section className="space-y-3 rounded border bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Declarations</h3>
          <Link className="text-sm text-sky-700" href={`/open-covers/${agreement.id}/edit`}>
            Edit agreement
          </Link>
        </div>

        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">Case Number</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Client</th>
              <th className="px-2 py-2">Client Rate</th>
              <th className="px-2 py-2">Insurer Rate</th>
              <th className="px-2 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {declarations.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-2 py-2 font-medium">{item.caseNumber}</td>
                <td className="px-2 py-2">{item.status}</td>
                <td className="px-2 py-2">{item.clientName}</td>
                <td className="px-2 py-2">{item.clientRate}%</td>
                <td className="px-2 py-2">{item.insurerRate}%</td>
                <td className="px-2 py-2">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
            {declarations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-5 text-center text-slate-500">
                  No declarations matched the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

