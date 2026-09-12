-- Profile photos for every user and cover photos for approved sellers.
-- Run once in Supabase SQL Editor after user_public_ids.sql and seller_chat.sql.

alter table public.user_profiles add column if not exists avatar_url text;
alter table public.seller_profiles add column if not exists cover_url text;

create table if not exists public.seller_feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  seller_id uuid not null references public.seller_profiles(user_id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(trim(comment)) between 3 and 500),
  created_at timestamptz not null default now()
);

create index if not exists seller_feedback_seller_idx on public.seller_feedback(seller_id,created_at desc);
alter table public.seller_feedback enable row level security;
drop policy if exists "public reads seller feedback" on public.seller_feedback;
drop policy if exists "buyers read their own seller feedback" on public.seller_feedback;
create policy "buyers read their own seller feedback" on public.seller_feedback for select to authenticated
using (buyer_id = auth.uid());
drop policy if exists "buyers review completed orders" on public.seller_feedback;
create policy "buyers review completed orders" on public.seller_feedback for insert to authenticated
with check (
  public.seller_feedback.buyer_id = auth.uid() and exists (
    select 1 from public.orders purchase
    where purchase.id = public.seller_feedback.order_id and purchase.buyer_id = auth.uid()
      and purchase.seller_id = public.seller_feedback.seller_id and purchase.status in ('delivered','completed')
  )
);
revoke all on public.seller_feedback from anon;
grant select on public.seller_feedback to authenticated;
grant insert on public.seller_feedback to authenticated;

create or replace view public.public_seller_feedback with (security_invoker = false) as
select id, seller_id, rating, comment, created_at from public.seller_feedback;
revoke all on public.public_seller_feedback from public;
grant select on public.public_seller_feedback to anon, authenticated;

drop policy if exists "Users can update their own profile picture" on public.user_profiles;
create policy "Users can update their own profile picture" on public.user_profiles for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
grant update (avatar_url) on public.user_profiles to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-avatars','profile-avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('seller-covers','seller-covers',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "public views profile avatars" on storage.objects;
create policy "public views profile avatars" on storage.objects for select to public
using (bucket_id='profile-avatars');
drop policy if exists "users upload own profile avatar" on storage.objects;
create policy "users upload own profile avatar" on storage.objects for insert to authenticated
with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "users update own profile avatar" on storage.objects;
create policy "users update own profile avatar" on storage.objects for update to authenticated
using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "public views seller covers" on storage.objects;
create policy "public views seller covers" on storage.objects for select to public
using (bucket_id='seller-covers');
drop policy if exists "sellers upload own cover" on storage.objects;
create policy "sellers upload own cover" on storage.objects for insert to authenticated
with check (bucket_id='seller-covers' and (storage.foldername(name))[1]=auth.uid()::text and public.is_approved_seller());
drop policy if exists "sellers update own cover" on storage.objects;
create policy "sellers update own cover" on storage.objects for update to authenticated
using (bucket_id='seller-covers' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='seller-covers' and (storage.foldername(name))[1]=auth.uid()::text and public.is_approved_seller());

create or replace view public.public_sellers with (security_invoker = false) as
select profile.user_id, profile.display_name, profile.created_at, profile.avatar_url,
  (select count(*) from public.orders market_order where market_order.seller_id = profile.user_id and market_order.status in ('delivered','completed'))::bigint as total_sales,
  profile.cover_url,
  (select round(avg(feedback.rating)::numeric, 1) from public.seller_feedback feedback where feedback.seller_id = profile.user_id) as average_rating,
  (select count(*) from public.seller_feedback feedback where feedback.seller_id = profile.user_id)::bigint as feedback_count
from public.seller_profiles profile
where profile.status = 'approved';
revoke all on public.public_sellers from public;
grant select on public.public_sellers to anon, authenticated;
