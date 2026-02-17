import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

const LABEL_TO_LANG: Record<string, string> = {
  terminal: "bash",
  ".env": "bash",
  "project root": "text",
  "subscription lifecycle": "text",
  "dispatch flow": "text",
  "fast-test examples": "bash",
  "subscriptions table": "text",
  "tokens table": "text",
  "sendlog table": "text",
  "rendering pipeline": "text",
  "request body": "json",
  "external cron example": "bash",
};

function inferLang(label?: string): string {
  if (!label) return "text";

  const lower = label.toLowerCase();

  // Check exact matches first
  if (LABEL_TO_LANG[lower]) return LABEL_TO_LANG[lower];

  // Infer from file extension in label
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "tsx";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".env")) return "bash";

  // Infer from label content
  if (lower.includes("interface") || lower.includes("props")) return "tsx";
  if (lower.includes("response") || lower.includes("request")) return "json";
  if (lower.includes("example") && lower.includes("adapter")) return "tsx";

  return "text";
}

export async function CodeBlock({
  label,
  children,
}: {
  label?: string;
  children: string;
}) {
  const lang = inferLang(label);

  const html = await codeToHtml(children, {
    lang,
    theme: "vitesse-dark",
  });

  return (
    <div className="group/code relative border border-[#1a1a1a] bg-[#0a0a0a]">
      {label && (
        <div className="border-b border-[#1a1a1a] px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#444]">
          {label}
        </div>
      )}
      <div className="relative">
        <CopyButton text={children} />
        <div
          className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.8] [&_code]:bg-transparent [&_pre]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
