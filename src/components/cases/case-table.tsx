"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";

export type CaseListRow = {
  id: string;
  caseNumber: string;
  clientName: string;
  productLine: string;
  cargoProduct: string | null;
  coverType: string | null;
  status: "DRAFT" | "DOCUMENTATION" | "UNDERWRITING" | "ACTIVE" | "BILLING" | "SETTLING" | "CLOSED";
  sumInsured: string;
  brokerCommission: string;
  createdAt: string;
};

export function CaseTable({ rows }: { rows: CaseListRow[] }) {
  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-3 py-2">Case #</th>
            <th className="px-3 py-2">Client</th>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Cargo Product</th>
            <th className="px-3 py-2">Cover Type</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Sum Insured</th>
            <th className="px-3 py-2">Broker Commission</th>
            <th className="px-3 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id} className="border-b hover:bg-slate-50">
              <td className="px-3 py-2 font-medium">
                <Link href={`/cases/${item.id}`} className="hover:underline">
                  {item.caseNumber}
                </Link>
              </td>
              <td className="px-3 py-2">{item.clientName}</td>
              <td className="px-3 py-2">{item.productLine}</td>
              <td className="px-3 py-2">{item.cargoProduct ?? "-"}</td>
              <td className="px-3 py-2">{item.coverType ?? "-"}</td>
              <td className="px-3 py-2">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-3 py-2">{item.sumInsured}</td>
              <td className="px-3 py-2">{item.brokerCommission}</td>
              <td className="px-3 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                No cases found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
