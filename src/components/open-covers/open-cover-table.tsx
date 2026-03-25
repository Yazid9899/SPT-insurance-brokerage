"use client";

import React from "react";
import Link from "next/link";

import { OPEN_COVER_STATUS_COLORS } from "@/lib/constants";
import type { OpenCoverListItem } from "@/types";

type Props = {
  rows: OpenCoverListItem[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function OpenCoverTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left">
            <th className="px-3 py-2">Reference</th>
            <th className="px-3 py-2">Client</th>
            <th className="px-3 py-2">Cargo Product</th>
            <th className="px-3 py-2">Insurer</th>
            <th className="px-3 py-2">Insurer Rate</th>
            <th className="px-3 py-2">Effective Period</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Declarations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="px-3 py-2 font-medium text-sky-700">
                <Link href={`/open-covers/${row.id}`}>{row.reference}</Link>
              </td>
              <td className="px-3 py-2">{row.clientName}</td>
              <td className="px-3 py-2">{row.cargoProduct ?? "-"}</td>
              <td className="px-3 py-2">{row.insurerName}</td>
              <td className="px-3 py-2">{row.insurerRate}%</td>
              <td className="px-3 py-2">
                {formatDate(row.effectiveFrom)} - {formatDate(row.effectiveTo)}
              </td>
              <td className="px-3 py-2">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${OPEN_COVER_STATUS_COLORS[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-2">{row.declarationCount}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-slate-500" colSpan={8}>
                No open covers found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
