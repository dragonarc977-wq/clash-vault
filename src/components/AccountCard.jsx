import { useNavigate } from 'react-router-dom';

import '../styles/account-card.css';


export default function AccountCard({ account }) {
  const navigate = useNavigate();


  const discount =
    account.original_price &&
    account.original_price > account.price
      ? Math.round(
          (
            (
              account.original_price -
              account.price
            ) /
            account.original_price
          ) * 100
        )
      : null;


  const features = [
    account.town_hall &&
      `TH${account.town_hall}`,

    account.builder_hall &&
      `BH${account.builder_hall}`,

    account.heroes_level &&
      `Heroes ${account.heroes_level}`,

    account.walls_level &&
      `Walls ${account.walls_level}`,
  ].filter(Boolean);


  return (
    <div
      onClick={() =>
        navigate(
          `/account/${account.id}`
        )
      }
      className="account-card"
    >

      {/* IMAGE */}

      <div className="account-card-image-wrap">

        {account.thumbnail_url ||
        account.image_url ? (

          <img
            src={
              account.thumbnail_url ||
              account.image_url
            }
            alt={`TH${account.town_hall} Account`}
            className="account-card-image"
            loading="lazy"
            decoding="async"
          />

        ) : (

          <div className="account-card-image-empty">
            🏰
          </div>

        )}


        {/* BADGES */}

        <div className="account-card-badges">

          {discount > 0 && (

            <span className="account-card-discount">
              -{discount}% OFF
            </span>

          )}


          <span className="account-card-instant">

            <svg
              className="account-card-instant-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>

            Instant

          </span>

        </div>

      </div>


      {/* BODY */}

      <div className="account-card-body">

        <h3 className="account-card-title">
          TH{account.town_hall} Maxed Account
        </h3>


        <p className="account-card-subtitle">

          Level{' '}
          {account.exp_level || 'High'}

          {' • '}

          {account.gems
            ? `${account.gems.toLocaleString()} Gems`
            : '5K+ Gems'}

        </p>


        {/* FEATURES */}

        <div className="account-card-features">

          {features.map(
            (feature, index) => (

              <span
                key={index}
                className="account-card-feature"
              >
                {feature}
              </span>

            )
          )}

        </div>


        {/* FOOTER */}

        <div className="account-card-footer">

          <div className="account-card-price-wrap">

            <span className="account-card-price">
              ₹
              {account.price?.toLocaleString()}
            </span>


            {account.original_price > 0 && (

              <span className="account-card-original-price">
                ₹
                {account.original_price?.toLocaleString()}
              </span>

            )}

          </div>


          <div className="account-card-verified">

            <svg
              className="account-card-verified-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            Verified

          </div>

        </div>

      </div>

    </div>
  );
}