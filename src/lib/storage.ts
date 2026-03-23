import { promises as fs } from "node:fs";
import path from "node:path";
import { AppSettings, SavedList } from "@/lib/types";

const dataDir = path.join(process.cwd(), "src", "data");
const listsPath = path.join(dataDir, "saved-lists.json");
const cachePath = path.join(dataDir, "research-cache.json");
const settingsPath = path.join(dataDir, "settings.json");

async function ensureFile(filePath: string, fallback: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

async function writeJson<T>(filePath: string, value: T) {
  await ensureFile(filePath, value);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function readSavedLists() {
  return readJson<SavedList[]>(listsPath, []);
}

export async function writeSavedLists(lists: SavedList[]) {
  return writeJson(listsPath, lists);
}

export async function readCache() {
  return readJson<Record<string, { expiresAt: string; payload: unknown }>>(cachePath, {});
}

export async function writeCache(cache: Record<string, { expiresAt: string; payload: unknown }>) {
  return writeJson(cachePath, cache);
}

export async function readSettings() {
  return readJson<AppSettings>(settingsPath, {
    theme: "system",
    defaultCountry: "us",
    defaultLanguage: "en",
    defaultResultCount: 50,
    cacheEnabled: true,
    density: "comfortable",
  });
}
