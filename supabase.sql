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
