// src/popupLogic.js

export const DEFAULT_ID = 'default';

export function extractName(link) {
  return link
    .split('/detail/')[1]
    .split('/')[0]
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function detectCurrentState(themes) {
  const activeTheme = themes.find((t) => t.enabled);
  if (activeTheme) {
    return {
      currentThemeId: activeTheme.id,
      currentThemeName: activeTheme.name,
      isDefault: false,
    };
  }
  return {
    currentThemeId: DEFAULT_ID,
    currentThemeName: 'Default Theme',
    isDefault: true,
  };
}