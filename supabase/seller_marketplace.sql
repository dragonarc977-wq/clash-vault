-- Run once in Supabase Dashboard -> SQL Editor after admin_roles.sql and account_images.sql.
-- Adds reviewed sellers, seller-owned listings, protected earnings, and manual withdrawal requests.

do $$
declare constraint_record record;
begin
  for constraint_record in
    select conname from pg_constraint
    where conrelid = 'public.user_roles'::regclass and contype = 'c'
  loop
    execute format('alter table public.user_roles drop constraint %I', constraint_record.conname);
  end loop;
end $$;

alter table public.user_roles
  add constraint user_roles_role_check check (role in ('admin', 'support_agent', 'seller'));

create table if not exists public.seller_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  legal_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  categories text[] not null default '{}',
  experience text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate numeric(5,2) not null default 15 check (commission_rate >= 0 and commission_rate <= 50),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts
  add column if not exists seller_id uuid references public.seller_profiles(user_id),
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  add column if not exists moderation_notes text;

alter table public.orders
  add column if not exists seller_id uuid references public.seller_profiles(user_id),
  add column if not exists seller_available_at timestamptz;

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.seller_profiles(user_id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR' check (currency in ('INR', 'USD')),
  payout_note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists accounts_seller_id_idx on public.accounts(seller_id);
create index if not exists orders_seller_id_idx on public.orders(seller_id);
create index if not exists withdrawals_seller_id_idx on public.withdrawal_requests(seller_id);

create or replace function public.is_approved_seller()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.seller_profiles
    where user_id = auth.uid() and status = 'approved'
  );
$$;

revoke all on function public.is_approved_seller() from public;
grant execute on function public.is_approved_seller() to authenticated, service_role;

create or replace function public.protect_seller_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- SQL Editor/migrations have no end-user JWT, so auth.uid() is null.
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    new.updated_at := now();
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.status := 'pending';
    new.commission_rate := 15;
    new.admin_notes := null;
    new.reviewed_at := null;
    new.reviewed_by := null;
  else
    new.user_id := old.user_id;
    new.status := case when old.status = 'rejected' then 'pending' else old.status end;
    new.commission_rate := old.commission_rate;
    new.admin_notes := old.admin_notes;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_seller_profile_fields on public.seller_profiles;
create trigger protect_seller_profile_fields before insert or update on public.seller_profiles
for each row execute function public.protect_seller_profile_fields();

create or replace function public.protect_seller_listing_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then return new; end if;
  if not public.is_approved_seller() then raise exception 'Approved seller access required'; end if;
  if tg_op = 'INSERT' then
    new.seller_id := auth.uid();
    new.moderation_status := 'pending';
    new.moderation_notes := null;
  else
    new.seller_id := old.seller_id;
    new.moderation_status := 'pending';
    new.moderation_notes := null;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_seller_listing_fields on public.accounts;
create trigger protect_seller_listing_fields before insert or update on public.accounts
for each row execute function public.protect_seller_listing_fields();

alter table public.seller_profiles enable row level security;
alter table public.withdrawal_requests enable row level security;

drop policy if exists "users can create their seller application" on public.seller_profiles;
drop policy if exists "sellers can view their profile" on public.seller_profiles;
drop policy if exists "sellers can update their application" on public.seller_profiles;
drop policy if exists "admins manage seller profiles" on public.seller_profiles;
drop policy if exists "sellers view their withdrawals" on public.withdrawal_requests;
drop policy if exists "admins manage withdrawals" on public.withdrawal_requests;

create policy "users can create their seller application" on public.seller_profiles
for insert to authenticated with check (user_id = auth.uid());
create policy "sellers can view their profile" on public.seller_profiles
for select to authenticated using (user_id = auth.uid());
create policy "sellers can update their application" on public.seller_profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admins manage seller profiles" on public.seller_profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "sellers view their withdrawals" on public.withdrawal_requests
for select to authenticated using (seller_id = auth.uid());
create policy "admins manage withdrawals" on public.withdrawal_requests
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Only safe public seller fields are exposed.
create or replace view public.public_sellers with (security_invoker = false) as
select user_id, display_name, created_at
from public.seller_profiles where status = 'approved';
revoke all on public.public_sellers from public;
grant select on public.public_sellers to anon, authenticated;

