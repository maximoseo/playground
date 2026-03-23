import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AppSettings, SavedList } from "@/lib/types";
import { getSupabaseAdmin, hasSupabase, supabaseSchemaSql } from "@/lib/supabase";

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

async function readSavedListsFromSupabase() {
  const supabase = getSupabaseAdmin();
  const { data: lists, error } = await supabase.from("saved_lists").select("id,name,created_at,updated_at,saved_keywords(payload)").order("updated_at", { ascending: false });
  if (error) throw error;
  return (lists ?? []).map((list) => ({
    id: list.id,
    name: list.name,
    createdAt: list.created_at,
    updatedAt: list.updated_at,
    keywords: (list.saved_keywords ?? []).map((entry: { payload: SavedList["keywords"][number] }) => entry.payload),
  })) as SavedList[];
}

async function writeSavedListToSupabase(list: SavedList) {
  const supabase = getSupabaseAdmin();
  const { error: upsertError } = await supabase.from("saved_lists").upsert({
    id: list.id || randomUUID(),
    name: list.name,
    created_at: list.createdAt,
    updated_at: list.updatedAt,
  });
  if (upsertError) throw upsertError;

  await supabase.from("saved_keywords").delete().eq("list_id", list.id);
  const rows = list.keywords.map((keyword) => ({ list_id: list.id, keyword: keyword.keyword, payload: keyword }));
  if (rows.length) {
    const { error } = await supabase.from("saved_keywords").insert(rows);
    if (error) throw error;
  }
}

export async function readSavedLists() {
  if (hasSupabase()) {
    return readSavedListsFromSupabase();
  }
  return readJson<SavedList[]>(listsPath, []);
}

export async function upsertSavedList(list: SavedList) {
  if (hasSupabase()) {
    await writeSavedListToSupabase(list);
    return list;
  }
  const lists = await readJson<SavedList[]>(listsPath, []);
  const next = [...lists.filter((item) => item.id !== list.id), list];
  await writeJson(listsPath, next);
  return list;
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

export async function getStorageMode() {
  return hasSupabase() ? "supabase" : "local-json";
}

export async function getSupabaseBootstrapSql() {
  return supabaseSchemaSql;
}
