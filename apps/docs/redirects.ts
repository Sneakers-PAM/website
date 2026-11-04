/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The unreleased docs were "Next" at /docs/next/ and are "vNext" at
// /docs/vnext/ now. Given a page's path, this returns the old paths that
// should still reach it, so links already out there keep working. Released
// versions didn't move. Used as @docusaurus/plugin-client-redirects'
// createRedirects.
const VNEXT = '/docs/vnext';

export function oldDocsPaths(path: string): string[] {
  if (path === VNEXT || path.startsWith(`${VNEXT}/`)) return [`/docs/next${path.slice(VNEXT.length)}`];
  return [];
}
