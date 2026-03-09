import { DEFAULT_ID } from './popupLogic.js';

export function getDropdownChangePlan(selectedValue, selectedName) {
  if (selectedValue === DEFAULT_ID) {
    return {
      action: 'revert',
      newState: {
        currentThemeId: selectedValue,
        currentThemeName: selectedName,
        isDefault: true,
      },
    };
  }

  if (selectedValue.includes('https://chromewebstore.google.com')) {
    return {
      action: 'openLink',
      url: selectedValue,
      newState: {
        currentThemeId: selectedValue,
        currentThemeName: selectedName,
        isDefault: false,
      },
    };
  }

  return {
    action: 'apply',
    themeId: selectedValue,
    newState: {
      currentThemeId: selectedValue,
      currentThemeName: selectedName,
      isDefault: false,
    },
  };
}