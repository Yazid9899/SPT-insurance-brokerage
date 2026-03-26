"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  items: Array<{ productLine: string; cargoProduct: string | null; count: number }>;
};

export function CasesByProductChart({ items }: Props) {
  const chartData = items.map((item) => ({
    product: item.cargoProduct ? `${item.productLine}:${item.cargoProduct}` : item.productLine,
    count: item.count,
  }));

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold">Cases by Product</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
