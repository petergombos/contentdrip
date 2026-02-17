import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "@/content-packs";
import { getPackByKey } from "@/content-packs/registry";
import {
  extractFrontmatter,
  parseMarkdown,
} from "@/lib/markdown/renderer";
import { readFileSync } from "fs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { join } from "path";

interface CompanionPageProps {
  params: Promise<{ packKey: string; slug: string }>;
}

function readPageMarkdown(packKey: string, slug: string) {
  const pack = getPackByKey(packKey);
  if (!pack) return null;

  const step = pack.steps.find((s) => s.slug === slug);
  if (!step) return null;

  const pageFile = step.pageFile ?? step.emailFile;
  const pagePath = join(
    process.cwd(),
    "src/content-packs",
    packKey,
    "pages",
    pageFile,
  );

  try {
    return { markdown: readFileSync(pagePath, "utf-8"), pack };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: CompanionPageProps): Promise<Metadata> {
  const { packKey, slug } = await params;
  const result = readPageMarkdown(packKey, slug);
  if (!result) return {};

  const { markdown, pack } = result;
  const fm = extractFrontmatter(markdown);
  const title = fm.subject ?? `${pack.name} — ${slug}`;
  const description = fm.preview ?? pack.description;

  const ogUrl = `/api/og?type=companion&title=${encodeURIComponent(title)}&label=${encodeURIComponent(pack.name)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function CompanionPage({ params }: CompanionPageProps) {
  const { packKey, slug } = await params;

  const result = readPageMarkdown(packKey, slug);
  if (!result) return notFound();

  const { markdown, pack } = result;
  const stepIndex = pack.steps.findIndex((s) => s.slug === slug);
  const processedMarkdown = markdown.replaceAll(
    "{{assetUrl}}",
    `/api/content-assets/${packKey}`,
  );
  const { html } = parseMarkdown(processedMarkdown);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Course header band */}
      <div className="border-b bg-muted/30">
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
        <article
          className="mx-auto max-w-3xl px-6 py-12 md:py-16"
          data-testid="companion-article"
        >
          <div
            className="prose prose-neutral dark:prose-invert prose-reading animate-fade-in-up max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Sign-up CTA */}
        <div className="border-t bg-muted/30">
          <div className="mx-auto max-w-3xl px-6 py-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Enjoying this?
            </p>
            <p className="mt-2 text-base text-foreground text-balance">
              This is lesson {stepIndex + 1} of {pack.steps.length} in{" "}
              <span className="font-medium">{pack.name}</span>. Sign up to get
              the full course delivered to your inbox.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
            >
              Start the course &rarr;
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
