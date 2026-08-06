import mammoth from "mammoth"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { PDFParse } from "pdf-parse"

// Post content is capped at 200k by postDraftSchema; leave a little headroom.
const MAX_CONTENT = 199_000

/** Convert a Word (.docx) buffer into Markdown. */
export async function docxToMarkdown(buffer: Buffer): Promise<string> {
  const { value: html } = await mammoth.convertToHtml({ buffer })
  let md = NodeHtmlMarkdown.translate(html)
  // mammoth embeds images as base64 data URIs — strip them so a single doc
  // can't blow past the content limit (authors add images via the editor).
  md = md.replace(/!\[[^\]]*\]\(data:[^)]*\)/g, "")
  return tidy(md)
}

/** Extract text from a PDF buffer as lightly-formatted Markdown. */
export async function pdfToMarkdown(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const res = await parser.getText()
    // Drop pdf-parse's per-page separators, e.g. "-- 1 of 3 --".
    const text = res.text.replace(/^-- \d+ of \d+ --$/gm, "")
    return tidy(text)
  } finally {
    await parser.destroy()
  }
}

function tidy(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CONTENT)
}
