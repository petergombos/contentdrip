import React from "react";
import { Section } from "@react-email/components";
import { EmailShell as DefaultEmailShell } from "@/emails/components/email-shell";
import type { PackEmailShellProps } from "@/content-packs/registry";

export function ContentMarkdownEmail(props: {
  title: string;
  preview?: string;
  html: string;
  footer?: { unsubscribeUrl?: string; manageUrl?: string };
  EmailShell?: React.ComponentType<PackEmailShellProps>;
}) {
  const Shell = props.EmailShell ?? DefaultEmailShell;

  return (
    <Shell title={props.title} preview={props.preview} footer={props.footer}>
      {/* Rendered markdown HTML (already sanitized by our renderer pipeline). */}
      <Section dangerouslySetInnerHTML={{ __html: props.html }} />
    </Shell>
  );
}
