/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Content names site pages from the root ("/trust", "/#download"); this puts
// them under the build's base path, so a preview served from a sub-path keeps
// working. External links pass through.
export const siteHref = (href: string) =>
  href.startsWith("/") ? `${import.meta.env.BASE_URL}${href.slice(1)}` : href;
