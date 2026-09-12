-- Profile photos for every user and cover photos for approved sellers.
-- Run once in Supabase SQL Editor after user_public_ids.sql and seller_chat.sql.

alter table public.user_profiles add column if not exists avatar_url text;
alter table public.seller_profiles add column if not exists cover_url text;

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
  count(market_order.id) filter (where market_order.status in ('delivered','completed'))::bigint as total_sales,
  profile.cover_url
from public.seller_profiles profile
left join public.orders market_order on market_order.seller_id = profile.user_id
where profile.status = 'approved'
group by profile.user_id, profile.display_name, profile.created_at, profile.avatar_url, profile.cover_url;
revoke all on public.public_sellers from public;
grant select on public.public_sellers to anon, authenticated;
