/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { foldedTitle, nextFold, visibleCrumbs } from "./breadcrumb-fold.ts";

test("a trail that fits doesn't fold", () => {
  assert.equal(nextFold({ folded: 0, count: 4, overflows: false, cut: false }), 0);
});

test("a trail that overflows, or cuts the page's name, folds one more crumb, oldest first", () => {
  assert.equal(nextFold({ folded: 0, count: 4, overflows: true, cut: false }), 1);
  assert.equal(nextFold({ folded: 1, count: 4, overflows: false, cut: true }), 2);
});

test("the current page never folds; past that its name ends in an ellipsis instead", () => {
  assert.equal(nextFold({ folded: 3, count: 4, overflows: true, cut: true }), 3);
  assert.equal(nextFold({ folded: 0, count: 1, overflows: true, cut: true }), 0);
});

test("the folded crumbs show as one … item whose title names them", () => {
  const labels = ["Admin guide", "Targets and connections", "Windows Domain Account"];
  assert.deepEqual(visibleCrumbs(labels, 0), labels.map((label) => ({ label, index: labels.indexOf(label) })));
  assert.deepEqual(visibleCrumbs(labels, 2), [
    { label: "…", index: -1 },
    { label: "Windows Domain Account", index: 2 },
  ]);
  assert.equal(foldedTitle(labels, 2), "Admin guide › Targets and connections");
  assert.equal(foldedTitle(labels, 0), "");
});
