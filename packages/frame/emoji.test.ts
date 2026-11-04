/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { stripEmoji } from "./emoji.ts";

test("a leading emoji and its space come off a label", () => {
  assert.equal(stripEmoji("\u{1F510} What is Sneakers-PAM?"), "What is Sneakers-PAM?");
  assert.equal(stripEmoji("\u{270B} Approving access requests"), "Approving access requests");
});

test("emoji with a variation selector, a modifier or a joiner come off whole", () => {
  assert.equal(stripEmoji("\u{2638}\u{FE0F} Deploy with Helm"), "Deploy with Helm");
  assert.equal(stripEmoji("\u{1F5A5}\u{FE0F} The web UI"), "The web UI");
  assert.equal(stripEmoji("\u{1F44B}\u{1F3FD} Hello"), "Hello");
  assert.equal(stripEmoji("\u{1F9D1}\u{200D}\u{1F4BB} Contributing"), "Contributing");
  assert.equal(stripEmoji("Secrets \u{1F511} stay in the vault"), "Secrets stay in the vault");
});

test("text symbols that only look like emoji stay", () => {
  assert.equal(
    stripEmoji("Sneakers-PAM\u{2122} and \u{A9}, \u{AE}"),
    "Sneakers-PAM\u{2122} and \u{A9}, \u{AE}",
  );
  assert.equal(stripEmoji("A \u{2194} B, step 1 \u{2192} 2"), "A \u{2194} B, step 1 \u{2192} 2");
  assert.equal(stripEmoji("RFC 6238 #1"), "RFC 6238 #1");
});

test("markup in a heading survives", () => {
  assert.equal(
    stripEmoji("\u{1F4C4} Machine config: <code>sneakers</code>"),
    "Machine config: <code>sneakers</code>",
  );
});
