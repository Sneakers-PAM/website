/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const file = (name: string) => readFileSync(new URL(`./public/${name}`, import.meta.url));

test("the apple-touch-icon is a 180x180 PNG", () => {
  const png = file("apple-touch-icon.png");
  assert.deepEqual([...png.subarray(1, 4)], [0x50, 0x4e, 0x47], "not a PNG");
  assert.equal(png.readUInt32BE(16), 180, "width");
  assert.equal(png.readUInt32BE(20), 180, "height");
});

test("the marks and the favicon are SVGs", () => {
  for (const name of ["favicon.svg", "img/mark-light.svg", "img/mark-dark.svg", "img/app-icon.svg"]) {
    assert.match(file(name).toString("utf8"), /<svg[\s>]/, `${name} is not an SVG`);
  }
});
