import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import AccountCard from '../components/AccountCard';

export default function Shop() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTH, setFilterTH] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    return matchesTH && matchesSearch;
  });

  const thLevels = [17, 16, 15, 14, 13];

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

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
          {/* Search */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search by TH level or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-5 py-3.5 focus:outline-none focus:border-yellow-500/50 transition"
            />
          </div>

          {/* TH Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilterTH('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                filterTH === 'all'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-yellow-500/40'
              }`}
            >
              All
            </button>

            {thLevels.map((th) => (
              <button
                key={th}
                onClick={() => setFilterTH(th.toString())}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  filterTH === th.toString()
                    ? 'bg-yellow-400 text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-yellow-500/40'
                }`}
              >
                TH{th}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-zinc-800"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-10 bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((account) => (
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