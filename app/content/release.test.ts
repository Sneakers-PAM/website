/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { downloads, release, verify } from "./release.ts";

test("every download asset points at the current release's tag", () => {
  const prefix = `https://github.com/Sneakers-PAM/sneakers-appliance/releases/download/${release.version}/`;
  for (const asset of downloads) {
    assert.ok(asset.href.startsWith(prefix), `${asset.name} does not point at ${release.version}`);
    assert.ok(asset.href.endsWith(asset.name), `${asset.name}'s href does not end with its own name`);
  }
});

test("every download asset has a positive size and a unique name", () => {
  const seen = new Set<string>();
  for (const asset of downloads) {
    assert.ok(asset.sizeBytes > 0, `${asset.name} has a non-positive size`);
    assert.ok(!seen.has(asset.name), `${asset.name} is listed twice`);
    seen.add(asset.name);
  }
});

test("there is no ISO listed for a release that doesn't ship one", () => {
  assert.ok(
    !downloads.some((asset) => asset.name.endsWith(".iso")),
    "rc.2 has no ISO; one must have been added without checking the release",
  );
});

test("the verify key fingerprint is 64 lowercase hex characters", () => {
  assert.match(verify.keyFingerprint, /^[0-9a-f]{64}$/);
});
