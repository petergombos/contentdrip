import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { parseMarkdown } from "@/lib/markdown/renderer";
import { renderEmail } from "@/emails/render";
import { ContentMarkdownEmail } from "@/emails/components/content-markdown-email";
import { getPackByKey } from "@/content-packs/registry";
import { createMailAdapter } from "@/domains/mail/create-adapter";
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

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const body = await request.json();
  const { email, pack: packKey, step, system } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email address required" },
      { status: 400 }
    );
  }

  let emailPath: string;
  let pack;

  if (system) {
    emailPath = join(process.cwd(), "src/emails", `${system}.md`);
  } else if (packKey && step) {
    pack = getPackByKey(packKey);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    const packStep = pack.steps.find((s: { slug: string }) => s.slug === step);
    if (!packStep) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }
    emailPath = join(
      process.cwd(),
      "src/content-packs",
      packKey,
      "emails",
      packStep.emailFile
    );
  } else {
    return NextResponse.json(
      { error: "Provide pack+step or system" },
      { status: 400 }
    );
  }

  try {
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const raw = readFileSync(emailPath, "utf-8");
    const markdown = replacePlaceholders(raw, baseUrl, packKey, step);
    const parsed = parseMarkdown(markdown);

    const mockFooter = {
      unsubscribeUrl: "https://preview.example.com/api/stop?token=abc&id=123",
      manageUrl: "https://preview.example.com/manage/abc123",
      pauseUrl: "https://preview.example.com/api/pause?token=abc&id=123",
    };

    const element = system
      ? React.createElement(ContentMarkdownEmail, {
          title: parsed.frontmatter.subject ?? "Untitled",
          preview: parsed.frontmatter.preview,
          html: parsed.html,
        })
      : React.createElement(ContentMarkdownEmail, {
          title: parsed.frontmatter.subject ?? "Untitled",
          preview: parsed.frontmatter.preview,
          html: parsed.html,
          footer: mockFooter,
          EmailShell: pack?.EmailShell,
        });

    const rendered = await renderEmail(element);
    const subject = parsed.frontmatter.subject ?? "Untitled";

    const mailAdapter = createMailAdapter();
    await mailAdapter.send({
      to: email,
      subject: `[Preview] ${subject}`,
      html: rendered.html,
      tag: "preview",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to send: ${err}` },
      { status: 500 }
    );
  }
}
