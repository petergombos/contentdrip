import { ManageRequestForm } from "@/components/manage-request-form";
import { Card } from "@/components/ui/card";

export default function ManagePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Subscription</h1>
          <p className="text-muted-foreground">
            Enter your email and content pack to receive a management link
          </p>
        </div>

        <Card className="p-6">
          <ManageRequestForm />
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <a href="/" className="underline hover:text-foreground">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
