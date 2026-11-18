/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Checks the reviewed, unsigned source index of each update feed channel
// (apps/updates/feed/<channel>/index.json) before it is signed and deployed:
// its shape, a sequence higher than the one deployed, and (unless
// --skip-network) that every entry's release asset exists with the listed size.
//
//   node scripts/feed-content.mjs [--skip-network]
//
// GITHUB_TOKEN, when set, authenticates the GitHub API calls.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const CHANNELS = ["rc", "stable"];
export const FEED_HOST = "https://updates.sneakers-pam.com";
export const RELEASES_API = "https://api.github.com/repos/Sneakers-PAM/sneakers-appliance/releases/tags";
const ENTRY_LISTS = ["products", "baseOS", "baseWeb", "base"];
const WITHDRAWN_KINDS = ["product", "baseOS", "baseWeb"];
// RFC 3339 date-time: a required offset, optional fractional seconds.
const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/;

const nonEmpty = (v) => typeof v === "string" && v.length > 0;

function validDate(s) {
  const m = typeof s === "string" ? RFC3339.exec(s) : null;
  if (!m) return false;
  const [, y, mo, d, h, mi, se] = m.map(Number);
  if (mo < 1 || mo > 12 || h > 23 || mi > 59 || se > 60) return false;
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return d >= 1 && d <= days;
}

// The structural problems of one parsed index.
export function shapeProblems(channel, index) {
  const out = [];
  if (index === null || typeof index !== "object" || Array.isArray(index)) return [`${channel}: the index is not a JSON object`];
  const feed = index.feed;
  if (!feed || typeof feed !== "object") {
    out.push(`${channel}: no feed section`);
  } else {
    if (feed.channel !== channel) out.push(`${channel}: feed.channel is ${JSON.stringify(feed.channel)}, expected "${channel}"`);
    if (!Number.isInteger(feed.sequence) || feed.sequence < 1) out.push(`${channel}: feed.sequence must be an integer of 1 or more`);
    if (!validDate(feed.generated_at)) out.push(`${channel}: feed.generated_at is not an RFC 3339 time`);
  }
  for (const list of ENTRY_LISTS) {
    const entries = index[list];
    if (entries === undefined) continue;
    if (!Array.isArray(entries)) {
      out.push(`${channel}: ${list} is not a list`);
      continue;
    }
    entries.forEach((e, i) => {
      const where = `${channel}: ${list}[${i}]${nonEmpty(e?.version) ? ` (${e.version})` : ""}`;
      if (!nonEmpty(e?.file)) out.push(`${where} has no file`);
      if (!nonEmpty(e?.tag)) out.push(`${where} has no tag`);
      if (!Number.isInteger(e?.size) || e.size <= 0) out.push(`${where} needs a positive size`);
    });
  }
  const withdrawn = index.withdrawn;
  if (withdrawn !== undefined) {
    if (!Array.isArray(withdrawn)) out.push(`${channel}: withdrawn is not a list`);
    else
      withdrawn.forEach((w, i) => {
        const where = `${channel}: withdrawn[${i}]`;
        if (!WITHDRAWN_KINDS.includes(w?.kind)) out.push(`${where} needs a kind (${WITHDRAWN_KINDS.join("|")})`);
        if (!nonEmpty(w?.version)) out.push(`${where} has no version`);
        if (!nonEmpty(w?.reason)) out.push(`${where} has no reason`);
      });
  }
  return out;
}

// The sequence must beat the deployed one, unless the bytes are the same.
export function sequenceProblems(channel, sequence, text, deployed) {
  if (!deployed || deployed.text === text) return [];
  if (!(sequence > deployed.sequence)) {
    return [`${channel}: feed.sequence ${sequence} must be higher than the deployed ${deployed.sequence}`];
  }
  return [];
}

// The index currently served, or null when none is (a 404 or no network).
export async function deployedFeed(channel, fetchFn = fetch) {
  let res;
  try {
    res = await fetchFn(`${FEED_HOST}/${channel}/index.json`);
  } catch {
    return null;
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`the deployed ${channel} feed answered ${res.status}`);
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`the deployed ${channel} feed is not valid JSON`);
  }
  return { sequence: parsed?.feed?.sequence, text };
}

// Every entry's file must be an asset of its tag's release, with the same size.
export async function assetProblems(index, fetchFn = fetch, token = "") {
  const out = [];
  const releases = new Map();
  const headers = { accept: "application/vnd.github+json", "user-agent": "sneakers-pam-feed-check" };
  if (token) headers.authorization = `Bearer ${token}`;
  for (const list of ENTRY_LISTS) {
    for (const e of Array.isArray(index[list]) ? index[list] : []) {
      if (!nonEmpty(e?.tag) || !nonEmpty(e?.file)) continue;
      if (!releases.has(e.tag)) {
        let assets = null;
        try {
          const res = await fetchFn(`${RELEASES_API}/${encodeURIComponent(e.tag)}`, { headers });
          if (res.ok) assets = new Map(((await res.json()).assets ?? []).map((a) => [a.name, a.size]));
        } catch {
          // Left as null: reported below as an unreadable release.
        }
        releases.set(e.tag, assets);
      }
      const assets = releases.get(e.tag);
      if (!assets) out.push(`${list} ${e.version ?? ""}: release ${e.tag} could not be read`.replace("  ", " "));
      else if (!assets.has(e.file)) out.push(`${list} ${e.version ?? ""}: release ${e.tag} has no asset ${e.file}`.replace("  ", " "));
      else if (assets.get(e.file) !== e.size) {
        out.push(`${list} ${e.version ?? ""}: ${e.file} is ${assets.get(e.file)} bytes in ${e.tag}, the index says size ${e.size}`.replace("  ", " "));
      }
    }
  }
  return out;
}

// All problems of one channel's source index; none when it has no source.
export async function checkChannel(channel, { root, skipNetwork = false, fetchFn = fetch, token = "" }) {
  const file = join(root, "apps/updates/feed", channel, "index.json");
  if (!existsSync(file)) {
    console.log(`${channel}: no source index, nothing to check`);
    return [];
  }
  const text = readFileSync(file, "utf8");
  if (text.trim() === "") return [`${channel}: the source index is empty`];
  let index;
  try {
    index = JSON.parse(text);
  } catch (e) {
    return [`${channel}: the source index is not valid JSON (${e.message})`];
  }
  const problems = shapeProblems(channel, index);
  try {
    problems.push(...sequenceProblems(channel, index?.feed?.sequence, text, await deployedFeed(channel, fetchFn)));
  } catch (e) {
    problems.push(`${channel}: ${e.message}`);
  }
  if (!skipNetwork) problems.push(...(await assetProblems(index, fetchFn, token)).map((p) => `${channel}: ${p}`));
  console.log(`${channel}: sequence ${index?.feed?.sequence}, ${problems.length} problem(s)${skipNetwork ? " (release assets not checked)" : ""}`);
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = new URL("..", import.meta.url).pathname;
  const skipNetwork = process.argv.includes("--skip-network");
  const token = process.env.GITHUB_TOKEN ?? "";
  const problems = [];
  for (const channel of CHANNELS) problems.push(...(await checkChannel(channel, { root, skipNetwork, token })));
  for (const p of problems) console.error(`feed content check failed: ${p}`);
  if (problems.length) process.exit(1);
  console.log("feed content check passed");
}
