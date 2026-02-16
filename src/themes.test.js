import { jest } from "@jest/globals";

import {
  applyTheme,
  revertTheme,
  getCurrentTheme,
  DEFAULT_THEME
} from './themes.js';


/*
Test 1: Default theme exists
*/
test('getCurrentTheme returns default theme initially', () => {
  const theme = getCurrentTheme();

  expect(theme.id).toBe(DEFAULT_THEME.id);
  expect(theme.name).toBe(DEFAULT_THEME.name);
});


/*
Test 2: applyTheme changes the theme
*/
test('applyTheme sets a new theme', () => {

  const newTheme = {
    id: 'dark',
    name: 'Dark Theme',
    colors: {
      primary: '#000000',
      secondary: '#111111',
      background: '#000000',
      text: '#ffffff'
    },
    isDark: true
  };

  applyTheme(newTheme);

  const current = getCurrentTheme();

  expect(current.id).toBe('dark');
  expect(current.name).toBe('Dark Theme');
});


/*
Test 3: revertTheme restores default theme
*/
test('revertTheme restores default theme', () => {

  revertTheme();

  const theme = getCurrentTheme();

  expect(theme.id).toBe(DEFAULT_THEME.id);
});

import { isValidTheme, isThemeActive, createTheme } from "./themes.js";

// Test 4: applyTheme should throw on bad input
test("applyTheme throws if theme is null", () => {
  expect(() => applyTheme(null)).toThrow(TypeError);
});

// Test 5: isThemeActive works
test("isThemeActive returns true only for active theme id", () => {
  const t = {
    id: "blue",
    name: "Blue Theme",
    colors: {
      primary: "#0000ff",
      secondary: "#0000aa",
      background: "#ffffff",
      text: "#000000",
    },
    isDark: false,
  };

  applyTheme(t);

  expect(isThemeActive("blue")).toBe(true);
  expect(isThemeActive("not-blue")).toBe(false);
});

// Test 6: createTheme auto-detects isDark from background
test("createTheme sets isDark true for dark background and false for light background", () => {
  const darkTheme = createTheme("dark", "Dark", {
    primary: "#ffffff",
    secondary: "#ffffff",
    background: "#000000",
    text: "#ffffff",
  });

  const lightTheme = createTheme("light", "Light", {
    primary: "#000000",
    secondary: "#000000",
    background: "#ffffff",
    text: "#000000",
  });

  expect(darkTheme.isDark).toBe(true);
  expect(lightTheme.isDark).toBe(false);
});

import { onThemeChange, getListenerCount, clearAllListeners } from "./themes.js";

test("onThemeChange registers a listener and returns an unsubscribe function", () => {
  clearAllListeners();

  const cb = jest.fn();
  const unsubscribe = onThemeChange(cb);

  expect(getListenerCount()).toBe(1);

  unsubscribe();
  expect(getListenerCount()).toBe(0);
});

test("listener is called when applyTheme is used", () => {
  clearAllListeners();

  const cb = jest.fn();
  onThemeChange(cb);

  const theme = {
    id: "listener-test",
    name: "Listener Test",
    colors: {
      primary: "#111111",
      secondary: "#222222",
      background: "#ffffff",
      text: "#000000",
    },
    isDark: false,
  };

  applyTheme(theme);

  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith(expect.objectContaining({ id: "listener-test" }));
});

test("clearAllListeners removes all listeners", () => {
  clearAllListeners();

  onThemeChange(() => {});
  onThemeChange(() => {});
  expect(getListenerCount()).toBe(2);

  clearAllListeners();
  expect(getListenerCount()).toBe(0);
});
