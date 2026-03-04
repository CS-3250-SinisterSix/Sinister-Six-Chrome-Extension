import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock chrome.management API
const mockGetAll = jest.fn();
const mockSetEnabled = jest.fn();

globalThis.chrome = {
  runtime: {
    lastError: null,
  },
  management: {
    getAll: mockGetAll,
    setEnabled: mockSetEnabled,
  },
};

async function importFreshChromeThemes() {
  // cache-buster so we re-evaluate the module with the current globalThis.chrome
  return await import(`./chromeThemes.js?cacheBust=${Date.now()}`);
}

const { getInstalledThemes, applyThemeInChrome, revertThemeInChrome } =
  await import('./chromeThemes.js');

describe('chromeThemes adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.chrome.runtime.lastError = null;
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

  it('rejects when chrome.management API is not available', async () => {
    const originalChrome = globalThis.chrome;
    globalThis.chrome = {}; // no management

    const { getInstalledThemes } = await import(`./chromeThemes.js?cacheBust=${Date.now()}`);

    await expect(getInstalledThemes()).rejects.toThrow(
      /chrome\.management API is not available/i
    );

    globalThis.chrome = originalChrome;
  });

  it('uses callback form when getAll() throws and resolves extensions', async () => {
    let firstCall = true;

    mockGetAll.mockImplementation((cb) => {
      // First call: simulate promise-form failing by throwing
      if (firstCall) {
        firstCall = false;
        throw new Error('no promise form');
      }

      // Second call: callback form
      cb([
        { id: 'theme1', name: 'Dark Theme', type: 'theme', enabled: true },
        { id: 'ext1', name: 'Ad Blocker', type: 'extension', enabled: true },
      ]);
    });

    const themes = await getInstalledThemes();

    expect(themes).toEqual([{ id: 'theme1', name: 'Dark Theme', enabled: true }]);
  });

  //new 
  it('rejects when callback form sets chrome.runtime.lastError', async () => {
  mockGetAll.mockImplementation((cb) => {
    // First call: promise-form attempt (no callback passed)
    if (typeof cb !== 'function') {
      throw new Error('no promise form');
    }

    // Second call: callback form
    globalThis.chrome.runtime.lastError = { message: 'kaboom' };
    cb([]); // callback fires, but lastError forces reject
  });

  await expect(getInstalledThemes()).rejects.toThrow('kaboom');
});

  //new 
  it('rejects when callback form itself throws (cbErr)', async () => {
  mockGetAll.mockImplementation((cb) => {
    // First call: promise-form attempt
    if (typeof cb !== 'function') {
      throw new Error('no promise form');
    }

    // Second call: callback form throws immediately
    throw new Error('callback form broke');
  });

  await expect(getInstalledThemes()).rejects.toThrow('callback form broke');
});

});

  describe('applyThemeInChrome', () => {
  it('enables the specified theme by ID (promise form)', async () => {
    mockSetEnabled.mockResolvedValue(undefined);

    await applyThemeInChrome('theme1');

    expect(mockSetEnabled).toHaveBeenCalledWith('theme1', true);
  });

  it('rejects when chrome.management.setEnabled is not available', async () => {
    const originalChrome = globalThis.chrome;

    globalThis.chrome = {
      runtime: { lastError: null },
      management: {
        getAll: mockGetAll,
        // setEnabled intentionally missing
      },
    };

    const { applyThemeInChrome } = await importFreshChromeThemes();

    await expect(applyThemeInChrome('theme1')).rejects.toThrow(
      /chrome\.management API is not available/i
    );

    globalThis.chrome = originalChrome;
  });

  it('uses callback form when promise form throws and resolves', async () => {
    mockSetEnabled.mockImplementation((id, enabled, cb) => {
      // First call (promise attempt) → no callback passed
      if (typeof cb !== 'function') {
        throw new Error('no promise form');
      }

      // Callback fallback
      cb();
    });

    await applyThemeInChrome('theme1');

    expect(mockSetEnabled).toHaveBeenCalledWith('theme1', true);
  });

  it('rejects in callback form when chrome.runtime.lastError is set', async () => {
    mockSetEnabled.mockImplementation((id, enabled, cb) => {
      if (typeof cb !== 'function') {
        throw new Error('no promise form');
      }

      globalThis.chrome.runtime.lastError = { message: 'setEnabled failed' };
      cb();
    });

    await expect(applyThemeInChrome('theme1')).rejects.toThrow('setEnabled failed');
  });

  it('rejects when callback form itself throws (cbErr)', async () => {
    mockSetEnabled.mockImplementation((id, enabled, cb) => {
      if (typeof cb !== 'function') {
        throw new Error('no promise form');
      }

      throw new Error('callback setEnabled broke');
    });

    await expect(applyThemeInChrome('theme1')).rejects.toThrow(
      'callback setEnabled broke'
    );
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
