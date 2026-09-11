import { useCallback, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const money = (value, currency = 'INR') => `${currency === 'USD' ? '$' : '₹'}${Number(value || 0).toLocaleString('en-IN')}`;
const date = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const [{ data: profiles, error: sellerError }, { data: requests, error: withdrawalError }] = await Promise.all([
      supabase.from('seller_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawal_requests').select('*, seller_profiles(display_name,email)').order('created_at', { ascending: false }),
    ]);
    if (sellerError || withdrawalError) setNotice('Could not load all seller information.');
    setSellers(profiles || []); setWithdrawals(requests || []); setLoading(false);
  }, []);
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, [load]);

  async function review(userId, status) {
    const notes = status === 'approved' ? '' : window.prompt('Reason shown to the seller:') || '';
    const seller = sellers.find((item) => item.user_id === userId);
    const { error } = await supabase.rpc('review_seller_application', { p_user_id: userId, p_status: status, p_notes: notes || null, p_commission: Number(seller?.commission_rate || 15) });
    if (error) setNotice(error.message); else { setNotice(`Seller ${status}.`); load(); }
  }

  async function reviewListing(id, status) {
    const { error } = await supabase.from('accounts').update({ moderation_status: status, moderation_notes: status === 'rejected' ? (window.prompt('Reason for rejection:') || null) : null }).eq('id', id);
    if (error) { setNotice(error.message); return false; }
    setNotice(`Listing ${status}.`); return true;
  }

  async function updateWithdrawal(id, status) {
    const payload = { status, reviewed_at: new Date().toISOString(), paid_at: status === 'paid' ? new Date().toISOString() : null };
    const { error } = await supabase.from('withdrawal_requests').update(payload).eq('id', id);
    if (error) setNotice(error.message); else { setNotice(`Withdrawal marked ${status}.`); load(); }
  }

  const pending = sellers.filter((item) => item.status === 'pending');
  return <div className="space-y-6">
    {notice && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{notice}</div>}
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-zinc-100 p-6"><div><h2 className="text-xl font-black">Seller applications</h2><p className="mt-1 text-sm text-zinc-500">Verify applicants before they can list or withdraw.</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{pending.length} pending</span></div>{loading ? <Loading /> : sellers.length ? <div className="divide-y divide-zinc-100">{sellers.map((seller) => <div key={seller.user_id} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center"><div><div className="flex items-center gap-2"><p className="font-black">{seller.display_name}</p><Badge status={seller.status} /></div><p className="mt-1 text-xs text-zinc-500">{seller.legal_name} · {seller.email} · {seller.phone}</p><p className="mt-2 text-xs text-zinc-400">{seller.country} · {(seller.categories || []).join(', ')} · Applied {date(seller.created_at)}</p></div><label className="text-xs font-bold text-zinc-500">Commission %<input type="number" min="0" max="50" value={seller.commission_rate} onChange={(event) => setSellers((current) => current.map((item) => item.user_id === seller.user_id ? { ...item, commission_rate: event.target.value } : item))} className="ml-3 h-10 w-20 rounded-xl border border-zinc-200 px-3 text-zinc-950 outline-none" /></label><div className="flex flex-wrap gap-2">{seller.status !== 'approved' && <button onClick={() => review(seller.user_id, 'approved')} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white">Approve</button>}{seller.status === 'approved' && <button onClick={() => review(seller.user_id, 'suspended')} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600">Suspend</button>}{seller.status === 'pending' && <button onClick={() => review(seller.user_id, 'rejected')} className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold">Reject</button>}</div></div>)}</div> : <Empty text="No seller applications." />}</section>
    <PendingListings onReview={reviewListing} notice={notice} />
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 p-6"><h2 className="text-xl font-black">Withdrawal requests</h2><p className="mt-1 text-sm text-zinc-500">Pay sellers manually, then mark requests paid.</p></div>{withdrawals.length ? <div className="divide-y divide-zinc-100">{withdrawals.map((item) => <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-black">{item.seller_profiles?.display_name || 'Seller'} · {money(item.amount,item.currency)}</p><p className="mt-1 text-xs text-zinc-400">{item.seller_profiles?.email} · {date(item.created_at)} · {item.payout_note || 'No payout note'}</p></div><Badge status={item.status} /><div className="flex gap-2">{item.status === 'pending' && <><button onClick={() => updateWithdrawal(item.id,'paid')} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white">Mark paid</button><button onClick={() => updateWithdrawal(item.id,'rejected')} className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold">Reject</button></>}</div></div>)}</div> : <Empty text="No withdrawal requests." />}</section>
  </div>;
}

function PendingListings({ onReview }) {
  const [items, setItems] = useState([]);
  useEffect(() => { supabase.from('accounts').select('*, seller_profiles(display_name)').eq('moderation_status','pending').order('created_at',{ascending:false}).then(({data}) => setItems(data || [])); }, []);
  if (!items.length) return null;
  return <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 p-6"><h2 className="text-xl font-black">Listings awaiting review</h2></div><div className="divide-y divide-zinc-100">{items.map((item) => <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex items-center gap-4"><img src={item.thumbnail_url || item.image_url} alt="" className="h-16 w-16 rounded-xl bg-zinc-100 object-cover" /><div><p className="font-black">{item.seller_profiles?.display_name} · {item.game_id}</p><p className="mt-1 text-xs text-zinc-400">Level {item.town_hall} · {money(item.price)}</p></div></div><div className="flex gap-2"><button onClick={async () => { await onReview(item.id,'approved'); setItems((current) => current.filter((row) => row.id !== item.id)); }} className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white">Approve</button><button onClick={async () => { await onReview(item.id,'rejected'); setItems((current) => current.filter((row) => row.id !== item.id)); }} className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold">Reject</button></div></div>)}</div></section>;
}
function Badge({ status }) { const color = status === 'approved' || status === 'paid' ? 'bg-emerald-50 text-emerald-700' : status === 'rejected' || status === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'; return <span className={`w-fit rounded-full px-3 py-1 text-[9px] font-black uppercase ${color}`}>{status}</span>; }
function Loading() { return <div className="space-y-3 p-6">{[1,2,3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />)}</div>; }
function Empty({ text }) { return <div className="py-14 text-center text-sm text-zinc-400">{text}</div>; }
