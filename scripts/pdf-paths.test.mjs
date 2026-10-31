/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { pdfPaths, requestFile } from "./pdf-paths.mjs";

const root = "/site/build/client";
const name = "sneakers-security-review.pdf";

test("a normal build prints /trust/security-review into build/client/trust", () => {
  for (const base of [undefined, "", "/"]) {
    assert.deepEqual(pdfPaths(root, base, name), {
      base: "",
      page: "/trust/security-review",
      prerendered: "/site/build/client/trust/security-review/index.html",
      out: "/site/build/client/trust/sneakers-security-review.pdf",
    });
  }
});

test("a preview build prints from under its base path and writes the PDF there", () => {
  for (const base of ["/sneakers/preview/", "/sneakers/preview", "sneakers/preview/"]) {
    assert.deepEqual(pdfPaths(root, base, name), {
      base: "/sneakers/preview",
      page: "/sneakers/preview/trust/security-review",
      prerendered: "/site/build/client/sneakers/preview/trust/security-review/index.html",
      out: "/site/build/client/sneakers/preview/trust/sneakers-security-review.pdf",
    });
  }
});

test("a base path can't point outside build/client", () => {
  assert.throws(() => pdfPaths(root, "/../elsewhere/", name), /outside/);
});

test("a preview build's assets are found at the build root, without the base", () => {
  const files = new Set([
    "/site/build/client/sneakers/preview/trust/security-review",
    "/site/build/client/assets/root.css",
    "/site/build/client/favicon.svg",
  ]);
  const exists = (file) => files.has(file);
  const base = "/sneakers/preview";
  assert.equal(
    requestFile(root, base, "/sneakers/preview/trust/security-review", exists),
    "/site/build/client/sneakers/preview/trust/security-review",
  );
  assert.equal(requestFile(root, base, "/sneakers/preview/assets/root.css", exists), "/site/build/client/assets/root.css");
  assert.equal(requestFile(root, base, "/sneakers/preview/favicon.svg", exists), "/site/build/client/favicon.svg");
  assert.equal(requestFile(root, "", "/assets/root.css", exists), "/site/build/client/assets/root.css");
});
