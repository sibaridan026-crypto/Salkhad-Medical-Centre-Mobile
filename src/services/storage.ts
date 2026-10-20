/**
 * LOCAL STORAGE SEAM — in-memory only.
 *
 * IMPORTANT AND DELIBERATE: this module does NOT persist anything. It keeps
 * values in a `Map` for the lifetime of the running JavaScript context, so a
 * reload, an app restart, or clearing app data discards them. It exists only
 * so every other service talks to one replaceable boundary instead of holding
 * state in module-level variables.
 *
 * The signatures are async on purpose: a real implementation
 * (`expo-secure-store` for tokens, `AsyncStorage` for non-sensitive data) is
 * asynchronous, and writing the callers against an async contract now means
 * the loading/pending states are already in place and no screen has to be
 * rewritten later.
 *
 * TO MAKE THIS PERSISTENT: install a storage package and replace the bodies of
 * `get`/`set`/`remove`/`clear` below. No other file needs to change.
 */

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** In-memory implementation. Nothing survives a process restart. */
class MemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }

  async set(key: string, value: string): Promise<void> {
    this.map.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

/** The single store every service uses. Swap the implementation, not the callers. */
export const storage: KeyValueStore = new MemoryStore();

export const StorageKeys = {
  session: 'salkhad.session',
  account: 'salkhad.account',
  credentials: 'salkhad.credentials',
  authToken: 'salkhad.auth-token',
  healthProfile: 'salkhad.health-profile',
  onboarding: 'salkhad.onboarding',
  appointments: 'salkhad.appointments',
} as const;

/** JSON helpers that never throw on malformed stored values. */
export async function readJson<T>(key: string): Promise<T | null> {
  const raw = await storage.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await storage.set(key, JSON.stringify(value));
}
