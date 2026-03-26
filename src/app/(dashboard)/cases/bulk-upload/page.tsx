import { PageHeader } from "@/components/shared/page-header";
import { BulkUploadWizard } from "@/components/cases/bulk-upload-wizard";

export default function BulkUploadPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Bulk Upload" description="Create 1-10 draft cargo cases from XLS under one open cover" />
      <BulkUploadWizard />
    </div>
  );
}

