import {
  getInstalledThemes,
  applyThemeInChrome,
  revertThemeInChrome,
} from './src/chromeThemes.js';
import { applyTheme, revertTheme, getCurrentTheme } from './src/themes.js';

const DEFAULT_ID = 'default';
const STORAGE_KEY = 'themeState';

const dropdown = document.getElementById('themeDropdown');
const nameEl = document.getElementById('currentThemeName');
const indicatorEl = document.getElementById('themeIndicator');
const noticeEl = document.getElementById('noticeArea');
const linkBtn = document.getElementById('link');

const WEBSTORE_URL =
  'https://chromewebstore.google.com/category/themes?utm_source=ext_app_menu';

/**
 * Renders the current theme state into the popup UI.
 * @param {{ currentThemeId: string, currentThemeName: string, isDefault: boolean }} state
 */
function renderCurrentThemeUI(state) {
  nameEl.textContent = state.currentThemeName;

  if (state.isDefault) {
    indicatorEl.textContent = 'Default';
    indicatorEl.className = 'indicator indicator--default';
  } else {
    indicatorEl.textContent = 'Custom';
    indicatorEl.className = 'indicator indicator--custom';
  }

  dropdown.value = state.currentThemeId;
  hideNotice();
}

/**
 * Persists theme state to chrome.storage.local.
 * @param {{ currentThemeId: string, currentThemeName: string, isDefault: boolean }} state
 */
async function saveState(state) {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

/**
 * Loads persisted theme state from chrome.storage.local.
 * @returns {Promise<{ currentThemeId: string, currentThemeName: string, isDefault: boolean } | null>}
 */
async function loadState() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || null;
}

/**
 * Shows a notice in the popup (error or info).
 * @param {string} html - The message HTML content.
 * @param {'error' | 'info'} [type='error'] - The notice type.
 */
function showNotice(html, type = 'error') {
  noticeEl.innerHTML = html;
  noticeEl.className = `notice notice--${type}`;
  noticeEl.hidden = false;
}

/** Hides the notice. */
function hideNotice() {
  noticeEl.innerHTML = '';
  noticeEl.hidden = true;
}

/**
 * Populates the dropdown with installed themes.
 * "Default Theme" is always first (already in HTML).
 * @param {Array<{ id: string, name: string, enabled: boolean }>} themes
 */
function populateDropdown(themes) {
  // Remove any previously added theme options (keep the default option)
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.name;
    dropdown.appendChild(option);
  }
}

/**
 * Determines the current theme state from installed themes list.
 * @param {Array<{ id: string, name: string, enabled: boolean }>} themes
 * @returns {{ currentThemeId: string, currentThemeName: string, isDefault: boolean }}
 */
function detectCurrentState(themes) {
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
 * Handles dropdown selection changes — applies or reverts themes.
 */
async function handleDropdownChange() {
  const selectedValue = dropdown.value;
  const previousValue = getCurrentTheme().id;
  const selectedOption = dropdown.options[dropdown.selectedIndex];
  const selectedName = selectedOption.textContent;

  try {
    if (selectedValue === DEFAULT_ID) {
      await revertThemeInChrome();
      revertTheme();
    } else {
      await applyThemeInChrome(selectedValue);
      applyTheme(selectedValue);
    }

    const newState = {
      currentThemeId: selectedValue,
      currentThemeName: selectedName,
      isDefault: selectedValue === DEFAULT_ID,
    };

    await saveState(newState);
    renderCurrentThemeUI(newState);
  } catch (err) {
    console.error('Theme change failed:', err);

    const isNotFound =
      err.message && err.message.toLowerCase().includes('find extension');

    if (isNotFound) {
      showNotice(
        `<strong>${selectedName}</strong> is no longer installed. ` +
          'Chrome only keeps one theme at a time. ' +
          `<a id="reinstallLink">Reinstall it from the Web Store</a>.`,
        'info'
      );
      const reinstallLink = document.getElementById('reinstallLink');
      if (reinstallLink) {
        reinstallLink.addEventListener('click', () => {
          window.open(WEBSTORE_URL, '_blank', 'noopener');
        });
      }
    } else {
      showNotice(`Failed to change theme: ${err.message}`);
    }

    // Revert dropdown to previous selection
    dropdown.value = previousValue;
  }
}

/**
 * Initializes the popup on load.
 */
async function init() {
  try {
    const themes = await getInstalledThemes();
    populateDropdown(themes);

    // Detect actual Chrome state (source of truth)
    const detectedState = detectCurrentState(themes);

    // Load saved state for name display, but trust Chrome for which is active
    const savedState = await loadState();

    const state = {
      currentThemeId: detectedState.currentThemeId,
      currentThemeName:
        detectedState.isDefault && savedState?.isDefault
          ? 'Default Theme'
          : detectedState.currentThemeName,
      isDefault: detectedState.isDefault,
    };

    // Sync internal state module
    if (state.isDefault) {
      revertTheme();
    } else {
      applyTheme(state.currentThemeId);
    }

    await saveState(state);
    renderCurrentThemeUI(state);
  } catch (err) {
    console.error('Popup init failed:', err);
    showNotice(`Error: ${err.message}`);
  }

  dropdown.addEventListener('change', handleDropdownChange);

  linkBtn.addEventListener('click', () => {
    window.open(WEBSTORE_URL, '_blank', 'noopener');
  });
}

init();
