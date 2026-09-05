import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown'; // <--- IMPORT ADDED

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    };
    getUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const styles = {
    nav: { position: 'fixed', top: 0, left: 0, right: 0, height: '70px', backgroundColor: '#070708', borderBottom: '1px solid #1f1f22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 1000, fontFamily: 'sans-serif', boxSizing: 'border-box' },
    logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
    crown: { fontSize: '18px' },
    logoText: { fontSize: '18px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff', textDecoration: 'none' },
    navLinks: { display: 'flex', gap: '30px' },
    link: { color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' },
    rightSection: { display: 'flex', alignItems: 'center' },
    loginBtn: { backgroundColor: '#eab308', color: '#111827', padding: '8px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '12px', textDecoration: 'none' }
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

      <div style={styles.rightSection}>
        {user ? (
          <ProfileDropdown user={user} onLogout={handleSignOut} /> // <--- USED HERE
        ) : (
          <a href="/login" style={styles.loginBtn}>Sign In</a>
        )}
      </div>
    </nav>
  );
}