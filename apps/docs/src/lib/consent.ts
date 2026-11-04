/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The docs' storage key prefix for the shared consent store (packages/frame
// consent.ts): the switches and the cookie bar use it through
// useBrowserConsent, and the head scripts in docusaurus.config.ts read the
// same keys.
export const DOCS_CONSENT_PREFIX = 'sneakers-docs';
