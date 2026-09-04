import { useNavigate } from 'react-router-dom';

// ===== INLINE SVG ICONS (No lucide-react needed) =====
const IconZap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function AccountCard({ account }) {
  const navigate = useNavigate();
  
  const features = [
    account.town_hall && `TH${account.town_hall}`,
    account.builder_hall && `BH${account.builder_hall}`,
    account.heroes_level && `Heroes ${account.heroes_level}`,
    account.walls_level && `Walls ${account.walls_level}`,
  ].filter(Boolean);

  const discount = account.original_price 
    ? Math.round(((account.original_price - account.price) / account.original_price) * 100) 
    : null;

  // If you don't have a route for /account/:id yet, remove the onClick below
  return (
    <div 
      className="account-card card-hover"
      onClick={() => navigate(`/account/${account.id}`)} 
    >
      <style>{`
        .account-card { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; position: relative; }
        .account-image { width: 100%; height: 200px; object-fit: cover; background: var(--bg-tertiary); }
        .account-badge-row { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
        .account-body { padding: 20px; }
        .account-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary); }
        .account-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
        .account-features { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .account-feature-tag { background: var(--bg-tertiary); color: var(--text-secondary); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
        .account-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .account-price { display: flex; align-items: baseline; gap: 8px; }
        .price-current { font-size: 24px; font-weight: 800; color: var(--gold-primary); }
        .price-original { font-size: 14px; color: var(--text-muted); text-decoration: line-through; }
        .account-trust { display: flex; align-items: center; gap: 4px; color: var(--success); font-size: 12px; font-weight: 600; }
        .discount-badge { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
        .instant-badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
      `}</style>

      <div className="account-badge-row">
        {discount > 0 && (
          <span className="discount-badge">-{discount}% OFF</span>
        )}
        <span className="instant-badge">
          <IconZap />
          Instant
        </span>
      </div>

      <img 
        src={account.image_url || '/placeholder-coc.jpg'} 
        alt={`TH${account.town_hall} Account`}
        className="account-image"
      />

      <div className="account-body">
        <h3 className="account-title">
          TH{account.town_hall} Maxed Account
        </h3>
        <p className="account-subtitle">
          Level {account.exp_level || 'High'} • {account.gems || '5K+'} Gems
        </p>

        <div className="account-features">
          {features.map((f, i) => (
            <span key={i} className="account-feature-tag">{f}</span>
          ))}
        </div>

        <div className="account-footer">
          <div className="account-price">
            <span className="price-current">₹{account.price}</span>
            {account.original_price && (
              <span className="price-original">₹{account.original_price}</span>
            )}
          </div>
          <div className="account-trust">
            <IconCheck />
            Verified
          </div>
        </div>
      </div>
    </div>
  );
}