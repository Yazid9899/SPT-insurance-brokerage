import { getServerSession } from "next-auth";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={session.user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
