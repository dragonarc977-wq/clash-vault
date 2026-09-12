import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';

const gameNames = {
  'clash-of-clans': 'Clash of Clans', 'brawl-stars': 'Brawl Stars', valorant: 'Valorant',
  'clash-royale': 'Clash Royale', fortnite: 'Fortnite', 'pokemon-go': 'Pokémon GO',
  'mobile-legends': 'Mobile Legends', 'free-fire': 'Free Fire', 'hay-day': 'Hay Day', 'squad-busters': 'Squad Busters',
};

const ChatIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;

export default function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [viewerId, setViewerId] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [eligibleOrderId, setEligibleOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackDialog = useRef(null);

  useEffect(() => {
    if (!showFeedback) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    feedbackDialog.current?.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [showFeedback]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: sellerData }, { data: listingData }, { data: sessionData }, { data: feedbackData }] = await Promise.all([
        supabase.from('public_sellers').select('*').eq('user_id', sellerId).maybeSingle(),
        supabase.from('accounts').select('*').eq('seller_id', sellerId).eq('status', 'available').order('created_at', { ascending: false }),
        supabase.auth.getSession(),
        supabase.from('public_seller_feedback').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }),
      ]);
      if (!active) return;
      const currentUser = sessionData?.session?.user || null;
      setSeller(sellerData || null);
      setListings(listingData || []);
      setFeedback(feedbackData || []);
      setViewerId(currentUser?.id || null);
      if (currentUser && currentUser.id !== sellerId) {
        const [{ data: purchases }, { data: ownFeedback }] = await Promise.all([
          supabase.from('orders').select('id').eq('seller_id', sellerId).eq('buyer_id', currentUser.id).in('status', ['delivered', 'completed']),
          supabase.from('seller_feedback').select('order_id').eq('seller_id', sellerId).eq('buyer_id', currentUser.id),
        ]);
        const reviewed = new Set((ownFeedback || []).map((item) => item.order_id));
        if (active) setEligibleOrderId((purchases || []).find((item) => !reviewed.has(item.id))?.id || null);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [sellerId]);

  const shownListings = useMemo(() => type === 'all' ? listings : listings.filter((item) => String(item.listing_type || 'account') === type), [listings, type]);
  const startChat = () => {
    if (viewerId === sellerId) { navigate('/seller-chat'); return; }
    if (!listings.length) return;
    navigate(`/seller-chat/${listings[0].id}`);
  };

  const uploadCover = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setNotice('');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setNotice('Cover picture must be JPG, PNG or WebP and smaller than 5 MB.'); return; }
    setCoverUploading(true);
    const path = `${viewerId}/cover-picture`;
    const bucket = supabase.storage.from('seller-covers');
    const { error: uploadError } = await bucket.upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
    if (uploadError) { setNotice(uploadError.message); setCoverUploading(false); return; }
    const coverUrl = `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    const { error } = await supabase.from('seller_profiles').update({ cover_url: coverUrl }).eq('user_id', viewerId);
    if (error) setNotice(error.message); else { setSeller((current) => ({ ...current, cover_url: coverUrl })); setNotice('Cover picture updated.'); }
    setCoverUploading(false);
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (!eligibleOrderId || !viewerId) return;
    setSaving(true); setNotice('');
    const { data, error } = await supabase.from('seller_feedback').insert({ order_id: eligibleOrderId, seller_id: sellerId, buyer_id: viewerId, rating, comment: comment.trim() || null }).select().single();
    if (error) setNotice(error.message);
    else {
      setFeedback((current) => [data, ...current]);
      setEligibleOrderId(null); setComment(''); setNotice('Thank you. Your feedback is now visible.');
      const { data: refreshedSeller } = await supabase.from('public_sellers').select('*').eq('user_id', sellerId).maybeSingle();
      if (refreshedSeller) setSeller(refreshedSeller);
    }
    setSaving(false);
  };

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-24"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-72 rounded-3xl bg-zinc-200" /><div className="mt-8 h-80 rounded-3xl bg-white" /></div></main>;
  if (!seller) return <main className="grid min-h-screen place-items-center bg-white px-5 pt-16 text-center"><div><p className="text-sm font-black text-zinc-400">SELLER NOT FOUND</p><h1 className="mt-3 text-3xl font-black">This seller profile is unavailable.</h1><Link to="/" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Return home</Link></div></main>;

  return <main className="min-h-screen bg-zinc-50 pb-20 pt-16 text-zinc-950">
    <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
        <div className="relative h-40 bg-zinc-900 sm:h-64">{seller.cover_url ? <img src={seller.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600" />}<div className="absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-transparent to-transparent" />{viewerId === sellerId && <label className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/95 px-4 py-2.5 text-xs font-black text-zinc-950 shadow-md backdrop-blur"><span>{coverUploading ? 'Uploading…' : seller.cover_url ? 'Change cover' : 'Add cover picture'}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={coverUploading} onChange={uploadCover} className="sr-only" /></label>}</div>
        <div className="relative flex flex-col gap-5 px-5 py-6 xl:flex-row xl:items-center xl:justify-between sm:px-8">
          <div className="flex min-w-0 items-center gap-4"><span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-zinc-950 text-3xl font-black text-white shadow-md sm:h-28 sm:w-28">{seller.avatar_url ? <img src={seller.avatar_url} alt={`${seller.display_name} profile`} className="h-full w-full object-cover" /> : seller.display_name.charAt(0).toUpperCase()}</span><div className="min-w-0 pb-1"><div className="flex items-center gap-2"><h1 className="truncate text-2xl font-black tracking-[-0.04em] sm:text-4xl">{seller.display_name}</h1><span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-700">✓ Verified</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-zinc-500"><span>{Number(seller.total_sales || 0).toLocaleString('en-IN')} orders</span></div></div></div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setShowFeedback(true)} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-left transition hover:bg-zinc-50">
              <span><span className="block text-[10px] font-semibold text-zinc-400">Seller rating</span><span className="mt-0.5 block text-sm font-bold"><span className="text-amber-500">★</span> {Number(seller.feedback_count) > 0 ? `${seller.average_rating} / 5` : 'No ratings yet'}</span></span>
              <span className="border-l border-zinc-200 pl-4"><span className="block text-sm font-semibold">Feedback</span><span className="mt-0.5 block text-xs text-zinc-500">{Number(seller.feedback_count || 0)} reviews →</span></span>
            </button>
            <button type="button" disabled={!listings.length && viewerId !== sellerId} onClick={startChat} className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-40"><ChatIcon />Live chat</button>
          </div>
        </div>
      </section>

      {notice && <div className="mt-5 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-semibold text-zinc-700">{notice}</div>}

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black tracking-tight sm:text-3xl">Seller listings</h2><p className="mt-1 text-sm text-zinc-500">{shownListings.length} available across all games</p></div><div className="flex gap-2 overflow-x-auto">{[['all','All'],['account','Accounts'],['item','Items'],['service','Services']].map(([id,label]) => <button key={id} onClick={() => setType(id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black ${type === id ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600'}`}>{label}</button>)}</div></div>
        {shownListings.length ? <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_150px_120px] gap-5 border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:grid"><span>Product</span><span>Price</span><span /></div>
          <ul className="divide-y divide-zinc-100">{shownListings.map((listing) => {
            const productType = listing.listing_type || 'account';
            const productName = listing.title || listing.name || `${gameNames[listing.game_id] || 'Game'} ${productType}`;
            return <li key={listing.id}>
              <Link to={`/account/${listing.id}`} className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-4 px-4 py-4 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:grid-cols-[minmax(0,1fr)_150px_120px] sm:gap-5 sm:px-5">
                <div className="contents sm:flex sm:min-w-0 sm:items-center sm:gap-4">
                  <img src={listing.thumbnail_url || listing.image_url || `/games/${listing.game_id}.png`} alt="" loading="lazy" className="h-16 w-20 shrink-0 rounded-xl bg-zinc-100 object-cover sm:h-20 sm:w-28" />
                  <div className="min-w-0"><p className="text-[11px] font-medium text-zinc-500">{gameNames[listing.game_id] || 'Game'} · <span className="capitalize">{productType}</span></p><h3 className="mt-1 line-clamp-2 text-sm font-bold text-zinc-950">{productName}</h3><p className="mt-1.5 text-[11px] text-zinc-400">{[listing.region, listing.platform].filter(Boolean).join(' · ') || 'Available'}</p></div>
                </div>
                <div className="col-start-2 sm:col-auto"><p className="text-lg font-bold tracking-tight">₹{Number(listing.price || 0).toLocaleString('en-IN')}</p>{listing.original_price > listing.price && <p className="text-xs text-zinc-400 line-through">₹{Number(listing.original_price).toLocaleString('en-IN')}</p>}</div>
                <span className="col-start-2 w-fit rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold sm:col-auto">View listing →</span>
              </Link>
            </li>;
          })}</ul>
        </div> : <div className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center"><h3 className="text-lg font-bold">No listings here yet</h3><p className="mt-2 text-sm text-zinc-500">Try another product type.</p></div>}
      </section>

      {showFeedback && <dialog ref={feedbackDialog} onClose={() => setShowFeedback(false)} onClick={(event) => { if (event.target === event.currentTarget) setShowFeedback(false); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-zinc-950/40 backdrop:backdrop-blur-sm">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4"><h2 className="text-lg font-bold">Ratings & feedback</h2><button autoFocus type="button" onClick={() => setShowFeedback(false)} aria-label="Close feedback" className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200">×</button></div>
        {notice && <p role="status" className="px-6 pt-4 text-sm">{notice}</p>}
        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Seller rating</p><div className="mt-4 flex items-end gap-3"><span className="text-5xl font-black tracking-[-0.06em]">{seller.feedback_count ? seller.average_rating : '—'}</span>{seller.feedback_count ? <span className="pb-1 text-lg font-black text-amber-500">★ / 5</span> : <span className="pb-1 text-sm font-bold text-zinc-400">New seller</span>}</div><p className="mt-3 text-sm text-zinc-500">Based on {Number(seller.feedback_count || 0).toLocaleString('en-IN')} completed-order feedback.</p>{eligibleOrderId && <form onSubmit={submitFeedback} className="mt-6 border-t border-zinc-100 pt-6"><h3 className="font-black">Leave feedback</h3><p className="mt-1 text-xs text-zinc-500">Only buyers with a completed order can post.</p><div className="mt-4 flex gap-2">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} className={`text-2xl ${value <= rating ? 'text-amber-400' : 'text-zinc-200'}`}>★</button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} minLength="3" maxLength="500" rows="3" placeholder="Share your experience…" className="mt-3 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-950" /><button disabled={saving} className="mt-3 w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? 'Posting…' : 'Post feedback'}</button></form>}</div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Buyer feedback</h2><span className="text-xs font-bold text-zinc-400">{feedback.length} reviews</span></div>{feedback.length ? <div className="mt-4 divide-y divide-zinc-100">{feedback.map((item) => <article key={item.id} className="py-5 first:pt-2"><div className="flex items-center justify-between gap-3"><span className="text-sm font-black">Verified buyer</span><span className="text-sm text-amber-400">{'★'.repeat(item.rating)}<span className="text-zinc-200">{'★'.repeat(5 - item.rating)}</span></span></div>{item.comment && <p className="mt-2 text-sm leading-6 text-zinc-600">{item.comment}</p>}<p className="mt-2 text-[10px] font-bold text-zinc-400">{new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(item.created_at))}</p></article>)}</div> : <div className="py-16 text-center"><p className="font-black">No feedback yet</p><p className="mt-2 text-sm text-zinc-500">Completed buyers can leave the first review.</p></div>}</div>
        </div>
      </dialog>}
    </div>
  </main>;
}
