import * as SQLite from "expo-sqlite";

export const DB_NAME = "readliber.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function openDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}
