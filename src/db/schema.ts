import type { SQLiteDatabase } from "expo-sqlite";

/**
 * Version 1 describes the schema already shipped before migrations existed.
 * Existing installs therefore report user_version 0 but may already have the
 * documents table; CREATE IF NOT EXISTS upgrades both cases without data loss.
 */
export const DATABASE_VERSION = 2;

const VERSION_1_SCHEMA = `
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY NOT NULL,
    uri TEXT NOT NULL,
    local_uri TEXT,
    name TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    type TEXT,
    last_opened INTEGER,
    page INTEGER DEFAULT 1,
    percent REAL DEFAULT 0,
    favorite INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_documents_last_opened
    ON documents(last_opened DESC);
`;

const VERSION_2_SCHEMA = `
  ALTER TABLE documents ADD COLUMN content_hash TEXT;

  CREATE INDEX IF NOT EXISTS idx_documents_content_fingerprint
    ON documents(content_hash, size)
    WHERE content_hash IS NOT NULL;
`;

type UserVersionRow = {
  user_version: number;
};

/**
 * Bring a connection to the latest schema before any DAO can use it.
 *
 * Static migration SQL contains no user input. Each version is committed with
 * its user_version marker in one transaction, so a failure rolls back both the
 * schema change and version bump.
 */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  const result = await db.getFirstAsync<UserVersionRow>("PRAGMA user_version");
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `Database version ${currentVersion} is newer than supported version ${DATABASE_VERSION}.`,
    );
  }

  if (currentVersion === DATABASE_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    let nextVersion = currentVersion;

    if (nextVersion < 1) {
      await db.execAsync(VERSION_1_SCHEMA);
      nextVersion = 1;
      await db.execAsync(`PRAGMA user_version = ${nextVersion};`);
    }

    if (nextVersion < 2) {
      await db.execAsync(VERSION_2_SCHEMA);
      nextVersion = 2;
      await db.execAsync(`PRAGMA user_version = ${nextVersion};`);
    }
  });
}
