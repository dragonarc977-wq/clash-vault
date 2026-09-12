import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import { accountFieldValue, getAccountFields } from '../lib/listingOptions';

const gameNames = {
  'clash-of-clans': 'Clash of Clans', 'brawl-stars': 'Brawl Stars', valorant: 'Valorant',
  'clash-royale': 'Clash Royale', fortnite: 'Fortnite', 'pokemon-go': 'Pokémon GO',
  'mobile-legends': 'Mobile Legends', 'free-fire': 'Free Fire', 'hay-day': 'Hay Day', 'squad-busters': 'Squad Busters',
};

const ArrowLeft = ({ className = 'h-5 w-5' }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m15 18-6-6 6-6" /></svg>;
const ArrowRight = ({ className = 'h-5 w-5' }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" /></svg>;
const CheckIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m5 12 4 4L19 6" /></svg>;
const ShieldIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4" /></svg>;
const ChatIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;
const formatSellerDate = (value) => value ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value)) : 'Verified';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [seller, setSeller] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      const { data } = await supabase.from('accounts').select('*').eq('id', id).maybeSingle();
      if (!active) return;
      setAccount(data);
      if (data?.seller_id) {
        const { data: sellerData } = await supabase.from('public_sellers').select('*').eq('user_id', data.seller_id).maybeSingle();
        if (active) setSeller(sellerData);
      }
      setActiveImage(0);
      setLoading(false);
    };
    loadAccount();

    const channel = supabase
      .channel(`listing-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `id=eq.${id}` }, () => loadAccount())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  const images = useMemo(() => {
    if (!account) return [];
    const gallery = Array.isArray(account.image_urls) ? account.image_urls.filter(Boolean) : [];
    if (account.image_url && !gallery.includes(account.image_url)) gallery.unshift(account.image_url);
    return gallery;
  }, [account]);
  const thumbnails = useMemo(() => {
    if (!account) return [];
    const gallery = Array.isArray(account.thumbnail_urls) ? account.thumbnail_urls.filter(Boolean) : [];
    return images.map((image, index) => gallery[index] || image);
  }, [account, images]);

  if (loading) return <main className="min-h-screen bg-white px-5 pb-20 pt-24"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-5 w-28 rounded bg-zinc-100" /><div className="mt-7 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"><div className="h-[430px] rounded-3xl bg-zinc-100" /><div className="h-[430px] rounded-3xl bg-zinc-100" /></div></div></main>;

  if (!account) return <main className="grid min-h-screen place-items-center bg-white px-5 pt-16 text-center"><div><p className="text-sm font-black text-[#b77e00]">LISTING NOT FOUND</p><h1 className="mt-3 text-4xl font-black">This listing is unavailable.</h1><Link to="/" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Back to games</Link></div></main>;

  const gameName = gameNames[account.game_id] || 'Game account';
  const isAvailable = account.status === 'available';
  const listingType = String(account.listing_type || 'account').replace(/s$/, '').toLowerCase();
  const attributes = account.attributes || {};
  const typeLabel = listingType.charAt(0).toUpperCase() + listingType.slice(1);
  const title = account.title || (listingType === 'item' ? attributes.item_name : listingType === 'service' ? attributes.service_name : account.game_id === 'clash-of-clans' && account.town_hall ? `TH${account.town_hall} Maxed Account` : `${gameName} Account`);
  const previousImage = () => setActiveImage((current) => current === 0 ? images.length - 1 : current - 1);
  const nextImage = () => setActiveImage((current) => current === images.length - 1 ? 0 : current + 1);
  const beginCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setPurchaseError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase.from('accounts').select('id').eq('id', id).eq('status', 'available').maybeSingle();
    if (error || !data) {
      setAccount(null);
      setPurchaseError('This listing is no longer available. Please choose another account.');
      setCheckingOut(false);
      return;
    }
    navigate(`/checkout/${id}`);
  };
  const deliveryLabel = account.delivery_method === 'scheduled' ? 'Scheduled' : account.delivery_method === 'instant' ? 'Instant' : 'Seller delivery';
  const stats = listingType === 'item' ? [
    { label: 'Item', value: attributes.item_name || title }, { label: 'Category', value: attributes.item_category || 'Item' }, { label: 'Quantity', value: attributes.quantity || 1 },
    { label: 'Platform', value: account.platform || 'Any' }, { label: 'Region', value: account.region || 'Global' }, { label: 'Delivery', value: deliveryLabel },
  ] : listingType === 'service' ? [
    { label: 'Service', value: attributes.service_name || title }, { label: 'Category', value: attributes.service_category || 'Service' }, { label: 'Completion', value: attributes.estimated_days ? `${attributes.estimated_days} day${Number(attributes.estimated_days) === 1 ? '' : 's'}` : 'Agreed with seller' },
    { label: 'Platform', value: account.platform || 'Any' }, { label: 'Region', value: account.region || 'Global' }, { label: 'Delivery', value: deliveryLabel },
  ] : [
    ...getAccountFields(account.game_id).map((field) => ({ label: field.label, value: accountFieldValue(account, field.key) })).filter((stat) => stat.value !== null && stat.value !== undefined && stat.value !== ''),
    { label: 'Access', value: attributes.access || (account.full_email_access ? 'Full email access' : 'Game login') },
    { label: 'Platform', value: account.platform || 'Any' }, { label: 'Region', value: account.region || 'Global' }, { label: 'Delivery', value: deliveryLabel },
  ];

  return <main className="min-h-screen bg-white pb-20 pt-16 text-zinc-950">
    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
      <Link to={`/game/${account.game_id || 'clash-of-clans'}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-zinc-950"><ArrowLeft className="h-4 w-4" />Back to {gameName}</Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:gap-10">
        <section className="min-w-0">
          <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm sm:h-[430px]">
            {images.length ? <img key={images[activeImage]} src={images[activeImage]} alt={`${title} image ${activeImage + 1}`} className="h-full w-full object-contain" loading="eager" decoding="async" /> : <div className="text-center text-zinc-400"><span className="text-6xl">🎮</span><p className="mt-3 text-sm font-bold">No image available</p></div>}
            {images.length > 1 && <><button type="button" onClick={previousImage} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white/95 text-zinc-950 shadow-md transition hover:scale-105 sm:left-4"><ArrowLeft /></button><button type="button" onClick={nextImage} aria-label="Next image" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white/95 text-zinc-950 shadow-md transition hover:scale-105 sm:right-4"><ArrowRight /></button><span className="absolute bottom-3 right-3 rounded-full bg-zinc-950/80 px-3 py-1.5 text-[10px] font-bold text-white">{activeImage + 1} / {images.length}</span></>}
          </div>
          {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-100 transition ${activeImage === index ? 'border-zinc-950 opacity-100' : 'border-transparent opacity-55 hover:opacity-100'}`} aria-label={`Show image ${index + 1}`} aria-current={activeImage === index}><img src={thumbnails[index]} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /></button>)}</div>}
        </section>

        <section className="lg:sticky lg:top-20">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-700">{gameName}</span><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-blue-700">{typeLabel}</span><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'}`} />{isAvailable ? 'Available' : 'Purchased'}</span></div>
          <h1 className="mt-4 break-words text-2xl font-black leading-[1.12] tracking-[-0.035em] sm:text-3xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{account.description || 'A reviewed marketplace listing with clear details and support available throughout your purchase.'}</p>

          {seller && <section className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="flex items-center gap-3 p-4 sm:p-5">{seller.avatar_url ? <img src={seller.avatar_url} alt={`${seller.display_name} profile`} className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-100 object-cover" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-base font-black text-white">{seller.display_name.charAt(0).toUpperCase()}</span>}<div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">Seller profile</p><div className="mt-1 flex flex-wrap items-center gap-2"><p className="truncate text-base font-black">{seller.display_name}</p><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">✓ Verified</span></div></div><button onClick={() => navigate(`/seller-chat/${account.id}`)} className="rounded-full bg-zinc-950 px-4 py-2.5 text-[10px] font-black text-white">Chat with seller</button></div><div className="grid grid-cols-3 border-t border-zinc-100 bg-zinc-50"><div className="p-3 text-center"><p className="text-xs font-black">Verified</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-400">Identity</p></div><div className="border-x border-zinc-200 p-3 text-center"><p className="text-xs font-black">{formatSellerDate(seller.created_at)}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-400">Member since</p></div><div className="p-3 text-center"><p className="text-xs font-black">{Number(seller.total_sales || 0).toLocaleString('en-IN')}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-400">Total sales</p></div></div></section>}

          <div className="mt-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Price</p><div className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-black tracking-[-0.04em]">₹{Number(account.price || 0).toLocaleString('en-IN')}</span>{account.original_price > account.price && <span className="text-sm text-zinc-400 line-through">₹{Number(account.original_price).toLocaleString('en-IN')}</span>}</div></div><div className="flex gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[10px] font-bold text-emerald-700 ring-1 ring-zinc-200"><ShieldIcon />Secure</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[10px] font-bold text-zinc-700 ring-1 ring-zinc-200"><CheckIcon />Reviewed</span></div></div></div>

          <section className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white"><div className="border-b border-zinc-100 px-5 py-4"><h2 className="text-base font-black">Product details</h2><p className="mt-1 text-xs text-zinc-400">Information supplied by the verified seller</p></div><div className="grid sm:grid-cols-2">{stats.map((stat) => <div key={stat.label} className="flex min-w-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3.5 sm:odd:border-r"><p className="text-xs font-semibold text-zinc-500">{stat.label}</p><p className="max-w-[58%] truncate text-right text-sm font-black">{stat.value}</p></div>)}</div></section>

          <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{['Details before payment', 'Private buyer support', 'Tracked delivery'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-[10px] font-bold text-zinc-600"><span className="text-emerald-600"><CheckIcon /></span>{item}</div>)}</div>

          {purchaseError && <p className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{purchaseError}</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{isAvailable ? <button onClick={beginCheckout} disabled={checkingOut} className="rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">{checkingOut ? 'Checking availability…' : 'Buy now'}</button> : <button onClick={() => navigate('/my-orders')} className="rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-black text-white">Open my order</button>}<button onClick={() => navigate('/support')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-3.5 text-sm font-bold transition hover:border-zinc-950"><ChatIcon />Ask a question</button></div>
        </section>
      </div>
    </div>
  </main>;
}
