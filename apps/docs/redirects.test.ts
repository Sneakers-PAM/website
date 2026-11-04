/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { oldDocsPaths } from "./redirects.ts";

test("every vNext page still answers at its old /docs/next path", () => {
  assert.deepEqual(oldDocsPaths("/docs/vnext"), ["/docs/next"]);
  assert.deepEqual(oldDocsPaths("/docs/vnext/"), ["/docs/next/"]);
  assert.deepEqual(oldDocsPaths("/docs/vnext/concepts/approvals"), ["/docs/next/concepts/approvals"]);
});

test("released pages and pages outside the docs get no redirect", () => {
  assert.deepEqual(oldDocsPaths("/docs"), []);
  assert.deepEqual(oldDocsPaths("/docs/concepts/approvals"), []);
  assert.deepEqual(oldDocsPaths("/docs/v0.1.0-rc.7/why"), []);
  assert.deepEqual(oldDocsPaths("/docs/vnextish/why"), []);
  assert.deepEqual(oldDocsPaths("/"), []);
});
