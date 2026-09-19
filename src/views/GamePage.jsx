'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from '../lib/navigation';
import supabase from '../lib/supabase';

const games = {
  'clash-of-clans': { name: 'Clash of Clans', short: 'COC', description: 'Accounts, gems and progression', levelLabel: 'Town Hall', levels: ['17', '16', '15', '14', '13'] },
  'brawl-stars': { name: 'Brawl Stars', short: 'BRAWL', description: 'Accounts, coins and rare brawlers', levelLabel: 'Trophies', levels: ['70K+', '60K+', '50K+', '40K+', '30K+'] },
  valorant: { name: 'Valorant', short: 'VAL', description: 'Accounts, ranks and premium skins', levelLabel: 'Rank', levels: ['Radiant', 'Immortal', 'Ascendant', 'Diamond', 'Platinum'] },
  'clash-royale': { name: 'Clash Royale', short: 'CR', description: 'Accounts, cards and progression', levelLabel: 'King Level', levels: ['15', '14', '13', '12', '11'] },
  fortnite: { name: 'Fortnite', short: 'FN', description: 'Accounts, skins and V-Bucks', levelLabel: 'Rank', levels: ['Unreal', 'Champion', 'Elite', 'Diamond', 'Platinum'] },
  'pokemon-go': { name: 'Pokémon GO', short: 'POGO', description: 'Accounts, Pokémon and items', levelLabel: 'Level', levels: ['50', '45+', '40+', '35+', '30+'] },
  'mobile-legends': { name: 'Mobile Legends', short: 'MLBB', description: 'Accounts, heroes and diamonds', levelLabel: 'Rank', levels: ['Mythical Glory', 'Mythic', 'Legend', 'Epic', 'Grandmaster'] },
  'free-fire': { name: 'Free Fire', short: 'FF', description: 'Accounts, collections and diamonds', levelLabel: 'Rank', levels: ['Grandmaster', 'Heroic', 'Diamond', 'Platinum', 'Gold'] },
  'hay-day': { name: 'Hay Day', short: 'HAY DAY', description: 'Accounts, farms and coins', levelLabel: 'Level', levels: ['200+', '150+', '100+', '75+', '50+'] },
  'squad-busters': { name: 'Squad Busters', short: 'SQUAD', description: 'Accounts, squads and gold', levelLabel: 'Level', levels: ['50+', '45+', '40+', '35+', '30+'] },
};

const listingTypes = ['All', 'Accounts', 'Items', 'Services'];
const platforms = ['All platforms', 'Android', 'iOS', 'PC', 'PlayStation', 'Xbox'];
const regions = ['All regions', 'Global', 'Asia', 'Europe', 'North America', 'South America'];
const itemCategories = ['All item categories', 'Currency', 'Skin', 'Collectible', 'Bundle', 'Other'];
const serviceCategories = ['All service categories', 'Boosting', 'Coaching', 'Quest completion', 'Top-up', 'Other'];
const deliveryMethods = [['All delivery','All delivery'],['instant','Instant code/details'],['seller_delivery','Seller delivery'],['scheduled','Scheduled service']];
const priceRanges = [
  { id: 'under2500', label: 'Under ₹2,500', matches: (price) => price < 2500 },
  { id: '2500to7500', label: '₹2,500 – ₹7,500', matches: (price) => price >= 2500 && price <= 7500 },
  { id: '7500to15000', label: '₹7,500 – ₹15,000', matches: (price) => price > 7500 && price <= 15000 },
  { id: '15000plus', label: '₹15,000+', matches: (price) => price > 15000 },
];

const SearchIcon = () => (
  <svg
    className="game-ui-icon-20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="m21 21-4.4-4.4M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"
    />
  </svg>
);


const FilterIcon = () => (
  <svg
    className="game-ui-icon-20"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="M4 6h16M7 12h10m-7 6h4"
    />
  </svg>
);


