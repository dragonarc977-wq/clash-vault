import React, { useState, useEffect, useRef } from 'react';
import supabase from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <nav style={styles.nav}>
      {/* Brand Logo */}
      <a href="/" style={styles.logoContainer}>
        <div style={styles.logoIcon}>👑</div>
        <span>CLASH <span style={{ color: '#eab308' }}>VAULT</span></span>
      </a>

      {/* Center Nav Links */}
      <div style={styles.navLinks}>
        <a href="/" style={styles.link}>Home</a>
        <a href="/shop" style={styles.link}>Shop</a>
        <a href="/faq" style={styles.link}>FAQ</a>
      </div>

      {/* Right Side: Auth / Profile Dropdown */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        {user ? (
          <div>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={styles.profileButton}
            >
              <div style={styles.avatar}>
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={styles.emailText}>{user.email}</span>
              <span style={{ color: '#eab308', fontSize: '10px' }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <p style={styles.dropdownLabel}>Signed in as</p>
                  <p style={styles.dropdownEmail}>{user.email}</p>
                </div>

                <a href="/my-orders" style={styles.dropdownItem}>
                  <span>📦</span> My Orders & Vault
                </a>

                <a href="/support" style={styles.dropdownItem}>
                  <span>💬</span> Live Chat & Support
                </a>

                <div style={styles.divider}></div>

                <button onClick={handleLogout} style={styles.logoutItem}>
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/login" style={styles.signInButton}>
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: '100%',
    backgroundColor: '#070708',
    borderBottom: '1px solid #27272a',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
    fontWeight: 900,
    fontSize: '18px',
    letterSpacing: '1px',
    textDecoration: 'none'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    border: '1px solid rgba(234, 179, 8, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  link: {
    color: '#9ca3af',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#121214',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    padding: '8px 14px',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#eab308',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '11px'
  },
  emailText: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#e5e7eb'
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    marginTop: '12px',
    width: '220px',
    backgroundColor: '#121214',
    border: '1px solid #27272a',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
    padding: '8px 0',
    zIndex: 100,
    boxSizing: 'border-box'
  },
  dropdownHeader: {
    padding: '10px 16px',
    borderBottom: '1px solid rgba(39, 39, 42, 0.8)',
    marginBottom: '4px'
  },
  dropdownLabel: {
    fontSize: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '0.5px'
  },
  dropdownEmail: {
    fontSize: '12px',
    color: '#eab308',
    fontWeight: 700,
    margin: '2px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#d1d5db',
    textDecoration: 'none',
    transition: 'background 0.2s'
  },
  divider: {
    borderTop: '1px solid #27272a',
    margin: '4px 0'
  },
  logoutItem: {
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#f87171',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer'
  },
  signInButton: {
    backgroundColor: '#eab308',
    color: '#111827',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '12px',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(234, 179, 8, 0.2)',
    display: 'inline-block'
  }
};