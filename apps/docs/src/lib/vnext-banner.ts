/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The banner on every vNext page (src/theme/DocVersionBanner): the page is
// planned, or may ship in the release after the current one. The current
// release is packages/frame/release.ts's, passed in through customFields.

// The release after this one: the next pre-release of the same kind after a
// pre-release (v0.1.0-rc.7, then v0.1.0-rc.8), and the next minor release
// after a release (v0.1.0, then v0.2.0), where planned work lands.
export function nextReleaseVersion(version: string): string {
  const match = version.match(/^v(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+)\.(\d+))?$/);
  if (!match) throw new Error(`can't work out the release after ${version}`);
  const [, major, minor, patch, pre, number] = match;
  if (pre) return `v${major}.${minor}.${patch}-${pre}.${Number(number) + 1}`;
  return `v${major}.${Number(minor) + 1}.0`;
}

export function vnextBannerText(current: string): string {
  return `This page is planned, or may ship soon in ${nextReleaseVersion(current)}. The current release is ${current}.`;
}
