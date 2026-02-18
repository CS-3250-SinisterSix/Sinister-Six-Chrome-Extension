/**
 * @fileoverview Theme state management module for the Chrome extension.
 *
 * This file does NOT directly interact with chrome.management.
 * Chrome API calls must exist only in an adapter layer (chromeThemes.js).
 * This module manages state and rules only.
 *
 * Themes are represented as simple toggle objects: { id, isDefault }.
 * The API is designed to support link-based theme navigation via the
 * Chrome Web Store in the future.
 *
 * @module themes
 */

/**
 * @typedef {Object} Theme
 * @property {string} id - Unique theme identifier
 * @property {boolean} isDefault - Whether this is the default theme
 */

/**
 * @typedef {Object} ThemeApplyResult
 * @property {boolean} success - Whether the theme was applied successfully
 * @property {string} themeId - The ID of the applied theme
 * @property {string} [previousThemeId] - The ID of the previously active theme
 * @property {string} [error] - Error message if application failed
 */

/**
 * Default theme used when no theme is active.
 *
 * @description The fallback theme that represents the browser's default appearance.
 * @constant {Theme}
 */
export const DEFAULT_THEME = {
  id: 'default',
  isDefault: true,
};

/**
 * Currently active theme.
 * @type {Theme|null}
 * @private
 */
let currentTheme = null;

/**
 * Registered theme change listeners.
 * @type {Set<Function>}
 * @private
 */
const themeListeners = new Set();

/**
 * Applies a theme by its ID.
 *
 * @description Sets the specified theme as the active theme and notifies
 * all registered listeners. If application fails, the previous theme
 * state is preserved.
 * @param {string} themeId - The ID of the theme to apply
 * @returns {ThemeApplyResult} Result object indicating success or failure
 * @throws {TypeError} If themeId is not a non-empty string
 *
 * @example
 * const result = applyTheme('dark-mode');
 * if (result.success) {
 *   console.log(`Applied theme: ${result.themeId}`);
 * }
 */
export function applyTheme(themeId) {
  if (typeof themeId !== 'string' || themeId.length === 0) {
    throw new TypeError('themeId must be a non-empty string');
  }

  const previousThemeId = currentTheme?.id;

  try {
    currentTheme = { id: themeId, isDefault: false };
    notifyListeners(currentTheme);

    return {
      success: true,
      themeId,
      previousThemeId,
    };
  } catch (error) {
    return {
      success: false,
      themeId,
      previousThemeId,
      error: error.message,
    };
  }
}

/**
 * Reverts to the default theme.
 *
 * @description Removes the active theme and restores the browser to its
 * default appearance. All registered listeners are notified of the change.
 * @returns {ThemeApplyResult} Result object indicating success or failure
 *
 * @example
 * const result = revertTheme();
 * if (result.success) {
 *   console.log('Reverted to default theme');
 * }
 */
export function revertTheme() {
  const previousThemeId = currentTheme?.id;

  try {
    currentTheme = { ...DEFAULT_THEME };
    notifyListeners(currentTheme);

    return {
      success: true,
      themeId: DEFAULT_THEME.id,
      previousThemeId,
    };
  } catch (error) {
    return {
      success: false,
      themeId: DEFAULT_THEME.id,
      previousThemeId,
      error: error.message,
    };
  }
}

/**
 * Gets the currently active theme.
 *
 * @description Returns a copy of the current theme object to prevent
 * external modification. If no theme has been applied, returns the
 * default theme.
 * @returns {Theme} A copy of the currently active theme
 *
 * @example
 * const theme = getCurrentTheme();
 * console.log(`Current theme: ${theme.id}, default: ${theme.isDefault}`);
 */
export function getCurrentTheme() {
  if (!currentTheme) {
    return { ...DEFAULT_THEME };
  }
  return { ...currentTheme };
}

/**
 * Checks whether a specific theme is currently active.
 *
 * @description Compares the given theme ID against the currently active
 * theme's ID.
 * @param {string} themeId - The theme ID to check
 * @returns {boolean} True if the specified theme is active
 * @throws {TypeError} If themeId is not a string
 *
 * @example
 * if (isThemeActive('dark-mode')) {
 *   console.log('Dark mode is on');
 * }
 */
export function isThemeActive(themeId) {
  if (typeof themeId !== 'string') {
    throw new TypeError('themeId must be a string');
  }

  return currentTheme?.id === themeId;
}

/**
 * Registers a callback function to be invoked when the theme changes.
 *
 * @description The callback receives the new theme object as its only
 * argument. Multiple listeners can be registered and will be called in
 * registration order.
 * @param {Function} callback - Function to call when theme changes
 * @returns {Function} Unsubscribe function to remove the listener
 * @throws {TypeError} If callback is not a function
 *
 * @example
 * const unsubscribe = onThemeChange((theme) => {
 *   console.log(`Theme changed to: ${theme.id}`);
 * });
 *
 * // Later, stop listening:
 * unsubscribe();
 */
export function onThemeChange(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }

  themeListeners.add(callback);

  return function unsubscribe() {
    themeListeners.delete(callback);
  };
}

/**
 * Gets the number of registered theme change listeners.
 *
 * @description Useful for debugging and testing purposes.
 * @returns {number} The count of active theme listeners
 *
 * @example
 * console.log(`Listeners: ${getListenerCount()}`);
 */
export function getListenerCount() {
  return themeListeners.size;
}

/**
 * Removes all registered theme change listeners.
 *
 * @description This should typically only be used during cleanup or testing.
 * @returns {void}
 *
 * @example
 * clearAllListeners();
 * console.log(getListenerCount()); // 0
 */
export function clearAllListeners() {
  themeListeners.clear();
}

/**
 * Notifies all registered listeners of a theme change.
 *
 * @param {Theme} theme - The new theme
 * @returns {void}
 * @private
 */
function notifyListeners(theme) {
  for (const listener of themeListeners) {
    try {
      listener(theme);
    } catch (error) {
      console.error('Theme listener threw an error:', error);
    }
  }
}
