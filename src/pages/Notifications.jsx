import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const BellIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4" /></svg>;
const OrderIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" /></svg>;
const ChatIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h13v12Z" /></svg>;
const ArrowIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" /></svg>;

const formatDate = (value) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export default function Notifications() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readAt, setReadAt] = useState(() => localStorage.getItem('clashvault_notifications_read_at') || '');

  useEffect(() => {
    let active = true;
    const loadActivity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        navigate('/login');
        return;
      }

      const [{ data: orders, error: ordersError }, { data: tickets, error: ticketsError }] = await Promise.all([
        supabase.from('orders').select('id, status, amount, created_at').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('support_tickets').select('id, subject, status, created_at, last_message_at').eq('buyer_id', user.id).order('last_message_at', { ascending: false }).limit(20),
      ]);
      if (!active) return;
      if (ordersError || ticketsError) {
        setError('We could not load your notifications. Please try again.');
        setLoading(false);
        return;
      }

      const orderActivity = (orders || []).map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        title: order.status === 'delivered' || order.status === 'completed' ? 'Your order was delivered' : 'Order update',
        description: `Order #${String(order.id).slice(0, 8).toUpperCase()} is ${order.status || 'pending'}${order.amount ? ` · ₹${Number(order.amount).toLocaleString('en-IN')}` : ''}.`,
        time: order.created_at,
        path: '/my-orders',
      }));
      const ticketActivity = (tickets || []).map((ticket) => ({
        id: `ticket-${ticket.id}`,
        type: 'support',
        title: 'Support conversation updated',
        description: `${ticket.subject} · ${ticket.status || 'open'}`,
        time: ticket.last_message_at || ticket.created_at,
        path: '/support',
      }));
      setActivity([...orderActivity, ...ticketActivity].sort((a, b) => new Date(b.time) - new Date(a.time)));
      setLoading(false);
    };
    loadActivity();
    return () => { active = false; };
  }, [navigate]);

  const unreadCount = useMemo(() => activity.filter((item) => !readAt || new Date(item.time) > new Date(readAt)).length, [activity, readAt]);

  const markAllRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('clashvault_notifications_read_at', now);
    setReadAt(now);
  };

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77e00]">Buyer account</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">Notifications</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">Order and support updates, all in one place.</p>
        </div>
        {unreadCount > 0 && <button onClick={markAllRead} className="w-fit rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:border-zinc-400">Mark all as read</button>}
      </div>

      <section className="mt-9 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-5 sm:pb-6">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><BellIcon /></span><div><h2 className="text-xl font-black tracking-tight sm:text-2xl">Recent activity</h2><p className="mt-1 text-sm text-zinc-500">{unreadCount ? `${unreadCount} unread` : 'You are all caught up'}</p></div></div>
        </div>

        {loading ? <div className="space-y-3 py-6">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />)}</div> : error ? <div className="my-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm font-semibold text-red-700">{error}</div> : activity.length === 0 ? <div className="py-16 text-center sm:py-24"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-400"><BellIcon /></span><h2 className="mt-5 text-2xl font-black">No notifications yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Updates about orders and support conversations will appear here.</p><Link to="/shop" className="mt-6 inline-flex rounded-full bg-yellow-300 px-6 py-3 text-sm font-black transition hover:bg-yellow-400">Explore games</Link></div> : <div className="divide-y divide-zinc-100">
          {activity.map((item) => {
            const unread = !readAt || new Date(item.time) > new Date(readAt);
            return <Link key={item.id} to={item.path} className="group flex items-center gap-4 py-5 transition sm:gap-5 sm:py-6">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${item.type === 'order' ? 'bg-yellow-100 text-[#9a6a00]' : 'bg-blue-50 text-blue-600'}`}>{item.type === 'order' ? <OrderIcon /> : <ChatIcon />}</span>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate text-sm font-black sm:text-base">{item.title}</h3>{unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#c68d00]" />}</div><p className="mt-1 truncate text-sm text-zinc-500">{item.description}</p><p className="mt-2 text-xs font-semibold text-zinc-400">{formatDate(item.time)}</p></div>
              <span className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-950"><ArrowIcon /></span>
            </Link>;
          })}
        </div>}
      </section>
    </div>
  </main>;
}
