import matter from "gray-matter";
import * as production from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkRehype from 'remark-rehype';

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
      .use(remarkRehype)
      .use(rehypeStringify)
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
 */
export function renderMarkdownToReact(markdown: string): React.ReactElement {
  const parsed = parseMarkdown(markdown);

  // Use unified pipeline with rehype-react
  // rehype-react v8+ requires using the production JSX runtime
  const result = remark()
    .use(remarkRehype)
    .use(rehypeReact, {
      ...production,
      components: {
        h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
        ),
        h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
        ),
        h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
          <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
        ),
        p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
          <p className="mb-4 leading-relaxed" {...props} />
        ),
        ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
          <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
        ),
        ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
          <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
        ),
        li: (props: React.HTMLAttributes<HTMLLIElement>) => (
          <li className="ml-4" {...props} />
        ),
        a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
          <a
            className="text-blue-600 hover:text-blue-800 underline"
            {...props}
          />
        ),
        blockquote: (
          props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>
        ) => (
          <blockquote
            className="border-l-4 border-gray-300 pl-4 italic my-4"
            {...props}
          />
        ),
        code: (props: React.HTMLAttributes<HTMLElement>) => (
          <code
            className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
            {...props}
          />
        ),
        pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
          <pre
            className="bg-gray-100 p-4 rounded overflow-x-auto my-4"
            {...props}
          />
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
