import { redirect } from "next/navigation";
import { confirmSubscriptionAction } from "@/domains/subscriptions/actions/subscription-actions";

interface ConfirmPageProps {
  params: Promise<{ token: string }>;
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { token } = await params;

  // Only catch real errors. `redirect()` throws a NEXT_REDIRECT exception
  // which must not be swallowed.
  let result: Awaited<ReturnType<typeof confirmSubscriptionAction>>;
  try {
    // Pass the plain token - the action will hash it
    result = await confirmSubscriptionAction({ token });
  } catch (error: any) {
    // Let Next.js handle redirects correctly.
    if (error?.digest && String(error.digest).includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (error?.message && String(error.message).includes("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (result?.serverError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
          <p className="text-muted-foreground">
            {typeof result.serverError === "string"
              ? result.serverError
              : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (result?.data) {
    redirect("/?confirmed=true");
  }

  // Fallback (shouldn't happen)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
        <p className="text-muted-foreground">An error occurred</p>
      </div>
    </div>
  );
}
