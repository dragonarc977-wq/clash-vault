-- Private buyer-to-seller listing conversations.
-- Run once in Supabase SQL Editor after seller_marketplace.sql.

alter table public.seller_profiles add column if not exists avatar_url text;

create table if not exists public.seller_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.accounts(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(user_id) on delete cascade,
  status text not null default 'open' check (status in ('open','closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table if not exists public.seller_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.seller_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer','seller')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists seller_conversations_buyer_idx on public.seller_conversations(buyer_id,last_message_at desc);
create index if not exists seller_conversations_seller_idx on public.seller_conversations(seller_id,last_message_at desc);
create index if not exists seller_messages_conversation_idx on public.seller_messages(conversation_id,created_at);

alter table public.seller_conversations enable row level security;
alter table public.seller_messages enable row level security;

drop policy if exists "participants view seller conversations" on public.seller_conversations;
create policy "participants view seller conversations" on public.seller_conversations
for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "participants view seller messages" on public.seller_messages;
create policy "participants view seller messages" on public.seller_messages
for select to authenticated using (exists (
  select 1 from public.seller_conversations conversation
  where conversation.id = conversation_id and (conversation.buyer_id = auth.uid() or conversation.seller_id = auth.uid())
));

drop policy if exists "participants send seller messages" on public.seller_messages;
create policy "participants send seller messages" on public.seller_messages
for insert to authenticated with check (
  sender_id = auth.uid() and exists (
    select 1 from public.seller_conversations conversation where conversation.id = conversation_id
      and conversation.status = 'open'
      and ((conversation.buyer_id = auth.uid() and sender_role = 'buyer') or (conversation.seller_id = auth.uid() and sender_role = 'seller'))
  )
);

grant select on public.seller_conversations to authenticated;
grant select, insert on public.seller_messages to authenticated;

create or replace function public.open_seller_conversation(p_listing_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare listing public.accounts%rowtype; conversation_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  select * into listing from public.accounts where id = p_listing_id;
  if not found or listing.seller_id is null then raise exception 'Seller chat is unavailable for this listing'; end if;
  if listing.seller_id = auth.uid() then raise exception 'You cannot open a buyer chat with your own listing'; end if;
  if not (listing.status = 'available' and listing.moderation_status = 'approved')
    and not exists (select 1 from public.orders where account_id = listing.id and buyer_id = auth.uid()) then
    raise exception 'This listing is unavailable';
  end if;
  insert into public.seller_conversations(listing_id,buyer_id,seller_id)
  values(listing.id,auth.uid(),listing.seller_id)
  on conflict(listing_id,buyer_id) do update set last_message_at = public.seller_conversations.last_message_at
  returning id into conversation_id;
  return conversation_id;
end;
$$;
revoke all on function public.open_seller_conversation(uuid) from public, anon;
grant execute on function public.open_seller_conversation(uuid) to authenticated;

create or replace function public.touch_seller_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.seller_conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end;
$$;
drop trigger if exists seller_message_touch_conversation on public.seller_messages;
create trigger seller_message_touch_conversation after insert on public.seller_messages
for each row execute function public.touch_seller_conversation();

-- Safe public seller information with real fulfilled-sale totals.
create or replace view public.public_sellers with (security_invoker = false) as
select profile.user_id, profile.display_name, profile.created_at, profile.avatar_url,
  count(market_order.id) filter (where market_order.status in ('delivered','completed'))::bigint as total_sales
from public.seller_profiles profile
left join public.orders market_order on market_order.seller_id = profile.user_id
where profile.status = 'approved'
group by profile.user_id, profile.display_name, profile.created_at, profile.avatar_url;
revoke all on public.public_sellers from public;
grant select on public.public_sellers to anon, authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('seller-avatars','seller-avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "public views seller avatars" on storage.objects;
create policy "public views seller avatars" on storage.objects for select to public using (bucket_id='seller-avatars');
drop policy if exists "sellers upload own avatar" on storage.objects;
create policy "sellers upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id='seller-avatars' and (storage.foldername(name))[1]=auth.uid()::text and public.is_approved_seller());
drop policy if exists "sellers update own avatar" on storage.objects;
create policy "sellers update own avatar" on storage.objects for update to authenticated
using (bucket_id='seller-avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='seller-avatars' and (storage.foldername(name))[1]=auth.uid()::text and public.is_approved_seller());

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='seller_messages') then
    alter publication supabase_realtime add table public.seller_messages;
  end if;
end $$;
