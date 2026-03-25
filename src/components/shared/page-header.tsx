import React from "react";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="space-y-1">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </header>
  );
}
