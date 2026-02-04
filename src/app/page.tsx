import { SubscribeForm } from "@/components/subscribe-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Content Drip</h1>
          <p className="text-muted-foreground">
            Subscribe to receive thoughtful content delivered to your inbox
          </p>
        </div>

        <Card className="p-6">
          <SubscribeForm />
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/manage" className="underline hover:text-foreground">
            Manage existing subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
