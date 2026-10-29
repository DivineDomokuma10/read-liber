/**
 * DOCX two-pass extraction — inflates ONLY what the renderer needs.
 *
 * Pass 1 inflates `word/document.xml` + its relationships, builds the
 * block model, and discovers which media/chart parts are actually
 * referenced. Pass 2 inflates only those parts, gated per-entry by size
 * caps *before* decompression (fflate's filter receives `originalSize`,
 * so oversized media never gets inflated at all). Media that usually
 * dominates archive size is the point: skipping it keeps the whole parse
 * inside JS-thread budget for a smooth loader.
 *
 * Degradation: unreadable media corrupts nothing — caps silently skip
 * oversized content and the text/tables still render.
 */

import { strFromU8, unzipSync, type UnzipFileInfo } from "fflate";

import { parseDocxBlocks, type DocxBlock } from "./blocks";
import { getAttr, scanXml, type XmlAttrs } from "./xml";

export const MAX_DOCX_BYTES = 64 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_MEDIA_BYTES = 30 * 1024 * 1024;

const DOCUMENT_XML = "word/document.xml";
const RELS_XML = "word/_rels/document.xml.rels";

export class DocxFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocxFormatError";
  }
}

export type DocxMediaItem = {
  /** Canonical zip entry name, e.g. `word/media/image1.png`. */
  name: string;
  bytes: Uint8Array;
};

export type DocxDocument = {
  blocks: DocxBlock[];
  /** rId → inflated media bytes for image blocks. */
  media: Map<string, DocxMediaItem>;
  /** rId → inflated chart part XML for chart blocks. */
  charts: Map<string, string>;
  /** Images skipped by the size caps (count, for UX messaging). */
  skippedImages: number;
};

type Rel = {
  target: string;
  kind: "image" | "chart" | "other";
};

/** Relationship attrs are usually capitalized — cover both spellings. */
function attr(attrs: XmlAttrs, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = getAttr(attrs, name);
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function parseRels(relsXml: string): Map<string, Rel> {
  const rels = new Map<string, Rel>();
  scanXml(relsXml, {
    onOpen: (name, attrs) => {
      // Part names in _rels files are capitalized (`Relationship`) while the
      // document body is lowercase (`w:t`) — match case-insensitively.
      if (name.toLowerCase() !== "relationship") {
        return;
      }
      const id = attr(attrs, "Id", "id");
      const target = attr(attrs, "Target", "target");
      if (!id || !target) {
        return;
      }
      const mode = attr(attrs, "TargetMode", "targetmode");
      if (mode && mode.toLowerCase() === "external") {
        return;
      }
      const type = attr(attrs, "Type", "type") ?? "";
      const kind: Rel["kind"] = type.includes("/image")
        ? "image"
        : type.includes("/chart")
          ? "chart"
          : "other";
      rels.set(id, { target, kind });
    },
  });
  return rels;
}

/** Rel targets are relative to `word/`; root-relative targets start with `/`. */
function resolveEntryName(target: string): string {
  return target.startsWith("/") ? target.slice(1) : `word/${target}`;
}

/** unzipSync throws on exotic codecs — only native/stored entries pass. */
function isInflatable(info: UnzipFileInfo): boolean {
  return info.compression === 0 || info.compression === 8;
}

export function extractDocxDocument(zipBytes: Uint8Array): DocxDocument {
  if (zipBytes.length > MAX_DOCX_BYTES) {
    throw new DocxFormatError("This Word document is too large to open.");
  }

  let firstPass: Record<string, Uint8Array>;
  try {
    firstPass = unzipSync(zipBytes, {
      filter: (info) => isInflatable(info) && (info.name === DOCUMENT_XML || info.name === RELS_XML),
    });
  } catch {
    throw new DocxFormatError(
      "This file isn't a valid Word document (or is password-protected).",
    );
  }

  const documentXml = firstPass[DOCUMENT_XML];
  if (!documentXml) {
    throw new DocxFormatError("This file has no readable Word body text.");
  }

  const document = strFromU8(documentXml);
  const blocks = parseDocxBlocks(document);
  const rels = parseRels(firstPass[RELS_XML] ? strFromU8(firstPass[RELS_XML]) : "");

  const wantedMedia = new Set<string>();
  const wantedCharts = new Set<string>();
  for (const block of blocks) {
    const rel = "rid" in block ? rels.get(block.rid) : undefined;
    if (!rel) {
      continue;
    }
    const entryName = resolveEntryName(rel.target);
    if (block.kind === "image" && rel.kind === "image") {
      wantedMedia.add(entryName);
    } else if (block.kind === "chart" && rel.kind === "chart") {
      wantedCharts.add(entryName);
    }
  }

  const media = new Map<string, DocxMediaItem>();
  const charts = new Map<string, string>();
  let skippedImages = 0;

  if (wantedMedia.size > 0 || wantedCharts.size > 0) {
    let totalMediaBytes = 0;
    let secondPass: Record<string, Uint8Array> = {};
    try {
      secondPass = unzipSync(zipBytes, {
        filter: (info) => {
          if (!isInflatable(info)) {
            return false;
          }
          if (wantedMedia.has(info.name)) {
            const oversize =
              info.originalSize > MAX_IMAGE_BYTES ||
              totalMediaBytes + info.originalSize > MAX_TOTAL_MEDIA_BYTES;
            if (oversize) {
              skippedImages += 1;
              return false;
            }
            totalMediaBytes += info.originalSize;
            return true;
          }
          return wantedCharts.has(info.name);
        },
      });
    } catch {
      // Media surface is best-effort: a corrupt part never kills the text.
      secondPass = {};
    }

    const ridToName = new Map<string, string>();
    for (const [rid, rel] of rels) {
      const entryName = resolveEntryName(rel.target);
      if (rel.kind === "image" && wantedMedia.has(entryName)) {
        ridToName.set(rid, entryName);
      } else if (rel.kind === "chart" && wantedCharts.has(entryName)) {
        const chartBytes = secondPass[entryName];
        if (chartBytes) {
          charts.set(rid, strFromU8(chartBytes));
        }
      }
    }
    for (const [rid, name] of ridToName) {
      const bytes = secondPass[name];
      if (bytes) {
        media.set(rid, { name, bytes });
      }
    }
  }

  return { blocks, media, charts, skippedImages };
}
