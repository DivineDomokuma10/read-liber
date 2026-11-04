import * as SQLite from "expo-sqlite";

import { migrateDatabase } from "./schema";

export const DB_NAME = "readliber.db";

let connectionPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function openConnection(): Promise<SQLite.SQLiteDatabase> {
  if (!connectionPromise) {
    connectionPromise = SQLite.openDatabaseAsync(DB_NAME).catch((error) => {
      // A later retry must be able to make a fresh open attempt.
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

/**
 * Single readiness barrier for every database caller.
 * Concurrent reads/writes share one open+migrate attempt; failures clear only
 * the readiness promise so an explicit retry can rerun migrations safely.
 */
export function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const db = await openConnection();
      await migrateDatabase(db);
      return db;
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}
