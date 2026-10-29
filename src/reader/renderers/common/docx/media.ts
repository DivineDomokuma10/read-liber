import { Directory, File, Paths } from "expo-file-system";

import type { DocxDocument } from "./extract";

/**
 * DOCX document after the media step: image bytes live ON DISK — the JS
 * heap only keeps `file://` URIs. This is the memory guardrail: inflated
 * bytes (up to the 30 MB cap) are released as soon as they are staged.
 */
export type PreparedDocx = {
  blocks: DocxDocument["blocks"];
  charts: DocxDocument["charts"];
  skippedImages: number;
  /** rId → staged `file://` uri for <Image> sources. */
  mediaUris: Map<string, string>;
};

const MEDIA_DIR_NAME = "docx-media";

/**
 * Wipes last-open's media cache dir and writes this document's images in.
 * The reader is the only consumer, and only one document is open at a
 * time, so per-open wiping keeps the dir bounded with no stale-file
 * growth; `Paths.cache` lets the OS reclaim the rest under pressure.
 */
export function stageDocxMedia(document: DocxDocument): PreparedDocx {
  const dir = new Directory(Paths.cache, MEDIA_DIR_NAME);
  if (dir.exists) {
    dir.delete();
  }
  dir.create();

  const mediaUris = new Map<string, string>();
  /** Zip entries are unique per archive — same name ⇒ same bytes. */
  const staged = new Map<string, string>();

  for (const [rid, item] of document.media) {
    let uri = staged.get(item.name);
    if (uri === undefined) {
      const base = item.name.split(/[\\/]/).pop() ?? "image";
      const file = new File(dir, base);
      file.write(item.bytes);
      uri = file.uri;
      staged.set(item.name, uri);
    }
    mediaUris.set(rid, uri);
  }

  return {
    blocks: document.blocks,
    charts: document.charts,
    skippedImages: document.skippedImages,
    mediaUris,
  };
}
