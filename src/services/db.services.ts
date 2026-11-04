import { initializeDatabase } from "@/db";
import type { DocumentRow } from "@/types";

export class Database {
  static async getDocuments(): Promise<DocumentRow[]> {
    const db = await initializeDatabase();
    return db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents ORDER BY last_opened DESC`,
    );
  }

  static async getDocument(id: string): Promise<DocumentRow | null> {
    const db = await initializeDatabase();
    return db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents WHERE id = ?`,
      id,
    );
  }

  static async findByUri(uri: string): Promise<DocumentRow | null> {
    const db = await initializeDatabase();
    return db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents WHERE uri = ? ORDER BY last_opened DESC LIMIT 1`,
      uri,
    );
  }

  static async findByFingerprint(
    contentHash: string,
    size: number,
  ): Promise<DocumentRow | null> {
    const db = await initializeDatabase();
    return db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents
       WHERE content_hash = ? AND size = ?
       ORDER BY last_opened DESC
       LIMIT 1`,
      [contentHash, size],
    );
  }

  static async getUnfingerprintedCandidates(
    size: number,
  ): Promise<DocumentRow[]> {
    const db = await initializeDatabase();
    return db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents
       WHERE content_hash IS NULL AND (size = ? OR size IS NULL)
       ORDER BY last_opened DESC`,
      [size],
    );
  }

  static async updateFingerprint(
    id: string,
    contentHash: string,
    size: number,
  ) {
    const db = await initializeDatabase();
    return db.runAsync(
      `UPDATE documents
       SET content_hash = ?, size = ?, updated_at = ?
       WHERE id = ?`,
      [contentHash, size, Date.now(), id],
    );
  }

  static async updateReadingPosition(id: string, page: number, percent: number) {
    const db = await initializeDatabase();
    const now = Date.now();

    return db.runAsync(
      `UPDATE documents
       SET page = ?, percent = ?, last_opened = ?, updated_at = ?
       WHERE id = ?`,
      [page, percent, now, now, id],
    );
  }

  static async updateLocalUri(id: string, localUri: string) {
    const db = await initializeDatabase();

    return db.runAsync(
      `UPDATE documents SET local_uri = ?, updated_at = ? WHERE id = ?`,
      [localUri, Date.now(), id],
    );
  }

  static async touchLastOpened(id: string) {
    const db = await initializeDatabase();
    const now = Date.now();

    return db.runAsync(
      `UPDATE documents SET last_opened = ?, updated_at = ? WHERE id = ?`,
      [now, now, id],
    );
  }

  /**
   * Set an explicit favorite state. Unlike SQL inversion, this is idempotent:
   * a retried write always converges on the same value and never touches
   * reading position or recency.
   */
  static async setFavorite(id: string, favorite: 0 | 1) {
    const db = await initializeDatabase();

    return db.runAsync(
      `UPDATE documents SET favorite = ?, updated_at = ? WHERE id = ?`,
      [favorite, Date.now(), id],
    );
  }

  /**
   * Insert a fresh row. Plain INSERT (not INSERT OR REPLACE) so a PK collision
   * fails loudly instead of silently replacing an existing document's data.
   * Callers prevent known same-URI/content-fingerprint duplicates before
   * reaching this.
   */
  static async saveDocument(doc: DocumentRow) {
    const db = await initializeDatabase();

    return db.runAsync(
      `
        INSERT INTO documents
        (id, uri, local_uri, name, mime_type, size, content_hash, type, last_opened, page, percent, favorite, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        doc.id,
        doc.uri,
        doc.local_uri,
        doc.name,
        doc.mime_type,
        doc.size,
        doc.content_hash,
        doc.type,
        doc.last_opened,
        doc.page,
        doc.percent,
        doc.favorite,
        doc.created_at,
        doc.updated_at,
      ],
    );
  }
}
