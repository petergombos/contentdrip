import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { parseMarkdown, parsePageMarkdown } from "@/lib/markdown/renderer";
import { renderEmail } from "@/emails/render";
import { ContentMarkdownEmail } from "@/emails/components/content-markdown-email";
import { getPackByKey } from "@/content-packs/registry";
import "@/content-packs";
import React from "react";

function replacePlaceholders(
  markdown: string,
  baseUrl: string,
  packKey?: string,
  stepSlug?: string
): string {
  const urls: Record<string, string> = {
    "{{confirmUrl}}": `${baseUrl}/confirm/abc123`,
    "{{manageUrl}}": `${baseUrl}/manage/abc123`,
    "{{pauseUrl}}": `${baseUrl}/api/pause?token=abc&id=123`,
    "{{stopUrl}}": `${baseUrl}/api/stop?token=abc&id=123`,
    "{{companionUrl}}": packKey
      ? `${baseUrl}/p/${packKey}/${stepSlug ?? "step"}`
      : `${baseUrl}/p/pack/step`,
    "{{assetUrl}}": packKey
      ? `${baseUrl}/api/content-assets/${packKey}`
      : `${baseUrl}/api/content-assets/pack`,
  };
  let result = markdown;
  for (const [placeholder, url] of Object.entries(urls)) {
    result = result.replaceAll(placeholder, url);
  }
  return result;
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const packKey = searchParams.get("pack");
  const step = searchParams.get("step");
  const system = searchParams.get("system");
  const type = searchParams.get("type"); // "email" (default) or "page"

  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  if (system) {
    // System emails
    const emailPath = join(process.cwd(), "src/emails", `${system}.md`);
    try {
      const raw = readFileSync(emailPath, "utf-8");
      const markdown = replacePlaceholders(raw, baseUrl);
      const parsed = parseMarkdown(markdown);
      const element = React.createElement(ContentMarkdownEmail, {
        title: parsed.frontmatter.subject ?? "Untitled",
        preview: parsed.frontmatter.preview,
        html: parsed.html,
      });
      const rendered = await renderEmail(element);
      return NextResponse.json({
        kind: "email" as const,
        subject: parsed.frontmatter.subject ?? "Untitled",
        preview: parsed.frontmatter.preview ?? "",
        html: rendered.html,
      });
    } catch (err) {
      return NextResponse.json(
        { error: `Failed to render: ${err}` },
        { status: 500 }
      );
    }
  }

  if (!packKey || !step) {
    return NextResponse.json(
      { error: "Provide ?pack=...&step=... or ?system=..." },
      { status: 400 }
    );
  }

  const pack = getPackByKey(packKey);
  if (!pack) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }
  const packStep = pack.steps.find((s) => s.slug === step);
  if (!packStep) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  if (type === "page") {
    // Companion page
    const pageFile = packStep.pageFile ?? packStep.emailFile;
    const pagePath = join(
      process.cwd(),
      "src/content-packs",
      packKey,
      "pages",
      pageFile
    );
    try {
      const raw = readFileSync(pagePath, "utf-8");
      const markdown = raw.replaceAll(
        "{{assetUrl}}",
        `/api/content-assets/${packKey}`
      );
      const parsed = parsePageMarkdown(markdown);
      return NextResponse.json({
        kind: "page" as const,
        frontmatter: parsed.frontmatter,
        html: parsed.html,
      });
    } catch (err) {
      return NextResponse.json(
        { error: `Failed to render page: ${err}` },
        { status: 500 }
      );
    }
  }

  // Pack email
  const emailPath = join(
    process.cwd(),
    "src/content-packs",
    packKey,
    "emails",
    packStep.emailFile
  );
  try {
    const raw = readFileSync(emailPath, "utf-8");
    const markdown = replacePlaceholders(raw, baseUrl, packKey, step);
    const parsed = parseMarkdown(markdown);
    const mockFooter = {
      unsubscribeUrl: "https://preview.example.com/api/stop?token=abc&id=123",
      manageUrl: "https://preview.example.com/manage/abc123",
      pauseUrl: "https://preview.example.com/api/pause?token=abc&id=123",
    };
    const stepIndex = pack.steps.findIndex((s) => s.slug === step);
    const element = React.createElement(ContentMarkdownEmail, {
      title: parsed.frontmatter.subject ?? "Untitled",
      preview: parsed.frontmatter.preview,
      html: parsed.html,
      footer: mockFooter,
      EmailShell: pack.EmailShell,
      stepIndex: stepIndex >= 0 ? stepIndex : undefined,
      totalSteps: pack.steps.length,
    });
    const rendered = await renderEmail(element);
    return NextResponse.json({
      kind: "email" as const,
      subject: parsed.frontmatter.subject ?? "Untitled",
      preview: parsed.frontmatter.preview ?? "",
      html: rendered.html,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to render: ${err}` },
      { status: 500 }
    );
  }
}
