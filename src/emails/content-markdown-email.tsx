import React from "react";
import { Section } from "@react-email/components";
import { EmailShell as DefaultEmailShell } from "@/emails/components/email-shell";
import type { PackEmailShellProps } from "@/content-packs/registry";

export function ContentMarkdownEmail(props: {
  title: string;
  preview?: string;
  html: string;
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
  EmailShell?: React.ComponentType<PackEmailShellProps>;
}) {
  const Shell = props.EmailShell ?? DefaultEmailShell;

  return (
    <Shell title={props.title} preview={props.preview} footer={props.footer}>
      {/* NOTE: @react-email/components Section doesn't reliably support dangerouslySetInnerHTML.
          Wrap the raw HTML in a plain div inside a Section instead. */}
      <Section>
        <div dangerouslySetInnerHTML={{ __html: props.html }} />
      </Section>
    </Shell>
  );
}
