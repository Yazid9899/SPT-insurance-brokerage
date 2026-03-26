"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  items: Array<{ month: string; value: string }>;
};

export function MonthlyCommissionChart({ items }: Props) {
  const chartData = items.map((item) => ({ month: item.month, value: Number(item.value) }));

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold">Monthly Commission</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
