import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    const { data } = await supabase.from('accounts').select('*').eq('id', id).single();
    setAccount(data);
    setLoading(false);
  };

  const handleBuy = () => {
    navigate(`/checkout/${id}`);
  };

  const openChat = () => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
    }
  };

  if (loading) {
    return (
      <div style={{paddingTop: '120px', minHeight: '100vh', background: '#0a0a0f'}}>
        <div className="container" style={{maxWidth: '1280px', margin: '0 auto', padding: '0 24px'}}>
          <div style={{background: '#14141e', height: '400px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}} />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{paddingTop: '120px', minHeight: '100vh', background: '#0a0a0f', textAlign: 'center', color: '#6b6b7b'}}>
        <h2 style={{color: '#fff'}}>Account not found</h2>
        <button className="btn-gold" onClick={() => navigate('/shop')} style={{marginTop: '20px'}}>
          Back to Shop
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Town Hall', value: `TH${account.town_hall}` },
    { label: 'Builder Hall', value: account.builder_hall ? `BH${account.builder_hall}` : 'N/A' },
    { label: 'Experience', value: `Level ${account.exp_level || 'High'}` },
    { label: 'Gems', value: account.gems ? account.gems.toLocaleString() : '5000+' },
    { label: 'Heroes', value: account.heroes_level || 'Maxed' },
    { label: 'Walls', value: account.walls_level || 'Maxed' },
  ];

  const trustItems = [
    'Lifetime warranty on all accounts',
    'Instant email delivery after payment',
    'Full account ownership transfer',
    '24/7 dedicated support',
    '100% ban-free guarantee'
  ];

  return (
    <div className="detail-page">
      <style>{`
        .detail-page {
          padding-top: 90px;
          min-height: 100vh;
          background: #0a0a0f;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
        }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #a0a0b0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #ffd700; }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          padding-bottom: 80px;
        }
        .detail-image-wrap {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,215,0,0.15);
          background: #14141e;
        }
        .detail-image-wrap img {
          width: 100%;
          display: block;
        }
        .detail-image-placeholder {
          width: 100%;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
        }
        .detail-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,215,0,0.08);
          color: #ffd700;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
          border: 1px solid rgba(255,215,0,0.2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-title {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        .detail-desc {
          color: #a0a0b0;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .price-box {
          background: #14141e;
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .price-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 12px;
        }
        .price-main {
          font-size: 42px;
          font-weight: 800;
          color: #ffd700;
        }
        .price-old {
          font-size: 20px;
          color: #6b6b7b;
          text-decoration: line-through;
        }
        .price-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }
        .badge-green {
          background: rgba(34,197,94,0.1);
          color: #22c55e;
          border-color: rgba(34,197,94,0.3);
        }
        .badge-gold {
          background: rgba(255,215,0,0.1);
          color: #ffd700;
          border-color: rgba(255,215,0,0.3);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-box {
          background: #111118;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .stat-box-value {
          font-size: 18px;
          font-weight: 700;
          color: #ffd700;
        }
        .stat-box-label {
          font-size: 11px;
          color: #6b6b7b;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .trust-list {
          margin: 24px 0;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          color: #a0a0b0;
          font-size: 14px;
        }
        .trust-item svg {
          color: #22c55e;
          flex-shrink: 0;
        }
        .action-btns {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }
        .btn-gold {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: linear-gradient(135deg, #ffd700, #e6c200);
          color: #0a0a0f;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,215,0,0.3);
        }
        .btn-outline {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: transparent;
          color: #ffd700;
          font-weight: 600;
          border: 1px solid rgba(255,215,0,0.25);
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(255,215,0,0.08);
          border-color: rgba(255,215,0,0.5);
        }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; gap: 32px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .detail-title { font-size: 28px; }
          .price-main { font-size: 32px; }
          .action-btns { flex-direction: column; }
        }
      `}</style>

      <div className="container">
        <button className="back-btn" onClick={() => navigate('/shop')}>
          <IconArrowLeft /> Back to Shop
        </button>

        <div className="detail-grid">
          <div className="detail-image-wrap">
            {account.image_url ? (
              <img src={account.image_url} alt={`TH${account.town_hall} Account`} />
            ) : (
              <div className="detail-image-placeholder">🏰</div>
            )}
          </div>

          <div>
            <div className="detail-badge">
              <IconZap /> Instant Delivery
            </div>
            <h1 className="detail-title">TH{account.town_hall} Maxed Account</h1>
            <p className="detail-desc">
              {account.description || 'Fully maxed base with all defenses, troops, and spells upgraded. Ready for competitive play immediately after purchase.'}
            </p>

            <div className="price-box">
              <div className="price-row">
                <span className="price-main">₹{account.price?.toLocaleString()}</span>
                {account.original_price > 0 && (
                  <span className="price-old">₹{account.original_price?.toLocaleString()}</span>
                )}
              </div>
              <div className="price-badges">
                <span className="badge badge-green"><IconShield /> Secure</span>
                <span className="badge badge-gold"><IconCheck /> Verified</span>
              </div>
            </div>

            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-box">
                  <div className="stat-box-value">{stat.value}</div>
                  <div className="stat-box-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="trust-list">
              {trustItems.map((item, i) => (
                <div key={i} className="trust-item">
                  <IconCheck /> {item}
                </div>
              ))}
            </div>

            <div className="action-btns">
              <button className="btn-gold" onClick={handleBuy}>
                <IconLock /> Buy Now
              </button>
              <button className="btn-outline" onClick={openChat}>
                <IconMessage /> Ask Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}