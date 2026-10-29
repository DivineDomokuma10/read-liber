/**
 * DOCX block model builder — turns `word/document.xml` into typed blocks
 * the renderer can lay out (spec: docx tables + images + charts as data).
 *
 * Runs on the zero-dep stream scanner (./xml), tracking just enough
 * nesting state to walk OOXML: body paragraphs/cells, one table level,
 * textbox-in-paragraph, and namespace-tolerant style name lookup
 * (Word/LibreOffice/Google Docs pStyle spellings differ).
 *
 * Degradation rules (total function, mirrors markdown.ts):
 * - nested tables flatten into their outer cell as text
 * - equations (OMML) linearize automatically — their text nodes stream
 * - instrText (field commands), VML metadata and shape geometry are noise
 * - SmartArt/OLE embeds become labeled placeholder blocks (their content
 *   lives in separate parts, not in document.xml)
 */

import { getAttr, scanXml, type XmlAttrs, type XmlHandler } from "./xml";

export type DocxBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "table"; header: boolean; rows: string[][] }
  | { kind: "image"; rid: string; caption: string | null }
  | { kind: "chart"; rid: string; caption: string | null }
  | { kind: "placeholder"; label: string };

type Buffer = string[];

type Ctx = {
  blocks: DocxBlock[];
  stack: string[];

  /** One level only: nested tables flatten into their outer cell. */
  nestedTableDepth: number;
  table: string[][] | null;
  row: string[] | null;
  rowMarkedHeader: boolean;
  tableHeaderMarked: boolean;
  /** Column span (`w:gridSpan`) of the cell currently being built. */
  pendingSpan: number;
  cellActive: boolean;
  cellText: Buffer;

  paraActive: boolean;
  paraText: Buffer;
  paraStyle: string | null;

  /** Field command text (TOC/page numbers) is noise — suppressed. */
  skipText: boolean;

  /** Whitespace-only runs become a single space before the next content. */
  pendingSpace: boolean;

  /** Index of the last pushed image/chart block that can take a caption. */
  captionCandidate: number | null;
};

/** `Heading_20_2` (LibreOffice) / `Heading2` (Word) / `Title` / `h2`. */
function styleHeadingLevel(styleKey: string): number | null {
  const heading = /^heading(20)?([1-6])$/.exec(styleKey);
  if (heading) {
    return Number(heading[2] ?? 1);
  }
  return /^(title|headingtitle)$/.test(styleKey) ? 1 : null;
}

function bufferLastChar(buffer: Buffer): string | undefined {
  const last = buffer[buffer.length - 1];
  return last === undefined ? undefined : last[last.length - 1];
}

/**
 * Collapses runs into rendered text: whitespace-only runs become one
 * space (unless a neighbor already has one), content runs flow as-is.
 */
function appendChunk(ctx: Ctx, buffer: Buffer, text: string): void {
  if (!/\S/.test(text)) {
    if (buffer.length > 0) {
      ctx.pendingSpace = true;
    }
    return;
  }

  if (ctx.pendingSpace) {
    ctx.pendingSpace = false;
    const last = bufferLastChar(buffer);
    if (last !== undefined && last !== " " && last !== "\n" && !/^\s/.test(text)) {
      buffer.push(" ");
    }
  }
  buffer.push(text);
}

/**
 * Parses the body text of `document.xml` into renderable blocks. Never
 * throws; unreadable constructs degrade per the rules in the header.
 */
export function parseDocxBlocks(documentXml: string): DocxBlock[] {
  const ctx: Ctx = {
    blocks: [],
    stack: [],
    nestedTableDepth: 0,
    table: null,
    row: null,
    rowMarkedHeader: false,
    tableHeaderMarked: false,
    pendingSpan: 1,
    cellActive: false,
    cellText: [],
    paraActive: false,
    paraText: [],
    paraStyle: null,
    skipText: false,
    pendingSpace: false,
    captionCandidate: null,
  };

  const handler: XmlHandler = {
    onOpen: (name, attrs, selfClosed) => {
      ctx.stack.push(name);
      handleOpen(ctx, name, attrs, selfClosed);
      if (selfClosed) {
        ctx.stack.pop();
      }
    },
    onClose: (name) => {
      ctx.stack.pop();
      handleClose(ctx, name);
    },
    onText: (text) => {
      if (ctx.skipText) {
        return;
      }
      if (ctx.paraActive) {
        appendChunk(ctx, ctx.paraText, text);
      }
      // Text outside paragraphs is OOXML structural noise — ignored. Nested
      // table text is intentionally NOT gated: it flows into the enclosing
      // cell buffer, realizing the flatten-to-text degradation.
    },
  };

  scanXml(documentXml, handler);
  return ctx.blocks;
}

