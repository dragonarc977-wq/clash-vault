import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

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

    return () => subscription.unsubscribe();
  }, []);

  const openLogin = () => {
  if (loginRedirecting) return;

  setLoginRedirecting(true);

  window.setTimeout(() => {
    navigate('/login');
    setLoginRedirecting(false);
  }, 800);
};

if (location.pathname === '/login') {
  return null;
}

return (
    <nav className="fixed inset-x-0 top-0 z-[1000] border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-7 lg:px-10">

        {/* WEBSITE NAME */}
        <Link
          to="/"
          className="flex shrink-0 items-center"
          aria-label="AllGamersMarket home"
        >
          <span className="text-[15px] font-black tracking-[0.035em] text-zinc-950">
            ALLGAMERS
            <span className="text-pink-700">MARKET</span>
          </span>
        </Link>

        {/* LOGIN / PROFILE */}
        <div className="ml-auto flex shrink-0 items-center">
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
              className="flex h-9 items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800"
            >
              LOGIN
            </button>
          )}
        </div>
      </div>

      {/* LOGIN LOADING SCREEN */}
      {loginRedirecting && (
        <div
          className="fixed inset-0 z-[1100] grid place-items-center bg-white/90 px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-xl shadow-zinc-950/10">
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-black text-zinc-950">
                Opening your account
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                Just a moment…
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}