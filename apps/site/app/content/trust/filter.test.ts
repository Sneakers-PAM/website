/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_VIEW,
  STATUSES,
  countByStatus,
  formatHash,
  parseHash,
  sortControls,
  toggleStatus,
  visibleControls,
} from "./filter.ts";
import type { Control } from "./types.ts";

const control = (id: string, area: string, status: Control["status"]): Control => ({
  id,
  area,
  title: id,
  statement: id,
  status,
  evidence: [],
  mappings: {},
});

const sample: Control[] = [
  control("ARC-1", "architecture", "shipped"),
  control("ARC-2", "architecture", "planned"),
  control("KEY-1", "keys", "partial"),
  control("KEY-2", "keys", "main"),
  control("KEY-3", "keys", "shipped"),
];

test("the statuses run from shipped to planned", () => {
  assert.deepEqual(STATUSES, ["shipped", "main", "partial", "planned"]);
});

test("the default view shows every control in register order", () => {
  assert.deepEqual(DEFAULT_VIEW, { statuses: [], sort: "area" });
  assert.deepEqual(
    visibleControls(sample, DEFAULT_VIEW).map((c) => c.id),
    ["ARC-1", "ARC-2", "KEY-1", "KEY-2", "KEY-3"],
  );
});

test("counts cover every status, zero included", () => {
  assert.deepEqual(countByStatus(sample), { shipped: 2, main: 1, partial: 1, planned: 1 });
  assert.deepEqual(countByStatus([]), { shipped: 0, main: 0, partial: 0, planned: 0 });
});

test("a chip toggles its status on and off, keeping the status order", () => {
  const one = toggleStatus(DEFAULT_VIEW, "planned");
  assert.deepEqual(one.statuses, ["planned"]);
  const two = toggleStatus(one, "shipped");
  assert.deepEqual(two.statuses, ["shipped", "planned"]);
  assert.deepEqual(toggleStatus(two, "planned").statuses, ["shipped"]);
  assert.deepEqual(toggleStatus(toggleStatus(two, "planned"), "shipped"), DEFAULT_VIEW);
});

test("a filter shows only the chosen statuses", () => {
  assert.deepEqual(
    visibleControls(sample, { statuses: ["partial", "planned"], sort: "area" }).map((c) => c.id),
    ["ARC-2", "KEY-1"],
  );
});

test("sorting by status orders shipped first and keeps register order within a status", () => {
  assert.deepEqual(
    sortControls(sample, "status").map((c) => c.id),
    ["ARC-1", "KEY-3", "KEY-2", "KEY-1", "ARC-2"],
  );
  assert.deepEqual(
    sortControls(sample, "area").map((c) => c.id),
    sample.map((c) => c.id),
  );
});

test("the view round-trips through the URL hash", () => {
  const view = { statuses: ["shipped" as const, "planned" as const], sort: "status" as const };
  const hash = formatHash(view);
  assert.equal(hash, "#status=shipped,planned&sort=status");
  assert.deepEqual(parseHash(hash), view);
  assert.equal(formatHash(DEFAULT_VIEW), "");
  assert.equal(formatHash({ statuses: ["main"], sort: "area" }), "#status=main");
});

test("a plain anchor, an empty hash or junk in the hash falls back to the default view", () => {
  assert.deepEqual(parseHash(""), DEFAULT_VIEW);
  assert.deepEqual(parseHash("#"), DEFAULT_VIEW);
  assert.deepEqual(parseHash("#area-keys"), DEFAULT_VIEW);
  assert.deepEqual(parseHash("#status=bogus,planned,planned&sort=sideways"), {
    statuses: ["planned"],
    sort: "area",
  });
});

test("parsed statuses come back in the status order, whatever order the link used", () => {
  assert.deepEqual(parseHash("#status=planned,shipped").statuses, ["shipped", "planned"]);
});
