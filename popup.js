import {
  getInstalledThemes,
  applyThemeInChrome,
  revertThemeInChrome,
} from './src/chromeThemes.js';
import {
  applyTheme,
  revertTheme,
  getCurrentTheme,
  makeLink,
} from './src/themes.js';

const DEFAULT_ID = 'default';
const STORAGE_KEY = 'themeState';

const dropdown = document.getElementById('themeDropdown');
const nameEl = document.getElementById('currentThemeName');
const indicatorEl = document.getElementById('themeIndicator');
const noticeEl = document.getElementById('noticeArea');
const addBtn = document.getElementById('add');
const toggleBtn = document.getElementById('toggle');

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
 * Adds collected links to dropdown.
 * @param {Array<string>} themes
 */
function addLinks(themes) {
  // Remove any previously added theme options (keep the default option)
  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = extractName(theme);
    dropdown.appendChild(option);
  }
}

/**
 * Extracts extension name from the link
 * @param {Array<string>} themes
 */
function extractName(link) {
  return link
    .split('/detail/')[1]
    .split('/')[0]
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
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
    } else if (selectedValue.includes('https://chromewebstore.google.com')) {
      window.open(selectedValue, '_blank', 'noopener');
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
 * Handles theme toggle — applies or reverts themes.
 */
async function handleThemeToggle() {
  const currentTheme = getCurrentTheme();
  const themes = await getInstalledThemes();
  const previousValue = getCurrentTheme().id;

  for (let i = 0; i < 5; i++) {
    console.log(themes[i]);
  }
  try {
    if (currentTheme.id !== DEFAULT_ID) {
      await revertThemeInChrome();
      revertTheme();
      console.log('Reverting');
    } else {
      await applyThemeInChrome(themes[0].id);
      applyTheme(themes[0].id);
      console.log('applying');
    }

    const newState = {
      currentThemeId: themes[0].id,
      currentThemeName: themes[0].name,
      isDefault: themes[0].id === DEFAULT_ID,
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
  }
}

/**
 * Initializes the popup on load.
 */
async function init() {
  try {
    const themes = await getInstalledThemes();
    //populateDropdown(themes);

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

  const result = await chrome.storage.local.get(['links']);
  const themeLinks = result.links || [];

  addLinks(themeLinks);

  console.log('Total links:', themeLinks.length);

  dropdown.addEventListener('change', handleDropdownChange);
  toggleBtn.addEventListener('click', handleThemeToggle);

  addBtn.addEventListener('click', async () => {
    const theme = await getInstalledThemes();
    console.log(makeLink(theme[0].name, theme[0].id));
    const newLink = makeLink(theme[0].name, theme[0].id);

    if (!themeLinks.includes(newLink)) {
      themeLinks.push(newLink);
      await chrome.storage.local.set({ links: themeLinks });
    }
  });
}

init();
