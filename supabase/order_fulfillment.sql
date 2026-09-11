-- Secure seller delivery, buyer confirmation, disputes and protected release.
-- Run after seller_marketplace.sql in Supabase SQL Editor.

alter table public.orders
  add column if not exists delivered_at timestamptz,
  add column if not exists buyer_confirmed_at timestamptz,
  add column if not exists disputed_at timestamptz;

do $$ declare constraint_record record;
begin
  for constraint_record in select conname from pg_constraint
    where conrelid = 'public.orders'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop execute format('alter table public.orders drop constraint %I', constraint_record.conname); end loop;
end $$;

alter table public.orders add constraint orders_status_check
check (status in ('pending','processing','paid','awaiting_delivery','delivered','completed','disputed','refunded','cancelled','failed'));

create table if not exists public.order_deliveries (
  order_id uuid primary key references public.orders(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  delivery_payload jsonb not null,
  delivered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  seller_id uuid references auth.users(id) on delete restrict,
  reason text not null check (char_length(reason) between 3 and 80),
  details text not null check (char_length(details) between 10 and 2000),
  status text not null default 'open' check (status in ('open', 'resolved_buyer', 'resolved_seller')),
  resolution_notes text,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists one_open_dispute_per_order
on public.order_disputes(order_id) where status = 'open';

alter table public.order_deliveries enable row level security;
alter table public.order_disputes enable row level security;

do $$ declare policy_record record;
begin
  for policy_record in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('order_deliveries', 'order_disputes')
  loop execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename); end loop;
end $$;

create policy "order parties view delivery" on public.order_deliveries
for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy "order parties view disputes" on public.order_disputes
for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy "admins manage disputes" on public.order_disputes
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.deliver_marketplace_order(p_order_id uuid, p_delivery_payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare target_order public.orders%rowtype;
begin
  select * into target_order from public.orders where id = p_order_id for update;
  if not found or target_order.seller_id <> auth.uid() then raise exception 'Seller order not found'; end if;
  if target_order.status <> 'paid' then raise exception 'This order is not awaiting delivery'; end if;
  if p_delivery_payload is null or jsonb_typeof(p_delivery_payload) <> 'object'
     or char_length(trim(coalesce(p_delivery_payload->>'password', ''))) < 1 then
    raise exception 'Complete delivery details are required';
  end if;

  insert into public.order_deliveries(order_id, seller_id, buyer_id, delivery_payload, delivered_at, updated_at)
  values(target_order.id, target_order.seller_id, target_order.buyer_id, p_delivery_payload, now(), now())
  on conflict(order_id) do update set delivery_payload = excluded.delivery_payload,
    delivered_at = now(), updated_at = now();

  update public.orders set status = 'delivered', delivered_at = now(),
    seller_available_at = now() + interval '7 days'
  where id = target_order.id;
end;
$$;

create or replace function public.confirm_marketplace_delivery(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.orders set status = 'completed', buyer_confirmed_at = now()
  where id = p_order_id and buyer_id = auth.uid() and status = 'delivered';
  if not found then raise exception 'Delivered order not found'; end if;
end;
$$;

create or replace function public.open_marketplace_dispute(p_order_id uuid, p_reason text, p_details text)
returns uuid language plpgsql security definer set search_path = public as $$
declare target_order public.orders%rowtype; dispute_id uuid;
begin
  select * into target_order from public.orders where id = p_order_id for update;
  if not found or target_order.buyer_id <> auth.uid() then raise exception 'Buyer order not found'; end if;
  if target_order.status not in ('delivered', 'completed') then raise exception 'Only a delivered order can be disputed'; end if;
  if target_order.delivered_at is null or target_order.delivered_at + interval '7 days' < now() then raise exception 'The protection period has ended'; end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 or char_length(trim(coalesce(p_details, ''))) < 10 then raise exception 'Add a reason and clear details'; end if;

  insert into public.order_disputes(order_id,buyer_id,seller_id,reason,details)
  values(target_order.id,target_order.buyer_id,target_order.seller_id,trim(p_reason),trim(p_details))
  returning id into dispute_id;
  update public.orders set status = 'disputed', disputed_at = now(), seller_available_at = null where id = target_order.id;
  return dispute_id;
end;
$$;

create or replace function public.resolve_marketplace_dispute(p_dispute_id uuid, p_resolution text, p_notes text default null)
returns void language plpgsql security definer set search_path = public as $$
declare target_dispute public.order_disputes%rowtype;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_resolution not in ('buyer', 'seller') then raise exception 'Invalid dispute resolution'; end if;
  select * into target_dispute from public.order_disputes where id = p_dispute_id and status = 'open' for update;
  if not found then raise exception 'Open dispute not found'; end if;

  update public.order_disputes set status = case when p_resolution = 'buyer' then 'resolved_buyer' else 'resolved_seller' end,
    resolution_notes = nullif(trim(p_notes), ''), resolved_by = auth.uid(), resolved_at = now()
  where id = target_dispute.id;

  update public.orders set
    status = case when p_resolution = 'buyer' then 'refunded' else 'completed' end,
    seller_available_at = case when p_resolution = 'seller' then now() else null end
  where id = target_dispute.order_id;
end;
$$;

revoke all on function public.deliver_marketplace_order(uuid,jsonb) from public, anon;
revoke all on function public.confirm_marketplace_delivery(uuid) from public, anon;
revoke all on function public.open_marketplace_dispute(uuid,text,text) from public, anon;
revoke all on function public.resolve_marketplace_dispute(uuid,text,text) from public, anon;
grant execute on function public.deliver_marketplace_order(uuid,jsonb) to authenticated;
grant execute on function public.confirm_marketplace_delivery(uuid) to authenticated;
grant execute on function public.open_marketplace_dispute(uuid,text,text) to authenticated;
grant execute on function public.resolve_marketplace_dispute(uuid,text,text) to authenticated;

-- A captured payment now creates an order awaiting seller delivery.
create or replace function public.finalize_account_purchase(p_account_id uuid, p_buyer_id uuid, p_buyer_email text, p_payment_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare purchased_account public.accounts%rowtype; existing_order public.orders%rowtype; created_order public.orders%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'This function can only be called by the payment service' using errcode = '42501'; end if;
  if p_account_id is null or p_buyer_id is null or nullif(trim(p_payment_id), '') is null then raise exception 'Missing required purchase information'; end if;
  select * into existing_order from public.orders where payment_id = p_payment_id limit 1;
  if found then return jsonb_build_object('success',true,'idempotent',true,'order_id',existing_order.id,'account_id',existing_order.account_id); end if;
  select * into purchased_account from public.accounts where id = p_account_id for update;
  if not found or purchased_account.status <> 'available' or purchased_account.moderation_status <> 'approved' then
    return jsonb_build_object('success',false,'reason','listing_unavailable','account_id',p_account_id);
  end if;
  update public.accounts set status = 'sold' where id = p_account_id;
  insert into public.orders(buyer_id,buyer_email,account_id,payment_id,amount,status,seller_id,seller_available_at)
  values(p_buyer_id,nullif(trim(p_buyer_email),''),p_account_id,p_payment_id,purchased_account.price,'paid',purchased_account.seller_id,null)
  returning * into created_order;
  return jsonb_build_object('success',true,'idempotent',false,'order_id',created_order.id,'account_id',p_account_id);
exception when unique_violation then return jsonb_build_object('success',false,'reason','listing_unavailable','account_id',p_account_id);
end;
$$;
revoke all on function public.finalize_account_purchase(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.finalize_account_purchase(uuid,uuid,text,text) to service_role;
