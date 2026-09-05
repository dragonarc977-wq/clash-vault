import { useNavigate } from 'react-router-dom';

export default function AccountCard({ account }) {
  const navigate = useNavigate();

  const discount =
    account.original_price && account.original_price > account.price
      ? Math.round(
          ((account.original_price - account.price) / account.original_price) * 100
        )
      : null;

  const features = [
    account.town_hall && `TH${account.town_hall}`,
    account.builder_hall && `BH${account.builder_hall}`,
    account.heroes_level && `Heroes ${account.heroes_level}`,
    account.walls_level && `Walls ${account.walls_level}`,
  ].filter(Boolean);

  return (
    <div
      onClick={() => navigate(`/account/${account.id}`)}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/10 group"
    >
      {/* Image */}
      <div className="relative h-48 bg-zinc-800 overflow-hidden">
        {account.image_url ? (
          <img
            src={account.image_url}
            alt={`TH${account.town_hall} Account`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🏰
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              -{discount}% OFF
            </span>
          )}
          <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ml-auto">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1">
          TH{account.town_hall} Maxed Account
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          Level {account.exp_level || 'High'} •{' '}
          {account.gems ? `${account.gems.toLocaleString()} Gems` : '5K+ Gems'}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-5">
          {features.map((f, i) => (
            <span
              key={i}
              className="bg-zinc-800 text-zinc-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-zinc-700"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-yellow-400">
              ₹{account.price?.toLocaleString()}
            </span>
            {account.original_price > 0 && (
              <span className="text-sm text-zinc-500 line-through">
                ₹{account.original_price?.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verified
          </div>
        </div>
      </div>
    </div>
  );
}