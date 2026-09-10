-- Run once in Supabase Dashboard -> SQL Editor before deploying the website update.
-- Makes payment completion atomic and prevents more than one order per listing.

alter table public.accounts
  add column if not exists status text not null default 'available';

alter table public.orders
  add column if not exists buyer_email text,
  add column if not exists amount numeric,
  add column if not exists payment_id text;

create unique index if not exists orders_one_purchase_per_account
  on public.orders (account_id);

create unique index if not exists orders_unique_payment_id
  on public.orders (payment_id)
  where payment_id is not null;

create or replace function public.finalize_account_purchase(
  p_account_id uuid,
  p_buyer_id uuid,
  p_buyer_email text,
  p_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  purchased_account public.accounts%rowtype;
  existing_order public.orders%rowtype;
  created_order public.orders%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'This function can only be called by the payment service.'
      using errcode = '42501';
  end if;

  if p_account_id is null or p_buyer_id is null or nullif(trim(p_payment_id), '') is null then
    raise exception 'Missing required purchase information.'
      using errcode = '22023';
  end if;

  -- Razorpay may retry a webhook. Return the original order without creating another.
  select * into existing_order
  from public.orders
  where payment_id = p_payment_id
  limit 1;

  if found then
    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'order_id', existing_order.id,
      'account_id', existing_order.account_id
    );
  end if;

  -- The row lock serializes simultaneous attempts for the same listing.
  select * into purchased_account
  from public.accounts
  where id = p_account_id
  for update;

  if not found or purchased_account.status <> 'available' then
    return jsonb_build_object(
      'success', false,
      'reason', 'listing_unavailable',
      'account_id', p_account_id
    );
  end if;

  update public.accounts
  set status = 'sold'
  where id = p_account_id;

  insert into public.orders (
    buyer_id,
    buyer_email,
    account_id,
    payment_id,
    amount,
    status
  ) values (
    p_buyer_id,
    nullif(trim(p_buyer_email), ''),
    p_account_id,
    p_payment_id,
    purchased_account.price,
    'delivered'
  )
  returning * into created_order;

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'order_id', created_order.id,
    'account_id', p_account_id
  );
exception
  when unique_violation then
    -- A database constraint is the final guard even if two requests race.
    return jsonb_build_object(
      'success', false,
      'reason', 'listing_unavailable',
      'account_id', p_account_id
    );
end;
$$;

revoke all on function public.finalize_account_purchase(uuid, uuid, text, text) from public;
revoke all on function public.finalize_account_purchase(uuid, uuid, text, text) from anon;
revoke all on function public.finalize_account_purchase(uuid, uuid, text, text) from authenticated;
grant execute on function public.finalize_account_purchase(uuid, uuid, text, text) to service_role;

-- Enables instant removal of sold listings from open buyer pages.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'accounts'
  ) then
    alter publication supabase_realtime add table public.accounts;
  end if;
end
$$;
