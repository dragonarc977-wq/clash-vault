import { useState, useEffect, useMemo } from 'react';
import supabase from '../lib/supabase';   // ← FIXED (single dot)
import AccountCard from '../components/AccountCard';

// ============================================================
// GAME CONFIGURATION
// ============================================================
const GAMES = [
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    shortName: 'CoC',
    emoji: '🏰',
    color: 'yellow',
    gradient: 'from-yellow-400/20 to-amber-500/5',
    border: 'border-yellow-500/30',
    hoverBorder: 'hover:border-yellow-400/70',
    glow: 'hover:shadow-yellow-500/10',
    btnBg: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    btnHover: 'group-hover:bg-yellow-400 group-hover:text-black',
    description: 'Accounts & Gems',
    filters: {
      levels: [17, 16, 15, 14, 13],
      levelLabel: 'TH',
      features: ['Maxed only', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Gems',
      metaFields: ['town_hall', 'bh_level', 'heroes', 'walls', 'gems', 'builders'],
    },
  },
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    shortName: 'Brawl',
    emoji: '🤖',
    color: 'red',
    gradient: 'from-red-400/20 to-rose-500/5',
    border: 'border-red-500/30',
    hoverBorder: 'hover:border-red-400/70',
    glow: 'hover:shadow-red-500/10',
    btnBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    btnHover: 'group-hover:bg-red-500 group-hover:text-white',
    description: 'Accounts & Coins',
    filters: {
      levels: [70, 65, 60, 55, 50],
      levelLabel: 'Trophies',
      levelSuffix: 'K',
      features: ['Maxed brawlers', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Coins',
      metaFields: ['trophies', 'brawlers', 'power_league', 'coins', 'skins'],
    },
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'Valorant',
    emoji: '🎯',
    color: 'blue',
    gradient: 'from-blue-400/20 to-cyan-500/5',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400/70',
    glow: 'hover:shadow-blue-500/10',
    btnBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    btnHover: 'group-hover:bg-blue-500 group-hover:text-white',
    description: 'Accounts & Points',
    filters: {
      levels: ['Immortal', 'Diamond', 'Platinum', 'Gold', 'Silver'],
      levelLabel: 'Rank',
      features: ['Rare skins', 'Instant delivery', 'Full email access'],
      gemsLabel: 'VP',
      metaFields: ['rank', 'agents', 'skins', 'vp', 'region'],
    },
  },
  {
    id: 'clash-royale',
    name: 'Clash Royale',
    shortName: 'CR',
    emoji: '👑',
    color: 'amber',
    gradient: 'from-amber-400/20 to-yellow-500/5',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-400/70',
    glow: 'hover:shadow-amber-500/10',
    btnBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    btnHover: 'group-hover:bg-amber-500 group-hover:text-black',
    description: 'Accounts & Chests',
    filters: {
      levels: [15, 14, 13, 12, 11],
      levelLabel: 'Arena',
      features: ['Maxed cards', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Gems',
      metaFields: ['arena', 'cards', 'trophies', 'gems', 'level'],
    },
  },
  {
    id: 'pokemon-go',
    name: 'Pokemon GO',
    shortName: 'PoGo',
    emoji: '⚡',
    color: 'yellow',
    gradient: 'from-yellow-400/20 to-blue-400/5',
    border: 'border-yellow-400/30',
    hoverBorder: 'hover:border-yellow-300/70',
    glow: 'hover:shadow-yellow-400/10',
    btnBg: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
    btnHover: 'group-hover:bg-yellow-400 group-hover:text-black',
    description: 'Accounts & Items',
    filters: {
      levels: [50, 45, 40, 35, 30],
      levelLabel: 'Level',
      features: ['Shiny collection', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Stardust',
      metaFields: ['level', 'stardust', 'shinies', 'legendary', 'mythical'],
    },
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    shortName: 'Fortnite',
    emoji: '🎮',
    color: 'purple',
    gradient: 'from-purple-400/20 to-violet-500/5',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/70',
    glow: 'hover:shadow-purple-500/10',
    btnBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    btnHover: 'group-hover:bg-purple-500 group-hover:text-white',
    description: 'Accounts & V-Bucks',
    filters: {
      levels: ['Champion', 'Unreal', 'Diamond', 'Platinum', 'Gold'],
      levelLabel: 'Rank',
      features: ['Rare skins', 'Instant delivery', 'Full email access'],
      gemsLabel: 'V-Bucks',
      metaFields: ['rank', 'skins', 'vbucks', 'battle_pass', 'wins'],
    },
  },
  {
    id: 'moba-legends',
    name: 'Moba Legends',
    shortName: 'Moba',
    emoji: '⚔️',
    color: 'orange',
    gradient: 'from-orange-400/20 to-amber-500/5',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400/70',
    glow: 'hover:shadow-orange-500/10',
    btnBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    btnHover: 'group-hover:bg-orange-500 group-hover:text-white',
    description: 'Accounts & Diamonds',
    filters: {
      levels: ['Mythic', 'Legend', 'Epic', 'Elite', 'Warrior'],
      levelLabel: 'Rank',
      features: ['Maxed heroes', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Diamonds',
      metaFields: ['rank', 'heroes', 'skins', 'diamonds', 'win_rate'],
    },
  },
  {
    id: 'hay-day',
    name: 'Hay Day',
    shortName: 'Hay Day',
    emoji: '🌾',
    color: 'green',
    gradient: 'from-green-400/20 to-emerald-500/5',
    border: 'border-green-500/30',
    hoverBorder: 'hover:border-green-400/70',
    glow: 'hover:shadow-green-500/10',
    btnBg: 'bg-green-500/10 text-green-400 border-green-500/30',
    btnHover: 'group-hover:bg-green-500 group-hover:text-white',
    description: 'Accounts & Coins',
    filters: {
      levels: [300, 250, 200, 150, 100],
      levelLabel: 'Level',
      features: ['Maxed farm', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Coins',
      metaFields: ['level', 'coins', 'diamonds', 'barn_size', 'silo_size'],
    },
  },
  {
    id: 'squad-buster',
    name: 'Squad Buster',
    shortName: 'Squad',
    emoji: '💥',
    color: 'pink',
    gradient: 'from-pink-400/20 to-rose-500/5',
    border: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-400/70',
    glow: 'hover:shadow-pink-500/10',
    btnBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    btnHover: 'group-hover:bg-pink-500 group-hover:text-white',
    description: 'Accounts & Gold',
    filters: {
      levels: [50, 45, 40, 35, 30],
      levelLabel: 'Level',
      features: ['Maxed squads', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Gold',
      metaFields: ['level', 'squads', 'gold', 'gems', 'trophies'],
    },
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Shop() {
  const [view, setView] = useState('hub'); // 'hub' | 'game'
  const [selectedGame, setSelectedGame] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hubSearch, setHubSearch] = useState('');
  const [gameSearch, setGameSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterPrice, setFilterPrice] = useState([]);
  const [filterFeatures, setFilterFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch real accounts when entering a game shop
  const enterGameShop = async (game) => {
    setSelectedGame(game);
    setView('game');
    setLoading(true);
    setFilterLevel('all');
    setFilterPrice([]);
    setFilterFeatures([]);
    setGameSearch('');
    setSortBy('newest');

    // Real Supabase fetch
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('game_id', game.id)
      .order('created_at', { ascending: false });

    setAccounts(data || []);
    setLoading(false);
  };

  const goBackToHub = () => {
    setView('hub');
    setSelectedGame(null);
    setAccounts([]);
    setGameSearch('');
  };

  // Hub search filter
  const filteredGames = useMemo(() => {
    if (!hubSearch.trim()) return GAMES;
    const q = hubSearch.toLowerCase();
    return GAMES.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.shortName.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [hubSearch]);

  // Game shop filters
  const togglePrice = (range) => {
    setFilterPrice((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleFeature = (feat) => {
    setFilterFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const filteredAccounts = useMemo(() => {
    let result = accounts;

    // Search
    if (gameSearch.trim()) {
      const q = gameSearch.toLowerCase();
      result = result.filter(
        (acc) =>
          acc.title?.toLowerCase().includes(q) ||
          acc.price?.toString().includes(q) ||
          acc.town_hall?.toString().includes(q)
      );
    }

    // Level filter
    if (filterLevel !== 'all') {
      result = result.filter((acc) => acc.town_hall?.toString() === filterLevel);
    }

    // Price filter
    if (filterPrice.length > 0) {
      result = result.filter((acc) => {
        const price = acc.price || 0;
        return filterPrice.some((range) => {
          if (range === 'under30') return price < 30;
          if (range === '30to80') return price >= 30 && price <= 80;
          if (range === '80to150') return price >= 80 && price <= 150;
          if (range === '150plus') return price > 150;
          return true;
        });
      });
    }

    // Features filter
    if (filterFeatures.length > 0) {
      result = result.filter((acc) => {
        return filterFeatures.every((feat) => {
          if (feat === 'Maxed only') return acc.is_maxed === true;
          if (feat === 'Instant delivery') return acc.instant_delivery === true;
          if (feat === 'Full email access') return acc.full_email_access === true;
          if (feat === 'Maxed brawlers') return acc.is_maxed === true;
          if (feat === 'Rare skins') return acc.has_rare_skins === true;
          if (feat === 'Maxed cards') return acc.is_maxed === true;
          if (feat === 'Shiny collection') return acc.has_shinies === true;
          if (feat === 'Maxed farm') return acc.is_maxed === true;
          if (feat === 'Maxed heroes') return acc.is_maxed === true;
          if (feat === 'Maxed squads') return acc.is_maxed === true;
          return true;
        });
      });
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'gems-desc':
        sorted.sort((a, b) => (b.gems || 0) - (a.gems || 0));
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return sorted;
  }, [accounts, gameSearch, filterLevel, filterPrice, filterFeatures, sortBy]);

  const hasActiveFilters =
    filterLevel !== 'all' ||
    filterPrice.length > 0 ||
    filterFeatures.length > 0 ||
    gameSearch;

  const clearFilters = () => {
    setFilterLevel('all');
    setFilterPrice([]);
    setFilterFeatures([]);
    setGameSearch('');
  };

  const currentGame = selectedGame;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans relative overflow-hidden">
      {/* ===== AMBIENT GLOW BACKGROUNDS ===== */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-500/[0.03] blur-[180px] rounded-full" />
        <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-amber-500/[0.02] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-600/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ============================================================
            VIEW: HUB (Game Selection)
        ============================================================ */}
        {view === 'hub' && (
          <>
            {/* Hero */}
            <div className="pt-24 pb-12 px-6">
              <div className="max-w-7xl mx-auto text-center">
                <span className="inline-block border border-yellow-500/30 bg-yellow-500/[0.08] text-yellow-400 text-xs font-bold tracking-[0.15em] uppercase px-5 py-2 rounded-full mb-8 backdrop-blur-sm">
                  🔥 Premium Gaming Marketplace
                </span>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
                  FIND YOUR
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                    ULTIMATE GAME
                  </span>
                </h1>

                <p className="text-zinc-500 text-lg max-w-2xl mx-auto mb-10">
                  Search and buy premium accounts from top games. Instant delivery, 100% secure, and fully verified.
                </p>

                {/* Trust Stats */}
                <div className="flex justify-center gap-12 sm:gap-16 mb-12">
                  {[
                    { value: '10K+', label: 'Accounts Sold' },
                    { value: '24/7', label: 'Live Support' },
                    { value: '100%', label: 'Secure' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-1">{stat.value}</div>
                      <div className="text-xs text-zinc-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mega Search */}
                <div className="relative max-w-3xl mx-auto">
                  <div className="bg-[#14141e] border border-zinc-800 hover:border-yellow-400/40 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 focus-within:border-yellow-400/60 focus-within:shadow-yellow-500/10 flex items-center overflow-hidden">
                    <span className="pl-6 text-zinc-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search Clash of Clans, Valorant, Brawl Stars..."
                      value={hubSearch}
                      onChange={(e) => setHubSearch(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-lg px-4 py-5 placeholder-zinc-700"
                    />
                    {hubSearch && (
                      <button onClick={() => setHubSearch('')} className="pr-4 text-zinc-600 hover:text-zinc-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Grid */}
            <div className="px-6 pb-24">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Popular Games</h2>
                    <p className="text-sm text-zinc-600 mt-1">{filteredGames.length} games available</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredGames.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => enterGameShop(game)}
                      className={`group relative bg-gradient-to-b ${game.gradient} border ${game.border} ${game.hoverBorder} rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 ${game.glow} cursor-pointer overflow-hidden text-left`}
                    >
                      {/* FIXED: static class instead of dynamic */}
                      <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                          {game.emoji}
                        </div>

                        <h3 className="text-lg font-black text-white mb-1">{game.name}</h3>
                        <p className="text-xs text-zinc-500 mb-5">{game.description}</p>

                        <div className={`${game.btnBg} border rounded-xl py-2.5 text-sm font-bold ${game.btnHover} transition-all duration-300`}>
                          Browse Offers
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredGames.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
                    <p className="text-zinc-500">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            VIEW: GAME SHOP (Account Listings)
        ============================================================ */}
        {view === 'game' && currentGame && (
          <>
            {/* Hero */}
            <div className="pt-24 pb-10 px-6">
              <div className="max-w-7xl mx-auto">
                {/* Breadcrumb + Back */}
                <div className="flex items-center gap-3 mb-5">
                  <button
                    onClick={goBackToHub}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-yellow-400 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    All Games
                  </button>
                  <svg className="w-3 h-3 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-zinc-400 text-sm">{currentGame.name}</span>
                  <svg className="w-3 h-3 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-zinc-500 text-sm">Accounts</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{currentGame.emoji}</div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                        {currentGame.name}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                          Accounts
                        </span>
                      </h1>
                      <p className="text-zinc-500 text-base mt-1 max-w-xl">
                        Hand-picked {currentGame.name} accounts. Instant delivery. 100% secure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-full px-5 py-2.5 w-fit">
                    <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-white text-sm font-bold">4.9</span>
                    <span className="text-zinc-500 text-sm">on Trustpilot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search + Level Chips */}
            <div className="px-6 pb-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="relative w-full lg:max-w-md">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder={`Search ${currentGame.name} accounts...`}
                      value={gameSearch}
                      onChange={(e) => setGameSearch(e.target.value)}
                      className="w-full pl-12 pr-10 py-3.5 bg-[#14141e] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 transition-all"
                    />
                    {gameSearch && (
                      <button
                        onClick={() => setGameSearch('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto pb-1">
                    <button
                      onClick={() => setFilterLevel('all')}
                      className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                        filterLevel === 'all'
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20'
                          : 'bg-[#14141e] border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      All
                    </button>
                    {currentGame.filters.levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setFilterLevel(level.toString())}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                          filterLevel === level.toString()
                            ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20'
                            : 'bg-[#14141e] border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {currentGame.filters.levelLabel} {level}
                        {currentGame.filters.levelSuffix || ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 pb-24">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Sidebar Filters (Desktop) */}
                  <aside className="hidden lg:block w-64 shrink-0">
                    <div className="bg-[#14141e] border border-zinc-800 rounded-xl p-5 sticky top-24">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-white">Filters</h3>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Price Filter */}
                      <div className="mb-6">
                        <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-3">
                          Price Range
                        </h4>
                        <div className="space-y-2.5">
                          {[
                            { id: 'under30', label: 'Under $30' },
                            { id: '30to80', label: '$30 – $80' },
                            { id: '80to150', label: '$80 – $150' },
                            { id: '150plus', label: '$150+' },
                          ].map((range) => (
                            <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={filterPrice.includes(range.id)}
                                onChange={() => togglePrice(range.id)}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-yellow-400 focus:ring-yellow-400/30 focus:ring-offset-0 focus:ring-1 accent-yellow-400"
                              />
                              <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                {range.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-zinc-800 mb-6" />

                      {/* Features Filter */}
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-3">
                          Features
                        </h4>
                        <div className="space-y-2.5">
                          {currentGame.filters.features.map((feat) => (
                            <label key={feat} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={filterFeatures.includes(feat)}
                                onChange={() => toggleFeature(feat)}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-yellow-400 focus:ring-yellow-400/30 focus:ring-offset-0 focus:ring-1 accent-yellow-400"
                              />
                              <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                {feat}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Mobile Filters */}
                  <div className="lg:hidden mb-2">
                    <button
                      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                      className="flex items-center gap-2 bg-[#14141e] border border-zinc-800 text-zinc-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-zinc-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                      Filters
                      {hasActiveFilters && <span className="w-2 h-2 bg-yellow-400 rounded-full ml-1" />}
                    </button>

                    {mobileFiltersOpen && (
                      <div className="mt-3 bg-[#14141e] border border-zinc-800 rounded-xl p-5 space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white">Filters</h3>
                          {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-yellow-400 font-medium">
                              Clear all
                            </button>
                          )}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-zinc-600 uppercase mb-2">Price</h4>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'under30', label: 'Under $30' },
                              { id: '30to80', label: '$30–$80' },
                              { id: '80to150', label: '$80–$150' },
                              { id: '150plus', label: '$150+' },
                            ].map((range) => (
                              <button
                                key={range.id}
                                onClick={() => togglePrice(range.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  filterPrice.includes(range.id)
                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}
                              >
                                {range.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-zinc-600 uppercase mb-2">Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentGame.filters.features.map((feat) => (
                              <button
                                key={feat}
                                onClick={() => toggleFeature(feat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  filterFeatures.includes(feat)
                                    ? 'bg-yellow-400 text-black border-yellow-400'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}
                              >
                                {feat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Grid */}
                  <main className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-zinc-600">
                        {filteredAccounts.length} product{filteredAccounts.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-[#14141e] border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/60 cursor-pointer"
                        >
                          <option value="newest">Top picks</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="gems-desc">{currentGame.filters.gemsLabel}: High to Low</option>
                        </select>
                      </div>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="bg-[#14141e] border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="h-44 bg-zinc-800/50 animate-pulse" />
                            <div className="p-5 space-y-3">
                              <div className="h-5 bg-zinc-800/50 rounded w-3/4 animate-pulse" />
                              <div className="h-4 bg-zinc-800/50 rounded w-1/2 animate-pulse" />
                              <div className="flex gap-1.5">
                                <div className="h-6 bg-zinc-800/50 rounded w-12 animate-pulse" />
                                <div className="h-6 bg-zinc-800/50 rounded w-16 animate-pulse" />
                                <div className="h-6 bg-zinc-800/50 rounded w-20 animate-pulse" />
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <div className="h-6 bg-zinc-800/50 rounded w-16 animate-pulse" />
                                <div className="h-9 bg-zinc-800/50 rounded w-20 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredAccounts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredAccounts.map((account) => (
                          <AccountCard key={account.id} account={account} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-24">
                        <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                          <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No accounts found</h3>
                        <p className="text-zinc-500 mb-6">Try adjusting your filters or search query</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    )}
                  </main>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}