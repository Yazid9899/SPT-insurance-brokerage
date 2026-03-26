"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  items: Array<{ insurerName: string; totalBrokerCommission: string; caseCount: number }>;
};

export function CommissionByInsurerChart({ items }: Props) {
  const chartData = items.map((item) => ({ insurerName: item.insurerName, value: Number(item.totalBrokerCommission) }));

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold">Commission by Insurer</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="insurerName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
