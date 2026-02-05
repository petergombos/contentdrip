import {
  Body,
  Container,
  Head,
  Heading,
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
  footer?: { unsubscribeUrl?: string; manageUrl?: string };
}) {
  return (
    <Html>
      <Head />
      {props.preview ? <Preview>{props.preview}</Preview> : null}
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.brand}>
            <Text style={styles.brandKicker}>Content Drip</Text>
            <Text style={styles.brandSub}>quiet delivery</Text>
          </Section>

          <Heading style={styles.h1}>{props.title}</Heading>

          <Section style={styles.content}>{props.children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              {props.footer?.manageUrl ? (
                <>
                  <Link href={props.footer.manageUrl}>Manage</Link>
                  {props.footer?.unsubscribeUrl ? " · " : null}
                </>
              ) : null}
              {props.footer?.unsubscribeUrl ? (
                <Link href={props.footer.unsubscribeUrl}>Unsubscribe</Link>
              ) : null}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: "#ffffff",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "24px 0",
    color: "#111827",
  },
  container: {
    margin: "0 auto",
    padding: "0 20px",
    maxWidth: 560,
  },
  brand: {
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 12,
    marginBottom: 18,
  },
  brandKicker: {
    margin: 0,
    fontSize: 14,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b7280",
  },
  brandSub: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#9ca3af",
  },
  h1: {
    fontSize: 24,
    lineHeight: "32px",
    fontWeight: 600,
    margin: "0 0 12px",
    letterSpacing: "-0.01em",
  },
  content: {
    paddingTop: 4,
  },
  footer: {
    borderTop: "1px solid #e5e7eb",
    marginTop: 20,
    paddingTop: 12,
  },
  footerText: {
    margin: 0,
    fontSize: 12,
    color: "#6b7280",
  },
};
