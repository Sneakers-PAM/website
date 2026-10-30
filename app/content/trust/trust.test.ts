/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { areas, controls } from "./controls.ts";
import { review } from "./review.ts";
import { trustCenter } from "./trust-center.ts";
import { PUBLIC_REPOS } from "./types.ts";

const allText = JSON.stringify({ areas, controls, review, trustCenter });

test("control ids are unique and every control sits in a known area", () => {
  const ids = controls.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  const areaIds = new Set(areas.map((a) => a.id));
  for (const c of controls) assert.ok(areaIds.has(c.area), `${c.id} has unknown area ${c.area}`);
});

test("a shipped or partial control names its tag and its evidence", () => {
  for (const c of controls.filter((c) => c.status === "shipped" || c.status === "partial")) {
    assert.match(c.since ?? "", /^v\d+\.\d+\.\d+(-rc\.\d+)?$/, `${c.id} needs a tag`);
    assert.ok(c.evidence.length > 0, `${c.id} needs evidence`);
  }
});

test("a partial or planned control links the open work that closes it, or says why not", () => {
  for (const c of controls.filter((c) => c.status === "planned")) {
    assert.ok(c.gaps?.length, `${c.id} is planned with no issue`);
  }
});

test("every evidence and issue link points at a public repo", () => {
  const allowed = new Set<string>(PUBLIC_REPOS);
  for (const c of controls) {
    for (const e of c.evidence) assert.ok(allowed.has(e.repo), `${c.id} cites ${e.repo}`);
    for (const g of c.gaps ?? []) assert.ok(allowed.has(g.repo), `${c.id} links ${g.repo}`);
  }
});

test("every review section's areas exist and every area appears in the review", () => {
  const areaIds = new Set(areas.map((a) => a.id));
  const used = new Set(review.sections.flatMap((s) => s.areas ?? []));
  for (const id of used) assert.ok(areaIds.has(id), `review cites unknown area ${id}`);
  for (const id of areaIds) assert.ok(used.has(id), `area ${id} is missing from the review`);
});

test("the content claims no certification", () => {
  assert.doesNotMatch(allText, /\b(is|are|been|we're|fully) (SOC 2|ISO 27001)[ -](certified|compliant|audited)/i);
  assert.doesNotMatch(allText, /\bcertified\b/i);
});

test("the content carries no private addresses or deployment details", () => {
  assert.doesNotMatch(allText, /\b(10|127|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}/);
  assert.doesNotMatch(allText, /\b[a-z0-9-]+\.(local|internal|lan|corp)\b/i);
  assert.doesNotMatch(allText, /\bplan\//);
});
