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

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  };

  const filtered = accounts.filter((acc) => {
    const matchesTH = filterTH === 'all' || acc.town_hall?.toString() === filterTH;
    const matchesSearch = !searchQuery || acc.town_hall?.toString().includes(searchQuery) || acc.price?.toString().includes(searchQuery);
    const gems = acc.gems || 0;
    const matchesGems = filterGems === 'all' ? true : filterGems === '5k' ? gems >= 5000 : gems >= 10000;
    return matchesTH && matchesSearch && matchesGems;
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 shrink-0 hidden md:block border-r border-zinc-800 pr-6">
          <h2 className="text-2xl font-black mb-6">Shop</h2>
          
          {/* Search */}
          <div className="mb-8">
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Search Accounts</label>
            <input type="text" placeholder="Search TH or price..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#14141e] border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition" />
          </div>

          {/* Townhall Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold mb-4 text-zinc-300">Townhall Level</h3>
            <div className="space-y-2">
              <button onClick={() => setFilterTH('all')} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition ${filterTH === 'all' ? 'bg-yellow-400 text-black' : 'bg-[#14141e] border border-zinc-700 text-zinc-400 hover:border-yellow-400 hover:text-white'}`}>All Townhalls</button>
              {thLevels.map(th => (
                <button key={th} onClick={() => setFilterTH(th.toString())} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition ${filterTH === th.toString() ? 'bg-yellow-400 text-black' : 'bg-[#14141e] border border-zinc-700 text-zinc-400 hover:border-yellow-400 hover:text-white'}`}>TH{th}</button>
              ))}
            </div>
          </div>

          {/* Gems Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold mb-4 text-zinc-300">Gems</h3>
            <div className="space-y-2">
              {gemLevels.map(gem => (
                <button key={gem} onClick={() => setFilterGems(gem)} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition ${filterGems === gem ? 'bg-yellow-400 text-black' : 'bg-[#14141e] border border-zinc-700 text-zinc-400 hover:border-yellow-400 hover:text-white'}`}>{gem === 'all' ? 'All Gems' : gem === '5k' ? '5K+ Gems' : '10K+ Gems'}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black">Premium <span className="text-yellow-400">COC Accounts</span></h1>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#14141e] border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:border-yellow-400 cursor-pointer">
              <option value="newest">Sort: Newest</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="gems-desc">Gems: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#14141e] border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
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
              {sorted.map((account) => <AccountCard key={account.id} account={account} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-white mb-2">No accounts found</h3>
              <p className="text-zinc-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}