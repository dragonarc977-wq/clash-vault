import React, { useState, useEffect } from 'react';
import supabase from './lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gamerTag, setGamerTag] = useState('');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Generate or load random professional gamer tag
        let storedTag = localStorage.getItem(`gamer_tag_${session.user.id}`);
        if (!storedTag) {
          const adjectives = ['Elite', 'Shadow', 'Apex', 'Titan', 'Viper', 'Ghost', 'Rogue'];
          const nouns = ['Clasher', 'Stryker', 'Legend', 'Slayer', 'Brawler', 'Chief'];
          const randomNum = Math.floor(100 + Math.random() * 900);
          storedTag = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}#${randomNum}`;
          localStorage.setItem(`gamer_tag_${session.user.id}`, storedTag);
        }
        setGamerTag(storedTag);
      }
    };
    getUserData();

    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('#profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logoContainer}>
        <span style={styles.crown}>👑</span>
        <a href="/" style={styles.logoText}>CLASH <span style={{ color: '#eab308' }}>VAULT</span></a>
      </div>

      <div style={styles.navLinks}>
        <a href="/" style={styles.link}>HOME</a>
        <a href="/shop" style={styles.link}>SHOP</a>
        <a href="/faq" style={styles.link}>FAQ</a>
      </div>

      <div style={styles.rightSection} id="profile-dropdown-container">
        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={styles.profileBtn}
              type="button"
            >
              <div style={styles.avatarMini}>
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={styles.emailDisplay}>{user.email}</span>
              <span style={{ fontSize: '10px', color: '#eab308' }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={styles.dropdownMenu}>
                {/* User Identity / Gamer Tag Header */}
                <div style={styles.dropHeader}>
                  <div style={styles.dropGamerTag}>{gamerTag}</div>
                  <div style={styles.dropEmail}>{user.email}</div>
                  <div style={styles.badgeRow}>
                    <span style={styles.verifiedBadge}>Verified</span>
                    <span style={styles.langBadge}>🇬🇧 English</span>
                  </div>
                </div>

                {/* Currency Switcher inside dropdown */}
                <div style={styles.dropSection}>
                  <span style={styles.dropLabel}>Currency</span>
                  <div style={styles.currencyToggle}>
                    <button 
                      onClick={() => setCurrency('INR')} 
                      style={{ ...styles.currBtn, ...(currency === 'INR' ? styles.currBtnActive : {}) }}
                    >
                      ₹ INR
                    </button>
                    <button 
                      onClick={() => setCurrency('CRYPTO')} 
                      style={{ ...styles.currBtn, ...(currency === 'CRYPTO' ? styles.currBtnActive : {}) }}
                    >
                      🪙 Crypto
                    </button>
                  </div>
                </div>

                <div style={styles.dropDivider}></div>

                <a href="/my-orders" style={styles.dropItem}>
                  📦 My Orders & Vault
                </a>
                <a href="/support" style={styles.dropItem}>
                  💬 Live Chat & Support
                </a>

                <div style={styles.dropDivider}></div>

                <button onClick={handleSignOut} style={styles.signOutBtn} type="button">
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/login" style={styles.loginBtn}>Sign In</a>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, height: '70px', backgroundColor: '#070708', borderBottom: '1px solid #1f1f22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 1000, fontFamily: 'sans-serif', boxSizing: 'border-box' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  crown: { fontSize: '18px' },
  logoText: { fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: '30px' },
  link: { color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', transition: 'color 0.2s' },
  rightSection: { display: 'flex', alignItems: 'center' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '30px', padding: '6px 14px 6px 6px', cursor: 'pointer', color: '#ffffff' },
  avatarMini: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eab308', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' },
  emailDisplay: { fontSize: '12px', fontWeight: '600', color: '#e5e7eb', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdownMenu: { position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: '280px', backgroundColor: '#121214', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.8)', padding: '12px', boxSizing: 'border-box', zIndex: 1100 },
  dropHeader: { padding: '8px 8px 12px 8px', borderBottom: '1px solid #1f1f22' },
  dropGamerTag: { fontSize: '15px', fontWeight: '900', color: '#ffffff', marginBottom: '2px' },
  dropEmail: { fontSize: '11px', color: '#9ca3af', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' },
  badgeRow: { display: 'flex', gap: '6px' },
  verifiedBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' },
  langBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #27272a', color: '#9ca3af', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' },
  dropSection: { padding: '10px 8px' },
  dropLabel: { display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px', letterSpacing: '0.5px' },
  currencyToggle: { display: 'flex', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '3px' },
  currBtn: { flex: 1, background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '11px', fontWeight: '700', padding: '6px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' },
  currBtnActive: { backgroundColor: '#eab308', color: '#111827', boxShadow: '0 2px 6px rgba(234, 179, 8, 0.3)' },
  dropDivider: { height: '1px', backgroundColor: '#1f1f22', margin: '6px 0' },
  dropItem: { display: 'block', padding: '10px 8px', color: '#e5e7eb', textDecoration: 'none', fontSize: '12px', fontWeight: '700', borderRadius: '8px', transition: 'background 0.2s' },
  signOutBtn: { width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 8px', color: '#f87171', fontSize: '12px', fontWeight: '800', cursor: 'pointer', borderRadius: '8px' },
  loginBtn: { backgroundColor: '#eab308', color: '#111827', padding: '8px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '12px', textDecoration: 'none' }
};