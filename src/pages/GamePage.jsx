import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';

const games = {
  'clash-of-clans': { name: 'Clash of Clans', short: 'COC', description: 'Accounts, gems and progression', levelLabel: 'Town Hall', levels: ['17', '16', '15', '14', '13'] },
  'brawl-stars': { name: 'Brawl Stars', short: 'BRAWL', description: 'Accounts, coins and rare brawlers', levelLabel: 'Trophies', levels: ['70K+', '60K+', '50K+', '40K+', '30K+'] },
  valorant: { name: 'Valorant', short: 'VAL', description: 'Accounts, ranks and premium skins', levelLabel: 'Rank', levels: ['Radiant', 'Immortal', 'Ascendant', 'Diamond', 'Platinum'] },
  'clash-royale': { name: 'Clash Royale', short: 'CR', description: 'Accounts, cards and progression', levelLabel: 'King Level', levels: ['15', '14', '13', '12', '11'] },
  fortnite: { name: 'Fortnite', short: 'FN', description: 'Accounts, skins and V-Bucks', levelLabel: 'Rank', levels: ['Unreal', 'Champion', 'Elite', 'Diamond', 'Platinum'] },
  'pokemon-go': { name: 'Pokémon GO', short: 'POGO', description: 'Accounts, Pokémon and items', levelLabel: 'Level', levels: ['50', '45+', '40+', '35+', '30+'] },
  'mobile-legends': { name: 'Mobile Legends', short: 'MLBB', description: 'Accounts, heroes and diamonds', levelLabel: 'Rank', levels: ['Mythical Glory', 'Mythic', 'Legend', 'Epic', 'Grandmaster'] },
  'free-fire': { name: 'Free Fire', short: 'FF', description: 'Accounts, collections and diamonds', levelLabel: 'Rank', levels: ['Grandmaster', 'Heroic', 'Diamond', 'Platinum', 'Gold'] },
  'hay-day': { name: 'Hay Day', short: 'HAY DAY', description: 'Accounts, farms and coins', levelLabel: 'Level', levels: ['200+', '150+', '100+', '75+', '50+'] },
  'squad-busters': { name: 'Squad Busters', short: 'SQUAD', description: 'Accounts, squads and gold', levelLabel: 'Level', levels: ['50+', '45+', '40+', '35+', '30+'] },
};

const listingTypes = ['All', 'Accounts', 'Items', 'Services'];
const platforms = ['All platforms', 'Android', 'iOS', 'PC', 'PlayStation', 'Xbox'];
const regions = ['All regions', 'Global', 'Asia', 'Europe', 'North America', 'South America'];
const itemCategories = ['All item categories', 'Currency', 'Skin', 'Collectible', 'Bundle', 'Other'];
const serviceCategories = ['All service categories', 'Boosting', 'Coaching', 'Quest completion', 'Top-up', 'Other'];
const deliveryMethods = [['All delivery','All delivery'],['instant','Instant code/details'],['seller_delivery','Seller delivery'],['scheduled','Scheduled service']];
const priceRanges = [
  { id: 'under2500', label: 'Under ₹2,500', matches: (price) => price < 2500 },
  { id: '2500to7500', label: '₹2,500 – ₹7,500', matches: (price) => price >= 2500 && price <= 7500 },
  { id: '7500to15000', label: '₹7,500 – ₹15,000', matches: (price) => price > 7500 && price <= 15000 },
  { id: '15000plus', label: '₹15,000+', matches: (price) => price > 15000 },
];

const SearchIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.4-4.4M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" /></svg>;
const FilterIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M7 12h10m-7 6h4" /></svg>;
const CheckIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m5 12 4 4L19 6" /></svg>;

