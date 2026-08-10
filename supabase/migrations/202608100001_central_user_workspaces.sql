create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace_data jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

create policy "Drivers can read their own workspace"
  on public.user_workspaces for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Drivers can create their own workspace"
  on public.user_workspaces for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Drivers can update their own workspace"
  on public.user_workspaces for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

comment on table public.user_workspaces is
  'Canonical per-user Media Factory workspace shared by web and mobile clients.';
