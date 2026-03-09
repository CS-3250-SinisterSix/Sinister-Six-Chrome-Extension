import { DEFAULT_ID } from './popupLogic.js';

export function getTogglePlan(themes) {
  const activeTheme = themes.find((t) => t.enabled);
  const inactiveTheme = themes.find((t) => !t.enabled);

  if (activeTheme) {
    return {
      action: 'disable',
      themeId: activeTheme.id,
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
      themeId: inactiveTheme.id,
      newState: {
        currentThemeId: inactiveTheme.id,
        currentThemeName: inactiveTheme.name,
        isDefault: false,
      },
    };
  }

  return null;
}