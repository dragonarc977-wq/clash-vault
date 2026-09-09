import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const formatTime = (value) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
const ChatIcon = ({ className = 'h-6 w-6' }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h13v12Z" /></svg>;

export default function Support() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const active = useMemo(() => tickets.find((ticket) => ticket.id === activeTicket) || null, [tickets, activeTicket]);

  useEffect(() => {
    let channel;
    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      setAccessToken(session.access_token);
      const [{ data: ticketData }, { data: orderData }] = await Promise.all([
        supabase.from('support_tickets').select('*').eq('buyer_id', currentUser.id).order('last_message_at', { ascending: false }),
        supabase.from('orders').select('id, amount, status, accounts(town_hall)').eq('buyer_id', currentUser.id).order('created_at', { ascending: false }),
      ]);
      const nextTickets = ticketData || [];
      setTickets(nextTickets);
      setOrders(orderData || []);
      setActiveTicket(nextTickets[0]?.id || null);
      setLoading(false);
      channel = supabase.channel(`buyer-support-${currentUser.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `buyer_id=eq.${currentUser.id}` }, () => refreshTickets(currentUser.id)).subscribe();
    };
    boot();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [navigate]);

  useEffect(() => {
    if (!activeTicket) {
      return undefined;
    }
    let channel;
    const loadMessages = async () => {
      const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', activeTicket).order('created_at');
      setMessages(data || []);
      channel = supabase.channel(`support-messages-${activeTicket}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${activeTicket}` }, (payload) => {
        setMessages((current) => current.some((message) => message.id === payload.new.id) ? current : [...current, payload.new]);
        refreshTickets(user?.id);
      }).subscribe();
    };
    loadMessages();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [activeTicket, user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function refreshTickets(buyerId) {
    if (!buyerId) return;
    const { data } = await supabase.from('support_tickets').select('*').eq('buyer_id', buyerId).order('last_message_at', { ascending: false });
    if (data) {
      setTickets(data);
      setActiveTicket((current) => current || data[0]?.id || null);
    }
  }

  async function createTicket(event) {
    event.preventDefault();
    if (!subject.trim() || !user) return;
    setCreating(true);
    setNotice('');
    try {
      if (!accessToken) throw new Error('Your session has expired. Please sign in again.');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_tickets`, {
        method: 'POST',
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ buyer_id: user.id, buyer_email: user.email, subject: subject.trim(), order_id: selectedOrder || null }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error((await response.text()) || 'Unable to create this conversation.');
      await refreshTickets(user.id);
      setSubject('');
      setSelectedOrder('');
      setShowModal(false);
    } catch (error) {
      setNotice(error.name === 'TimeoutError' ? 'Support is taking too long to respond. Please try again.' : error.message);
    } finally {
      setCreating(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim() || !activeTicket || !user) return;
    setSending(true);
    setNotice('');
    const body = text.trim();
    setText('');
    const { error } = await supabase.from('support_messages').insert({ ticket_id: activeTicket, sender_id: user.id, sender_role: 'buyer', body });
    if (error) {
      setText(body);
      setNotice(error.message);
    }
    setSending(false);
  }

  return <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-24 text-zinc-950 sm:px-8 sm:pt-28">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77e00]">ClashVault care</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">Buyer support</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">Private help from our support team.</p>
        </div>
        <div className="flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700"><span className="mr-2 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />Support team online</div>
      </header>

      {notice && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{notice}</div>}

      {loading ? <div className="mt-8 h-[620px] animate-pulse rounded-3xl border border-zinc-200 bg-white" /> : <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:grid lg:h-[680px] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-zinc-200 bg-white p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
          <button onClick={() => setShowModal(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white transition hover:bg-[#b77e00]"><span className="text-lg leading-none">+</span> Start a conversation</button>
          <div className="mt-6 flex items-center justify-between px-1"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Your conversations</p><span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">{tickets.length}</span></div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
            {tickets.length ? tickets.map((ticket) => <button key={ticket.id} onClick={() => setActiveTicket(ticket.id)} className={`min-w-[230px] rounded-2xl border p-4 text-left transition lg:w-full lg:min-w-0 ${activeTicket === ticket.id ? 'border-yellow-300 bg-yellow-50' : 'border-transparent bg-zinc-50 hover:border-zinc-200'}`}>
              <span className="block truncate text-sm font-bold text-zinc-900">{ticket.subject}</span>
              <span className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500"><span className={`font-bold capitalize ${ticket.status === 'open' ? 'text-emerald-600' : 'text-zinc-500'}`}>{ticket.status}</span><span>{formatTime(ticket.last_message_at)}</span></span>
            </button>) : <p className="px-2 py-5 text-sm text-zinc-500">No conversations yet.</p>}
          </div>
        </aside>

        <section className="flex min-h-[560px] min-w-0 flex-col bg-white lg:min-h-0">
          {active ? <>
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-5 sm:px-7">
              <div className="min-w-0"><h2 className="truncate text-lg font-black sm:text-xl">{active.subject}</h2><p className="mt-1 text-xs text-zinc-500">{active.status === 'open' ? 'Our team will reply here.' : 'This conversation is resolved.'}</p></div>
              <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ring-1 ${active.status === 'open' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-zinc-100 text-zinc-600 ring-zinc-200'}`}>{active.status}</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-zinc-50/70 p-5 sm:p-7">
              {messages.length === 0 && <div className="mx-auto mt-20 max-w-sm text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200"><ChatIcon /></span><h3 className="mt-5 text-xl font-black">How can we help?</h3><p className="mt-2 text-sm leading-6 text-zinc-500">Send a message and our support team will respond in this private conversation.</p></div>}
              {messages.map((message) => <div key={message.id} className={`mb-5 flex max-w-[85%] flex-col sm:max-w-[72%] ${message.sender_role === 'buyer' ? 'ml-auto items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.sender_role === 'buyer' ? 'rounded-br-md bg-zinc-950 text-white' : 'rounded-bl-md border border-zinc-200 bg-white text-zinc-800'}`}>{message.body}</div>
                <small className="mt-1.5 px-1 text-[10px] text-zinc-400">{message.sender_role === 'buyer' ? 'You' : 'ClashVault Support'} · {formatTime(message.created_at)}</small>
              </div>)}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-zinc-200 bg-white p-3 sm:gap-3 sm:p-5">
              <input value={text} onChange={(event) => setText(event.target.value)} placeholder={active.status === 'open' ? 'Write a message…' : 'This conversation is resolved'} maxLength="2000" disabled={active.status !== 'open'} className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#c68d00] focus:bg-white focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed" />
              <button disabled={sending || active.status !== 'open'} className="rounded-2xl bg-yellow-300 px-5 text-sm font-black text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-7">{sending ? 'Sending…' : 'Send'}</button>
            </form>
          </> : <div className="m-auto max-w-sm px-6 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-500"><ChatIcon /></span><h2 className="mt-5 text-2xl font-black">Welcome to buyer support</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Start a private conversation whenever you need help with an order.</p><button onClick={() => setShowModal(true)} className="mt-6 rounded-full bg-yellow-300 px-6 py-3 text-sm font-black transition hover:bg-yellow-400">Start a conversation</button></div>}
        </section>
      </div>}
    </div>

    {showModal && <div className="fixed inset-0 z-[3000] grid place-items-center bg-zinc-950/50 p-4 backdrop-blur-sm" onMouseDown={() => setShowModal(false)}>
      <form onSubmit={createTicket} onMouseDown={(event) => event.stopPropagation()} className="relative w-full max-w-md rounded-3xl bg-white p-6 text-zinc-950 shadow-2xl sm:p-8">
        <button type="button" onClick={() => setShowModal(false)} aria-label="Close" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-xl text-zinc-500 transition hover:bg-zinc-50">×</button>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b77e00]">New conversation</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Tell us what you need</h2>
        <p className="mt-2 pr-8 text-sm leading-6 text-zinc-500">Your message and purchase details stay private.</p>
        <label className="mt-6 block text-sm font-bold">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Example: Help with my delivery" maxLength="120" autoFocus className="mt-2 h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-[#c68d00] focus:bg-white focus:ring-4 focus:ring-yellow-100" /></label>
        <label className="mt-5 block text-sm font-bold">Related order<select value={selectedOrder} onChange={(event) => setSelectedOrder(event.target.value)} className="mt-2 h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-[#c68d00] focus:bg-white focus:ring-4 focus:ring-yellow-100"><option value="">General question</option>{orders.map((order) => <option value={order.id} key={order.id}>TH{order.accounts?.town_hall || '?'} · ₹{order.amount} · #{order.id.slice(0, 8)}</option>)}</select></label>
        <button disabled={creating} className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white transition hover:bg-[#b77e00] disabled:cursor-not-allowed disabled:opacity-60">{creating ? 'Creating…' : 'Create conversation'}</button>
      </form>
    </div>}
  </main>;
}
