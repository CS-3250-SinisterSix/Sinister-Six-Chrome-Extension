import { jest } from "@jest/globals";

import {
  applyTheme,
  revertTheme,
  getCurrentTheme,
  DEFAULT_THEME,
  isValidTheme,
  isThemeActive,
  createTheme,
  onThemeChange,
  getListenerCount,
  clearAllListeners,
} from "./themes.js";

/** Helper: build a valid Theme object with optional overrides */
function makeTheme(overrides = {}) {
  return {
    id: "t",
    name: "Theme",
    colors: {
      primary: "#111111",
      secondary: "#222222",
      background: "#ffffff",
      text: "#000000",
    },
    isDark: false,
    ...overrides,
    // allow overriding nested colors cleanly
    colors: { ...(overrides.colors ?? {}), ...(overrides.colors ? overrides.colors : {}) },
  };
}

// Keep listeners clean between tests (module state)
beforeEach(() => {
  clearAllListeners();
});

test("getCurrentTheme returns default theme (normal case)", () => {
  // In many tests we will have touched module state, so this test is not intended
  // to verify the 'currentTheme === null' branch; that's covered separately below.
  const theme = getCurrentTheme();
  expect(theme.id).toBe(DEFAULT_THEME.id);
  expect(theme.name).toBe(DEFAULT_THEME.name);
});

test("applyTheme sets a new theme and getCurrentTheme returns a copy", () => {
  const newTheme = makeTheme({ id: "dark", name: "Dark Theme", isDark: true, colors: { background: "#000000", text: "#ffffff" } });

  applyTheme(newTheme);

  const current1 = getCurrentTheme();
  expect(current1.id).toBe("dark");
  expect(current1.name).toBe("Dark Theme");

  // immutability: returned object is a copy
  current1.name = "Hacked";
  expect(getCurrentTheme().name).toBe("Dark Theme");
});

test("revertTheme restores default theme", () => {
  applyTheme(makeTheme({ id: "custom", name: "Custom" }));

  const result = revertTheme();
  expect(result.success).toBe(true);
  expect(result.themeId).toBe(DEFAULT_THEME.id);

  expect(getCurrentTheme().id).toBe(DEFAULT_THEME.id);
});

test("applyTheme returns previousThemeId when a theme was already active", () => {
  applyTheme(makeTheme({ id: "a", name: "A" }));
  const result = applyTheme(makeTheme({ id: "b", name: "B" }));

  expect(result.success).toBe(true);
  expect(result.themeId).toBe("b");
  expect(result.previousThemeId).toBe("a");
});

test("revertTheme returns previousThemeId when reverting from a custom theme", () => {
  applyTheme(makeTheme({ id: "custom", name: "Custom" }));
  const result = revertTheme();

  expect(result.success).toBe(true);
  expect(result.themeId).toBe(DEFAULT_THEME.id);
  expect(result.previousThemeId).toBe("custom");
});

test("isThemeActive returns true only for active theme id", () => {
  applyTheme(makeTheme({ id: "blue", name: "Blue Theme" }));

  expect(isThemeActive("blue")).toBe(true);
  expect(isThemeActive("not-blue")).toBe(false);
});

test("createTheme auto-detects isDark for dark/light backgrounds", () => {
  const dark = createTheme("dark", "Dark", {
    primary: "#ffffff",
    secondary: "#ffffff",
    background: "#000000",
    text: "#ffffff",
  });

  const light = createTheme("light", "Light", {
    primary: "#000000",
    secondary: "#000000",
    background: "#ffffff",
    text: "#000000",
  });

  expect(dark.isDark).toBe(true);
  expect(light.isDark).toBe(false);
});

test("createTheme sets isDark false when background is invalid format", () => {
  const theme = createTheme("bad-bg", "Bad BG", {
    primary: "#111111",
    secondary: "#222222",
    background: "white", // invalid hex format (doesn't start with '#')
    text: "#000000",
  });

  expect(theme.isDark).toBe(false);
});

