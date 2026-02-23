import { jest } from "@jest/globals";

import {
  applyTheme,
  revertTheme,
  getCurrentTheme,
  DEFAULT_THEME,
  isThemeActive,
  onThemeChange,
  getListenerCount,
  clearAllListeners,
} from "./themes.js";

beforeEach(() => {
  clearAllListeners();
  revertTheme();
});

describe("themes.js (simplified API)", () => {
  test("getCurrentTheme returns DEFAULT_THEME initially", () => {
    expect(getCurrentTheme()).toEqual(DEFAULT_THEME);
  });

  test("applyTheme sets current theme and returns success", () => {
    const result = applyTheme("dark-mode");
    expect(result.success).toBe(true);
    expect(result.themeId).toBe("dark-mode");

    const theme = getCurrentTheme();
    expect(theme).toEqual({ id: "dark-mode", isDefault: false });
  });

  test("applyTheme includes previousThemeId", () => {
    applyTheme("first");
    const result = applyTheme("second");
    expect(result.previousThemeId).toBe("first");
  });

  test("applyTheme throws on invalid themeId", () => {
    expect(() => applyTheme("")).toThrow(TypeError);
    // @ts-ignore
    expect(() => applyTheme(null)).toThrow(TypeError);
  });

  test("revertTheme restores DEFAULT_THEME and returns previousThemeId", () => {
    applyTheme("dark-mode");
    const result = revertTheme();

    expect(result.success).toBe(true);
    expect(result.themeId).toBe(DEFAULT_THEME.id);
    expect(result.previousThemeId).toBe("dark-mode");
    expect(getCurrentTheme()).toEqual(DEFAULT_THEME);
  });

  test("isThemeActive reflects current theme id", () => {
    applyTheme("dark-mode");
    expect(isThemeActive("dark-mode")).toBe(true);
    expect(isThemeActive("other")).toBe(false);
  });

  test("onThemeChange notifies listeners; unsubscribe stops notifications", () => {
    const calls = [];
    const unsubscribe = onThemeChange((theme) => calls.push(theme.id));

    applyTheme("dark-mode");
    revertTheme();

    expect(calls).toEqual(["dark-mode", "default"]);

    unsubscribe();
    applyTheme("another");

    expect(calls).toEqual(["dark-mode", "default"]);
  });

  test("getListenerCount and clearAllListeners work", () => {
    onThemeChange(() => {});
    onThemeChange(() => {});
    expect(getListenerCount()).toBe(2);

    clearAllListeners();
    expect(getListenerCount()).toBe(0);
  });
});

test("applyTheme returns failure object if notifyListeners throws", () => {
  // Listener throws, so notifyListeners will try to console.error(...)
  onThemeChange(() => {
    throw new Error("listener boom");
  });

  // Make console.error throw so notifyListeners itself throws
  const originalConsoleError = console.error;
  console.error = () => {
    throw new Error("console boom");
  };

  try {
    const result = applyTheme("dark-mode");

    expect(result.success).toBe(false);
    expect(result.themeId).toBe("dark-mode");
    expect(result.error).toBe("console boom");
  } finally {
    // Always restore console.error
    console.error = originalConsoleError;
    clearAllListeners();
    revertTheme();
  }
});

test("revertTheme returns failure object if notifyListeners throws", () => {
  // Set a non-default theme first, so revertTheme is meaningful
  applyTheme("dark-mode");

  // Listener throws → notifyListeners will try to console.error(...)
  onThemeChange(() => {
    throw new Error("listener boom");
  });

  const originalConsoleError = console.error;
  console.error = () => {
    throw new Error("console boom");
  };

  try {
    const result = revertTheme();

    expect(result.success).toBe(false);
    expect(result.themeId).toBe(DEFAULT_THEME.id);
    // previousThemeId should be the active theme before revert
    expect(result.previousThemeId).toBe("dark-mode");
    expect(result.error).toBe("console boom");
  } finally {
    console.error = originalConsoleError;
    clearAllListeners();
    // Put state back in a clean place for the next tests
    revertTheme();
  }
});

test("getCurrentTheme returns DEFAULT_THEME when currentTheme is null (fresh module)", async () => {
  // Reset module cache so module-level state (currentTheme) resets to null
  jest.resetModules();

  const mod = await import("./themes.js");
  const theme = mod.getCurrentTheme();

  expect(theme).toEqual(mod.DEFAULT_THEME);
});

test("isThemeActive throws TypeError when themeId is not a string", () => {
  // @ts-ignore intentional bad input
  expect(() => isThemeActive(null)).toThrow(TypeError);

  // @ts-ignore intentional bad input
  expect(() => isThemeActive(123)).toThrow(TypeError);

  // Optional: verify the message if you want to be exact
  // expect(() => isThemeActive(null)).toThrow("themeId must be a string");
});

test("onThemeChange throws TypeError when callback is not a function", () => {
  // @ts-ignore intentional bad input
  expect(() => onThemeChange(null)).toThrow(TypeError);

  // @ts-ignore intentional bad input
  expect(() => onThemeChange("not a function")).toThrow(TypeError);
});