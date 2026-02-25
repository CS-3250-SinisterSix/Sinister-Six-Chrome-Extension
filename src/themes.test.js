import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  applyTheme,
  revertTheme,
  getCurrentTheme,
  isThemeActive,
  onThemeChange,
  getListenerCount,
  clearAllListeners,
  DEFAULT_THEME,
} from './themes.js';

describe('themes state module', () => {
  beforeEach(() => {
    revertTheme();
    clearAllListeners();
  });

  describe('getCurrentTheme', () => {
    it('returns default theme initially', () => {
      const theme = getCurrentTheme();
      expect(theme.id).toBe('default');
      expect(theme.isDefault).toBe(true);
    });

    it('returns a copy (not the same object)', () => {
      const a = getCurrentTheme();
      const b = getCurrentTheme();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe('applyTheme', () => {
    it('sets the current theme by ID', () => {
      const result = applyTheme('dark-mode');
      expect(result.success).toBe(true);
      expect(result.themeId).toBe('dark-mode');

      const current = getCurrentTheme();
      expect(current.id).toBe('dark-mode');
      expect(current.isDefault).toBe(false);
    });

    it('returns previousThemeId', () => {
      applyTheme('first');
      const result = applyTheme('second');
      expect(result.previousThemeId).toBe('first');
    });

    it('throws TypeError for invalid themeId', () => {
      expect(() => applyTheme('')).toThrow(TypeError);
      expect(() => applyTheme(123)).toThrow(TypeError);
      expect(() => applyTheme(null)).toThrow(TypeError);
    });
  });

  describe('revertTheme', () => {
    it('restores default theme', () => {
      applyTheme('custom');
      const result = revertTheme();

      expect(result.success).toBe(true);
      expect(result.themeId).toBe('default');
      expect(result.previousThemeId).toBe('custom');

      const current = getCurrentTheme();
      expect(current).toEqual(DEFAULT_THEME);
    });
  });

  describe('isThemeActive', () => {
    it('returns true for active theme', () => {
      applyTheme('dark');
      expect(isThemeActive('dark')).toBe(true);
    });

    it('returns false for inactive theme', () => {
      applyTheme('dark');
      expect(isThemeActive('light')).toBe(false);
    });

    it('throws TypeError for non-string', () => {
      expect(() => isThemeActive(123)).toThrow(TypeError);
    });
  });

  describe('onThemeChange', () => {
    it('calls listener when theme changes', () => {
      let received = null;
      onThemeChange((theme) => {
        received = theme;
      });

      applyTheme('dark');
      expect(received.id).toBe('dark');
    });

    it('returns unsubscribe function', () => {
      let callCount = 0;
      const unsub = onThemeChange(() => {
        callCount++;
      });

      applyTheme('a');
      expect(callCount).toBe(1);

      unsub();
      applyTheme('b');
      expect(callCount).toBe(1);
    });

    it('listener errors do not stop other listeners', () => {
      let called = false;
      onThemeChange(() => {
        throw new Error('oops');
      });
      onThemeChange(() => {
        called = true;
      });

      applyTheme('test');
      expect(called).toBe(true);
    });
  });

  describe('getListenerCount / clearAllListeners', () => {
    it('tracks listener count', () => {
      expect(getListenerCount()).toBe(0);
      onThemeChange(() => {});
      expect(getListenerCount()).toBe(1);
    });

    it('clears all listeners', () => {
      onThemeChange(() => {});
      onThemeChange(() => {});
      clearAllListeners();
      expect(getListenerCount()).toBe(0);
    });
  });
});
