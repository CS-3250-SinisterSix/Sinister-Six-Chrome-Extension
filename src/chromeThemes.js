/**
 * @fileoverview Chrome API adapter for theme operations.
 *
 * This module wraps chrome.management API calls for enabling, disabling,
 * and listing installed Chrome themes. All direct Chrome API interaction
 * for themes lives here — no other module should call chrome.management
 * for theme operations.
 *
 * @module chromeThemes
 */

/**
 * Checks whether the chrome.management API is available.
 * @returns {boolean}
 */
function isManagementAvailable() {
  return (
    typeof chrome !== 'undefined' &&
    chrome.management &&
    typeof chrome.management.getAll === 'function'
  );
}

/**
 * Wraps chrome.management.getAll to support both promise and callback forms.
 * @returns {Promise<Array>} All installed extensions.
 */
function getAllExtensions() {
  return new Promise((resolve, reject) => {
    if (!isManagementAvailable()) {
      reject(
        new Error(
          'chrome.management API is not available. ' +
            'Try removing and re-adding the extension in chrome://extensions.'
        )
      );
      return;
    }

    try {
      const result = chrome.management.getAll();
      // If it returns a promise (MV3), use it
      if (result && typeof result.then === 'function') {
        result.then(resolve, reject);
      }
    } catch {
      // Fallback to callback form
      try {
        chrome.management.getAll((extensions) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(extensions);
          }
        });
      } catch (cbErr) {
        reject(cbErr);
      }
    }
  });
}

/**
 * Wraps chrome.management.setEnabled to support both promise and callback forms.
 * @param {string} id - Extension ID.
 * @param {boolean} enabled - Whether to enable or disable.
 * @returns {Promise<void>}
 */
function setExtensionEnabled(id, enabled) {
  return new Promise((resolve, reject) => {
    if (
      !chrome?.management ||
      typeof chrome.management.setEnabled !== 'function'
    ) {
      reject(new Error('chrome.management API is not available.'));
      return;
    }

    try {
      const result = chrome.management.setEnabled(id, enabled);
      if (result && typeof result.then === 'function') {
        result.then(resolve, reject);
      }
    } catch {
      try {
        chrome.management.setEnabled(id, enabled, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      } catch (cbErr) {
        reject(cbErr);
      }
    }
  });
}

/**
 * Gets all installed theme extensions.
 *
 * @description Queries chrome.management for all installed extensions
 * and filters to only theme-type extensions.
 * @returns {Promise<Array<{id: string, name: string, enabled: boolean}>>}
 *   List of installed themes with id, name, and enabled status.
 *
 * @example
 * const themes = await getInstalledThemes();
 * // [{ id: 'abc123', name: 'Pikmin Theme', enabled: true }]
 */
export async function getInstalledThemes() {
  const extensions = await getAllExtensions();
  return extensions
    .filter((ext) => ext.type === 'theme')
    .map((ext) => ({ id: ext.id, name: ext.name, enabled: ext.enabled }));
}

/**
 * Applies a theme by enabling it in Chrome.
 *
 * @description Enables the specified theme extension via chrome.management.
 * Chrome will automatically disable any other active theme when a new one
 * is enabled.
 * @param {string} themeId - The extension ID of the theme to enable.
 * @returns {Promise<void>}
 *
 * @example
 * await applyThemeInChrome('abc123');
 */
export async function applyThemeInChrome(themeId) {
  await setExtensionEnabled(themeId, true);
}

/**
 * Reverts to the default Chrome theme by disabling the currently active theme.
 *
 * @description Finds the currently enabled theme extension and disables it.
 * If no theme is enabled, this is a no-op.
 * @returns {Promise<void>}
 *
 * @example
 * await revertThemeInChrome();
 */
export async function revertThemeInChrome() {
  const themes = await getInstalledThemes();
  const activeTheme = themes.find((t) => t.enabled);
  if (activeTheme) {
    await setExtensionEnabled(activeTheme.id, false);
  }
}
