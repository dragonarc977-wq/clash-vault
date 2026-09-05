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

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    setAccounts(data || []);
    setLoading(false);
  };

  const filtered = accounts.filter((acc) => {
    const matchesTH = filterTH === 'all' || acc.town_hall?.toString() === filterTH;
    const matchesSearch =
      !searchQuery ||
      acc.town_hall?.toString().includes(searchQuery) ||
      acc.price?.toString().includes(searchQuery);
    
    // Gems Filter
    const gems = acc.gems || 0;
    const matchesGems = 
      filterGems === 'all' ? true :
      filterGems === '5k' ? gems >= 5000 :
      filterGems === '10k' ? gems >= 10000 : true;

    return matchesTH && matchesSearch && matchesGems;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-desc': return (b.price || 0) - (a.price || 0);
      case 'price-asc': return (a.price || 0) - (b.price || 0);
      case 'gems-desc': return (b.gems || 0) - (a.gems || 0);
      case 'newest': 
      default: return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const thLevels = [17, 16, 15, 14, 13];
  const gemLevels = ['all', '5k', '10k'];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Premium <span className="text-yellow-400">COC Accounts</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Hand-picked maxed bases. Instant delivery. 100% secure.
          </p>
        </div>

        {/* Filters Container */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          {/* Search */}
          <div className="w-full lg:w-72">
            <input
              type="text"
              placeholder="Search TH or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-5 py-3.5 focus:outline-none focus:border-yellow-500/50 transition"
            />
          </div>

          {/* Townhall Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilterTH('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                filterTH === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-yellow-500/40'
              }`}
            >
              All TH
            </button>
            {thLevels.map((th) => (
              <button
                key={th}
                onClick={() => setFilterTH(th.toString())}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  filterTH === th.toString()
                    ? 'bg-yellow-400 text-black'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-yellow-500/40'
                }`}
              >
                TH{th}
              </button>
            ))}
          </div>

          {/* Gems Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilterGems('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                filterGems === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-yellow-500/40'
              }`}
            >
              All Gems
            </button>
            {gemLevels.map((gem) => (
              <button
                key={gem}
                onClick={() => setFilterGems(gem)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  filterGems === gem
                    ? 'bg-yellow-400 text-black'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-yellow-500/40'
                }`}
              >
                {gem === 'all' ? 'All' : gem === '5k' ? '5K+' : '10K+'}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="w-full lg:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-5 py-3.5 text-sm font-semibold focus:outline-none focus:border-yellow-500/50 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="gems-desc">Gems: High to Low</option>
            </select>
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-zinc-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-10 bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-white mb-2">No accounts found</h3>
            <p className="text-zinc-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}