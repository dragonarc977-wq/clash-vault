-- Run this once in the Supabase SQL Editor.
-- It allows users with the Supabase admin role to edit account listings.
-- Run admin_roles.sql first.

alter table public.accounts enable row level security;

drop policy if exists "Admin can update account listings" on public.accounts;

create policy "Admin can update account listings"
on public.accounts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
