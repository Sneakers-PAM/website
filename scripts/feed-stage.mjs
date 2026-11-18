/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Copies each channel's reviewed source index (apps/updates/feed/<channel>/
// index.json) to the deploy directory (apps/updates/public/<channel>/index.json),
// so the deploy holds exactly the files the box reads. The signature is made on
// the staged copy in the deploy job; none is ever committed. Prints the staged
// channels, one per line.
//
//   node scripts/feed-stage.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

export const CHANNELS = ["rc", "stable"];

// Returns the channels staged. A leftover index.json* in public/ is removed
// first, so nothing but the staged copy (and later its signature) is there.
export function stageFeeds({ root }) {
  const staged = [];
  for (const channel of CHANNELS) {
    const out = join(root, "apps/updates/public", channel);
    if (existsSync(out)) {
      for (const f of readdirSync(out)) if (f.startsWith("index.json")) rmSync(join(out, f));
    }
    const src = join(root, "apps/updates/feed", channel, "index.json");
    if (!existsSync(src)) continue;
    if (readFileSync(src).length === 0) throw new Error(`${channel}: the source index is empty`);
    mkdirSync(out, { recursive: true });
    copyFileSync(src, join(out, "index.json"));
    staged.push(channel);
  }
  return staged;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const root = new URL("..", import.meta.url).pathname;
    const staged = stageFeeds({ root });
    for (const c of staged) console.log(c);
    console.error(`staged ${staged.length} channel(s)`);
  } catch (e) {
    console.error(`feed stage failed: ${e.message}`);
    process.exit(1);
  }
}
