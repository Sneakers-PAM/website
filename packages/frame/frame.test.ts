/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { release } from "./release.ts";

const frame = readFileSync(new URL("./site-frame.css", import.meta.url), "utf8");
const fontsDir = new URL("./public/fonts/", import.meta.url);
const fonts = readdirSync(fontsDir).filter((name) => name.endsWith(".woff2")).sort();

test("every font the frame declares is a file in public/fonts, and every file is declared", () => {
  const urls = [...frame.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  assert.deepEqual([...new Set(urls)].sort(), fonts);
});

test("every font ships with its licence", () => {
  const files = readdirSync(fontsDir);
  for (const family of ["atkinson-hyperlegible", "bricolage-grotesque", "jetbrains-mono"]) {
    assert.ok(files.includes(`OFL-${family}.txt`), `no licence for ${family}`);
  }
});

test("the release version is a v-prefixed semver tag", () => {
  assert.match(release.version, /^v\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/);
  assert.equal(release.kind === "prerelease", release.version.includes("-"));
  assert.match(release.publishedOn, /^\d{4}-\d{2}-\d{2}$/);
});
