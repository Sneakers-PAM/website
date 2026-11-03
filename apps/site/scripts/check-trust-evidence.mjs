/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Checks every evidence path and test name in the trust content against
// local checkouts of the public repos. Not part of CI (the other repos aren't
// checked out there); run it before changing the content:
//   TRUST_EVIDENCE_ROOT=<folder holding the repo checkouts> npm run check:evidence
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { controls } from "../app/content/trust/controls.ts";

const root = process.env.TRUST_EVIDENCE_ROOT;
if (!root) {
  console.error("set TRUST_EVIDENCE_ROOT to the folder holding the Sneakers-PAM repo checkouts");
  process.exit(1);
}

let bad = 0;
for (const c of controls) {
  for (const e of c.evidence) {
    const file = join(root, e.repo, e.path);
    if (!existsSync(file)) {
      console.log(`${c.id} missing ${e.repo}/${e.path}`);
      bad++;
      continue;
    }
    if (e.kind !== "test" || !e.detail || statSync(file).isDirectory()) continue;
    const text = readFileSync(file, "utf8");
    for (const name of e.detail.split(/,\s*/)) {
      if (/^Test\w+$/.test(name) && !text.includes(`func ${name}(`)) {
        console.log(`${c.id} ${e.repo}/${e.path} has no ${name}`);
        bad++;
      }
    }
  }
}
console.log(bad ? `${bad} problem(s)` : "every evidence path and test name resolves");
process.exit(bad ? 1 : 0);
