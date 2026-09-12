import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './lib/supabase';

const PackageIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" /></svg>;
const ArrowIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" /></svg>;
const statusStyle = { delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200', completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200', paid: 'bg-blue-50 text-blue-700 ring-blue-200', pending: 'bg-amber-50 text-amber-700 ring-amber-200', disputed: 'bg-red-50 text-red-700 ring-red-200', refunded: 'bg-violet-50 text-violet-700 ring-violet-200', cancelled: 'bg-red-50 text-red-700 ring-red-200', failed: 'bg-red-50 text-red-700 ring-red-200' };
const statusText = { paid: 'Awaiting seller delivery', delivered: 'Delivered — check details', completed: 'Delivery confirmed', disputed: 'Dispute under review', refunded: 'Resolved for buyer' };
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Date unavailable';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }
    const { data, error: ordersError } = await supabase.from('orders').select('*, accounts(*)').eq('buyer_id', user.id).order('created_at', { ascending: false });
    if (ordersError) { setError('We could not load your orders. Please try again.'); setLoading(false); return; }
    const ids = (data || []).map((order) => order.id);
    let deliveries = [];
    if (ids.length) {
      const { data: deliveryData } = await supabase.from('order_deliveries').select('*').in('order_id', ids);
      deliveries = deliveryData || [];
    }
    setOrders((data || []).map((order) => ({ ...order, delivery: deliveries.find((item) => item.order_id === order.id) || null })));
    setError(''); setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(fetchOrders, 0);
    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  const confirmDelivery = async (order) => {
    setSaving(true); setNotice('');
    const { error: actionError } = await supabase.rpc('confirm_marketplace_delivery', { p_order_id: order.id });
    setSaving(false);
    if (actionError) { setNotice(actionError.message); return; }
    setDeliveryOrder(null); setNotice('Delivery confirmed. The order is now complete.'); await fetchOrders();
  };

  const submitDispute = async (event) => {
    event.preventDefault(); setSaving(true); setNotice('');
    const form = event.currentTarget;
    const { error: actionError } = await supabase.rpc('open_marketplace_dispute', { p_order_id: disputeOrder.id, p_reason: form.reason.value.trim(), p_details: form.details.value.trim() });
    setSaving(false);
    if (actionError) { setNotice(actionError.message); return; }
    setDisputeOrder(null); setDeliveryOrder(null); setNotice('Your dispute is open. Seller earnings are on hold while the admin reviews it.'); await fetchOrders();
  };

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77e00]">Buyer account</p><h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">My orders</h1><p className="mt-3 text-sm text-zinc-500 sm:text-base">Receive deliveries, confirm orders and request help in one place.</p></div><Link to="/#games" className="inline-flex w-fit items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white">Browse games <span className="ml-2">→</span></Link></div>
    {notice && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{notice}</p>}
    <section className="mt-9 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-5 sm:pb-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><PackageIcon /></span><div><h2 className="text-xl font-black sm:text-2xl">Order history</h2><p className="mt-1 text-sm text-zinc-500">{loading ? 'Checking your purchases…' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}</p></div></div>
      {loading ? <div className="space-y-4 py-7">{[1,2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-zinc-100" />)}</div> : error ? <div className="my-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm font-semibold text-red-700">{error}</div> : !orders.length ? <div className="py-16 text-center sm:py-24"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-500"><PackageIcon /></span><h2 className="mt-5 text-2xl font-black">No orders yet</h2><p className="mt-2 text-sm text-zinc-500">Your purchases will appear here.</p></div> : <div className="space-y-4 pt-6">{orders.map((order) => {
        const account = order.accounts || {}; const status = (order.status || 'pending').toLowerCase(); const price = order.amount ?? account.price; const title = account.title || (account.town_hall ? `Town Hall ${account.town_hall} Account` : 'Game account');
        return <article key={order.id} className="rounded-2xl border border-zinc-200 p-4 transition hover:border-zinc-300 hover:shadow-lg sm:p-5"><div className="grid gap-5 sm:grid-cols-[120px_1fr_auto] sm:items-center"><div className="h-32 overflow-hidden rounded-2xl bg-zinc-100 sm:h-28">{account.thumbnail_url || account.image_url ? <img src={account.thumbnail_url || account.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-zinc-400"><PackageIcon /></div>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ring-1 ${statusStyle[status] || statusStyle.pending}`}>{status}</span><span className="text-xs font-semibold text-zinc-400">#{String(order.id).slice(0,8).toUpperCase()}</span></div><h3 className="mt-3 truncate text-lg font-black sm:text-xl">{title}</h3><p className="mt-1 text-sm font-semibold text-zinc-600">{statusText[status] || status}</p><p className="mt-1 text-xs text-zinc-400">Purchased {formatDate(order.created_at)}</p></div><div className="flex items-center justify-between gap-5 border-t border-zinc-100 pt-4 sm:block sm:min-w-36 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right"><div><p className="text-xs font-bold uppercase text-zinc-400">Total</p><p className="mt-1 text-2xl font-black">₹{Number(price || 0).toLocaleString('en-IN')}</p></div>{account.id && <button onClick={() => navigate(`/account/${account.id}`)} className="inline-flex items-center gap-1 text-sm font-bold text-[#a87300] sm:mt-4">Listing <ArrowIcon /></button>}</div></div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">{order.delivery && ['delivered','completed','disputed'].includes(status) && <button onClick={() => setDeliveryOrder(order)} className="rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-black text-white">View private delivery</button>}{status === 'delivered' && <><button disabled={saving} onClick={() => confirmDelivery(order)} className="rounded-full border border-emerald-300 px-5 py-2.5 text-xs font-black text-emerald-700">Confirm delivery</button><button onClick={() => setDisputeOrder(order)} className="rounded-full border border-red-200 px-5 py-2.5 text-xs font-black text-red-600">Report a problem</button></>}{status === 'paid' && <p className="text-xs font-semibold text-blue-700">The seller has been notified to provide delivery.</p>}{status === 'disputed' && <p className="text-xs font-semibold text-red-600">The order and seller payout are locked during review.</p>}</div>
        </article>;
      })}</div>}
    </section>
  </div>
  {deliveryOrder && <DeliveryModal order={deliveryOrder} onClose={() => setDeliveryOrder(null)} onConfirm={() => confirmDelivery(deliveryOrder)} onDispute={() => setDisputeOrder(deliveryOrder)} saving={saving} />}
  {disputeOrder && <div className="fixed inset-0 z-[5000] overflow-y-auto bg-zinc-950/60 p-4" onMouseDown={() => setDisputeOrder(null)}><form onSubmit={submitDispute} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-12 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><h2 className="text-2xl font-black">Report a delivery problem</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Seller funds will be held while the admin reviews your report.</p><label className="mt-6 block text-sm font-bold">Reason<input name="reason" required minLength="3" maxLength="80" placeholder="Example: Password does not work" className="mt-2 h-13 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none" /></label><label className="mt-5 block text-sm font-bold">Details<textarea name="details" required minLength="10" maxLength="2000" rows="5" placeholder="Explain exactly what happened." className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none" /></label><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setDisputeOrder(null)} className="rounded-xl border border-zinc-200 py-3 text-sm font-bold">Cancel</button><button disabled={saving} className="rounded-xl bg-red-600 py-3 text-sm font-black text-white disabled:opacity-50">Open dispute</button></div></form></div>}
  </main>;
}

function DeliveryModal({ order, onClose, onConfirm, onDispute, saving }) {
  const details = order.delivery?.delivery_payload || {};
  const type = order.accounts?.listing_type || 'account';
  const rows = [['Login email', details.email], ['Username / ID', details.username], ['Password', details.password], ['Recovery details', details.recovery], ['Item code / reference', details.code], [type === 'service' ? 'Service completion details' : 'Seller notes', details.notes]].filter(([,value]) => value);
  return <div className="fixed inset-0 z-[4500] overflow-y-auto bg-zinc-950/60 p-4" onMouseDown={onClose}><div onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Private delivery</p><h2 className="mt-2 text-2xl font-black">Your account details</h2></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200">×</button></div><div className="mt-6 space-y-3">{rows.map(([label,value]) => <div key={label} className="rounded-2xl bg-zinc-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-2 break-words whitespace-pre-wrap text-sm font-bold text-zinc-900">{value}</p></div>)}</div><p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">Test the details and secure the account before confirming. Do not share these details.</p>{order.status === 'delivered' && <div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={onDispute} className="rounded-xl border border-red-200 py-3 text-sm font-bold text-red-600">Report a problem</button><button disabled={saving} onClick={onConfirm} className="rounded-xl bg-zinc-950 py-3 text-sm font-black text-white">Everything works</button></div>}</div></div>;
}
