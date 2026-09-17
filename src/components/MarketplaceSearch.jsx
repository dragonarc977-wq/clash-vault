import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const SEARCH_GAMES = [
  {
    id: 'clash-of-clans',
    name: 'Clash of Clans',
    aliases: 'coc clash clans',
    mark: 'CLASH\nCLANS',
    markClass: 'from-amber-500 via-yellow-500 to-red-600',
  },
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    aliases: 'brawl bs',
    mark: 'BRAWL\nSTARS',
    markClass: 'from-red-600 via-rose-500 to-amber-400',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    aliases: 'val riot',
    mark: 'VALORANT',
    markClass: 'from-red-500 to-rose-700',
  },
  {
    id: 'clash-royale',
    name: 'Clash Royale',
    aliases: 'cr clash royale',
    mark: 'CLASH\nROYALE',
    markClass: 'from-sky-500 via-blue-600 to-amber-500',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    aliases: 'fn epic',
    mark: 'FORTNITE',
    markClass: 'from-indigo-500 to-violet-700',
  },
  {
    id: 'pokemon-go',
    name: 'Pokémon GO',
    aliases: 'pokemon pogo',
    mark: 'POKÉMON\nGO',
    markClass: 'from-yellow-500 via-sky-500 to-blue-700',
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    aliases: 'mlbb mobile legends',
    mark: 'MOBILE\nLEGENDS',
    markClass: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    aliases: 'ff garena',
    mark: 'FREE FIRE',
    markClass: 'from-orange-500 to-red-600',
  },
  {
    id: 'hay-day',
    name: 'Hay Day',
    aliases: 'hayday',
    mark: 'HAY DAY',
    markClass: 'from-lime-500 to-amber-500',
  },
  {
    id: 'squad-busters',
    name: 'Squad Busters',
    aliases: 'squad busters',
    mark: 'SQUAD\nBUSTERS',
    markClass: 'from-fuchsia-500 to-violet-700',
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
    ['service', 'boost', 'coaching', 'rank push'].some((term) =>
      value.includes(term)
    )
  ) {
    return 'services';
  }

  if (
    ['item', 'coin', 'top-up', 'topup', 'currency', 'gem', 'skin'].some(
      (term) => value.includes(term)
    )
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
  const [inventoryLoading, setInventoryLoading] = useState(false);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!searchAreaRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, []);

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

      totals[listing.game_id][listingKind(listing)] += 1;
    });

    return totals;
  }, [inventory]);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return SEARCH_GAMES;
    }

    return SEARCH_GAMES.filter((game) =>
      `${game.name} ${game.aliases}`.toLowerCase().includes(query)
    );
  }, [search]);

  const openSearch = () => {
    setSearchOpen(true);
    loadInventory();
  };

  const openGame = (gameId) => {
    setSearchOpen(false);
    navigate(`/game/${gameId}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();

    if (search.trim() && filteredGames.length) {
      openGame(filteredGames[0].id);
      return;
    }

    openSearch();
  };

  return (
    <div
      ref={searchAreaRef}
      className="relative w-full max-w-3xl"
    >
      <form
        onSubmit={submitSearch}
        className={`flex h-16 w-full items-center rounded-2xl border bg-white p-2 shadow-[0_16px_45px_rgba(0,0,0,0.08)] transition ${
          searchOpen
            ? 'border-zinc-400 ring-4 ring-zinc-100'
            : 'border-zinc-300'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 px-4 sm:px-5">
          <svg
            className="h-5 w-5 shrink-0 text-zinc-500"
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
            className="min-w-0 flex-1 bg-transparent text-base font-medium text-zinc-950 outline-none placeholder:font-normal placeholder:text-zinc-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="submit"
          className="h-full rounded-xl bg-zinc-950 px-7 text-xs font-black tracking-[0.06em] text-white transition hover:bg-zinc-800 sm:px-9 sm:text-sm"
        >
          SEARCH
        </button>
      </form>

      {searchOpen && (
        <div
          id="marketplace-search-results"
          className="absolute inset-x-0 top-[calc(100%+10px)] z-50 max-h-[460px] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 text-left shadow-2xl shadow-zinc-950/15"
        >
          {filteredGames.length ? (
            filteredGames.map((game) => {
              const gameCounts = counts[game.id];

              const shown = (value) =>
                inventoryLoading ? '—' : value;

              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => openGame(game.id)}
                  className="group grid w-full grid-cols-[42px_minmax(0,1fr)_18px] items-center gap-3 border-b border-zinc-100 px-3 py-3 text-left transition last:border-0 hover:rounded-xl hover:bg-zinc-50 sm:px-4"
                >
                  <span
                    className={`whitespace-pre-line bg-gradient-to-br ${game.markClass} bg-clip-text text-center text-[7px] font-black uppercase leading-[0.82] tracking-[-0.08em] text-transparent`}
                  >
                    {game.mark}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-zinc-950 sm:text-[15px]">
                      {game.name}
                    </span>

                    <span className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
                        Accounts
                        <strong className="font-black">
                          {shown(gameCounts.accounts)}
                        </strong>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
                        Items
                        <strong className="font-black">
                          {shown(gameCounts.items)}
                        </strong>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-700">
                        Services
                        <strong className="font-black">
                          {shown(gameCounts.services)}
                        </strong>
                      </span>
                    </span>
                  </span>

                  <svg
                    className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-700"
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
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-bold text-zinc-900">
                No game found
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                Try another game name.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}