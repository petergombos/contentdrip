import { render } from "@react-email/render";

export async function renderEmail(
  element: React.ReactElement
): Promise<{ html: string; text?: string }> {
  const html = await render(element, { pretty: true });
  // If needed later: build a text version (or keep markdown source as `text`).
  return { html };
}
