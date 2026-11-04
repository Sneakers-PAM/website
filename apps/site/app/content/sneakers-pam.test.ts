/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { meta } from "./sneakers-pam.ts";

test("the home page's title leads with the product name", () => {
  assert.ok(meta.title.startsWith("Sneakers-PAM"), "the title must lead with the product name");
});
