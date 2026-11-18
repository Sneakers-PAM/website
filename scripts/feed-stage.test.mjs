/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { stageFeeds } from "./feed-stage.mjs";

function tree() {
  const dir = mkdtempSync(join(tmpdir(), "feed-stage-"));
  for (const c of ["rc", "stable"]) {
    mkdirSync(join(dir, "apps/updates/feed", c), { recursive: true });
    mkdirSync(join(dir, "apps/updates/public", c), { recursive: true });
  }
  return dir;
}

test("each source index is copied byte for byte to public", () => {
  const dir = tree();
  try {
    writeFileSync(join(dir, "apps/updates/feed/rc/index.json"), '{"a": 1}\n');
    const staged = stageFeeds({ root: dir });
    assert.deepEqual(staged, ["rc"]);
    assert.equal(readFileSync(join(dir, "apps/updates/public/rc/index.json"), "utf8"), '{"a": 1}\n');
    assert.ok(!existsSync(join(dir, "apps/updates/public/stable/index.json")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("both channels are staged, and a stale public file with no source is removed", () => {
  const dir = tree();
  try {
    writeFileSync(join(dir, "apps/updates/feed/rc/index.json"), "{}");
    writeFileSync(join(dir, "apps/updates/feed/stable/index.json"), "{}");
    writeFileSync(join(dir, "apps/updates/public/rc/index.json.sigstore.json"), "old");
    assert.deepEqual(stageFeeds({ root: dir }), ["rc", "stable"]);
    assert.ok(!existsSync(join(dir, "apps/updates/public/rc/index.json.sigstore.json")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an empty source file fails", () => {
  const dir = tree();
  try {
    writeFileSync(join(dir, "apps/updates/feed/rc/index.json"), "");
    assert.throws(() => stageFeeds({ root: dir }), /empty/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("no sources stages nothing", () => {
  const dir = tree();
  try {
    assert.deepEqual(stageFeeds({ root: dir }), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
