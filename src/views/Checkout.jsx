'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from '../lib/navigation';

import supabase from '../lib/supabase';



const ShieldIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="m9 12 2 2 4-4"
    />
  </svg>
);


const CheckIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      d="m5 12 4 4L19 6"
    />
  </svg>
);


function loadRazorpay() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existing =
      document.querySelector(
        'script[data-razorpay-checkout]'
      );

    if (existing) {
      existing.addEventListener(
        'load',
        () => resolve(true),
        { once: true }
      );

      existing.addEventListener(
        'error',
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script =
      document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.dataset.razorpayCheckout =
      'true';

    script.onload =
      () => resolve(true);

    script.onerror =
      () => resolve(false);

    document.body.appendChild(
      script
    );
  });
}


export default function Checkout() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [
    account,
    setAccount,
  ] = useState(null);

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    paying,
    setPaying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);


  useEffect(() => {
    let active = true;

    const load =
      async () => {
        const [
          {
            data: authData,
          },
          {
            data: listing,
            error: listingError,
          },
        ] =
          await Promise.all([
            supabase.auth.getSession(),

            supabase
              .from('accounts')
              .select(
                'id,title,price,original_price,image_url,thumbnail_url,status,moderation_status,game_id,listing_type'
              )
              .eq('id', id)
              .maybeSingle(),
          ]);

        if (!active) {
          return;
        }

        if (!authData.session?.user) {
          navigate(
            '/login',
            {
              replace: true,
            }
          );

          return;
        }

        setUser(
          authData.session.user
        );

        if (
          listingError ||
          !listing ||
          listing.status !==
            'available' ||
          (
            listing.moderation_status &&
            listing.moderation_status !==
              'approved'
          )
        ) {
          setError(
            'This listing is no longer available for purchase.'
          );
        } else {
          setAccount(listing);
        }

        setLoading(false);
      };

    load();

    return () => {
      active = false;
    };
  }, [id, navigate]);


  const startPayment =
    async () => {
      if (
        paying ||
        !account
      ) {
        return;
      }

      if (!acceptedTerms) {
        setError(
          'Confirm the Terms, Refund Policy and transfer-risk disclosure before paying.'
        );

        return;
      }

      setPaying(true);
      setError('');

      try {
        const [
          {
            data:
              sessionData,
          },
          scriptReady,
        ] =
          await Promise.all([
            supabase.auth.getSession(),
            loadRazorpay(),
          ]);

        const session =
          sessionData.session;

        if (!session?.access_token) {
          navigate('/login');

          return;
        }

        if (!scriptReady) {
          throw new Error(
            'The secure payment window could not load. Check your connection and try again.'
          );
        }

        const orderResponse =
          await fetch(
            '/api/create-order',
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,

                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  accountId:
                    account.id,

                  termsAccepted:
                    true,

                  termsVersion:
                    '2026-09-15',
                }),
            }
          );

        const order =
          await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(
            order.error ||
              'We could not start the payment. Please try again.'
          );
        }

        const checkout =
          new window.Razorpay({
            key:
              order.keyId,

            amount:
              order.amount,

            currency:
              order.currency,

            name:
              'AllGamersMarket',

            description:
              `Purchase: ${
                account.title ||
                'Gaming listing'
              }`.slice(0, 255),

            image:
              `${window.location.origin}/favicon.svg`,

            order_id:
              order.orderId,

            prefill: {
              name:
                user
                  ?.user_metadata
                  ?.full_name ||
                user
                  ?.user_metadata
                  ?.name ||
                '',

              email:
                user?.email ||
                '',

              contact:
                user
                  ?.user_metadata
                  ?.phone ||
                '',
            },

            notes: {
              account_id:
                account.id,

              buyer_id:
                user.id,

              buyer_email:
                user.email ||
                '',
            },

            theme: {
              color:
                '#18181b',

              backdrop_color:
                '#09090bcc',
            },

            modal: {
              backdropclose:
                false,

              ondismiss:
                () =>
                  setPaying(
                    false
                  ),
            },

            handler:
              async (
                payment
              ) => {
                try {
                  const verifyResponse =
                    await fetch(
                      '/api/verify-payment',
                      {
                        method:
                          'POST',

                        headers:
                          {
                            Authorization:
                              `Bearer ${session.access_token}`,

                            'Content-Type':
                              'application/json',
                          },

                        body:
                          JSON.stringify(
                            payment
                          ),
                      }
                    );

                  const result =
                    await verifyResponse.json();

                  if (
                    !verifyResponse.ok ||
                    !result.verified
                  ) {
                    throw new Error(
                      result.error ||
                        'Payment confirmation is still processing.'
                    );
                  }

                  navigate(
                    `/my-orders?payment=${
                      result.fulfilled
                        ? 'success'
                        : 'pending'
                    }`,
                    {
                      replace:
                        true,
                    }
                  );
                } catch {
                  navigate(
                    '/my-orders?payment=pending',
                    {
                      replace:
                        true,
                    }
                  );
                }
              },
          });

        checkout.on(
          'payment.failed',
          (
            response
          ) => {
            setPaying(false);

            setError(
              response.error
                ?.description ||
                'The payment was not completed. No order has been created.'
            );
          }
        );

        checkout.open();
      } catch (
        paymentError
      ) {
        setError(
          paymentError.message ||
            'We could not start the payment. Please try again.'
        );

        setPaying(false);
      }
    };


  if (loading) {
    return (
      <main className="checkout-loading-page">

        <div className="checkout-loading">

          <div className="checkout-loading-title" />

          <div className="checkout-loading-grid">

            <div className="checkout-loading-card" />

            <div className="checkout-loading-card" />

          </div>

        </div>

      </main>
    );
  }


  const image =
    account?.thumbnail_url ||
    account?.image_url;

  const price =
    Number(
      account?.price ||
      0
    );

  const originalPrice =
    Number(
      account?.original_price ||
      0
    );


  return (
    <main className="checkout-page">

      <div className="checkout-container">

        <Link
          to={
            account
              ? `/account/${account.id}`
              : '/'
          }
          className="checkout-back-link"
        >
          ← Back to listing
        </Link>


        <div className="checkout-heading">

          <span className="checkout-heading-icon">
            <ShieldIcon />
          </span>

          <div>

            <p className="checkout-kicker">
              Protected checkout
            </p>

            <h1 className="checkout-title">
              Review and pay
            </h1>

          </div>

        </div>


        {error &&
        !account ? (

          <section className="checkout-unavailable">

            <p className="checkout-unavailable-text">
              {error}
            </p>

            <Link
              to="/"
              className="checkout-unavailable-link"
            >
              Browse available listings
            </Link>

          </section>

        ) : account ? (

          <div className="checkout-grid">

            <section className="checkout-card">

              <h2 className="checkout-card-title">
                Your purchase
              </h2>

              <div className="checkout-product">

                <div className="checkout-product-image-wrap">

                  {image ? (

                    <img
                      src={image}
                      alt=""
                      className="checkout-product-image"
                    />

                  ) : (

                    <div className="checkout-product-placeholder">
                      🎮
                    </div>

                  )}

                </div>


                <div className="checkout-product-info">

                  <p className="checkout-product-meta">
                    {String(
                      account.listing_type ||
                        'account'
                    )}
                    {' · '}
                    {String(
                      account.game_id ||
                        'game'
                    ).replaceAll(
                      '-',
                      ' '
                    )}
                  </p>

                  <h2 className="checkout-product-title">
                    {account.title ||
                      'Gaming listing'}
                  </h2>

                  <p className="checkout-product-id">
                    Listing #
                    {String(
                      account.id
                    )
                      .slice(
                        0,
                        8
                      )
                      .toUpperCase()}
                  </p>

                </div>

              </div>


              <div className="checkout-benefits">

                {[
                  'The price is verified on our server before payment.',
                  'Your order is created only after Razorpay confirms a captured payment.',
                  'Support and tracked delivery remain available from My orders.',
                ].map(
                  (item) => (

                    <div
                      key={item}
                      className="checkout-benefit"
                    >

                      <span className="checkout-benefit-icon">
                        <CheckIcon />
                      </span>

                      <span>
                        {item}
                      </span>

                    </div>

                  )
                )}

              </div>

            </section>


            <aside className="checkout-summary">

              <p className="checkout-total-label">
                Total amount
              </p>

              <div className="checkout-price-row">

                <span className="checkout-price">
                  ₹
                  {price.toLocaleString(
                    'en-IN'
                  )}
                </span>

                {originalPrice >
                  price && (

                  <span className="checkout-original-price">
                    ₹
                    {originalPrice.toLocaleString(
                      'en-IN'
                    )}
                  </span>

                )}

              </div>

              <p className="checkout-charge-note">
                Inclusive of applicable
                charges
              </p>

              <hr className="checkout-divider" />


              {String(
                account.listing_type ||
                  'account'
              ).toLowerCase() ===
                'account' && (

                <div className="checkout-risk">

                  <b>
                    High-risk digital
                    transfer.
                  </b>{' '}

                  Many publishers
                  prohibit account sales
                  and may suspend, close
                  or recover an account.
                  Payment does not
                  override publisher
                  rules.

                </div>

              )}


              <label className="checkout-terms">

                <input
                  type="checkbox"
                  checked={
                    acceptedTerms
                  }
                  onChange={(
                    event
                  ) =>
                    setAcceptedTerms(
                      event.target
                        .checked
                    )
                  }
                  className="checkout-checkbox"
                />

                <span>

                  I am 18+, the publisher
                  permits this
                  transaction, and I
                  agree to the{' '}

                  <Link
                    to="/terms"
                    target="_blank"
                    className="checkout-terms-link"
                  >
                    Terms
                  </Link>

                  ,{' '}

                  <Link
                    to="/refund-policy"
                    target="_blank"
                    className="checkout-terms-link"
                  >
                    Refund Policy
                  </Link>

                  {' '}and{' '}

                  <Link
                    to="/account-transfer-risks"
                    target="_blank"
                    className="checkout-terms-link"
                  >
                    Transfer Risk Disclosure
                  </Link>

                  .

                </span>

              </label>


              <button
                type="button"
                onClick={
                  startPayment
                }
                disabled={
                  paying ||
                  !acceptedTerms
                }
                className="checkout-pay-button"
              >
                {paying
                  ? 'Opening secure payment…'
                  : `Pay ₹${price.toLocaleString(
                      'en-IN'
                    )}`}
              </button>


              <p className="checkout-payment-note">
                Available payment methods
                are shown securely by
                Razorpay. We never
                receive or store your
                card or UPI credentials.
              </p>


              <div className="checkout-encrypted">

                <ShieldIcon />

                <span>
                  Encrypted payment
                </span>

              </div>


              {error && (

                <p className="checkout-error">
                  {error}
                </p>

              )}


              <p className="checkout-acceptance-note">
                Your acceptance is
                required before the
                payment window can open.
              </p>

            </aside>

          </div>

        ) : null}

      </div>

    </main>
  );
}