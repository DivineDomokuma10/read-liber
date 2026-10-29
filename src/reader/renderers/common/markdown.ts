/**
 * Minimal Markdown reader-parser (spec:23) — headings, paragraphs, lists,
 * links, emphasis, code blocks, quotes, rules. Everything else (tables,
 * images, inline HTML) degrades to plain text instead of failing.
 *
 * Total function by construction: no input makes it throw; malformed
 * constructs render as literal text.
 */

export type InlineSpan =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

export type MdBlock =
  | { kind: "heading"; level: number; spans: InlineSpan[] }
  | { kind: "paragraph"; spans: InlineSpan[] }
  | {
      kind: "listItem";
      ordered: boolean;
      label: string;
      indent: number;
      spans: InlineSpan[];
    }
  | { kind: "code"; text: string; lang: string | null }
  | { kind: "quote"; spans: InlineSpan[] }
  | { kind: "rule" };

const ATX_HEADING = /^(#{1,6})\s+(.+)$/;
const FENCE = /^(`{3,}|~{3,})\s*(\S*)\s*$/;
const LIST_ITEM = /^(\s*)([*+-]|\d{1,9}[.)])\s+(.+)$/;
const QUOTE = /^> ?(.*)$/;
const RULE = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const INDENT_WIDTH = 2;

/**
 * `code` runs first so markers inside code never get treated as syntax.
 * Every regex here is global: parseInlinePass loops on exec() and relies on
 * lastIndex advancing — a non-global regex would return the same first
 * match forever (JS-thread freeze on open).
 */
const INLINE_CODE = /`([^`\n]+)`/g;
const LINK = /\[([^\]\n]+)\]\(([^()\s]+)\)/g;
const STRONG_STAR = /\*\*([^*\n]+)\*\*/g;
const STRONG_UNDER = /__([^_\n]+)__/g;
const EM_STAR = /\*([^*\n]+)\*/g;
const EM_UNDER = /(^|[^A-Za-z0-9_])_([^_\n]+)_(?![A-Za-z0-9])/g;

function parseInlinePass(
  tokens: InlineSpan[],
  regex: RegExp,
  map: (match: RegExpExecArray) => InlineSpan[],
): InlineSpan[] {
  const out: InlineSpan[] = [];

  for (const token of tokens) {
    if (token.type !== "text") {
      out.push(token);
      continue;
    }

    let cursor = 0;
    const plain = token.text;
    regex.lastIndex = 0;
    let match = regex.exec(plain);

    while (match) {
      if (cursor < match.index) {
        out.push({ type: "text", text: plain.slice(cursor, match.index) });
      }
      out.push(...map(match));
      cursor = match.index + match[0].length;
      if (match[0].length === 0) {
        // Zero-length match with a global regex never advances lastIndex on
        // its own — bump manually and stop at end of input.
        regex.lastIndex += 1;
        if (regex.lastIndex > plain.length) {
          break;
        }
      }
      match = regex.exec(plain);
    }

    if (cursor < plain.length) {
      out.push({ type: "text", text: plain.slice(cursor) });
    }
  }

  return out;
}

/**
 * Layered single sweeps isolate the constructs; unmatched markers survive
 * as literal text, which keeps broken markdown readable.
 */
export function parseInline(raw: string): InlineSpan[] {
  const code = parseInlinePass(
    [{ type: "text", text: raw }],
    INLINE_CODE,
    (m) => [{ type: "code", text: m[1] ?? "" }],
  );

  const linked = parseInlinePass(code, LINK, (m) => [
    { type: "link", text: m[1] ?? "", href: m[2] ?? "" },
  ]);

  const bold = parseInlinePass(
    linked,
    STRONG_STAR,
    (m) => [{ type: "strong", text: m[1] ?? "" }],
  );
  const boldBoth = parseInlinePass(
    bold,
    STRONG_UNDER,
    (m) => [{ type: "strong", text: m[1] ?? "" }],
  );

  const em = parseInlinePass(boldBoth, EM_STAR, (m) => [
    { type: "em", text: m[1] ?? "" },
  ]);
  return parseInlinePass(
    em,
    EM_UNDER,
    (m) => [
      { type: "text", text: m[1] ?? "" },
      { type: "em", text: m[2] ?? "" },
    ],
  );
}

export function parseMarkdown(text: string): MdBlock[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];

  let paragraph: string[] = [];
  let quote: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let fenceToken: string | null = null;
  let codeLang: string | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }
    blocks.push({ kind: "paragraph", spans: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) {
      return;
    }
    blocks.push({ kind: "quote", spans: parseInline(quote.join(" ")) });
    quote = [];
  };

  for (const line of lines) {
    if (inCode) {
      const close = FENCE.exec(line);
      if (close && close[1]?.[0] === (fenceToken ?? "").trim()[0]) {
        inCode = false;
        blocks.push({ kind: "code", text: codeLines.join("\n"), lang: codeLang });
        codeLines = [];
        fenceToken = codeLang = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      flushParagraph();
      flushQuote();
      inCode = true;
      fenceToken = fence[1] ?? "```";
      codeLang = fence[2] || null;
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushQuote();
      continue;
    }

    const heading = ATX_HEADING.exec(line);
    if (heading) {
      flushParagraph();
      flushQuote();
      blocks.push({
        kind: "heading",
        level: (heading[1] as string).length,
        spans: parseInline((heading[2] as string).trim()),
      });
      continue;
    }

    if (RULE.test(line)) {
      flushParagraph();
      flushQuote();
      blocks.push({ kind: "rule" });
      continue;
    }

    const quoted = QUOTE.exec(line);
    if (quoted) {
      flushParagraph();
      quote.push((quoted[1] as string).trim());
      continue;
    }
    flushQuote();

    const item = LIST_ITEM.exec(line);
    if (item) {
      flushParagraph();
      const marker = item[2] as string;
      const indent = Math.floor((item[1] as string).replace(/\t/g, "  ").length / INDENT_WIDTH);
      const ordered = /\d/.test(marker[0]);
      const label = ordered ? marker.replace(/[.)]$/, ".") : marker;
      blocks.push({
        kind: "listItem",
        ordered,
        label,
        indent,
        spans: parseInline((item[3] as string).trim()),
      });
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) {
    blocks.push({ kind: "code", text: codeLines.join("\n"), lang: codeLang });
  }
  flushParagraph();
  flushQuote();

  return blocks;
}
