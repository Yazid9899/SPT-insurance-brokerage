import { OpenCoverForm } from "@/components/open-covers/open-cover-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewOpenCoverPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="New Open Cover" description="Create a new standing cargo agreement" />
      <OpenCoverForm mode="create" />
    </div>
  );
}
