/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';

import {ThemeToggleNavbarItem} from '@site/src/components/theme-toggle-navbar-item';

// Adds the 'custom-themeToggle' navbar item type (docusaurus.config.ts).
export default {
  ...ComponentTypes,
  'custom-themeToggle': ThemeToggleNavbarItem,
};
