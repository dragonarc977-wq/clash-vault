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
const BoltIcon = () => <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2 4.5 13H11l-1 9 8.5-12H12l1-8Z" /></svg>;
const UsersIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-11.9a4 4 0 0 1 0 7.75" /></svg>;

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
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
  const paymentDeliveryText =
    account.delivery_method === 'scheduled'
      ? 'Scheduled delivery after payment'
      : account.delivery_method === 'instant'
        ? 'Instant delivery after payment'
        : 'Seller delivery after payment';
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
  const formattedPrice = Number(account.price || 0).toLocaleString('en-IN');
  const hasOriginalPrice = Number(account.original_price) > Number(account.price);

  return (
    <main className="min-h-screen bg-white pb-24 pt-16 text-zinc-950">
      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-14 lg:py-8">
        <Link
          to={`/game/${account.game_id || 'clash-of-clans'}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {gameName}
        </Link>

        <nav className="mt-5 hidden items-center gap-2 text-xs font-medium text-zinc-400 md:flex" aria-label="Breadcrumb">
          <Link to="/" className="transition hover:text-zinc-950">Home</Link><span>›</span>
          <Link to="/" className="transition hover:text-zinc-950">All Games</Link><span>›</span>
          <Link to={`/game/${account.game_id || 'clash-of-clans'}`} className="transition hover:text-zinc-950">{gameName}</Link><span>›</span>
          <span>{typeLabel}s</span><span>›</span>
          <span className="max-w-52 truncate text-zinc-500">{title}</span>
        </nav>

        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-zinc-100 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-zinc-600">{gameName}</span>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-blue-600">{typeLabel}</span>
            <span className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wide ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>{isAvailable ? 'Available' : 'Purchased'}</span>
          </div>
          <h1 className="mt-4 max-w-6xl break-words text-[25px] font-black leading-[1.2] tracking-[-0.035em] sm:text-[30px] lg:text-[30px] xl:text-[32px]">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-bold text-zinc-600">
            <span className="inline-flex items-center gap-2"><span className="text-emerald-500"><ShieldIcon /></span>Verified Seller</span>
            <span className="h-5 w-px bg-zinc-300" />
            <span className="inline-flex items-center gap-2 text-blue-600"><BoltIcon />{deliveryLabel}</span>
          </div>
        </header>

        <div className="mt-7 grid min-h-[calc(100vh-15rem)] items-start gap-7 lg:grid-cols-[minmax(0,1.62fr)_minmax(360px,0.88fr)] xl:gap-9">
          <section className="min-w-0">
            <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm sm:h-[520px] lg:h-[500px] xl:h-[540px]">
              {images.length ? (
                <img
                  key={images[activeImage]}
                  src={images[activeImage]}
                  alt={`${title} image ${activeImage + 1}`}
                  className="h-full w-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="text-center text-zinc-400">
                  <span className="text-6xl">🎮</span>
                  <p className="mt-3 text-sm font-bold">No image available</p>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-zinc-950 shadow-md transition hover:scale-105"
                  >
                    <ArrowLeft />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-zinc-950 shadow-md transition hover:scale-105"
                  >
                    <ArrowRight />
                  </button>
                  <span className="absolute bottom-4 right-4 rounded-full bg-zinc-950/80 px-4 py-2 text-xs font-bold text-white">
                    {activeImage + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-24 w-36 shrink-0 overflow-hidden rounded-lg border-[3px] bg-zinc-100 transition ${
                      activeImage === index
                        ? 'border-yellow-400 opacity-100'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={activeImage === index}
                  >
                    <img
                      src={thumbnails[index]}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_22px_60px_-42px_rgba(24,24,27,0.55)] sm:p-7 lg:sticky lg:top-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">Price</p><div className="mt-2 flex items-baseline gap-2"><span className="text-[38px] font-black leading-none tracking-[-0.05em]">₹{formattedPrice}</span>{hasOriginalPrice && <span className="text-sm font-semibold text-zinc-400 line-through">₹{Number(account.original_price).toLocaleString('en-IN')}</span>}</div></div>
              <div className="flex gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 px-3 py-2 text-[11px] font-bold text-emerald-600"><ShieldIcon />Secure</span><span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 px-3 py-2 text-[11px] font-bold text-zinc-600"><CheckIcon />Reviewed</span></div>
            </div>

            {purchaseError && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">{purchaseError}</p>}
            {isAvailable ? <button onClick={beginCheckout} disabled={checkingOut} style={{ backgroundColor: '#f9c600', color: '#fff' }} className="mt-7 w-full rounded-xl px-6 py-4 text-base font-black shadow-[0_12px_28px_-16px_rgba(202,138,4,0.85)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{checkingOut ? 'Checking availability…' : 'Buy now'}</button> : <button onClick={() => navigate('/my-orders')} className="mt-7 w-full rounded-xl bg-zinc-950 px-6 py-4 text-base font-black text-white">Open my order</button>}
            <button onClick={() => navigate('/support')} className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-6 py-4 text-base font-black transition hover:border-zinc-950"><ChatIcon />Ask a question</button>

            <div className="mt-6 space-y-5 border-t border-zinc-200 pt-6 text-sm font-medium text-zinc-500">
              <div className="flex items-center gap-4"><span className="text-blue-600"><BoltIcon /></span>{paymentDeliveryText}</div>
              <div className="flex items-center gap-4"><span className="text-emerald-500"><ShieldIcon /></span>Safe and secure transactions</div>
              <div className="flex items-center gap-4"><span className="text-zinc-500"><UsersIcon /></span>Private marketplace support</div>
            </div>
          </aside>
        </div>

        <div className="mt-16 border-t border-zinc-200 pt-12 sm:mt-20 sm:pt-16">
          <section aria-labelledby="listing-details-heading">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                Listing information
              </p>
              <h2
                id="listing-details-heading"
                className="mt-2 text-3xl font-black tracking-[-0.04em]"
              >
                {typeLabel} details
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Review the important specifications before continuing to checkout.
              </p>
            </div>

            <div className="mt-7 grid overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-0 border-b border-zinc-200 p-5 last:border-b-0 sm:border-r lg:p-6"
                >
                  <p
                    className="truncate text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400"
                    title={stat.label}
                  >
                    {stat.label}
                  </p>
                  <p className="mt-2 break-words text-[16px] font-bold leading-6 text-zinc-950">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="listing-description-heading"
            className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:mt-16 sm:p-8"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-500">
              Seller notes
            </p>
            <h2
              id="listing-description-heading"
              className="mt-2 text-2xl font-black tracking-[-0.035em]"
            >
              {typeLabel} description
            </h2>
            <p className="mt-4 max-w-4xl whitespace-pre-wrap break-words text-[16px] leading-8 text-zinc-600">
              {account.description ||
                'A reviewed marketplace listing with clear details and support available throughout your purchase.'}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
