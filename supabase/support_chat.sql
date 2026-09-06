-- Run this once in Supabase Dashboard → SQL Editor.
-- Then add YOUR Supabase user ID to support_agents (see the final INSERT below).

create table if not exists public.support_agents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_support_agent()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.support_agents where user_id = auth.uid()) $$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  buyer_email text not null,
  subject text not null check (char_length(subject) between 1 and 120),
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'agent')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_buyer_last_message on public.support_tickets (buyer_id, last_message_at desc);
create index if not exists support_messages_ticket_created on public.support_messages (ticket_id, created_at);

create or replace function public.touch_support_ticket()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.support_tickets set last_message_at = now(), status = 'open' where id = new.ticket_id;
  return new;
end $$;
drop trigger if exists support_message_touch_ticket on public.support_messages;
create trigger support_message_touch_ticket after insert on public.support_messages for each row execute function public.touch_support_ticket();

alter table public.support_agents enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

create policy "agents can see agent list" on public.support_agents for select to authenticated using (user_id = auth.uid());
create policy "buyers and agents read tickets" on public.support_tickets for select to authenticated using (buyer_id = auth.uid() or public.is_support_agent());
create policy "buyers create their tickets" on public.support_tickets for insert to authenticated with check (buyer_id = auth.uid() and buyer_email = auth.jwt() ->> 'email');
create policy "agents update tickets" on public.support_tickets for update to authenticated using (public.is_support_agent()) with check (public.is_support_agent());
create policy "buyers and agents read messages" on public.support_messages for select to authenticated using (public.is_support_agent() or exists (select 1 from public.support_tickets t where t.id = ticket_id and t.buyer_id = auth.uid()));
create policy "buyers send messages" on public.support_messages for insert to authenticated with check (sender_id = auth.uid() and sender_role = 'buyer' and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.buyer_id = auth.uid() and t.status = 'open'));
create policy "agents send messages" on public.support_messages for insert to authenticated with check (sender_id = auth.uid() and sender_role = 'agent' and public.is_support_agent());

alter publication supabase_realtime add table public.support_tickets;
alter publication supabase_realtime add table public.support_messages;

-- Replace the UUID with your own id from Supabase Dashboard → Authentication → Users:
-- insert into public.support_agents (user_id) values ('YOUR-USER-ID');
