import { Directory, File, Paths } from "expo-file-system";

import type { PickedAsset } from "@/types/document";

/**
 * Permanent ingested copies live under ${documentDirectory}/documents.
 * `Paths.document` is safe from OS deletion — unlike the picker's cache copy
 * (`copyToCacheDirectory: true`), which Android clears under storage pressure.
 */
const DOCUMENTS_DIR_NAME = "documents";
const ID_PREFIX_LENGTH = 8;
const MAX_NAME_LENGTH = 120;

/**
 * Strip path segments and filesystem-hostile characters from a picker
 * filename. Keeps the extension so MIME inference by downstream renderers
 * keeps working; falls back to "document" when nothing sane remains.
 */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\\/]/).pop() ?? "";
  const cleaned = base
    .replace(/[\u0000-\u001F<>:"|?*]/g, "_")
    .trim()
    .replace(/^[.\s]+/, "")
    .replace(/[.\s]+$/, "");

  if (!cleaned) {
    return "document";
  }

  if (cleaned.length <= MAX_NAME_LENGTH) {
    return cleaned;
  }

  const ext = cleaned.slice(cleaned.lastIndexOf("."));
  const safeExt = ext.length < 12 && ext.includes(".") ? ext : "";
  return `${cleaned.slice(0, MAX_NAME_LENGTH - safeExt.length)}${safeExt}`;
}

function shortId(): string {
  const cryptoRef = globalThis.crypto;
  if (typeof cryptoRef?.randomUUID === "function") {
    return cryptoRef.randomUUID().slice(0, ID_PREFIX_LENGTH);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
    .slice(0, ID_PREFIX_LENGTH);
}

/**
 * Copy a freshly picked document into permanent app storage.
 *
 * Returns the `file://` URI of the permanent copy, or null when the copy
 * failed (partial files are cleaned up; the caller persists the row with a
 * null `local_uri` so the document still works now and degrades gracefully
 * later via the reader's file-access validation).
 *
 * Best-effort by design: a failed ingest must never block opening the file —
 * the cache copy is still readable at this moment.
 */
export async function ingestToLocal(asset: PickedAsset): Promise<string | null> {
  let dest: File | null = null;

  try {
    const dir = new Directory(Paths.document, DOCUMENTS_DIR_NAME);
    if (!dir.exists) {
      dir.create();
    }

    /**
     * Salted filename: same-named files picked twice never overwrite each
     * other's permanent copies, even though their cache paths may collide.
     */
    const destName = `${shortId()}-${sanitizeFilename(asset.name)}`;
    dest = new File(dir, destName);

    const src = new File(asset.uri);
    if (!src.exists || src.size === 0) {
      return null;
    }

    /**
     * Refuse early when disk space can't fit the copy plus headroom — a
     * half-written copy on a full disk is worse than a clean failure.
     */
    const headroom = 16 * 1024 * 1024;
    if (Paths.availableDiskSpace > 0 && src.size > Paths.availableDiskSpace - headroom) {
      return null;
    }

    if (dest.exists) {
      dest.delete();
    }

    await src.copy(dest);

    if (!dest.exists || dest.size === 0) {
      return null;
    }

    return dest.uri;
  } catch (e) {
    console.error("Ingest failed:", e);
    if (dest?.exists) {
      try {
        dest.delete();
      } catch (cleanupError) {
        console.error("Ingest cleanup failed:", cleanupError);
      }
    }
    return null;
  }
}
