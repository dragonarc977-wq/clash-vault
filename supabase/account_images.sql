-- Run once in Supabase Dashboard -> SQL Editor.
-- Creates the public listing-image bucket and saves all gallery URLs on accounts.

alter table public.accounts
  add column if not exists image_urls text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'account-images',
  'account-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view account images" on storage.objects;
create policy "Public can view account images"
on storage.objects for select
to public
using (bucket_id = 'account-images');

drop policy if exists "Admin can upload account images" on storage.objects;
create policy "Admin can upload account images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'account-images'
  and (auth.jwt() ->> 'email') = 'dragonarc977@gmail.com'
);

drop policy if exists "Admin can update account images" on storage.objects;
create policy "Admin can update account images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'account-images'
  and (auth.jwt() ->> 'email') = 'dragonarc977@gmail.com'
)
with check (
  bucket_id = 'account-images'
  and (auth.jwt() ->> 'email') = 'dragonarc977@gmail.com'
);

drop policy if exists "Admin can delete account images" on storage.objects;
create policy "Admin can delete account images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'account-images'
  and (auth.jwt() ->> 'email') = 'dragonarc977@gmail.com'
);
