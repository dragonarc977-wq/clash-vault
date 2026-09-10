import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const when = (value) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export default function SupportInbox() {
  const endRef = useRef(null);
  const [agent, setAgent] = useState(null), [allowed, setAllowed] = useState(null), [tickets, setTickets] = useState([]), [activeId, setActiveId] = useState(null), [messages, setMessages] = useState([]), [text, setText] = useState(''), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const active = tickets.find((ticket) => ticket.id === activeId);

  useEffect(() => { boot(); }, []);
  useEffect(() => { if (activeId) loadMessages(activeId); }, [activeId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function boot() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAllowed(false); return; }
    const { data: access, error: roleError } = await supabase.rpc('is_support_agent');
    setAgent(user); setAllowed(!roleError && Boolean(access));
    if (!roleError && access) await loadTickets();
    setLoading(false);
  }
  async function loadTickets() {
    const { data, error: queryError } = await supabase.from('support_tickets').select('*').order('last_message_at', { ascending: false });
    if (queryError) setError(queryError.message);
    else { setTickets(data || []); setActiveId((id) => id || data?.[0]?.id || null); }
  }
  async function loadMessages(ticketId) {
    const { data, error: queryError } = await supabase.from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at');
    if (queryError) setError(queryError.message); else setMessages(data || []);
  }
  async function send(event) {
    event.preventDefault();
    if (!text.trim() || !activeId) return;
    const body = text.trim(); setText('');
    const { error: insertError } = await supabase.from('support_messages').insert({ ticket_id: activeId, sender_id: agent.id, sender_role: 'agent', body });
    if (insertError) { setText(body); setError(insertError.message); } else { await loadMessages(activeId); await loadTickets(); }
  }
  async function toggleStatus() {
    if (!active) return;
    const next = active.status === 'open' ? 'resolved' : 'open';
    const { error: updateError } = await supabase.from('support_tickets').update({ status: next }).eq('id', active.id);
    if (updateError) setError(updateError.message); else loadTickets();
  }

  if (allowed === false) return <Navigate to="/" replace />;
  return <main className="inbox"><style>{css}</style><header><div><p>CLASH VAULT · PRIVATE</p><h1>Support inbox</h1></div><span>● Team access</span></header>{loading ? <div className="card">Checking access…</div> : <div className="layout"><aside><h2>Conversations <small>{tickets.length}</small></h2>{tickets.map((ticket) => <button className={ticket.id === activeId ? 'active' : ''} onClick={() => setActiveId(ticket.id)} key={ticket.id}><strong>{ticket.subject}</strong><em>{ticket.buyer_email}</em><small>{ticket.status} · {when(ticket.last_message_at)}</small></button>)}</aside><section>{active ? <><div className="thread-head"><div><h2>{active.subject}</h2><p>{active.buyer_email}{active.order_id ? ` · Order #${active.order_id.slice(0, 8)}` : ''}</p></div><button onClick={toggleStatus}>{active.status === 'open' ? 'Resolve conversation' : 'Reopen conversation'}</button></div><div className="thread">{messages.map((message) => <div className={message.sender_role === 'agent' ? 'message mine' : 'message'} key={message.id}><div>{message.body}</div><small>{message.sender_role === 'agent' ? 'You' : active.buyer_email} · {when(message.created_at)}</small></div>)}<div ref={endRef}/></div><form onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Reply to buyer…" disabled={active.status !== 'open'} /><button disabled={active.status !== 'open'}>Send reply</button></form></> : <div className="empty">No support conversations yet.</div>}</section></div>}{error && <div className="error">{error}</div>}</main>;
}

const css = `.inbox{min-height:100vh;padding:105px 24px 45px;background:#09090d;color:#fff;font-family:Inter,system-ui,sans-serif}.inbox>header{max-width:1200px;display:flex;justify-content:space-between;align-items:end;margin:0 auto 24px}.inbox header p{margin:0 0 6px;color:#ffd700;font-size:11px;font-weight:800;letter-spacing:1.2px}.inbox h1{margin:0;font-size:34px}.inbox header span{color:#5ce490;font-size:13px;font-weight:700}.layout,.card{max-width:1200px;margin:auto;border:1px solid rgba(255,215,0,.14);border-radius:18px;background:#12121a}.layout{height:70vh;min-height:520px;display:grid;grid-template-columns:325px 1fr;overflow:hidden}.layout aside{overflow:auto;padding:14px;background:#0d0d13;border-right:1px solid rgba(255,255,255,.07)}.layout aside h2{margin:5px 5px 16px;font-size:14px}.layout aside h2 small{color:#ffd700}.layout aside button{display:block;width:100%;padding:13px;margin-bottom:5px;border:1px solid transparent;border-radius:10px;background:transparent;color:#fff;text-align:left;cursor:pointer}.layout aside button:hover,.layout aside button.active{background:#1c1c25;border-color:rgba(255,215,0,.15)}.layout aside strong,.layout aside em,.layout aside small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.layout aside strong{font-size:13px}.layout aside em,.layout aside small{margin-top:5px;color:#838391;font-size:11px;font-style:normal}.layout section{display:flex;min-width:0;flex-direction:column}.thread-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.07)}.thread-head h2{margin:0;font-size:17px}.thread-head p{margin:5px 0 0;color:#858593;font-size:12px}.thread-head button,form button{border:1px solid rgba(255,215,0,.3);border-radius:9px;padding:10px 12px;background:transparent;color:#ffd700;font-weight:800;cursor:pointer;font-size:12px}.thread{flex:1;overflow:auto;padding:22px}.message{max-width:75%;margin-bottom:18px}.message.mine{margin-left:auto;text-align:right}.message>div{display:inline-block;padding:11px 13px;border-radius:12px 12px 12px 3px;background:#282833;text-align:left;white-space:pre-wrap;font-size:14px;line-height:1.4}.message.mine>div{border-radius:12px 12px 3px;background:#ffd700;color:#151200;font-weight:600}.message small{display:block;margin-top:4px;color:#777786;font-size:10px}.layout form{display:flex;gap:10px;padding:14px 18px;border-top:1px solid rgba(255,255,255,.07)}.layout input{flex:1;min-width:0;padding:11px 12px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:#09090d;color:#fff;outline:0}.layout form button{border:0;background:#ffd700;color:#171300}.empty,.card{padding:45px;text-align:center;color:#888896}.error{max-width:1200px;margin:14px auto;color:#ff8c8c;font-size:13px}@media(max-width:700px){.inbox{padding:90px 12px 20px}.layout{grid-template-columns:1fr}.layout aside{display:none}.inbox>header{align-items:flex-start;flex-direction:column;gap:12px}.thread-head{align-items:flex-start;gap:12px;flex-direction:column}.message{max-width:88%}}`;
