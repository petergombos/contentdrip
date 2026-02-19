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

// ── Style constants ──

export const emailStyles = {
  body: {
    backgroundColor: "#fafafa",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "40px 0",
    color: "#404040",
  },
  container: {
    margin: "0 auto",
    maxWidth: 560,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    overflow: "hidden" as const,
  },
  header: {
    padding: "20px 32px",
    textAlign: "center" as const,
    borderBottom: "1px solid #e5e5e5",
  },
  headerTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    color: "#737373",
  },
  main: {
    padding: "32px 32px 28px",
  },
  content: {
    fontSize: 14,
    lineHeight: "1.7143",
    color: "#404040",
  },
  footerWrap: {
    borderTop: "1px solid #e5e5e5",
    padding: "20px 32px 28px",
  },
  footerLinks: {
    margin: 0,
    fontSize: 12,
    color: "#a3a3a3",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#a3a3a3",
    textDecoration: "underline",
  },
  footerDivider: {
    color: "#d4d4d4",
  },
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
 * Email <Head> CSS — mirrors Tailwind `prose-sm prose-neutral` so emails
 * and companion pages render markdown consistently.
 *
 * All rules are scoped to `.eb` (email-body) to avoid leaking onto
 * react-email's layout tables.
 *
 * Base: 14px / line-height 1.7143 (≈24px)
 *
 * Palette (neutral):
 *   body #404040 | headings/bold/links/quotes #171717
 *   bullets #d4d4d4 | counters/captions #737373
 *   borders #e5e5e5 | pre-bg #262626 | pre-code #e5e5e5
 */
export const EMAIL_CSS = `
  .eb p { color: #404040; margin: 16px 0; line-height: 1.7143; }
  .eb p:first-child { margin-top: 0; }
  .eb p:last-child { margin-bottom: 0; }
  .eb h1 { color: #171717; font-size: 30px; font-weight: 800; line-height: 1.2; margin: 0 0 24px; }
  .eb h2 { color: #171717; font-size: 20px; font-weight: 700; line-height: 1.4; margin: 32px 0 16px; }
  .eb h2:first-child { margin-top: 0; }
  .eb h3 { color: #171717; font-size: 18px; font-weight: 600; line-height: 1.556; margin: 28px 0 8px; }
  .eb h3:first-child { margin-top: 0; }
  .eb h4 { color: #171717; font-size: 14px; font-weight: 600; line-height: 1.4286; margin: 20px 0 8px; }
  .eb a { color: #171717; text-decoration: underline; font-weight: 500; }
  .eb strong { color: #171717; font-weight: 600; }
  .eb blockquote { color: #171717; font-weight: 500; font-style: italic; border-left: 4px solid #e5e5e5; padding-left: 20px; margin: 24px 0; }
  .eb ul { list-style-type: disc; padding-left: 22px; margin: 16px 0; }
  .eb ol { list-style-type: decimal; padding-left: 22px; margin: 16px 0; }
  .eb li { color: #404040; margin: 4px 0; padding-left: 6px; line-height: 1.7143; }
  .eb hr { border: none; border-top: 1px solid #e5e5e5; margin: 40px 0; }
  .eb hr:first-child { margin-top: 0; }
  .eb hr:last-child { margin-bottom: 0; }
  .eb code { color: #171717; font-size: 12px; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
  .eb pre { color: #e5e5e5; background-color: #262626; font-size: 12px; line-height: 1.667; border-radius: 4px; overflow-x: auto; margin: 20px 0; padding: 8px 12px; }
  .eb pre code { color: inherit; background: none; padding: 0; border-radius: 0; font-size: inherit; font-weight: inherit; line-height: inherit; }
  .eb img { max-width: 100%; height: auto; margin: 24px 0; }
  .eb table { width: 100%; table-layout: auto; font-size: 12px; line-height: 1.5; margin: 16px 0; border-collapse: collapse; }
  .eb thead { border-bottom: 1px solid #d4d4d4; }
  .eb thead th { color: #171717; font-weight: 600; vertical-align: bottom; padding: 0 12px 8px; }
  .eb tbody tr { border-bottom: 1px solid #e5e5e5; }
  .eb tbody td { vertical-align: baseline; padding: 8px 12px; }
  .eb figcaption { color: #737373; font-size: 12px; line-height: 1.333; margin-top: 8px; }
  .eb del { text-decoration: line-through; }
`;

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

// ── Components ──

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

export function EmailHeader(props: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Section style={{ ...emailStyles.header, ...props.style }}>
      <Text style={emailStyles.headerTitle}>{props.children}</Text>
    </Section>
  );
}

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
      <Text
        style={{
          ...emailStyles.footerLinks,
          marginTop: hasLinks ? 8 : 0,
        }}
      >
        Powered by ContentDrip
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
