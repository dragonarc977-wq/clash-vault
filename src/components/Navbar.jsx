import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';

const IconButton = ({ children, label, onClick, active = false }) => (
  <button onClick={onClick} aria-label={label} className={`relative grid h-10 w-10 place-items-center rounded-full border transition duration-200 ${active ? 'border-yellow-300/50 bg-yellow-300/[0.12] text-yellow-200' : 'border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'}`}>
    {children}
  </button>
);

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  const closeMenus = () => { setLanguageOpen(false); setCurrencyOpen(false); setNotificationsOpen(false); };

  return (
    <nav className="fixed inset-x-0 top-0 z-[1000] border-b border-white/[0.07] bg-[#08090d]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-4 px-4 sm:px-7 lg:px-10">
        <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="ClashVault home">
          <span className="grid h-9 w-9 place-items-center rounded-[13px] border border-yellow-300/25 bg-gradient-to-br from-yellow-300 to-amber-500 text-[13px] font-black tracking-[-0.14em] text-[#171206] shadow-[0_0_28px_rgba(250,204,21,0.14)] transition duration-200 group-hover:scale-105">CV</span>
          <span className="hidden text-[17px] font-black tracking-[0.08em] text-white sm:block">CLASH<span className="text-yellow-300">VAULT</span></span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/support" className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-300 transition duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white" aria-label="Support inbox">
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 5.5h16v13H4v-13Zm0 8.5h4.4l1.6 2.25h4L15.6 14H20" /></svg>
          </Link>
          <div className="relative">
            <IconButton label="Notifications" onClick={() => { setNotificationsOpen((value) => !value); setLanguageOpen(false); setCurrencyOpen(false); }} active={notificationsOpen}>
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4" /></svg><span className="absolute right-[9px] top-[9px] h-1.5 w-1.5 rounded-full bg-yellow-300 ring-2 ring-[#121318]" />
            </IconButton>
            {notificationsOpen && <div className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-2xl border border-white/[0.1] bg-[#101218]/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">Notifications</p><span className="text-[10px] font-bold tracking-[0.12em] text-zinc-500">UP TO DATE</span></div><p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 text-sm leading-6 text-zinc-400">You are all caught up. Order and support updates will appear here.</p></div>}
          </div>
          <div className="relative hidden sm:block">
            <button onClick={() => { setLanguageOpen((value) => !value); setCurrencyOpen(false); setNotificationsOpen(false); }} className="flex h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 text-xs font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"><svg className="h-[17px] w-[17px] text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" strokeWidth="1.8" /><path strokeLinecap="round" strokeWidth="1.8" d="M3.5 12h17M12 3.5c2.3 2.3 3.5 5.2 3.5 8.5S14.3 18.2 12 20.5C9.7 18.2 8.5 15.3 8.5 12S9.7 5.8 12 3.5Z" /></svg>{language}</button>
            {languageOpen && <div className="absolute right-0 top-[calc(100%+12px)] w-32 rounded-2xl border border-white/[0.1] bg-[#101218]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"><button onClick={() => { setLanguage('EN'); setLanguageOpen(false); }} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">English</button><button onClick={() => { setLanguage('HI'); setLanguageOpen(false); }} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">Hindi</button></div>}
          </div>
          <div className="relative hidden md:block">
            <button onClick={() => { setCurrencyOpen((value) => !value); setLanguageOpen(false); setNotificationsOpen(false); }} className="flex h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 text-xs font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"><span className="text-sm text-yellow-300">{currency === 'INR' ? '₹' : '$'}</span>{currency}</button>
            {currencyOpen && <div className="absolute right-0 top-[calc(100%+12px)] w-24 rounded-2xl border border-white/[0.1] bg-[#101218]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"><button onClick={() => { setCurrency('INR'); setCurrencyOpen(false); }} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">₹ INR</button><button onClick={() => { setCurrency('USD'); setCurrencyOpen(false); }} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white">$ USD</button></div>}
          </div>
          <span className="hidden h-6 w-px bg-white/[0.08] sm:block" />
          {user ? <ProfileDropdown user={user} onLogout={async () => { closeMenus(); await supabase.auth.signOut(); navigate('/login'); }} /> : <Link to="/login" className="rounded-full bg-yellow-300 px-4 py-2.5 text-xs font-black text-[#171206] transition hover:bg-yellow-200">Sign in</Link>}
        </div>
      </div>
    </nav>
  );
}
