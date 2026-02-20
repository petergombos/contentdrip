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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { BookOpen, Mail, Star } from "lucide-react";
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

const curriculum = [
  {
    day: "Welcome",
    title: "Why email courses work",
    description:
      "An overview of the format and why drip-fed lessons outperform long-form content.",
  },
  {
    day: "Day 1",
    title: "Pick your topic & outline",
    description:
      "How to choose a focused topic and map out 3–5 lessons your audience will love.",
  },
  {
    day: "Day 2",
    title: "Write your first lesson",
    description:
      "A simple template for writing clear, actionable lessons that keep readers engaged.",
  },
  {
    day: "Day 3",
    title: "Launch & grow your list",
    description:
      "Set up delivery, add a subscribe form, and start getting your first subscribers.",
  },
];

const testimonials = [
  {
    name: "Alex P.",
    quote:
      "I launched my first email course in a weekend. The drip format keeps subscribers engaged way better than a big PDF.",
    initial: "A",
  },
  {
    name: "Jamie R.",
    quote:
      "Super easy to set up. I just wrote my lessons, configured the schedule, and it handled the rest.",
    initial: "J",
  },
  {
    name: "Sam T.",
    quote:
      "My open rates are 3× higher than my regular newsletter. People actually complete the whole course.",
    initial: "S",
  },
];

const faqItems = [
  {
    question: "Is this course really free?",
    answer:
      "Yes — this is a demo template. In your own version you can keep it free, gate it behind a payment, or use it as a lead magnet. The platform handles delivery either way.",
  },
  {
    question: "How long is each lesson?",
    answer:
      "Each email takes about 5 minutes to read. Lessons are intentionally short so subscribers can take action the same day.",
  },
  {
    question: "Can I change the delivery schedule?",
    answer:
      "Absolutely. Subscribers choose their preferred frequency and delivery time when they sign up. You set the default in your content pack config.",
  },
  {
    question: "What if I miss an email?",
    answer:
      "Every subscriber gets a management link where they can view past lessons, pause delivery, or change their schedule.",
  },
  {
    question: "Can I unsubscribe at any time?",
    answer:
      "Of course. There's an unsubscribe link in every email, and subscribers can also manage or cancel from their dashboard.",
  },
];

export default function HomePage() {
  const pack = getPackByKey(PACK_KEY);
  return (
    <div id="top" className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — two-column grid with form on the right */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
            <div className="grid items-start gap-10 md:grid-cols-2 md:gap-12">
              {/* Left column */}
              <div>
                <Badge variant="outline" className="animate-fade-in-up">
                  Demo Template
                </Badge>
                <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl animate-fade-in-up delay-1 text-balance">
                  Build your first email course in 3 days
                </h1>
                <p className="mt-4 max-w-prose text-lg text-muted-foreground animate-fade-in-up delay-2">
                  A free email course on writing email courses — the format with
                  the highest completion rate in online education. Pick your
                  topic, write your lessons, and launch to your first
                  subscribers.
                </p>
                <p className="mt-3 text-sm text-muted-foreground/70 animate-fade-in-up delay-2">
                  ✏️ This is example content. Replace with your own.
                </p>
              </div>

              {/* Right column — subscribe form */}
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
                    <SubscribeFormSubmit>
                      Start My Free Course
                    </SubscribeFormSubmit>
                  </SubscribeForm>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Content Outline */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center">
              <Badge variant="outline">Sample Curriculum</Badge>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
                What you&apos;ll learn
              </h2>
            </div>
            <div className="mt-10 grid gap-4">
              {curriculum.map((item, i) => (
                <div
                  key={item.day}
                  className="flex gap-4 rounded-xl border bg-card p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.day}
                      </Badge>
                      <span className="font-medium text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <Badge variant="outline">Placeholder Reviews</Badge>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
                What subscribers are saying
              </h2>
              <p className="mt-2 text-sm text-muted-foreground/70">
                These are fictional testimonials. Replace them with real ones.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name}>
                  <CardContent className="pt-1">
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-current"
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {t.initial}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Example Subscriber
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center">
              <Badge variant="outline">Sample FAQ</Badge>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
                Frequently asked questions
              </h2>
            </div>
            <div className="mt-10">
              <Accordion type="single" collapsible>
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
              Ready to start?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign up above and get your first lesson today.
            </p>
            <Button size="lg" asChild className="mt-6">
              <a href="#top">Get Started Free</a>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground/70">
              Free forever. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
