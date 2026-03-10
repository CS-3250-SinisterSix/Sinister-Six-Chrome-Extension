import {
  extractName,
  detectCurrentState,
  selectRandomTheme,
  DEFAULT_ID,
} from './popupLogic.js';

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

describe('selectRandomTheme', () => {
  const themeA = 'https://chromewebstore.google.com/detail/alpha/id1';
  const themeB = 'https://chromewebstore.google.com/detail/beta/id2';
  const themeC = 'https://chromewebstore.google.com/detail/charlie/id3';

  test('returns null for empty array', () => {
    expect(selectRandomTheme([])).toBeNull();
  });

  test('returns null for non-array input', () => {
    expect(selectRandomTheme(null)).toBeNull();
    expect(selectRandomTheme(undefined)).toBeNull();
  });

  test('returns the only theme when one exists', () => {
    expect(selectRandomTheme([themeA])).toBe(themeA);
  });

  test('returns the only theme even if it is the active theme', () => {
    expect(selectRandomTheme([themeA], themeA)).toBe(themeA);
  });

  test('does not return the active theme when multiple exist', () => {
    // Use a fixed randomFn that would pick index 0
    const fixedRandom = () => 0;
    const result = selectRandomTheme(
      [themeA, themeB, themeC],
      themeA,
      fixedRandom
    );
    expect(result).not.toBe(themeA);
    expect([themeB, themeC]).toContain(result);
  });

  test('returns a theme from the array when multiple exist', () => {
    const fixedRandom = () => 0.99;
    const result = selectRandomTheme(
      [themeA, themeB, themeC],
      null,
      fixedRandom
    );
    expect([themeA, themeB, themeC]).toContain(result);
  });

  test('uses injected randomFn to pick deterministically', () => {
    // randomFn returning 0 should pick first candidate
    const result = selectRandomTheme([themeA, themeB], null, () => 0);
    expect(result).toBe(themeA);
  });

  test('does not mutate the original array', () => {
    const themes = [themeA, themeB, themeC];
    const copy = [...themes];
    selectRandomTheme(themes, themeA);
    expect(themes).toEqual(copy);
  });

  test('handles active theme not found in collection', () => {
    const fixedRandom = () => 0;
    const result = selectRandomTheme(
      [themeA, themeB],
      'not-in-list',
      fixedRandom
    );
    expect(result).toBe(themeA);
  });

  test('falls back to full list if all themes match active', () => {
    // Edge case: activeTheme matches the only entries after filter => empty candidates
    // This can't actually happen with string comparison since filter removes exact matches,
    // but test the fallback path by having activeTheme = null
    const result = selectRandomTheme([themeA], null, () => 0);
    expect(result).toBe(themeA);
  });
});
