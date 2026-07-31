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

  select trim(raw_user_meta_data ->> 'driver_name')
    into registered_name
    from auth.users
   where id = current_user_id;

  if registered_name is null or registered_name = '' then
    raise exception 'Registered driver name is missing';
  end if;

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
