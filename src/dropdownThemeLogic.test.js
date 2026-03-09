import { getDropdownChangePlan } from './dropdownThemeLogic.js';

describe('getDropdownChangePlan', () => {
  test('returns revert plan for default selection', () => {
    expect(
      getDropdownChangePlan('default', 'Default Theme')
    ).toEqual({
      action: 'revert',
      newState: {
        currentThemeId: 'default',
        currentThemeName: 'Default Theme',
        isDefault: true,
      },
    });
  });

  test('returns openLink plan for chrome web store links', () => {
    const url =
      'https://chromewebstore.google.com/detail/dark-theme/abcdefghijklmnop';

    expect(
      getDropdownChangePlan(url, 'Dark Theme')
    ).toEqual({
      action: 'openLink',
      url,
      newState: {
        currentThemeId: url,
        currentThemeName: 'Dark Theme',
        isDefault: false,
      },
    });
  });

  test('returns apply plan for installed theme id', () => {
    expect(
      getDropdownChangePlan('theme123', 'Dark Theme')
    ).toEqual({
      action: 'apply',
      themeId: 'theme123',
      newState: {
        currentThemeId: 'theme123',
        currentThemeName: 'Dark Theme',
        isDefault: false,
      },
    });
  });
});