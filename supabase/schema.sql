-- Execute este arquivo uma única vez no SQL Editor do Supabase.
create table if not exists public.study_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  topics jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.study_states enable row level security;

drop policy if exists "read own study state" on public.study_states;
create policy "read own study state" on public.study_states
  for select using (auth.uid() = user_id);

drop policy if exists "insert own study state" on public.study_states;
create policy "insert own study state" on public.study_states
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own study state" on public.study_states;
create policy "update own study state" on public.study_states
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own study state" on public.study_states;
create policy "delete own study state" on public.study_states
  for delete using (auth.uid() = user_id);

create or replace function public.set_study_state_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_study_state_updated_at on public.study_states;
create trigger set_study_state_updated_at before update on public.study_states
for each row execute function public.set_study_state_updated_at();
