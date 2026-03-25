import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return <div className="flex min-h-screen items-center justify-center">{children}</div>;
}