function handleOpen(
  ctx: Ctx,
  name: string,
  attrs: XmlAttrs,
  selfClosed: boolean,
): void {
  switch (name) {
    case "p":
      // Any paragraph close flushes the accumulator; textbox-internal
      // paragraphs just split the flow into readable chunks.
      flushParagraph(ctx);
      ctx.paraActive = true;
      if (selfClosed) {
        ctx.paraActive = false;
      }
      return;

    case "tbl":
      if (ctx.table !== null) {
        ctx.nestedTableDepth += 1;
        if (selfClosed) {
          ctx.nestedTableDepth -= 1;
        }
        return;
      }
      ctx.table = [];
      return;

    case "tr":
      if (ctx.table !== null && ctx.nestedTableDepth === 0) {
        ctx.row = [];
        ctx.rowMarkedHeader = false;
        ctx.pendingSpan = 1;
      }
      return;

    case "tc":
      if (ctx.table !== null && ctx.nestedTableDepth === 0) {
        ctx.cellActive = true;
        ctx.cellText = [];
        ctx.pendingSpan = 1;
      }
      return;

    case "gridSpan":
      if (ctx.cellActive && ctx.row !== null) {
        const spanVal = Number.parseInt(getAttr(attrs, "val") ?? "", 10);
        if (Number.isInteger(spanVal) && spanVal > 1) {
          ctx.pendingSpan = spanVal;
        }
      }
      return;

    case "tblHeader":
      if (ctx.row !== null) {
        ctx.rowMarkedHeader = true;
      }
      return;

    case "pStyle":
      if (ctx.paraActive) {
        ctx.paraStyle = getAttr(attrs, "val") ?? ctx.paraStyle;
      }
      return;

    case "tab":
      if (ctx.paraActive) {
        appendChunk(ctx, ctx.paraText, " ");
      }
      return;

    case "br":
      if (ctx.paraActive) {
        ctx.paraText.push("\n");
        ctx.pendingSpace = false;
      }
      return;

    case "instrText":
      ctx.skipText = !selfClosed;
      return;

    case "blip":
      attachInline(ctx, "image", getAttr(attrs, "embed"));
      return;

    // Legacy Word drawings pre-2007 (VML wordart/shapes conversions).
    case "imagedata":
      attachInline(ctx, "image", getAttr(attrs, "id") ?? getAttr(attrs, "r:id") ?? getAttr(attrs, "vmlid"));
      return;

    case "chart":
      attachInline(ctx, "chart", getAttr(attrs, "id") ?? getAttr(attrs, "r:id"));
      return;

    case "relIds":
      flushParagraph(ctx);
      ctx.blocks.push({ kind: "placeholder", label: "SmartArt not viewable" });
      ctx.captionCandidate = null;
      return;

    case "OLEObject":
      flushParagraph(ctx);
      ctx.blocks.push({ kind: "placeholder", label: "Embedded object not viewable" });
      ctx.captionCandidate = null;
      return;
  }
}

/** Inlines an image/chart rid into the reading flow: flush, push, continue. */
function attachInline(
  ctx: Ctx,
  kind: "image" | "chart",
  rid: string | undefined,
): void {
  if (!rid) {
    return;
  }
  flushParagraph(ctx);
  const block: DocxBlock =
    kind === "image"
      ? { kind: "image", rid, caption: null }
      : { kind: "chart", rid, caption: null };
  ctx.blocks.push(block);
  ctx.captionCandidate = ctx.blocks.length - 1;
}

function handleClose(ctx: Ctx, name: string): void {
  switch (name) {
    case "p":
      if (ctx.paraActive) {
        flushParagraph(ctx);
        ctx.paraActive = false;
      }
      return;

    case "tc":
      if (ctx.table !== null && ctx.nestedTableDepth === 0 && ctx.cellActive) {
        ctx.row?.push(ctx.cellText.join(""));
        for (let i = 1; i < ctx.pendingSpan; i += 1) {
          ctx.row?.push("");
        }
        ctx.cellActive = false;
      }
      return;

    case "tr":
      if (ctx.table !== null && ctx.nestedTableDepth === 0 && ctx.row !== null) {
        ctx.table.push(ctx.row);
        if (ctx.rowMarkedHeader) {
          ctx.tableHeaderMarked = true;
        }
        ctx.row = null;
      }
      return;

    case "tbl":
      if (ctx.nestedTableDepth > 0) {
        ctx.nestedTableDepth -= 1;
        return;
      }
      if (ctx.table !== null) {
        pushTable(ctx);
        ctx.table = null;
        ctx.row = null;
      }
      return;

    case "instrText":
      ctx.skipText = false;
      return;
  }
}

/** One-level grids only: header = any `tblHeader` row, else multi-row tables. */
function pushTable(ctx: Ctx): void {
  const rows = ctx.table ?? [];
  if (rows.length === 0) {
    return;
  }
  ctx.blocks.push({
    kind: "table",
    header: ctx.tableHeaderMarked || rows.length > 1,
    rows,
  });
  ctx.tableHeaderMarked = false;
}

/**
 * Emits the accumulated paragraph as a block (or as cell text, or as a
 * caption on the last image/chart).
 */
function flushParagraph(ctx: Ctx): void {
  const text = ctx.paraText.join("").trim();
  ctx.paraText = [];
  ctx.pendingSpace = false;
  const styleKey = (ctx.paraStyle ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  ctx.paraStyle = null;

  if (!text) {
    return;
  }

  if (ctx.cellActive) {
    if (ctx.cellText.length > 0) {
      ctx.cellText.push("\n");
    }
    ctx.cellText.push(text);
    return;
  }

  const heading = styleHeadingLevel(styleKey);
  if (heading !== null) {
    ctx.blocks.push({ kind: "heading", level: heading, text });
    ctx.captionCandidate = null;
    return;
  }

  if (styleKey === "caption") {
    const candidate = ctx.captionCandidate === null ? null : ctx.blocks[ctx.captionCandidate];
    if (candidate && (candidate.kind === "image" || candidate.kind === "chart") && candidate.caption === null) {
      candidate.caption = text;
      ctx.captionCandidate = null;
      return;
    }
  }

  /**
   * Keep the caption candidate across ordinary paragraph chunks: Word puts
   * the image inside a paragraph, so closingChunk paragraphs of that same
   * body block must not invalidate the pending attachment.
   */
  ctx.blocks.push({ kind: "paragraph", text });
}
