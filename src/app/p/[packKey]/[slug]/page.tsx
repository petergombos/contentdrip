import { getPackByKey } from "@/content-packs/registry";
import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import { renderMarkdownToReact } from "@/lib/markdown/renderer";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";

interface CompanionPageProps {
  params: Promise<{ packKey: string; slug: string }>;
}

export default async function CompanionPage({ params }: CompanionPageProps) {
  const { packKey, slug } = await params;

  const pack = getPackByKey(packKey);
  if (!pack) return notFound();

  const step = pack.steps.find((s) => s.slug === slug);
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

  return (
    <PageShell
      title={pack.name}
      subtitle={pack.description ?? "A companion page for this email."}
    >
      <Card className="p-6 md:p-10">
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          {content}
        </article>
      </Card>
    </PageShell>
  );
}
