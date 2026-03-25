import { CaseForm } from "@/components/cases/case-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewCasePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="New Case" description="Create a case declaration" />
      <CaseForm />
    </div>
  );
}
