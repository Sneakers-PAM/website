/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import {
  THEME_STORAGE_KEY,
  applyThemeChoice,
  nextThemeChoice,
  readThemeChoice,
  themeInitScript,
  themeSwitchLabel,
} from "./theme.ts";

class FakeRoot {
  attrs = new Map<string, string>();
  getAttribute(name: string) {
    return this.attrs.get(name) ?? null;
  }
  setAttribute(name: string, value: string) {
    this.attrs.set(name, value);
  }
  removeAttribute(name: string) {
    this.attrs.delete(name);
  }
}

class FakeStorage {
  items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
}

// Runs the inline head script the way a browser would, against a fake page.
function runInit(localStorage: () => unknown) {
  const root = new FakeRoot();
  const window = {};
  Object.defineProperty(window, "localStorage", { get: localStorage });
  runInNewContext(themeInitScript, { window, document: { documentElement: root } });
  return root;
}

test("a stored Dark or Light choice is forced before the first paint", () => {
  for (const stored of ["dark", "light"]) {
    const storage = new FakeStorage();
    storage.setItem(THEME_STORAGE_KEY, stored);
    const root = runInit(() => storage);
    assert.equal(root.getAttribute("data-theme"), stored);
    assert.equal(root.getAttribute("data-theme-choice"), stored);
  }
});

test("no stored choice, or an unknown one, falls back to System", () => {
  for (const stored of [null, "sepia"]) {
    const storage = new FakeStorage();
    if (stored) storage.setItem(THEME_STORAGE_KEY, stored);
    const root = runInit(() => storage);
    assert.equal(root.getAttribute("data-theme"), null);
    assert.equal(root.getAttribute("data-theme-choice"), "system");
  }
});

test("storage that throws doesn't break the page and means System", () => {
  const root = runInit(() => {
    throw new Error("SecurityError: storage is disabled");
  });
  assert.equal(root.getAttribute("data-theme"), null);
  assert.equal(root.getAttribute("data-theme-choice"), "system");
});

test("the switch cycles System, Light, Dark and says the current mode", () => {
  assert.equal(nextThemeChoice("system"), "light");
  assert.equal(nextThemeChoice("light"), "dark");
  assert.equal(nextThemeChoice("dark"), "system");
  assert.equal(themeSwitchLabel("dark"), "Switch between dark and light mode (currently dark mode)");
});

test("choosing a theme sets the page and remembers it; System forgets it", () => {
  const root = new FakeRoot();
  const storage = new FakeStorage();
  applyThemeChoice(root, () => storage, "dark");
  assert.equal(root.getAttribute("data-theme"), "dark");
  assert.equal(readThemeChoice(root), "dark");
  assert.equal(storage.getItem(THEME_STORAGE_KEY), "dark");

  applyThemeChoice(root, () => storage, "system");
  assert.equal(root.getAttribute("data-theme"), null);
  assert.equal(readThemeChoice(root), "system");
  assert.equal(storage.getItem(THEME_STORAGE_KEY), null);
});

test("choosing a theme still applies when storage throws", () => {
  const root = new FakeRoot();
  applyThemeChoice(
    root,
    () => {
      throw new Error("SecurityError: storage is disabled");
    },
    "light",
  );
  assert.equal(root.getAttribute("data-theme"), "light");
  assert.equal(readThemeChoice(root), "light");
});
