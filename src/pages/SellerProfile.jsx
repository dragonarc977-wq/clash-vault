import { useEffect, useMemo, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: sellerData }, { data: listingData }, { data: sessionData }] = await Promise.all([
        supabase.from('public_sellers').select('*').eq('user_id', sellerId).maybeSingle(),
        supabase.from('accounts').select('*').eq('seller_id', sellerId).eq('status', 'available').order('created_at', { ascending: false }),
        supabase.auth.getSession(),
      ]);
      if (!active) return;
      setSeller(sellerData || null);
      setListings(listingData || []);
      setViewerId(sessionData?.session?.user?.id || null);
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

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-24"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-72 rounded-3xl bg-zinc-200" /><div className="mt-8 h-80 rounded-3xl bg-white" /></div></main>;
  if (!seller) return <main className="grid min-h-screen place-items-center bg-white px-5 pt-16 text-center"><div><p className="text-sm font-black text-zinc-400">SELLER NOT FOUND</p><h1 className="mt-3 text-3xl font-black">This seller profile is unavailable.</h1><Link to="/" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Return home</Link></div></main>;

  return <main className="min-h-screen bg-zinc-50 pb-20 pt-16 text-zinc-950">
    <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
        <div className="relative h-40 bg-zinc-900 sm:h-64">{seller.cover_url ? <img src={seller.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600" />}<div className="absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-transparent to-transparent" /></div>
        <div className="flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-8">
          <div className="-mt-12 flex min-w-0 items-end gap-4 sm:-mt-14"><span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-zinc-950 text-3xl font-black text-white shadow-md sm:h-28 sm:w-28">{seller.avatar_url ? <img src={seller.avatar_url} alt={`${seller.display_name} profile`} className="h-full w-full object-cover" /> : seller.display_name.charAt(0).toUpperCase()}</span><div className="min-w-0 pb-1"><h1 className="truncate text-2xl font-black tracking-[-0.04em] sm:text-4xl">{seller.display_name}</h1><p className="mt-1 text-sm font-bold text-zinc-500">{Number(seller.total_sales || 0).toLocaleString('en-IN')} orders</p></div></div>
          <button type="button" disabled={!listings.length} onClick={startChat} className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"><ChatIcon />Live chat</button>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black tracking-tight sm:text-3xl">Seller listings</h2><p className="mt-1 text-sm text-zinc-500">{shownListings.length} available across all games</p></div><div className="flex gap-2 overflow-x-auto">{[['all','All'],['account','Accounts'],['item','Items'],['service','Services']].map(([id,label]) => <button key={id} onClick={() => setType(id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black ${type === id ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600'}`}>{label}</button>)}</div></div>
        {shownListings.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shownListings.map((listing) => <article key={listing.id} onClick={() => navigate(`/account/${listing.id}`)} className="group cursor-pointer overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-52 overflow-hidden bg-zinc-100"><img src={listing.thumbnail_url || listing.image_url || `/games/${listing.game_id}.png`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase backdrop-blur">{listing.listing_type || 'account'}</span></div><div className="p-5"><p className="text-xs font-bold text-zinc-400">{gameNames[listing.game_id] || 'Game'}</p><h3 className="mt-2 truncate text-lg font-black">{listing.title || 'Marketplace listing'}</h3><div className="mt-5 flex items-end justify-between border-t border-zinc-100 pt-4"><span className="text-2xl font-black">₹{Number(listing.price || 0).toLocaleString('en-IN')}</span><span className="text-xs font-bold text-emerald-600">Available</span></div></div></article>)}</div> : <div className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-20 text-center"><h3 className="text-xl font-black">No listings here yet</h3><p className="mt-2 text-sm text-zinc-500">Try another product type.</p></div>}
      </section>
    </div>
  </main>;
}
