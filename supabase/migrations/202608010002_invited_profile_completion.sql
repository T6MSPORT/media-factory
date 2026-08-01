-- An invited user has no driver_name metadata when Supabase creates the auth
-- account. Permit one controlled replacement of the temporary email-prefix
-- profile during activation, then retain the existing immutable-name rule.
create or replace function public.prevent_driver_name_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  registered_name text;
begin
  if new.driver_name is distinct from old.driver_name then
    select nullif(trim(raw_user_meta_data ->> 'driver_name'), '')
      into registered_name
      from auth.users
     where id = new.user_id;

    if registered_name is not null then
      raise exception 'Driver name cannot be changed after registration';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.complete_invited_driver_profile(requested_driver_name text)
returns setof public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  clean_name text := trim(requested_driver_name);
  registered_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if clean_name is null or length(clean_name) < 1 or length(clean_name) > 80 then
    raise exception 'Driver name must be between 1 and 80 characters';
  end if;

  select nullif(trim(raw_user_meta_data ->> 'driver_name'), '')
    into registered_name
    from auth.users
   where id = current_user_id;

  if registered_name is not null then
    if registered_name = clean_name then
      return query
        select profiles.*
          from public.profiles as profiles
         where profiles.user_id = current_user_id;
      return;
    end if;
    raise exception 'Driver profile has already been completed';
  end if;

  update public.profiles
     set driver_name = clean_name
   where user_id = current_user_id;

  if not found then
    insert into public.profiles (user_id, driver_name)
    values (current_user_id, clean_name);
  end if;

  update auth.users
     set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
       || jsonb_build_object('driver_name', clean_name)
   where id = current_user_id;

  return query
    select profiles.*
      from public.profiles as profiles
     where profiles.user_id = current_user_id;
end;
$$;

revoke all on function public.complete_invited_driver_profile(text) from public;
revoke all on function public.complete_invited_driver_profile(text) from anon;
grant execute on function public.complete_invited_driver_profile(text) to authenticated;
