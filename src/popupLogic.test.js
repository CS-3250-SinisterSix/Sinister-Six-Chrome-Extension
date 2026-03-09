import {
  extractName,
  detectCurrentState,
  sortThemes,
  DEFAULT_ID,
  SORT_MODES,
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

describe('SORT_MODES', () => {
  test('has all expected sort mode values', () => {
    expect(SORT_MODES.ALPHABETICAL).toBe('alphabetical');
    expect(SORT_MODES.RECENTLY_ADDED).toBe('recentlyAdded');
    expect(SORT_MODES.RECENTLY_USED).toBe('recentlyUsed');
  });
});

describe('sortThemes', () => {
  const linkA = 'https://chromewebstore.google.com/detail/alpha-theme/id1';
  const linkB = 'https://chromewebstore.google.com/detail/beta-theme/id2';
  const linkC = 'https://chromewebstore.google.com/detail/charlie-theme/id3';

  const links = [linkC, linkA, linkB];

  test('does not mutate the original array', () => {
    const original = [linkC, linkA, linkB];
    const frozen = [...original];
    sortThemes(original, SORT_MODES.ALPHABETICAL);
    expect(original).toEqual(frozen);
  });

  test('returns a new array instance', () => {
    const result = sortThemes(links, SORT_MODES.ALPHABETICAL);
    expect(result).not.toBe(links);
  });

  test('returns an empty array when given an empty array', () => {
    expect(sortThemes([], SORT_MODES.ALPHABETICAL)).toEqual([]);
    expect(sortThemes([], SORT_MODES.RECENTLY_ADDED)).toEqual([]);
    expect(sortThemes([], SORT_MODES.RECENTLY_USED)).toEqual([]);
  });

  describe('alphabetical', () => {
    test('sorts by theme name A-Z', () => {
      const result = sortThemes(links, SORT_MODES.ALPHABETICAL);
      expect(result).toEqual([linkA, linkB, linkC]);
    });

    test('is case-insensitive', () => {
      const upper = 'https://chromewebstore.google.com/detail/ZEBRA-theme/id4';
      const lower =
        'https://chromewebstore.google.com/detail/aardvark-theme/id5';
      const result = sortThemes([upper, lower], SORT_MODES.ALPHABETICAL);
      // Aardvark before Zebra
      expect(result).toEqual([lower, upper]);
    });
  });

  describe('recentlyAdded', () => {
    test('sorts by addedAt descending (newest first)', () => {
      const metadata = {
        [linkA]: { addedAt: 100 },
        [linkB]: { addedAt: 300 },
        [linkC]: { addedAt: 200 },
      };
      const result = sortThemes(links, SORT_MODES.RECENTLY_ADDED, metadata);
      expect(result).toEqual([linkB, linkC, linkA]);
    });

    test('treats missing metadata as 0 (oldest)', () => {
      const metadata = {
        [linkB]: { addedAt: 500 },
      };
      const result = sortThemes(links, SORT_MODES.RECENTLY_ADDED, metadata);
      expect(result[0]).toBe(linkB);
    });

    test('handles null addedAt values', () => {
      const metadata = {
        [linkA]: { addedAt: null },
        [linkB]: { addedAt: 100 },
      };
      const result = sortThemes(
        [linkA, linkB],
        SORT_MODES.RECENTLY_ADDED,
        metadata
      );
      expect(result).toEqual([linkB, linkA]);
    });
  });

  describe('recentlyUsed', () => {
    test('sorts by lastUsed descending (most recent first)', () => {
      const metadata = {
        [linkA]: { lastUsed: 500 },
        [linkB]: { lastUsed: 100 },
        [linkC]: { lastUsed: 300 },
      };
      const result = sortThemes(links, SORT_MODES.RECENTLY_USED, metadata);
      expect(result).toEqual([linkA, linkC, linkB]);
    });

    test('treats missing metadata as 0 (least recent)', () => {
      const metadata = {
        [linkA]: { lastUsed: 200 },
      };
      const result = sortThemes(links, SORT_MODES.RECENTLY_USED, metadata);
      expect(result[0]).toBe(linkA);
    });

    test('handles undefined lastUsed values', () => {
      const metadata = {
        [linkA]: { lastUsed: undefined },
        [linkB]: { lastUsed: 100 },
      };
      const result = sortThemes(
        [linkA, linkB],
        SORT_MODES.RECENTLY_USED,
        metadata
      );
      expect(result).toEqual([linkB, linkA]);
    });
  });

  describe('unknown mode', () => {
    test('returns a copy in original order for unknown sort mode', () => {
      const result = sortThemes(links, 'unknown');
      expect(result).toEqual(links);
      expect(result).not.toBe(links);
    });
  });
});
