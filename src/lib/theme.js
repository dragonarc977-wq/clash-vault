export const MARKETPLACE_THEMES = [
  { id: 'electric-blue', label: 'Electric blue', colors: ['#07111f', '#2563eb', '#38bdf8'] },
  { id: 'cyber-violet', label: 'Cyber violet', colors: ['#0b0920', '#7c3aed', '#d946ef'] },
  { id: 'aurora-teal', label: 'Aurora teal', colors: ['#061719', '#14b8a6', '#5eead4'] },
];

const STORAGE_KEY = 'marketplace_theme';
const DEFAULT_THEME = MARKETPLACE_THEMES[0].id;

export function getTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return MARKETPLACE_THEMES.some((theme) => theme.id === saved) ? saved : DEFAULT_THEME;
}

export function applyTheme(themeId) {
  const nextTheme = MARKETPLACE_THEMES.some((theme) => theme.id === themeId) ? themeId : DEFAULT_THEME;
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(STORAGE_KEY, nextTheme);
  window.dispatchEvent(new CustomEvent('marketplace-theme-change', { detail: { theme: nextTheme } }));
  return nextTheme;
}

export function initializeTheme() {
  document.documentElement.dataset.theme = getTheme();
}
