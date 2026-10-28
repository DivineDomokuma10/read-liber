import { openDatabase } from "@/db";
import { DocumentRow } from "@/types";

export class Database {
  static async getDocuments(): Promise<DocumentRow[]> {
    const db = await openDatabase();
    return db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents ORDER BY last_opened DESC`,
    );
  }

  static async getDocument(id: string): Promise<DocumentRow | null> {
    const db = await openDatabase();
    return db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents WHERE id = ?`,
      id,
    );
  }

  static async findByUri(uri: string): Promise<DocumentRow | null> {
    const db = await openDatabase();
    return db.getFirstAsync<DocumentRow>(
      `SELECT * FROM documents WHERE uri = ? ORDER BY last_opened DESC LIMIT 1`,
      uri,
    );
  }

  static async updateReadingPosition(id: string, page: number, percent: number) {
    const db = await openDatabase();
    const now = Date.now();

    return db.runAsync(
      `UPDATE documents
       SET page = ?, percent = ?, last_opened = ?, updated_at = ?
       WHERE id = ?`,
      [page, percent, now, now, id],
    );
  }

  static async updateLocalUri(id: string, localUri: string) {
    const db = await openDatabase();

    return db.runAsync(
      `UPDATE documents SET local_uri = ?, updated_at = ? WHERE id = ?`,
      [localUri, Date.now(), id],
    );
  }

  static async touchLastOpened(id: string) {
    const db = await openDatabase();
    const now = Date.now();

    return db.runAsync(
      `UPDATE documents SET last_opened = ?, updated_at = ? WHERE id = ?`,
      [now, now, id],
    );
  }

  /**
   * Insert a fresh row. Plain INSERT (not INSERT OR REPLACE) so a PK collision
   * fails loudly instead of silently replacing an existing document's data.
   * Callers prevent same-URI duplicates via findByUri before reaching this.
   */
  static async saveDocument(doc: DocumentRow) {
    const db = await openDatabase();

    return db.runAsync(
      `
        INSERT INTO documents
        (id, uri, local_uri, name, mime_type, size, type, last_opened, page, percent, favorite, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        doc.id,
        doc.uri,
        doc.local_uri,
        doc.name,
        doc.mime_type,
        doc.size,
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
