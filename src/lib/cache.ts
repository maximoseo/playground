import { readCache, writeCache } from "@/lib/storage";

const TTL_MS = 1000 * 60 * 60 * 24;

export async function getCachedPayload<T>(key: string) {
  const cache = await readCache();
  const entry = cache[key];
  if (!entry) return null;
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    delete cache[key];
    await writeCache(cache);
    return null;
  }
  return entry.payload as T;
}

export async function setCachedPayload<T>(key: string, payload: T) {
  const cache = await readCache();
  cache[key] = { payload, expiresAt: new Date(Date.now() + TTL_MS).toISOString() };
  await writeCache(cache);
}

export function makeCacheKey(input: unknown) {
  return JSON.stringify(input);
}
