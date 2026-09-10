import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

const SEARCH_GAMES = [
  { id: 'clash-of-clans', name: 'Clash of Clans', aliases: 'coc clash clans', mark: 'CLASH\nCLANS', markClass: 'from-amber-500 via-yellow-500 to-red-600' },
  { id: 'brawl-stars', name: 'Brawl Stars', aliases: 'brawl bs', mark: 'BRAWL\nSTARS', markClass: 'from-red-600 via-rose-500 to-amber-400' },
  { id: 'valorant', name: 'Valorant', aliases: 'val riot', mark: 'VALORANT', markClass: 'from-red-500 to-rose-700' },
  { id: 'clash-royale', name: 'Clash Royale', aliases: 'cr clash royale', mark: 'CLASH\nROYALE', markClass: 'from-sky-500 via-blue-600 to-amber-500' },
  { id: 'fortnite', name: 'Fortnite', aliases: 'fn epic', mark: 'FORTNITE', markClass: 'from-indigo-500 to-violet-700' },
  { id: 'pokemon-go', name: 'Pokémon GO', aliases: 'pokemon pogo', mark: 'POKÉMON\nGO', markClass: 'from-yellow-500 via-sky-500 to-blue-700' },
  { id: 'mobile-legends', name: 'Mobile Legends', aliases: 'mlbb mobile legends', mark: 'MOBILE\nLEGENDS', markClass: 'from-cyan-500 to-blue-700' },
  { id: 'free-fire', name: 'Free Fire', aliases: 'ff garena', mark: 'FREE FIRE', markClass: 'from-orange-500 to-red-600' },
  { id: 'hay-day', name: 'Hay Day', aliases: 'hayday', mark: 'HAY DAY', markClass: 'from-lime-500 to-amber-500' },
  { id: 'squad-busters', name: 'Squad Busters', aliases: 'squad busters', mark: 'SQUAD\nBUSTERS', markClass: 'from-fuchsia-500 to-violet-700' },
];

