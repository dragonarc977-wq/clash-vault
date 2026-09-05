import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

// Inline SVG Icons
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconOrders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

const IconSignOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const IconVerified = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconRupee = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M18 13h-6"/><path d="M10 13v8"/>
  </svg>
);

const IconCrypto = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.5 9.5c.5-1 1.5-1.5 2.5-1.5 2 0 3 1.5 3 2.5s-1 2-3 2.5"/>
    <path d="M12 6v12"/><path d="M9 12h6"/>
  </svg>
);

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const menuItems = [
    { label: 'My Orders & Vault', icon: <IconOrders />, path: '/my-orders' },
    { label: 'Live Chat & Support', icon: <IconChat />, action: () => window.Tawk_API?.maximize?.() },
  ];

  const avatarLetter = user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <style>{`
        .profile-dropdown {
          position: relative;
          z-index: 1000;
        }
        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 6px 6px 14px;
          background: rgba(255,215,0,0.06);
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #ffd700;
          font-weight: 600;
          font-size: 13px;
          user-select: none;
        }
        .profile-trigger:hover {
          background: rgba(255,215,0,0.1);
          border-color: rgba(255,215,0,0.3);
          box-shadow: 0 0 20px rgba(255,215,0,0.08);
        }
        .profile-trigger.open {
          background: rgba(255,215,0,0.12);
          border-color: rgba(255,215,0,0.4);
        }
        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700, #e6c200);
          color: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        }
        .profile-chevron {
          transition: transform 0.3s ease;
          color: #b8a030;
        }
        .profile-trigger.open .profile-chevron {
          transform: rotate(180deg);
        }
        
        /* Dropdown Panel */
        .dropdown-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          background: #14141e;
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(255,215,0,0.05);
          overflow: hidden;
          animation: dropIn 0.25s ease;
          transform-origin: top right;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        /* Header */
        .dropdown-header {
          padding: 24px;
          background: linear-gradient(180deg, rgba(255,215,0,0.05) 0%, transparent 100%);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dropdown-user-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .dropdown-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700, #e6c200);
          color: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          border: 3px solid rgba(255,215,0,0.3);
          box-shadow: 0 0 20px rgba(255,215,0,0.15);
        }
        .dropdown-user-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }
        .dropdown-user-info p {
          margin: 0;
          font-size: 12px;
          color: #6b6b7b;
        }
        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding: 4px 10px;
          background: rgba(34,197,94,0.1);
          color: #22c55e;
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Balance */
        .balance-section {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .balance-label {
          font-size: 11px;
          color: #6b6b7b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .balance-amount {
          font-size: 24px;
          font-weight: 800;
          color: #ffd700;
        }
        
        /* Currency Toggle */
        .currency-toggle {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .currency-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #6b6b7b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .currency-btn.active {
          background: rgba(255,215,0,0.1);
          color: #ffd700;
          border-color: rgba(255,215,0,0.3);
        }
        .currency-btn:hover:not(.active) {
          border-color: rgba(255,255,255,0.15);
          color: #a0a0b0;
        }
        
        /* Menu Items */
        .dropdown-menu {
          padding: 8px;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #a0a0b0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .menu-item:hover {
          background: rgba(255,255,255,0.04);
          color: #ffffff;
        }
        .menu-item svg {
          color: #6b6b7b;
          transition: color 0.2s;
        }
        .menu-item:hover svg {
          color: #ffd700;
        }
        
        /* Sign Out */
        .dropdown-footer {
          padding: 8px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .signout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .signout-btn:hover {
          background: rgba(239,68,68,0.08);
        }
        
        /* Arrow */
        .dropdown-arrow {
          position: absolute;
          top: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: #14141e;
          border-left: 1px solid rgba(255,215,0,0.15);
          border-top: 1px solid rgba(255,215,0,0.15);
          transform: rotate(45deg);
        }
      `}</style>

      {/* Trigger Button */}
      <div 
        className={`profile-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{displayName}</span>
        <div className="profile-avatar">{avatarLetter}</div>
        <div className="profile-chevron"><IconChevron /></div>
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-arrow" />
          
          {/* User Header */}
          <div className="dropdown-header">
            <div className="dropdown-user-row">
              <div className="dropdown-avatar">{avatarLetter}</div>
              <div className="dropdown-user-info">
                <h3>{displayName}</h3>
                <p>{email}</p>
                <div className="verified-badge">
                  <IconVerified /> Verified
                </div>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="balance-section">
            <div className="balance-label">Wallet Balance</div>
            <div className="balance-amount">
              {currency === 'INR' ? '₹0.00' : '₿0.000000'}
            </div>
            <div className="currency-toggle">
              <button 
                className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
                onClick={() => setCurrency('INR')}
              >
                <IconRupee /> INR
              </button>
              <button 
                className={`currency-btn ${currency === 'Crypto' ? 'active' : ''}`}
                onClick={() => setCurrency('Crypto')}
              >
                <IconCrypto /> Crypto
              </button>
            </div>
          </div>

          {/* Menu */}
          <div className="dropdown-menu">
            {menuItems.map((item, i) => (
              <button
                key={i}
                className="menu-item"
                onClick={() => {
                  setOpen(false);
                  item.path ? navigate(item.path) : item.action?.();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <div className="dropdown-footer">
            <button 
              className="signout-btn"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <IconSignOut /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}