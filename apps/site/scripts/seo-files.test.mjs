/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { isNoindex, pagePaths, robotsTxt, sitemapXml } from "./seo-files.mjs";

const origin = "https://www.sneakers-pam.com";

test("every prerendered page is listed, and the 404 page and the SPA fallback are not", () => {
  const files = [
    "index.html",
    "trust/index.html",
    "trust/security-review/index.html",
    "trust/sneakers-security-review.pdf",
    "404.html",
    "404/index.html",
    "__spa-fallback.html",
    "assets/entry.js",
    "fonts/jetbrains-mono-latin.woff2",
  ];
  assert.deepEqual(pagePaths(files), ["/", "/trust", "/trust/security-review"]);
});

test("the page list does not depend on the order the files were found in", () => {
  const files = ["trust/security-review/index.html", "index.html", "trust/index.html"];
  assert.deepEqual(pagePaths(files), ["/", "/trust", "/trust/security-review"]);
});

test("a preview build lists its pages under the base path", () => {
  const files = ["sneakers/preview/index.html", "sneakers/preview/trust/index.html", "sneakers/preview/404.html"];
  assert.deepEqual(pagePaths(files, "/sneakers/preview/"), ["/sneakers/preview", "/sneakers/preview/trust"]);
});

test("the sitemap holds one absolute URL per page, with the home page as the bare origin", () => {
  const xml = sitemapXml(origin, ["/", "/trust"]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/); // scrub:allow=fqdn
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]), [`${origin}/`, `${origin}/trust`]);
  assert.ok(xml.trimEnd().endsWith("</urlset>"));
});

test("a sitemap URL is escaped for XML", () => {
  const xml = sitemapXml(origin, ["/a&b"]);
  assert.ok(xml.includes(`<loc>${origin}/a&amp;b</loc>`));
});

test("robots.txt allows everything and points at the sitemap", () => {
  assert.equal(robotsTxt(origin), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
});

test("a page that asks for noindex is recognised, whichever way the tag is written", () => {
  assert.equal(isNoindex('<head><meta name="robots" content="noindex"/></head>'), true);
  assert.equal(isNoindex('<meta content="noindex, nofollow" name="robots">'), true);
  assert.equal(isNoindex('<meta name="description" content="noindex is a robots value">'), false);
  assert.equal(isNoindex('<meta name="robots" content="index, follow">'), false);
  assert.equal(isNoindex("<title>plain</title>"), false);
});
