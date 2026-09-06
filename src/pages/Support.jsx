import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const formatTime = (value) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export default function Support() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const active = useMemo(() => tickets.find((ticket) => ticket.id === activeTicket) || null, [tickets, activeTicket]);

  useEffect(() => {
    let channel;
    const boot = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { navigate('/login'); return; }
      setUser(currentUser);
      const [{ data: ticketData }, { data: orderData }] = await Promise.all([
        supabase.from('support_tickets').select('*').eq('buyer_id', currentUser.id).order('last_message_at', { ascending: false }),
        supabase.from('orders').select('id, amount, status, accounts(town_hall)').eq('buyer_id', currentUser.id).order('created_at', { ascending: false }),
      ]);
      const nextTickets = ticketData || [];
      setTickets(nextTickets);
      setOrders(orderData || []);
      setActiveTicket(nextTickets[0]?.id || null);
      setLoading(false);
      channel = supabase.channel(`buyer-support-${currentUser.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `buyer_id=eq.${currentUser.id}` }, () => refreshTickets(currentUser.id))
        .subscribe();
    };
    boot();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [navigate]);

  useEffect(() => {
    if (!activeTicket) { setMessages([]); return; }
    let channel;
    const loadMessages = async () => {
      const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', activeTicket).order('created_at');
      setMessages(data || []);
      channel = supabase.channel(`support-messages-${activeTicket}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${activeTicket}` }, (payload) => {
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
    if (data) { setTickets(data); setActiveTicket((current) => current || data[0]?.id || null); }
  }

  async function createTicket(event) {
    event.preventDefault();
    if (!subject.trim() || !user) return;
    setCreating(true); setNotice('');
    const { error } = await supabase.from('support_tickets').insert({
      buyer_id: user.id, buyer_email: user.email, subject: subject.trim(), order_id: selectedOrder || null,
    });
    if (error) setNotice(error.message);
    else { await refreshTickets(user.id); setSubject(''); setSelectedOrder(''); }
    setCreating(false);
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim() || !activeTicket || !user) return;
    setSending(true); setNotice('');
    const body = text.trim(); setText('');
    const { error } = await supabase.from('support_messages').insert({ ticket_id: activeTicket, sender_id: user.id, sender_role: 'buyer', body });
    if (error) { setText(body); setNotice(error.message); }
    setSending(false);
  }

  return <main className="support-page">
    <style>{styles}</style>
    <section className="support-shell">
      <header className="support-header"><div><p className="eyebrow">CLASH VAULT CARE</p><h1>Buyer Support</h1><p className="muted">Private help from our verified support team.</p></div><div className="online"><i /> Support team online</div></header>
      {notice && <div className="notice">{notice}</div>}
      {loading ? <div className="loading">Loading your support centre…</div> : <div className="support-grid">
        <aside className="sidebar"><button className="new-ticket" onClick={() => setCreating(true)}>+ Start a conversation</button><p className="section-label">YOUR CONVERSATIONS</p>
          {tickets.length ? tickets.map((ticket) => <button key={ticket.id} className={`ticket ${activeTicket === ticket.id ? 'selected' : ''}`} onClick={() => setActiveTicket(ticket.id)}><span className="ticket-title">{ticket.subject}</span><span className="ticket-meta"><b className={ticket.status === 'open' ? 'open' : ''}>{ticket.status}</b> · {formatTime(ticket.last_message_at)}</span></button>) : <p className="empty-list">No conversations yet.</p>}
        </aside>
        <section className="conversation">{active ? <><div className="conversation-head"><div><h2>{active.subject}</h2><p>{active.status === 'open' ? 'Our team will reply here.' : 'This conversation is resolved.'}</p></div><span className={`status ${active.status}`}>{active.status}</span></div>
          <div className="messages">{messages.length === 0 && <div className="welcome"><span>✦</span><h3>How can we help?</h3><p>Send a message and our support team will respond in this private conversation.</p></div>}{messages.map((message) => <div key={message.id} className={`message ${message.sender_role === 'buyer' ? 'mine' : 'agent'}`}><div className="bubble">{message.body}</div><small>{message.sender_role === 'buyer' ? 'You' : 'Clash Vault Support'} · {formatTime(message.created_at)}</small></div>)}<div ref={bottomRef} /></div>
          <form className="composer" onSubmit={sendMessage}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message…" maxLength="2000" disabled={active.status !== 'open'} /><button disabled={sending || active.status !== 'open'}>{sending ? 'Sending…' : 'Send'}</button></form>
        </> : <div className="no-ticket"><span>💬</span><h2>Welcome to buyer support</h2><p>Start a private conversation whenever you need help with an order.</p><button className="new-ticket" onClick={() => setCreating(true)}>Start a conversation</button></div>}</section>
      </div>}
    </section>
    {creating && <div className="modal-backdrop" onMouseDown={() => setCreating(false)}><form className="modal" onSubmit={createTicket} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="close" onClick={() => setCreating(false)}>×</button><p className="eyebrow">NEW CONVERSATION</p><h2>Tell us what you need</h2><p className="muted">Your message and purchase details stay private.</p><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Example: Help with my account delivery" maxLength="120" autoFocus /></label><label>Related order <select value={selectedOrder} onChange={(event) => setSelectedOrder(event.target.value)}><option value="">General question</option>{orders.map((order) => <option value={order.id} key={order.id}>TH{order.accounts?.town_hall || '?'} · ₹{order.amount} · #{order.id.slice(0, 8)}</option>)}</select></label><button className="new-ticket" disabled={creating}>{creating ? 'Creating…' : 'Create conversation'}</button></form></div>}
  </main>;
}

const styles = `
.support-page{min-height:100vh;padding:116px 24px 56px;background:#09090d;color:#fff;font-family:Inter,system-ui,sans-serif}.support-shell{max-width:1180px;margin:auto}.support-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px}.eyebrow,.section-label{margin:0 0 7px;color:#f7cb19;font-size:11px;font-weight:800;letter-spacing:1.4px}.support-header h1{margin:0;font-size:38px;letter-spacing:-1px}.muted{margin:7px 0 0;color:#898997;font-size:14px;line-height:1.5}.online{padding:10px 14px;border:1px solid rgba(39,211,112,.22);border-radius:999px;background:#0e1712;color:#70e49d;font-size:13px;font-weight:700}.online i{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:99px;background:#28d77a;box-shadow:0 0 10px #28d77a}.support-grid{height:min(650px,72vh);min-height:500px;display:grid;grid-template-columns:300px 1fr;border:1px solid rgba(255,215,0,.15);border-radius:20px;overflow:hidden;background:#111118;box-shadow:0 24px 70px rgba(0,0,0,.34)}.sidebar{padding:14px;border-right:1px solid rgba(255,255,255,.07);overflow:auto;background:#0d0d13}.new-ticket{border:0;border-radius:10px;padding:13px 16px;background:linear-gradient(135deg,#ffd700,#e9b900);color:#111;font-size:13px;font-weight:900;cursor:pointer}.sidebar>.new-ticket{width:100%;margin-bottom:22px}.ticket{display:block;width:100%;padding:13px;margin:0 0 5px;border:1px solid transparent;border-radius:11px;background:transparent;color:#fff;text-align:left;cursor:pointer}.ticket:hover,.ticket.selected{background:#191920;border-color:rgba(255,215,0,.18)}.ticket-title,.ticket-meta{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ticket-title{font-size:13px;font-weight:700}.ticket-meta{margin-top:6px;color:#777786;font-size:11px;text-transform:capitalize}.ticket-meta b{color:#aaaaba}.ticket-meta b.open{color:#54da86}.empty-list{padding:10px;color:#777786;font-size:13px}.conversation{display:flex;min-width:0;flex-direction:column}.conversation-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.07)}.conversation-head h2{margin:0;font-size:17px}.conversation-head p{margin:5px 0 0;color:#797988;font-size:12px}.status{padding:5px 10px;border:1px solid;border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase}.status.open{color:#56dc88;border-color:rgba(86,220,136,.3);background:rgba(86,220,136,.08)}.messages{flex:1;padding:24px;overflow:auto;background:radial-gradient(circle at 100% 0,rgba(255,215,0,.035),transparent 40%)}.message{display:flex;flex-direction:column;max-width:76%;margin-bottom:18px}.message.mine{align-items:flex-end;margin-left:auto}.bubble{padding:12px 14px;border-radius:14px 14px 14px 4px;background:#24242e;color:#f5f5f7;font-size:14px;line-height:1.45;white-space:pre-wrap}.mine .bubble{border-radius:14px 14px 4px;background:linear-gradient(135deg,#ffd700,#e8bc00);color:#161303;font-weight:600}.message small{margin-top:5px;color:#777786;font-size:10px}.composer{display:flex;gap:10px;padding:16px 20px;border-top:1px solid rgba(255,255,255,.07)}.composer input,.modal input,.modal select{box-sizing:border-box;width:100%;border:1px solid rgba(255,255,255,.11);border-radius:10px;padding:12px;background:#0b0b10;color:#fff;font:inherit;outline:0}.composer input:focus,.modal input:focus,.modal select:focus{border-color:rgba(255,215,0,.6)}.composer button{border:0;border-radius:10px;padding:0 20px;background:#ffd700;color:#111;font-weight:900;cursor:pointer}.composer button:disabled,.new-ticket:disabled{opacity:.6;cursor:not-allowed}.welcome,.no-ticket{text-align:center;max-width:360px;margin:70px auto;color:#aaaab7}.welcome span,.no-ticket span{font-size:32px}.welcome h3,.no-ticket h2{margin:12px 0 7px;color:#fff}.welcome p,.no-ticket p{line-height:1.6;font-size:14px}.no-ticket{margin:auto}.modal-backdrop{position:fixed;z-index:3000;inset:0;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.75);backdrop-filter:blur(7px)}.modal{position:relative;width:min(440px,100%);padding:28px;border:1px solid rgba(255,215,0,.22);border-radius:18px;background:#16161f;box-shadow:0 30px 80px #000}.modal h2{margin:0;font-size:23px}.modal label{display:block;margin:20px 0 0;color:#b9b9c5;font-size:12px;font-weight:700}.modal input,.modal select{display:block;margin-top:8px}.modal .new-ticket{width:100%;margin-top:23px}.close{position:absolute;right:16px;top:12px;border:0;background:transparent;color:#aaa;cursor:pointer;font-size:25px}.notice,.loading{margin:15px 0;padding:13px;border:1px solid rgba(255,215,0,.22);border-radius:10px;background:rgba(255,215,0,.06);color:#f4d55c;font-size:13px}.loading{text-align:center;padding:60px}@media(max-width:700px){.support-page{padding:94px 12px 28px}.support-header{align-items:flex-start;gap:15px;flex-direction:column}.support-header h1{font-size:30px}.support-grid{height:calc(100vh - 220px);min-height:530px;grid-template-columns:1fr}.sidebar{display:none}.message{max-width:88%}.conversation-head{padding:16px}.messages{padding:16px}.composer{padding:12px}.online{font-size:12px}}
`;
