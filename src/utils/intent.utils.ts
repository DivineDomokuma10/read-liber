import { Directory, File, Paths } from "expo-file-system";
import ReactNativeBlobUtil from "react-native-blob-util";

import { sanitizeFilename } from "@/services/ingest.service";
import type { PickedAsset } from "@/types/document";

/**
 * Cache staging area for files received via VIEW intents ("Open with" from
 * WhatsApp, Files, etc.). Everything here is disposable: permanent copies are
 * made afterwards by the ingest pipeline, like for picked documents.
 */
const SHARED_CACHE_DIR_NAME = "shared";

/**
 * Extension → MIME map for shared files.
 *
 * MIME type cannot be recovered from a content:// URL string — the intent's
 * MIME travels with the Intent object, which the URL event does not expose.
 * WhatsApp preserves the original filename in its content URIs
 * (`content://.../document.pdf`), so the extension is the practical signal.
 *
 * Unknown/omitted extensions yield an asset without a mimeType; downstream
 * `toDocumentRow()` then rejects it via UnsupportedTypeError with the same
 * friendly alert the picker flow uses.
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".txt": "text/plain",
  ".text": "text/plain",
};

/**
 * True only for URLs that carry a document payload from the OS
 * (ACTION_VIEW "Open with"). The app's own `read-liber://` deep links are
 * router routes and must never run through the document pipeline.
 */
export function isSharedIntentUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  const lower = url.toLowerCase();
  return lower.startsWith("content://") || lower.startsWith("file://");
}

/**
 * Last path segment of a content URI, query/hash stripped and URI-decoded.
 * Best effort — callers still sanitize; "document"-less names fall back to
 * the existing harmless defaults.
 */
function guessNameFromUri(uri: string): string {
  const path = uri.split(/[?#]/)[0] ?? "";
  const segment = path.slice(path.lastIndexOf("/") + 1);
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function mimeFromFilename(name: string): string | undefined {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return EXTENSION_TO_MIME[ext];
}

function shortId(): string {
  const cryptoRef = globalThis.crypto;
  if (typeof cryptoRef?.randomUUID === "function") {
    return cryptoRef.randomUUID().slice(0, 8);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Resolve an intent-received content:// URI into a PickedAsset readable by
 * the rest of the pipeline (ingestToLocal expects a plain file path;
 * content URIs need Android's ContentResolver, so the raw bytes are staged
 * into a real cache file via react-native-blob-util first).
 *
 * Best-effort by design: returns null on any failure and the caller shows a
 * friendly error — a failed share must never crash the app.
 */
export async function resolveIntentAsset(
  url: string,
): Promise<PickedAsset | null> {
  try {
    let filename: string | undefined;
    let size: number | undefined;

    /**
     * Some providers reject stat(); fall back to guessing the name from the
     * URI itself and let the copy decide whether the file is real.
     */
    try {
      const stat = await ReactNativeBlobUtil.fs.stat(url);
      if (stat && stat.type === "file") {
        filename = stat.filename;
        size = stat.size;
      }
    } catch {
      // stat unsupported for this provider — continue with the URI-based name
    }

    const name = sanitizeFilename(filename ?? guessNameFromUri(url));

    const dir = new Directory(Paths.cache, SHARED_CACHE_DIR_NAME);
    if (!dir.exists) {
      dir.create();
    }

    const dest = new File(dir, `shared-${shortId()}-${name}`);
    await ReactNativeBlobUtil.fs.cp(url, dest.uri);

    const copied = new File(dest.uri);
    if (!copied.exists || copied.size === 0) {
      return null;
    }

    return {
      uri: dest.uri,
      name,
      mimeType: mimeFromFilename(name),
      size: size ?? copied.size,
    };
  } catch (e) {
    console.error("Intent asset resolution failed:", e);
    return null;
  }
}

/**
 * Delete the temporary cache copy created by resolveIntentAsset. Only ever
 * called with one of its own outputs, so it can't touch arbitrary files.
 * Best-effort: leftover cache files are harmless and OS-evictable.
 */
export function cleanupIntentAsset(asset: PickedAsset): void {
  try {
    const file = new File(asset.uri);
    if (file.exists) {
      file.delete();
    }
  } catch (e) {
    console.error("Intent asset cleanup failed:", e);
  }
}
