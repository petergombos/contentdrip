import { NextRequest, NextResponse } from "next/server";
import { stopFromEmailAction } from "@/domains/subscriptions/actions/subscription-actions";
import { EmailService } from "@/domains/mail/services/email-service";
import { createMailAdapter } from "@/domains/mail/create-adapter";
import { resolveBaseUrl } from "@/lib/base-url";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  if (!token || !id) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const result = await stopFromEmailAction({ subscriptionId: id, token });
    if (result?.serverError) {
      return NextResponse.json({ error: result.serverError }, { status: 400 });
    }

    // Create a manage token so the user lands on an authenticated manage page
    const emailService = new EmailService(
      createMailAdapter(),
      resolveBaseUrl(process.env.APP_BASE_URL)
    );
    const { token: manageToken } = await emailService.createToken(id, "MANAGE");
    return NextResponse.redirect(
      new URL(`/manage/${manageToken}?action=unsubscribed&sid=${id}`, request.url)
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
