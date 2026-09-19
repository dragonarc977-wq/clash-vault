'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from '../lib/navigation';

import supabase from '../lib/supabase';



const gameNames = {
  'clash-of-clans': 'Clash of Clans',
  'brawl-stars': 'Brawl Stars',
  valorant: 'Valorant',
  'clash-royale': 'Clash Royale',
  fortnite: 'Fortnite',
  'pokemon-go': 'Pokémon GO',
  'mobile-legends': 'Mobile Legends',
  'free-fire': 'Free Fire',
  'hay-day': 'Hay Day',
  'squad-busters': 'Squad Busters',
};


const ChatIcon = ({
  className = 'seller-chat-icon',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z"
    />
  </svg>
);


export default function SellerProfile() {
  const { sellerId } = useParams();

  const navigate = useNavigate();

  const [seller, setSeller] =
    useState(null);

  const [listings, setListings] =
    useState([]);

  const [viewerId, setViewerId] =
    useState(null);

  const [feedback, setFeedback] =
    useState([]);

  const [
    eligibleOrderId,
    setEligibleOrderId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [type, setType] =
    useState('all');

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [
    coverUploading,
    setCoverUploading,
  ] = useState(false);

  const [notice, setNotice] =
    useState('');

  const [
    showFeedback,
    setShowFeedback,
  ] = useState(false);

  const feedbackDialog =
    useRef(null);


  useEffect(() => {
    if (!showFeedback) {
      return;
    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      'hidden';


    feedbackDialog.current?.showModal();


    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [showFeedback]);


  useEffect(() => {
    let active = true;


    (async () => {
      const [
        { data: sellerData },
        { data: listingData },
        { data: sessionData },
        { data: feedbackData },
      ] = await Promise.all([
        supabase
          .from('public_sellers')
          .select('*')
          .eq('user_id', sellerId)
          .maybeSingle(),

        supabase
          .from('accounts')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('status', 'available')
          .order('created_at', {
            ascending: false,
          }),

        supabase.auth.getSession(),

        supabase
          .from(
            'public_seller_feedback'
          )
          .select('*')
          .eq('seller_id', sellerId)
          .order('created_at', {
            ascending: false,
          }),
      ]);


      if (!active) {
        return;
      }


      const currentUser =
        sessionData?.session?.user ||
        null;


      setSeller(
        sellerData || null
      );

      setListings(
        listingData || []
      );

      setFeedback(
        feedbackData || []
      );

      setViewerId(
        currentUser?.id || null
      );


      if (
        currentUser &&
        currentUser.id !== sellerId
      ) {
        const [
          { data: purchases },
          { data: ownFeedback },
        ] = await Promise.all([
          supabase
            .from('orders')
            .select('id')
            .eq(
              'seller_id',
              sellerId
            )
            .eq(
              'buyer_id',
              currentUser.id
            )
            .in('status', [
              'delivered',
              'completed',
            ]),

          supabase
            .from(
              'seller_feedback'
            )
            .select('order_id')
            .eq(
              'seller_id',
              sellerId
            )
            .eq(
              'buyer_id',
              currentUser.id
            ),
        ]);


        const reviewed =
          new Set(
            (
              ownFeedback || []
            ).map(
              (item) =>
                item.order_id
            )
          );


        if (active) {
          setEligibleOrderId(
            (
              purchases || []
            ).find(
              (item) =>
                !reviewed.has(
                  item.id
                )
            )?.id || null
          );
        }
      }


      setLoading(false);
    })();


    return () => {
      active = false;
    };
  }, [sellerId]);


  const shownListings =
    useMemo(
      () =>
        type === 'all'
          ? listings
          : listings.filter(
              (item) =>
                String(
                  item.listing_type ||
                    'account'
                ) === type
            ),
      [listings, type]
    );


  const startChat = () => {
    if (viewerId === sellerId) {
      navigate('/seller-chat');

      return;
    }


    if (!listings.length) {
      return;
    }


    navigate(
      `/seller-chat/${listings[0].id}`
    );
  };


  const uploadCover = async (
    event
  ) => {
    const file =
      event.target.files?.[0];


    event.target.value = '';


    if (!file) {
      return;
    }


    setNotice('');


    if (
      ![
        'image/jpeg',
        'image/png',
        'image/webp',
      ].includes(file.type) ||
      file.size >
        5 * 1024 * 1024
    ) {
      setNotice(
        'Cover picture must be JPG, PNG or WebP and smaller than 5 MB.'
      );

      return;
    }


    setCoverUploading(true);


    const path =
      `${viewerId}/cover-picture`;


    const bucket =
      supabase.storage.from(
        'seller-covers'
      );


    const {
      error: uploadError,
    } =
      await bucket.upload(
        path,
        file,
        {
          upsert: true,
          contentType:
            file.type,
          cacheControl:
            '3600',
        }
      );


    if (uploadError) {
      setNotice(
        uploadError.message
      );

      setCoverUploading(
        false
      );

      return;
    }


    const coverUrl =
      `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;


    const { error } =
      await supabase
        .from(
          'seller_profiles'
        )
        .update({
          cover_url:
            coverUrl,
        })
        .eq(
          'user_id',
          viewerId
        );


    if (error) {
      setNotice(
        error.message
      );
    } else {
      setSeller(
        (current) => ({
          ...current,
          cover_url:
            coverUrl,
        })
      );

      setNotice(
        'Cover picture updated.'
      );
    }


    setCoverUploading(false);
  };


  const submitFeedback = async (
    event
  ) => {
    event.preventDefault();


    if (
      !eligibleOrderId ||
      !viewerId
    ) {
      return;
    }


    setSaving(true);

    setNotice('');


    const { data, error } =
      await supabase
        .from('seller_feedback')
        .insert({
          order_id:
            eligibleOrderId,

          seller_id:
            sellerId,

          buyer_id:
            viewerId,

          rating,

          comment:
            comment.trim() ||
            null,
        })
        .select()
        .single();


    if (error) {
      setNotice(
        error.message
      );
    } else {
      setFeedback(
        (current) => [
          data,
          ...current,
        ]
      );


      setEligibleOrderId(null);

      setComment('');


      setNotice(
        'Thank you. Your feedback is now visible.'
      );


      const {
        data: refreshedSeller,
      } =
        await supabase
          .from(
            'public_sellers'
          )
          .select('*')
          .eq(
            'user_id',
            sellerId
          )
          .maybeSingle();


      if (refreshedSeller) {
        setSeller(
          refreshedSeller
        );
      }
    }


    setSaving(false);
  };


  if (loading) {
    return (
      <main className="seller-profile-loading-page">

        <div className="seller-profile-loading">

          <div className="seller-profile-loading-cover" />

          <div className="seller-profile-loading-body" />

        </div>

      </main>
    );
  }


  if (!seller) {
    return (
      <main className="seller-profile-not-found">

        <div>

          <p className="seller-profile-not-found-label">
            SELLER NOT FOUND
          </p>


          <h1 className="seller-profile-not-found-title">
            This seller profile is
            unavailable.
          </h1>


          <Link
            to="/"
            className="seller-profile-home-link"
          >
            Return home
          </Link>

        </div>

      </main>
    );
  }


  return (
    <main className="seller-profile-page">

      <div className="seller-profile-container">


        {/* PROFILE */}

        <section className="seller-public-card">

          <div className="seller-public-cover">

            {seller.cover_url ? (

              <img
                src={
                  seller.cover_url
                }
                alt=""
                className="seller-public-cover-image"
              />

            ) : (

              <div className="seller-public-cover-fallback" />

            )}


            <div className="seller-public-cover-overlay" />


            {viewerId ===
              sellerId && (

              <label className="seller-public-cover-button">

                <span>
                  {coverUploading
                    ? 'Uploading…'
                    : seller.cover_url
                      ? 'Change cover'
                      : 'Add cover picture'}
                </span>


                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    coverUploading
                  }
                  onChange={
                    uploadCover
                  }
                  className="seller-profile-hidden-input"
                />

              </label>

            )}

          </div>


          <div className="seller-public-info">

            <div className="seller-public-identity">

              <span className="seller-public-avatar">

                {seller.avatar_url ? (

                  <img
                    src={
                      seller.avatar_url
                    }
                    alt={`${seller.display_name} profile`}
                  />

                ) : (

                  seller.display_name
                    .charAt(0)
                    .toUpperCase()

                )}

              </span>


              <div className="seller-public-details">

                <h1 className="seller-public-name">
                  {seller.display_name}
                </h1>


                <div className="seller-public-meta">

                  <span className="seller-public-verified">
                    ✓ Verified
                  </span>


                  <span className="seller-public-orders">
                    {Number(
                      seller.total_sales ||
                        0
                    ).toLocaleString(
                      'en-IN'
                    )}{' '}
                    orders
                  </span>

                </div>

              </div>

            </div>


            <div className="seller-public-actions">

              <button
                type="button"
                onClick={() =>
                  setShowFeedback(true)
                }
                className="seller-rating-button"
              >

                <span className="seller-rating-main">

                  <span className="seller-rating-label">
                    Seller rating
                  </span>


                  <span className="seller-rating-value">

                    <span className="seller-rating-star">
                      ★
                    </span>{' '}

                    {Number(
                      seller.feedback_count
                    ) > 0
                      ? `${seller.average_rating} / 5`
                      : 'No ratings yet'}

                  </span>

                </span>


                <span className="seller-rating-feedback">

                  <span className="seller-rating-feedback-title">
                    Feedback
                  </span>


                  <span className="seller-rating-feedback-count">
                    {Number(
                      seller.feedback_count ||
                        0
                    )}{' '}
                    reviews →
                  </span>

                </span>

              </button>


              <button
                type="button"
                disabled={
                  !listings.length &&
                  viewerId !== sellerId
                }
                onClick={startChat}
                className="seller-chat-button"
              >

                <ChatIcon />

                Live chat

              </button>

            </div>

          </div>

        </section>


        {notice && (

          <div className="seller-profile-notice">
            {notice}
          </div>

        )}


        {/* LISTINGS */}

        <section className="seller-listings-section">

          <div className="seller-listings-heading-row">

            <div>

              <h2 className="seller-listings-title">
                Seller listings
              </h2>


              <p className="seller-listings-count">
                {shownListings.length}{' '}
                available across all
                games
              </p>

            </div>


            <div className="seller-listing-tabs">

              {[
                ['all', 'All'],
                [
                  'account',
                  'Accounts',
                ],
                ['item', 'Items'],
                [
                  'service',
                  'Services',
                ],
              ].map(
                ([id, label]) => (

                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setType(id)
                    }
                    className={
                      type === id
                        ? 'seller-listing-tab active'
                        : 'seller-listing-tab'
                    }
                  >
                    {label}
                  </button>

                )
              )}

            </div>

          </div>


          {shownListings.length ? (

            <div className="seller-listings-table">

              <div className="seller-listings-table-head">

                <span>
                  Product
                </span>

                <span>
                  Price
                </span>

                <span />

              </div>


              <ul className="seller-listings-list">

                {shownListings.map(
                  (listing) => {

                    const productType =
                      listing.listing_type ||
                      'account';


                    const productName =
                      listing.title ||
                      listing.name ||
                      `${
                        gameNames[
                          listing
                            .game_id
                        ] || 'Game'
                      } ${productType}`;


                    return (
                      <li key={listing.id}>

                        <Link
                          to={`/account/${listing.id}`}
                          className="seller-listing-link"
                        >

                          <div className="seller-listing-product">

                            <img
                              src={
                                listing.thumbnail_url ||
                                listing.image_url ||
                                `/games/${listing.game_id}.png`
                              }
                              alt=""
                              loading="lazy"
                              className="seller-listing-thumbnail"
                            />


                            <div className="seller-listing-copy">

                              <p className="seller-listing-game">

                                {gameNames[
                                  listing
                                    .game_id
                                ] ||
                                  'Game'}

                                {' · '}

                                <span className="seller-listing-type">
                                  {
                                    productType
                                  }
                                </span>

                              </p>


                              <h3 className="seller-listing-name">
                                {productName}
                              </h3>


                              <p className="seller-listing-detail">

                                {[
                                  listing.region,
                                  listing.platform,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ' · '
                                  ) ||
                                  'Available'}

                              </p>

                            </div>

                          </div>


                          <div className="seller-listing-price-block">

                            <p className="seller-listing-price">

                              ₹
                              {Number(
                                listing.price ||
                                  0
                              ).toLocaleString(
                                'en-IN'
                              )}

                            </p>


                            {listing.original_price >
                              listing.price && (

                              <p className="seller-listing-original-price">

                                ₹
                                {Number(
                                  listing.original_price
                                ).toLocaleString(
                                  'en-IN'
                                )}

                              </p>

                            )}

                          </div>


                          <span className="seller-listing-view">
                            View listing →
                          </span>

                        </Link>

                      </li>
                    );
                  }
                )}

              </ul>

            </div>

          ) : (

            <div className="seller-listings-empty">

              <h3 className="seller-listings-empty-title">
                No listings here yet
              </h3>


              <p className="seller-listings-empty-text">
                Try another product type.
              </p>

            </div>

          )}

        </section>


        {/* FEEDBACK */}

        {showFeedback && (

          <dialog
            ref={feedbackDialog}
            onClose={() =>
              setShowFeedback(false)
            }
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowFeedback(
                  false
                );
              }
            }}
            className="seller-feedback-dialog"
          >

            <div className="seller-feedback-header">

              <h2 className="seller-feedback-header-title">
                Ratings & feedback
              </h2>


              <button
                autoFocus
                type="button"
                onClick={() =>
                  setShowFeedback(
                    false
                  )
                }
                aria-label="Close feedback"
                className="seller-feedback-close"
              >
                ×
              </button>

            </div>


            {notice && (

              <p
                role="status"
                className="seller-feedback-dialog-notice"
              >
                {notice}
              </p>

            )}


            <div className="seller-feedback-grid">

              <div className="seller-feedback-card">

                <p className="seller-feedback-kicker">
                  Seller rating
                </p>


                <div className="seller-feedback-score-row">

                  <span className="seller-feedback-score">

                    {seller.feedback_count
                      ? seller.average_rating
                      : '—'}

                  </span>


                  {seller.feedback_count ? (

                    <span className="seller-feedback-score-star">
                      ★ / 5
                    </span>

                  ) : (

                    <span className="seller-feedback-new">
                      New seller
                    </span>

                  )}

                </div>


                <p className="seller-feedback-summary">

                  Based on{' '}
                  {Number(
                    seller.feedback_count ||
                      0
                  ).toLocaleString(
                    'en-IN'
                  )}{' '}
                  completed-order
                  feedback.

                </p>


                {eligibleOrderId && (

                  <form
                    onSubmit={
                      submitFeedback
                    }
                    className="seller-feedback-form"
                  >

                    <h3 className="seller-feedback-form-title">
                      Leave feedback
                    </h3>


                    <p className="seller-feedback-form-copy">
                      Only buyers with a
                      completed order can
                      post.
                    </p>


                    <div className="seller-feedback-stars">

                      {[
                        1,
                        2,
                        3,
                        4,
                        5,
                      ].map(
                        (value) => (

                          <button
                            key={
                              value
                            }
                            type="button"
                            onClick={() =>
                              setRating(
                                value
                              )
                            }
                            aria-label={`${value} stars`}
                            className={
                              value <=
                              rating
                                ? 'seller-feedback-star-button active'
                                : 'seller-feedback-star-button inactive'
                            }
                          >
                            ★
                          </button>

                        )
                      )}

                    </div>


                    <textarea
                      value={comment}
                      onChange={(
                        event
                      ) =>
                        setComment(
                          event
                            .target
                            .value
                        )
                      }
                      minLength="3"
                      maxLength="500"
                      rows="3"
                      placeholder="Share your experience…"
                      className="seller-feedback-textarea"
                    />


                    <button
                      disabled={
                        saving
                      }
                      className="seller-feedback-submit"
                    >

                      {saving
                        ? 'Posting…'
                        : 'Post feedback'}

                    </button>

                  </form>

                )}

              </div>


              <div className="seller-feedback-card">

                <div className="seller-feedback-list-header">

                  <h2 className="seller-feedback-list-title">
                    Buyer feedback
                  </h2>


                  <span className="seller-feedback-list-count">
                    {feedback.length}{' '}
                    reviews
                  </span>

                </div>


                {feedback.length ? (

                  <div className="seller-feedback-list">

                    {feedback.map(
                      (item) => (

                        <article
                          key={
                            item.id
                          }
                          className="seller-feedback-item"
                        >

                          <div className="seller-feedback-item-head">

                            <span className="seller-feedback-buyer">
                              Verified buyer
                            </span>


                            <span className="seller-feedback-stars-display">

                              {'★'.repeat(
                                item.rating
                              )}

                              <span className="seller-feedback-stars-empty">
                                {'★'.repeat(
                                  5 -
                                    item.rating
                                )}
                              </span>

                            </span>

                          </div>


                          {item.comment && (

                            <p className="seller-feedback-comment">
                              {
                                item.comment
                              }
                            </p>

                          )}


                          <p className="seller-feedback-date">

                            {new Intl.DateTimeFormat(
                              'en',
                              {
                                day: 'numeric',
                                month:
                                  'short',
                                year: 'numeric',
                              }
                            ).format(
                              new Date(
                                item.created_at
                              )
                            )}

                          </p>

                        </article>

                      )
                    )}

                  </div>

                ) : (

                  <div className="seller-feedback-empty">

                    <p className="seller-feedback-empty-title">
                      No feedback yet
                    </p>


                    <p className="seller-feedback-empty-text">
                      Completed buyers
                      can leave the first
                      review.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </dialog>

        )}

      </div>

    </main>
  );
}