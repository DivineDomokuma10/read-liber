import { strFromU8, unzipSync } from "fflate";

/**
 * DOCX text extraction (V1 scope: text-only, per agreed trade-off).
 *
 * A DOCX is a ZIP of XML; the body lives in word/document.xml with text in
 * <w:t> nodes separated into paragraphs by <w:p>. We unzip, decode, split on
 * paragraph boundaries and concatenate text nodes — no real XML parser, no
 * fidelity beyond text, degrading rather than crashing on odd input.
 */

export const MAX_DOCX_BYTES = 64 * 1024 * 1024;

export class DocxFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocxFormatError";
  }
}

const PARA_BOUNDARY = /<w:p(?:\s[^>]*)?(?:\/)?>|<\/w:p>/g;
const TEXT_NODE = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:t(?:\s[^>]*)?\/>/g;
const TAB = /<w:tab(?:\s[^>]*)?\/>/g;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (raw, hex) => safeCodePoint(parseInt(hex, 16), raw))
    .replace(/&#(\d+);/g, (raw, dec) => safeCodePoint(parseInt(dec, 10), raw))
    .replace(/&(amp|lt|gt|quot|apos);/g, (raw, name) => NAMED_ENTITIES[name] ?? raw);
}

function safeCodePoint(value: number, raw: string): string {
  // RangeError-free: out-of-parse-range references render literally.
  return Number.isFinite(value) && value >= 0 && value <= 0x10ffff
    ? String.fromCodePoint(value)
    : raw;
}

function segmentToText(segment: string): string {
  const flat = segment.replace(TAB, " ");
  let text = "";

  TEXT_NODE.lastIndex = 0;
  let match = TEXT_NODE.exec(flat);
  while (match) {
    text += match[1] ?? "";
    match = TEXT_NODE.exec(flat);
  }

  return decodeXmlEntities(text);
}

/**
 * Extract readable text per paragraph. Throws DocxFormatError for anything
 * that is not a plain Word body (corrupt zip, password-protected, missing
 * document.xml, oversized).
 */
export function extractDocxText(bytes: Uint8Array): string {
  if (bytes.length === 0) {
    return "";
  }

  if (bytes.length > MAX_DOCX_BYTES) {
    throw new DocxFormatError("This Word document is too large to open.");
  }

  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes);
  } catch {
    throw new DocxFormatError(
      "This file isn't a valid Word document (or is password-protected).",
    );
  }

  const body = files["word/document.xml"];
  if (!body) {
    throw new DocxFormatError(
      "This file has no readable Word body text.",
    );
  }

  const xml = strFromU8(body);
  return xml.split(PARA_BOUNDARY).map(segmentToText).join("\n\n");
}
