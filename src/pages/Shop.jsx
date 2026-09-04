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

  const filtered = accounts.filter(acc => {
    const matchesTH = filterTH === 'all' || acc.town_hall?.toString() === filterTH;
    const matchesSearch = !searchQuery || 
      acc.town_hall?.toString().includes(searchQuery) ||
      acc.price?.toString().includes(searchQuery);
    return matchesTH && matchesSearch;
  });

  const thLevels = [17, 16, 15, 14, 13];

  return (
    <div className="shop-page">
      <style>{`
        .shop-page { padding-top: 100px; min-height: 100vh; background: #0a0a0f; color: #ffffff; font-family: 'Inter', sans-serif; }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .shop-hero { text-align: center; padding: 60px 0 40px; }
        .shop-hero h1 { font-size: 42px; font-weight: 800; margin-bottom: 12px; }
        .shop-filters { display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; align-items: center; }
        .search-box { flex: 1; min-width: 250px; position: relative; }
        .search-box input { width: 100%; padding: 12px 16px; background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #ffffff; font-size: 14px; outline: none; }
        .search-box input:focus { border-color: #ffd700; }
        .th-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .th-filter-btn { padding: 8px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: #111118; color: #a0a0b0; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .th-filter-btn.active { background: rgba(255,215,0,0.1); border-color: #ffd700; color: #ffd700; }
        .th-filter-btn:hover { border-color: rgba(255,215,0,0.3); }
        .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; padding-bottom: 80px; }
        .empty-state { text-align: center; padding: 80px 20px; color: #6b6b7b; }
      `}</style>

      <div className="container">
        <div className="shop-hero">
          <h1>Premium COC Accounts</h1>
          <p className="section-subtitle">Hand-picked maxed bases. Instant delivery. 100% secure.</p>
        </div>

        <div className="shop-filters">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by TH level or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="th-filters">
            <button 
              className={`th-filter-btn ${filterTH === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTH('all')}
            >
              All
            </button>
            {thLevels.map(th => (
              <button 
                key={th}
                className={`th-filter-btn ${filterTH === th.toString() ? 'active' : ''}`}
                onClick={() => setFilterTH(th.toString())}
              >
                TH{th}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="accounts-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="account-card">
                <div className="shimmer" style={{height: '200px'}} />
                <div style={{padding: '20px'}}>
                  <div className="shimmer" style={{height: '20px', width: '60%', marginBottom: '10px', borderRadius: '4px'}} />
                  <div className="shimmer" style={{height: '14px', width: '40%', marginBottom: '16px', borderRadius: '4px'}} />
                  <div className="shimmer" style={{height: '40px', borderRadius: '4px'}} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="accounts-grid">
            {filtered.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <h3>No accounts found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}