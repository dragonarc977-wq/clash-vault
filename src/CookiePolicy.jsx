import PolicyPage, { Section } from './components/PolicyPage';

export default function CookiePolicy() {
  return <PolicyPage title="Cookie Policy" summary="Necessary storage is always used. Optional analytics are disabled unless you choose Accept all, and we do not use advertising cookies.">
    <Section title="What we store"><p>AllGamersMarket and its service providers may use cookies or similar browser storage. Necessary storage keeps you signed in, protects checkout, remembers theme/language and records your privacy choice. Cloudflare may place short-lived security data to detect bots and attacks. Razorpay may use storage when you open its hosted payment window.</p></Section>
    <Section title="Optional analytics"><p>Optional analytics help measure site usage. They must not load unless permitted by your saved choice where consent is required. The current site does not use advertising or cross-site profiling cookies.</p></Section>
    <Section title="Control and expiry"><p>Select Accept all, Reject optional, or Manage in the consent panel. You can reopen it at any time using “Cookie settings” in the footer. Browser controls can also clear or block storage, but blocking necessary storage may break login or checkout. Consent preferences remain until cleared or replaced by a new version.</p></Section>
  </PolicyPage>;
}
