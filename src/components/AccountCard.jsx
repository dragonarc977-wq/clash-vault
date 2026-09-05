import { useNavigate } from 'react-router-dom';

// Inline icons
const IconZap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

  const discount = account.original_price && account.original_price > account.price
    ? Math.round(((account.original_price - account.price) / account.original_price) * 100) 
    : null;

  return (
    <div 
      className="account-card"
      onClick={() => navigate(`/account/${account.id}`)}
    >
      <style>{`
        .account-card {
          background: #14141e;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }
        .account-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,215,0,0.25);
          box-shadow: 0 0 30px rgba(255,215,0,0.08);
        }
        .account-image-wrap {
          width: 100%;
          height: 200px;
          background: #1a1a24;
          position: relative;
          overflow: hidden;
        }
        .account-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .account-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
        .account-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          pointer-events: none;
        }
        .badge-discount {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .badge-instant {
          background: rgba(59,130,246,0.2);
          color: #60a5fa;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .account-body {
          padding: 20px;
        }
        .account-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #ffffff;
        }
        .account-subtitle {
          font-size: 13px;
          color: #6b6b7b;
          margin-bottom: 14px;
        }
        .account-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 18px;
        }
        .feature-tag {
          background: #1a1a24;
          color: #a0a0b0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .account-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .price-current {
          font-size: 24px;
          font-weight: 800;
          color: #ffd700;
        }
        .price-original {
          font-size: 14px;
          color: #6b6b7b;
          text-decoration: line-through;
          margin-left: 8px;
        }
        .verified-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #22c55e;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      <div className="account-image-wrap">
        {account.image_url ? (
          <img src={account.image_url} alt={`TH${account.town_hall} Account`} />
        ) : (
          <div className="account-image-placeholder">🏰</div>
        )}
        <div className="account-badges">
          {discount > 0 && <span className="badge-discount">-{discount}% OFF</span>}
          <span className="badge-instant"><IconZap /> Instant</span>
        </div>
      </div>

      <div className="account-body">
        <h3 className="account-title">TH{account.town_hall} Maxed Account</h3>
        <p className="account-subtitle">
          Level {account.exp_level || 'High'} • {account.gems ? `${account.gems.toLocaleString()} Gems` : '5K+ Gems'}
        </p>

        <div className="account-features">
          {features.map((f, i) => (
            <span key={i} className="feature-tag">{f}</span>
          ))}
        </div>

        <div className="account-footer">
          <div style={{display: 'flex', alignItems: 'baseline'}}>
            <span className="price-current">₹{account.price?.toLocaleString()}</span>
            {account.original_price > 0 && (
              <span className="price-original">₹{account.original_price?.toLocaleString()}</span>
            )}
          </div>
          <div className="verified-badge">
            <IconCheck /> Verified
          </div>
        </div>
      </div>
    </div>
  );
}