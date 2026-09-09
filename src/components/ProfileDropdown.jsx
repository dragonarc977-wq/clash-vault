import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const DashboardIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1" strokeWidth="1.7" /><rect x="14" y="4" width="6" height="6" rx="1" strokeWidth="1.7" /><rect x="4" y="14" width="6" height="6" rx="1" strokeWidth="1.7" /><rect x="14" y="14" width="6" height="6" rx="1" strokeWidth="1.7" /></svg>;
const WalletIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4 7.5h15.5v11H4v-11Zm0 3h15.5M7 7.5l2-3h7l1.5 3m-2.5 6h3" /></svg>;
const OrdersIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M5 5h14v14H5V5Zm3 4h8m-8 4h8m-8 4h5" /></svg>;
const BellIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M18.5 14V10a6.5 6.5 0 0 0-13 0v4L3.8 16h16.4L18.5 14ZM10 20h4" /></svg>;
const TicketIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" /></svg>;
const StoreIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4 10h16M5 10l1-5h12l1 5v9H5v-9Zm5 3v6m4-6v6" /></svg>;
const ArrowIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" /></svg>;

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const avatarLetter = user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Arcus 87';

  useEffect(() => {
    const onEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const goTo = (path) => { setOpen(false); navigate(path); };
  const itemClass = 'flex w-full items-center gap-4 rounded-xl px-3 py-3.5 text-left text-base font-semibold text-zinc-800 transition hover:bg-zinc-50';

  return <div>
    <button onClick={() => setOpen(true)} aria-label="Open profile menu" className="relative grid h-9 w-9 place-items-center rounded-full bg-yellow-300 text-xs font-black text-[#171206] transition hover:scale-[1.04]">{avatarLetter}<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" /></button>
    {open && createPortal(<div className="fixed inset-0 z-[9999] flex justify-end">
      <button onClick={() => setOpen(false)} className="absolute inset-0 z-0 cursor-default bg-zinc-950/50 backdrop-blur-[2px]" aria-label="Close profile menu" />
      <aside className="relative z-10 flex h-dvh w-full max-w-[390px] flex-col !bg-white p-5 opacity-100 shadow-2xl sm:p-6" aria-label="Buyer account menu">
        <div className="flex justify-end"><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900" aria-label="Close profile menu"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="1.8" d="m6 6 12 12M18 6 6 18" /></svg></button></div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zinc-100 p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-950 text-base font-black text-white">{avatarLetter}</span><div className="min-w-0"><p className="truncate text-xl font-black tracking-[-0.04em] text-zinc-950">{displayName}</p><p className="mt-0.5 text-xs text-zinc-500">Buyer account</p></div></div>
        <p className="mt-6 px-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Account</p>
        <div className="mt-2 space-y-1">
          <button onClick={() => goTo('/dashboard')} className={itemClass}><span className="text-zinc-500"><DashboardIcon /></span><span className="flex-1">Dashboard</span><span className="text-zinc-400"><ArrowIcon /></span></button>
          <button onClick={() => goTo('/my-orders')} className={itemClass}><span className="text-zinc-500"><WalletIcon /></span><span className="flex-1">My balance</span><span className="text-zinc-400"><ArrowIcon /></span></button>
          <button onClick={() => goTo('/my-orders')} className={itemClass}><span className="text-zinc-500"><OrdersIcon /></span><span className="flex-1">My orders</span><span className="text-zinc-400"><ArrowIcon /></span></button>
          <button onClick={() => goTo('/notifications')} className={itemClass}><span className="text-zinc-500"><BellIcon /></span><span className="flex-1">Notifications</span><span className="text-zinc-400"><ArrowIcon /></span></button>
          <button onClick={() => goTo('/support')} className={itemClass}><span className="text-zinc-500"><TicketIcon /></span><span className="flex-1">Ticket</span><span className="text-zinc-400"><ArrowIcon /></span></button>
          <button onClick={() => goTo('/shop')} className={itemClass}><span className="text-zinc-500"><StoreIcon /></span><span className="flex-1">Become a seller</span><span className="text-zinc-400"><ArrowIcon /></span></button>
        </div>
        <div className="mt-auto border-t border-zinc-200 pt-3"><button onClick={() => { setOpen(false); onLogout(); }} className="flex w-full items-center gap-4 rounded-xl px-3 py-3.5 text-left text-[15px] font-bold text-red-600 transition hover:bg-red-50"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 8l4 4-4 4M18 12H7m4 8H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /></svg>Log out</button></div>
      </aside>
    </div>, document.body)}
  </div>;
}
