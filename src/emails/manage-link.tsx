import { Button, Section, Text } from "@react-email/components";
import { EmailShell } from "@/emails/components/email-shell";

export function ManageLinkEmail(props: { manageUrl: string }) {
  return (
    <EmailShell
      title="Manage your subscription"
      preview="Your management link (expires in 24 hours)."
    >
      <Text style={{ margin: "0 0 14px", fontSize: 14, lineHeight: "22px" }}>
        Use the button below to update your delivery schedule or unsubscribe.
      </Text>

      <Section style={{ margin: "18px 0" }}>
        <Button
          href={props.manageUrl}
          style={{
            background: "#111827",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Open preferences
        </Button>
      </Section>

      <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: "#6b7280" }}>
        This link expires in 24 hours.
      </Text>
    </EmailShell>
  );
}
