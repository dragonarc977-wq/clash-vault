import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

const IconButton = ({ children, label, className = '', onClick }) => <button onClick={onClick} aria-label={label} className={`grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 ${className}`}>{children}</button>;

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('INR');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadUser = async () => { const { data: { session } } = await supabase.auth.getSession(); setUser(session?.user || null); };
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  const closeMenus = () => { setLanguageOpen(false); setCurrencyOpen(false); setNotificationsOpen(false); };
  const submitSearch = (event) => { event.preventDefault(); navigate('/shop'); };

  return <nav className="fixed inset-x-0 top-0 z-[1000] border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-[1600px] min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-7 lg:px-10">
      <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="ClashVault home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-300 text-[12px] font-black tracking-[-0.14em] text-[#171206]">CV</span><span className="hidden text-[17px] font-black tracking-[0.07em] text-zinc-950 lg:block">CLASH<span className="text-[#c68d00]">VAULT</span></span></Link>

      <form onSubmit={submitSearch} className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 sm:mx-auto sm:max-w-xl sm:px-4">
        <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg>
        <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs text-zinc-800 outline-none placeholder:text-zinc-400 sm:text-sm" placeholder="Search games..." />
        <button className="hidden rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 sm:block">Search</button>
      </form>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link to="/support" aria-label="Support inbox" className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"><svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 5.5h16v13H4v-13Zm0 8.5h4.4l1.6 2.25h4L15.6 14H20" /></svg></Link>
        <div className="relative hidden sm:block"><IconButton label="Notifications" onClick={() => { setNotificationsOpen((value) => !value); setLanguageOpen(false); setCurrencyOpen(false); }}><svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4" /></svg></IconButton>{notificationsOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"><p className="text-sm font-bold text-zinc-950">Notifications</p><p className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm leading-6 text-zinc-500">You are all caught up.</p></div>}</div>
        <div className="relative hidden md:block"><button onClick={() => { setLanguageOpen((value) => !value); setCurrencyOpen(false); }} className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50"><span className="text-[#c68d00]">◎</span>{language}</button>{languageOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-28 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl"><button onClick={() => { setLanguage('EN'); setLanguageOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50">English</button><button onClick={() => { setLanguage('HI'); setLanguageOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50">Hindi</button></div>}</div>
        <div className="relative hidden lg:block"><button onClick={() => { setCurrencyOpen((value) => !value); setLanguageOpen(false); }} className="flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-600"><span className="text-[#c68d00]">{currency === 'INR' ? '₹' : '$'}</span>{currency}</button>{currencyOpen && <div className="absolute right-0 top-[calc(100%+10px)] w-24 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl"><button onClick={() => { setCurrency('INR'); setCurrencyOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50">₹ INR</button><button onClick={() => { setCurrency('USD'); setCurrencyOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50">$ USD</button></div>}</div>
        {user ? <ProfileDropdown user={user} onLogout={async () => { closeMenus(); await supabase.auth.signOut(); navigate('/login'); }} /> : <Link to="/login" className="grid h-9 w-9 place-items-center rounded-full bg-yellow-300 text-xs font-black text-[#171206]">→</Link>}
      </div>
    </div>
  </nav>;
}
