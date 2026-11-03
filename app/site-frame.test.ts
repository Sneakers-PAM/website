/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

// The shared frame is the source of truth here; the docs repo keeps a byte
// for byte copy (src/css/site-frame.css and static/fonts/) and its own test
// holds the same two checksums. After changing either here, copy the files
// to the docs unchanged and update both checksums in both repos.
const SITE_FRAME_SHA256 = "aa93cae6ef799f7ff4842a46a3187fe5123abd484a3fc736a3a9066c84ae5121";
const FONTS_SHA256 = "27abdef0193b7fea3d84736891e15649aa403c45e3e66b060728faa96a35e69a";

const framePath = new URL("./site-frame.css", import.meta.url);
const fontsDir = new URL("../public/fonts/", import.meta.url);
const frame = readFileSync(framePath, "utf8");
const fonts = readdirSync(fontsDir).filter((name) => name.endsWith(".woff2")).sort();

const sha256 = (data: Buffer | string) => createHash("sha256").update(data).digest("hex");

test("site-frame.css matches the checksum the docs copy is held to", () => {
  assert.equal(sha256(readFileSync(framePath)), SITE_FRAME_SHA256, "site-frame.css changed: copy it to the docs and update the checksum in both repos");
});

test("the font files match the checksum the docs copy is held to", () => {
  const hash = createHash("sha256");
  for (const name of fonts) {
    hash.update(`${name}\n`);
    hash.update(readFileSync(new URL(name, fontsDir)));
  }
  assert.equal(hash.digest("hex"), FONTS_SHA256, "public/fonts changed: copy it to the docs and update the checksum in both repos");
});

test("site-frame.css names the website's copy as the source of truth", () => {
  assert.match(frame, /Source of truth: Sneakers-PAM\/website app\/site-frame\.css/);
});

test("every font the frame declares is a file in public/fonts", () => {
  const urls = [...frame.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  assert.deepEqual([...new Set(urls)].sort(), fonts);
});

test("the root preloads fonts the frame declares", () => {
  const root = readFileSync(new URL("./root.tsx", import.meta.url), "utf8");
  const list = root.match(/const frameFonts = \[([^\]]+)\]/);
  assert.ok(list, "root.tsx has no frameFonts list");
  const preloaded = [...list[1].matchAll(/"([^"]+\.woff2)"/g)].map((match) => match[1]);
  assert.deepEqual(preloaded, ["bricolage-grotesque-latin.woff2", "atkinson-hyperlegible-400-latin.woff2", "jetbrains-mono-latin.woff2"]);
  for (const name of preloaded) assert.ok(fonts.includes(name), `${name} is preloaded but not in public/fonts`);
});
