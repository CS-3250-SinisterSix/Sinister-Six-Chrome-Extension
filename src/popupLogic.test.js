import { extractName, detectCurrentState, DEFAULT_ID } from './popupLogic.js';

describe('extractName', () => {
  test('extracts and formats a chrome web store theme name', () => {
    const link =
      'https://chromewebstore.google.com/detail/dark-theme/abcdefghijklmnop';
    expect(extractName(link)).toBe('Dark Theme');
  });

  test('handles multi-word hyphenated names', () => {
    const link =
      'https://chromewebstore.google.com/detail/super-dark-theme/abcdefghijklmnop';
    expect(extractName(link)).toBe('Super Dark Theme');
  });
});

describe('detectCurrentState', () => {
  test('returns active theme when one is enabled', () => {
    const themes = [
      { id: 'a', name: 'A', enabled: false },
      { id: 'b', name: 'B', enabled: true },
    ];
    expect(detectCurrentState(themes)).toEqual({
      currentThemeId: 'b',
      currentThemeName: 'B',
      isDefault: false,
    });
  });

  test('returns default state when none are enabled', () => {
    const themes = [{ id: 'a', name: 'A', enabled: false }];
    expect(detectCurrentState(themes)).toEqual({
      currentThemeId: DEFAULT_ID,
      currentThemeName: 'Default Theme',
      isDefault: true,
    });
  });

  test('returns default state when list is empty', () => {
    expect(detectCurrentState([])).toEqual({
      currentThemeId: DEFAULT_ID,
      currentThemeName: 'Default Theme',
      isDefault: true,
    });
  });
});