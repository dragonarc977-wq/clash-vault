-- Run this once in the Supabase SQL Editor.
-- It allows the signed-in ClashVault administrator to edit account listings.

alter table public.accounts enable row level security;

drop policy if exists "Admin can update account listings" on public.accounts;

create policy "Admin can update account listings"
on public.accounts
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'dragonarc977@gmail.com')
with check ((auth.jwt() ->> 'email') = 'dragonarc977@gmail.com');
