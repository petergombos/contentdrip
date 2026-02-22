import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// cspell:ignore Fraunces
// Fraunces matches the site's font-serif. Clients that strip the @import
// fall back to the Georgia / ui-serif stack.
const SERIF_FONT =
  "Fraunces, ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";

const SANS_FONT =
  "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";

// ── Content element styles (single source of truth) ──
// Values from EMAIL_CSS — the canonical, recently-updated source.
// Both inline styles (Gmail) and <style> CSS are generated from this object.

export const CONTENT_ELEMENT_STYLES: Record<string, Record<string, string>> = {
  p: {
    color: "#404040",
    margin: "16px 0",
    "line-height": "1.7143",
    "font-size": "14px",
  },
  h1: {
    color: "#171717",
    "font-family": SERIF_FONT,
    "font-size": "26px",
    "font-weight": "600",
    "line-height": "1.2",
    margin: "0 0 24px",
  },
  h2: {
    color: "#1c1917",
    "font-family": SERIF_FONT,
    "font-size": "18px",
    "font-weight": "600",
    "line-height": "1.35",
    margin: "32px 0 12px",
    "letter-spacing": "-0.01em",
  },
  h3: {
    color: "#171717",
    "font-size": "15px",
    "font-weight": "600",
    "line-height": "1.5",
    margin: "28px 0 8px",
  },
  h4: {
    color: "#171717",
    "font-size": "14px",
    "font-weight": "600",
    "line-height": "1.4286",
    margin: "20px 0 8px",
  },
  a: { color: "#171717", "text-decoration": "underline", "font-weight": "500" },
  strong: { color: "#171717", "font-weight": "600" },
  blockquote: {
    color: "#171717",
    "font-weight": "500",
    "font-style": "italic",
    "border-left": "4px solid #e5e5e5",
    "padding-left": "20px",
    margin: "24px 0",
  },
  ul: { "list-style-type": "disc", "padding-left": "22px", margin: "16px 0" },
  ol: {
    "list-style-type": "decimal",
    "padding-left": "22px",
    margin: "16px 0",
  },
  li: {
    color: "#404040",
    margin: "4px 0",
    "padding-left": "6px",
    "line-height": "1.7143",
  },
  hr: { border: "none", "border-top": "1px solid #e5e5e5", margin: "40px 0" },
  code: {
    color: "#171717",
    "font-size": "12px",
    "font-weight": "600",
    "font-family":
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  pre: {
    color: "#e5e5e5",
    "background-color": "#262626",
    "font-size": "12px",
    "line-height": "1.667",
    "border-radius": "4px",
    "overflow-x": "auto",
    margin: "20px 0",
    padding: "8px 12px",
  },
  img: {
    width: "100%",
    height: "auto",
    margin: "24px 0",
    display: "block",
  },
  table: {
    width: "100%",
    "table-layout": "auto",
    "font-size": "12px",
    "line-height": "1.5",
    margin: "16px 0",
    "border-collapse": "collapse",
  },
  thead: { "border-bottom": "1px solid #d4d4d4" },
  th: {
    color: "#171717",
    "font-weight": "600",
    "vertical-align": "bottom",
    padding: "0 12px 8px",
  },
  td: { "vertical-align": "baseline", padding: "8px 12px" },
  figcaption: {
    color: "#737373",
    "font-size": "12px",
    "line-height": "1.333",
    "margin-top": "8px",
  },
  del: { "text-decoration": "line-through" },
};

/** Convert tokens to flat CSS strings for the renderer's inline style injection. */
export function buildInlineStyles(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [tag, props] of Object.entries(CONTENT_ELEMENT_STYLES)) {
    result[tag] = Object.entries(props)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
  }
  return result;
}