function ListingCard({ account, game }) {
  const navigate = useNavigate();
  const title = account.title || account.name || `${game.name} Account`;
  const type = String(account.listing_type || account.category || 'account').replace(/s$/, '').toLowerCase();
  const category = type.charAt(0).toUpperCase() + type.slice(1);
  const attributes = account.attributes || {};
  const discount = account.original_price > account.price ? Math.round(((account.original_price - account.price) / account.original_price) * 100) : 0;
  const legacyHeroes = String(account.heroes_level || '');
  const legacyHeroNumbers = legacyHeroes.match(/\d+/g) || [];
  const legacyHero = (code, position) => legacyHeroes.match(new RegExp(`${code}\\s*[:=-]?\\s*(\\d+)`, 'i'))?.[1] || legacyHeroNumbers[position];
  const accountStats = type !== 'account' ? [] : account.game_id === 'clash-of-clans' ? [
    { label: 'Town Hall', value: attributes.town_hall || account.town_hall || '—' },
    { label: 'XP', value: attributes.experience_level || account.exp_level || '—' },
    { label: 'Archer Queen', value: attributes.archer_queen || legacyHero('AQ', 1) || '—' },
    { label: 'Grand Warden', value: attributes.grand_warden || legacyHero('GW', 2) || '—' },
  ] : [
    { label: game.levelLabel, value: attributes.rank || account.rank || attributes.level || account.level || account.town_hall },
    { label: 'Experience', value: attributes.experience_level || attributes.account_level || attributes.trainer_level || account.exp_level },
    { label: 'Heroes', value: attributes.heroes_count || attributes.brawlers_count },
  ].filter((stat) => stat.value !== null && stat.value !== undefined && stat.value !== '');

  return (
  <article
    onClick={() => navigate(`/account/${account.id}`)}
    className="listing-card"
  >

    {/* IMAGE */}
    <div className="listing-card-media">

      {account.thumbnail_url || account.image_url ? (
        <img
          src={account.thumbnail_url || account.image_url}
          alt={title}
          className="listing-card-image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <img
          src={`/games/${account.game_id}.png`}
          alt=""
          className="listing-card-image listing-card-image-fallback"
          loading="lazy"
          decoding="async"
        />
      )}

      <div className="listing-card-image-overlay" />


      {/* BADGES */}
      <div className="listing-card-badges">

        <span className="listing-card-category">
          {category}
        </span>

        {discount > 0 && (
          <span className="listing-card-discount">
            -{discount}%
          </span>
        )}

      </div>

    </div>


    {/* CARD CONTENT */}
    <div className="listing-card-body">

      <h2 className="listing-card-title">
        <Link
          to={`/account/${account.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          {title}
        </Link>
      </h2>


      {/* ACCOUNT STATS */}
      {accountStats.length > 0 && (
        <p className="listing-card-stats">
          {accountStats
            .slice(0, 2)
            .filter(
              (stat) =>
                stat.value &&
                stat.value !== '—'
            )
            .map((stat) => {
              const label =
                stat.label === 'Town Hall'
                  ? 'TH'
                  : stat.label;

              return `${label} ${stat.value}`;
            })
            .join(' • ')}
        </p>
      )}


      {/* ITEM QUANTITY */}
      {type === 'item' &&
        attributes.quantity && (
          <div className="listing-extra">
            <span className="listing-extra-badge">
              Qty {attributes.quantity}
            </span>
          </div>
        )}


      {/* SERVICE DELIVERY */}
      {type === 'service' &&
        attributes.estimated_days && (
          <div className="listing-extra">
            <span className="listing-extra-badge">
              Delivery {attributes.estimated_days}{' '}
              day
              {Number(attributes.estimated_days) === 1
                ? ''
                : 's'}
            </span>
          </div>
        )}


      {/* BUY + PRICE */}
      <div className="listing-card-footer">

        <Link
          to={`/account/${account.id}`}
          onClick={(event) => event.stopPropagation()}
          className="listing-buy-button"
        >
          Buy Now
        </Link>


        <p className="listing-price">
          ${Number(account.price || 0).toFixed(0)}
        </p>

      </div>

    </div>

  </article>
);
}

export default function GamePage() {
  const { gameId } = useParams();
  const game = games[gameId];
  const [accounts, setAccounts] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [level, setLevel] = useState('All');
  const [platform, setPlatform] = useState('All platforms');
  const [region, setRegion] = useState('All regions');
  const [delivery, setDelivery] = useState('All delivery');
  const [category, setCategory] = useState('All categories');
  const [serviceTime, setServiceTime] = useState('Any duration');
  const [price, setPrice] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [fullAccess, setFullAccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!showFilters) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowFilters(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [showFilters]);

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      if (!game) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      const { data, error: loadError } = await supabase.from('accounts').select('*').eq('game_id', gameId).eq('status', 'available').order('created_at', { ascending: false });
      if (!active) return;
      if (loadError) setError('We could not load these listings. Please try again.');
      else {
        const listings = data || [];
        setAccounts(listings);
        const sellerIds = [...new Set(listings.map((item) => item.seller_id).filter(Boolean))];
        if (sellerIds.length) {
          const { data: sellerRows } = await supabase.from('public_sellers').select('user_id,display_name,avatar_url,total_sales').in('user_id', sellerIds);
          if (active) setSellers(Object.fromEntries((sellerRows || []).map((seller) => [seller.user_id, seller])));
        } else setSellers({});
      }
      setLoading(false);
    };
    loadListings();

    const channel = supabase
      .channel(`available-listings-${gameId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `game_id=eq.${gameId}` }, (payload) => {
        const listingId = payload.old?.id || payload.new?.id;
        if (!listingId) return;
        if (payload.eventType === 'DELETE' || payload.new?.status !== 'available') {
          setAccounts((current) => current.filter((listing) => listing.id !== listingId));
          return;
        }
        setAccounts((current) => {
          const exists = current.some((listing) => listing.id === listingId);
          return exists ? current.map((listing) => listing.id === listingId ? payload.new : listing) : [payload.new, ...current];
        });
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [game, gameId]);

  const filtered = useMemo(() => {
    let result = [...accounts];
    const query = search.trim().toLowerCase();
    if (query) result = result.filter((item) => [item.title, item.name, item.description, item.rank, item.level, item.town_hall, ...Object.values(item.attributes || {})].some((value) => String(value || '').toLowerCase().includes(query)));
    if (type !== 'All') result = result.filter((item) => String(item.listing_type || item.category || 'Account').toLowerCase() === type.replace(/s$/, '').toLowerCase());
    if (level !== 'All') result = result.filter((item) => String(item.rank ?? item.level ?? item.town_hall ?? '').toLowerCase().includes(level.replace('+', '').toLowerCase()));
    if (platform !== 'All platforms') result = result.filter((item) => String(item.platform || '').toLowerCase() === platform.toLowerCase());
    if (region !== 'All regions') result = result.filter((item) => String(item.region || '').toLowerCase() === region.toLowerCase());
    if (delivery !== 'All delivery') result = result.filter((item) => String(item.delivery_method || (item.instant_delivery ? 'instant' : 'seller_delivery')) === delivery);
    if (type === 'Items' && category !== 'All categories') result = result.filter((item) => item.attributes?.item_category === category);
    if (type === 'Services' && category !== 'All categories') result = result.filter((item) => item.attributes?.service_category === category);
    if (type === 'Services' && serviceTime !== 'Any duration') result = result.filter((item) => {
      const days = Number(item.attributes?.estimated_days || 0);
      return serviceTime === '1 day' ? days <= 1 : serviceTime === 'Up to 3 days' ? days <= 3 : days > 3;
    });
    if (verifiedOnly) result = result.filter((item) => item.verified !== false);
    if (fullAccess) result = result.filter((item) => item.full_email_access === true);
    if (price.length) result = result.filter((item) => price.some((id) => priceRanges.find((range) => range.id === id)?.matches(Number(item.price || 0))));
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return result;
  }, [accounts, category, delivery, fullAccess, level, platform, price, region, search, serviceTime, type, verifiedOnly]);

  const activeFilterCount = [type !== 'All', level !== 'All', platform !== 'All platforms', region !== 'All regions', delivery !== 'All delivery', category !== 'All categories', serviceTime !== 'Any duration', verifiedOnly, fullAccess, price.length > 0].filter(Boolean).length;
  const clearFilters = () => { setType('All'); setLevel('All'); setPlatform('All platforms'); setRegion('All regions'); setDelivery('All delivery'); setCategory('All categories'); setServiceTime('Any duration'); setPrice([]); setVerifiedOnly(false); setFullAccess(false); setSearch(''); };
  

  if (!game) {
  return (
    <main className="game-not-found">

      <div>

        <p className="game-not-found-kicker">
          GAME NOT FOUND
        </p>

        <h1 className="game-not-found-title">
          This marketplace is unavailable.
        </h1>

        <Link
          to="/#games"
          className="game-not-found-link"
        >
          View all games
        </Link>

      </div>

    </main>
  );
}

  return (
  <main className="game-page">
    <section className="game-header">
  <div className="game-header-inner">

    {/* BREADCRUMBS */}
    <div className="game-breadcrumbs">

      <Link to="/">
        Home
      </Link>

      <span>›</span>

      <Link to="/#games">
        Games
      </Link>

      <span>›</span>

      <span className="game-breadcrumb-current">
        {game.name}
      </span>

    </div>


    {/* GAME NAME + IMAGE */}
    <div className="game-identity">

      <img
        src={`/games/${gameId}.png`}
        alt=""
        className="game-icon"
      />

      <div className="game-identity-text">

        <h1 className="game-title">
          {game.name}
        </h1>

        <p className="game-description">
          {game.description}
        </p>

      </div>

    </div>


    {/* LISTING TYPE TABS */}
    <div className="game-tabs">

      {listingTypes.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setType(item);
            setCategory('All categories');
            setLevel('All');
            setServiceTime('Any duration');
            setFullAccess(false);
          }}
          className={
            type === item
              ? 'game-tab active'
              : 'game-tab'
          }
        >
          {item}
        </button>
      ))}

    </div>

  </div>
