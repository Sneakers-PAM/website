/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The releases that are withdrawn, each with the version to use instead. The same list is signed into the update feed
// (the appliance's release/withdrawn.yaml); here it puts a banner on every page of a withdrawn docs version
// (src/theme/DocVersionBanner) and the release notes mark each one.
export const withdrawn: Record<string, string> = {
  "v0.1.0-rc.7": "v0.1.0-rc.10",
  "v0.1.0-rc.8": "v0.1.0-rc.10",
  "v0.1.0-rc.9": "v0.1.0-rc.10",
};

// The version to use instead of a withdrawn one, or undefined when the version is not withdrawn.
export function withdrawnUse(version: string): string | undefined {
  return Object.hasOwn(withdrawn, version) ? withdrawn[version] : undefined;
}

export function withdrawnBannerText(version: string, use: string): string {
  return `${version} is withdrawn, use ${use}.`;
}
