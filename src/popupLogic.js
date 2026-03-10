// src/popupLogic.js

/**
 * @typedef {Object} InstalledTheme
 * @property {string} id - Chrome extension ID for the theme.
 * @property {string} name - Human-readable theme name.
 * @property {boolean} enabled - Whether the theme is currently enabled.
 */

/**
 * @typedef {Object} ThemeState
 * @property {string} currentThemeId - The current theme ID or default sentinel.
 * @property {string} currentThemeName - Display name of the current theme.
 * @property {boolean} isDefault - Whether the default Chrome theme is active.
 */

/**
 * @typedef {Object} ThemeMetadata
 * @property {number} [addedAt] - Timestamp for when the theme was added.
 * @property {number} [lastUsed] - Timestamp for when the theme was last used.
 */

/**
 * @typedef {Object<string, ThemeMetadata>} ThemeMetadataMap
 */

/**
 * The sentinel ID used to represent the default Chrome theme.
 * @type {string}
 */
export const DEFAULT_ID = 'default';

/**
 * Supported sort modes for the theme collection.
 * @readonly
 * @enum {string}
 */
export const SORT_MODES = {
  ALPHABETICAL: 'alphabetical',
  RECENTLY_ADDED: 'recentlyAdded',
  RECENTLY_USED: 'recentlyUsed',
};

/**
 * Selects a random theme from the saved collection, avoiding the currently
 * active theme when possible.
 *
 * @param {string[]} themes - Array of saved theme URL strings.
 * @param {string|null} [activeTheme=null] - The currently active theme URL to avoid.
 * @param {function} [randomFn=Math.random] - Random number generator, injectable for testing.
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

/**
 * Detects the current theme state from an array of installed themes.
 * @param {InstalledTheme[]} themes - Installed Chrome themes.
 * @returns {ThemeState} The detected current theme state.
 */
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

/**
 * Sorts an array of theme URL strings by the specified mode.
 * Returns a new array; the input is never mutated.
 *
 * @param {string[]} links - Theme Chrome Web Store URLs.
 * @param {string} mode - One of {@link SORT_MODES}.
 * @param {ThemeMetadataMap} [metadata={}] - Map of URL to timestamp metadata.
 * @returns {string[]} A new sorted array of theme URLs.
 */
export function sortThemes(links, mode, metadata = {}) {
  const copy = [...links];

  switch (mode) {
    case SORT_MODES.ALPHABETICAL:
      return copy.sort((a, b) =>
        extractName(a).toLowerCase().localeCompare(extractName(b).toLowerCase())
      );

    case SORT_MODES.RECENTLY_ADDED:
      return copy.sort(
        (a, b) => (metadata[b]?.addedAt || 0) - (metadata[a]?.addedAt || 0)
      );

    case SORT_MODES.RECENTLY_USED:
      return copy.sort(
        (a, b) => (metadata[b]?.lastUsed || 0) - (metadata[a]?.lastUsed || 0)
      );

    default:
      return copy;
  }
}

/**
 * Determines what action should be taken for a dropdown selection.
 *
 * @param {string} selectedValue - The selected dropdown value.
 * @returns {{ action: 'revert' } | { action: 'open-link', url: string } | { action: 'apply', themeId: string }}
 *   The action to take for the selected value.
 */
export function getDropdownAction(selectedValue) {
  if (selectedValue === DEFAULT_ID) {
    return { action: 'revert' };
  }

  if (
    typeof selectedValue === 'string' &&
    selectedValue.includes('https://chromewebstore.google.com')
  ) {
    return { action: 'open-link', url: selectedValue };
  }

  return { action: 'apply', themeId: selectedValue };
}

/**
 * Determines the result of pressing the theme toggle button.
 *
 * @param {InstalledTheme[]} themes - Installed Chrome themes.
 * @returns {{
 *   action: 'disable' | 'enable',
 *   targetId: string,
 *   newState: ThemeState
 * } | null} The toggle outcome, or null when no themes are available.
 */
export function getToggleOutcome(themes) {
  const activeTheme = themes.find((t) => t.enabled);
  const inactiveTheme = themes.find((t) => !t.enabled);

  if (activeTheme) {
    return {
      action: 'disable',
      targetId: activeTheme.id,
      newState: {
        currentThemeId: DEFAULT_ID,
        currentThemeName: 'Default Theme',
        isDefault: true,
      },
    };
  }

  if (inactiveTheme) {
    return {
      action: 'enable',
      targetId: inactiveTheme.id,
      newState: {
        currentThemeId: inactiveTheme.id,
        currentThemeName: inactiveTheme.name,
        isDefault: false,
      },
    };
  }

  return null;
}

/**
 * Determines whether an error message indicates a missing Chrome theme.
 *
 * @param {string} message - Error message to inspect.
 * @returns {boolean} True if the message indicates a missing extension.
 */
export function isMissingThemeError(message) {
  return (
    typeof message === 'string' &&
    message.toLowerCase().includes('find extension')
  );
}