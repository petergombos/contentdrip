"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagIcon } from "lucide-react";
import { useState } from "react";

interface PageFrontmatter {
  title?: string;
  description?: string;
  keywords?: string | string[];
  [key: string]: unknown;
}

export function PagePreview({
  data,
}: {
  data: { frontmatter: PageFrontmatter; html: string };
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div
        className="prose prose-neutral dark:prose-invert prose-headings:font-serif max-w-none"
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
    </div>
  );
}

export function PageTopBarInfo({
  data,
  packName,
  stepSlug,
}: {
  data: { frontmatter: PageFrontmatter };
  packName: string;
  stepSlug: string;
}) {
  const title =
    (data.frontmatter.title as string) ?? `${packName} — ${stepSlug}`;

  return <p className="truncate text-sm font-medium">{title}</p>;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null)
    return JSON.stringify(value, null, 2);
  return String(value);
}

export function PageMetaAction({
  data,
  packName,
  stepSlug,
}: {
  data: { frontmatter: PageFrontmatter };
  packName: string;
  stepSlug: string;
}) {
  const [open, setOpen] = useState(false);

  const entries = Object.entries(data.frontmatter).filter(
    ([, v]) => v != null
  );

  if (entries.length === 0) return null;

  const title =
    (data.frontmatter.title as string) ?? `${packName} — ${stepSlug}`;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        <TagIcon />
        Meta
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
          {entries.length}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Page Metadata</DialogTitle>
            <p className="text-sm text-muted-foreground">{title}</p>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {entries.map(([key, value]) => (
              <div key={key} className="grid gap-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {key}
                </label>
                <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                  {typeof value === "object" && value !== null ? (
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {formatValue(value)}
                    </pre>
                  ) : (
                    <span>{formatValue(value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
