import { File } from "expo-file-system";
import ReactNativeBlobUtil from "react-native-blob-util";

export type FileFingerprint = {
  contentHash: string;
  size: number;
};

/**
 * Cheap accessibility check for a stored document URI.
 *
 * `file.exists` is a synchronous native stat; according to the SDK docs it
 * also returns false when the app lacks read access (e.g. a revoked
 * content:// permission), so this single check covers both deleted and
 * ungranted files.
 *
 * Used by the reader before rendering and by the library to dim rows —
 * NOT as a substitute for real I/O failure handling in renderers.
 */
export function isFileAccessible(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    // Constructor throws on malformed/unsupported URI forms.
    return false;
  }
}

/**
 * Resolve the URI a renderer should read: the permanent ingested copy when
 * one exists, otherwise the original picker/deep-link URI.
 */
export function resolveDocumentUri(row: {
  local_uri: string | null;
  uri: string;
}): string {
  return row.local_uri ?? row.uri;
}

/**
 * Native streaming SHA-256 fingerprint used only for duplicate detection.
 * Best-effort: hashing must never make an otherwise readable document fail to
 * open. The byte size is paired with the hash in database lookups.
 */
export async function fingerprintFile(
  uri: string,
): Promise<FileFingerprint | null> {
  try {
    const file = new File(uri);
    if (!file.exists || file.size === 0) {
      return null;
    }

    const contentHash = await ReactNativeBlobUtil.fs.hash(uri, "sha256");
    if (!/^[a-f0-9]{64}$/i.test(contentHash)) {
      return null;
    }

    return {
      contentHash: contentHash.toLowerCase(),
      size: file.size,
    };
  } catch (error) {
    console.error("Document fingerprint failed:", error);
    return null;
  }
}

/** Best-effort cleanup for a redundant app-owned staged/permanent file. */
export function deleteFileIfExists(uri: string | null | undefined): void {
  if (!uri) {
    return;
  }

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error("File cleanup failed:", error);
  }
}
