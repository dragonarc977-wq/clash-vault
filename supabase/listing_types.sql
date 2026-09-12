-- Accounts, items and services with separate attributes and delivery methods.
-- Run after order_fulfillment.sql in Supabase SQL Editor.

alter table public.accounts
  add column if not exists title text,
  add column if not exists listing_type text not null default 'account',
  add column if not exists delivery_method text not null default 'seller_delivery',
  add column if not exists instant_delivery boolean not null default false,
  add column if not exists full_email_access boolean not null default false,
  add column if not exists platform text,
  add column if not exists region text,
  add column if not exists attributes jsonb not null default '{}'::jsonb;

update public.accounts set listing_type = lower(regexp_replace(coalesce(listing_type, 'account'), 's$', ''));
update public.accounts set listing_type = 'item' where listing_type in ('top-up','topup','currency');
update public.accounts set listing_type = 'service' where listing_type in ('boost','coaching');
update public.accounts set listing_type = 'account' where listing_type not in ('account','item','service');
update public.accounts set delivery_method = case when instant_delivery is true then 'instant' else 'seller_delivery' end
where delivery_method is null or delivery_method not in ('instant','seller_delivery','scheduled');

do $$ declare constraint_record record;
begin
  for constraint_record in select conname from pg_constraint
    where conrelid = 'public.accounts'::regclass and contype = 'c'
      and (pg_get_constraintdef(oid) ilike '%listing_type%' or pg_get_constraintdef(oid) ilike '%delivery_method%')
  loop execute format('alter table public.accounts drop constraint %I', constraint_record.conname); end loop;
end $$;

alter table public.accounts
  add constraint accounts_listing_type_check check (listing_type in ('account','item','service')),
  add constraint accounts_delivery_method_check check (delivery_method in ('instant','seller_delivery','scheduled'));

create or replace function public.validate_marketplace_listing()
returns trigger language plpgsql set search_path = public as $$
begin
  new.listing_type := lower(coalesce(new.listing_type, 'account'));
  new.delivery_method := lower(coalesce(new.delivery_method, 'seller_delivery'));
  new.attributes := coalesce(new.attributes, '{}'::jsonb);
  new.instant_delivery := new.delivery_method = 'instant';

  -- Seller-created and seller-edited products always require admin review.
  -- Admin and payment-service updates are not changed by this rule.
  if auth.uid() is not null and auth.role() <> 'service_role' and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.seller_id := auth.uid();
      new.status := 'available';
    else
      new.seller_id := old.seller_id;
      new.status := old.status;
    end if;
    new.moderation_status := 'pending';
  end if;

  if new.listing_type = 'item' then
    if nullif(trim(new.attributes->>'item_name'), '') is null then raise exception 'Item name is required'; end if;
    if coalesce((new.attributes->>'quantity')::integer, 0) < 1 then raise exception 'Item quantity must be at least 1'; end if;
  elsif new.listing_type = 'service' then
    if nullif(trim(new.attributes->>'service_name'), '') is null then raise exception 'Service name is required'; end if;
    if coalesce((new.attributes->>'estimated_days')::integer, 0) < 1 then raise exception 'Estimated completion time is required'; end if;
    new.delivery_method := 'scheduled';
    new.instant_delivery := false;
  end if;
  return new;
end;
$$;

drop trigger if exists validate_marketplace_listing on public.accounts;
create trigger validate_marketplace_listing before insert or update on public.accounts
for each row execute function public.validate_marketplace_listing();

create index if not exists accounts_game_type_available_idx
on public.accounts(game_id, listing_type, status, moderation_status);

-- Only currently approved sellers may change or remove their unsold products.
drop policy if exists "sellers update unsold listings" on public.accounts;
create policy "sellers update unsold listings" on public.accounts
for update to authenticated
using (seller_id = auth.uid() and status <> 'sold' and public.is_approved_seller())
with check (seller_id = auth.uid() and status <> 'sold' and public.is_approved_seller());

drop policy if exists "sellers delete unsold listings" on public.accounts;
create policy "sellers delete unsold listings" on public.accounts
for delete to authenticated
using (seller_id = auth.uid() and status <> 'sold' and public.is_approved_seller());

-- Delivery requirements depend on the product sold.
create or replace function public.deliver_marketplace_order(p_order_id uuid, p_delivery_payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare target_order public.orders%rowtype; product_type text;
begin
  select * into target_order from public.orders where id = p_order_id for update;
  if not found or target_order.seller_id <> auth.uid() then raise exception 'Seller order not found'; end if;
  if target_order.status <> 'paid' then raise exception 'This order is not awaiting delivery'; end if;
  select listing_type into product_type from public.accounts where id = target_order.account_id;
  if p_delivery_payload is null or jsonb_typeof(p_delivery_payload) <> 'object' then raise exception 'Delivery details are required'; end if;
  if product_type = 'account' and nullif(trim(p_delivery_payload->>'password'), '') is null then raise exception 'Account password is required'; end if;
  if product_type = 'item' and nullif(trim(coalesce(p_delivery_payload->>'code', p_delivery_payload->>'notes')), '') is null then raise exception 'Item code or delivery details are required'; end if;
  if product_type = 'service' and nullif(trim(p_delivery_payload->>'notes'), '') is null then raise exception 'Service completion details are required'; end if;

  insert into public.order_deliveries(order_id,seller_id,buyer_id,delivery_payload,delivered_at,updated_at)
  values(target_order.id,target_order.seller_id,target_order.buyer_id,p_delivery_payload,now(),now())
  on conflict(order_id) do update set delivery_payload=excluded.delivery_payload, delivered_at=now(), updated_at=now();
  update public.orders set status='delivered', delivered_at=now(), seller_available_at=now()+interval '7 days' where id=target_order.id;
end;
$$;
revoke all on function public.deliver_marketplace_order(uuid,jsonb) from public, anon;
grant execute on function public.deliver_marketplace_order(uuid,jsonb) to authenticated;
