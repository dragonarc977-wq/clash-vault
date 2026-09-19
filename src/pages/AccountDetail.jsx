import '../styles/account-detail.css';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import { accountFieldValue, getAccountFields } from '../lib/listingOptions';

const gameNames = {
  'clash-of-clans': 'Clash of Clans', 'brawl-stars': 'Brawl Stars', valorant: 'Valorant',
  'clash-royale': 'Clash Royale', fortnite: 'Fortnite', 'pokemon-go': 'Pokémon GO',
  'mobile-legends': 'Mobile Legends', 'free-fire': 'Free Fire', 'hay-day': 'Hay Day', 'squad-busters': 'Squad Busters',
};

const ArrowLeft = ({
  className = 'account-icon-20',
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
      d="m15 18-6-6 6-6"
    />
  </svg>
);


const ArrowRight = ({
  className = 'account-icon-20',
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
      d="m9 18 6-6-6-6"
    />
  </svg>
);


const CheckIcon = () => (
  <svg
    className="account-icon-16"
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


const ShieldIcon = () => (
  <svg
    className="account-icon-20"
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


const ChatIcon = () => (
  <svg
    className="account-icon-20"
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


const BoltIcon = () => (
  <svg
    className="account-icon-20"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M13 2 4.5 13H11l-1 9 8.5-12H12l1-8Z" />
  </svg>
);


const UsersIcon = () => (
  <svg
    className="account-icon-20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-11.9a4 4 0 0 1 0 7.75"
    />
  </svg>
);

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      const { data } = await supabase.from('accounts').select('*').eq('id', id).maybeSingle();
      if (!active) return;
      setAccount(data);
      setActiveImage(0);
      setLoading(false);
    };
    loadAccount();

    const channel = supabase
      .channel(`listing-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `id=eq.${id}` }, () => loadAccount())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  const images = useMemo(() => {
    if (!account) return [];
    const gallery = Array.isArray(account.image_urls) ? account.image_urls.filter(Boolean) : [];
    if (account.image_url && !gallery.includes(account.image_url)) gallery.unshift(account.image_url);
    return gallery;
  }, [account]);
  const thumbnails = useMemo(() => {
    if (!account) return [];
    const gallery = Array.isArray(account.thumbnail_urls) ? account.thumbnail_urls.filter(Boolean) : [];
    return images.map((image, index) => gallery[index] || image);
  }, [account, images]);

  if (loading) {
  return (
    <main className="account-detail-loading-page">
      <div className="account-detail-loading">

        <div className="account-detail-loading-back" />

        <div className="account-detail-loading-grid">

          <div className="account-detail-loading-card" />

          <div className="account-detail-loading-card" />

        </div>

      </div>
    </main>
  );
}
  if (!account) {
  return (
    <main className="account-detail-not-found">

      <div>

        <p className="account-detail-not-found-kicker">
          LISTING NOT FOUND
        </p>

        <h1 className="account-detail-not-found-title">
          This listing is unavailable.
        </h1>

        <Link
          to="/"
          className="account-detail-not-found-link"
        >
          Back to games
        </Link>

      </div>

    </main>
  );
}

  const gameName = gameNames[account.game_id] || 'Game account';
  const isAvailable = account.status === 'available';
  const listingType = String(account.listing_type || 'account').replace(/s$/, '').toLowerCase();
  const attributes = account.attributes || {};
  const typeLabel = listingType.charAt(0).toUpperCase() + listingType.slice(1);
  const title = account.title || (listingType === 'item' ? attributes.item_name : listingType === 'service' ? attributes.service_name : account.game_id === 'clash-of-clans' && account.town_hall ? `TH${account.town_hall} Maxed Account` : `${gameName} Account`);
  const previousImage = () => setActiveImage((current) => current === 0 ? images.length - 1 : current - 1);
  const nextImage = () => setActiveImage((current) => current === images.length - 1 ? 0 : current + 1);
  const beginCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setPurchaseError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase.from('accounts').select('id').eq('id', id).eq('status', 'available').maybeSingle();
    if (error || !data) {
      setAccount(null);
      setPurchaseError('This listing is no longer available. Please choose another account.');
      setCheckingOut(false);
      return;
    }
    navigate(`/checkout/${id}`);
  };
  const deliveryLabel = account.delivery_method === 'scheduled' ? 'Scheduled' : account.delivery_method === 'instant' ? 'Instant' : 'Seller delivery';
  const paymentDeliveryText =
    account.delivery_method === 'scheduled'
      ? 'Scheduled delivery after payment'
      : account.delivery_method === 'instant'
        ? 'Instant delivery after payment'
        : 'Seller delivery after payment';
  const stats = listingType === 'item' ? [
    { label: 'Item', value: attributes.item_name || title }, { label: 'Category', value: attributes.item_category || 'Item' }, { label: 'Quantity', value: attributes.quantity || 1 },
    { label: 'Platform', value: account.platform || 'Any' }, { label: 'Region', value: account.region || 'Global' }, { label: 'Delivery', value: deliveryLabel },
  ] : listingType === 'service' ? [
    { label: 'Service', value: attributes.service_name || title }, { label: 'Category', value: attributes.service_category || 'Service' }, { label: 'Completion', value: attributes.estimated_days ? `${attributes.estimated_days} day${Number(attributes.estimated_days) === 1 ? '' : 's'}` : 'Agreed with seller' },
    { label: 'Platform', value: account.platform || 'Any' }, { label: 'Region', value: account.region || 'Global' }, { label: 'Delivery', value: deliveryLabel },
  ] : [
    ...getAccountFields(account.game_id).map((field) => ({ label: field.label, value: accountFieldValue(account, field.key) })).filter((stat) => stat.value !== null && stat.value !== undefined && stat.value !== ''),
    { label: 'Access', value: attributes.access || (account.full_email_access ? 'Full email access' : 'Game login') },
    { label: 'Platform', value: account.platform || 'Any' }, { label: 'Region', value: account.region || 'Global' }, { label: 'Delivery', value: deliveryLabel },
  ];
  const formattedPrice = Number(account.price || 0).toLocaleString('en-IN');
  const hasOriginalPrice = Number(account.original_price) > Number(account.price);

  return (
  <main className="account-page">
    <div className="account-page-container">
        <Link
  to={`/game/${account.game_id || 'clash-of-clans'}`}
  className="account-back-link"
>
  <ArrowLeft className="account-back-icon" />
  Back to {gameName}
</Link>

        <nav
  className="account-breadcrumbs"
  aria-label="Breadcrumb"
>
  <Link to="/">
    Home
  </Link>

  <span>›</span>

  <Link to="/">
    All Games
  </Link>

  <span>›</span>

  <Link
    to={`/game/${account.game_id || 'clash-of-clans'}`}
  >
    {gameName}
  </Link>

  <span>›</span>

  <span>
    {typeLabel}s
  </span>

  <span>›</span>

  <span className="account-breadcrumb-title">
    {title}
  </span>
</nav>

        <header className="account-header">

  {/* BADGES */}
  <div className="account-badges">

    <span className="account-badge account-badge-game">
      {gameName}
    </span>

    <span className="account-badge account-badge-type">
      {typeLabel}
    </span>

    <span
      className={
        isAvailable
          ? 'account-badge account-badge-status available'
          : 'account-badge account-badge-status'
      }
    >
      {isAvailable ? 'Available' : 'Purchased'}
    </span>

  </div>


  {/* TITLE */}
  <h1 className="account-title">
    {title}
  </h1>


  {/* VERIFIED + DELIVERY */}
  <div className="account-meta">

    <span className="account-meta-item">
      <span className="account-meta-verified">
        <ShieldIcon />
      </span>

      Verified Seller
    </span>


    <span className="account-meta-divider" />


    <span className="account-meta-item account-meta-delivery">
      <BoltIcon />

      {deliveryLabel}
    </span>

  </div>

</header>

        <div className="account-main-grid">

<section className="account-gallery-section">
            <div className="account-gallery">

  {images.length ? (
    <img
      key={images[activeImage]}
      src={images[activeImage]}
      alt={`${title} image ${activeImage + 1}`}
      className="account-gallery-image"
      loading="eager"
      decoding="async"
    />
  ) : (
    <div className="account-gallery-empty">

      <span className="account-gallery-empty-icon">
        🎮
      </span>

      <p className="account-gallery-empty-text">
        No image available
      </p>

    </div>
  )}


  {images.length > 1 && (
    <>

      <button
        type="button"
        onClick={previousImage}
        aria-label="Previous image"
        className="account-gallery-nav previous"
      >
        <ArrowLeft />
      </button>

      <button
        type="button"
        onClick={nextImage}
        aria-label="Next image"
        className="account-gallery-nav next"
      >
        <ArrowRight />
      </button>

      <span className="account-gallery-count">
        {activeImage + 1} / {images.length}
      </span>

    </>
  )}

</div>

            {images.length > 1 && (
  <div className="account-thumbnails">

    {images.map((image, index) => (

      <button
        key={`${image}-${index}`}
        type="button"
        onClick={() => setActiveImage(index)}
        className={
          activeImage === index
            ? 'account-thumbnail active'
            : 'account-thumbnail'
        }
        aria-label={`Show image ${index + 1}`}
        aria-current={activeImage === index}
      >
        <img
          src={thumbnails[index]}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </button>

    ))}

  </div>
)}
          </section>

          <aside className="purchase-box">

  {/* PRICE */}
  <div className="purchase-price-row">

    <div>
      <p className="purchase-label">
        Price
      </p>

      <div className="purchase-price-wrap">

        <span className="purchase-price">
          ₹{formattedPrice}
        </span>

        {hasOriginalPrice && (
          <span className="purchase-original-price">
            ₹
            {Number(
              account.original_price
            ).toLocaleString('en-IN')}
          </span>
        )}

      </div>
    </div>


    {/* SECURITY BADGES */}
    <div className="purchase-badges">

      <span className="purchase-badge purchase-badge-secure">
        <ShieldIcon />
        Secure
      </span>

      <span className="purchase-badge purchase-badge-reviewed">
        <CheckIcon />
        Reviewed
      </span>

    </div>

  </div>


  {/* ERROR */}
  {purchaseError && (
    <p className="purchase-error">
      {purchaseError}
    </p>
  )}


  {/* BUY BUTTON */}
  {isAvailable ? (
    <button
      type="button"
      onClick={beginCheckout}
      disabled={checkingOut}
      className="purchase-primary-button"
    >
      {checkingOut
        ? 'Checking availability…'
        : 'Buy now'}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => navigate('/my-orders')}
      className="purchase-order-button"
    >
      Open my order
    </button>
  )}


  {/* ASK QUESTION */}
  <button
    type="button"
    onClick={() => navigate('/support')}
    className="purchase-question-button"
  >
    <ChatIcon />
    Ask a question
  </button>


  {/* TRUST INFORMATION */}
  <div className="purchase-trust-list">

    <div className="purchase-trust-item">
      <span className="purchase-trust-blue">
        <BoltIcon />
      </span>

      {paymentDeliveryText}
    </div>


    <div className="purchase-trust-item">
      <span className="purchase-trust-green">
        <ShieldIcon />
      </span>

      Safe and secure transactions
    </div>


    <div className="purchase-trust-item">
      <span className="purchase-trust-gray">
        <UsersIcon />
      </span>

      Private marketplace support
    </div>

  </div>

</aside>
        </div>

        <div className="account-details-area">

  {/* ACCOUNT DETAILS */}
  <section aria-labelledby="listing-details-heading">

    <div className="account-details-intro">

      <p className="account-details-label">
        Listing information
      </p>

      <h2
        id="listing-details-heading"
        className="account-details-title"
      >
        {typeLabel} details
      </h2>

      <p className="account-details-subtitle">
        Review the important specifications before continuing to checkout.
      </p>

    </div>


    <div className="account-details-grid">

      {stats.map((stat) => (
        <div
          key={stat.label}
          className="account-detail-item"
        >

          <p
            className="account-detail-label"
            title={stat.label}
          >
            {stat.label}
          </p>

          <p className="account-detail-value">
            {stat.value}
          </p>

        </div>
      ))}

    </div>

  </section>


  {/* DESCRIPTION */}
  <section
    aria-labelledby="listing-description-heading"
    className="account-description"
  >

    <p className="account-description-label">
      Seller notes
    </p>

    <h2
      id="listing-description-heading"
      className="account-description-title"
    >
      {typeLabel} description
    </h2>

    <p className="account-description-text">
      {account.description ||
        'A reviewed marketplace listing with clear details and support available throughout your purchase.'}
    </p>

  </section>

</div>
      </div>
    </main>
  );
}
