import { Directory, File, FileMode, Paths } from "expo-file-system";
import ReactNativeBlobUtil from "react-native-blob-util";

import { getContentMetadata } from "@/services/content-metadata.service";
import { sanitizeFilename } from "@/services/ingest.service";
import type { PickedAsset } from "@/types/document";
import { MIME_TO_TYPE } from "./document.utils";
import { fingerprintFile } from "./file.utils";

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
 * Expo File's `type` property asks Android's ContentResolver for that metadata;
 * the extension remains a fallback for providers that encode it in the URI.
 *
 * WhatsApp commonly exposes only an opaque UUID (`.../item/<uuid>`), so PDF
 * and DOCX signatures provide a final bounded fallback when its provider MIME
 * is generic. Unknown content still reaches the existing unsupported-type
 * alert rather than being guessed unsafely.
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".txt": "text/plain",
  ".text": "text/plain",
};

const MIME_TO_EXTENSION: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/markdown": ".md",
  "text/plain": ".txt",
};

const SIGNATURE_SCAN_BYTES = 1024 * 1024;
const PDF_HEADER_SCAN_BYTES = 1024;
const PDF_SIGNATURE = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const DOCX_DOCUMENT_PART = new TextEncoder().encode("word/document.xml");

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

/** Ignore generic/unsupported provider values; only app-supported MIME wins. */
function supportedMime(mimeType: string | null | undefined): string | undefined {
  const normalized = mimeType?.split(";", 1)[0]?.trim().toLowerCase();
  return normalized && MIME_TO_TYPE[normalized] ? normalized : undefined;
}

function nameWithResolvedExtension(name: string, mimeType: string | undefined) {
  if (!mimeType || mimeFromFilename(name)) {
    return name;
  }

  const extension = MIME_TO_EXTENSION[mimeType];
  return extension ? `${name}${extension}` : name;
}

function containsBytes(haystack: Uint8Array, needle: Uint8Array): boolean {
  if (needle.length === 0 || needle.length > haystack.length) {
    return false;
  }

  outer: for (let i = 0; i <= haystack.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) {
        continue outer;
      }
    }
    return true;
  }

  return false;
}

function startsLikeZip(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
      (bytes[2] === 0x05 && bytes[3] === 0x06) ||
      (bytes[2] === 0x07 && bytes[3] === 0x08))
  );
}

/**
 * Read at most 2 MiB (archive head + tail) to identify formats whose provider
 * MIME and filename are both opaque. Never loads a potentially large document
 * into JS merely to classify it.
 */
function mimeFromContent(file: File): string | undefined {
  const handle = file.open(FileMode.ReadOnly);

  try {
    const size = handle.size ?? file.size;
    const prefixLength = Math.min(size, SIGNATURE_SCAN_BYTES);
    const prefix = handle.readBytes(prefixLength);

    if (
      containsBytes(
        prefix.subarray(0, Math.min(prefix.length, PDF_HEADER_SCAN_BYTES)),
        PDF_SIGNATURE,
      )
    ) {
      return "application/pdf";
    }

    if (!startsLikeZip(prefix)) {
      return undefined;
    }

    if (containsBytes(prefix, DOCX_DOCUMENT_PART)) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    if (size > prefixLength) {
      const tailStart = Math.max(0, size - SIGNATURE_SCAN_BYTES);
      handle.offset = tailStart;
      const tail = handle.readBytes(size - tailStart);
      if (containsBytes(tail, DOCX_DOCUMENT_PART)) {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
    }

    return undefined;
  } finally {
    handle.close();
  }
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
    const source = new File(url);
    const metadata = await getContentMetadata(url);
    let providerMime: string | undefined;
    let size: number | undefined;

    /**
     * Android content providers can expose MIME and size even when their URI
     * contains only an opaque identifier. Metadata access is best-effort: the
     * subsequent stream copy remains the source-of-truth access check.
     */
    try {
      providerMime = metadata?.mimeType || source.type || undefined;
      size = metadata?.size || source.size || undefined;
    } catch {
      // Provider metadata unavailable — use URI/content fallbacks below.
    }

    const initialName = sanitizeFilename(
      metadata?.displayName || guessNameFromUri(url),
    );
    let mimeType = supportedMime(providerMime) ?? mimeFromFilename(initialName);

    const dir = new Directory(Paths.cache, SHARED_CACHE_DIR_NAME);
    if (!dir.exists) {
      dir.create();
    }

    const dest = new File(dir, `shared-${shortId()}-${initialName}`);
    await ReactNativeBlobUtil.fs.cp(url, dest.uri);

    const copied = new File(dest.uri);
    if (!copied.exists || copied.size === 0) {
      return null;
    }

    mimeType ??= mimeFromContent(copied);
    const name = nameWithResolvedExtension(initialName, mimeType);
    const fingerprint = await fingerprintFile(copied.uri);

    return {
      uri: dest.uri,
      name,
      mimeType,
      size: fingerprint?.size ?? size ?? copied.size,
      contentHash: fingerprint?.contentHash,
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
