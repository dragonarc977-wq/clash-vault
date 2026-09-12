import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';

const time = (value) => value ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '';
const ChatIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;

export default function SellerMessages() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sellerNames, setSellerNames] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const active = useMemo(() => conversations.find((item) => item.id === activeId) || null, [activeId, conversations]);

  const loadConversations = useCallback(async (currentUser, preferredId = null) => {
    const { data, error } = await supabase.from('seller_conversations').select('*, accounts(title,game_id,thumbnail_url,image_url,status)').or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`).order('last_message_at', { ascending: false });
    if (error) { setNotice(error.message); setLoading(false); return; }
    const rows = data || [];
    setConversations(rows);
    const sellerIds = [...new Set(rows.map((item) => item.seller_id).filter(Boolean))];
    if (sellerIds.length) {
      const { data: sellers } = await supabase.from('public_sellers').select('user_id,display_name,avatar_url').in('user_id', sellerIds);
      setSellerNames(Object.fromEntries((sellers || []).map((seller) => [seller.user_id, seller])));
    }
    setActiveId((current) => preferredId || current || rows[0]?.id || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let activePage = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login', { replace: true }); return; }
      if (!activePage) return;
      setUser(session.user);
      let preferredId = null;
      if (listingId) {
        const { data, error } = await supabase.rpc('open_seller_conversation', { p_listing_id: listingId });
        if (error) setNotice(error.message); else preferredId = data;
      }
      await loadConversations(session.user, preferredId);
    })();
    return () => { activePage = false; };
  }, [listingId, loadConversations, navigate]);

  useEffect(() => {
    if (!activeId) return undefined;
    let channel;
    supabase.from('seller_messages').select('*').eq('conversation_id', activeId).order('created_at').then(({ data }) => {
      setMessages(data || []);
      channel = supabase.channel(`seller-chat-${activeId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'seller_messages', filter: `conversation_id=eq.${activeId}` }, (payload) => setMessages((current) => current.some((item) => item.id === payload.new.id) ? current : [...current, payload.new])).subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(event) {
    event.preventDefault();
    if (!message.trim() || !active || !user) return;
    setSending(true); setNotice('');
    const body = message.trim();
    const senderRole = active.seller_id === user.id ? 'seller' : 'buyer';
    const { error } = await supabase.from('seller_messages').insert({ conversation_id: active.id, sender_id: user.id, sender_role: senderRole, body });
    if (error) setNotice(error.message); else { setMessage(''); await loadConversations(user, active.id); }
    setSending(false);
  }

  const conversationName = (conversation) => conversation.seller_id === user?.id ? `Buyer ${conversation.buyer_id.slice(0, 6).toUpperCase()}` : sellerNames[conversation.seller_id]?.display_name || 'Verified seller';

  return <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-24 text-zinc-950 sm:px-8"><div className="mx-auto max-w-6xl">
    <header><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a87300]">Private marketplace messages</p><h1 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-4xl">Seller chat</h1><p className="mt-3 text-sm text-zinc-500">Ask about a listing and keep all product communication in one place.</p></header>
    {notice && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{notice}</div>}
    {loading ? <div className="mt-7 h-[620px] animate-pulse rounded-3xl bg-white" /> : <div className="mt-7 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:grid lg:h-[650px] lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-zinc-200 p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r"><p className="px-2 pb-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">Conversations</p><div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">{conversations.map((conversation) => <button key={conversation.id} onClick={() => setActiveId(conversation.id)} className={`min-w-64 rounded-2xl border p-3 text-left lg:w-full lg:min-w-0 ${activeId === conversation.id ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-zinc-50'}`}><div className="flex items-center gap-3"><img src={conversation.accounts?.thumbnail_url || conversation.accounts?.image_url} alt="" className="h-11 w-11 rounded-xl bg-zinc-200 object-cover" /><div className="min-w-0"><p className="truncate text-sm font-black">{conversationName(conversation)}</p><p className={`mt-1 truncate text-xs ${activeId === conversation.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{conversation.accounts?.title || 'Marketplace listing'}</p></div></div></button>)}{!conversations.length && <p className="p-4 text-sm text-zinc-500">No seller conversations yet.</p>}</div></aside>
      <section className="flex min-h-[520px] flex-col">{active ? <><div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div><h2 className="font-black">{conversationName(active)}</h2><Link to={`/account/${active.listing_id}`} className="mt-1 block text-xs text-zinc-500 hover:text-zinc-950">{active.accounts?.title || 'View listing'} →</Link></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase text-emerald-700">Private</span></div><div className="flex-1 overflow-y-auto bg-zinc-50 p-5">{messages.length ? messages.map((item) => { const mine = item.sender_id === user?.id; return <div key={item.id} className={`mb-4 flex max-w-[82%] flex-col ${mine ? 'ml-auto items-end' : 'items-start'}`}><div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'rounded-br-md bg-zinc-950 text-white' : 'rounded-bl-md border border-zinc-200 bg-white'}`}>{item.body}</div><span className="mt-1 text-[9px] text-zinc-400">{mine ? 'You' : item.sender_role === 'seller' ? 'Seller' : 'Buyer'} · {time(item.created_at)}</span></div>; }) : <div className="mx-auto mt-24 max-w-sm text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm"><ChatIcon /></span><h3 className="mt-4 text-xl font-black">Start the conversation</h3><p className="mt-2 text-sm leading-6 text-zinc-500">Do not share passwords or payment information in chat.</p></div>}<div ref={bottomRef} /></div><form onSubmit={send} className="flex gap-2 border-t border-zinc-200 p-4"><input value={message} onChange={(event) => setMessage(event.target.value)} maxLength="2000" placeholder="Write a message…" className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-950" /><button disabled={sending || !message.trim()} className="rounded-2xl bg-zinc-950 px-6 text-sm font-black text-white disabled:opacity-40">Send</button></form></> : <div className="m-auto px-6 text-center"><ChatIcon /><h2 className="mt-4 text-xl font-black">Select a conversation</h2></div>}</section>
    </div>}
  </div></main>;
}
