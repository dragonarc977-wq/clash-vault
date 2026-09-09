import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 6h18M5 6l1 14h12l1-14M9 10v6m6-6v6M8 6l1-3h6l1 3" /></svg>;
const SupportIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;
const SignOutIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 8l4 4-4 4M18 12H7m4 8H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /></svg>;

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const avatarLetter = user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player';
  const email = user?.email || '';

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const goTo = (path) => { setOpen(false); navigate(path); };

  return (
    <div ref={dropdownRef} className="relative">
      <button onClick={() => setOpen((value) => !value)} className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition ${open ? 'border-yellow-400/45 bg-yellow-400/[0.1]' : 'border-white/[0.1] bg-white/[0.035] hover:border-yellow-400/30 hover:bg-white/[0.06]'}`}>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-400 text-sm font-black text-[#171205]">{avatarLetter}</span>
        <span className="hidden max-w-24 truncate text-xs font-bold text-white lg:block">{displayName}</span>
        <svg className={`h-3.5 w-3.5 text-zinc-500 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111116] shadow-2xl shadow-black/50">
        <div className="border-b border-white/[0.08] bg-white/[0.025] p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-base font-black text-[#171205]">{avatarLetter}</span><div className="min-w-0"><p className="truncate text-sm font-black text-white">{displayName}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{email}</p></div></div><div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Verified buyer</div></div>
        <div className="p-2"><button onClick={() => goTo('/my-orders')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"><span className="text-yellow-300"><OrdersIcon /></span>My orders</button><button onClick={() => goTo('/support')} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"><span className="text-yellow-300"><SupportIcon /></span>Support centre</button></div>
        <div className="border-t border-white/[0.08] p-2"><button onClick={() => { setOpen(false); onLogout(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/[0.08] hover:text-red-200"><SignOutIcon />Sign out</button></div>
      </div>}
    </div>
  );
}
