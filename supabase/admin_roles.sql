-- Run once in Supabase Dashboard -> SQL Editor.
-- The first ClashVault administrator is assigned by Supabase user UUID below.

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'support_agent')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin');
$$;

revoke all on function public.has_role(text) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.has_role(text) to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;

-- Preserve existing support agents, then route support authorization through roles.
do $$
begin
  if to_regclass('public.support_agents') is not null then
    insert into public.user_roles (user_id, role)
    select user_id, 'support_agent' from public.support_agents
    on conflict (user_id, role) do nothing;
  end if;
end
$$;

create or replace function public.is_support_agent()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin') or public.has_role('support_agent');
$$;

revoke all on function public.is_support_agent() from public;
grant execute on function public.is_support_agent() to authenticated, service_role;

drop policy if exists "users can read their roles" on public.user_roles;
drop policy if exists "admins can read all roles" on public.user_roles;
drop policy if exists "admins can add roles" on public.user_roles;
drop policy if exists "admins can update roles" on public.user_roles;
drop policy if exists "admins can remove roles" on public.user_roles;

create policy "users can read their roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "admins can read all roles"
on public.user_roles for select to authenticated
using (public.is_admin());

create policy "admins can add roles"
on public.user_roles for insert to authenticated
with check (public.is_admin());

create policy "admins can update roles"
on public.user_roles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can remove roles"
on public.user_roles for delete to authenticated
using (public.is_admin());

-- Replace any older permissive account/order policies with role-based access.
do $$
declare policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('accounts', 'orders')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

alter table public.accounts enable row level security;
alter table public.orders enable row level security;

create policy "public can view available listings"
on public.accounts for select to anon, authenticated
using (status = 'available');

create policy "buyers can view their purchased listings"
on public.accounts for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.account_id = accounts.id
      and orders.buyer_id = auth.uid()
  )
);

create policy "admins can view all listings"
on public.accounts for select to authenticated
using (public.is_admin());

create policy "admins can create listings"
on public.accounts for insert to authenticated
with check (public.is_admin());

create policy "admins can update listings"
on public.accounts for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete listings"
on public.accounts for delete to authenticated
using (public.is_admin());

create policy "buyers can view their orders"
on public.orders for select to authenticated
using (buyer_id = auth.uid());

create policy "admins can view all orders"
on public.orders for select to authenticated
using (public.is_admin());

create policy "admins can update orders"
on public.orders for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete orders"
on public.orders for delete to authenticated
using (public.is_admin());

-- Storage writes are role-protected. Public listing images remain readable.
drop policy if exists "Public can view account images" on storage.objects;
drop policy if exists "Admin can upload account images" on storage.objects;
drop policy if exists "Admin can update account images" on storage.objects;
drop policy if exists "Admin can delete account images" on storage.objects;

create policy "Public can view account images"
on storage.objects for select to public
using (bucket_id = 'account-images');

create policy "Admin can upload account images"
on storage.objects for insert to authenticated
with check (bucket_id = 'account-images' and public.is_admin());

create policy "Admin can update account images"
on storage.objects for update to authenticated
using (bucket_id = 'account-images' and public.is_admin())
with check (bucket_id = 'account-images' and public.is_admin());

create policy "Admin can delete account images"
on storage.objects for delete to authenticated
using (bucket_id = 'account-images' and public.is_admin());

-- Bootstrap the first administrator by immutable Supabase user UUID.
do $$
declare first_admin_user_id uuid := 'fba43070-89a5-4c1d-b0dc-f6706136dd98'::uuid;
begin
  if first_admin_user_id is not null then
    insert into public.user_roles (user_id, role)
    values (first_admin_user_id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
end
$$;
