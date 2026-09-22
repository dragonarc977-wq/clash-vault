'use client';

import {
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  Link,
} from './lib/navigation';


const STORAGE_KEY =
  'agm_cookie_consent_v1';

const CONSENT_EVENT =
  'agm:cookie-consent';


function readStoredConsent() {
  if (
    typeof window === 'undefined'
  ) {
    return null;
  }

  try {
    return localStorage.getItem(
      STORAGE_KEY,
    );
  } catch {
    return null;
  }
}


function subscribe(callback) {
  if (
    typeof window === 'undefined'
  ) {
    return () => {};
  }

  const update = () => {
    callback();
  };

  window.addEventListener(
    CONSENT_EVENT,
    update,
  );

  window.addEventListener(
    'storage',
    update,
  );

  return () => {
    window.removeEventListener(
      CONSENT_EVENT,
      update,
    );

    window.removeEventListener(
      'storage',
      update,
    );
  };
}


function getSnapshot() {
  return readStoredConsent();
}


function getServerSnapshot() {
  return null;
}


export default function CookieBanner() {
  const storedConsent =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

  const [
    manage,
    setManage,
  ] = useState(false);


  useEffect(() => {
    const open = () => {
      setManage(true);
    };

    window.addEventListener(
      'agm:open-cookie-settings',
      open,
    );

    return () => {
      window.removeEventListener(
        'agm:open-cookie-settings',
        open,
      );
    };
  }, []);


  function save(optional) {
    const next = {
      necessary: true,
      optional,
      savedAt:
        new Date().toISOString(),
      version: 1,
    };


    /*
     * Close the settings immediately.
     * Even if storage fails,
     * the click itself still works.
     */
    setManage(false);


    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next),
      );

      localStorage.removeItem(
        'cookiesAccepted',
      );
    } catch (error) {
      console.error(
        'Unable to save cookie consent:',
        error,
      );
    }


    window.dispatchEvent(
      new CustomEvent(
        CONSENT_EVENT,
        {
          detail: next,
        },
      ),
    );
  }


  /*
   * Consent already exists.
   * Keep banner hidden unless
   * Cookie Settings was opened.
   */
  if (
    storedConsent &&
    !manage
  ) {
    return null;
  }


  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
    >

      <div className="cookie-banner-card">


        {/* MAIN */}

        <div className="cookie-banner-main">

          <div>

            <h2 className="cookie-banner-title">
              Your privacy choices
            </h2>


            <p className="cookie-banner-description">

              We use necessary browser
              storage for sign-in,
              security and your
              preferences. Optional
              cookies are off unless you
              accept them. Read our{' '}

              <Link
                to="/cookies"
                className="cookie-banner-link"
              >
                Cookie Policy
              </Link>

              {' '}and{' '}

              <Link
                to="/privacy"
                className="cookie-banner-link"
              >
                Privacy Policy
              </Link>

              .

            </p>

          </div>


          {/* ACTIONS */}

          <div className="cookie-banner-actions">

            <button
              type="button"
              onClick={() =>
                setManage(
                  (value) =>
                    !value,
                )
              }
              className="cookie-banner-button cookie-banner-manage"
            >
              Manage
            </button>


            <button
              type="button"
              onClick={() =>
                save(false)
              }
              className="cookie-banner-button cookie-banner-reject"
            >
              Reject optional
            </button>


            <button
              type="button"
              onClick={() =>
                save(true)
              }
              className="cookie-banner-button cookie-banner-accept"
            >
              Accept all
            </button>

          </div>

        </div>


        {/* SETTINGS */}

        {manage && (

          <div className="cookie-banner-settings">


            {/* NECESSARY */}

            <div className="cookie-banner-option">

              <div className="cookie-banner-option-header">

                <b className="cookie-banner-option-title">
                  Necessary
                </b>


                <span className="cookie-banner-option-status cookie-banner-option-status-required">
                  Always on
                </span>

              </div>


              <p className="cookie-banner-option-text">
                Required for
                authentication, fraud
                prevention, theme and
                consent settings.
              </p>

            </div>


            {/* OPTIONAL */}

            <div className="cookie-banner-option">

              <div className="cookie-banner-option-header">

                <b className="cookie-banner-option-title">
                  Optional analytics
                </b>


                <span className="cookie-banner-option-status cookie-banner-option-status-choice">
                  Your choice
                </span>

              </div>


              <p className="cookie-banner-option-text">
                Permits
                privacy-respecting
                usage analytics if we
                enable them. Advertising
                cookies are not used.
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}