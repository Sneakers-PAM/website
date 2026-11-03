/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Cuts the docs version for the current release: snapshots apps/docs/docs
// (Next) into apps/docs/versioned_docs under the version in
// packages/frame/release.ts. Run it in the release's own PR, after the
// version bump, and commit what it writes.
import { execFileSync } from "node:child_process";

import { readState } from "./docs-version.mjs";

const { version, versions } = readState();
if (versions.includes(version)) {
  console.log(`docs version ${version} is already cut; nothing to do`);
  process.exit(0);
}
console.log(`cutting docs version ${version} (existing: ${versions.join(", ") || "none"})`);
execFileSync("npx", ["docusaurus", "docs:version", version], {
  cwd: new URL("../apps/docs/", import.meta.url),
  stdio: "inherit",
});
console.log(`cut docs version ${version}: commit apps/docs/versions.json, versioned_docs/ and versioned_sidebars/`);
