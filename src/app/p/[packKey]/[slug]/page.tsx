import { getPackByKey } from "@/content-packs/registry";
import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { renderMarkdownToReact } from "@/lib/markdown/renderer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import "@/content-packs";

interface CompanionPageProps {
  params: Promise<{ packKey: string; slug: string }>;
}

export default async function CompanionPage({ params }: CompanionPageProps) {
  const { packKey, slug } = await params;

  const pack = getPackByKey(packKey);
  if (!pack) return notFound();

  const stepIndex = pack.steps.findIndex((s) => s.slug === slug);
  const step = stepIndex >= 0 ? pack.steps[stepIndex] : undefined;
  if (!step) return notFound();

  const pageFile = step.pageFile ?? step.emailFile;
  const pagePath = join(
    process.cwd(),
    "src/content-packs",
    packKey,
    "pages",
    pageFile
  );

  let markdown: string;
  try {
    markdown = readFileSync(pagePath, "utf-8");
  } catch {
    return notFound();
  }

  const content = renderMarkdownToReact(markdown);

  // Navigation
  const prevStep = stepIndex > 0 ? pack.steps[stepIndex - 1] : null;
  const nextStep =
    stepIndex < pack.steps.length - 1 ? pack.steps[stepIndex + 1] : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Course header band */}
      <div className="border-b bg-warm-subtle">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                {pack.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lesson {stepIndex + 1} of {pack.steps.length}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {pack.steps.map((s, i) => (
                <div
                  key={s.slug}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex
                      ? "w-4 bg-primary"
                      : i < stepIndex
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article content */}
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <div className="prose-reading animate-fade-in-up">{content}</div>
        </article>

        {/* Lesson navigation */}
        {(prevStep || nextStep) && (
          <div className="border-t bg-warm-subtle">
            <div className="mx-auto flex max-w-3xl items-stretch">
              {prevStep ? (
                <Link
                  href={`/p/${packKey}/${prevStep.slug}`}
                  className="group flex flex-1 flex-col items-start gap-1 border-r px-6 py-5 no-underline transition-colors hover:bg-(--surface-warm-hover)"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    &larr; Previous
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {prevStep.slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextStep ? (
                <Link
                  href={`/p/${packKey}/${nextStep.slug}`}
                  className="group flex flex-1 flex-col items-end gap-1 px-6 py-5 no-underline transition-colors hover:bg-(--surface-warm-hover)"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Next &rarr;
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {nextStep.slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
