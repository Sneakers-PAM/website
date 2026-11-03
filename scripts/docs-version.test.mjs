/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { docsVersionProblem, docsVersions, readState, releaseVersion } from "./docs-version.mjs";

test("the release version is read from packages/frame/release.ts", () => {
  assert.equal(releaseVersion('export const release = {\n  version: "v1.2.3-rc.4",\n};'), "v1.2.3-rc.4");
  assert.throws(() => releaseVersion("export const release = {};"));
});

test("no versions.json means no docs versions", () => {
  assert.deepEqual(docsVersions(undefined), []);
  assert.throws(() => docsVersions('{"v1": true}'));
});

test("a release with no docs version can't deploy", () => {
  assert.match(docsVersionProblem("v0.1.0", ["v0.1.0-rc.7"]), /no v0\.1\.0 version/);
  assert.match(docsVersionProblem("v0.1.0", []), /no v0\.1\.0 version/);
});

test("the release's docs version must be the newest, so it's the default", () => {
  assert.match(docsVersionProblem("v0.1.0-rc.7", ["v0.1.0", "v0.1.0-rc.7"]), /isn't the newest/);
  assert.equal(docsVersionProblem("v0.1.0", ["v0.1.0", "v0.1.0-rc.7"]), null);
});

test("the repo's own release has its docs version cut", () => {
  const { version, versions } = readState();
  assert.equal(docsVersionProblem(version, versions), null);
});
