/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { changedApps } from "./changed-apps.mjs";

test("a docs-only change builds the docs only", () => {
  assert.deepEqual(changedApps(["apps/docs/docs/getting-started.md"]), { siteChanged: false, docsChanged: true });
});

test("a site-only change builds the site only", () => {
  assert.deepEqual(changedApps(["apps/site/app/content/release.ts"]), { siteChanged: true, docsChanged: false });
});

test("a shared package, manifest or workflow builds both", () => {
  for (const file of ["packages/frame/site-frame.css", "package-lock.json", ".github/workflows/checks.yml", "scripts/docs-version.mjs"]) {
    assert.deepEqual(changedApps([file]), { siteChanged: true, docsChanged: true }, file);
  }
});

test("root docs alone build neither app", () => {
  assert.deepEqual(changedApps(["README.md", "AGENTS.md", "NOTICE"]), { siteChanged: false, docsChanged: false });
});
