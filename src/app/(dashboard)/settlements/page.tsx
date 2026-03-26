import { PageHeader } from "@/components/shared/page-header";
import { SettlementsPageClient } from "@/components/settlements/settlements-page-client";
import { listSettlements } from "@/lib/settlement-service";

export default async function SettlementsPage() {
  const items = await listSettlements({});

  return (
    <div className="space-y-4">
      <PageHeader title="Settlements" description="Manage monthly insurer settlement batches" />
      <SettlementsPageClient initialRows={items} />
    </div>
  );
}
