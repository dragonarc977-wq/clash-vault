import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

// ===== INLINE SVG ICONS =====
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const IconZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconCreditCard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const IconMessage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    const { data } = await supabase.from('accounts').select('*').eq('id', id).single();
    setAccount(data);
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // For now, just go back to home or buy logic later
    alert('Buy function will connect here');
  };

  if (loading) return <div style={{paddingTop: '120px', textAlign: 'center'}}>Loading...</div>;
  if (!account) return <div style={{paddingTop: '120px', textAlign: 'center'}}>Account not found</div>;

  const stats = [
    { label: 'Town Hall', value: `TH${account.town_hall}` },
    { label: 'Builder Hall', value: `BH${account.builder_hall || 'N/A'}` },
    { label: 'Experience', value: `Level ${account.exp_level || 'High'}` },
    { label: 'Gems', value: account.gems || '5000+' },
    { label: 'Heroes', value: account.heroes_level || 'Maxed' },
    { label: 'Walls', value: account.walls_level || 'Maxed' },
  ];

  return (
    <div style={{paddingTop: '90px', minHeight: '100vh', background: '#0a0a0f', color: '#fff'}}>
      <style>{`
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 40px 0; }
        .detail-image { width: 100%; border-radius: 16px; border: 1px solid rgba(255,215,0,0.25); }
        .detail-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,215,0,0.1); color: #ffd700; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; border: 1px solid rgba(255,215,0,0.25); }
        .detail-title { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
        .detail-price-box { background: #1a1a24; border: 1px solid rgba(255,215,0,0.25); border-radius: 12px; padding: 24px; margin: 24px 0; }
        .detail-price { font-size: 42px; font-weight: 800; color: #ffd700; }
        .detail-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
        .detail-stat { background: #111118; padding: 16px; border-radius: 8px; text-align: center; }
        .detail-stat-value { font-size: 20px; font-weight: 700; color: #ffd700; }
        .detail-stat-label { font-size: 12px; color: #a0a0b0; margin-top: 4px; }
        .trust-list { margin: 24px 0; }
        .trust-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; color: #a0a0b0; font-size: 14px; }
        .trust-item svg { color: #22c55e; }
        .action-btns { display: flex; gap: 12px; margin-top: 24px; }
        .action-btns button { flex: 1; padding: 16px; font-size: 16px; border: none; border-radius: 8px; cursor: pointer; }
        .btn-primary { background: linear-gradient(135deg, #ffd700, #e6c200); color: #0a0a0f; font-weight: 700; }
        .btn-secondary { background: transparent; color: #ffd700; border: 1px solid rgba(255,215,0,0.25) !important; }
        @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .detail-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="container">
        <button onClick={() => navigate('/shop')} style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0b0', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px'}}>
          <IconArrowLeft /> Back to Shop
        </button>

        <div className="detail-grid">
          <div>
            <img src={account.image_url || '/placeholder-coc.jpg'} alt="Account" className="detail-image" />
          </div>

          <div>
            <div className="detail-badge"><IconZap /> INSTANT DELIVERY</div>
            <h1 className="detail-title">TH{account.town_hall} Maxed Account</h1>
            <p style={{color: '#a0a0b0', fontSize: '15px'}}>Fully maxed base with all defenses, troops, and spells upgraded. Ready for competitive play.</p>

            <div className="detail-price-box">
              <div style={{display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px'}}>
                <span className="detail-price">₹{account.price}</span>
                {account.original_price && <span style={{textDecoration: 'line-through', color: '#a0a0b0', fontSize: '20px'}}>₹{account.original_price}</span>}
              </div>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px'}}><IconShield /> Secure</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,215,0,0.1)', color: '#ffd700', padding: '4px 10px', borderRadius: '20px', fontSize: '12px'}}><IconCheck /> Verified</span>
              </div>
            </div>

            <div className="detail-stats">
              {stats.map((stat, i) => <div key={i} className="detail-stat"><div className="detail-stat-value">{stat.value}</div><div className="detail-stat-label">{stat.label}</div></div>)}
            </div>

            <div className="trust-list">
              {['Lifetime warranty on all accounts', 'Instant email delivery after payment', 'Full account ownership transfer', '24/7 dedicated support', '100% ban-free guarantee'].map((item, i) => <div key={i} className="trust-item"><IconCheck /> {item}</div>)}
            </div>

            <div className="action-btns">
              <button className="btn-primary" onClick={handleBuy}><IconCreditCard /> Buy Now</button>
              <button className="btn-secondary" onClick={() => window.Tawk_API?.maximize?.()}><IconMessage /> Ask Question</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}