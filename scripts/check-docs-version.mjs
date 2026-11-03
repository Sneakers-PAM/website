/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Fails unless the docs have a version cut for the current release (the
// version in packages/frame/release.ts), as the newest one. The deploy
// workflow runs it before building either site, so a release can't go out
// with docs that are missing its version.
import { docsVersionProblem, readState } from "./docs-version.mjs";

const { version, versions } = readState();
console.log(`release ${version}; docs versions: ${versions.join(", ") || "none"}`);
const problem = docsVersionProblem(version, versions);
if (problem) {
  console.error(`docs version check failed: ${problem}`);
  process.exit(1);
}
console.log(`docs version check passed: ${version} is the default docs version`);
