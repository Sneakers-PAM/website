/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The update feed host (apps/updates/public): the redirect, the headers and
// the file set, read as Cloudflare Pages reads them.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

const publicDir = new URL("../apps/updates/public/", import.meta.url).pathname;
const SITE = "https://sneakers-pam.com";
const FEED_PATHS = [
  "/rc/index.json",
  "/rc/index.json.sigstore.json",
  "/stable/index.json",
  "/stable/index.json.sigstore.json",
];

function lines(name) {
  return readFileSync(join(publicDir, name), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "" && !l.trim().startsWith("#"));
}

function redirectRules() {
  return lines("_redirects").map((l) => {
    const [from, to, status] = l.trim().split(/\s+/);
    return { from, to, status: Number(status) };
  });
}

// Pages: the first matching rule applies; a trailing /* is a splat; nothing
// else here uses placeholders.
function matches(from, path) {
  if (from.endsWith("/*")) return path.startsWith(from.slice(0, -1));
  return from === path;
}

// What a request gets from the rules alone: a redirect, a pass-through to the
// file (a 200 rule for the path itself), or no rule at all.
function resolve(path) {
  const rule = redirectRules().find((r) => matches(r.from, path));
  if (!rule) return { kind: "none" };
  if (rule.status === 200) return { kind: "file", to: rule.to };
  return { kind: "redirect", status: rule.status, to: rule.to };
}

test("every path other than the four feed paths redirects to the site", () => {
  const others = [
    "/", "/index.html", "/rc", "/rc/", "/stable", "/stable/", "/rc/index.json/", "/rc/index.json.bak",
    "/rc/index.json.sigstore.json.x", "/stable/index.json2", "/rc/other.json", "/rc/.gitkeep",
    "/nightly/index.json", "/_headers", "/_redirects", "/a/b/c/d", "/favicon.ico", "/RC/index.json",
  ];
  for (const p of others) {
    assert.deepEqual(resolve(p), { kind: "redirect", status: 302, to: SITE }, p);
  }
});

test("the feed paths are never redirected, they pass through to their files", () => {
  for (const p of FEED_PATHS) {
    assert.deepEqual(resolve(p), { kind: "file", to: p }, p);
  }
});

test("the redirect target is the site and nothing else is a redirect", () => {
  for (const r of redirectRules().filter((x) => x.status !== 200)) {
    assert.equal(r.status, 302);
    assert.equal(r.to, SITE);
  }
});

test("the headers give the feed paths JSON, nosniff and a 300 s cache", () => {
  const blocks = new Map();
  let current = null;
  for (const l of lines("_headers")) {
    if (!/^\s/.test(l)) {
      current = l.trim();
      blocks.set(current, {});
    } else {
      const [name, ...rest] = l.trim().split(":");
      blocks.get(current)[name.toLowerCase()] = rest.join(":").trim();
    }
  }
  assert.deepEqual([...blocks.keys()].sort(), [...FEED_PATHS].sort());
  for (const [path, h] of blocks) {
    assert.deepEqual(
      h,
      {
        "content-type": "application/json",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
      },
      path,
    );
  }
});

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [relative(publicDir, join(dir, e.name))],
  );
}

test("nothing but the config, the landing page and the four feed files can be served", () => {
  const allowed = new Set(["_redirects", "_headers", "index.html", ...FEED_PATHS.map((p) => p.slice(1))]);
  for (const f of walk(publicDir)) assert.ok(allowed.has(f), `unexpected file in public/: ${f}`);
});

test("the landing page links to the site and holds no script", () => {
  const html = readFileSync(join(publicDir, "index.html"), "utf8");
  assert.ok(html.includes(`href="${SITE}"`));
  assert.ok(!/<script/i.test(html));
});
