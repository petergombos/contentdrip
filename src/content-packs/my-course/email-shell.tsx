import type { PackEmailShellProps } from "@/content-packs/registry";
import {
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailLayout,
} from "@/emails/components/email-primitives";

export function StarterEmailShell(props: PackEmailShellProps) {
  return (
    <EmailLayout preview={props.preview}>
      <EmailHeader>The Art of Doing Absolutely Nothing</EmailHeader>
      <EmailContent>{props.children}</EmailContent>
      <EmailFooter footer={props.footer} />
    </EmailLayout>
  );
}
