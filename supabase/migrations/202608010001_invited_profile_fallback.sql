-- Dashboard invitations only include an email address. Create a temporary,
-- valid profile name so the invitation can be issued before the driver enters
-- their preferred name during activation.
create or replace function public.create_driver_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
begin
  resolved_name := left(
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'driver_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), ''),
      'Invited Driver'
    ),
    80
  );

  insert into public.profiles (user_id, driver_name)
  values (new.id, resolved_name)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.ensure_driver_profile()
returns setof public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  registered_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select left(
           coalesce(
             nullif(trim(raw_user_meta_data ->> 'driver_name'), ''),
             nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
             nullif(trim(split_part(coalesce(email, ''), '@', 1)), ''),
             'Invited Driver'
           ),
           80
         )
    into registered_name
    from auth.users
   where id = current_user_id;

  insert into public.profiles (user_id, driver_name)
  values (current_user_id, registered_name)
  on conflict (user_id) do nothing;

  return query
    select profiles.*
      from public.profiles as profiles
     where profiles.user_id = current_user_id;
end;
$$;

revoke all on function public.ensure_driver_profile() from public;
grant execute on function public.ensure_driver_profile() to authenticated;
