-- Permanent, non-editable six-digit account IDs.
-- Run this file once in the Supabase SQL Editor.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_id integer not null unique check (public_id between 100000 and 999999),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read their own public ID" on public.user_profiles;
create policy "Users can read their own public ID"
on public.user_profiles for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can read public IDs" on public.user_profiles;
create policy "Admins can read public IDs"
on public.user_profiles for select
to authenticated
using (public.is_admin());

create or replace function public.ensure_user_public_id(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_id integer;
  candidate integer;
begin
  select public_id into existing_id
  from public.user_profiles
  where user_id = p_user_id;

  if found then
    return existing_id;
  end if;

  for attempt in 1..100 loop
    candidate := floor(random() * 900000 + 100000)::integer;
    begin
      insert into public.user_profiles (user_id, public_id)
      values (p_user_id, candidate)
      on conflict (user_id) do nothing;

      select public_id into existing_id
      from public.user_profiles
      where user_id = p_user_id;

      if found then
        return existing_id;
      end if;
    exception when unique_violation then
      null;
    end;
  end loop;

  raise exception 'Could not allocate a unique public user ID';
end;
$$;

revoke all on function public.ensure_user_public_id(uuid) from public, anon, authenticated;

create or replace function public.handle_new_user_public_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_user_public_id(new.id);
  return new;
end;
$$;

drop trigger if exists create_public_id_for_new_user on auth.users;
create trigger create_public_id_for_new_user
after insert on auth.users
for each row execute function public.handle_new_user_public_id();

do $$
declare
  existing_user record;
begin
  for existing_user in select id from auth.users loop
    perform public.ensure_user_public_id(existing_user.id);
  end loop;
end;
$$;

create or replace function public.get_my_public_id()
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  return public.ensure_user_public_id(auth.uid());
end;
$$;

revoke all on function public.get_my_public_id() from public, anon;
grant execute on function public.get_my_public_id() to authenticated;