test("onThemeChange registers listener, calls it on applyTheme, and unsubscribe works", () => {
  const cb = jest.fn();
  const unsubscribe = onThemeChange(cb);

  expect(getListenerCount()).toBe(1);

  applyTheme(makeTheme({ id: "listener-test" }));
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith(expect.objectContaining({ id: "listener-test" }));

  unsubscribe();
  expect(getListenerCount()).toBe(0);
});

test("clearAllListeners removes all listeners", () => {
  onThemeChange(() => {});
  onThemeChange(() => {});
  expect(getListenerCount()).toBe(2);

  clearAllListeners();
  expect(getListenerCount()).toBe(0);
});

test("listener errors do not stop other listeners", () => {
  const bad = () => {
    throw new Error("boom");
  };
  const good = jest.fn();

  onThemeChange(bad);
  onThemeChange(good);

  applyTheme(makeTheme({ id: "t2" }));
  expect(good).toHaveBeenCalledTimes(1);
});

test("validation: throws TypeError on invalid inputs", () => {
  expect(() => applyTheme(null)).toThrow(TypeError);
  expect(() => applyTheme({})).toThrow(TypeError);
  expect(() => applyTheme({ id: 123 })).toThrow(TypeError);

  expect(() => isThemeActive(123)).toThrow(TypeError);
  expect(() => onThemeChange(null)).toThrow(TypeError);

  expect(() => createTheme("", "Name", {})).toThrow(TypeError);
  expect(() => createTheme("id", "", {})).toThrow(TypeError);
  expect(() => createTheme("id", "Name", null)).toThrow(TypeError);
});

test("isValidTheme covers all validation branches", () => {
  const valid = {
    id: "ok",
    name: "OK",
    isDark: false,
    colors: {
      primary: "#111111",
      secondary: "#222222",
      background: "#ffffff",
      text: "#000000",
    },
  };

  // Hits: if (!theme || typeof theme !== 'object')
  expect(isValidTheme(null)).toBe(false);

  // Hits: invalid id
  expect(isValidTheme({ ...valid, id: "" })).toBe(false);

  // Hits: invalid name
  expect(isValidTheme({ ...valid, name: "" })).toBe(false);

  // Hits: invalid isDark type
  expect(isValidTheme({ ...valid, isDark: "false" })).toBe(false);

  // Hits: missing/invalid colors object
  expect(isValidTheme({ ...valid, colors: null })).toBe(false);

  // Hits: loop check (non-string color value)
  expect(
    isValidTheme({
      ...valid,
      colors: { ...valid.colors, text: 123 },
    })
  ).toBe(false);

  // Hits: return true
  expect(isValidTheme(valid)).toBe(true);
});


test("applyTheme catch path: returns success:false when internal error occurs", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {
    throw new Error("console.error failure");
  });

  try {
    onThemeChange(() => {
      throw new Error("listener boom");
    });

    const result = applyTheme(makeTheme({ id: "x", name: "X" }));
    expect(result.success).toBe(false);
    expect(result.themeId).toBe("x");
    expect(result.error).toBeDefined();
  } finally {
    spy.mockRestore();
  }
});

test("revertTheme catch path: returns success:false when internal error occurs", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {
    throw new Error("console.error failure");
  });

  try {
    onThemeChange(() => {
      throw new Error("listener boom");
    });

    const result = revertTheme();
    expect(result.success).toBe(false);
    expect(result.themeId).toBe(DEFAULT_THEME.id);
    expect(result.error).toBeDefined();
  } finally {
    spy.mockRestore();
  }
});

/**
 * Coverage-only: cover getCurrentTheme() branch when currentTheme is null.
 * Must use fresh module import to reset module-level state.
 */
test("getCurrentTheme returns default when currentTheme is null (fresh module)", async () => {
  jest.resetModules();
  const mod = await import("./themes.js");
  expect(mod.getCurrentTheme().id).toBe(mod.DEFAULT_THEME.id);
});
