import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import supabase from '../lib/supabase';

import '../styles/search.css';


const SEARCH_GAMES = [
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    aliases: 'coc clash clans',
    mark: 'CLASH\nCLANS',
  },

  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    aliases: 'brawl bs',
    mark: 'BRAWL\nSTARS',
  },

  {
    id: 'valorant',
    name: 'Valorant',
    aliases: 'val riot',
    mark: 'VALORANT',
  },

  {
    id: 'clash-royale',
    name: 'Clash Royale',
    aliases: 'cr clash royale',
    mark: 'CLASH\nROYALE',
  },

  {
    id: 'fortnite',
    name: 'Fortnite',
    aliases: 'fn epic',
    mark: 'FORTNITE',
  },

  {
    id: 'pokemon-go',
    name: 'Pokémon GO',
    aliases: 'pokemon pogo',
    mark: 'POKÉMON\nGO',
  },

  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    aliases: 'mlbb mobile legends',
    mark: 'MOBILE\nLEGENDS',
  },

  {
    id: 'free-fire',
    name: 'Free Fire',
    aliases: 'ff garena',
    mark: 'FREE FIRE',
  },

  {
    id: 'hay-day',
    name: 'Hay Day',
    aliases: 'hayday',
    mark: 'HAY DAY',
  },

  {
    id: 'squad-busters',
    name: 'Squad Busters',
    aliases: 'squad busters',
    mark: 'SQUAD\nBUSTERS',
  },
];


function listingKind(listing) {
  const value = String(
    listing.listing_type ||
      listing.category ||
      listing.type ||
      'account'
  ).toLowerCase();

  if (
    ['service', 'boost', 'coaching', 'rank push'].some(
      (term) => value.includes(term)
    )
  ) {
    return 'services';
  }

  if (
    [
      'item',
      'coin',
      'top-up',
      'topup',
      'currency',
      'gem',
      'skin',
    ].some((term) => value.includes(term))
  ) {
    return 'items';
  }

  return 'accounts';
}


export default function MarketplaceSearch() {
  const navigate = useNavigate();

  const searchAreaRef = useRef(null);

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] =
    useState(false);


  /* CLOSE WHEN CLICKING OUTSIDE */

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (
        !searchAreaRef.current?.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      closeOnOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        closeOnOutsideClick
      );
    };
  }, []);


  /* LOAD AVAILABLE LISTINGS */

  const loadInventory = useCallback(async () => {
    setInventoryLoading(true);

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('status', 'available');

    if (!error) {
      setInventory(data || []);
    }

    setInventoryLoading(false);
  }, []);


  /* COUNT LISTING TYPES */

  const counts = useMemo(() => {
    const totals = Object.fromEntries(
      SEARCH_GAMES.map((game) => [
        game.id,
        {
          accounts: 0,
          items: 0,
          services: 0,
        },
      ])
    );

    inventory.forEach((listing) => {
      if (!totals[listing.game_id]) return;

      totals[listing.game_id][
        listingKind(listing)
      ] += 1;
    });

    return totals;
  }, [inventory]);


  /* FILTER GAMES */

  const filteredGames = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return SEARCH_GAMES;
    }

    return SEARCH_GAMES.filter((game) =>
      `${game.name} ${game.aliases}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);


  /* OPEN SEARCH */

  const openSearch = () => {
    setSearchOpen(true);

    loadInventory();
  };


  /* OPEN GAME */

  const openGame = (gameId) => {
    setSearchOpen(false);

    navigate(`/game/${gameId}`);
  };


  /* SEARCH SUBMIT */

  const submitSearch = (event) => {
    event.preventDefault();

    if (
      search.trim() &&
      filteredGames.length
    ) {
      openGame(filteredGames[0].id);

      return;
    }

    openSearch();
  };


  return (
    <div
      ref={searchAreaRef}
      className="marketplace-search"
    >

      {/* SEARCH BAR */}

      <form
        onSubmit={submitSearch}
        className={
          searchOpen
            ? 'marketplace-search-form is-open'
            : 'marketplace-search-form'
        }
      >

        <div className="marketplace-search-input-area">

          {/* SEARCH ICON */}

          <svg
            className="marketplace-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
            />
          </svg>


          {/* INPUT */}

          <input
            type="text"
            value={search}
            onFocus={openSearch}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearchOpen(false);
              }
            }}
            placeholder="Search games, accounts, items..."
            autoComplete="off"
            role="combobox"
            aria-expanded={searchOpen}
            aria-controls="marketplace-search-results"
            className="marketplace-search-input"
          />


          {/* CLEAR SEARCH */}

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="marketplace-search-clear"
            >
              ×
            </button>
          )}

        </div>


        {/* SEARCH BUTTON */}

        <button
          type="submit"
          className="marketplace-search-button"
        >
          SEARCH
        </button>

      </form>


      {/* SEARCH RESULTS */}

      {searchOpen && (
        <div
          id="marketplace-search-results"
          className="marketplace-search-results"
        >

          {filteredGames.length ? (
            filteredGames.map((game) => {
              const gameCounts =
                counts[game.id];

              const shown = (value) =>
                inventoryLoading
                  ? '—'
                  : value;

              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() =>
                    openGame(game.id)
                  }
                  className="marketplace-search-result"
                >

                  {/* GAME MARK */}

                  <span
                    className={
                      `marketplace-game-mark ${game.id}`
                    }
                  >
                    {game.mark}
                  </span>


                  {/* GAME INFORMATION */}

                  <span className="marketplace-game-info">

                    <span className="marketplace-game-name">
                      {game.name}
                    </span>


                    <span className="marketplace-game-counts">

                      <span className="marketplace-count accounts">
                        Accounts

                        <strong>
                          {shown(
                            gameCounts.accounts
                          )}
                        </strong>
                      </span>


                      <span className="marketplace-count items">
                        Items

                        <strong>
                          {shown(
                            gameCounts.items
                          )}
                        </strong>
                      </span>


                      <span className="marketplace-count services">
                        Services

                        <strong>
                          {shown(
                            gameCounts.services
                          )}
                        </strong>
                      </span>

                    </span>

                  </span>


                  {/* ARROW */}

                  <svg
                    className="marketplace-result-arrow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m9 18 6-6-6-6"
                    />
                  </svg>

                </button>
              );
            })
          ) : (

            /* NO RESULTS */

            <div className="marketplace-search-empty">

              <p className="marketplace-search-empty-title">
                No game found
              </p>

              <p className="marketplace-search-empty-text">
                Try another game name.
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
}