import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import {
  BUTTON_STYLE,
  buildInlineStyles,
} from "@/emails/components/email-primitives";

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
 * Generated from CONTENT_ELEMENT_STYLES (single source of truth).
 */
const INLINE_STYLES = buildInlineStyles();

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

  // Unwrap standalone images from <p> tags so they sit at the block level.
  // This lets the full-bleed CSS (negative margin) work without <p> margins
  // adding unwanted extra vertical spacing around the image.
  html = html.replace(/<p[^>]*>\s*(<img\s[^>]*\/?>)\s*<\/p>/g, "$1");

  // Strip top margin from the first block element (mirrors CSS :first-child rules)
  html = html.replace(
    /^(<(?:p|h[1-6]|ul|ol|blockquote|img|pre|hr|table)\s[^>]*?)margin:(\d+)px 0(?: (\d+)px)?/,
    (_m, before: string, top: string, bottom: string) =>
      `${before}margin:0 0 ${bottom ?? top}px`
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
 * Parse markdown for web pages (companion pages, etc.).
 * Returns clean HTML without email-specific inline styles or button transforms.
 * Intended for use with Tailwind prose classes.
 */
export function parsePageMarkdown(markdown: string): ParsedMarkdown {
  const parsed = matter(markdown);
  const frontmatter = parsed.data as MarkdownFrontmatter;

  const html = String(
    remark()
      .use(remarkGfm)
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
 * Extract frontmatter from markdown
 */
export function extractFrontmatter(markdown: string): MarkdownFrontmatter {
  const parsed = matter(markdown);
  return parsed.data as MarkdownFrontmatter;
}
