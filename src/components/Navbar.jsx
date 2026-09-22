'use client';

import LoginModal from './LoginModal';
import {
  LuBellPlus,
} from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from '../lib/navigation';

import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
const [authModalMode, setAuthModalMode] = useState('signin');

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user || null);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);

      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalMode('reset');
        setShowAuthModal(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const openLogin = () => {
  setAuthModalMode('signin');
  setShowAuthModal(true);
};

  // Hide navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
  <>
    <nav className="navbar">
      <div className="navbar-inner">

        {/* WEBSITE NAME */}
        <Link
          to="/"
          className="navbar-logo"
          aria-label="AllGamersMarket home"
        >
          <span className="navbar-logo-text">
            ALLGAMERS
            <span className="navbar-logo-market">
              MARKET
            </span>
          </span>
        </Link>

        {/* LOGIN / PROFILE */}
        <div className="navbar-actions">
          {user && location.pathname !== '/login' && (
          <Link
  to="/notifications"
  className="navbar-notification-button"
  aria-label="Notifications"
>
  <LuBellPlus
    size={22}
  />
</Link>
 )}
          {user ? (
            <ProfileDropdown
              user={user}
              onLogout={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
            />
          ) : (
            <button
              type="button"
              onClick={openLogin}
              aria-label="Login"
              className="navbar-login-button"
            >
              LOGIN
            </button>
          )}
        </div>

      </div>

      
        </nav>

    {showAuthModal && (
      <LoginModal
        key={authModalMode}
        isOpen={true}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
      />
    )}
  </>
);
}