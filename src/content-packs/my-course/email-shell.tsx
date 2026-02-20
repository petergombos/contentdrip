import { siteConfig } from "@/config";
import type { PackEmailShellProps } from "@/content-packs/registry";
import {
  EmailColumn,
  EmailContent,
  EmailFooter,
  EmailHeaderBar,
  EmailHeaderBrandName,
  EmailHeaderCourseName,
  EmailHeaderMark,
  EmailHeaderProgress,
  EmailHeaderTitle,
  EmailLayout,
  EmailRow,
} from "@/emails/components/email-primitives";

// ✏️ Update the course name below to match your course.
//    brandName / brandInitial come from siteConfig (your site identity).
//    You can also add a logo image inside <EmailHeaderBar> using <img>.
const COURSE_NAME = "How to Write an Email Course";

export function StarterEmailShell(props: PackEmailShellProps) {
  return (
    <EmailLayout preview={props.preview}>
      <EmailHeaderBar>
        <EmailRow>
          <EmailColumn>
            <EmailHeaderMark>{siteConfig.name[0]}</EmailHeaderMark>
            <EmailHeaderBrandName>{siteConfig.name}</EmailHeaderBrandName>
            <EmailHeaderCourseName>{COURSE_NAME}</EmailHeaderCourseName>
          </EmailColumn>
          <EmailColumn align="right">
            <EmailHeaderProgress
              stepIndex={props.stepIndex}
              totalSteps={props.totalSteps}
            />
          </EmailColumn>
        </EmailRow>
      </EmailHeaderBar>
      <EmailHeaderTitle>{props.title}</EmailHeaderTitle>
      <EmailContent>{props.children}</EmailContent>
      <EmailFooter footer={props.footer} />
    </EmailLayout>
  );
}
