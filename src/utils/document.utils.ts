import type {
  Document,
  DocumentRow,
  DocumentType,
  PickedAsset,
} from "@/types/document";

export class UnsupportedTypeError extends Error {
  constructor(mimeType: string | undefined) {
    super(`Unsupported document type: ${mimeType ?? "unknown"}`);
    this.name = "UnsupportedTypeError";
  }
}

/**
 * Single source of truth: MIME → DocumentType.
 * Legacy `.doc` (application/msword) is intentionally unsupported in V1;
 * it is excluded here so the picker never offers it.
 * `ACCEPTED_MIME_TYPE` (data/constant) is derived from this map,
 * so supporting a new format means changing one place only.
 */
export const MIME_TO_TYPE: Record<string, DocumentType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/markdown": "md",
  "text/plain": "txt",
};

/**
 * Normalize a picker MIME type to our DocumentType.
 * Throws UnsupportedTypeError for unknown types.
 */
export function mimeToDocumentType(
  mimeType: string | undefined,
): DocumentType {
  const type = mimeType ? MIME_TO_TYPE[mimeType] : undefined;
  if (!type) {
    throw new UnsupportedTypeError(mimeType);
  }
  return type;
}

function generateId(): string {
  const cryptoRef = globalThis.crypto as Crypto | undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Build a new DocumentRow from a picker asset.
 * Assigns a fresh UUID, current timestamps, and fresh-read defaults
 * (page 1, 0%, not favorite). `localUri` is the permanent in-app copy made by
 * the ingest service — passed in by the picker after ingest (or null when
 * ingest failed; the cache-only row then degrades gracefully via the
 * reader's file-access validation).
 */
export function toDocumentRow(
  asset: PickedAsset,
  localUri: string | null = null,
): DocumentRow {
  const now = Date.now();
  return {
    id: generateId(),
    uri: asset.uri,
    local_uri: localUri,
    name: asset.name,
    mime_type: asset.mimeType ?? null,
    size: asset.size ?? null,
    type: mimeToDocumentType(asset.mimeType),
    last_opened: now,
    page: 1,
    percent: 0,
    favorite: 0,
    created_at: now,
    updated_at: now,
  };
}

export function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    uri: row.local_uri ?? row.uri,
    name: row.name,
    mime: row.mime_type ?? "",
    type: row.type,
    lastOpened: row.last_opened ?? row.created_at,
    page: row.page,
    percent: row.percent,
    favorite: row.favorite === 1,
  };
}
