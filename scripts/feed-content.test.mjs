/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { assetProblems, checkChannel, deployedFeed, sequenceProblems, shapeProblems } from "./feed-content.mjs";

const entry = (over = {}) => ({ version: "0.1.0-rc.10", file: "p.bin", tag: "v0.1.0-rc.10", size: 100, ...over });
const index = (over = {}) => ({
  format: 2,
  feed: { channel: "rc", sequence: 5, generated_at: "2026-11-18T12:00:00Z" },
  products: [entry()],
  baseOS: [],
  baseWeb: [],
  base: [],
  withdrawn: [],
  ...over,
});
const res = (status, body = "") => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  json: async () => body,
});

test("a well-formed index has no shape problems", () => {
  assert.deepEqual(shapeProblems("rc", index()), []);
});

test("the feed section must name the directory's channel, a sequence and a date", () => {
  assert.match(shapeProblems("stable", index()).join("\n"), /channel/);
  assert.match(shapeProblems("rc", index({ feed: undefined })).join("\n"), /feed/);
  for (const sequence of [0, -1, 1.5, "5"]) {
    const p = shapeProblems("rc", index({ feed: { channel: "rc", sequence, generated_at: "2026-11-18T12:00:00Z" } }));
    assert.match(p.join("\n"), /sequence/, String(sequence));
  }
  for (const generated_at of ["yesterday", "2026-11-18", "2026-13-18T12:00:00Z", 5, undefined]) {
    const p = shapeProblems("rc", index({ feed: { channel: "rc", sequence: 1, generated_at } }));
    assert.match(p.join("\n"), /generated_at/, String(generated_at));
  }
  assert.deepEqual(
    shapeProblems("rc", index({ feed: { channel: "rc", sequence: 1, generated_at: "2026-11-18T12:00:00+02:00" } })),
    [],
  );
});

test("every entry needs file, tag and a positive size", () => {
  for (const list of ["products", "baseOS", "baseWeb", "base"]) {
    for (const bad of [{ file: "" }, { tag: undefined }, { size: 0 }, { size: -3 }, { size: "9" }]) {
      const p = shapeProblems("rc", index({ [list]: [entry(bad)] }));
      assert.equal(p.length, 1, `${list} ${JSON.stringify(bad)}`);
      assert.match(p[0], new RegExp(list));
    }
  }
});

test("withdrawn entries need a kind, a version and a reason", () => {
  const ok = { kind: "baseWeb", version: "1", reason: "r" };
  assert.deepEqual(shapeProblems("rc", index({ withdrawn: [ok] })), []);
  for (const bad of [{ kind: "other" }, { kind: undefined }, { version: "" }, { reason: undefined }]) {
    assert.equal(shapeProblems("rc", index({ withdrawn: [{ ...ok, ...bad }] })).length, 1, JSON.stringify(bad));
  }
});

test("a list that is not an array is a problem", () => {
  assert.equal(shapeProblems("rc", index({ products: {} })).length, 1);
});

test("the sequence must be strictly higher than the deployed one", () => {
  assert.deepEqual(sequenceProblems("rc", 6, "a", { sequence: 5, text: "b" }), []);
  assert.match(sequenceProblems("rc", 5, "a", { sequence: 5, text: "b" })[0], /sequence/);
  assert.match(sequenceProblems("rc", 4, "a", { sequence: 5, text: "b" })[0], /sequence/);
});

test("the same bytes as the deployed feed pass, and nothing deployed passes", () => {
  assert.deepEqual(sequenceProblems("rc", 5, "same", { sequence: 5, text: "same" }), []);
  assert.deepEqual(sequenceProblems("rc", 1, "a", null), []);
});

test("deployedFeed reads the live index, and a 404 or a network error means none", async () => {
  let url;
  const live = await deployedFeed("rc", async (u) => ((url = u), res(200, index())));
  assert.equal(url, "https://updates.sneakers-pam.com/rc/index.json");
  assert.equal(live.sequence, 5);
  assert.equal(await deployedFeed("rc", async () => res(404)), null);
  assert.equal(
    await deployedFeed("rc", async () => {
      throw new Error("offline");
    }),
    null,
  );
});

test("a deployed feed that cannot be read, other than a 404, is an error", async () => {
  await assert.rejects(deployedFeed("rc", async () => res(500)), /500/);
  await assert.rejects(deployedFeed("rc", async () => res(200, "not json")), /JSON/);
  // Before a channel has a feed the host answers the feed path with its HTML
  // fallback page: that is no feed deployed, not a broken one.
  assert.equal(await deployedFeed("rc", async () => res(200, "<!doctype html>\n<html></html>")), null);
});

test("assets must exist with the same size", async () => {
  const api = (assets) => async () => res(200, { assets });
  assert.deepEqual(await assetProblems(index(), api([{ name: "p.bin", size: 100 }])), []);
  assert.match((await assetProblems(index(), api([{ name: "p.bin", size: 99 }])))[0], /size/);
  assert.match((await assetProblems(index(), api([{ name: "other.bin", size: 100 }])))[0], /p\.bin/);
  assert.match((await assetProblems(index(), async () => res(404)))[0], /v0\.1\.0-rc\.10/);
});

test("asset lookups use the release tag URL, the token and one call per tag", async () => {
  const calls = [];
  const fetchFn = async (u, init) => (calls.push([u, init]), res(200, { assets: [{ name: "a", size: 1 }, { name: "b", size: 2 }] }));
  const idx = index({ products: [entry({ file: "a", size: 1 }), entry({ file: "b", size: 2 })] });
  assert.deepEqual(await assetProblems(idx, fetchFn, "tok"), []);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "https://api.github.com/repos/Sneakers-PAM/sneakers-appliance/releases/tags/v0.1.0-rc.10");
  assert.equal(calls[0][1].headers.authorization, "Bearer tok");
});

function tree() {
  const dir = mkdtempSync(join(tmpdir(), "feed-content-"));
  mkdirSync(join(dir, "apps/updates/feed/rc"), { recursive: true });
  return { dir, put: (v) => writeFileSync(join(dir, "apps/updates/feed/rc/index.json"), typeof v === "string" ? v : JSON.stringify(v)) };
}

test("checkChannel: no source file is nothing to check; bad JSON and an empty file fail", async () => {
  const { dir, put } = tree();
  try {
    const noNet = { root: dir, skipNetwork: true, fetchFn: async () => res(404) };
    assert.deepEqual(await checkChannel("stable", noNet), []);
    put("{nope");
    assert.match((await checkChannel("rc", noNet))[0], /JSON/);
    put("");
    assert.match((await checkChannel("rc", noNet))[0], /empty/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("checkChannel: --skip-network makes no asset call; the deployed sequence is still compared", async () => {
  const { dir, put } = tree();
  try {
    put(index());
    const urls = [];
    const fetchFn = async (u) => (urls.push(u), u.includes("updates.") ? res(200, index({ feed: { channel: "rc", sequence: 5, generated_at: "2026-11-18T12:00:00Z" }, products: [] })) : res(500));
    const problems = await checkChannel("rc", { root: dir, skipNetwork: true, fetchFn });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /sequence/);
    assert.ok(urls.every((u) => u.startsWith("https://updates.sneakers-pam.com/")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("checkChannel: with the network it checks the assets too", async () => {
  const { dir, put } = tree();
  try {
    put(index());
    const fetchFn = async (u) => (u.includes("api.github.com") ? res(200, { assets: [{ name: "p.bin", size: 7 }] }) : res(404));
    const problems = await checkChannel("rc", { root: dir, skipNetwork: false, fetchFn });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /size/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
