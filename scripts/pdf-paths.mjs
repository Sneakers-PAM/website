/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { join, normalize, sep } from "node:path";

// Where the PDF step reads and writes, for a build under basePath (the same
// PREVIEW_BASE_PATH vite.config.ts and react-router.config.ts read). The
// prerender puts a preview build under build/client/<base>/, so the page,
// its prerendered file and the PDF all move there with it.
export function pdfPaths(root, basePath, pdfName) {
  const base = `/${(basePath ?? "").split("/").filter(Boolean).join("/")}`.replace(/\/$/, "");
  const siteDir = normalize(join(root, base));
  if (siteDir !== root && !siteDir.startsWith(root + sep)) {
    throw new Error(`PREVIEW_BASE_PATH ${basePath} points outside ${root}`);
  }
  return {
    base,
    page: `${base}/trust/security-review`,
    prerendered: join(siteDir, "trust/security-review/index.html"),
    out: join(siteDir, "trust", pdfName),
  };
}

// The file a request for pathname maps to. The prerendered pages sit under
// build/client/<base>/, but Vite writes the assets and public/ files to
// build/client/ itself while their URLs carry the base, so a path that isn't
// under the base folder falls back to the same path without it.
export function requestFile(root, base, pathname, exists) {
  const direct = normalize(join(root, pathname));
  if (!base || exists(direct) || !pathname.startsWith(`${base}/`)) return direct;
  return normalize(join(root, pathname.slice(base.length)));
}