/** Generate `.eb`-scoped CSS from tokens, plus CSS-only rules. */
function buildEmailCss(): string {
  const lines: string[] = [
    "  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');",
  ];

  for (const [tag, props] of Object.entries(CONTENT_ELEMENT_STYLES)) {
    const selector =
      tag === "th" ? "thead th" : tag === "td" ? "tbody td" : tag;
    const decls = Object.entries(props)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    lines.push(`  .eb ${selector} { ${decls}; }`);
  }

  // Pseudo-selectors and compound rules (cannot be expressed inline)
  lines.push(
    "  .eb p:first-child { margin-top: 0; }",
    "  .eb p:last-child { margin-bottom: 0; }",
    "  .eb h2:first-child { margin-top: 0; }",
    "  .eb h3:first-child { margin-top: 0; }",
    "  .eb hr:first-child { margin-top: 0; }",
    "  .eb hr:last-child { margin-bottom: 0; }",
    "  .eb pre code { color: inherit; background: none; padding: 0; border-radius: 0; font-size: inherit; font-weight: inherit; line-height: inherit; }",
    "  .eb tbody tr { border-bottom: 1px solid #e5e5e5; }",
  );

  return "\n" + lines.join("\n") + "\n";
}

// ── Style constants ──

export const emailStyles = {
  body: {
    backgroundColor: "#f5f5f4",
    fontFamily: SANS_FONT,
    margin: 0,
    padding: "40px 0",
    color: "#404040",
  },
  container: {
    margin: "0 auto",
    maxWidth: 560,
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: 12,
    overflow: "hidden" as const,
  },

  // ── Content ──
  main: {
    padding: "20px 0 28px",
  },
  content: {
    fontSize: 14,
    lineHeight: "1.7143",
    color: "#404040",
  },

  // ── Footer ──
  footerWrap: {
    borderTop: "1px solid #e7e5e4",
    padding: "24px 32px",
    backgroundColor: "#fafaf9",
  },
  footerLinks: {
    margin: 0,
    fontSize: 12,
    color: "#a8a29e",
    textAlign: "center" as const,
    lineHeight: "1.6",
  },
  footerLink: {
    color: "#78716c",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  footerDivider: {
    color: "#d6d3d1",
  },
  footerBrand: {
    margin: "12px 0 0",
    fontSize: 11,
    color: "#a8a29e",
    textAlign: "center" as const,
    letterSpacing: "0.02em",
  },

  // ── Utilities ──
  text: {
    margin: "16px 0",
    fontSize: 14,
    lineHeight: "1.7143",
    color: "#404040",
  },
  muted: {
    margin: 0,
    fontSize: 12,
    lineHeight: "1.333",
    color: "#737373",
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * Email <Head> CSS — mirrors Tailwind prose styling for markdown content.
 * Scoped to `.eb` (email-body) to avoid leaking onto react-email layout tables.
 * Generated from CONTENT_ELEMENT_STYLES (single source of truth).
 */
export const EMAIL_CSS = buildEmailCss();

export const BUTTON_STYLE: React.CSSProperties = {
  background: "#171717",
  color: "#fafafa",
  padding: "14px 32px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

// ── Layout ──

export function EmailLayout(props: {
  preview?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Html>
      <Head>
        <style>{EMAIL_CSS}</style>
      </Head>
      {props.preview ? <Preview>{props.preview}</Preview> : null}
      <Body style={{ ...emailStyles.body, ...props.style }}>
        <Container style={emailStyles.container}>{props.children}</Container>
      </Body>
    </Html>
  );
}

// ── Layout primitives ──

/** Two-column table row. Place `EmailColumn` children inside. */
export function EmailRow(props: { children: React.ReactNode }) {
  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      style={{ width: "100%" }}
    >
      <tr>{props.children}</tr>
    </table>
  );
}

/** A cell inside an `EmailRow`. */
export function EmailColumn(props: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        verticalAlign: "top",
        textAlign: props.align ?? ("left" as const),
        whiteSpace: props.align === "right" ? ("nowrap" as const) : undefined,
        ...props.style,
      }}
    >
      {props.children}
    </td>
  );
}

// ── Header compound components ──

/** Top bar of the email header. */
export function EmailHeaderBar(props: { children: React.ReactNode }) {
  return (
    <Section
      style={{
        padding: "16px 32px",
        borderBottom: "1px solid #e7e5e4",
      }}
    >
      {props.children}
    </Section>
  );
}

/** Small rounded square with a single character (brand initial / logo stand-in). */
export function EmailHeaderMark(props: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block" as const,
        width: 22,
        height: 22,
        lineHeight: "22px",
        borderRadius: 5,
        backgroundColor: "#f5f0eb",
        color: "#78716c",
        fontSize: 10,
        fontWeight: 700,
        fontFamily: SANS_FONT,
        textAlign: "center" as const,
        verticalAlign: "middle" as const,
      }}
    >
      {props.children}
    </span>
  );
}

