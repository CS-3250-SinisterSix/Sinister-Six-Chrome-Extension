// src/popupLogic.js

export const DEFAULT_ID = 'default';

/**
 * Selects a random theme from the saved collection, avoiding the currently
 * active theme when possible.
 *
 * @param {string[]} themes - Array of saved theme URL strings.
 * @param {string|null} [activeTheme=null] - The currently active theme URL to avoid.
 * @param {function} [randomFn=Math.random] - Random number generator (0–1), injectable for testing.
 * @returns {string|null} A randomly selected theme URL, or null if the array is empty.
 */
export function selectRandomTheme(
  themes,
  activeTheme = null,
  randomFn = Math.random
) {
  if (!Array.isArray(themes) || themes.length === 0) {
    return null;
  }

  if (themes.length === 1) {
    return themes[0];
  }

  const candidates = themes.filter((t) => t !== activeTheme);
  const pool = candidates.length > 0 ? candidates : themes;
  const index = Math.floor(randomFn() * pool.length);
  return pool[index];
}

/**
 * Extracts a human-readable theme name from a Chrome Web Store URL.
 * @param {string} link - Chrome Web Store theme URL.
 * @returns {string} Formatted theme name with each word capitalized.
 */
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