</section>

    <section className="game-filter-bar">

  <div className="game-filter-inner">

    {/* SEARCH */}
    <label className="game-filter-search">

      <span className="game-filter-search-icon">
        <SearchIcon />
      </span>

      <input
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search listings..."
        className="game-filter-search-input"
      />

    </label>


    {/* LEVEL */}
    {(type === 'All' || type === 'Accounts') && (
      <select
        value={level}
        onChange={(event) =>
          setLevel(event.target.value)
        }
        className="game-filter-select"
      >

        <option value="All">
          {game.levelLabel}
        </option>

        {game.levels.map((item) => (
          <option
            key={item}
            value={item}
          >
            {game.levelLabel} {item}
          </option>
        ))}

      </select>
    )}


    {/* PRICE */}
    <button
      type="button"
      onClick={() => setShowFilters(true)}
      className="game-filter-button"
    >
      Price
      {price.length > 0
        ? ` (${price.length})`
        : ' ▼'}
    </button>


    {/* MORE */}
    <button
      type="button"
      onClick={() => setShowFilters(true)}
      className="game-filter-button game-filter-more"
    >
      More ▼

      {activeFilterCount > 0 && (
        <span className="game-filter-count">
          {activeFilterCount}
        </span>
      )}

    </button>

  </div>