/** Brand / site name, displayed inline next to the mark. */
export function EmailHeaderBrandName(props: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#1c1917",
        lineHeight: "22px",
        verticalAlign: "middle" as const,
        paddingLeft: 8,
      }}
    >
      {props.children}
    </span>
  );
}

/** Muted subtitle under the brand row (e.g. the course name). */
export function EmailHeaderCourseName(props: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: "4px 0 0",
        fontSize: 12,
        color: "#a8a29e",
        lineHeight: "1.3",
      }}
    >
      {props.children}
    </Text>
  );
}

/** Lesson counter + progress dots. */
export function EmailHeaderProgress(props: {
  stepIndex?: number;
  totalSteps?: number;
}) {
  if (
    props.stepIndex == null ||
    props.totalSteps == null ||
    props.totalSteps <= 0
  ) {
    return null;
  }

  return (
    <div>
      <Text
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 500,
          color: "#a8a29e",
          textAlign: "right" as const,
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
          lineHeight: "1",
        }}
      >
        Lesson {props.stepIndex + 1} of {props.totalSteps}
      </Text>
      <div
        style={{ marginTop: 6, textAlign: "right" as const, lineHeight: "1" }}
      >
        {Array.from({ length: props.totalSteps }).map((_, i) => (
          <span
            key={i}
            style={{
              display: "inline-block" as const,
              width: 6,
              height: 6,
              borderRadius: "50%",
              margin: "0 2px",
              backgroundColor: i <= props.stepIndex! ? "#1c1917" : "#e7e5e4",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Email subject rendered as the main serif headline. */
export function EmailHeaderTitle(props: { children: React.ReactNode }) {
  return (
    <Section style={{ padding: "28px 32px 0" }}>
      <Text
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 600,
          fontFamily: SERIF_FONT,
          color: "#1c1917",
          lineHeight: "1.25",
          letterSpacing: "-0.02em",
        }}
      >
        {props.children}
      </Text>
    </Section>
  );
}

// ── Content & Footer ──

export function EmailContent(props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Section style={{ ...emailStyles.main, ...props.style }}>
      <Section style={emailStyles.content}>{props.children}</Section>
    </Section>
  );
}

export function EmailFooter(props: {
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
  style?: React.CSSProperties;
}) {
  const { footer } = props;
  const hasLinks =
    footer?.manageUrl || footer?.pauseUrl || footer?.unsubscribeUrl;

  return (
    <Section style={{ ...emailStyles.footerWrap, ...props.style }}>
      {hasLinks ? (
        <Text style={emailStyles.footerLinks}>
          {footer!.manageUrl ? (
            <>
              <Link href={footer!.manageUrl} style={emailStyles.footerLink}>
                Manage preferences
              </Link>
              {footer!.pauseUrl || footer!.unsubscribeUrl ? (
                <span style={emailStyles.footerDivider}>
                  &ensp;&middot;&ensp;
                </span>
              ) : null}
            </>
          ) : null}
          {footer!.pauseUrl ? (
            <>
              <Link href={footer!.pauseUrl} style={emailStyles.footerLink}>
                Pause delivery
              </Link>
              {footer!.unsubscribeUrl ? (
                <span style={emailStyles.footerDivider}>
                  &ensp;&middot;&ensp;
                </span>
              ) : null}
            </>
          ) : null}
          {footer!.unsubscribeUrl ? (
            <Link href={footer!.unsubscribeUrl} style={emailStyles.footerLink}>
              Unsubscribe
            </Link>
          ) : null}
        </Text>
      ) : null}
      <Text style={emailStyles.footerBrand}>
        <Link
          href="https://contentdrip.dev"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Powered by ContentDrip
        </Link>
      </Text>
    </Section>
  );
}

export function EmailButton(props: {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Section style={{ margin: "28px 0", textAlign: "center" as const }}>
      <Button href={props.href} style={{ ...BUTTON_STYLE, ...props.style }}>
        {props.children}
      </Button>
    </Section>
  );
}
