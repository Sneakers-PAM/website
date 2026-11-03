/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Which apps a change touches, so CI builds only those. A change under
// apps/site or apps/docs builds that app; anything else (the shared
// packages, the root manifests, the workflows, these scripts) builds both,
// since both apps depend on it. Docs-only files at the root (README and the
// like) build neither.
//
//   node scripts/changed-apps.mjs <base> <head>
//
// prints site_changed=<bool> and docs_changed=<bool> lines for $GITHUB_OUTPUT. With no base
// (a push, a merge group), it builds both.
import { execFileSync } from "node:child_process";

const ROOT_DOCS = /^(README|AGENTS|CLAUDE|CONTRIBUTING|CRYPTO|GOVERNANCE|MAINTAINERS)\.md$|^(LICENSE|NOTICE|AUTHORS|DCO)$/;

export function changedApps(files) {
  let siteChanged = false;
  let docsChanged = false;
  for (const file of files) {
    if (file.startsWith("apps/site/")) siteChanged = true;
    else if (file.startsWith("apps/docs/")) docsChanged = true;
    else if (!ROOT_DOCS.test(file)) {
      siteChanged = true;
      docsChanged = true;
    }
  }
  return { siteChanged, docsChanged };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [base, head] = process.argv.slice(2);
  let result = { siteChanged: true, docsChanged: true };
  if (base && head) {
    const files = execFileSync("git", ["diff", "--name-only", `${base}...${head}`], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
    console.error(`${files.length} changed file(s) between ${base} and ${head}`);
    result = changedApps(files);
  } else {
    console.error("no base to compare with: building both apps");
  }
  console.log(`site_changed=${result.siteChanged}`);
  console.log(`docs_changed=${result.docsChanged}`);
}
