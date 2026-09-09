import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersIcon = () => <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 6h16M6 6l1 14h10l1-14M9 10v6m6-6v6M8 6l1-3h6l1 3" /></svg>;
const SupportIcon = () => <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const avatarLetter = user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player';

  useEffect(() => {
    const close = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const goTo = (path) => { setOpen(false); navigate(path); };

  return <div ref={dropdownRef} className="relative">
    <button onClick={() => setOpen((value) => !value)} aria-label="Open profile menu" className={`relative grid h-10 w-10 place-items-center rounded-full border text-sm font-black transition ${open ? 'border-yellow-300/60 bg-yellow-300 text-[#171206]' : 'border-yellow-300/30 bg-gradient-to-br from-yellow-300 to-amber-500 text-[#171206] hover:scale-[1.04]'}`}>
      {avatarLetter}<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
    </button>
    {open && <div className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-300/40">
      <div className="p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-base font-black text-[#171206]">{avatarLetter}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-950">{displayName}</p><p className="mt-1 text-xs text-emerald-600">Buyer account · active</p></div></div></div>
      <div className="border-y border-zinc-100 p-2"><button onClick={() => goTo('/my-orders')} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"><span className="text-[#b77e00]"><OrdersIcon /></span>My orders</button><button onClick={() => goTo('/support')} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"><span className="text-[#b77e00]"><SupportIcon /></span>Support</button></div>
      <div className="p-2"><button onClick={() => { setOpen(false); onLogout(); }} className="w-full rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950">Sign out</button></div>
    </div>}
  </div>;
}
