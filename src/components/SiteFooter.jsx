import { Link } from 'react-router-dom';

const openCookieSettings = () => window.dispatchEvent(new Event('agm:open-cookie-settings'));

export default function SiteFooter() {
  return <footer className="border-t border-zinc-200 bg-zinc-950 px-5 py-10 text-zinc-300 sm:px-8">
    <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
      <div><p className="text-sm font-black tracking-wide text-white">ALLGAMERS<span className="text-yellow-300">MARKET</span></p><p className="mt-3 max-w-xl text-xs leading-6 text-zinc-400">Independent marketplace. Not endorsed by or affiliated with any game publisher. Only publisher-authorized and lawfully transferable products may be listed.</p></div>
      <nav className="flex max-w-xl flex-wrap gap-x-5 gap-y-3 text-xs font-semibold" aria-label="Legal and support">
        <Link to="/terms" className="hover:text-white">Terms</Link><Link to="/privacy" className="hover:text-white">Privacy</Link><Link to="/cookies" className="hover:text-white">Cookies</Link><Link to="/refund-policy" className="hover:text-white">Refunds</Link><Link to="/marketplace-rules" className="hover:text-white">Marketplace rules</Link><Link to="/account-transfer-risks" className="hover:text-white">Transfer risks</Link><Link to="/support" className="hover:text-white">Support</Link><button type="button" onClick={openCookieSettings} className="font-semibold hover:text-white">Cookie settings</button>
      </nav>
    </div>
    <div className="mx-auto mt-8 max-w-[1200px] border-t border-zinc-800 pt-5 text-[11px] text-zinc-500">© {new Date().getFullYear()} AllGamersMarket. All third-party names and marks belong to their respective owners.</div>
  </footer>;
}
