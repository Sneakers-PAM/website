/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The current Sneakers-PAM release, the one version both sites show: the
// site's hero and downloads (apps/site/app/content/release.ts builds on it)
// and the docs home. It is also the docs version a release deploys, so
// apps/docs/versions.json must list it before a release can go out.
export const release = {
  version: "v0.1.0-rc.7",
  kind: "prerelease" as const,
  publishedOn: "2026-11-03",
};
