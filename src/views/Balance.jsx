'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from '../lib/navigation';

import supabase from '../lib/supabase';



const WalletIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      d="M4 6.5h15.5v12H4v-12Zm0 3h15.5M15 14h2"
    />
  </svg>
);


const ClockIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      strokeWidth="1.7"
    />

    <path
      strokeLinecap="round"
      strokeWidth="1.7"
      d="M12 7v5l3 2"
    />
  </svg>
);


export default function Balance() {
  const navigate = useNavigate();

  const [
    currency,
    setCurrency,
  ] = useState('INR');

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    let active = true;


    const loadBuyer =
      async () => {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();


        if (!active) {
          return;
        }


        if (!session?.user) {
          navigate('/login');

          return;
        }


        setCurrency(
          session.user.user_metadata
            ?.currency ||
          localStorage.getItem(
            'clashvault_currency'
          ) ||
          'INR'
        );


        setLoading(false);
      };


    loadBuyer();


    return () => {
      active = false;
    };
  }, [navigate]);


  const symbol =
    currency === 'USD'
      ? '$'
      : '₹';


  if (loading) {
    return (
      <main className="balance-loading-page">

        <div className="balance-loading">

          <div className="balance-loading-title" />

          <div className="balance-loading-card" />

        </div>

      </main>
    );
  }


  return (
    <main className="balance-page">

      <div className="balance-container">


        {/* HEADER */}

        <div className="balance-header">

          <div>

            <p className="balance-kicker">
              Buyer account
            </p>


            <h1 className="balance-title">
              My balance
            </h1>


            <p className="balance-subtitle">
              View your AllGamersMarket
              credit and balance activity.
            </p>

          </div>


          <Link
            to="/dashboard"
            className="balance-settings-link"
          >
            Account settings
          </Link>

        </div>


        {/* BALANCE CARDS */}

        <div className="balance-cards">


          {/* AVAILABLE */}

          <section className="balance-card balance-card-dark">

            <div className="balance-card-glow" />


            <div className="balance-card-top">

              <span className="balance-icon balance-icon-dark">
                <WalletIcon />
              </span>


              <span className="balance-currency-badge">
                {currency}
              </span>

            </div>


            <div className="balance-card-content">

              <p className="balance-card-label">
                Available balance
              </p>


              <p className="balance-amount">
                {symbol}0.00
              </p>


              <p className="balance-card-description">
                Account credit can be
                applied to eligible
                purchases at checkout.
              </p>

            </div>

          </section>


          {/* PENDING */}

          <section className="balance-card balance-card-light">

            <div className="balance-card-top">

              <span className="balance-icon balance-icon-light">
                <ClockIcon />
              </span>


              <span className="balance-pending-badge">
                PENDING
              </span>

            </div>


            <div className="balance-card-content">

              <p className="balance-card-label">
                Pending balance
              </p>


              <p className="balance-amount">
                {symbol}0.00
              </p>


              <p className="balance-card-description">
                Approved refunds or
                promotional credit will
                appear here while being
                processed.
              </p>

            </div>

          </section>

        </div>


        {/* ACTIVITY */}

        <section className="balance-activity">

          <div className="balance-activity-header">

            <h2 className="balance-section-title">
              Balance activity
            </h2>


            <p className="balance-section-subtitle">
              Credits and balance
              payments will appear here.
            </p>

          </div>


          <div className="balance-empty">

            <span className="balance-empty-icon">
              <WalletIcon />
            </span>


            <h3 className="balance-empty-title">
              No balance activity
            </h3>


            <p className="balance-empty-text">
              You do not have any
              credits, refunds, or
              balance payments yet.
            </p>

          </div>

        </section>


        {/* SUPPORT */}

        <div className="balance-support">

          <div>

            <h2 className="balance-support-title">
              Questions about your
              balance?
            </h2>


            <p className="balance-support-text">
              Our support team can help
              with credits and refunds.
            </p>

          </div>


          <Link
            to="/support"
            className="balance-support-link"
          >
            Contact support
          </Link>

        </div>

      </div>

    </main>
  );
}