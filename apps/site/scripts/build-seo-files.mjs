/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// After `react-router build`: turns the prerendered 404 route into 404.html
// (Cloudflare Pages serves a root 404.html, with a 404 status, for any path
// that has no file) and writes sitemap.xml and robots.txt from the pages the
// build prerendered. Everything lands in build/client, under the base path in
// a preview build, next to the pages.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { SITE_URL } from "../app/content/meta.ts";
import { isNoindex, pagePaths, robotsTxt, sitemapXml } from "./seo-files.mjs";

const root = resolve("build/client");
const basePath = process.env.PREVIEW_BASE_PATH;
const base = (basePath ?? "").split("/").filter(Boolean).join("/");
const siteDir = join(root, base);

function log(level, msg) {
  console.log(`${new Date().toISOString()} ${level} build-seo-files: ${msg}`);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

if (!existsSync(join(siteDir, "index.html"))) {
  log("error", `no prerendered home page in ${siteDir}; run react-router build first`);
  process.exit(1);
}

// The 404 route's page becomes 404.html. Leaving 404/index.html in place would
// make /404 a live page that answers 200.
const notFoundDir = join(siteDir, "404");
const notFound = join(siteDir, "404.html");
if (!existsSync(join(notFoundDir, "index.html"))) {
  log("error", `no prerendered /404 in ${siteDir}; is "/404" in the prerender list?`);
  process.exit(1);
}
renameSync(join(notFoundDir, "index.html"), notFound);
rmSync(notFoundDir, { recursive: true });
log("info", `wrote ${relative(root, notFound)}`);

const files = walk(root).map((f) => relative(root, f).split(sep).join("/"));
const pages = pagePaths(files, basePath).filter((p) => {
  const file = join(root, p === "/" ? "index.html" : `${p.slice(1)}/index.html`);
  const skip = isNoindex(readFileSync(file, "utf8"));
  if (skip) log("debug", `${p} asks for noindex; left out of the sitemap`);
  return !skip;
});
if (pages.length === 0) {
  log("error", "no indexable pages found");
  process.exit(1);
}

mkdirSync(dirname(join(siteDir, "sitemap.xml")), { recursive: true });
writeFileSync(join(siteDir, "sitemap.xml"), sitemapXml(SITE_URL, pages));
writeFileSync(join(siteDir, "robots.txt"), robotsTxt(SITE_URL));
log("info", `wrote sitemap.xml with ${pages.length} pages (${pages.join(", ")}) and robots.txt`);
