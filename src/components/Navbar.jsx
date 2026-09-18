import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

import '../styles/navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loginRedirecting, setLoginRedirecting] = useState(false);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openLogin = () => {
    if (loginRedirecting) return;

    setLoginRedirecting(true);

    window.setTimeout(() => {
      navigate('/login');
      setLoginRedirecting(false);
    }, 800);
  };

  // Hide navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
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

      {/* LOGIN LOADING SCREEN */}
      {loginRedirecting && (
        <div
          className="navbar-loading-overlay"
          role="status"
          aria-live="polite"
        >
          <div className="navbar-loading-box">

            <span
              className="navbar-spinner"
              aria-hidden="true"
            />

            <div>
              <p className="navbar-loading-title">
                Opening your account
              </p>

              <p className="navbar-loading-text">
                Just a moment…
              </p>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}