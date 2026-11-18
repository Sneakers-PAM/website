/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Fails when a change ADDS a version to a signed update feed index
// (apps/updates/public/<channel>/index.json) whose docs snapshot is not cut yet
// (apps/docs/versions.json). Only additions count: editing withdrawn, notes,
// feed.sequence or generated_at, or removing or changing existing versions, is
// not checked. Versions are compared with the same index at a base ref; with no
// index there, every listed version counts as added.
//
//   node scripts/check-feed-docs.mjs [--base=<ref>]     (default origin/main)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { docsVersionName, docsVersions } from "./docs-version.mjs";

export const CHANNELS = ["rc", "stable"];
// Only these lists name versions a box can install; withdrawn is metadata.
const VERSION_LISTS = ["products", "baseOS", "baseWeb"];

function versionsOf(index) {
  const out = new Set();
  if (!index) return out;
  for (const list of VERSION_LISTS) {
    for (const entry of index[list] ?? []) {
      if (typeof entry?.version === "string") out.add(entry.version);
    }
  }
  return out;
}

// The versions in head that are not in base (null base: all of them), sorted.
export function addedVersions(head, base) {
  const before = versionsOf(base);
  return [...versionsOf(head)].filter((v) => !before.has(v)).sort();
}

// One message per added version whose docs snapshot is missing.
export function feedDocsProblems(channel, head, base, docs) {
  return addedVersions(head, base)
    .filter((v) => !docs.includes(docsVersionName(v)))
    .map(
      (v) =>
        `${channel} feed adds ${v}, but the docs have no ${docsVersionName(v)} version: ` +
        `cut it (npm run docs:version) and merge it before the feed lists the release`,
    );
}

function baseIndex(root, base, path) {
  try {
    const text = execFileSync("git", ["show", `${base}:${path}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(text);
  } catch {
    // No such ref or no file at the base: nothing was listed there.
    return null;
  }
}

// All problems across the channels, comparing the working tree with `base`.
export function runCheck({ root, base }) {
  const versionsPath = join(root, "apps/docs/versions.json");
  const docs = docsVersions(existsSync(versionsPath) ? readFileSync(versionsPath, "utf8") : undefined);
  const problems = [];
  for (const channel of CHANNELS) {
    const path = `apps/updates/public/${channel}/index.json`;
    const file = join(root, path);
    if (!existsSync(file)) {
      console.log(`${channel}: no feed index, nothing to check`);
      continue;
    }
    const head = JSON.parse(readFileSync(file, "utf8"));
    const added = addedVersions(head, baseIndex(root, base, path));
    console.log(`${channel}: ${added.length} added version(s) against ${base}${added.length ? `: ${added.join(", ")}` : ""}`);
    problems.push(...feedDocsProblems(channel, head, baseIndex(root, base, path), docs));
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv.slice(2).find((a) => a.startsWith("--base="));
  const base = arg ? arg.slice("--base=".length) : "origin/main";
  const root = new URL("..", import.meta.url).pathname;
  const problems = runCheck({ root, base });
  for (const p of problems) console.error(`feed docs check failed: ${p}`);
  if (problems.length) process.exit(1);
  console.log("feed docs check passed");
}
