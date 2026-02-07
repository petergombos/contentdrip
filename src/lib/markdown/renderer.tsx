import matter from "gray-matter";
import * as production from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkRehype from "remark-rehype";

export interface MarkdownFrontmatter {
  subject?: string;
  preview?: string;
  [key: string]: unknown;
}

export interface ParsedMarkdown {
  frontmatter: MarkdownFrontmatter;
  content: string;
  html: string;
}

/**
 * Parse markdown file with frontmatter
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  const parsed = matter(markdown);
  const frontmatter = parsed.data as MarkdownFrontmatter;

  // Convert markdown to HTML for email rendering
  // Using unified pipeline: remark -> rehype -> stringify
  const html = String(
    remark()
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(parsed.content)
  );

  return {
    frontmatter,
    content: parsed.content,
    html,
  };
}

/**
 * Render markdown to HTML string (for emails)
 */
export function renderMarkdownToHtml(markdown: string): string {
  const parsed = parseMarkdown(markdown);
  return parsed.html;
}

/**
 * Render markdown to React components (for web pages)
 *
 * Uses an editorial typographic system with warm, bookish styling.
 */
export function renderMarkdownToReact(markdown: string): React.ReactElement {
  const parsed = parseMarkdown(markdown);

  // Use unified pipeline with rehype-react
  // rehype-react v8+ requires using the production JSX runtime
  const result = remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeReact, {
      ...production,
      components: {
        h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h1
            className="mb-6 mt-0 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl"
            {...props}
          />
        ),
        h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h2
            className="mb-4 mt-10 font-serif text-2xl font-semibold tracking-tight text-foreground first:mt-0"
            {...props}
          />
        ),
        h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h3
            className="mb-3 mt-8 text-lg font-semibold tracking-tight text-foreground"
            {...props}
          />
        ),
        p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
          <p
            className="mb-5 text-base leading-[1.8] text-foreground/80"
            {...props}
          />
        ),
        ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
          <ul
            className="mb-6 list-none space-y-2 pl-0 text-foreground/80"
            {...props}
          />
        ),
        ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
          <ol
            className="mb-6 list-none space-y-2 pl-0 text-foreground/80 [counter-reset:item]"
            {...props}
          />
        ),
        li: (props: React.HTMLAttributes<HTMLLIElement>) => (
          <li
            className="relative pl-6 leading-[1.8] before:absolute before:left-0 before:text-primary/50 before:content-['—'] [ol>&]:before:content-[counter(item)_'.\00a0'] [ol>&]:[counter-increment:item]"
            {...props}
          />
        ),
        a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
          <a
            className="font-medium text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary/70 transition-colors"
            {...props}
          />
        ),
        blockquote: (
          props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>
        ) => (
          <blockquote
            className="my-8 border-l-2 border-primary/25 pl-5 text-base italic leading-[1.8] text-muted-foreground"
            {...props}
          />
        ),
        code: (props: React.HTMLAttributes<HTMLElement>) => (
          <code
            className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
            {...props}
          />
        ),
        pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
          <pre
            className="my-6 overflow-x-auto rounded-lg bg-foreground/3 border border-border/50 p-5"
            {...props}
          />
        ),
        img: (
          props: React.ImgHTMLAttributes<HTMLImageElement> & {
            node?: unknown;
          }
        ) => {
          const { node: _node, ...rest } = props;
          // eslint-disable-next-line @next/next/no-img-element
          return (
            <img
              className="my-8 h-auto w-full rounded-lg shadow-lg shadow-foreground/4"
              loading="lazy"
              alt={rest.alt ?? ""}
              {...rest}
            />
          );
        },
        hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
          <hr
            className="my-10 border-0 border-t border-border/60"
            {...props}
          />
        ),
        strong: (props: React.HTMLAttributes<HTMLElement>) => (
          <strong className="font-semibold text-foreground" {...props} />
        ),
        em: (props: React.HTMLAttributes<HTMLElement>) => (
          <em className="not-italic text-muted-foreground" {...props} />
        ),
      },
    })
    .processSync(parsed.content);

  return result.result as React.ReactElement;
}

/**
 * Extract frontmatter from markdown
 */
export function extractFrontmatter(markdown: string): MarkdownFrontmatter {
  const parsed = matter(markdown);
  return parsed.data as MarkdownFrontmatter;
}
