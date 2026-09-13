export const MARKETPLACE_THEMES = [
  { id: 'classic-light', label: 'Original white', pageColor: '#fafaf9', colors: ['#ffffff', '#18181b', '#facc15'] },
  { id: 'electric-blue', label: 'Electric blue', pageColor: '#07111f', colors: ['#07111f', '#2563eb', '#38bdf8'] },
  { id: 'cyber-violet', label: 'Cyber violet', pageColor: '#0b0920', colors: ['#0b0920', '#7c3aed', '#d946ef'] },
  { id: 'aurora-teal', label: 'Aurora teal', pageColor: '#061719', colors: ['#061719', '#14b8a6', '#5eead4'] },
];

const STORAGE_KEY = 'marketplace_theme';
const DEFAULT_THEME = 'classic-light';

function syncBrowserColor(theme) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = theme.pageColor;
  document.documentElement.style.colorScheme = theme.id === 'classic-light' ? 'light' : 'dark';
}

export function getTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return MARKETPLACE_THEMES.some((theme) => theme.id === saved) ? saved : DEFAULT_THEME;
}

export function applyTheme(themeId) {
  const theme = MARKETPLACE_THEMES.find((option) => option.id === themeId)
    || MARKETPLACE_THEMES.find((option) => option.id === DEFAULT_THEME);
  document.documentElement.dataset.theme = theme.id;
  syncBrowserColor(theme);
  localStorage.setItem(STORAGE_KEY, theme.id);
  window.dispatchEvent(new CustomEvent('marketplace-theme-change', { detail: { theme: theme.id } }));
  return theme.id;
}

export function initializeTheme() {
  const themeId = getTheme();
  const theme = MARKETPLACE_THEMES.find((option) => option.id === themeId);
  document.documentElement.dataset.theme = theme.id;
  syncBrowserColor(theme);
}
