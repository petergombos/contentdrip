import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  SubscribeForm,
  SubscribeFormDeliveryTimeField,
  SubscribeFormDescription,
  SubscribeFormEmailInput,
  SubscribeFormField,
  SubscribeFormFieldError,
  SubscribeFormFrequencyField,
  SubscribeFormLabel,
  SubscribeFormSubmit,
} from "@/components/subscribe-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config";
import "@/content-packs";
import { getPackByKey } from "@/content-packs/registry";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: `/api/og?type=default&title=${encodeURIComponent(siteConfig.name)}&label=Free+Course`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

// ✏️ Change PACK_KEY to match the `key` field in your content pack
// (defined in src/content-packs/your-pack/pack.ts).
const PACK_KEY = "my-course";

export default function HomePage() {
  const pack = getPackByKey(PACK_KEY);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        {/* ✏️ Update the headline and description below to match your course */}
        <section className="border-b">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl animate-fade-in-up text-balance">
              Build your first email course in 3 days
            </h1>
            <p className="mt-4 max-w-prose text-lg text-muted-foreground animate-fade-in-up delay-1">
              A free email course on writing email courses — the format with the
              highest completion rate in online education. Pick your topic,
              write your lessons, and launch to your first subscribers.
            </p>
          </div>
        </section>

        {/* Subscribe form */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-md px-6">
            <Card size="lg" className="animate-fade-in-up delay-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Start the course
                </CardTitle>
                <CardDescription>
                  Free. Delivered to your inbox at the pace you choose.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscribeForm packKey={PACK_KEY} frequency={pack?.frequency}>
                  <SubscribeFormField name="email">
                    <SubscribeFormLabel>Email</SubscribeFormLabel>
                    <SubscribeFormEmailInput />
                    <SubscribeFormFieldError />
                    <SubscribeFormDescription>
                      No spam, totally free.
                    </SubscribeFormDescription>
                  </SubscribeFormField>
                  <SubscribeFormFrequencyField />
                  <SubscribeFormDeliveryTimeField />
                  <SubscribeFormSubmit>Start My Free Course</SubscribeFormSubmit>
                </SubscribeForm>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
