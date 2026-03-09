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
import { showConfirm } from './src/ui.js';
import {
  extractName,
  detectCurrentState,
  DEFAULT_ID,
} from './src/popupLogic.js';

const STORAGE_KEY = 'themeState';

const dropdown = document.getElementById('themeDropdown');
const nameEl = document.getElementById('currentThemeName');
const indicatorEl = document.getElementById('themeIndicator');
const noticeEl = document.getElementById('noticeArea');
const addBtn = document.getElementById('add');
const delBtn = document.getElementById('del');
const toggleBtn = document.getElementById('toggle');
const infoTip = document.getElementById('info');
const clearAllBtn = document.getElementById('clearAll');

/**
 * Renders the current theme state into the popup UI.
 * @param {{ currentThemeId: string, currentThemeName: string, isDefault: boolean }} state
 */
function renderCurrentThemeUI(state) {
  nameEl.textContent = state.currentThemeName;

  console.log(state);

  if (state.isDefault) {
    indicatorEl.textContent = 'Default';
    indicatorEl.className = 'indicator indicator--default';
  } else {
    indicatorEl.textContent = 'Custom';
    indicatorEl.className = 'indicator indicator--custom';
  }

  const matchingOption = Array.from(dropdown.options).find((opt) =>
    opt.value.includes(state.currentThemeId)
  );

  if (matchingOption) {
    dropdown.value = matchingOption.value;
    hideAddTheme(true);
  } else if (state.currentThemeId !== DEFAULT_ID) {
    dropdown.value = DEFAULT_ID; // fallback to default
    hideAddTheme(false);
    console.log(dropdown.value);
  } else {
    dropdown.value = DEFAULT_ID;
  }

  if (dropdown.length == 0) {
    dropdown.disabled = true;
  } else {
    dropdown.disabled = false;
  }
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
 * Adds collected links to dropdown.
 * @param {Array<string>} themes
 */
function populateDropdown(themes) {
  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = extractName(theme);
    dropdown.appendChild(option);
  }
}

/**
 * Sets visibility of the add theme button and info tip
 * @param {boolean} isThemeInCollection
 */
function hideAddTheme(isThemeInCollection) {
  infoTip.hidden = isThemeInCollection;
  addBtn.hidden = isThemeInCollection;
  delBtn.hidden = !isThemeInCollection;
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
    } else {
      showNotice(`Failed to change theme: ${err.message}`);
    }

    dropdown.value = previousValue;
  }
}

/**
 * Handles theme toggle — applies or reverts themes.
 */
async function handleThemeToggle() {
  const themes = await getInstalledThemes();

  const activeTheme = themes.find((t) => t.enabled);
  const inactiveTheme = themes.find((t) => !t.enabled);

  try {
    let newState;

    if (activeTheme) {
      chrome.management.setEnabled(activeTheme.id, false, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log('Extension disabled!');
        }
      });
      revertTheme();

      newState = {
        currentThemeId: DEFAULT_ID,
        currentThemeName: 'Default Theme',
        isDefault: true,
      };
    } else if (inactiveTheme) {
      chrome.management.setEnabled(inactiveTheme.id, true, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log('Extension disabled!');
        }
      });
      applyTheme(inactiveTheme.id);

      newState = {
        currentThemeId: inactiveTheme.id,
        currentThemeName: inactiveTheme.name,
        isDefault: false,
      };
    } else {
      return;
    }

    await saveState(newState);
    renderCurrentThemeUI(newState);
  } catch (err) {
    console.error('Theme toggle failed:', err);
    showNotice(`Failed to toggle theme: ${err.message}`);
  }
}

/**
 * Initializes the popup on load.
 */
async function init() {
  try {
    const themes = await getInstalledThemes();

    const detectedState = detectCurrentState(themes);

    const savedState = await loadState();

    const state = {
      currentThemeId: detectedState.currentThemeId,
      currentThemeName:
        detectedState.isDefault && savedState?.isDefault
          ? 'Default Theme'
          : detectedState.currentThemeName,
      isDefault: detectedState.isDefault,
    };

    const result = await chrome.storage.local.get(['links']);
    const themeLinks = result.links || [];

    populateDropdown(themeLinks);

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
  toggleBtn.addEventListener('click', handleThemeToggle);

  addBtn.addEventListener('click', async () => {
    const result = await chrome.storage.local.get(['links']);
    const themeLinks = result.links || [];
    const theme = await getInstalledThemes();
    const newLink = makeLink(theme[0].name, theme[0].id);

    if (!themeLinks.includes(newLink)) {
      themeLinks.push(newLink);
      await chrome.storage.local.set({ links: themeLinks });
      populateDropdown([newLink]);
      dropdown.value = newLink;
      renderCurrentThemeUI(await loadState());
    }
  });

  delBtn.addEventListener('click', async () => {
    if (
      !(await showConfirm(
        'Are you sure you want to remove this theme from your collection?'
      ))
    ) {
      return;
    }

    const result = await chrome.storage.local.get(['links']);
    const updatedLinks =
      result.links.filter((link) => link !== dropdown.value) || [];
    await chrome.storage.local.set({ links: updatedLinks });
    dropdown.remove(dropdown.selectedIndex);
    renderCurrentThemeUI(await loadState());
  });

  clearAllBtn.addEventListener('click', async () => {
    if (
      !(await showConfirm(
        'This will remove all themes from your collection. Are you sure you want to continue?'
      ))
    ) {
      return;
    }

    await chrome.storage.local.remove('links');
    for (let i = dropdown.length; i >= 0; i--) {
      dropdown.remove(i);
    }
    renderCurrentThemeUI(await loadState());
  });
}

init();