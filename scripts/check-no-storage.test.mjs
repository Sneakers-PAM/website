/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadPage, storageWritesIn } from "./check-no-storage.mjs";

test("a page whose head scripts only read storage passes", async () => {
  const html =
    '<html><head><script>try{if(localStorage.getItem("a")==="b")document.documentElement.setAttribute("data-x","y")}catch(e){}</script></head></html>';
  assert.deepEqual((await storageWritesIn(html, "page.html")).writes, []);
});

test("a page script that writes localStorage, sessionStorage or a cookie is caught", async () => {
  for (const write of [
    'localStorage.setItem("theme","dark")',
    'window.sessionStorage.setItem("k","v")',
    'document.cookie="a=b"',
    'localStorage.setItem("x","1");localStorage.removeItem("x")',
  ]) {
    const { writes } = await storageWritesIn(`<script>${write}</script>`, "page.html");
    assert.ok(writes.length >= 1, write);
  }
});

test("removing a key that isn't there doesn't count as a write", async () => {
  const { writes } = await storageWritesIn(
    '<script>localStorage.removeItem("theme")</script>',
    "page.html",
  );
  assert.deepEqual(writes, []);
});

test("inline scripts really run, so a reading script can act", async () => {
  const { dom } = await loadPage(
    '<html><body><script>document.documentElement.setAttribute("data-ran","yes")</script></body></html>',
  );
  assert.equal(dom.window.document.documentElement.getAttribute("data-ran"), "yes");
  dom.window.close();
});

test("the emulated system setting reaches the page's scripts", async () => {
  const html =
    '<script>document.documentElement.setAttribute("data-theme", matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")</script>';
  assert.equal((await storageWritesIn(html, "page.html", "light")).theme, "light");
  assert.equal((await storageWritesIn(html, "page.html", "dark")).theme, "dark");
});

test("opening an IndexedDB database is caught", async () => {
  const { writes } = await storageWritesIn('<script>indexedDB.open("prefs")</script>', "page.html");
  assert.deepEqual(writes, ["page.html: indexedDB.open(prefs)"]);
});

test("a page file maps to the URL the docs router serves it at", async () => {
  const { pageUrl } = await import("./check-no-storage.mjs");
  assert.equal(pageUrl("index.html", "/"), "https://example.test/");
  assert.equal(pageUrl("docs/why.html", "/"), "https://example.test/docs/why");
  assert.equal(pageUrl("docs/vnext/index.html", "/docs-ci/"), "https://example.test/docs-ci/docs/vnext/");
});
