import { NextRequest, NextResponse } from "next/server";
import { stopFromEmailAction } from "@/domains/subscriptions/actions/subscription-actions";

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
    return NextResponse.redirect(new URL("/?unsubscribed=true", request.url));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
