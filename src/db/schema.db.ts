import { openDatabase } from "./client.db";

export const createDocSchema = async () => {
  const db = await openDatabase();
  return db.execAsync(
    `
    CREATE TABLE IF NOT EXISTS documents (
     id TEXT PRIMARY KEY NOT NULL,
     uri TEXT NOT NULL, -- Original content:// or file:// URI
     local_uri TEXT, -- file:// copy when made (nullable)
     name TEXT NOT NULL,
     mime_type TEXT,
     size INTEGER,
     type TEXT, -- pdf, docx, md, txt
     last_opened INTEGER, -- timestamp
     page INTEGER DEFAULT 1,
     percent REAL DEFAULT 0,
     favorite INTEGER DEFAULT 0, -- 0 = false, 1 = true
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL
     );
  `,
  );
};
