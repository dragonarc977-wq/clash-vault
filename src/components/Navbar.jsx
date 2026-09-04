import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import  supabase  from '../lib/supabase';

// ===== INLINE SVG ICONS (No lucide-react needed) =====
const IconCrown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
    <path d="M5 21h14"/>
  </svg>
);

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

// ===== MAIN COMPONENT =====
export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setIsAdmin(data.user.email === 'dragonarc977@gmail.com'); // change to your email
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === 'dragonarc977@gmail.com');
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <style>{`
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 0;
          transition: all 0.3s ease;
          background: transparent;
        }
        .site-header.scrolled {
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,215,0,0.25);
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #ffd700, #e6c200); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #0a0a0f; }
        .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; }
        .logo-text span { color: #ffd700; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-links a { color: #a0a0b0; text-decoration: none; font-weight: 500; font-size: 14px; transition: color 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
        .nav-links a:hover { color: #ffd700; }
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        .nav-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .nav-btn-login { color: #ffd700; border: 1px solid rgba(255,215,0,0.25); background: transparent; }
        .nav-btn-login:hover { background: rgba(255,215,0,0.08); }
        .nav-btn-admin { color: #ffd700; border: 1px solid rgba(255,215,0,0.25); background: rgba(255,215,0,0.05); }
        .mobile-toggle { display: none; background: none; border: none; color: #ffffff; cursor: pointer; }
        @media (max-width: 768px) { .nav-links { display: none; } .mobile-toggle { display: block; } }
      `}</style>
      
      <div className="nav-inner">
        <Link to="/" className="logo">
          <div className="logo-icon"><IconCrown /></div>
          <div className="logo-text">Clash<span>Vault</span></div>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/my-orders">My Orders</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        <div className="nav-actions">
          {isAdmin && (
            <Link to="/admin" className="nav-btn nav-btn-admin">
              <IconShield /> Admin
            </Link>
          )}
          {user ? (
            <>
              <span style={{ color: '#a0a0b0', fontSize: '13px' }}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} className="nav-btn nav-btn-login"><IconUser /> Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-btn nav-btn-login"><IconUser /> Sign In</Link>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}