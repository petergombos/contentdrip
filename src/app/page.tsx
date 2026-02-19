import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  SubscribeForm,
  SubscribeFormDeliveryTimeField,
  SubscribeFormDescription,
  SubscribeFormEmailInput,
  SubscribeFormError,
  SubscribeFormField,
  SubscribeFormFieldError,
  SubscribeFormFrequencyField,
  SubscribeFormLabel,
  SubscribeFormSubmit,
} from "@/components/subscribe-form";
import { Card } from "@/components/ui/card";
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

const PACK_KEY = "my-course";

export default function HomePage() {
  const pack = getPackByKey(PACK_KEY);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl animate-fade-in-up">
              Your course headline goes here
            </h1>
            <p className="mt-4 max-w-prose text-lg text-muted-foreground animate-fade-in-up delay-1">
              A brief description of what subscribers will learn. Keep it
              specific — what transformation or outcome can they expect?
            </p>
          </div>
        </section>

        {/* Subscribe form */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-md px-6">
            <Card className="animate-fade-in-up delay-2 p-6 md:p-8">
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                Start the course
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Free. Delivered to your inbox at the pace you choose.
              </p>
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
                <SubscribeFormError />
                <SubscribeFormSubmit>Start My Free Course</SubscribeFormSubmit>
              </SubscribeForm>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
