import { Link } from 'react-router-dom';

const StoreIcon = () => <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 10h16M5 10l1-5h12l1 5v9H5v-9Zm5 3v6m4-6v6" /></svg>;

export default function SellerOnboarding() {
  return <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 pb-16 pt-24 text-zinc-950 sm:px-8">
    <section className="w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white text-center shadow-sm">
      <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(255,227,108,0.55),rgba(255,255,255,0)_58%)] px-6 py-16 sm:px-12 sm:py-24">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-zinc-950 text-yellow-300 shadow-xl"><StoreIcon /></span>
        <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[#b77e00]">Sell on ClashVault</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">Seller onboarding coming soon</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">We are preparing a secure, simple way for trusted sellers to list accounts, items, top-ups, and gaming services.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/shop" className="inline-flex w-full justify-center rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#b77e00] sm:w-auto">Back to marketplace</Link>
          <Link to="/support" className="inline-flex w-full justify-center rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-sm font-bold transition hover:border-zinc-950 sm:w-auto">Contact support</Link>
        </div>
      </div>
      <div className="grid gap-px border-t border-zinc-200 bg-zinc-200 sm:grid-cols-3"><div className="bg-white p-6"><p className="font-black">Verified sellers</p><p className="mt-2 text-sm text-zinc-500">Identity and listing review</p></div><div className="bg-white p-6"><p className="font-black">Simple listings</p><p className="mt-2 text-sm text-zinc-500">Clear tools to manage offers</p></div><div className="bg-white p-6"><p className="font-black">Seller support</p><p className="mt-2 text-sm text-zinc-500">Help throughout every sale</p></div></div>
    </section>
  </main>;
}
