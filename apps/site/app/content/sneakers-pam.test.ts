/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { meta } from "./sneakers-pam.ts";

test("the link preview names the product and points at the production site", () => {
  assert.equal(meta.siteName, "Sneakers-PAM");
  assert.ok(meta.title.startsWith("Sneakers-PAM"), "the title must lead with the product name");
  assert.equal(meta.url, "https://www.sneakers-pam.com/");
  assert.equal(meta.twitterCard, "summary");
});
