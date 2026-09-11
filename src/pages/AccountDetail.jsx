import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';

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
      const { data } = await supabase.from('accounts').select('*').eq('id', id).eq('status', 'available').maybeSingle();
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'DELETE' || payload.new?.status !== 'available') {
          setAccount(null);
          setPurchaseError('This listing has just been purchased and is no longer available.');
          return;
        }
        setAccount(payload.new);
      })
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

  if (loading) return <main className="min-h-screen bg-white px-5 pb-20 pt-28"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-5 w-28 rounded bg-zinc-100" /><div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]"><div className="h-[560px] rounded-3xl bg-zinc-100" /><div className="h-[520px] rounded-3xl bg-zinc-100" /></div></div></main>;

  if (!account) return <main className="grid min-h-screen place-items-center bg-white px-5 pt-16 text-center"><div><p className="text-sm font-black text-[#b77e00]">LISTING NOT FOUND</p><h1 className="mt-3 text-4xl font-black">This account is unavailable.</h1><Link to="/" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Back to games</Link></div></main>;

  const gameName = gameNames[account.game_id] || 'Game account';
  const title = account.title || (account.game_id === 'clash-of-clans' && account.town_hall ? `TH${account.town_hall} Maxed Account` : `${gameName} Account`);
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
  const stats = [
    { label: account.game_id === 'clash-of-clans' ? 'Town Hall' : 'Primary level', value: account.town_hall ? `${account.game_id === 'clash-of-clans' ? 'TH' : ''}${account.town_hall}` : 'High' },
    { label: 'Secondary level', value: account.builder_hall ? `BH${account.builder_hall}` : account.walls_level || '—' },
    { label: 'Experience', value: account.exp_level ? `Level ${account.exp_level}` : 'High' },
    { label: 'Currency / items', value: account.gems ? Number(account.gems).toLocaleString('en-IN') : 'Included' },
    { label: 'Features', value: account.heroes_level || 'Premium' },
    { label: 'Delivery', value: account.instant_delivery === false ? 'Manual' : 'Instant' },
  ];

  return <main className="min-h-screen bg-white pb-20 pt-16 text-zinc-950">
    <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
      <Link to={`/game/${account.game_id || 'clash-of-clans'}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-zinc-950"><ArrowLeft className="h-4 w-4" />Back to {gameName}</Link>

      <div className="mt-7 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-14">
        <section className="min-w-0">
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 sm:h-[560px]">
            {images.length ? <img key={images[activeImage]} src={images[activeImage]} alt={`${title} image ${activeImage + 1}`} className="h-full w-full object-contain" loading="eager" decoding="async" /> : <div className="text-center text-zinc-400"><span className="text-6xl">🎮</span><p className="mt-3 text-sm font-bold">No image available</p></div>}
            {images.length > 1 && <><button type="button" onClick={previousImage} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white/95 text-zinc-950 shadow-lg backdrop-blur transition hover:scale-105 sm:left-5"><ArrowLeft /></button><button type="button" onClick={nextImage} aria-label="Next image" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white/95 text-zinc-950 shadow-lg backdrop-blur transition hover:scale-105 sm:right-5"><ArrowRight /></button><span className="absolute bottom-4 right-4 rounded-full bg-zinc-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">{activeImage + 1} / {images.length}</span></>}
          </div>
          {images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-100 transition sm:h-24 sm:w-28 ${activeImage === index ? 'border-zinc-950 opacity-100' : 'border-transparent opacity-55 hover:opacity-100'}`} aria-label={`Show image ${index + 1}`} aria-current={activeImage === index}><img src={thumbnails[index]} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /></button>)}</div>}
          <p className="mt-2 text-xs text-zinc-400">Images are shown without cropping. Use the arrows or thumbnails to view the complete gallery.</p>
        </section>

        <section className="lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-yellow-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8b6100]">{gameName}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Available</span></div>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-500 sm:text-base">{account.description || 'A reviewed marketplace listing with clear details and support available throughout your purchase.'}</p>

          {seller && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white">{seller.display_name.charAt(0).toUpperCase()}</span><div><p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Sold by</p><p className="mt-0.5 font-black">{seller.display_name} <span className="ml-1 text-xs text-emerald-600">✓ Verified seller</span></p></div></div>}

          <div className="mt-7 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Price</p><div className="mt-2 flex flex-wrap items-baseline gap-3"><span className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">₹{Number(account.price || 0).toLocaleString('en-IN')}</span>{account.original_price > account.price && <span className="text-lg text-zinc-400 line-through">₹{Number(account.original_price).toLocaleString('en-IN')}</span>}</div><div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-zinc-200"><ShieldIcon />Secure checkout</span><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200"><CheckIcon />Reviewed listing</span></div></div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4"><p className="truncate text-sm font-black">{stat.value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p></div>)}</div>

          <div className="mt-7 space-y-3"><div className="flex items-center gap-3 text-sm font-semibold text-zinc-600"><span className="text-emerald-600"><CheckIcon /></span>Purchase details shown before payment</div><div className="flex items-center gap-3 text-sm font-semibold text-zinc-600"><span className="text-emerald-600"><CheckIcon /></span>Private buyer support available</div><div className="flex items-center gap-3 text-sm font-semibold text-zinc-600"><span className="text-emerald-600"><CheckIcon /></span>Delivery status tracked in My Orders</div></div>

          {purchaseError && <p className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{purchaseError}</p>}
          <div className="mt-8 grid gap-3 sm:grid-cols-2"><button onClick={beginCheckout} disabled={checkingOut} className="rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-[#b77e00] disabled:cursor-not-allowed disabled:opacity-60">{checkingOut ? 'Checking availability…' : 'Buy now'}</button><button onClick={() => navigate('/support')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-sm font-bold transition hover:border-zinc-950"><ChatIcon />Ask a question</button></div>
        </section>
      </div>
    </div>
  </main>;
}