const LANGUAGES = [
  { value: 'EN', label: 'English', flag: 'US' },
  { value: 'ES', label: 'Español (Spanish)', flag: 'ES' },
  { value: 'PT', label: 'Português', flag: 'PT' },
  { value: 'RU', label: 'Русский', flag: 'RU' },
  { value: 'TR', label: 'Türkçe', flag: 'TR' },
  { value: 'FR', label: 'Français', flag: 'FR' },
  { value: 'DE', label: 'Deutsch', flag: 'DE' },
  { value: 'ID', label: 'Bahasa Indonesia', flag: 'ID' },
  { value: 'FI', label: 'Suomi', flag: 'FI' },
  { value: 'KO', label: '한국어', flag: 'KR' },
  { value: 'JA', label: '日本語', flag: 'JP' },
  { value: 'AR', label: 'العربية', flag: 'SA' },
  { value: 'HI', label: 'हिन्दी', flag: 'IN' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
];

function CountryFlag({ code, className = '' }) {
  const base = `relative block h-4 w-6 shrink-0 overflow-hidden rounded-[4px] border border-zinc-200 shadow-sm ${className}`;
  if (code === 'US') return <span className={`${base} bg-[repeating-linear-gradient(to_bottom,#d9292f_0_1.4px,#fff_1.4px_2.8px)]`}><span className="absolute left-0 top-0 h-[9px] w-[10px] bg-[#234a9f]" /></span>;
  if (code === 'ES') return <span className={`${base} bg-[linear-gradient(to_bottom,#aa151b_0_25%,#f1bf00_25%_75%,#aa151b_75%)]`} />;
  if (code === 'PT') return <span className={`${base} bg-[linear-gradient(to_right,#046a38_0_40%,#da291c_40%)]`} />;
  if (code === 'RU') return <span className={`${base} bg-[linear-gradient(to_bottom,#fff_0_33%,#1753a4_33%_66%,#d52b1e_66%)]`} />;
  if (code === 'TR') return <span className={`${base} bg-[#e30a17]`}><span className="absolute left-[5px] top-[-3px] text-[13px] text-white">☾</span></span>;
  if (code === 'FR') return <span className={`${base} bg-[linear-gradient(to_right,#002654_0_33%,#fff_33%_66%,#ed2939_66%)]`} />;
  if (code === 'DE') return <span className={`${base} bg-[linear-gradient(to_bottom,#000_0_33%,#dd0000_33%_66%,#ffce00_66%)]`} />;
  if (code === 'ID') return <span className={`${base} bg-[linear-gradient(to_bottom,#e70011_0_50%,#fff_50%)]`} />;
  if (code === 'FI') return <span className={`${base} bg-white`}><span className="absolute inset-y-0 left-[6px] w-[3px] bg-[#003580]" /><span className="absolute inset-x-0 top-[6px] h-[3px] bg-[#003580]" /></span>;
  if (code === 'KR') return <span className={`${base} grid place-items-center bg-white`}><span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(to_bottom,#cd2e3a_0_50%,#0047a0_50%)]" /></span>;
  if (code === 'JP') return <span className={`${base} grid place-items-center bg-white`}><span className="h-2.5 w-2.5 rounded-full bg-[#bc002d]" /></span>;
  if (code === 'SA') return <span className={`${base} bg-[#006c35]`}><span className="absolute inset-x-1 top-[7px] h-px bg-white" /></span>;
  if (code === 'IN') return <span className={`${base} bg-[radial-gradient(circle,#1a4f9c_0_11%,transparent_12%),linear-gradient(to_bottom,#ff9933_0_33%,#fff_33%_66%,#138808_66%)]`} />;
  return <span className={`${base} bg-zinc-100`} />;
}

const IconButton = ({ children, label, className = '', onClick }) => <button type="button" onClick={onClick} aria-label={label} className={`grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 ${className}`}>{children}</button>;

function listingKind(listing) {
  const value = String(listing.listing_type || listing.category || listing.type || 'account').toLowerCase();
  if (['service', 'boost', 'coaching', 'rank push'].some((term) => value.includes(term))) return 'services';
  if (['item', 'coin', 'top-up', 'topup', 'currency', 'gem', 'skin'].some((term) => value.includes(term))) return 'items';
  return 'accounts';
}

export default function Navbar() {
  const navigate = useNavigate();
  const searchAreaRef = useRef(null);
  const preferencesRef = useRef(null);
  const [user, setUser] = useState(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('clashvault_language') || 'EN');
  const [currency, setCurrency] = useState(() => localStorage.getItem('clashvault_currency') || 'INR');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => { const { data: { session } } = await supabase.auth.getSession(); setUser(session?.user || null); };
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const syncPreferences = (event) => {
      if (event.detail?.language) setLanguage(event.detail.language);
      if (event.detail?.currency) setCurrency(event.detail.currency);
    };
    window.addEventListener('clashvault-preferences', syncPreferences);
    return () => window.removeEventListener('clashvault-preferences', syncPreferences);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!searchAreaRef.current?.contains(event.target)) setSearchOpen(false);
      if (!preferencesRef.current?.contains(event.target)) setPreferencesOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const loadInventory = useCallback(async () => {
    setInventoryLoading(true);
    const { data, error } = await supabase.from('accounts').select('*').eq('status', 'available');
    if (!error) setInventory(data || []);
    setInventoryLoading(false);
  }, []);

  const counts = useMemo(() => {
    const totals = Object.fromEntries(SEARCH_GAMES.map((game) => [game.id, { accounts: 0, items: 0, services: 0 }]));
    inventory.forEach((listing) => {
      if (!totals[listing.game_id]) return;
      totals[listing.game_id][listingKind(listing)] += 1;
    });
    return totals;
  }, [inventory]);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return SEARCH_GAMES;
    return SEARCH_GAMES.filter((game) => `${game.name} ${game.aliases}`.toLowerCase().includes(query));
  }, [search]);

  const selectedLanguage = LANGUAGES.find((option) => option.value === language) || LANGUAGES[0];
  const closeMenus = () => { setPreferencesOpen(false); setSearchOpen(false); };
  const openSearch = () => {
    setSearchOpen(true);
    setPreferencesOpen(false);
    loadInventory();
  };
  const savePreferences = async () => {
    localStorage.setItem('clashvault_language', language);
    localStorage.setItem('clashvault_currency', currency);
    window.dispatchEvent(new CustomEvent('clashvault-preferences', { detail: { language, currency } }));
    if (user) {
      await supabase.auth.updateUser({ data: { ...user.user_metadata, language, currency } });
    }
    setPreferencesOpen(false);
  };
  const openGame = (gameId) => {
    setSearchOpen(false);
    navigate(`/game/${gameId}`);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    if (search.trim() && filteredGames.length) openGame(filteredGames[0].id);
    else openSearch();
  };

  return <nav className="fixed inset-x-0 top-0 z-[1000] border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1600px] min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-7 lg:px-10">
      <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="ClashVault home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-300 text-[12px] font-black tracking-[-0.14em] text-[#171206]">CV</span><span className="hidden text-[17px] font-black tracking-[0.07em] text-zinc-950 lg:block">CLASH<span className="text-[#c68d00]">VAULT</span></span></Link>

      <div ref={searchAreaRef} className="relative min-w-0 flex-1 sm:mx-auto sm:max-w-xl">
        <form onSubmit={submitSearch} className={`flex w-full min-w-0 items-center gap-2 rounded-full border bg-zinc-50 px-3 py-1.5 transition sm:px-4 ${searchOpen ? 'border-zinc-400 ring-4 ring-zinc-100' : 'border-zinc-200'}`}>
          <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg>
          <input value={search} onFocus={openSearch} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }} className="min-w-0 flex-1 bg-transparent text-xs text-zinc-800 outline-none placeholder:text-zinc-400 sm:text-sm" placeholder="Search games..." role="combobox" aria-expanded={searchOpen} aria-controls="game-search-results" />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700">×</button>}
          <button className="hidden rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 sm:block">Search</button>
        </form>

        {searchOpen && <div id="game-search-results" className="fixed inset-x-3 top-[4.5rem] max-h-[min(72vh,560px)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl shadow-zinc-950/15 sm:absolute sm:inset-x-0 sm:top-[calc(100%+10px)]">
          {filteredGames.length ? filteredGames.map((game) => {
            const gameCounts = counts[game.id];
            const shown = (value) => inventoryLoading ? '—' : value;
            return <button key={game.id} type="button" onClick={() => openGame(game.id)} className="group grid w-full grid-cols-[38px_minmax(0,1fr)_16px] items-center gap-3 border-b border-zinc-100 px-3 py-2.5 text-left transition last:border-0 hover:rounded-xl hover:bg-zinc-50 sm:px-4">
              <span className={`whitespace-pre-line bg-gradient-to-br ${game.markClass} bg-clip-text text-center text-[7px] font-black uppercase leading-[0.82] tracking-[-0.08em] text-transparent drop-shadow-sm`}>{game.mark}</span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-zinc-900 sm:text-[15px]">{game.name}</span>
                <span className="mt-1.5 flex w-fit max-w-full items-center gap-1">
                  <span className="inline-flex h-[18px] items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 text-[9px] font-medium text-amber-700"><span>Accounts</span><strong className="font-black">{shown(gameCounts.accounts)}</strong></span>
                  <span className="inline-flex h-[18px] items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-1.5 text-[9px] font-medium text-blue-700"><span>Items</span><strong className="font-black">{shown(gameCounts.items)}</strong></span>
                  <span className="inline-flex h-[18px] items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-1.5 text-[9px] font-medium text-violet-700"><span>Services</span><strong className="font-black">{shown(gameCounts.services)}</strong></span>
                </span>
              </span>
              <svg className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 18 6-6-6-6" /></svg>
            </button>;
          }) : <div className="px-5 py-10 text-center"><p className="text-sm font-bold text-zinc-800">No game found</p><p className="mt-1 text-xs text-zinc-400">Try another game name.</p></div>}
        </div>}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div ref={preferencesRef} className="relative">
          <button type="button" onClick={() => { setPreferencesOpen((value) => !value); setSearchOpen(false); }} aria-expanded={preferencesOpen} aria-label="Choose language and currency" className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2 text-[10px] font-bold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 sm:h-10 sm:gap-2 sm:px-3 sm:text-xs">
            <CountryFlag code={selectedLanguage.flag} className="h-[14px] w-5 sm:h-4 sm:w-6" />
            <span className="max-w-[46px] truncate sm:max-w-none">{selectedLanguage.label === 'English' ? 'English' : selectedLanguage.label}</span>
            <svg className="hidden h-3 w-3 text-zinc-400 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10 5 5 5-5" /></svg>
          </button>

          {preferencesOpen && <div className="fixed inset-x-3 top-[4.5rem] max-h-[calc(100dvh-5.25rem)] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/15 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[430px] sm:max-h-[min(76vh,650px)] sm:p-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.7" /><path strokeLinecap="round" strokeWidth="1.7" d="M3.5 12h17M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" /></svg></span>
              <div><h2 className="text-lg font-black tracking-tight text-zinc-950">Language &amp; currency</h2><p className="mt-0.5 text-[11px] text-zinc-500">Personalize your ClashVault experience</p></div>
            </div>

            <p className="mb-2 mt-5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">Choose language</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((option) => <button key={option.value} type="button" onClick={() => setLanguage(option.value)} className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11px] transition ${language === option.value ? 'border-zinc-950 bg-zinc-50 font-black text-zinc-950' : 'border-transparent text-zinc-700 hover:bg-zinc-50'}`}>
                <CountryFlag code={option.flag} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {language === option.value && <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="m5 12 4 4L19 6" /></svg>}
              </button>)}
            </div>

            <p className="mb-2 mt-5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">Choose currency</p>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((option) => <button key={option.value} type="button" onClick={() => setCurrency(option.value)} title={option.label} className={`rounded-xl border px-2 py-3 text-[11px] font-black transition ${currency === option.value ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'}`}>{option.symbol} {option.value}</button>)}
            </div>
            <button type="button" onClick={savePreferences} className="mt-5 w-full rounded-xl bg-yellow-300 px-4 py-3.5 text-xs font-black text-zinc-950 transition hover:bg-yellow-400">Save preferences</button>
          </div>}
        </div>

        <div className="relative"><IconButton label="Notifications" className="relative rounded-xl sm:h-10 sm:w-10" onClick={() => { closeMenus(); navigate('/notifications'); }}><svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4" /></svg><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" /></IconButton></div>
        {user ? <ProfileDropdown user={user} onLogout={async () => { closeMenus(); await supabase.auth.signOut(); navigate('/login'); }} /> : <Link to="/login" className="grid h-9 w-9 place-items-center rounded-full bg-yellow-300 text-xs font-black text-[#171206]">→</Link>}
      </div>
    </div>
  </nav>;
}
