/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { meta } from "./sneakers-pam.ts";

test("the link preview names the product and points at the production site", () => {
  assert.equal(meta.siteName, "Sneakers-PAM");
  assert.ok(meta.title.startsWith("Sneakers-PAM"), "the title must lead with the product name");
  assert.equal(meta.url, "https://www.sneakers-pam.com/");
  assert.equal(meta.twitterCard, "summary");
});

test("the apple-touch-icon is a 180x180 PNG", () => {
  const png = readFileSync(new URL("../../public/apple-touch-icon.png", import.meta.url));
  assert.deepEqual([...png.subarray(1, 4)], [0x50, 0x4e, 0x47], "not a PNG");
  assert.equal(png.readUInt32BE(16), 180, "width");
  assert.equal(png.readUInt32BE(20), 180, "height");
});
