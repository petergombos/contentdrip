import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function EmailShell(props: {
  preview?: string;
  title: string;
  children: React.ReactNode;
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
}) {
  return (
    <Html>
      <Head>
        <style>{`
          img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
          h2 { font-size: 20px; font-weight: 600; margin: 32px 0 12px; color: #2c2418; font-family: Georgia, 'Times New Roman', serif; }
          h3 { font-size: 17px; font-weight: 600; margin: 24px 0 8px; color: #2c2418; }
          blockquote { border-left: 2px solid #c4956a; padding-left: 16px; margin: 20px 0; color: #6b5c4d; font-style: italic; }
          a { color: #8b6834; }
          ul, ol { padding-left: 24px; margin: 12px 0; }
          li { margin-bottom: 8px; line-height: 26px; color: #4a3f33; }
          hr { border: none; border-top: 1px solid #e8e2d9; margin: 28px 0; }
          strong { color: #2c2418; }
        `}</style>
      </Head>
      {props.preview ? <Preview>{props.preview}</Preview> : null}
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Brand */}
          <Section style={styles.brand}>
            <Text style={styles.brandName}>ContentDrip</Text>
          </Section>

          {/* Title */}
          <Heading style={styles.h1}>{props.title}</Heading>

          {/* Content */}
          <Section style={styles.content}>{props.children}</Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.footerLinks}>
              {props.footer?.manageUrl ? (
                <>
                  <Link
                    href={props.footer.manageUrl}
                    style={styles.footerLink}
                  >
                    Manage preferences
                  </Link>
                  {props.footer?.pauseUrl || props.footer?.unsubscribeUrl ? (
                    <span style={styles.footerDivider}>&ensp;&middot;&ensp;</span>
                  ) : null}
                </>
              ) : null}
              {props.footer?.pauseUrl ? (
                <>
                  <Link href={props.footer.pauseUrl} style={styles.footerLink}>
                    Pause delivery
                  </Link>
                  {props.footer?.unsubscribeUrl ? (
                    <span style={styles.footerDivider}>&ensp;&middot;&ensp;</span>
                  ) : null}
                </>
              ) : null}
              {props.footer?.unsubscribeUrl ? (
                <Link
                  href={props.footer.unsubscribeUrl}
                  style={styles.footerLink}
                >
                  Unsubscribe
                </Link>
              ) : null}
            </Text>
            <Text style={styles.footerNote}>
              Sent with care by ContentDrip
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#f8f5f0",
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    margin: 0,
    padding: "40px 0",
    color: "#2c2418",
  },
  container: {
    margin: "0 auto",
    padding: "0 28px",
    maxWidth: 560,
  },
  brand: {
    paddingBottom: 16,
    marginBottom: 28,
    borderBottom: "1px solid #e8e2d9",
  },
  brandName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "#8b6834",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  h1: {
    fontSize: 28,
    lineHeight: "36px",
    fontWeight: 700,
    margin: "0 0 20px",
    color: "#2c2418",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  content: {
    fontSize: 16,
    lineHeight: "28px",
    color: "#4a3f33",
  },
  footer: {
    marginTop: 12,
  },
  hr: {
    borderColor: "#e8e2d9",
    margin: "28px 0",
  },
  footerLinks: {
    margin: "0 0 8px",
    fontSize: 12,
    color: "#8b8078",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#8b8078",
    textDecoration: "underline",
  },
  footerDivider: {
    color: "#d4cdc4",
  },
  footerNote: {
    margin: 0,
    fontSize: 11,
    color: "#b5ada4",
    textAlign: "center" as const,
  },
};
