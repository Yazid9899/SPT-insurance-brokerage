import React from "react";
import Link from "next/link";

import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

type SidebarUser = {
  name?: string | null;
  email?: string | null;
};

export function AppSidebar({ user }: { user: SidebarUser }) {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <h1 className="mb-6 text-2xl font-semibold">{APP_NAME}</h1>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.key} href={item.href} className="block rounded px-3 py-2 hover:bg-slate-100">
            {item.label}
          </Link>
        ))}
      </nav>
      <footer className="mt-8 border-t pt-4 text-sm text-slate-600">
        <p className="font-medium text-slate-900">{user.name ?? "Case Maker"}</p>
        <p>{user.email ?? "casemaker@cargoshield.local"}</p>
      </footer>
    </aside>
  );
}
