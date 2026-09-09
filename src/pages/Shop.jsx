import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import AccountCard from '../components/AccountCard';

export default function Shop() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTH, setFilterTH] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterGems, setFilterGems] = useState('all');
  const [filterPrice, setFilterPrice] = useState([]);
  const [filterFeatures, setFilterFeatures] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  };

  const togglePrice = (range) => {
    setFilterPrice(prev => prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]);
  };

  const toggleFeature = (feat) => {
    setFilterFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]);
  };

  const filtered = accounts.filter((acc) => {
    const matchesTH = filterTH === 'all' || acc.town_hall?.toString() === filterTH;
    const matchesSearch = !searchQuery || 
      acc.town_hall?.toString().includes(searchQuery) || 
      acc.price?.toString().includes(searchQuery) ||
      (acc.title && acc.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const gems = acc.gems || 0;
    const matchesGems = filterGems === 'all' ? true : filterGems === '5k' ? gems >= 5000 : gems >= 10000;

    const price = acc.price || 0;
    const matchesPrice = filterPrice.length === 0 || filterPrice.some(range => {
      if (range === 'under30') return price < 30;
      if (range === '30to80') return price >= 30 && price <= 80;
      if (range === '80to150') return price >= 80 && price <= 150;
      if (range === '150plus') return price > 150;
      return true;
    });

    const matchesFeatures = filterFeatures.length === 0 || filterFeatures.every(feat => {
      if (feat === 'maxed') return acc.is_maxed === true;
      if (feat === 'instant') return acc.instant_delivery === true;
      if (feat === 'email') return acc.full_email_access === true;
      return true;
    });

    return matchesTH && matchesSearch && matchesGems && matchesPrice && matchesFeatures;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-desc': return (b.price || 0) - (a.price || 0);
      case 'price-asc': return (a.price || 0) - (b.price || 0);
      case 'gems-desc': return (b.gems || 0) - (a.gems || 0);
      default: return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const thLevels = [17, 16, 15, 14, 13];
  const gemLevels = ['all', '5k', '10k'];

  const clearFilters = () => {
    setFilterTH('all');
    setSearchQuery('');
    setFilterGems('all');
    setFilterPrice([]);
    setFilterFeatures([]);
  };

  const hasActiveFilters = filterTH !== 'all' || searchQuery || filterGems !== 'all' || filterPrice.length > 0 || filterFeatures.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans relative overflow-hidden">

      {/* ===== AMBIENT GLOW BACKGROUND ===== */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-yellow-500/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[300px] right-0 w-[400px] h-[400px] bg-yellow-600/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative">

        {/* ===== HERO SECTION ===== */}
        <div className="relative pt-24 pb-10 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-600 mb-5">
              <span>Clash of Clans</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              <span className="text-zinc-400">Accounts</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-3">
                  Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">CoC Accounts</span>
                </h1>
                <p className="text-zinc-500 text-base sm:text-lg max-w-xl">
                  Hand-picked maxed bases. Instant delivery. 100% secure transactions.
                </p>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-full px-5 py-2.5 w-fit">
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-white text-sm font-bold">4.9</span>
                <span className="text-zinc-500 text-sm">on Trustpilot</span>
                <span className="text-zinc-700 text-sm hidden sm:inline">— 500+ happy buyers</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CATEGORY TABS ===== */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[
                { id: 'accounts', label: 'Accounts', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                )},
                { id: 'gems', label: 'Gems', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                )},
                { id: 'services', label: 'Services', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                )},
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20'
                      : 'bg-[#14141e] border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== SEARCH + TH CHIPS ===== */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search by TH level, hero level, or price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#14141e] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20 transition-all"
                />
              </div>

              {/* TH Filter Chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full lg:w-auto pb-1">
                <button
                  onClick={() => setFilterTH('all')}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                    filterTH === 'all'
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-[#14141e] border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  All
                </button>
                {thLevels.map(th => (
                  <button
                    key={th}
                    onClick={() => setFilterTH(th.toString())}
                    className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                      filterTH === th.toString()
                        ? 'bg-yellow-400 text-black border-yellow-400'
                        : 'bg-[#14141e] border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    TH{th}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* ===== SIDEBAR FILTERS (Desktop) ===== */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="bg-[#14141e] border border-zinc-800 rounded-xl p-5 sticky top-24">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white">Filters</h3>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Price Filter */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-3">Price Range</h4>
                    <div className="space-y-2.5">
                      {[
                        { id: 'under30', label: 'Under $30' },
                        { id: '30to80', label: '$30 – $80' },
                        { id: '80to150', label: '$80 – $150' },
                        { id: '150plus', label: '$150+' },
                      ].map(range => (
                        <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filterPrice.includes(range.id)}
                            onChange={() => togglePrice(range.id)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-yellow-400 focus:ring-yellow-400/30 focus:ring-offset-0 focus:ring-1 accent-yellow-400"
                          />
                          <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800 mb-6" />

                  {/* Features Filter */}
                  <div className="mb-6">
                    <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-3">Features</h4>
                    <div className="space-y-2.5">
                      {[
                        { id: 'maxed', label: 'Maxed only' },
                        { id: 'instant', label: 'Instant delivery' },
                        { id: 'email', label: 'Full email access' },
                      ].map(feat => (
                        <label key={feat.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filterFeatures.includes(feat.id)}
                            onChange={() => toggleFeature(feat.id)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-yellow-400 focus:ring-yellow-400/30 focus:ring-offset-0 focus:ring-1 accent-yellow-400"
                          />
                          <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">{feat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800 mb-6" />

                  {/* Gems Filter */}
                  <div>
                    <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-3">Gems</h4>
                    <div className="space-y-2">
                      {gemLevels.map(gem => (
                        <button
                          key={gem}
                          onClick={() => setFilterGems(gem)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            filterGems === gem
                              ? 'bg-yellow-400 text-black'
                              : 'bg-zinc-800/50 border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                          }`}
                        >
                          {gem === 'all' ? 'All Gems' : gem === '5k' ? '5K+ Gems' : '10K+ Gems'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* ===== MOBILE FILTER TOGGLE ===== */}
              <div className="lg:hidden mb-2">
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="flex items-center gap-2 bg-[#14141e] border border-zinc-800 text-zinc-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:border-zinc-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                  Filters {hasActiveFilters && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
                </button>

                {mobileFiltersOpen && (
                  <div className="mt-3 bg-[#14141e] border border-zinc-800 rounded-xl p-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Filters</h3>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-yellow-400 font-medium">Clear all</button>
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
                        ].map(range => (
                          <button
                            key={range.id}
                            onClick={() => togglePrice(range.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              filterPrice.includes(range.id) ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
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
                        {[
                          { id: 'maxed', label: 'Maxed' },
                          { id: 'instant', label: 'Instant' },
                          { id: 'email', label: 'Email Access' },
                        ].map(feat => (
                          <button
                            key={feat.id}
                            onClick={() => toggleFeature(feat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              filterFeatures.includes(feat.id) ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {feat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-zinc-600 uppercase mb-2">Gems</h4>
                      <div className="flex gap-2">
                        {gemLevels.map(gem => (
                          <button
                            key={gem}
                            onClick={() => setFilterGems(gem)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex-1 ${
                              filterGems === gem ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {gem === 'all' ? 'All' : gem === '5k' ? '5K+' : '10K+'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== PRODUCT GRID ===== */}
              <main className="flex-1 min-w-0">
                {/* Sort Bar */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-zinc-600">{sorted.length} product{sorted.length !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/></svg>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-[#14141e] border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/60 cursor-pointer"
                    >
                      <option value="newest">Top picks</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="gems-desc">Gems: High to Low</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  /* ===== LOADING SKELETONS ===== */
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
                ) : sorted.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sorted.map((account) => (
                      <AccountCard key={account.id} account={account} />
                    ))}
                  </div>
                ) : (
                  /* ===== EMPTY STATE ===== */
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
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
      </div>
    </div>
  );
}