import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

const categories = [
  ['Accounts', <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="1.8" /><circle cx="9" cy="10" r="2" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="M6 16c.8-2 4.2-2 5 0m3-5h4m-4 4h4" /></svg>],
  ['In-game Items', <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m12 3 8 5-8 5-8-5 8-5Zm-8 9 8 5 8-5m-16 4 8 5 8-5" /></svg>],
  ['Top-ups', <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v18m4-14H9.5a3 3 0 0 0 0 6h5a3 3 0 1 1 0 6H8" /></svg>],
  ['Game Coins', <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="M15 9.5c-.5-1-1.5-1.5-3-1.5-1.8 0-3 1-3 2.4 0 3.5 6 1.7 6 5 0 1.4-1.3 2.5-3.2 2.5-1.5 0-2.7-.6-3.4-1.6M12 6.5v11" /></svg>],
  ['Gaming Services', <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h10l2 4v6a2 2 0 0 1-2 2h-2l-2-2-2 2H7a2 2 0 0 1-2-2v-6l2-4Zm2.5 5h.01M14.5 12h.01" /></svg>],
];

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('INR');
  const [nightMode, setNightMode] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUserData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  const selectLanguage = (value) => { setLanguage(value); setLanguageOpen(false); };
  const selectCurrency = (value) => { setCurrency(value); setCurrencyOpen(false); };
  const closeMenus = () => { setLanguageOpen(false); setCurrencyOpen(false); setNotificationsOpen(false); };

  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] border-b border-white/[0.08] bg-[#08080c]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-base font-black tracking-[0.06em] text-white sm:text-lg"><span className="grid h-9 w-9 place-items-center rounded-xl border border-yellow-400/25 bg-yellow-400/[0.1] text-yellow-300"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="m3 7 4.3 4.3L12 4l4.7 7.3L21 7l-1.8 11H4.8L3 7Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M5.5 18h13" /></svg></span><span className="hidden sm:block">CLASH <span className="text-yellow-400">VAULT</span></span></Link>
        <Link to="/shop" className="hidden rounded-xl border border-yellow-400/25 bg-yellow-400/[0.08] px-4 py-2.5 text-xs font-black text-yellow-300 transition hover:bg-yellow-400 hover:text-[#181205] lg:block">Sell with us</Link>
        <div className="ml-auto flex items-center gap-1.5">
          <Link to="/support" className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-zinc-300 transition hover:border-yellow-400/35 hover:bg-white/[0.07] hover:text-yellow-300" aria-label="Inbox"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 5h16v14H4V5Zm0 9h4l1.5 2h5L16 14h4" /></svg></Link>
          <div className="relative"><button onClick={() => { setNotificationsOpen((value) => !value); setLanguageOpen(false); setCurrencyOpen(false); }} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-zinc-300 transition hover:border-yellow-400/35 hover:bg-white/[0.07] hover:text-yellow-300" aria-label="Notifications"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17H9m10-3V10a7 7 0 0 0-14 0v4l-2 2h18l-2-2Z" /></svg><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-yellow-400" /></button>{notificationsOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-2xl border border-white/[0.1] bg-[#111116] p-4 shadow-2xl shadow-black/50"><div className="flex items-center justify-between"><p className="text-sm font-black">Notifications</p><span className="text-[10px] font-bold text-zinc-500">ALL CAUGHT UP</span></div><p className="mt-5 rounded-xl bg-white/[0.035] p-4 text-sm leading-6 text-zinc-400">No new notifications right now.</p></div>}</div>
          <button onClick={() => setNightMode((value) => !value)} className="hidden h-10 w-10 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-zinc-300 transition hover:border-yellow-400/35 hover:bg-white/[0.07] hover:text-yellow-300 sm:grid" aria-label="Toggle theme">{nightMode ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.5 15.5A8 8 0 0 1 8.5 3.5 8 8 0 1 0 20.5 15.5Z" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" /></svg>}</button>
          <div className="relative hidden sm:block"><button onClick={() => { setLanguageOpen((value) => !value); setCurrencyOpen(false); setNotificationsOpen(false); }} className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/35 hover:text-white"><svg className="h-5 w-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="M3.5 12h17M12 3.5c2.3 2.3 3.5 5.2 3.5 8.5S14.3 18.2 12 20.5C9.7 18.2 8.5 15.3 8.5 12S9.7 5.8 12 3.5Z" /></svg>{language}<span className="text-zinc-600">⌄</span></button>{languageOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-32 rounded-xl border border-white/10 bg-[#111116] p-1 shadow-2xl"><button onClick={() => selectLanguage('EN')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">English</button><button onClick={() => selectLanguage('HI')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">Hindi</button></div>}</div>
          <div className="relative hidden md:block"><button onClick={() => { setCurrencyOpen((value) => !value); setLanguageOpen(false); setNotificationsOpen(false); }} className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/35 hover:text-white"><span className="text-sm font-black text-yellow-300">{currency === 'INR' ? '₹' : '$'}</span>{currency}<span className="text-zinc-600">⌄</span></button>{currencyOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-24 rounded-xl border border-white/10 bg-[#111116] p-1 shadow-2xl"><button onClick={() => selectCurrency('INR')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">₹ INR</button><button onClick={() => selectCurrency('USD')} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">$ USD</button></div>}</div>
          {user ? <ProfileDropdown user={user} onLogout={async () => { closeMenus(); await supabase.auth.signOut(); navigate('/login'); }} /> : <Link to="/login" className="rounded-xl bg-yellow-400 px-3.5 py-2.5 text-xs font-black text-[#151105] transition hover:bg-yellow-300">Sign in</Link>}
        </div>
      </div>
      <div className="border-t border-white/[0.06] px-4 sm:px-6 lg:px-10"><div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none]">{categories.map(([label, icon]) => <Link key={label} to="/shop" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-white/[0.05] hover:text-yellow-300">{icon}<span>{label}</span></Link>)}</div></div>
    </nav>
  );
}
