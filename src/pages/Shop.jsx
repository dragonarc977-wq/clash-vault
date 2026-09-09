import { useState, useMemo } from 'react';
import supabase from '../lib/supabase';
import AccountCard from '../components/AccountCard';

const GAMES = [
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    shortName: 'CoC',
    emoji: '🏰',
    description: 'Accounts & Gems',
    filters: {
      levels: [17, 16, 15, 14, 13],
      levelLabel: 'TH',
      features: ['Maxed only', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Gems',
    },
  },
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    shortName: 'Brawl',
    emoji: '🤖',
    description: 'Accounts & Coins',
    filters: {
      levels: [70, 65, 60, 55, 50],
      levelLabel: 'Trophies',
      levelSuffix: 'K',
      features: ['Maxed brawlers', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Coins',
    },
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'Valorant',
    emoji: '🎯',
    description: 'Accounts & Points',
    filters: {
      levels: ['Immortal', 'Diamond', 'Platinum', 'Gold', 'Silver'],
      levelLabel: 'Rank',
      features: ['Rare skins', 'Instant delivery', 'Full email access'],
      gemsLabel: 'VP',
    },
  },
  {
    id: 'clash-royale',
    name: 'Clash Royale',
    shortName: 'CR',
    emoji: '👑',
    description: 'Accounts & Chests',
    filters: {
      levels: [15, 14, 13, 12, 11],
      levelLabel: 'Arena',
      features: ['Maxed cards', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Gems',
    },
  },
  {
    id: 'pokemon-go',
    name: 'Pokémon GO',
    shortName: 'PoGo',
    emoji: '⚡',
    description: 'Accounts & Items',
    filters: {
      levels: [50, 45, 40, 35, 30],
      levelLabel: 'Level',
      features: ['Shiny collection', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Stardust',
    },
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    shortName: 'Fortnite',
    emoji: '🪂',
    description: 'Accounts & V-Bucks',
    filters: {
      levels: ['Champion', 'Unreal', 'Diamond', 'Platinum', 'Gold'],
      levelLabel: 'Rank',
      features: ['Rare skins', 'Instant delivery', 'Full email access'],
      gemsLabel: 'V-Bucks',
    },
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    shortName: 'MLBB',
    emoji: '⚔️',
    description: 'Accounts & Diamonds',
    filters: {
      levels: ['Mythic', 'Legend', 'Epic', 'Elite', 'Warrior'],
      levelLabel: 'Rank',
      features: ['Maxed heroes', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Diamonds',
    },
  },
  {
    id: 'hay-day',
    name: 'Hay Day',
    shortName: 'Hay Day',
    emoji: '🌾',
    description: 'Accounts & Coins',
    filters: {
      levels: [300, 250, 200, 150, 100],
      levelLabel: 'Level',
      features: ['Maxed farm', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Coins',
    },
  },
  {
    id: 'squad-busters',
    name: 'Squad Busters',
    shortName: 'Squad',
    emoji: '💥',
    description: 'Accounts & Gold',
    filters: {
      levels: [50, 45, 40, 35, 30],
      levelLabel: 'Level',
      features: ['Maxed squads', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Gold',
    },
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    shortName: 'FF',
    emoji: '🔥',
    description: 'Accounts & Diamonds',
    filters: {
      levels: [80, 70, 60, 50, 40],
      levelLabel: 'Level',
      features: ['Rare skins', 'Instant delivery', 'Full email access'],
      gemsLabel: 'Diamonds',
    },
  },
];

export default function Shop() {
  const [view, setView] = useState('hub');
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

  const enterGameShop = async (game) => {
    setSelectedGame(game);
    setView('game');
    setLoading(true);
    setFilterLevel('all');
    setFilterPrice([]);
    setFilterFeatures([]);
    setGameSearch('');
    setSortBy('newest');

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
    let result = [...accounts];

    if (gameSearch.trim()) {
      const q = gameSearch.toLowerCase();
      result = result.filter(
        (acc) =>
          acc.title?.toLowerCase().includes(q) ||
          acc.price?.toString().includes(q) ||
          acc.town_hall?.toString().includes(q)
      );
    }

    if (filterLevel !== 'all') {
      result = result.filter((acc) => acc.town_hall?.toString() === filterLevel);
    }

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

    if (filterFeatures.length > 0) {
      result = result.filter((acc) =>
        filterFeatures.every((feat) => {
          if (feat === 'Maxed only' || feat.includes('Maxed')) return acc.is_maxed === true;
          if (feat === 'Instant delivery') return acc.instant_delivery === true;
          if (feat === 'Full email access') return acc.full_email_access === true;
          return true;
        })
      );
    }

    switch (sortBy) {
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'gems-desc':
        result.sort((a, b) => (b.gems || 0) - (a.gems || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [accounts, gameSearch, filterLevel, filterPrice, filterFeatures, sortBy]);

  const hasActiveFilters =
    filterLevel !== 'all' || filterPrice.length > 0 || filterFeatures.length > 0 || gameSearch;

  const clearFilters = () => {
    setFilterLevel('all');
    setFilterPrice([]);
    setFilterFeatures([]);
    setGameSearch('');
  };

  return (
    <div className="min-h-screen bg-[#07070b] text-white font-sans relative overflow-hidden">
      {/* Ambient Golden Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-yellow-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-amber-600/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ==================== HUB VIEW ==================== */}
        {view === 'hub' && (
          <>
            <section className="pt-28 pb-16 px-6">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 text-xs font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full mb-8">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Premium Gaming Marketplace
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
                  Find Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400">
                    Perfect Account
                  </span>
                </h1>

                <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                  Instant delivery • Verified accounts • Trusted by thousands of players worldwide
                </p>

                {/* Premium Search */}
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/25 to-amber-500/15 rounded-2xl blur-lg opacity-70" />
                  <div className="relative flex items-center bg-[#12121a] border border-zinc-700/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                    <span className="pl-5 text-zinc-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search Clash of Clans, Valorant, Brawl Stars..."
                      value={hubSearch}
                      onChange={(e) => setHubSearch(e.target.value)}
                      className="w-full bg-transparent py-5 px-4 text-base outline-none placeholder-zinc-500"
                    />
                    {hubSearch && (
                      <button onClick={() => setHubSearch('')} className="pr-3 text-zinc-500 hover:text-zinc-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button className="m-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Games Grid */}
            <section className="px-6 pb-28">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-bold">Popular Games</h2>
                  <span className="text-sm text-zinc-500">{filteredGames.length} games available</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {filteredGames.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => enterGameShop(game)}
                      className="group relative bg-[#12121a] border border-zinc-800 rounded-2xl p-6 text-center transition-all duration-300 hover:border-yellow-400/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/10 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          {game.emoji}
                        </div>
                        <h3 className="font-bold text-[15px] mb-1">{game.name}</h3>
                        <p className="text-xs text-zinc-500">{game.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredGames.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No games found</h3>
                    <p className="text-zinc-500">Try a different search term</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ==================== GAME SHOP VIEW ==================== */}
        {view === 'game' && selectedGame && (
          <>
            {/* Header */}
            <section className="pt-24 pb-8 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6 text-sm">
                  <button
                    onClick={goBackToHub}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-yellow-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    All Games
                  </button>
                  <span className="text-zinc-700">/</span>
                  <span className="text-zinc-400">{selectedGame.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="text-5xl">{selectedGame.emoji}</div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                        {selectedGame.name}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                          Accounts
                        </span>
                      </h1>
                      <p className="text-zinc-500 mt-1">
                        Hand-picked accounts • Instant delivery • 100% secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Search + Level Filters */}
            <section className="px-6 pb-6">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative w-full lg:max-w-md">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={`Search ${selectedGame.name} accounts...`}
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#12121a] border border-zinc-800 rounded-xl text-sm outline-none focus:border-yellow-400/50 transition-all placeholder-zinc-500"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 w-full lg:w-auto">
                  <button
                    onClick={() => setFilterLevel('all')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      filterLevel === 'all'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-[#12121a] border border-zinc-800 text-zinc-400 hover:border-yellow-400/40'
                    }`}
                  >
                    All
                  </button>
                  {selectedGame.filters.levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilterLevel(level.toString())}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        filterLevel === level.toString()
                          ? 'bg-yellow-400 text-black'
                          : 'bg-[#12121a] border border-zinc-800 text-zinc-400 hover:border-yellow-400/40'
                      }`}
                    >
                      {selectedGame.filters.levelLabel} {level}
                      {selectedGame.filters.levelSuffix || ''}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Main Content */}
            <section className="px-6 pb-28">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="hidden lg:block w-64 shrink-0">
                  <div className="bg-[#12121a] border border-zinc-800 rounded-2xl p-5 sticky top-24">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-sm">Filters</h3>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-yellow-400 hover:text-yellow-300">
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="mb-6">
                      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
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
                              className="w-4 h-4 rounded accent-yellow-400"
                            />
                            <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                              {range.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-zinc-800 mb-6" />

                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
                        Features
                      </h4>
                      <div className="space-y-2.5">
                        {selectedGame.filters.features.map((feat) => (
                          <label key={feat} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={filterFeatures.includes(feat)}
                              onChange={() => toggleFeature(feat)}
                              className="w-4 h-4 rounded accent-yellow-400"
                            />
                            <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                              {feat}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Accounts */}
                <main className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-zinc-500">
                      {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-[#12121a] border border-zinc-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-yellow-400/50"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="gems-desc">{selectedGame.filters.gemsLabel}: High to Low</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-[#12121a] border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                          <div className="h-48 bg-zinc-800/50" />
                          <div className="p-5 space-y-3">
                            <div className="h-5 bg-zinc-800/50 rounded w-3/4" />
                            <div className="h-4 bg-zinc-800/50 rounded w-1/2" />
                            <div className="h-10 bg-zinc-800/50 rounded" />
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
                      <div className="text-5xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold mb-2">No accounts found</h3>
                      <p className="text-zinc-500 mb-6">Try adjusting your filters</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-2.5 rounded-xl transition-all"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </main>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}