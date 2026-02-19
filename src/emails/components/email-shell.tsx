import { siteConfig } from "@/config";
import {
  EmailContent,
  EmailFooter,
  EmailHeader,
  EmailLayout,
} from "@/emails/components/email-primitives";

export function EmailShell(props: {
  preview?: string;
  title: string;
  children: React.ReactNode;
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
}) {
  return (
    <EmailLayout preview={props.preview}>
      <EmailHeader>{siteConfig.name}</EmailHeader>
      <EmailContent>{props.children}</EmailContent>
      <EmailFooter footer={props.footer} />
    </EmailLayout>
  );
}
