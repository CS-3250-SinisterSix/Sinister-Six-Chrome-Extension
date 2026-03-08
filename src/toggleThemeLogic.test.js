import { getTogglePlan } from './toggleThemeLogic.js';

describe('getTogglePlan', () => {
  test('returns disable plan when an active theme exists', () => {
    const themes = [
      { id: 'theme1', name: 'Dark Theme', enabled: true },
      { id: 'theme2', name: 'Light Theme', enabled: false },
    ];

    expect(getTogglePlan(themes)).toEqual({
      action: 'disable',
      themeId: 'theme1',
      newState: {
        currentThemeId: 'default',
        currentThemeName: 'Default Theme',
        isDefault: true,
      },
    });
  });

  test('returns enable plan when no active theme exists but an inactive theme exists', () => {
    const themes = [
      { id: 'theme2', name: 'Light Theme', enabled: false },
    ];

    expect(getTogglePlan(themes)).toEqual({
      action: 'enable',
      themeId: 'theme2',
      newState: {
        currentThemeId: 'theme2',
        currentThemeName: 'Light Theme',
        isDefault: false,
      },
    });
  });

  test('returns null when no themes exist', () => {
    expect(getTogglePlan([])).toBeNull();
  });

  test('prefers disabling the active theme when both active and inactive themes exist', () => {
    const themes = [
      { id: 'theme1', name: 'Dark Theme', enabled: true },
      { id: 'theme2', name: 'Light Theme', enabled: false },
    ];

    const plan = getTogglePlan(themes);

    expect(plan.action).toBe('disable');
    expect(plan.themeId).toBe('theme1');
  });
});