create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  driver_name text not null check (length(trim(driver_name)) between 1 and 80),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Drivers can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.create_driver_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, driver_name)
  values (new.id, trim(new.raw_user_meta_data ->> 'driver_name'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_driver_profile();

create or replace function public.prevent_driver_name_change()
returns trigger
language plpgsql
as $$
begin
  if new.driver_name is distinct from old.driver_name then
    raise exception 'Driver name cannot be changed after registration';
  end if;
  return new;
end;
$$;

drop trigger if exists lock_driver_name on public.profiles;
create trigger lock_driver_name
  before update on public.profiles
  for each row execute procedure public.prevent_driver_name_change();
