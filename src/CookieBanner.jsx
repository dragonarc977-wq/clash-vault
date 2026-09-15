import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'agm_cookie_consent_v1';

function readChoice() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

export default function CookieBanner() {
  const [choice, setChoice] = useState(readChoice);
  const [manage, setManage] = useState(false);

  useEffect(() => {
    const open = () => setManage(true);
    window.addEventListener('agm:open-cookie-settings', open);
    return () => window.removeEventListener('agm:open-cookie-settings', open);
  }, []);

  const save = (optional) => {
    const next = { necessary: true, optional, savedAt: new Date().toISOString(), version: 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.removeItem('cookiesAccepted');
    setChoice(next);
    setManage(false);
    window.dispatchEvent(new CustomEvent('agm:cookie-consent', { detail: next }));
  };

  if (choice && !manage) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000] p-3 sm:p-5" role="dialog" aria-modal="true" aria-label="Cookie preferences">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/25 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div><h2 className="text-lg font-black text-zinc-950">Your privacy choices</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-zinc-600">We use necessary browser storage for sign-in, security and your preferences. Optional cookies are off unless you accept them. Read our <Link to="/cookies" className="font-bold underline">Cookie Policy</Link> and <Link to="/privacy" className="font-bold underline">Privacy Policy</Link>.</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setManage((value) => !value)} className="rounded-full border border-zinc-300 px-4 py-2.5 text-xs font-bold text-zinc-700">Manage</button><button type="button" onClick={() => save(false)} className="rounded-full border border-zinc-950 px-4 py-2.5 text-xs font-bold text-zinc-950">Reject optional</button><button type="button" onClick={() => save(true)} className="rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white">Accept all</button></div>
        </div>
        {manage && <div className="mt-5 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-2"><div className="rounded-2xl bg-zinc-50 p-4"><div className="flex items-center justify-between"><b className="text-sm text-zinc-950">Necessary</b><span className="text-[10px] font-black uppercase text-emerald-700">Always on</span></div><p className="mt-2 text-xs leading-5 text-zinc-500">Required for authentication, fraud prevention, theme and consent settings.</p></div><div className="rounded-2xl bg-zinc-50 p-4"><div className="flex items-center justify-between"><b className="text-sm text-zinc-950">Optional analytics</b><span className="text-[10px] font-black uppercase text-zinc-500">Your choice</span></div><p className="mt-2 text-xs leading-5 text-zinc-500">Permits privacy-respecting usage analytics if we enable them. Advertising cookies are not used.</p></div></div>}
      </div>
    </div>
  );
}
