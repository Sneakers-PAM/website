/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const fonts = readdirSync(new URL("../../../packages/frame/public/fonts/", import.meta.url));

test("the root preloads the three fonts the frame draws with, the same three the docs preload", () => {
  const root = readFileSync(new URL("./root.tsx", import.meta.url), "utf8");
  const list = root.match(/const frameFonts = \[([^\]]+)\]/);
  assert.ok(list, "root.tsx has no frameFonts list");
  const preloaded = [...list[1].matchAll(/"([^"]+\.woff2)"/g)].map((match) => match[1]);
  assert.deepEqual(preloaded, ["bricolage-grotesque-latin.woff2", "atkinson-hyperlegible-400-latin.woff2", "jetbrains-mono-latin.woff2"]);
  for (const name of preloaded) assert.ok(fonts.includes(name), `${name} is preloaded but not in packages/frame/public/fonts`);
});

test("the root imports the shared frame before the site's own styles", () => {
  const root = readFileSync(new URL("./root.tsx", import.meta.url), "utf8");
  const frame = root.indexOf('import "@sneakers-pam/frame/site-frame.css";');
  const app = root.indexOf('import "./app.css";');
  assert.ok(frame >= 0 && app > frame);
});
