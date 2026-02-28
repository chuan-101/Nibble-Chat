-- Nibble-Chat public one-run initialization script.
-- Run this file once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  override_model text,
  override_reasoning boolean,
  is_archived boolean not null default false,
  archived_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now(),
  client_id text,
  client_created_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  checkin_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  source text not null,
  status text not null check (status in ('confirmed', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

create table if not exists public.rp_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  tile_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_archived boolean not null default false,
  archived_at timestamptz,
  player_display_name text,
  player_avatar_url text,
  worldbook_text text,
  rp_context_token_limit integer,
  rp_keep_recent_messages integer not null default 10,
  settings jsonb not null default '{}'::jsonb
);

create table if not exists public.rp_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.rp_sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now(),
  client_id text,
  client_created_at timestamptz,
  meta jsonb not null default '{}'::jsonb
);

create table if not exists public.rp_npc_cards (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.rp_sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null,
  system_prompt text,
  model_config jsonb not null default '{}'::jsonb,
  api_config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  enabled_models text[] not null default array['openrouter/auto']::text[],
  default_model text not null default 'openrouter/auto',
  memory_extract_model text,
  compression_enabled boolean not null default true,
  compression_trigger_ratio numeric(4,3) not null default 0.650,
  compression_keep_recent_messages integer not null default 20,
  summarizer_model text,
  memory_merge_enabled boolean not null default true,
  memory_auto_extract_enabled boolean not null default false,
  temperature numeric(4,3) not null default 0.700,
  top_p numeric(4,3) not null default 0.900,
  max_tokens integer not null default 1024,
  system_prompt text not null default '',
  user_home_system_prompt text,
  assistant_post_system_prompt text,
  assistant_reply_system_prompt text,
  enable_reasoning boolean not null default true,
  chat_reasoning_enabled boolean not null default true,
  rp_reasoning_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.compression_cache (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module in ('chat', 'rp')),
  conversation_id text not null,
  compressed_up_to_message_id uuid,
  summary_text text not null,
  updated_at timestamptz not null default now(),
  unique (module, conversation_id)
);

create table if not exists public.user_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz
);

create table if not exists public.user_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  post_id uuid not null references public.user_posts(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz
);

create table if not exists public.assistant_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  model_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz
);

create table if not exists public.assistant_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  post_id uuid not null references public.assistant_posts(id) on delete cascade,
  author_role text not null check (author_role in ('user', 'ai')),
  content text not null,
  model_id text,
  created_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_user_archive_updated_idx on public.sessions (user_id, is_archived, updated_at desc, created_at desc);
create index if not exists messages_user_id_idx on public.messages (user_id);
create index if not exists messages_session_id_idx on public.messages (session_id);
create index if not exists messages_session_client_time_idx on public.messages (session_id, client_created_at, created_at);
create index if not exists checkins_user_id_idx on public.checkins (user_id);
create index if not exists memory_entries_user_status_deleted_idx on public.memory_entries (user_id, status, is_deleted, created_at desc);
create index if not exists rp_sessions_user_archive_updated_idx on public.rp_sessions (user_id, is_archived, updated_at desc, created_at desc);
create index if not exists rp_messages_user_id_idx on public.rp_messages (user_id);
create index if not exists rp_messages_session_id_idx on public.rp_messages (session_id);
create index if not exists rp_messages_session_client_time_idx on public.rp_messages (session_id, client_created_at, created_at);
create index if not exists rp_npc_cards_user_id_idx on public.rp_npc_cards (user_id);
create index if not exists rp_npc_cards_session_id_idx on public.rp_npc_cards (session_id);
create index if not exists user_posts_user_deleted_created_idx on public.user_posts (user_id, is_deleted, created_at desc);
create index if not exists user_replies_post_deleted_created_idx on public.user_replies (post_id, is_deleted, created_at);
create index if not exists user_replies_user_id_idx on public.user_replies (user_id);
create index if not exists assistant_posts_user_deleted_created_idx on public.assistant_posts (user_id, is_deleted, created_at desc);
create index if not exists assistant_replies_post_deleted_created_idx on public.assistant_replies (post_id, is_deleted, created_at);
create index if not exists assistant_replies_user_id_idx on public.assistant_replies (user_id);

alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.checkins enable row level security;
alter table public.memory_entries enable row level security;
alter table public.rp_sessions enable row level security;
alter table public.rp_messages enable row level security;
alter table public.rp_npc_cards enable row level security;
alter table public.user_settings enable row level security;
alter table public.compression_cache enable row level security;
alter table public.user_posts enable row level security;
alter table public.user_replies enable row level security;
alter table public.assistant_posts enable row level security;
alter table public.assistant_replies enable row level security;

drop policy if exists sessions_owner_all on public.sessions;
create policy sessions_owner_all on public.sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists messages_owner_all on public.messages;
create policy messages_owner_all on public.messages
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists checkins_owner_all on public.checkins;
create policy checkins_owner_all on public.checkins
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists memory_entries_owner_all on public.memory_entries;
create policy memory_entries_owner_all on public.memory_entries
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists rp_sessions_owner_all on public.rp_sessions;
create policy rp_sessions_owner_all on public.rp_sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists rp_messages_owner_all on public.rp_messages;
create policy rp_messages_owner_all on public.rp_messages
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists rp_npc_cards_owner_all on public.rp_npc_cards;
create policy rp_npc_cards_owner_all on public.rp_npc_cards
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists user_settings_owner_all on public.user_settings;
create policy user_settings_owner_all on public.user_settings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- compression_cache has no user_id column.
-- For the current app behavior, authenticated users can read/write cache rows.
drop policy if exists compression_cache_authenticated_all on public.compression_cache;
create policy compression_cache_authenticated_all on public.compression_cache
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists user_posts_owner_all on public.user_posts;
create policy user_posts_owner_all on public.user_posts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists user_replies_owner_all on public.user_replies;
create policy user_replies_owner_all on public.user_replies
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists assistant_posts_owner_all on public.assistant_posts;
create policy assistant_posts_owner_all on public.assistant_posts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists assistant_replies_owner_all on public.assistant_replies;
create policy assistant_replies_owner_all on public.assistant_replies
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.soft_delete_user_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_posts
  set is_deleted = true,
      deleted_at = now(),
      updated_at = now()
  where id = p_post_id
    and user_id = auth.uid();

  update public.user_replies
  set is_deleted = true,
      deleted_at = now()
  where post_id = p_post_id
    and user_id = auth.uid();
end;
$$;

create or replace function public.restore_user_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_posts
  set is_deleted = false,
      deleted_at = null,
      updated_at = now()
  where id = p_post_id
    and user_id = auth.uid();

  update public.user_replies
  set is_deleted = false,
      deleted_at = null
  where post_id = p_post_id
    and user_id = auth.uid();
end;
$$;

create or replace function public.soft_delete_user_reply(p_reply_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_replies
  set is_deleted = true,
      deleted_at = now()
  where id = p_reply_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.soft_delete_user_post(uuid) to authenticated;
grant execute on function public.restore_user_post(uuid) to authenticated;
grant execute on function public.soft_delete_user_reply(uuid) to authenticated;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();

drop trigger if exists memory_entries_set_updated_at on public.memory_entries;
create trigger memory_entries_set_updated_at
before update on public.memory_entries
for each row
execute function public.set_updated_at();

drop trigger if exists rp_sessions_set_updated_at on public.rp_sessions;
create trigger rp_sessions_set_updated_at
before update on public.rp_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists rp_npc_cards_set_updated_at on public.rp_npc_cards;
create trigger rp_npc_cards_set_updated_at
before update on public.rp_npc_cards
for each row
execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists user_posts_set_updated_at on public.user_posts;
create trigger user_posts_set_updated_at
before update on public.user_posts
for each row
execute function public.set_updated_at();

drop trigger if exists assistant_posts_set_updated_at on public.assistant_posts;
create trigger assistant_posts_set_updated_at
before update on public.assistant_posts
for each row
execute function public.set_updated_at();

drop trigger if exists compression_cache_set_updated_at on public.compression_cache;
create trigger compression_cache_set_updated_at
before update on public.compression_cache
for each row
execute function public.set_updated_at();
