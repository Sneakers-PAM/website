/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { addedVersions, feedDocsProblems, runCheck } from "./check-feed-docs.mjs";

const index = (over = {}) => ({
  format: 2,
  feed: { channel: "rc", sequence: 1, generated_at: "2026-11-18T12:00:00Z" },
  products: [],
  baseOS: [],
  baseWeb: [],
  withdrawn: [],
  ...over,
});
const product = (version) => ({ version, arch: "amd64" });

test("versions come from products, baseOS and baseWeb, not from withdrawn", () => {
  const head = index({
    products: [product("0.1.0-rc.10")],
    baseOS: [{ version: "0.1.0-rc.9" }],
    baseWeb: [{ version: "0.1.0-rc.8" }],
    withdrawn: [{ kind: "product", version: "0.1.0-rc.1" }],
  });
  assert.deepEqual(addedVersions(head, null), ["0.1.0-rc.10", "0.1.0-rc.8", "0.1.0-rc.9"]);
});

test("no index at the base means every listed version is added", () => {
  assert.deepEqual(addedVersions(index({ products: [product("0.1.0-rc.10")] }), null), ["0.1.0-rc.10"]);
});

test("only versions absent from the base count as added", () => {
  const base = index({ products: [product("0.1.0-rc.9")] });
  const head = index({ products: [product("0.1.0-rc.9"), product("0.1.0-rc.10")] });
  assert.deepEqual(addedVersions(head, base), ["0.1.0-rc.10"]);
});

test("an added version without a docs snapshot is a problem", () => {
  const head = index({ products: [product("0.1.0-rc.10")] });
  const problems = feedDocsProblems("rc", head, null, ["v0.1.0-rc.7"]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /0\.1\.0-rc\.10/);
  assert.match(problems[0], /v0\.1\.0-rc\.10/);
});

test("an added version with its docs snapshot passes", () => {
  const head = index({ products: [product("0.1.0-rc.10")] });
  assert.deepEqual(feedDocsProblems("rc", head, null, ["v0.1.0-rc.10", "v0.1.0-rc.7"]), []);
});

test("editing withdrawn, notes, sequence or generated_at skips the check", () => {
  const base = index({ products: [product("0.1.0-rc.10")] });
  const head = index({
    feed: { channel: "rc", sequence: 2, generated_at: "2026-11-19T12:00:00Z" },
    products: [product("0.1.0-rc.10")],
    withdrawn: [{ kind: "product", version: "0.1.0-rc.9", reason: "x" }],
    notes: "text",
  });
  assert.deepEqual(feedDocsProblems("rc", head, base, []), []);
});

test("removing or changing existing versions skips the check", () => {
  const base = index({ products: [product("0.1.0-rc.9"), product("0.1.0-rc.10")] });
  const head = index({ products: [{ version: "0.1.0-rc.10", arch: "amd64", size: 5 }] });
  assert.deepEqual(feedDocsProblems("rc", head, base, []), []);
});

// The CLI path, against a throwaway git repo with a base commit and a change.
function repo() {
  const dir = mkdtempSync(join(tmpdir(), "feed-docs-"));
  const git = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "t@example.org");
  git("config", "user.name", "t");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", "/dev/null");
  mkdirSync(join(dir, "apps/docs"), { recursive: true });
  mkdirSync(join(dir, "apps/updates/feed/rc"), { recursive: true });
  const write = (f, v) => writeFileSync(join(dir, f), typeof v === "string" ? v : JSON.stringify(v));
  return { dir, git, write };
}

test("runCheck compares the working tree's index with the base ref's", () => {
  const { dir, git, write } = repo();
  try {
    write("apps/docs/versions.json", ["v0.1.0-rc.7"]);
    write("apps/updates/feed/rc/index.json", index({ products: [product("0.1.0-rc.7")] }));
    git("add", "-A");
    git("commit", "-q", "-m", "base");

    // Adding rc.10 with no docs snapshot fails.
    write("apps/updates/feed/rc/index.json", index({ products: [product("0.1.0-rc.7"), product("0.1.0-rc.10")] }));
    assert.equal(runCheck({ root: dir, base: "HEAD" }).length, 1);

    // With the snapshot cut it passes.
    write("apps/docs/versions.json", ["v0.1.0-rc.10", "v0.1.0-rc.7"]);
    assert.deepEqual(runCheck({ root: dir, base: "HEAD" }), []);

    // A base ref that does not resolve counts every version as added.
    write("apps/docs/versions.json", []);
    assert.equal(runCheck({ root: dir, base: "0000000000000000000000000000000000000000" }).length, 2);

    // No feed file at all is nothing to check.
    rmSync(join(dir, "apps/updates/feed/rc/index.json"));
    assert.deepEqual(runCheck({ root: dir, base: "HEAD" }), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a version listed in the exempt file needs no docs snapshot", () => {
  const head = { products: [{ version: "0.1.0-rc.8" }, { version: "0.1.0-rc.10" }] };
  const problems = feedDocsProblems("rc", head, null, ["v0.1.0-rc.7"], ["0.1.0-rc.8"]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /0\.1\.0-rc\.10/);
});
