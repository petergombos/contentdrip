import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { DarkTemplate, WarmTemplate, loadFonts } from "@/lib/og";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const type = searchParams.get("type") ?? "default";
  const title = searchParams.get("title") ?? "ContentDrip";
  const description = searchParams.get("description") ?? undefined;
  const label = searchParams.get("label") ?? undefined;

  const fonts = await loadFonts(origin);

  const node =
    type === "landing" ? (
      <WarmTemplate title={title} description={description} />
    ) : (
      <DarkTemplate title={title} description={description} label={label} />
    );

  return new ImageResponse(node, {
    width: 1200,
    height: 630,
    fonts,
  });
}
