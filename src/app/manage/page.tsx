import { ManageRequestForm } from "@/components/manage-request-form";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";

export default function ManagePage() {
  return (
    <PageShell
      title="Manage your subscription"
      subtitle="Request a one-time link to update delivery time, timezone, or unsubscribe."
    >
      <Card className="p-6 md:p-8">
        <ManageRequestForm />
      </Card>
    </PageShell>
  );
}
