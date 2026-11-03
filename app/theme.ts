/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The colour theme: System follows prefers-color-scheme, Light and Dark are
// forced. The choice is kept in localStorage under the same key the docs site
// (Docusaurus) uses, and set on <html> as data-theme-choice, plus data-theme
// when it's forced. app.css reads data-theme; the switch reads the choice.

export type ThemeChoice = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

const ORDER: ThemeChoice[] = ["system", "light", "dark"];

export const parseThemeChoice = (value: string | null | undefined): ThemeChoice =>
  value === "light" || value === "dark" ? value : "system";

export const nextThemeChoice = (choice: ThemeChoice): ThemeChoice =>
  ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];

// The same wording as the docs site's switch, so the two read alike.
export const themeSwitchLabel = (choice: ThemeChoice) =>
  `Switch between dark and light mode (currently ${choice} mode)`;

// Runs inline in <head> before the first paint, so a forced theme never
// flashes the other one. Storage that is missing or throws means System.
export const themeInitScript = `(function () {
  var choice = null;
  try {
    choice = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  } catch (e) {}
  var root = document.documentElement;
  if (choice === "light" || choice === "dark") {
    root.setAttribute("data-theme", choice);
    root.setAttribute("data-theme-choice", choice);
  } else {
    root.removeAttribute("data-theme");
    root.setAttribute("data-theme-choice", "system");
  }
})();`;

interface ThemeRoot {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

interface ThemeStorage {
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const readThemeChoice = (root: ThemeRoot): ThemeChoice =>
  parseThemeChoice(root.getAttribute("data-theme-choice"));

export function applyThemeChoice(root: ThemeRoot, storage: (() => ThemeStorage) | null, choice: ThemeChoice) {
  root.setAttribute("data-theme-choice", choice);
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
  try {
    const store = storage?.();
    if (choice === "system") store?.removeItem(THEME_STORAGE_KEY);
    else store?.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // The choice still applies to this page; it just isn't remembered.
  }
}
