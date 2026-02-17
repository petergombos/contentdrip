import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { BUTTON_STYLE } from "@/emails/components/email-primitives";

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
 * Inline styles for email HTML elements.
 * Gmail and many email clients strip <style> tags, so every element
 * needs inline styles to render correctly.
 */
const INLINE_STYLES: Record<string, string> = {
  p: "color:#404040;margin:16px 0;line-height:1.7143;font-size:14px",
  h1: "color:#171717;font-size:30px;font-weight:800;line-height:1.2;margin:0 0 24px",
  h2: "color:#171717;font-size:20px;font-weight:700;line-height:1.4;margin:32px 0 16px",
  h3: "color:#171717;font-size:18px;font-weight:600;line-height:1.556;margin:28px 0 8px",
  h4: "color:#171717;font-size:14px;font-weight:600;line-height:1.4286;margin:20px 0 8px",
  a: "color:#171717;text-decoration:underline;font-weight:500",
  strong: "color:#171717;font-weight:600",
  blockquote: "color:#171717;font-weight:500;font-style:italic;border-left:4px solid #e5e5e5;padding-left:20px;margin:24px 0",
  ul: "list-style-type:disc;padding-left:22px;margin:16px 0",
  ol: "list-style-type:decimal;padding-left:22px;margin:16px 0",
  li: "color:#404040;margin:4px 0;padding-left:6px;line-height:1.7143",
  hr: "border:none;border-top:1px solid #e5e5e5;margin:40px 0",
  code: "color:#171717;font-size:12px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace",
  pre: "color:#e5e5e5;background-color:#262626;font-size:12px;line-height:1.667;border-radius:4px;overflow-x:auto;margin:20px 0;padding:8px 12px",
  img: "max-width:100%;height:auto;margin:24px 0",
  del: "text-decoration:line-through",
  table: "width:100%;table-layout:auto;font-size:12px;line-height:1.5;margin:16px 0;border-collapse:collapse",
  thead: "border-bottom:1px solid #d4d4d4",
  th: "color:#171717;font-weight:600;vertical-align:bottom;padding:0 12px 8px",
  td: "vertical-align:baseline;padding:8px 12px",
};

/** Add inline styles to bare HTML tags produced by the markdown pipeline. */
function inlineStyles(html: string): string {
  // Match opening tags without existing style attributes
  return html.replace(
    /<(p|h[1-4]|a|strong|blockquote|ul|ol|li|hr|code|pre|img|del|table|thead|th|td)(\s[^>]*)?\/?>/g,
    (match, tag: string, attrs: string | undefined) => {
      const style = INLINE_STYLES[tag];
      if (!style) return match;

      // Don't add styles to elements that already have a style attribute
      // (e.g. button links from {button} transform)
      if (attrs && attrs.includes("style=")) return match;

      // Don't add styles to <code> inside <pre> (pre code inherits)
      // This is handled by the CSS but we skip inline code-in-pre
      // since we can't easily detect nesting with regex

      if (attrs) {
        // Self-closing tags like <hr /> or <img ... />
        if (match.endsWith("/>")) {
          return `<${tag}${attrs} style="${style}"/>`;
        }
        return `<${tag}${attrs} style="${style}">`;
      }
      if (match.endsWith("/>")) {
        return `<${tag} style="${style}"/>`;
      }
      return `<${tag} style="${style}">`;
    }
  );
}

/**
 * Parse markdown file with frontmatter
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  const parsed = matter(markdown);
  const frontmatter = parsed.data as MarkdownFrontmatter;

  // Convert markdown to HTML for email rendering
  // Using unified pipeline: remark -> rehype -> stringify
  let html = String(
    remark()
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(parsed.content)
  );

  // Convert {button} sugar into styled CTA buttons.
  // Markdown pattern: [Button text](url){button}
  // After remark, {button} survives as literal text following the <a> tag.
  const unitless = new Set(["fontWeight", "opacity", "zIndex", "lineHeight", "order", "flexGrow", "flexShrink"]);
  const btnCss = Object.entries(BUTTON_STYLE)
    .map(([k, v]) => {
      const prop = k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
      const val = typeof v === "number" && !unitless.has(k) ? `${v}px` : v;
      return `${prop}:${val}`;
    })
    .join(";");
  html = html.replace(
    /<a href="([^"]+)">([^<]+)<\/a>\{button\}/g,
    (_match, href: string, text: string) =>
      `</p><div style="text-align:center;margin:28px 0"><a href="${href}" style="${btnCss}">${text}</a></div><p>`
  );
  // Clean up empty <p></p> tags left by the split
  html = html.replace(/<p><\/p>/g, "");

  // Inline styles on all elements for Gmail compatibility
  html = inlineStyles(html);

  // Fix <code> inside <pre>: inherit from pre instead of using inline code styles
  html = html.replace(
    /(<pre[^>]*>)<code[^>]*>/g,
    "$1<code style=\"color:inherit;background:none;padding:0;border-radius:0;font-size:inherit;font-weight:inherit;line-height:inherit\">"
  );

  // Strip top margin from the first block element (mirrors CSS :first-child rules)
  html = html.replace(
    /^(<(?:p|h[1-6]|ul|ol|blockquote|img|pre|hr|table)\s[^>]*?)margin:(\d+)px 0(?: (\d+)px)?/,
    (_m, before: string, _top: string, bottom: string) =>
      `${before}margin:0 0 ${bottom ?? "16"}px`
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
 * Extract frontmatter from markdown
 */
export function extractFrontmatter(markdown: string): MarkdownFrontmatter {
  const parsed = matter(markdown);
  return parsed.data as MarkdownFrontmatter;
}
