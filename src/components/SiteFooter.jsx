import discordLogo from "../assets/Discord-Symbol-White.svg";
const openCookieSettings = () =>
  window.dispatchEvent(new Event("agm:open-cookie-settings"));

const socialIcons = {
  instagram: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M21 8.1a3 3 0 0 0-2.1-2.12C17.05 5.5 12 5.5 12 5.5s-5.05 0-6.9.48A3 3 0 0 0 3 8.1 31 31 0 0 0 2.5 12 31 31 0 0 0 3 15.9a3 3 0 0 0 2.1 2.12c1.85.48 6.9.48 6.9.48s5.05 0 6.9-.48A3 3 0 0 0 21 15.9a31 31 0 0 0 .5-3.9 31 31 0 0 0-.5-3.9Z"
        strokeWidth="1.7"
      />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  discord: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M8.2 7.2a10.4 10.4 0 0 1 7.6 0M7 18.2c3.3 1.5 6.7 1.5 10 0M8.5 5.2 6.7 5.8C4.9 8.5 4 11.4 4.1 15c1.2 1.4 2.5 2.3 4 3l1-1.4M15.5 5.2l1.8.6c1.8 2.7 2.7 5.6 2.6 9.2-1.2 1.4-2.5 2.3-4 3l-1-1.4"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.96 2H9.36l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.42 4.05H6.57L17.8 19.84Z" />
    </svg>
  ),
  reddit: (
    <svg
      className="scale-125 -translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M16.5 7.5 16 4l-4 1M8.5 9a5 5 0 0 0-3 1.6 2 2 0 1 0 .5 3.9 5 5 0 0 0 12 0 2 2 0 1 0 .5-3.9A5 5 0 0 0 15.5 9c-2.1-.6-4.9-.6-7 0Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 13h.01M15.5 13h.01M10 17c.8.5 3.2.5 4 0"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  email: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" strokeWidth="1.8" />
      <path
        d="m5 8 7 5 7-5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const SoonIcon = ({ name, icon }) => (
  <span
    title={`${name} coming soon`}
    aria-label={`${name} coming soon`}
    className="group relative inline-flex h-20 w-20 items-center justify-center text-zinc-950 transition hover:text-pink-500"
  >
    <span className="h-10 w-10">{socialIcons[icon]}</span>
    <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-950 shadow-lg group-hover:block">
      Coming soon
    </span>
  </span>
);

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-5 py-12 text-zinc-800 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-300 gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xl font-black tracking-wide text-blue-600 sm:text-lg">
              ALLGAMERS<span className="text-pink-500">MARKET</span>
            </p>
          </div>
          <p className="mt-5 max-w-md text-lg leading-10 text-black">
            A Digital marketplace for permitted digital gaming products and
            services. AllGamersMarket is independent Gaming Accounts
            Marketplace.
          </p>
          <span
            title="Discord link coming soon"
            className="mt-12 inline-flex h-16 items-center gap-7 rounded-2xl bg-[#5865f2] px-10 text-lg font-black text-white shadow-lg shadow-[#5865f2]/15"
          >
            <span className="h-9 w-9 text-white">
              <img
                src={discordLogo}
                alt=""
                className="h-9 w-9 object-contain"
              />
            </span>
            <span>Join our Discord</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] uppercase tracking-wider"></span>
          </span>
          <div
            className="mt-5 flex items-center gap-3"
            aria-label="Social and contact links"
          >
            <SoonIcon name="Instagram" icon="instagram" />
            <SoonIcon name="YouTube" icon="youtube" />
            <SoonIcon name="X / Twitter" icon="twitter" />
            <SoonIcon name="Reddit" icon="reddit" />
            <a
              href="mailto:support@allgamersmarket.com"
              title="Email support@allgamersmarket.com"
              aria-label="Email support@allgamersmarket.com"
              className="hidden h-11 w-11 place-items-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-yellow-300 hover:bg-yellow-300 hover:text-zinc-950"
            >
              <span className="h-5 w-5">{socialIcons.email}</span>
            </a>
          </div>
          <p className="mt-8 text-xl text-black">
            Contact us:{" "}
            <a
              href="mailto:support@allgamersmarket.com"
              className="font-semibold text-pink-500 transition hover:text-pink-500"
            >
              support@allgamersmarket.com
            </a>
          </p>
        </div>
        <nav
          className="flex flex-col items-start gap-5 text-xl"
          aria-label="Legal policies"
        >
          <p className="mb-1 text-base font-black uppercase tracking-[0.18em] text-zinc-950">
            Policies
          </p>
          <a href="/terms" className="transition hover:text-[#2563eb]">
            Terms of Service
          </a>
          <a href="/privacy" className="transition hover:text-[#2563eb]">
            Privacy Policy
          </a>
          <a href="/cookies" className="transition hover:text-[#2563eb]">
            Cookie Policy
          </a>
          <a href="/refund-policy" className="transition hover:text-[#2563eb]">
            Refund Policy
          </a>
          <a href="/marketplace-rules" className="transition hover:text-[#2563eb]">
            Marketplace Rules
          </a>
          <a
            href="/account-transfer-risks"
            className="transition hover:text-[#2563eb]"
          >
            Transfer Risks
          </a>
        </nav>
        <nav
          className="flex flex-col items-start gap-3 text-sm"
          aria-label="Help and resources"
        >
          <p className="mb-1 text-base font-black uppercase tracking-[0.16em] text-zinc-950">
            Help & resources
          </p>
          <a href="/support" className=" text-xl transition hover:text-[#2563eb]">
            Support
          </a>
          <a href="/faq" className=" text-xl transition hover:text-[#2563eb]">
            FAQ
          </a>
          <a href="/blog" className=" text-xl transition hover:text-[#2563eb]">
            Blog
          </a>
          <button
            type="button"
            onClick={openCookieSettings}
            className=" text-xl transition hover:text-[#2563eb]"
          >
            Cookie settings
          </button>
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-300 flex-col items-center gap-1 border-t border-zinc-800 pt-6 text-center text-base leading-6 text-zinc-500">
        <span>
          © {new Date().getFullYear()} AllGamersMarket. All rights reserved.
        </span>
      </div>
      <div className="h-2"></div>
    </footer>
  );
}
