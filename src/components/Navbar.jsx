import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

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
                
                {/* User Info Header */}
                <div style={styles.dropHeader}>
                  <div style={styles.avatarLarge}>
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={styles.dropGamerTag}>{gamerTag}</div>
                    <div style={styles.dropEmail}>{user.email}</div>
                    <span style={styles.verifiedBadge}>Verified Member</span>
                  </div>
                </div>

                {/* Account Section */}
                <div style={styles.dropSection}>
                  <div style={styles.sectionTitle}>Account</div>
                  <a href="/my-orders" style={styles.dropItem}>
                    <span>📦 My Orders & Vault</span>
                    <span style={styles.arrow}>›</span>
                  </a>
                  <a href="/support" style={styles.dropItem}>
                    <span>💬 Live Chat & Support</span>
                    <span style={styles.arrow}>›</span>
                  </a>
                </div>

                {/* Preferences Section */}
                <div style={styles.dropSection}>
                  <div style={styles.sectionTitle}>Preferences</div>
                  
                  <div style={styles.prefRow}>
                    <span>Language</span>
                    <span style={styles.langTag}>🇬🇧 English</span>
                  </div>

                  <div style={styles.prefRow}>
                    <span>Currency</span>
                    <div style={styles.currencyToggle}>
                      <button 
                        onClick={() => setCurrency('INR')} 
                        style={{ ...styles.currBtn, ...(currency === 'INR' ? styles.currBtnActive : {}) }}
                        type="button"
                      >
                        ₹ INR
                      </button>
                      <button 
                        onClick={() => setCurrency('CRYPTO')} 
                        style={{ ...styles.currBtn, ...(currency === 'CRYPTO' ? styles.currBtnActive : {}) }}
                        type="button"
                      >
                        🪙 Crypto
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout Action */}
                <div style={{ paddingTop: '8px' }}>
                  <button onClick={handleSignOut} style={styles.signOutBtn} type="button">
                    <span>🚪 Sign Out</span>
                    <span>›</span>
                  </button>
                </div>

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
  link: { color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' },
  rightSection: { display: 'flex', alignItems: 'center' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '30px', padding: '6px 14px 6px 6px', cursor: 'pointer', color: '#ffffff' },
  avatarMini: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eab308', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' },
  avatarLarge: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eab308', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', flexShrink: 0 },
  emailDisplay: { fontSize: '12px', fontWeight: '600', color: '#e5e7eb', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdownMenu: { position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: '320px', backgroundColor: '#121214', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', padding: '16px', boxSizing: 'border-box', zIndex: 1100 },
  dropHeader: { display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: '1px solid #27272a' },
  dropGamerTag: { fontSize: '14px', fontWeight: '900', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  dropEmail: { fontSize: '11px', color: '#9ca3af', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  verifiedBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' },
  dropSection: { padding: '12px 0', borderBottom: '1px solid #27272a' },
  sectionTitle: { fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px', paddingLeft: '8px', letterSpacing: '0.5px' },
  dropItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', color: '#e5e7eb', textDecoration: 'none', fontSize: '12px', fontWeight: '700', borderRadius: '10px' },
  arrow: { color: '#6b7280', fontSize: '14px' },
  prefRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', fontSize: '12px', fontWeight: '700', color: '#e5e7eb' },
  langTag: { fontSize: '11px', color: '#9ca3af', backgroundColor: '#18181b', border: '1px solid #27272a', padding: '4px 8px', borderRadius: '8px' },
  currencyToggle: { display: 'flex', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '2px' },
  currBtn: { background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '10px', fontWeight: '700', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' },
  currBtnActive: { backgroundColor: '#eab308', color: '#111827' },
  signOutBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', padding: '10px 8px', color: '#f87171', fontSize: '12px', fontWeight: '800', cursor: 'pointer', borderRadius: '10px' },
  loginBtn: { backgroundColor: '#eab308', color: '#111827', padding: '8px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '12px', textDecoration: 'none' }
};