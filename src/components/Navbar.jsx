import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUserData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate('/shop');
  };

  const chooseLanguage = (value) => { setLanguage(value); setLanguageOpen(false); };
  const chooseCurrency = (value) => { setCurrency(value); setCurrencyOpen(false); };

  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] border-b border-white/[0.07] bg-[#08080c]/95 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-base font-black tracking-[0.06em] text-white sm:text-lg"><span className="grid h-8 w-8 place-items-center rounded-lg border border-yellow-400/25 bg-yellow-400/[0.1] text-yellow-300"><svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="m3 7 4.3 4.3L12 4l4.7 7.3L21 7l-1.8 11H4.8L3 7Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M5.5 18h13" /></svg></span><span>CLASH <span className="text-yellow-400">VAULT</span></span></Link>

        <div className="hidden items-center gap-1 xl:flex">
          <Link to="/" className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">Home</Link>
          <Link to="/shop" className="rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">Games</Link>
        </div>

        <form onSubmit={submitSearch} className="order-3 flex min-w-0 basis-full items-center rounded-xl border border-white/[0.1] bg-white/[0.045] px-3 transition focus-within:border-yellow-400/50 focus-within:bg-white/[0.06] md:order-none md:ml-auto md:max-w-2xl md:flex-1 md:basis-auto">
          <svg className="h-5 w-5 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg>
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600" placeholder="Search games, accounts, ranks, cosmetics…" />
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-yellow-400 text-[#161205] transition hover:bg-yellow-300" aria-label="Search marketplace"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg></button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <div className="relative">
            <button onClick={() => { setLanguageOpen((open) => !open); setCurrencyOpen(false); }} className="flex items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.035] px-2.5 py-2.5 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-white"><svg className="h-4 w-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" /></svg><span>{language}</span><span className="text-zinc-600">⌄</span></button>
            {languageOpen && <div className="absolute right-0 top-[calc(100%+8px)] w-28 overflow-hidden rounded-xl border border-white/10 bg-[#141419] p-1 shadow-2xl"><button onClick={() => chooseLanguage('EN')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">🇺🇸 English</button><button onClick={() => chooseLanguage('HI')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">🇮🇳 Hindi</button></div>}
          </div>
          <div className="relative">
            <button onClick={() => { setCurrencyOpen((open) => !open); setLanguageOpen(false); }} className="flex items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.035] px-2.5 py-2.5 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-white"><span className="text-sm font-black text-yellow-300">{currency === 'INR' ? '₹' : '$'}</span><span>{currency}</span><span className="text-zinc-600">⌄</span></button>
            {currencyOpen && <div className="absolute right-0 top-[calc(100%+8px)] w-24 overflow-hidden rounded-xl border border-white/10 bg-[#141419] p-1 shadow-2xl"><button onClick={() => chooseCurrency('INR')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">₹ INR</button><button onClick={() => chooseCurrency('USD')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">$ USD</button></div>}
          </div>
          {user ? <ProfileDropdown user={user} onLogout={async () => { await supabase.auth.signOut(); navigate('/login'); }} /> : <Link to="/login" className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-[#151105] transition hover:bg-yellow-300">Sign in</Link>}
        </div>
      </div>
    </nav>
  );
}