-- Replace listing/order access with marketplace-aware policies.
do $$ declare item record;
begin
  for item in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('accounts', 'orders')
  loop execute format('drop policy if exists %I on %I.%I', item.policyname, item.schemaname, item.tablename); end loop;
end $$;

create policy "public views approved available listings" on public.accounts
for select to anon, authenticated using (status = 'available' and moderation_status = 'approved');
create policy "buyers view purchased listings" on public.accounts
for select to authenticated using (exists (select 1 from public.orders where orders.account_id = accounts.id and orders.buyer_id = auth.uid()));
create policy "sellers view own listings" on public.accounts
for select to authenticated using (seller_id = auth.uid());
create policy "approved sellers create listings" on public.accounts
for insert to authenticated with check (seller_id = auth.uid() and public.is_approved_seller());
create policy "sellers update unsold listings" on public.accounts
for update to authenticated using (seller_id = auth.uid() and status <> 'sold') with check (seller_id = auth.uid());
create policy "sellers delete unsold listings" on public.accounts
for delete to authenticated using (seller_id = auth.uid() and status <> 'sold');
create policy "admins manage all listings" on public.accounts
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "buyers view own orders" on public.orders
for select to authenticated using (buyer_id = auth.uid());
create policy "sellers view their sales" on public.orders
for select to authenticated using (seller_id = auth.uid());
create policy "admins manage all orders" on public.orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Sellers may upload only inside their own UUID folder.
drop policy if exists "Approved sellers upload own listing images" on storage.objects;
drop policy if exists "Approved sellers update own listing images" on storage.objects;
drop policy if exists "Approved sellers delete own listing images" on storage.objects;
create policy "Approved sellers upload own listing images" on storage.objects for insert to authenticated
with check (bucket_id = 'account-images' and public.is_approved_seller() and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Approved sellers update own listing images" on storage.objects for update to authenticated
using (bucket_id = 'account-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'account-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Approved sellers delete own listing images" on storage.objects for delete to authenticated
using (bucket_id = 'account-images' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.review_seller_application(p_user_id uuid, p_status text, p_notes text default null, p_commission numeric default 15)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_status not in ('approved', 'rejected', 'suspended') then raise exception 'Invalid review status'; end if;
  update public.seller_profiles set status = p_status, admin_notes = nullif(trim(p_notes), ''),
    commission_rate = p_commission, reviewed_at = now(), reviewed_by = auth.uid(), updated_at = now()
  where user_id = p_user_id;
  if not found then raise exception 'Seller application not found'; end if;
  if p_status = 'approved' then
    insert into public.user_roles(user_id, role) values (p_user_id, 'seller') on conflict do nothing;
  else
    delete from public.user_roles where user_id = p_user_id and role = 'seller';
  end if;
end;
$$;
revoke all on function public.review_seller_application(uuid,text,text,numeric) from public;
grant execute on function public.review_seller_application(uuid,text,text,numeric) to authenticated;

create or replace function public.get_seller_balance()
returns jsonb language plpgsql security definer set search_path = public as $$
declare available_amount numeric := 0; pending_amount numeric := 0; withdrawn_amount numeric := 0; rate numeric := 15;
begin
  select commission_rate into rate from public.seller_profiles where user_id = auth.uid() and status = 'approved';
  if not found then raise exception 'Approved seller access required'; end if;
  select coalesce(sum(amount * (1 - rate / 100)), 0) into available_amount from public.orders
    where seller_id = auth.uid() and status in ('delivered','completed') and coalesce(seller_available_at, created_at + interval '7 days') <= now();
  select coalesce(sum(amount * (1 - rate / 100)), 0) into pending_amount from public.orders
    where seller_id = auth.uid() and status in ('paid','delivered','completed') and coalesce(seller_available_at, created_at + interval '7 days') > now();
  select coalesce(sum(amount), 0) into withdrawn_amount from public.withdrawal_requests
    where seller_id = auth.uid() and status in ('pending','approved','paid');
  return jsonb_build_object('available', greatest(available_amount - withdrawn_amount, 0), 'pending', pending_amount, 'withdrawn', withdrawn_amount, 'commission_rate', rate);
end;
$$;
revoke all on function public.get_seller_balance() from public;
grant execute on function public.get_seller_balance() to authenticated;

create or replace function public.request_seller_withdrawal(p_amount numeric, p_currency text default 'INR', p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare balance jsonb; request_id uuid;
begin
  if p_amount < 500 then raise exception 'Minimum withdrawal is 500'; end if;
  if p_currency not in ('INR','USD') then raise exception 'Unsupported currency'; end if;
  balance := public.get_seller_balance();
  if p_amount > (balance->>'available')::numeric then raise exception 'Withdrawal exceeds available balance'; end if;
  insert into public.withdrawal_requests(seller_id, amount, currency, payout_note)
  values (auth.uid(), p_amount, p_currency, nullif(trim(p_note), '')) returning id into request_id;
  return request_id;
end;
$$;
revoke all on function public.request_seller_withdrawal(numeric,text,text) from public;
grant execute on function public.request_seller_withdrawal(numeric,text,text) to authenticated;

-- Existing ClashVault inventory belongs to the approved Arcus 87 seller.
do $$ declare owner_id uuid := 'fba43070-89a5-4c1d-b0dc-f6706136dd98'::uuid; owner_email text;
begin
  select email into owner_email from auth.users where id = owner_id;
  if owner_email is not null then
    insert into public.seller_profiles(user_id, display_name, legal_name, email, phone, country, categories, status, commission_rate, reviewed_at, reviewed_by)
    values(owner_id, 'Arcus 87', 'Arcus 87', owner_email, 'Admin verified', 'India', array['Accounts','Items','Services'], 'approved', 15, now(), owner_id)
    on conflict(user_id) do update set status = 'approved', display_name = 'Arcus 87';
    insert into public.user_roles(user_id, role) values(owner_id, 'seller') on conflict do nothing;
    update public.accounts set seller_id = owner_id, moderation_status = 'approved' where seller_id is null;
    update public.orders o set seller_id = a.seller_id from public.accounts a where o.account_id = a.id and o.seller_id is null;
  end if;
end $$;

-- Ensure new completed purchases are attached to the listing seller and held for seven days.
create or replace function public.finalize_account_purchase(p_account_id uuid, p_buyer_id uuid, p_buyer_email text, p_payment_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare purchased_account public.accounts%rowtype; existing_order public.orders%rowtype; created_order public.orders%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'This function can only be called by the payment service' using errcode = '42501'; end if;
  if p_account_id is null or p_buyer_id is null or nullif(trim(p_payment_id), '') is null then raise exception 'Missing required purchase information'; end if;
  select * into existing_order from public.orders where payment_id = p_payment_id limit 1;
  if found then return jsonb_build_object('success', true, 'idempotent', true, 'order_id', existing_order.id, 'account_id', existing_order.account_id); end if;
  select * into purchased_account from public.accounts where id = p_account_id for update;
  if not found or purchased_account.status <> 'available' or purchased_account.moderation_status <> 'approved' then
    return jsonb_build_object('success', false, 'reason', 'listing_unavailable', 'account_id', p_account_id);
  end if;
  update public.accounts set status = 'sold' where id = p_account_id;
  insert into public.orders(buyer_id,buyer_email,account_id,payment_id,amount,status,seller_id,seller_available_at)
  values(p_buyer_id,nullif(trim(p_buyer_email),''),p_account_id,p_payment_id,purchased_account.price,'delivered',purchased_account.seller_id,now()+interval '7 days') returning * into created_order;
  return jsonb_build_object('success', true, 'idempotent', false, 'order_id', created_order.id, 'account_id', p_account_id);
exception when unique_violation then return jsonb_build_object('success', false, 'reason', 'listing_unavailable', 'account_id', p_account_id);
end;
$$;
revoke all on function public.finalize_account_purchase(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.finalize_account_purchase(uuid,uuid,text,text) to service_role;
