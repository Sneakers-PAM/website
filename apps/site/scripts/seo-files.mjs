/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/

const trimSlashes = (s) => (s ?? "").split("/").filter(Boolean).join("/");

// The pages a build prerendered, as paths on the live site, from the file
// paths found under build/client (relative, with forward slashes). Only an
// index.html in a folder is a page: 404.html and __spa-fallback.html are
// served for other paths, and the 404 route's own prerender (404/index.html)
// is not a page either. basePath is the PREVIEW_BASE_PATH of a one-off preview
// build, whose pages sit under it.
export function pagePaths(files, basePath) {
  const base = trimSlashes(basePath);
  const prefix = base ? `${base}/` : "";
  const pages = [];
  for (const file of files) {
    if (!file.startsWith(prefix)) continue;
    const rel = file.slice(prefix.length);
    if (rel !== "index.html" && !rel.endsWith("/index.html")) continue;
    const dir = rel.slice(0, -"index.html".length).replace(/\/$/, "");
    if (dir === "404") continue;
    pages.push(`/${[base, dir].filter(Boolean).join("/")}`);
  }
  return pages.sort();
}

// The sitemap protocol's XML namespace, an identifier and not a host to visit.
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"; // scrub:allow=fqdn

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// The sitemap lists each page once, as an absolute URL.
export function sitemapXml(origin, paths) {
  const urls = paths.map((p) => `  <url><loc>${escapeXml(`${origin}${p}`)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}">\n${urls}\n</urlset>\n`;
}

// Everything is open to crawlers; the file is here to point them at the sitemap.
export function robotsTxt(origin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

// Whether a prerendered page asks crawlers to skip it. Such a page stays out of
// the sitemap, which would otherwise list a URL its own tag refuses.
export function isNoindex(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (/\bname=["']robots["']/i.test(tag) && /\bcontent=["'][^"']*noindex/i.test(tag)) return true;
  }
  return false;
}
