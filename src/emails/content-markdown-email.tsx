import React from "react";
import { Section } from "@react-email/components";
import { EmailShell } from "@/emails/components/email-shell";

export function ContentMarkdownEmail(props: {
  title: string;
  preview?: string;
  html: string;
  footer?: { unsubscribeUrl?: string; manageUrl?: string };
}) {
  return (
    <EmailShell title={props.title} preview={props.preview} footer={props.footer}>
      {/* Rendered markdown HTML (already sanitized by our renderer pipeline). */}
      <Section dangerouslySetInnerHTML={{ __html: props.html }} />
    </EmailShell>
  );
}
