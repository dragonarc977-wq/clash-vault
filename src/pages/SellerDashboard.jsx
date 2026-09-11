import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { MAX_LISTING_IMAGES, optimizeListingImage, validateListingFiles } from '../lib/imageProcessing';

const games = [['clash-of-clans','Clash of Clans'],['brawl-stars','Brawl Stars'],['valorant','Valorant'],['clash-royale','Clash Royale'],['fortnite','Fortnite'],['pokemon-go','Pokémon GO'],['mobile-legends','Mobile Legends'],['free-fire','Free Fire'],['hay-day','Hay Day'],['squad-busters','Squad Busters']];
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const inputClass = 'h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-100';

async function uploadImage(file, userId, gameId) {
  const { full, thumbnail } = await optimizeListingImage(file);
  const key = crypto.randomUUID();
  const fullPath = `${userId}/${gameId}/${key}.webp`;
  const thumbPath = `${userId}/${gameId}/thumbnails/${key}.webp`;
  const bucket = supabase.storage.from('account-images');
  const { error: fullError } = await bucket.upload(fullPath, full, { cacheControl: '31536000', contentType: 'image/webp' });
  if (fullError) throw fullError;
  const { error: thumbError } = await bucket.upload(thumbPath, thumbnail, { cacheControl: '31536000', contentType: 'image/webp' });
  if (thumbError) { await bucket.remove([fullPath]); throw thumbError; }
  return { paths: [fullPath, thumbPath], url: bucket.getPublicUrl(fullPath).data.publicUrl, thumbnail: bucket.getPublicUrl(thumbPath).data.publicUrl };
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState({ available: 0, pending: 0, withdrawn: 0, commission_rate: 15 });
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async (id) => {
    const [{ data: seller }, { data: inventory }, { data: sales }, { data: requests }, { data: totals }] = await Promise.all([
      supabase.from('seller_profiles').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('accounts').select('*').eq('seller_id', id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, accounts(game_id,town_hall,image_url,thumbnail_url)').eq('seller_id', id).order('created_at', { ascending: false }),
      supabase.from('withdrawal_requests').select('*').eq('seller_id', id).order('created_at', { ascending: false }),
      supabase.rpc('get_seller_balance'),
    ]);
    if (!seller || seller.status !== 'approved') { navigate('/become-a-seller'); return; }
    setProfile(seller); setListings(inventory || []); setOrders(sales || []); setWithdrawals(requests || []); if (totals) setBalance(totals); setLoading(false);
  }, [navigate]);

  useEffect(() => { let active = true; (async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session?.user) { navigate('/login'); return; } if (!active) return; setUser(session.user); await load(session.user.id); })(); return () => { active = false; }; }, [navigate, load]);

  const stats = useMemo(() => ({ approved: listings.filter((item) => item.moderation_status === 'approved' && item.status === 'available').length, review: listings.filter((item) => item.moderation_status === 'pending').length, sold: listings.filter((item) => item.status === 'sold').length }), [listings]);

  async function createListing(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const files = Array.from(form.images.files || []);
    const validation = validateListingFiles(files);
    if (!files.length || validation) { setNotice(validation || 'Choose at least one image.'); return; }
    setSaving(true); setNotice('');
    const paths = [], urls = [], thumbnails = [];
    try {
      for (const file of files) { const image = await uploadImage(file, user.id, form.game.value); paths.push(...image.paths); urls.push(image.url); thumbnails.push(image.thumbnail); }
      const { error } = await supabase.from('accounts').insert({ seller_id: user.id, game_id: form.game.value, town_hall: Number(form.level.value), price: Number(form.price.value), original_price: Number(form.originalPrice.value) || null, heroes_level: form.features.value.trim() || null, description: form.description.value.trim() || null, image_url: urls[0], image_urls: urls, thumbnail_url: thumbnails[0], thumbnail_urls: thumbnails, status: 'available', moderation_status: 'pending' });
      if (error) throw error;
      form.reset(); setShowAdd(false); setNotice('Listing submitted for admin review.'); await load(user.id);
    } catch (error) {
      if (paths.length) await supabase.storage.from('account-images').remove(paths);
      setNotice(error.message || 'Could not create listing.');
    } finally { setSaving(false); }
  }

  async function requestWithdrawal(event) {
    event.preventDefault(); const form = event.currentTarget; setSaving(true); setNotice('');
    const { error } = await supabase.rpc('request_seller_withdrawal', { p_amount: Number(form.amount.value), p_currency: 'INR', p_note: form.note.value.trim() || null });
    setSaving(false); if (error) { setNotice(error.message); return; }
    form.reset(); setNotice('Withdrawal request submitted for admin review.'); await load(user.id);
  }

  async function deliverOrder(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true); setNotice('');
    const payload = {
      email: form.email.value.trim() || null,
      username: form.username.value.trim() || null,
      password: form.password.value,
      recovery: form.recovery.value.trim() || null,
      notes: form.notes.value.trim() || null,
    };
    const { error } = await supabase.rpc('deliver_marketplace_order', { p_order_id: deliveryOrder.id, p_delivery_payload: payload });
    setSaving(false);
    if (error) { setNotice(error.message); return; }
    setDeliveryOrder(null); setNotice('Private delivery sent to the buyer. Your earnings are protected for seven days.'); await load(user.id);
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pt-28"><div className="mx-auto h-96 max-w-7xl animate-pulse rounded-3xl bg-white" /></main>;
  const tabs = [['overview','Overview'],['listings','My listings'],['orders','Sales'],['earnings','Earnings']];
  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-24 text-zinc-950 sm:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a87300]">Verified seller</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-6xl">{profile.display_name}</h1><p className="mt-3 text-sm text-zinc-500">Manage listings, sales and protected earnings.</p></div><button onClick={() => setShowAdd(true)} className="rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-black text-white">+ Add listing</button></div>
    <nav className="mt-8 flex gap-2 overflow-x-auto border-b border-zinc-200 pb-3">{tabs.map(([id,label]) => <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold ${tab === id ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-600'}`}>{label}</button>)}</nav>
    {notice && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{notice}</div>}
    {tab === 'overview' && <><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Available earnings',money(balance.available)],['Pending earnings',money(balance.pending)],['Live listings',stats.approved],['Awaiting review',stats.review]].map(([label,value]) => <section key={label} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold text-zinc-500">{label}</p><p className="mt-6 text-3xl font-black">{value}</p></section>)}</div><section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-7"><h2 className="text-xl font-black">How seller payments work</h2><div className="mt-5 grid gap-4 sm:grid-cols-3">{[['1','Buyer pays','Payment and listing are verified.'],['2','Protection period','Your earnings remain pending for seven days.'],['3','Request withdrawal','You apply and admin completes the payout.']].map(([n,title,text]) => <div key={n} className="rounded-2xl bg-zinc-50 p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white">{n}</span><p className="mt-4 font-black">{title}</p><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></div>)}</div></section></>}
    {tab === 'listings' && <section className="mt-7 overflow-hidden rounded-3xl border border-zinc-200 bg-white"><div className="border-b border-zinc-100 p-6"><h2 className="text-xl font-black">My listings</h2><p className="mt-1 text-sm text-zinc-500">Edited listings return to admin review.</p></div>{listings.length ? <div className="divide-y divide-zinc-100">{listings.map((item) => <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="flex items-center gap-4"><img src={item.thumbnail_url || item.image_url} alt="" className="h-16 w-16 rounded-xl bg-zinc-100 object-cover" /><div><p className="font-black">{games.find(([id]) => id === item.game_id)?.[1]} · Level {item.town_hall}</p><p className="mt-1 text-xs text-zinc-400">Added {date(item.created_at)}</p></div></div><p className="font-black">{money(item.price)}</p><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.status === 'sold' ? 'bg-violet-50 text-violet-700' : item.moderation_status === 'approved' ? 'bg-emerald-50 text-emerald-700' : item.moderation_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status === 'sold' ? 'Sold' : item.moderation_status}</span></div>)}</div> : <Empty text="No listings yet." />}</section>}
    {tab === 'orders' && <section className="mt-7 overflow-hidden rounded-3xl border border-zinc-200 bg-white"><div className="border-b border-zinc-100 p-6"><h2 className="text-xl font-black">Sales</h2><p className="mt-1 text-sm text-zinc-500">Send delivery privately after an order is paid.</p></div>{orders.length ? <div className="divide-y divide-zinc-100">{orders.map((order) => <div key={order.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><div><p className="font-black">Order #{order.id.slice(0,8).toUpperCase()}</p><p className="mt-1 text-xs text-zinc-400">{order.buyer_email} · {date(order.created_at)}</p></div><p className="font-black">{money(order.amount)}</p><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase ${order.status === 'disputed' ? 'bg-red-50 text-red-700' : order.status === 'paid' ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>{order.status}</span>{order.status === 'paid' ? <button onClick={() => setDeliveryOrder(order)} className="rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-black text-white">Deliver order</button> : <span className="text-xs text-zinc-400">{order.status === 'disputed' ? 'Funds on hold' : 'No action'}</span>}</div>)}</div> : <Empty text="No sales yet." />}</section>}
    {tab === 'earnings' && <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><form onSubmit={requestWithdrawal} className="rounded-3xl bg-zinc-950 p-7 text-white"><p className="text-sm text-zinc-400">Available to withdraw</p><p className="mt-2 text-4xl font-black">{money(balance.available)}</p><p className="mt-2 text-xs text-zinc-500">After {balance.commission_rate}% marketplace commission</p><label className="mt-7 block text-xs font-bold">Amount (minimum ₹500)<input name="amount" type="number" min="500" max={Number(balance.available)} required className={`${inputClass} mt-2 bg-white text-zinc-950`} /></label><label className="mt-4 block text-xs font-bold">Payout note<textarea name="note" rows="3" placeholder="Bank or UPI reference for the admin" className={`${inputClass} mt-2 h-auto bg-white py-3 text-zinc-950`} /></label><button disabled={saving || Number(balance.available) < 500} className="mt-5 w-full rounded-xl bg-white px-5 py-3.5 text-sm font-black text-zinc-950 disabled:opacity-40">Apply for withdrawal</button></form><section className="rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-black">Withdrawal history</h2>{withdrawals.length ? <div className="mt-4 divide-y divide-zinc-100">{withdrawals.map((item) => <div key={item.id} className="flex items-center justify-between py-4"><div><p className="font-black">{money(item.amount)}</p><p className="mt-1 text-xs text-zinc-400">{date(item.created_at)}</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase">{item.status}</span></div>)}</div> : <Empty text="No withdrawal requests." />}</section></div>}
    {showAdd && <div className="fixed inset-0 z-[4000] overflow-y-auto bg-zinc-950/60 p-4" onMouseDown={() => setShowAdd(false)}><form onSubmit={createListing} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-8 max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-[#a87300]">Seller listing</p><h2 className="mt-2 text-2xl font-black">Submit a listing</h2></div><button type="button" onClick={() => setShowAdd(false)} className="h-9 w-9 rounded-full border border-zinc-200">×</button></div><p className="mt-2 text-sm text-zinc-500">It will appear publicly only after admin approval.</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Game"><select name="game" className={inputClass}>{games.map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></Field><Field label="Primary level"><input name="level" type="number" min="1" required className={inputClass} /></Field><Field label="Price (₹)"><input name="price" type="number" min="1" required className={inputClass} /></Field><Field label="Original price (₹)"><input name="originalPrice" type="number" min="1" className={inputClass} /></Field><Field label="Features"><input name="features" placeholder="Rank, heroes, skins…" className={inputClass} /></Field><Field label="Images"><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required className="mt-2 block w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-zinc-950 file:px-4 file:py-3 file:font-bold file:text-white" /></Field></div><Field label="Description" className="mt-5"><textarea name="description" rows="4" required className={`${inputClass} h-auto py-3`} /></Field><p className="mt-3 text-xs text-zinc-400">Up to {MAX_LISTING_IMAGES} images · 12 MB each · minimum 700 × 500px.</p><button disabled={saving} className="mt-6 w-full rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white disabled:opacity-50">{saving ? 'Uploading…' : 'Submit for review'}</button></form></div>}
    {deliveryOrder && <div className="fixed inset-0 z-[4500] overflow-y-auto bg-zinc-950/60 p-4" onMouseDown={() => setDeliveryOrder(null)}><form onSubmit={deliverOrder} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Private delivery</p><h2 className="mt-2 text-2xl font-black">Deliver order #{deliveryOrder.id.slice(0,8).toUpperCase()}</h2></div><button type="button" onClick={() => setDeliveryOrder(null)} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200">×</button></div><p className="mt-3 text-sm leading-6 text-zinc-500">Only the buyer, you and an authorized admin can access these details.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Login email"><input name="email" type="email" className={inputClass} /></Field><Field label="Username / player ID"><input name="username" className={inputClass} /></Field><Field label="Password *"><input name="password" required autoComplete="off" className={inputClass} /></Field><Field label="Recovery details"><input name="recovery" className={inputClass} /></Field></div><Field label="Instructions for buyer" className="mt-5"><textarea name="notes" rows="4" className={`${inputClass} h-auto py-3`} /></Field><label className="mt-5 flex items-start gap-3 text-xs leading-5 text-zinc-600"><input required type="checkbox" className="mt-1" /><span>I verified that these details work and match the listing.</span></label><button disabled={saving} className="mt-6 w-full rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white disabled:opacity-50">{saving ? 'Sending securely…' : 'Send private delivery'}</button></form></div>}
  </div></main>;
}

function Field({ label, children, className = '' }) { return <label className={`block text-xs font-bold text-zinc-700 ${className}`}>{label}{children}</label>; }
function Empty({ text }) { return <div className="py-14 text-center text-sm text-zinc-400">{text}</div>; }