function ListingCard({ account, game, seller }) {
  const navigate = useNavigate();
  const title = account.title || account.name || `${game.name} Account`;
  const subtitle = account.description || 'Verified marketplace listing with clear purchase details.';
  const type = String(account.listing_type || account.category || 'account').replace(/s$/, '').toLowerCase();
  const category = type.charAt(0).toUpperCase() + type.slice(1);
  const attributes = account.attributes || {};
  const deliveryLabel = account.delivery_method === 'scheduled' ? 'Scheduled' : account.delivery_method === 'instant' ? 'Instant' : 'Seller delivery';
  const discount = account.original_price > account.price ? Math.round(((account.original_price - account.price) / account.original_price) * 100) : 0;

  return <article onClick={() => navigate(`/account/${account.id}`)} className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/70">
    <div className="relative h-52 shrink-0 overflow-hidden bg-zinc-100">
      {(account.thumbnail_url || account.image_url) ? <img src={account.thumbnail_url || account.image_url} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" decoding="async" /> : <img src={`/games/${account.game_id}.png`} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" loading="lazy" decoding="async" />}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4"><span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-800 backdrop-blur">{category}</span>{discount > 0 && <span className="rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black text-white">-{discount}%</span>}</div>
      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-zinc-800 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{deliveryLabel}</span>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <h2 className="truncate text-lg font-black tracking-tight"><Link to={`/account/${account.id}`} onClick={(event) => event.stopPropagation()} className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950">{title}</Link></h2>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">{account.region && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">{account.region}</span>}{account.platform && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">{account.platform}</span>}{type === 'account' && account.full_email_access && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">Full access</span>}{type === 'item' && attributes.quantity && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">Qty {attributes.quantity}</span>}{type === 'service' && attributes.estimated_days && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">{attributes.estimated_days} day{Number(attributes.estimated_days) === 1 ? '' : 's'}</span>}</div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
        <div className="min-w-0">
          {discount > 0 && <p className="mb-0.5 text-xs text-zinc-400 line-through">₹{Number(account.original_price).toLocaleString('en-IN')}</p>}
          <p className="flex flex-wrap items-baseline gap-1.5"><span className="text-[22px] font-bold leading-tight tracking-tight">₹{Number(account.price || 0).toLocaleString('en-IN')}</span><span className="text-[10px] font-medium text-zinc-400">INR</span></p>
        </div>
        <Link to={`/account/${account.id}`} onClick={(event) => event.stopPropagation()} className="inline-flex h-10 shrink-0 items-center justify-center gap-3 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950">Buy now <span aria-hidden="true">→</span></Link>
      </div>
    </div>
    {seller && <Link to={`/seller/${seller.user_id}`} onClick={(event) => event.stopPropagation()} className="flex min-w-0 items-center gap-2.5 border-t border-zinc-100 bg-zinc-50/80 px-5 py-3.5 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-950">
      {seller.avatar_url ? <img src={seller.avatar_url} alt="" loading="lazy" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-zinc-200" /> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-950 text-[10px] font-bold text-white">{seller.display_name?.charAt(0).toUpperCase()}</span>}
      <span className="flex min-w-0 flex-1 items-center gap-1.5"><span className="truncate text-[13px] font-semibold text-zinc-800">{seller.display_name}</span><span title="Verified seller" aria-label="Verified seller" className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckIcon /></span></span>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-zinc-500">{Number(seller.total_sales || 0).toLocaleString('en-IN')} orders</span>
    </Link>}
  </article>;
}

export default function GamePage() {
  const { gameId } = useParams();
  const game = games[gameId];
  const [accounts, setAccounts] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [level, setLevel] = useState('All');
  const [platform, setPlatform] = useState('All platforms');
  const [region, setRegion] = useState('All regions');
  const [delivery, setDelivery] = useState('All delivery');
  const [category, setCategory] = useState('All categories');
  const [serviceTime, setServiceTime] = useState('Any duration');
  const [price, setPrice] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [fullAccess, setFullAccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!showFilters) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowFilters(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [showFilters]);

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      if (!game) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      const { data, error: loadError } = await supabase.from('accounts').select('*').eq('game_id', gameId).eq('status', 'available').order('created_at', { ascending: false });
      if (!active) return;
      if (loadError) setError('We could not load these listings. Please try again.');
      else {
        const listings = data || [];
        setAccounts(listings);
        const sellerIds = [...new Set(listings.map((item) => item.seller_id).filter(Boolean))];
        if (sellerIds.length) {
          const { data: sellerRows } = await supabase.from('public_sellers').select('user_id,display_name,avatar_url,total_sales').in('user_id', sellerIds);
          if (active) setSellers(Object.fromEntries((sellerRows || []).map((seller) => [seller.user_id, seller])));
        } else setSellers({});
      }
      setLoading(false);
    };
    loadListings();

    const channel = supabase
      .channel(`available-listings-${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `game_id=eq.${gameId}` }, (payload) => {
        const listingId = payload.old?.id || payload.new?.id;
        if (!listingId) return;
        if (payload.eventType === 'DELETE' || payload.new?.status !== 'available') {
          setAccounts((current) => current.filter((listing) => listing.id !== listingId));
          return;
        }
        setAccounts((current) => {
          const exists = current.some((listing) => listing.id === listingId);
          return exists ? current.map((listing) => listing.id === listingId ? payload.new : listing) : [payload.new, ...current];
        });
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [game, gameId]);

  const filtered = useMemo(() => {
    let result = [...accounts];
    const query = search.trim().toLowerCase();
    if (query) result = result.filter((item) => [item.title, item.name, item.description, item.rank, item.level, item.town_hall, ...Object.values(item.attributes || {})].some((value) => String(value || '').toLowerCase().includes(query)));
    if (type !== 'All') result = result.filter((item) => String(item.listing_type || item.category || 'Account').toLowerCase() === type.replace(/s$/, '').toLowerCase());
    if (level !== 'All') result = result.filter((item) => String(item.rank ?? item.level ?? item.town_hall ?? '').toLowerCase().includes(level.replace('+', '').toLowerCase()));
    if (platform !== 'All platforms') result = result.filter((item) => String(item.platform || '').toLowerCase() === platform.toLowerCase());
    if (region !== 'All regions') result = result.filter((item) => String(item.region || '').toLowerCase() === region.toLowerCase());
    if (delivery !== 'All delivery') result = result.filter((item) => String(item.delivery_method || (item.instant_delivery ? 'instant' : 'seller_delivery')) === delivery);
    if (type === 'Items' && category !== 'All categories') result = result.filter((item) => item.attributes?.item_category === category);
    if (type === 'Services' && category !== 'All categories') result = result.filter((item) => item.attributes?.service_category === category);
    if (type === 'Services' && serviceTime !== 'Any duration') result = result.filter((item) => {
      const days = Number(item.attributes?.estimated_days || 0);
      return serviceTime === '1 day' ? days <= 1 : serviceTime === 'Up to 3 days' ? days <= 3 : days > 3;
    });
    if (verifiedOnly) result = result.filter((item) => item.verified !== false);
    if (fullAccess) result = result.filter((item) => item.full_email_access === true);
    if (price.length) result = result.filter((item) => price.some((id) => priceRanges.find((range) => range.id === id)?.matches(Number(item.price || 0))));
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return result;
  }, [accounts, category, delivery, fullAccess, level, platform, price, region, search, serviceTime, type, verifiedOnly]);

  const activeFilterCount = [type !== 'All', level !== 'All', platform !== 'All platforms', region !== 'All regions', delivery !== 'All delivery', category !== 'All categories', serviceTime !== 'Any duration', verifiedOnly, fullAccess, price.length > 0].filter(Boolean).length;
  const clearFilters = () => { setType('All'); setLevel('All'); setPlatform('All platforms'); setRegion('All regions'); setDelivery('All delivery'); setCategory('All categories'); setServiceTime('Any duration'); setPrice([]); setVerifiedOnly(false); setFullAccess(false); setSearch(''); };
  const selectClass = 'h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-[#c68d00] focus:ring-4 focus:ring-yellow-100';

  if (!game) return <main className="grid min-h-screen place-items-center bg-white px-5 pt-16 text-center"><div><p className="text-sm font-black text-[#b77e00]">GAME NOT FOUND</p><h1 className="mt-3 text-4xl font-black">This marketplace is unavailable.</h1><Link to="/#games" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">View all games</Link></div></main>;

  return <main className="min-h-screen bg-white pb-20 pt-16 text-zinc-950">
    <section className="border-b border-zinc-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400"><Link to="/" className="hover:text-zinc-950">Home</Link><span>›</span><Link to="/#games" className="hover:text-zinc-950">Games</Link><span>›</span><span className="text-zinc-700">{game.name}</span></div>
        <div className="mt-5 flex items-center gap-4"><img src={`/games/${gameId}.png`} alt="" className="h-14 w-14 rounded-2xl object-cover shadow-sm ring-1 ring-zinc-200 sm:h-16 sm:w-16" /><div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#a87300]">{game.short} marketplace</p><h1 className="mt-1 text-2xl font-black tracking-[-0.035em] sm:text-4xl">{game.name} marketplace</h1><p className="mt-1 text-sm text-zinc-500">{game.description}</p></div></div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">{listingTypes.map((item) => <button key={item} onClick={() => { setType(item); setCategory('All categories'); setLevel('All'); setServiceTime('Any duration'); setFullAccess(false); }} className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-black transition ${type === item ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'}`}>{item}</button>)}</div>
      </div>
    </section>

    <section className="border-b border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl gap-3"><label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 focus-within:border-[#c68d00] focus-within:bg-white focus-within:ring-4 focus-within:ring-yellow-100"><span className="text-zinc-400"><SearchIcon /></span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${game.name} listings...`} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><button onClick={() => setShowFilters(true)} className="relative inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl border border-zinc-950 bg-zinc-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 sm:px-5"><FilterIcon /><span>Filters</span>{activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-yellow-300 px-1 text-[10px] text-zinc-950">{activeFilterCount}</span>}</button></div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <div className="min-w-0">
        <div className="mb-6"><h2 className="text-xl font-black sm:text-2xl">Available listings</h2><p className="mt-1 text-sm text-zinc-500">{loading ? 'Loading…' : `${filtered.length} results`}</p></div>
        {loading ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[430px] animate-pulse rounded-3xl bg-zinc-100" />)}</div> : error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-7 text-sm font-semibold text-red-700">{error}</div> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((account) => <ListingCard key={account.id} account={account} game={game} seller={sellers[account.seller_id]} />)}</div> : <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-20 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-zinc-400 shadow-sm"><SearchIcon /></span><h2 className="mt-5 text-xl font-black">No listings found</h2><p className="mt-2 text-sm text-zinc-500">Try removing some filters or check again soon.</p>{activeFilterCount > 0 && <button onClick={clearFilters} className="mt-6 rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Clear filters</button>}</div>}
      </div>
    </section>

    {showFilters && <div className="fixed inset-0 z-[100] flex items-end justify-end bg-zinc-950/25 backdrop-blur-sm sm:items-stretch" role="dialog" aria-modal="true" aria-label="Listing filters" onMouseDown={() => setShowFilters(false)}>
      <aside className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-zinc-200 bg-white shadow-2xl sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-y-0 sm:border-r-0" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5 sm:px-7"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">Refine results</p><h2 className="mt-1 text-2xl font-black">Filters</h2></div><button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters" className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200 text-2xl font-light text-zinc-600 transition hover:bg-zinc-100">×</button></div>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <div className="space-y-5">
            {(type === 'All' || type === 'Accounts') && <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">{game.levelLabel}</span><select value={level} onChange={(event) => setLevel(event.target.value)} className={selectClass}><option>All</option>{game.levels.map((item) => <option key={item}>{item}</option>)}</select></label>}
            {type === 'Items' && <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Item category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className={selectClass}><option value="All categories">All item categories</option>{itemCategories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>}
            {type === 'Services' && <><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Service category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className={selectClass}><option value="All categories">All service categories</option>{serviceCategories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Completion time</span><select value={serviceTime} onChange={(event) => setServiceTime(event.target.value)} className={selectClass}><option>Any duration</option><option>1 day</option><option>Up to 3 days</option><option>More than 3 days</option></select></label></>}
            <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Platform</span><select value={platform} onChange={(event) => setPlatform(event.target.value)} className={selectClass}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Region</span><select value={region} onChange={(event) => setRegion(event.target.value)} className={selectClass}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Delivery</span><select value={delivery} onChange={(event) => setDelivery(event.target.value)} className={selectClass}>{deliveryMethods.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <div><span className="mb-3 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Price</span><div className="grid gap-3 sm:grid-cols-2">{priceRanges.map((range) => <label key={range.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3 text-sm font-semibold text-zinc-600"><input type="checkbox" checked={price.includes(range.id)} onChange={() => setPrice((current) => current.includes(range.id) ? current.filter((item) => item !== range.id) : [...current, range.id])} className="h-4 w-4 accent-zinc-950" />{range.label}</label>)}</div></div>
            <div className="space-y-3 border-t border-zinc-100 pt-5"><label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-zinc-700"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-zinc-950" />Verified listings</label>{(type === 'All' || type === 'Accounts') && <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-zinc-700"><input type="checkbox" checked={fullAccess} onChange={(event) => setFullAccess(event.target.checked)} className="h-4 w-4 accent-zinc-950" />Full email access</label>}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-200 bg-white px-5 py-4 sm:px-7"><button type="button" onClick={clearFilters} className="h-12 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50">Clear all</button><button type="button" onClick={() => setShowFilters(false)} className="h-12 rounded-xl bg-zinc-950 text-sm font-bold text-white transition hover:bg-zinc-800">Show {filtered.length} results</button></div>
      </aside>
    </div>}
  </main>;
}
