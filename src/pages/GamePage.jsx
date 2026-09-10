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

const listingTypes = ['All', 'Accounts', 'Items', 'Top-ups', 'Services'];
const platforms = ['All platforms', 'Android', 'iOS', 'PC', 'PlayStation', 'Xbox'];
const regions = ['All regions', 'Global', 'Asia', 'Europe', 'North America', 'South America'];
const priceRanges = [
  { id: 'under2500', label: 'Under ₹2,500', matches: (price) => price < 2500 },
  { id: '2500to7500', label: '₹2,500 – ₹7,500', matches: (price) => price >= 2500 && price <= 7500 },
  { id: '7500to15000', label: '₹7,500 – ₹15,000', matches: (price) => price > 7500 && price <= 15000 },
  { id: '15000plus', label: '₹15,000+', matches: (price) => price > 15000 },
];

const SearchIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.4-4.4M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" /></svg>;
const FilterIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M7 12h10m-7 6h4" /></svg>;
const CheckIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m5 12 4 4L19 6" /></svg>;

function ListingCard({ account, game }) {
  const navigate = useNavigate();
  const title = account.title || account.name || `${game.name} Account`;
  const subtitle = account.description || 'Verified marketplace listing with clear purchase details.';
  const category = account.listing_type || account.category || 'Account';
  const discount = account.original_price > account.price ? Math.round(((account.original_price - account.price) / account.original_price) * 100) : 0;

  return <article onClick={() => navigate(`/account/${account.id}`)} className="group cursor-pointer overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/70">
    <div className="relative h-52 overflow-hidden bg-zinc-100">
      {account.image_url ? <img src={account.image_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <img src={`/games/${account.game_id}.png`} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4"><span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-800 backdrop-blur">{category}</span>{discount > 0 && <span className="rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black text-white">-{discount}%</span>}</div>
      {account.instant_delivery && <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-zinc-800 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Instant delivery</span>}
    </div>
    <div className="p-5">
      <h2 className="truncate text-lg font-black tracking-tight">{title}</h2>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">{account.region && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">{account.region}</span>}{account.platform && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">{account.platform}</span>}{account.full_email_access && <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600">Full access</span>}</div>
      <div className="mt-5 flex items-end justify-between border-t border-zinc-100 pt-5"><div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Price</p><div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-black">₹{Number(account.price || 0).toLocaleString('en-IN')}</span>{account.original_price > account.price && <span className="text-xs text-zinc-400 line-through">₹{Number(account.original_price).toLocaleString('en-IN')}</span>}</div></div><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckIcon /> Verified</span></div>
    </div>
  </article>;
}

export default function GamePage() {
  const { gameId } = useParams();
  const game = games[gameId];
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [level, setLevel] = useState('All');
  const [platform, setPlatform] = useState('All platforms');
  const [region, setRegion] = useState('All regions');
  const [delivery, setDelivery] = useState('All delivery');
  const [price, setPrice] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [fullAccess, setFullAccess] = useState(false);
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      if (!game) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      const { data, error: loadError } = await supabase.from('accounts').select('*').eq('game_id', gameId).order('created_at', { ascending: false });
      if (!active) return;
      if (loadError) setError('We could not load these listings. Please try again.');
      else setAccounts(data || []);
      setLoading(false);
    };
    loadListings();
    return () => { active = false; };
  }, [game, gameId]);

  const filtered = useMemo(() => {
    let result = [...accounts];
    const query = search.trim().toLowerCase();
    if (query) result = result.filter((item) => [item.title, item.name, item.description, item.rank, item.level, item.town_hall].some((value) => String(value || '').toLowerCase().includes(query)));
    if (type !== 'All') result = result.filter((item) => String(item.listing_type || item.category || 'Account').toLowerCase() === type.replace(/s$/, '').toLowerCase());
    if (level !== 'All') result = result.filter((item) => String(item.rank ?? item.level ?? item.town_hall ?? '').toLowerCase().includes(level.replace('+', '').toLowerCase()));
    if (platform !== 'All platforms') result = result.filter((item) => String(item.platform || '').toLowerCase() === platform.toLowerCase());
    if (region !== 'All regions') result = result.filter((item) => String(item.region || '').toLowerCase() === region.toLowerCase());
    if (delivery === 'Instant delivery') result = result.filter((item) => item.instant_delivery === true);
    if (verifiedOnly) result = result.filter((item) => item.verified !== false);
    if (fullAccess) result = result.filter((item) => item.full_email_access === true);
    if (price.length) result = result.filter((item) => price.some((id) => priceRanges.find((range) => range.id === id)?.matches(Number(item.price || 0))));
    if (sort === 'price-low') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price-high') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return result;
  }, [accounts, delivery, fullAccess, level, platform, price, region, search, sort, type, verifiedOnly]);

  const activeFilterCount = [type !== 'All', level !== 'All', platform !== 'All platforms', region !== 'All regions', delivery !== 'All delivery', verifiedOnly, fullAccess, price.length > 0].filter(Boolean).length;
  const clearFilters = () => { setType('All'); setLevel('All'); setPlatform('All platforms'); setRegion('All regions'); setDelivery('All delivery'); setPrice([]); setVerifiedOnly(false); setFullAccess(false); setSearch(''); };
  const selectClass = 'h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-[#c68d00] focus:ring-4 focus:ring-yellow-100';

  if (!game) return <main className="grid min-h-screen place-items-center bg-white px-5 pt-16 text-center"><div><p className="text-sm font-black text-[#b77e00]">GAME NOT FOUND</p><h1 className="mt-3 text-4xl font-black">This marketplace is unavailable.</h1><Link to="/shop" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">View all games</Link></div></main>;

  return <main className="min-h-screen bg-white pb-20 pt-16 text-zinc-950">
    <section className="border-b border-zinc-200 bg-zinc-50 px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500"><Link to="/" className="hover:text-zinc-950">Home</Link><span>/</span><Link to="/shop" className="hover:text-zinc-950">Games</Link><span>/</span><span className="text-zinc-950">{game.name}</span></div>
        <div className="mt-7 flex items-center gap-5"><img src={`/games/${gameId}.png`} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-sm ring-1 ring-zinc-200 sm:h-24 sm:w-24" /><div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b77e00]">{game.short} marketplace</span><h1 className="mt-1 text-3xl font-black tracking-[-0.045em] sm:text-5xl">{game.name}</h1><p className="mt-2 text-sm text-zinc-500 sm:text-base">{game.description}</p></div></div>
        <div className="mt-8 grid grid-cols-3 divide-x divide-zinc-200 rounded-2xl border border-zinc-200 bg-white py-4 text-center sm:max-w-xl"><div><p className="text-sm font-black">Reviewed</p><p className="mt-1 text-[10px] text-zinc-400">Listings</p></div><div><p className="text-sm font-black">Secure</p><p className="mt-1 text-[10px] text-zinc-400">Checkout</p></div><div><p className="text-sm font-black">Human</p><p className="mt-1 text-[10px] text-zinc-400">Support</p></div></div>
      </div>
    </section>

    <section className="sticky top-16 z-30 border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-7xl gap-3"><label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 focus-within:border-[#c68d00] focus-within:bg-white focus-within:ring-4 focus-within:ring-yellow-100"><span className="text-zinc-400"><SearchIcon /></span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${game.name} listings...`} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><button onClick={() => setShowFilters((value) => !value)} className="relative inline-flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 px-4 text-sm font-bold transition hover:border-zinc-400 lg:hidden"><FilterIcon /> Filters{activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-yellow-300 px-1 text-[10px] text-zinc-950">{activeFilterCount}</span>}</button><select value={sort} onChange={(event) => setSort(event.target.value)} className="hidden h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold outline-none sm:block"><option value="newest">Newest</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[270px_1fr]">
      <aside className={`${showFilters ? 'block' : 'hidden'} rounded-3xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-36 lg:block lg:self-start`}>
        <div className="flex items-center justify-between"><h2 className="font-black">Filters</h2>{activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs font-bold text-[#a87300]">Clear all</button>}</div>
        <div className="mt-6 space-y-5">
          <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Listing type</span><select value={type} onChange={(event) => setType(event.target.value)} className={selectClass}>{listingTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">{game.levelLabel}</span><select value={level} onChange={(event) => setLevel(event.target.value)} className={selectClass}><option>All</option>{game.levels.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Platform</span><select value={platform} onChange={(event) => setPlatform(event.target.value)} className={selectClass}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Region</span><select value={region} onChange={(event) => setRegion(event.target.value)} className={selectClass}>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Delivery</span><select value={delivery} onChange={(event) => setDelivery(event.target.value)} className={selectClass}><option>All delivery</option><option>Instant delivery</option></select></label>
          <div><span className="mb-3 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Price</span><div className="space-y-3">{priceRanges.map((range) => <label key={range.id} className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-zinc-600"><input type="checkbox" checked={price.includes(range.id)} onChange={() => setPrice((current) => current.includes(range.id) ? current.filter((item) => item !== range.id) : [...current, range.id])} className="h-4 w-4 accent-yellow-400" />{range.label}</label>)}</div></div>
          <div className="border-t border-zinc-100 pt-5"><label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-zinc-700"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-yellow-400" />Verified listings</label><label className="mt-3 flex cursor-pointer items-center gap-3 text-sm font-semibold text-zinc-700"><input type="checkbox" checked={fullAccess} onChange={(event) => setFullAccess(event.target.checked)} className="h-4 w-4 accent-yellow-400" />Full access</label></div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-black sm:text-2xl">Available listings</h2><p className="mt-1 text-sm text-zinc-500">{loading ? 'Loading…' : `${filtered.length} results`}</p></div><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none sm:hidden"><option value="newest">Newest</option><option value="price-low">Price: Low</option><option value="price-high">Price: High</option></select></div>
        {loading ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[430px] animate-pulse rounded-3xl bg-zinc-100" />)}</div> : error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-7 text-sm font-semibold text-red-700">{error}</div> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((account) => <ListingCard key={account.id} account={account} game={game} />)}</div> : <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-20 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-zinc-400 shadow-sm"><SearchIcon /></span><h2 className="mt-5 text-xl font-black">No listings found</h2><p className="mt-2 text-sm text-zinc-500">Try removing some filters or check again soon.</p>{activeFilterCount > 0 && <button onClick={clearFilters} className="mt-6 rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Clear filters</button>}</div>}
      </div>
    </section>
  </main>;
}
