import { OpenCoverForm } from "@/components/open-covers/open-cover-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";

export default async function NewOpenCoverPage() {
  const [clients, insurers] = await Promise.all([
    prisma.client.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
    prisma.insurer.findMany({ where: { status: "ACTIVE" }, orderBy: { displayName: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader title="New Open Cover" description="Create a new standing cargo agreement" />
      <OpenCoverForm
        mode="create"
        clients={clients.map((item) => ({
          id: item.id,
          displayName: item.displayName,
          company: item.company,
          email: item.email,
          phone: item.phone,
          status: item.status,
        }))}
        insurers={insurers.map((item) => ({
          id: item.id,
          displayName: item.displayName,
          email: item.email,
          phone: item.phone,
          status: item.status,
        }))}
      />
    </div>
  );
}
