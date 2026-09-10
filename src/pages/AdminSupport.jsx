import { useEffect, useMemo, useRef, useState } from 'react';
import supabase from '../lib/supabase';

const ADMIN_EMAIL = 'dragonarc977@gmail.com';
const formatTime = (value) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const ChatIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;

export default function AdminSupport() {
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const active = useMemo(() => tickets.find((ticket) => ticket.id === activeTicket), [tickets, activeTicket]);
  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? tickets.filter((ticket) => `${ticket.subject} ${ticket.buyer_email} ${ticket.status}`.toLowerCase().includes(query)) : tickets;
  }, [search, tickets]);

  useEffect(() => {
    let channel;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        setNotice('Admin support access is not authorized for this account.');
        setLoading(false);
        return;
      }
      setUser(currentUser);
      const data = await loadTickets();
      setActiveTicket(data?.[0]?.id || null);
      setLoading(false);
      channel = supabase.channel('admin-tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, loadTickets).subscribe();
    };
    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!activeTicket) return undefined;
    let channel;
    const load = async () => {
      const { data, error } = await supabase.from('support_messages').select('*').eq('ticket_id', activeTicket).order('created_at');
      if (error) setNotice('Could not load this conversation.');
      else setMessages(data || []);
      channel = supabase.channel(`admin-msg-${activeTicket}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${activeTicket}` }, (payload) => {
        setMessages((current) => current.some((message) => message.id === payload.new.id) ? current : [...current, payload.new]);
        loadTickets();
      }).subscribe();
    };
    load();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [activeTicket]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadTickets() {
    const { data, error } = await supabase.from('support_tickets').select('*').order('last_message_at', { ascending: false });
    if (error) {
      setNotice('Could not load support tickets.');
      return [];
    }
    setTickets(data || []);
    return data || [];
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim() || !activeTicket || !user) return;
    const body = text.trim();
    setText('');
    setSending(true);
    const { error } = await supabase.from('support_messages').insert({ ticket_id: activeTicket, sender_id: user.id, sender_role: 'agent', body });
    if (error) {
      setText(body);
      setNotice(error.message);
    }
    setSending(false);
  }

  async function updateStatus(status) {
    if (!activeTicket) return;
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', activeTicket);
    if (error) setNotice(error.message);
    else await loadTickets();
  }

  if (loading) return <div className="h-[680px] animate-pulse rounded-3xl border border-zinc-200 bg-white" />;

  return <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:grid lg:h-[680px] lg:grid-cols-[330px_1fr]">
    <aside className="border-b border-zinc-200 bg-white p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
      <div><h2 className="text-xl font-black">Support inbox</h2><p className="mt-1 text-sm text-zinc-500">{tickets.filter((ticket) => ticket.status === 'open').length} open conversations</p></div>
      <label className="mt-5 flex h-11 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 focus-within:border-[#c68d00]"><svg className="mr-2 h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" strokeWidth="1.8" /><path d="m20 20-4-4" strokeWidth="1.8" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">{visibleTickets.map((ticket) => <button key={ticket.id} onClick={() => setActiveTicket(ticket.id)} className={`min-w-[240px] rounded-2xl border p-4 text-left transition lg:w-full lg:min-w-0 ${activeTicket === ticket.id ? 'border-yellow-300 bg-yellow-50' : 'border-transparent bg-zinc-50 hover:border-zinc-200'}`}><div className="flex items-start justify-between gap-3"><span className="truncate text-sm font-black">{ticket.subject}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase ${ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>{ticket.status}</span></div><p className="mt-2 truncate text-xs text-zinc-500">{ticket.buyer_email}</p><p className="mt-2 text-[10px] font-semibold text-zinc-400">{formatTime(ticket.last_message_at)}</p></button>)}{visibleTickets.length === 0 && <p className="px-2 py-8 text-center text-sm text-zinc-400">No conversations found.</p>}</div>
    </aside>

    <div className="flex min-h-[560px] min-w-0 flex-col lg:min-h-0">
      {notice && <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-800">{notice}</div>}
      {active ? <>
        <header className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="min-w-0"><h2 className="truncate text-lg font-black">{active.subject}</h2><p className="mt-1 truncate text-xs text-zinc-500">{active.buyer_email}{active.order_id ? ` · Order #${active.order_id.slice(0, 8).toUpperCase()}` : ''}</p></div><div className="flex gap-2">{active.status === 'open' ? <button onClick={() => updateStatus('resolved')} className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold transition hover:border-red-300 hover:bg-red-50 hover:text-red-700">Resolve</button> : <button onClick={() => updateStatus('open')} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700">Reopen</button>}</div></header>
        <div className="flex-1 overflow-y-auto bg-zinc-50/70 p-5 sm:p-7">{messages.length === 0 && <div className="mx-auto mt-20 max-w-sm text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-zinc-400 shadow-sm ring-1 ring-zinc-200"><ChatIcon /></span><h3 className="mt-5 text-xl font-black">No messages yet</h3><p className="mt-2 text-sm text-zinc-500">The conversation is ready for a reply.</p></div>}{messages.map((message) => <div key={message.id} className={`mb-5 flex max-w-[85%] flex-col sm:max-w-[72%] ${message.sender_role === 'agent' ? 'ml-auto items-end' : 'items-start'}`}><div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.sender_role === 'agent' ? 'rounded-br-md bg-zinc-950 text-white' : 'rounded-bl-md border border-zinc-200 bg-white text-zinc-800'}`}>{message.body}</div><small className="mt-1.5 text-[10px] text-zinc-400">{message.sender_role === 'agent' ? 'You' : active.buyer_email} · {formatTime(message.created_at)}</small></div>)}<div ref={bottomRef} /></div>
        <form onSubmit={sendMessage} className="flex gap-2 border-t border-zinc-200 p-3 sm:gap-3 sm:p-5"><input value={text} onChange={(event) => setText(event.target.value)} placeholder={active.status === 'open' ? 'Write a reply…' : 'This conversation is resolved'} disabled={active.status !== 'open'} maxLength="2000" className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-[#c68d00] focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed" /><button disabled={sending || active.status !== 'open'} className="rounded-2xl bg-yellow-300 px-5 text-sm font-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-7">{sending ? 'Sending…' : 'Send'}</button></form>
      </> : <div className="m-auto max-w-sm px-6 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-400"><ChatIcon /></span><h2 className="mt-5 text-2xl font-black">Support inbox is clear</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Select a conversation when a buyer needs help.</p></div>}
    </div>
  </section>;
}
