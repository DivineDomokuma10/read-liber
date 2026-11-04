import type { DocumentRow, PickedAsset } from "@/types";
import {
  deleteFileIfExists,
  fingerprintFile,
  isFileAccessible,
} from "@/utils/file.utils";
import { Database } from "./db.services";

async function findExistingDocument(
  contentHash: string,
  size: number,
): Promise<DocumentRow | null> {
  const fingerprinted = await Database.findByFingerprint(contentHash, size);
  if (fingerprinted) {
    return fingerprinted;
  }

  /**
   * Pre-v2 rows have no hash. Backfill only same/unknown-size candidates when
   * a new import arrives, avoiding an expensive whole-library startup pass.
   */
  const legacyCandidates = await Database.getUnfingerprintedCandidates(size);
  for (const candidate of legacyCandidates) {
    const candidateUri = candidate.local_uri ?? candidate.uri;
    if (!isFileAccessible(candidateUri)) {
      continue;
    }

    const fingerprint = await fingerprintFile(candidateUri);
    if (!fingerprint) {
      continue;
    }

    await Database.updateFingerprint(
      candidate.id,
      fingerprint.contentHash,
      fingerprint.size,
    );

    if (
      fingerprint.contentHash === contentHash &&
      fingerprint.size === size
    ) {
      return {
        ...candidate,
        content_hash: fingerprint.contentHash,
        size: fingerprint.size,
      };
    }
  }

  return null;
}

/**
 * Reuse an existing row when staged bytes match, preserving favorite and
 * reading position. If its old file vanished, adopt the newly ingested copy;
 * otherwise delete that redundant app-owned copy.
 */
export async function reuseDuplicateDocument(
  asset: PickedAsset,
  newLocalUri: string | null,
): Promise<DocumentRow | null> {
  if (!asset.contentHash || asset.size === undefined) {
    return null;
  }

  const existing = await findExistingDocument(
    asset.contentHash,
    asset.size,
  );
  if (!existing) {
    return null;
  }

  const currentFileUri = existing.local_uri ?? existing.uri;
  const currentFileAvailable = isFileAccessible(currentFileUri);
  let localUri = existing.local_uri;
  let adoptedNewCopy = false;

  if (!currentFileAvailable) {
    if (!newLocalUri) {
      // The matching row is stale and the new ingest also failed. Keep the
      // newly staged asset as a separate cache-backed row instead of reviving
      // an entry that still cannot open.
      return null;
    }

    await Database.updateLocalUri(existing.id, newLocalUri);
    localUri = newLocalUri;
    adoptedNewCopy = true;
  }

  await Database.touchLastOpened(existing.id);

  if (newLocalUri && !adoptedNewCopy) {
    deleteFileIfExists(newLocalUri);
  }

  const now = Date.now();
  return {
    ...existing,
    local_uri: localUri,
    last_opened: now,
    updated_at: now,
  };
}
