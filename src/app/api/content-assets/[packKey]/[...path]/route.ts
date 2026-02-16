import { getPackByKey } from "@/content-packs/registry";
import "@/content-packs";
import { readFileSync, existsSync } from "fs";
import { join, normalize } from "path";
import { NextRequest, NextResponse } from "next/server";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

const CACHE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year (assets are immutable by path)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ packKey: string; path: string[] }> }
) {
  const { packKey, path: pathSegments } = await params;

  // Validate pack exists
  if (!getPackByKey(packKey)) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }

  // Join path segments and normalize to prevent traversal
  const relativePath = normalize(pathSegments.join("/"));
  if (relativePath.startsWith("..") || relativePath.includes("/..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const ext = `.${relativePath.split(".").pop()?.toLowerCase()}`;
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 415 }
    );
  }

  const filePath = join(
    process.cwd(),
    "src/content-packs",
    packKey,
    "assets",
    relativePath
  );

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const file = readFileSync(filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, immutable`,
    },
  });
}