</section>

    <section className="listings-section">

  <div className="listings-section-inner">

    {/* HEADING */}
    <div className="listings-header">

      <h2 className="listings-title">
        Available Accounts
      </h2>

      <p className="listings-result-count">
        {loading
          ? 'Loading…'
          : `${filtered.length} results`}
      </p>

    </div>


    {/* LOADING */}
    {loading ? (

      <div className="listings-grid">

        {[1, 2, 3, 4, 5, 6, 7, 8].map(
          (item) => (
            <div
              key={item}
              className="listing-skeleton"
            />
          )
        )}

      </div>

    ) : error ? (

      /* ERROR */
      <div className="listings-error">
        {error}
      </div>

    ) : filtered.length ? (

      /* LISTINGS */
      <div className="listings-grid">

        {filtered.map((account) => (
          <ListingCard
            key={account.id}
            account={account}
            game={game}
            seller={sellers[account.seller_id]}
          />
        ))}

      </div>

    ) : (

      /* EMPTY STATE */
      <div className="listings-empty">

        <span className="listings-empty-icon">
          <SearchIcon />
        </span>

        <h2 className="listings-empty-title">
          No listings found
        </h2>

        <p className="listings-empty-text">
          Try removing some filters or check again soon.
        </p>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="listings-clear-button"
          >
            Clear filters
          </button>
        )}

      </div>

    )}

  </div>

