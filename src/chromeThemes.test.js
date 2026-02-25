import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock chrome.management API
const mockGetAll = jest.fn();
const mockSetEnabled = jest.fn();

globalThis.chrome = {
  management: {
    getAll: mockGetAll,
    setEnabled: mockSetEnabled,
  },
};

const { getInstalledThemes, applyThemeInChrome, revertThemeInChrome } =
  await import('./chromeThemes.js');

describe('chromeThemes adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstalledThemes', () => {
    it('returns only theme-type extensions', async () => {
      mockGetAll.mockResolvedValue([
        { id: 'theme1', name: 'Dark Theme', type: 'theme', enabled: true },
        { id: 'ext1', name: 'Ad Blocker', type: 'extension', enabled: true },
        { id: 'theme2', name: 'Light Theme', type: 'theme', enabled: false },
      ]);

      const themes = await getInstalledThemes();

      expect(themes).toEqual([
        { id: 'theme1', name: 'Dark Theme', enabled: true },
        { id: 'theme2', name: 'Light Theme', enabled: false },
      ]);
    });

    it('returns empty array when no themes installed', async () => {
      mockGetAll.mockResolvedValue([
        { id: 'ext1', name: 'Ad Blocker', type: 'extension', enabled: true },
      ]);

      const themes = await getInstalledThemes();
      expect(themes).toEqual([]);
    });
  });

  describe('applyThemeInChrome', () => {
    it('enables the specified theme by ID', async () => {
      mockSetEnabled.mockResolvedValue(undefined);

      await applyThemeInChrome('theme1');

      expect(mockSetEnabled).toHaveBeenCalledWith('theme1', true);
    });
  });

  describe('revertThemeInChrome', () => {
    it('disables the currently enabled theme', async () => {
      mockGetAll.mockResolvedValue([
        { id: 'theme1', name: 'Dark Theme', type: 'theme', enabled: true },
        { id: 'theme2', name: 'Light Theme', type: 'theme', enabled: false },
      ]);
      mockSetEnabled.mockResolvedValue(undefined);

      await revertThemeInChrome();

      expect(mockSetEnabled).toHaveBeenCalledWith('theme1', false);
    });

    it('does nothing when no theme is enabled', async () => {
      mockGetAll.mockResolvedValue([
        { id: 'theme1', name: 'Dark Theme', type: 'theme', enabled: false },
      ]);

      await revertThemeInChrome();

      expect(mockSetEnabled).not.toHaveBeenCalled();
    });
  });
});
