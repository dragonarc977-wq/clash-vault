import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { applyTheme, getTheme, MARKETPLACE_THEMES } from '../lib/theme';
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

const IconButton = ({ children, label, className = '', onClick }) => <button type="button" onClick={onClick} aria-label={label} className={`grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 ${className}`}>{children}</button>;
const ThemeCheckIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" /></svg>;

function listingKind(listing) {
  const value = String(listing.listing_type || listing.category || listing.type || 'account').toLowerCase();
  if (['service', 'boost', 'coaching', 'rank push'].some((term) => value.includes(term))) return 'services';
  if (['item', 'coin', 'top-up', 'topup', 'currency', 'gem', 'skin'].some((term) => value.includes(term))) return 'items';
  return 'accounts';
}

export default function Navbar() {
  const navigate = useNavigate();
  const searchAreaRef = useRef(null);
  const [user, setUser] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('clashvault_language') || 'EN');
  const [theme, setTheme] = useState(getTheme);
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
    };
    window.addEventListener('clashvault-preferences', syncPreferences);
    return () => window.removeEventListener('clashvault-preferences', syncPreferences);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!searchAreaRef.current?.contains(event.target)) setSearchOpen(false);
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

  const closeMenus = () => { setLanguageOpen(false); setThemeOpen(false); setSearchOpen(false); };
  const openSearch = () => {
    setSearchOpen(true);
    setLanguageOpen(false);
    setThemeOpen(false);
    loadInventory();
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

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link to="/support" aria-label="Support inbox" className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"><svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 5.5h16v13H4v-13Zm0 8.5h4.4l1.6 2.25h4L15.6 14H20" /></svg></Link>
        <div className="relative hidden sm:block"><IconButton label="Notifications" onClick={() => { closeMenus(); navigate('/notifications'); }}><svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4" /></svg></IconButton></div>
        <div className="relative hidden md:block"><button type="button" onClick={() => { setLanguageOpen((value) => !value); setThemeOpen(false); setSearchOpen(false); }} className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50"><span className="text-[#c68d00]">◎</span>{language}</button>{languageOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-28 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => { setLanguage('EN'); setLanguageOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50">English</button><button type="button" onClick={() => { setLanguage('HI'); setLanguageOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50">Hindi</button></div>}</div>
        <div className="relative"><IconButton label="Change color theme" onClick={() => { setThemeOpen((value) => !value); setLanguageOpen(false); setSearchOpen(false); }} className={themeOpen ? 'border-zinc-400 bg-zinc-50 text-zinc-950' : ''}><svg className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="8" cy="8" r="3" strokeWidth="1.8"/><circle cx="16" cy="8" r="3" strokeWidth="1.8"/><circle cx="12" cy="16" r="3" strokeWidth="1.8"/></svg></IconButton>{themeOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-48 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl"><p className="px-2 pb-1.5 pt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Choose theme</p>{MARKETPLACE_THEMES.map((option) => <button key={option.id} type="button" onClick={() => { setTheme(applyTheme(option.id)); setThemeOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs transition hover:bg-zinc-50 ${theme === option.id ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-600'}`}><span className="flex -space-x-1">{option.colors.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-white/40" style={{ backgroundColor: color }} />)}</span><span className="flex-1 font-medium">{option.label}</span>{theme === option.id && <ThemeCheckIcon />}</button>)}</div>}</div>
        {user ? <ProfileDropdown user={user} onLogout={async () => { closeMenus(); await supabase.auth.signOut(); navigate('/login'); }} /> : <Link to="/login" className="grid h-9 w-9 place-items-center rounded-full bg-yellow-300 text-xs font-black text-[#171206]">→</Link>}
      </div>
    </div>
  </nav>;
}
