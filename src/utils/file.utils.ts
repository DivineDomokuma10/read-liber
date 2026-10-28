import { File } from "expo-file-system";

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
