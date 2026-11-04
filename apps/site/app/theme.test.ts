/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { SITE_CONSENT_PREFIX, applyTheme, pageTheme, themeInitScript } from "./theme.ts";

class FakeRoot {
  attrs = new Map<string, string>();
  style = { colorScheme: "" };
  getAttribute(name: string) {
    return this.attrs.get(name) ?? null;
  }
  setAttribute(name: string, value: string) {
    this.attrs.set(name, value);
  }
}

class SpyStorage {
  items = new Map<string, string>();
  writes = 0;
  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) this.items.set(key, value);
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.writes++;
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.writes++;
    this.items.delete(key);
  }
}

// Runs the inline head script the way a browser would, against a fake page
// with the given system setting.
function runInit(localStorage: unknown, systemDark: boolean) {
  const root = new FakeRoot();
  const matchMedia = (query: string) => ({ matches: query.includes("dark") === systemDark });
  runInNewContext(themeInitScript, { localStorage, matchMedia, document: { documentElement: root } });
  return root;
}

test("before the visitor answers the cookie choice, the page follows the system setting", () => {
  assert.equal(runInit(new SpyStorage(), false).getAttribute("data-theme"), "light");
  assert.equal(runInit(new SpyStorage(), true).getAttribute("data-theme"), "dark");
  assert.equal(runInit(new SpyStorage(), true).getAttribute("data-theme-choice"), "system");
});

test("a theme stored before consent, such as the old 'theme' key, is ignored", () => {
  const storage = new SpyStorage({ theme: "dark", [`${SITE_CONSENT_PREFIX}:pref:theme`]: "dark" });
  assert.equal(runInit(storage, false).getAttribute("data-theme"), "light");
});

test("once the visitor has accepted, their stored theme is set before the first paint", () => {
  const storage = new SpyStorage({
    [`${SITE_CONSENT_PREFIX}:consent`]: "accepted",
    [`${SITE_CONSENT_PREFIX}:pref:theme`]: "dark",
  });
  const root = runInit(storage, false);
  assert.equal(root.getAttribute("data-theme"), "dark");
  assert.equal(root.getAttribute("data-theme-choice"), "dark");
});

test("the head script only reads storage, and survives storage that throws", () => {
  const storage = new SpyStorage();
  runInit(storage, true);
  assert.equal(storage.writes, 0);
  const blocked = {
    getItem() {
      throw new Error("SecurityError: storage is disabled");
    },
  };
  assert.equal(runInit(blocked, false).getAttribute("data-theme"), "light");
});

test("the site keeps its keys under its own prefix", () => {
  assert.equal(SITE_CONSENT_PREFIX, "sneakers-site");
});

test("the page's theme is light unless data-theme says dark", () => {
  assert.equal(pageTheme("dark"), "dark");
  assert.equal(pageTheme("light"), "light");
  assert.equal(pageTheme(null), "light");
});

test("applying a theme sets data-theme and the colour scheme", () => {
  const root = new FakeRoot();
  applyTheme(root, "dark");
  assert.equal(root.getAttribute("data-theme"), "dark");
  assert.equal(root.style.colorScheme, "dark");
  applyTheme(root, "light");
  assert.equal(root.getAttribute("data-theme"), "light");
});
