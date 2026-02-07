import { Button, Section, Text } from "@react-email/components";
import { EmailShell } from "@/emails/components/email-shell";

export function ManageLinkEmail(props: { manageUrl: string }) {
  return (
    <EmailShell
      title="Manage Your Subscription"
      preview="Your secure management link (expires in 24 hours)"
    >
      <Text
        style={{
          margin: "0 0 20px",
          fontSize: 16,
          lineHeight: "28px",
          color: "#4a3f33",
        }}
      >
        Use the button below to update your delivery schedule, pause
        deliveries, or unsubscribe. This link is valid for 24 hours.
      </Text>

      <Section style={{ margin: "28px 0", textAlign: "center" as const }}>
        <Button
          href={props.manageUrl}
          style={{
            background: "#8b6834",
            color: "#fffdf9",
            padding: "14px 32px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Open Preferences
        </Button>
      </Section>

      <Text
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: "22px",
          color: "#b5ada4",
        }}
      >
        If you didn&apos;t request this link, you can safely ignore this email.
        Your subscription will continue unchanged.
      </Text>
    </EmailShell>
  );
}
