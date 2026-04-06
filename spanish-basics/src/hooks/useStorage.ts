import { useState, useEffect, useCallback, useRef } from "react";
import * as SQLite from "expo-sqlite";

const DB_NAME = "spanish_basics.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbReady = false;
let dbReadyPromise: Promise<void> | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
}

function ensureTable(): Promise<void> {
  if (dbReady) {
    return Promise.resolve();
  }
  if (dbReadyPromise) {
    return dbReadyPromise;
  }
  dbReadyPromise = (async () => {
    const db = getDb();
    db.execSync(
      "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL);"
    );
    dbReady = true;
  })();
  return dbReadyPromise;
}

/**
 * A persistent key-value storage hook backed by expo-sqlite.
 *
 * Returns [value, setValue, isLoading].
 * - value: the current stored value (or defaultValue while loading)
 * - setValue: async function to update and persist the value
 * - isLoading: true until the initial value has been read from storage
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (val: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await ensureTable();
        const db = getDb();
        const row = db.getFirstSync<{ value: string }>(
          "SELECT value FROM kv_store WHERE key = ?;",
          [key]
        );
        if (!cancelled) {
          if (row) {
            setValue(JSON.parse(row.value) as T);
          } else {
            setValue(defaultValueRef.current);
          }
        }
      } catch {
        if (!cancelled) {
          setValue(defaultValueRef.current);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const updateValue = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      try {
        await ensureTable();
        const db = getDb();
        const serialized = JSON.stringify(newValue);
        db.runSync(
          "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?);",
          [key, serialized]
        );
      } catch (error) {
        console.error(`useStorage: failed to persist key "${key}"`, error);
      }
    },
    [key]
  );

  return [value, updateValue, isLoading];
}
