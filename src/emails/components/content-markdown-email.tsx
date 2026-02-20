import React from "react";
import { EmailShell as DefaultEmailShell } from "@/emails/components/email-shell";
import type { PackEmailShellProps } from "@/content-packs/registry";

export function ContentMarkdownEmail(props: {
  title: string;
  preview?: string;
  html: string;
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
  EmailShell?: React.ComponentType<PackEmailShellProps>;
  stepIndex?: number;
  totalSteps?: number;
}) {
  const Shell = props.EmailShell ?? DefaultEmailShell;

  return (
    <Shell
      title={props.title}
      preview={props.preview}
      footer={props.footer}
      stepIndex={props.stepIndex}
      totalSteps={props.totalSteps}
    >
      <div className="eb" dangerouslySetInnerHTML={{ __html: props.html }} />
    </Shell>
  );
}
