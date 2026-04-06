import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Web storage (localStorage)
// ---------------------------------------------------------------------------

function webGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`sb_${key}`);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function webSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`sb_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`useStorage: failed to persist key "${key}"`, error);
  }
}

// ---------------------------------------------------------------------------
// Native storage (expo-sqlite) — lazy-loaded so the web bundle never imports it
// ---------------------------------------------------------------------------

let nativeDb: any = null;
let nativeReady = false;

async function ensureNativeDb() {
  if (nativeReady) return;
  const SQLite = await import("expo-sqlite");
  nativeDb = SQLite.openDatabaseSync("spanish_basics.db");
  nativeDb.execSync(
    "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL);"
  );
  nativeReady = true;
}

function nativeGet<T>(key: string, defaultValue: T): T {
  try {
    const row = nativeDb?.getFirstSync<{ value: string }>(
      "SELECT value FROM kv_store WHERE key = ?;",
      [key]
    );
    return row ? (JSON.parse(row.value) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function nativeSet<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    nativeDb?.runSync(
      "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?);",
      [key, serialized]
    );
  } catch (error) {
    console.error(`useStorage: failed to persist key "${key}"`, error);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const isWeb = Platform.OS === "web";

/**
 * A persistent key-value storage hook.
 * Uses localStorage on web, expo-sqlite on native.
 *
 * Returns [value, setValue, isLoading].
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (val: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isWeb) {
          const stored = webGet(key, defaultRef.current);
          if (!cancelled) setValue(stored);
        } else {
          await ensureNativeDb();
          const stored = nativeGet(key, defaultRef.current);
          if (!cancelled) setValue(stored);
        }
      } catch {
        if (!cancelled) setValue(defaultRef.current);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const updateValue = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      if (isWeb) {
        webSet(key, newValue);
      } else {
        await ensureNativeDb();
        nativeSet(key, newValue);
      }
    },
    [key]
  );

  return [value, updateValue, isLoading];
}
