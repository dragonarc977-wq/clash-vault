import discordLogo from '../assets/Discord-Symbol-White.svg';

import '../styles/site-footer.css';


const openCookieSettings = () =>
  window.dispatchEvent(
    new Event(
      'agm:open-cookie-settings'
    )
  );


const socialIcons = {
  instagram: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        strokeWidth="1.8"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
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

      <path
        d="m10 9 5 3-5 3V9Z"
        fill="currentColor"
        stroke="none"
      />
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

      <circle
        cx="9"
        cy="12.2"
        r="1.2"
        fill="currentColor"
        stroke="none"
      />

      <circle
        cx="15"
        cy="12.2"
        r="1.2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),

  twitter: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.25-8.29L2.96 2H9.36l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.42 4.05H6.57L17.8 19.84Z" />
    </svg>
  ),

  reddit: (
    <svg
      className="site-footer-social-reddit"
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
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        strokeWidth="1.8"
      />

      <path
        d="m5 8 7 5 7-5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};


const SoonIcon = ({
  name,
  icon,
}) => (
  <span
    title={`${name} coming soon`}
    aria-label={`${name} coming soon`}
    className="site-footer-social-coming"
  >

    <span className="site-footer-social-icon">
      {socialIcons[icon]}
    </span>


    <span className="site-footer-coming-tooltip">
      Coming soon
    </span>

  </span>
);


export default function SiteFooter() {
  return (
    <footer className="site-footer">

      <div className="site-footer-grid">


        {/* BRAND */}

        <div>

          <p className="site-footer-brand-name">

            ALLGAMERS

            <span className="site-footer-brand-market">
              MARKET
            </span>

          </p>


          <p className="site-footer-description">
            A Digital marketplace for
            permitted digital gaming
            products and services.
            AllGamersMarket is
            independent Gaming Accounts
            Marketplace.
          </p>


          {/* DISCORD */}

          <span
            title="Discord link coming soon"
            className="site-footer-discord"
          >

            <img
              src={discordLogo}
              alt=""
              className="site-footer-discord-logo"
            />


            <span>
              Join our Discord
            </span>

          </span>


          {/* SOCIALS */}

          <div
            className="site-footer-socials"
            aria-label="Social and contact links"
          >

            <SoonIcon
              name="Instagram"
              icon="instagram"
            />

            <SoonIcon
              name="YouTube"
              icon="youtube"
            />

            <SoonIcon
              name="X / Twitter"
              icon="twitter"
            />

            <SoonIcon
              name="Reddit"
              icon="reddit"
            />


            <a
              href="mailto:support@allgamersmarket.com"
              title="Email support@allgamersmarket.com"
              aria-label="Email support@allgamersmarket.com"
              className="site-footer-email-icon-link"
            >

              <span className="site-footer-email-icon">
                {socialIcons.email}
              </span>

            </a>

          </div>


          {/* CONTACT */}

          <p className="site-footer-contact">

            Contact us:{' '}

            <a
              href="mailto:support@allgamersmarket.com"
              className="site-footer-contact-link"
            >
              support@allgamersmarket.com
            </a>

          </p>

        </div>


        {/* POLICIES */}

        <nav
          className="site-footer-nav"
          aria-label="Legal policies"
        >

          <p className="site-footer-nav-title">
            Policies
          </p>


          <a
            href="/terms"
            className="site-footer-link"
          >
            Terms of Service
          </a>


          <a
            href="/privacy"
            className="site-footer-link"
          >
            Privacy Policy
          </a>


          <a
            href="/cookies"
            className="site-footer-link"
          >
            Cookie Policy
          </a>


          <a
            href="/refund-policy"
            className="site-footer-link"
          >
            Refund Policy
          </a>


          <a
            href="/marketplace-rules"
            className="site-footer-link"
          >
            Marketplace Rules
          </a>


          <a
            href="/account-transfer-risks"
            className="site-footer-link"
          >
            Transfer Risks
          </a>

        </nav>


        {/* HELP */}

        <nav
          className="site-footer-nav site-footer-help-nav"
          aria-label="Help and resources"
        >

          <p className="site-footer-nav-title">
            Help & resources
          </p>


          <a
            href="/support"
            className="site-footer-link"
          >
            Support
          </a>


          <a
            href="/faq"
            className="site-footer-link"
          >
            FAQ
          </a>


          <a
            href="/blog"
            className="site-footer-link"
          >
            Blog
          </a>


          <button
            type="button"
            onClick={
              openCookieSettings
            }
            className="site-footer-cookie-button"
          >
            Cookie settings
          </button>

        </nav>

      </div>


      {/* COPYRIGHT */}

      <div className="site-footer-bottom">

        <span>
          ©{' '}
          {new Date().getFullYear()}
          {' '}AllGamersMarket. All
          rights reserved.
        </span>

      </div>


      <div className="site-footer-spacer" />

    </footer>
  );
}