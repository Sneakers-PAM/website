/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { nextReleaseVersion, vnextBannerText } from "./vnext-banner.ts";
import { release } from "@sneakers-pam/frame/release";

test("after a release candidate, the next one is planned", () => {
  assert.equal(nextReleaseVersion("v0.1.0-rc.7"), "v0.1.0-rc.8");
  assert.equal(nextReleaseVersion("v1.2.0-beta.9"), "v1.2.0-beta.10");
});

test("after a release, the next minor release is planned", () => {
  assert.equal(nextReleaseVersion("v0.1.0"), "v0.2.0");
  assert.equal(nextReleaseVersion("v1.4.2"), "v1.5.0");
});

test("a version it can't read is refused", () => {
  assert.throws(() => nextReleaseVersion("latest"), /latest/);
});

test("the vNext banner names the release that may ship it and the current one", () => {
  assert.equal(
    vnextBannerText("v0.1.0-rc.7"),
    "This page is planned, or may ship soon in v0.1.0-rc.8. The current release is v0.1.0-rc.7.",
  );
});

test("the banner reads the current release from packages/frame/release.ts", () => {
  assert.ok(vnextBannerText(release.version).endsWith(`The current release is ${release.version}.`));
});
