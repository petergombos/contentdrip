import { siteConfig } from "@/config";
import {
  EmailContent,
  EmailFooter,
  EmailHeaderBar,
  EmailHeaderBrandName,
  EmailHeaderMark,
  EmailHeaderTitle,
  EmailLayout,
} from "@/emails/components/email-primitives";

export function EmailShell(props: {
  preview?: string;
  title: string;
  children: React.ReactNode;
  footer?: { unsubscribeUrl?: string; manageUrl?: string; pauseUrl?: string };
  stepIndex?: number;
  totalSteps?: number;
}) {
  return (
    <EmailLayout preview={props.preview}>
      <EmailHeaderBar>
        <EmailHeaderMark>{siteConfig.name[0]}</EmailHeaderMark>
        <EmailHeaderBrandName>{siteConfig.name}</EmailHeaderBrandName>
      </EmailHeaderBar>
      <EmailHeaderTitle>{props.title}</EmailHeaderTitle>
      <EmailContent>{props.children}</EmailContent>
      <EmailFooter footer={props.footer} />
    </EmailLayout>
  );
}
