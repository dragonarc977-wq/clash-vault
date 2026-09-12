export const marketplaceGames = [
  ['clash-of-clans', 'Clash of Clans'], ['brawl-stars', 'Brawl Stars'], ['valorant', 'Valorant'],
  ['clash-royale', 'Clash Royale'], ['fortnite', 'Fortnite'], ['pokemon-go', 'Pokémon GO'],
  ['mobile-legends', 'Mobile Legends'], ['free-fire', 'Free Fire'], ['hay-day', 'Hay Day'],
  ['squad-busters', 'Squad Busters'],
];

const number = (key, label, placeholder, required = false) => ({ key, label, placeholder, required, type: 'number' });
const text = (key, label, placeholder, required = false) => ({ key, label, placeholder, required, type: 'text' });

export const accountFieldsByGame = {
  'clash-of-clans': [number('town_hall', 'Town Hall level', 'Example: 16', true), text('heroes_level', 'Heroes levels', 'Example: BK 95, AQ 95, GW 70', true), number('gems', 'Gems', 'Example: 2500'), number('builder_hall', 'Builder Hall level', 'Example: 10'), number('experience_level', 'Experience level', 'Example: 220'), text('walls_level', 'Walls level', 'Example: Maxed TH16')],
  'brawl-stars': [number('trophies', 'Total trophies', 'Example: 45000', true), number('brawlers_count', 'Unlocked brawlers', 'Example: 82', true), number('maxed_brawlers', 'Maxed brawlers', 'Example: 25'), number('legendary_brawlers', 'Legendary brawlers', 'Example: 12'), number('gems', 'Gems', 'Example: 300'), text('highest_rank', 'Highest rank', 'Example: Masters')],
  valorant: [text('rank', 'Current rank', 'Example: Diamond 2', true), number('account_level', 'Account level', 'Example: 175', true), number('skins_count', 'Weapon skins', 'Example: 48'), number('agents_count', 'Unlocked agents', 'Example: 24'), number('valorant_points', 'Valorant Points', 'Example: 1200'), text('rare_skins', 'Notable skins', 'Example: Elderflame Vandal')],
  'clash-royale': [number('king_level', 'King level', 'Example: 15', true), number('trophies', 'Trophies', 'Example: 9000', true), text('arena', 'Arena / league', 'Example: Ultimate Champion'), number('maxed_cards', 'Maxed cards', 'Example: 32'), number('gems', 'Gems', 'Example: 850'), number('gold', 'Gold', 'Example: 500000')],
  fortnite: [number('account_level', 'Account level', 'Example: 1800', true), number('skins_count', 'Skins', 'Example: 240', true), number('v_bucks', 'V-Bucks', 'Example: 2800'), text('rare_skins', 'Rare skins', 'Example: Renegade Raider'), text('battle_passes', 'Battle passes', 'Owned seasons'), text('linked_platforms', 'Linked platforms', 'Epic, PlayStation, Xbox')],
  'pokemon-go': [number('trainer_level', 'Trainer level', 'Example: 50', true), text('team', 'Team', 'Mystic, Valor or Instinct', true), number('pokemon_count', 'Pokémon storage used', 'Example: 3200'), number('legendary_count', 'Legendary Pokémon', 'Example: 120'), number('stardust', 'Stardust', 'Example: 5000000'), number('coins', 'PokéCoins', 'Example: 1500')],
  'mobile-legends': [number('account_level', 'Account level', 'Example: 85', true), text('rank', 'Current rank', 'Example: Mythical Glory', true), number('heroes_count', 'Unlocked heroes', 'Example: 120'), number('skins_count', 'Skins', 'Example: 210'), number('diamonds', 'Diamonds', 'Example: 1500'), text('rare_skins', 'Notable skins', 'Collector and Legend skins')],
  'free-fire': [number('account_level', 'Account level', 'Example: 75', true), text('rank', 'Current rank', 'Example: Grandmaster', true), number('characters_count', 'Characters', 'Example: 45'), number('gun_skins', 'Gun skins', 'Example: 90'), number('diamonds', 'Diamonds', 'Example: 2200'), text('rare_items', 'Rare items', 'Evo guns, bundles and emotes')],
  'hay-day': [number('farm_level', 'Farm level', 'Example: 145', true), number('barn_capacity', 'Barn capacity', 'Example: 3500', true), number('silo_capacity', 'Silo capacity', 'Example: 3200'), number('coins', 'Coins', 'Example: 8000000'), number('diamonds', 'Diamonds', 'Example: 900'), text('expansions', 'Land expansion', 'Example: 85% unlocked')],
  'squad-busters': [number('squad_level', 'Squad level', 'Example: 120', true), text('league', 'Current league', 'Example: Squad League', true), number('characters_count', 'Unlocked characters', 'Example: 35'), number('super_units', 'Super / Ultra units', 'Example: 18'), number('star_tokens', 'Star Tokens', 'Example: 250'), number('coins', 'Coins', 'Example: 150000')],
};

export const listingTypes = [['account', 'Account'], ['item', 'Item'], ['service', 'Service']];
export const platforms = ['Any platform', 'Android', 'iOS', 'PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
export const regions = ['Global', 'India', 'Asia', 'Europe', 'North America', 'South America', 'Middle East'];
export const itemCategories = ['Currency', 'Top-up', 'Skin', 'Weapon', 'Card', 'Chest', 'Collectible', 'Bundle', 'Other'];
export const serviceCategories = ['Rank boost', 'Coaching', 'Quest completion', 'Farming', 'Account setup', 'Top-up', 'Other'];

export const getAccountFields = (gameId) => accountFieldsByGame[gameId] || [];
export const accountFieldValue = (product, fieldKey) => {
  const stored = product?.attributes?.[fieldKey];
  if (stored !== null && stored !== undefined && stored !== '') return stored;
  const firstNumber = getAccountFields(product?.game_id).find((field) => field.type === 'number')?.key;
  if (fieldKey === firstNumber) return product?.town_hall || '';
  const legacy = { builder_hall: 'builder_hall', experience_level: 'exp_level', account_level: 'exp_level', trainer_level: 'exp_level', farm_level: 'exp_level', gems: 'gems', diamonds: 'gems', v_bucks: 'gems', coins: 'gems', heroes_level: 'heroes_level', rare_skins: 'heroes_level', walls_level: 'walls_level', rank: 'walls_level', highest_rank: 'walls_level' };
  return legacy[fieldKey] ? product?.[legacy[fieldKey]] || '' : '';
};
export const gameLabel = (gameId) => marketplaceGames.find(([id]) => id === gameId)?.[1] || gameId;
export const readableAttribute = (key) => key.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
