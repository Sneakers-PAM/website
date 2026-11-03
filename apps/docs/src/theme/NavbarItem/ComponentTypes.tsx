/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';

import {DocsVersionNavbarItem} from '@site/src/components/docs-version-navbar-item';

// Adds the 'custom-docsVersion' navbar item type (docusaurus.config.ts).
export default {
  ...ComponentTypes,
  'custom-docsVersion': DocsVersionNavbarItem,
};
