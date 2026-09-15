import { Link } from 'react-router-dom';

const openCookieSettings = () => window.dispatchEvent(new Event('agm:open-cookie-settings'));

export default function SiteFooter() {
  return <footer className="border-t border-zinc-200 bg-zinc-950 px-5 py-12 text-zinc-300 sm:px-8 sm:py-14">
    <div className="mx-auto grid max-w-[1200px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div><p className="text-base font-black tracking-wide text-white sm:text-lg">ALLGAMERS<span className="text-yellow-300">MARKET</span></p><p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">Independent marketplace. Not endorsed by or affiliated with any game publisher. Only publisher-authorized and lawfully transferable products may be listed.</p></div>
      <nav className="flex flex-col items-start gap-3 text-sm" aria-label="Legal policies"><p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-white">Policies</p><Link to="/terms" className="transition hover:text-white">Terms of Service</Link><Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link><Link to="/cookies" className="transition hover:text-white">Cookie Policy</Link><Link to="/refund-policy" className="transition hover:text-white">Refund Policy</Link><Link to="/marketplace-rules" className="transition hover:text-white">Marketplace Rules</Link><Link to="/account-transfer-risks" className="transition hover:text-white">Transfer Risks</Link></nav>
      <nav className="flex flex-col items-start gap-3 text-sm" aria-label="Help and resources"><p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-white">Help & resources</p><Link to="/support" className="transition hover:text-white">Support</Link><Link to="/faq" className="transition hover:text-white">FAQ</Link><Link to="/blog" className="transition hover:text-white">Blog</Link><button type="button" onClick={openCookieSettings} className="transition hover:text-white">Cookie settings</button></nav>
      <div className="flex flex-col items-start gap-3 text-sm"><p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-white">Socials</p>{['Instagram', 'YouTube', 'Discord'].map((name) => <span key={name} className="flex items-center gap-2 text-zinc-400"><span>{name}</span><span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Soon</span></span>)}</div>
    </div>
    <div className="mx-auto mt-10 max-w-[1200px] border-t border-zinc-800 pt-6 text-xs leading-6 text-zinc-500">© {new Date().getFullYear()} AllGamersMarket. All third-party names and marks belong to their respective owners.</div>
  </footer>;
}
