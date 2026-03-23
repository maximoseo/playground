import { createClient } from "@supabase/supabase-js";

export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseSchemaSql = `
create table if not exists saved_lists (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_keywords (
  id bigserial primary key,
  list_id uuid not null references saved_lists(id) on delete cascade,
  keyword text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_keywords_list_id_idx on saved_keywords(list_id);
`;
