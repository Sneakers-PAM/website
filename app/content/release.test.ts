/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { test } from "node:test";

import { downloads, kubernetes, release, verify } from "./release.ts";

test("every download asset points at the current release's tag", () => {
  const prefix = `https://github.com/Sneakers-PAM/sneakers-appliance/releases/download/${release.version}/`;
  for (const asset of downloads) {
    assert.ok(asset.href.startsWith(prefix), `${asset.name} does not point at ${release.version}`);
    assert.ok(asset.href.endsWith(asset.name), `${asset.name}'s href does not end with its own name`);
  }
});

test("every download asset has a positive size and a unique name", () => {
  const seen = new Set<string>();
  for (const asset of downloads) {
    assert.ok(asset.sizeBytes > 0, `${asset.name} has a non-positive size`);
    assert.ok(!seen.has(asset.name), `${asset.name} is listed twice`);
    seen.add(asset.name);
  }
});

test("there is no ISO listed for a release that doesn't ship one", () => {
  assert.ok(
    !downloads.some((asset) => asset.name.endsWith(".iso")),
    `${release.version} has no ISO; one must have been added without checking the release`,
  );
});

test("every install image is listed with its own .sha256 next to it", () => {
  const names = downloads.map((asset) => asset.name);
  const images = names.filter((name) => name.endsWith(".ova") || name.endsWith(".qcow2"));
  assert.ok(images.some((name) => name.endsWith(".ova")), `${release.version} lists no OVA`);
  assert.ok(images.some((name) => name.endsWith(".qcow2")), `${release.version} lists no Proxmox VE qcow2`);
  for (const image of images) {
    assert.ok(names.includes(`${image}.sha256`), `${image} is listed without its .sha256`);
  }
});

test("the qcow2 says it hasn't been tested on Proxmox VE yet", () => {
  const qcow2 = downloads.find((asset) => asset.name.endsWith(".qcow2"));
  assert.ok(qcow2, "no qcow2 is listed");
  assert.match(qcow2.label, /untested/i);
});

test("the Kubernetes links point at the same tag on sneakers-release", () => {
  assert.equal(
    kubernetes.pageHref,
    `https://github.com/Sneakers-PAM/sneakers-release/releases/tag/${release.version}`,
  );
  assert.ok(
    kubernetes.archDocHref.startsWith("https://github.com/Sneakers-PAM/sneakers-release/blob/"),
    "the CPU architecture guide must link into sneakers-release",
  );
});

test("the verify key fingerprint is 64 lowercase hex characters", () => {
  assert.match(verify.keyFingerprint, /^[0-9a-f]{64}$/);
});
