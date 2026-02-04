import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPackStep } from "@/content-packs/registry";
import { renderMarkdownToReact } from "@/lib/markdown/renderer";
import "@/content-packs"; // Register all packs

interface CompanionPageProps {
  params: Promise<{ packKey: string; slug: string }>;
}

export default async function CompanionPage({ params }: CompanionPageProps) {
  const { packKey, slug } = await params;

  const packStep = getPackStep(packKey, slug);
  if (!packStep) {
    notFound();
  }

  const { pack, step } = packStep;

  // Load companion page markdown
  const pageFile = step.pageFile || step.emailFile;
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
    notFound();
  }

  const content = renderMarkdownToReact(markdown);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{pack.name}</h1>
          <p className="text-muted-foreground">{pack.description}</p>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          {content}
        </article>

        <div className="mt-12 pt-8 border-t">
          <div className="flex gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Subscribe
            </Link>
            <Link
              href="/manage"
              className="text-muted-foreground hover:text-foreground"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