</section>

    {showFilters && (
  <div
    className="filter-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Listing filters"
    onMouseDown={() => setShowFilters(false)}
  >

    <aside
      className="filter-drawer"
      onMouseDown={(event) =>
        event.stopPropagation()
      }
    >

      {/* HEADER */}
      <div className="filter-drawer-header">

        <div className="filter-drawer-title-area">

          <span className="filter-drawer-title-icon">
            <FilterIcon />
          </span>

          <h2 className="filter-drawer-title">
            Filters
          </h2>

        </div>


        <button
          type="button"
          onClick={() => setShowFilters(false)}
          aria-label="Close filters"
          className="filter-close-button"
        >
          ×
        </button>

      </div>


      {/* FILTER CONTENT */}
      <div className="filter-drawer-content">

        <div className="filter-fields">


          {/* ACCOUNT LEVEL */}
          {(type === 'All' || type === 'Accounts') && (
            <label className="filter-field">

              <span className="filter-label">
                {game.levelLabel}
              </span>

              <select
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className="filter-select"
              >
                <option>
                  All
                </option>

                {game.levels.map((item) => (
                  <option key={item}>
                    {item}
                  </option>
                ))}
              </select>

            </label>
          )}


          {/* ITEM CATEGORY */}
          {type === 'Items' && (
            <label className="filter-field">

              <span className="filter-label filter-label-small">
                Item category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="filter-select"
              >
                <option value="All categories">
                  All item categories
                </option>

                {itemCategories
                  .slice(1)
                  .map((item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ))}
              </select>

            </label>
          )}


          {/* SERVICE FILTERS */}
          {type === 'Services' && (
            <>

              <label className="filter-field">

                <span className="filter-label filter-label-small">
                  Service category
                </span>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="filter-select"
                >
                  <option value="All categories">
                    All service categories
                  </option>

                  {serviceCategories
                    .slice(1)
                    .map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                </select>

              </label>


              <label className="filter-field">

                <span className="filter-label filter-label-small">
                  Completion time
                </span>

                <select
                  value={serviceTime}
                  onChange={(event) =>
                    setServiceTime(event.target.value)
                  }
                  className="filter-select"
                >
                  <option>
                    Any duration
                  </option>

                  <option>
                    1 day
                  </option>

                  <option>
                    Up to 3 days
                  </option>

                  <option>
                    More than 3 days
                  </option>
                </select>

              </label>

            </>
          )}


          {/* PLATFORM */}
          <label className="filter-field">

            <span className="filter-label">
              Platform
            </span>

            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value)
              }
              className="filter-select"
            >
              {platforms.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>

          </label>


          {/* REGION */}
          <label className="filter-field">

            <span className="filter-label">
              Region
            </span>

            <select
              value={region}
              onChange={(event) =>
                setRegion(event.target.value)
              }
              className="filter-select"
            >
              {regions.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </select>

          </label>


          {/* DELIVERY */}
          <label className="filter-field">

            <span className="filter-label">
              Delivery
            </span>

            <select
              value={delivery}
              onChange={(event) =>
                setDelivery(event.target.value)
              }
              className="filter-select"
            >
              {deliveryMethods.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>

          </label>


          {/* PRICE */}
          <div className="filter-field">

            <span className="filter-label">
              Price
            </span>

            <div className="filter-price-grid">

              {priceRanges.map((range) => (
                <label
                  key={range.id}
                  className="filter-price-option"
                >

                  <input
                    type="checkbox"
                    checked={price.includes(range.id)}
                    onChange={() =>
                      setPrice((current) =>
                        current.includes(range.id)
                          ? current.filter(
                              (item) =>
                                item !== range.id
                            )
                          : [
                              ...current,
                              range.id,
                            ]
                      )
                    }
                    className="filter-checkbox"
                  />

                  {range.label}

                </label>
              ))}

            </div>

          </div>

        </div>

      </div>


      {/* FOOTER */}
      <div className="filter-drawer-footer">

        <button
          type="button"
          onClick={clearFilters}
          className="filter-clear-button"
        >
          Clear all
        </button>

        <button
          type="button"
          onClick={() => setShowFilters(false)}
          className="filter-results-button"
        >
          Show {filtered.length} results
        </button>

      </div>

    </aside>

  </div>
)}
        </main>
  );
}