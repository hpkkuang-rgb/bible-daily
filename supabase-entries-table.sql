-- public.entries 表结构参考（若尚未创建）
-- Run in Supabase Dashboard -> SQL Editor

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  book text not null,
  chapter int not null,
  response_text text,
  completed boolean not null default false,
  updated_at timestamptz default now(),
  unique (user_id, entry_date, book, chapter)
);

create index if not exists idx_entries_user_date
  on public.entries (user_id, entry_date desc);

alter table public.entries enable row level security;

create policy "Users can manage own entries"
  on public.entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
