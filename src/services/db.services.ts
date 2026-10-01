import { openDatabase } from "@/db";
import { DocumentRow } from "@/types";

export class Database {
  static async getDocuments(): Promise<DocumentRow[]> {
    const db = await openDatabase();

    return db.getAllAsync<DocumentRow>(
      `SELECT * FROM documents ORDER BY last_opened DESC`,
    );
  }

  static async saveDocument(doc: DocumentRow) {
    const db = await openDatabase();

    return db.runAsync(
      `
        INSERT OR REPLACE INTO documents
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
