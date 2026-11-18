/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { withdrawn, withdrawnBannerText, withdrawnUse } from "./withdrawn.ts";

test("rc.7, rc.8 and rc.9 are withdrawn, and the version to use is rc.10", () => {
  assert.deepEqual(Object.keys(withdrawn), ["v0.1.0-rc.7", "v0.1.0-rc.8", "v0.1.0-rc.9"]);
  for (const version of Object.keys(withdrawn)) assert.equal(withdrawnUse(version), "v0.1.0-rc.10");
});

test("a version that is not withdrawn has no banner", () => {
  assert.equal(withdrawnUse("v0.1.0-rc.10"), undefined);
  assert.equal(withdrawnUse("current"), undefined);
  assert.equal(withdrawnUse("v0.1.0-rc.6"), undefined);
});

test("the banner says it is withdrawn and which version to use", () => {
  assert.equal(
    withdrawnBannerText("v0.1.0-rc.9", "v0.1.0-rc.10"),
    "v0.1.0-rc.9 is withdrawn, use v0.1.0-rc.10.",
  );
});

test("the release notes mark every withdrawn version, and no other", () => {
  const notes = readFileSync(new URL("../../docs/release-notes.md", import.meta.url), "utf8");
  for (const version of Object.keys(withdrawn)) {
    const start = notes.indexOf(`## ${version}\n`);
    assert.ok(start >= 0, `${version} has a release notes section`);
    const next = notes.indexOf("\n## ", start + 1);
    const section = notes.slice(start, next < 0 ? undefined : next);
    assert.match(section, /:::danger\[Withdrawn\]/, `${version} carries the withdrawn banner`);
    assert.match(section, /use \[v0\.1\.0-rc\.10\]/, `${version} says which version to use`);
  }
  const marked = [...notes.matchAll(/## (v[^\n]+)\n\n:::danger\[Withdrawn\]/g)].map((m) => m[1]);
  assert.deepEqual(marked.sort(), Object.keys(withdrawn).sort());
});
