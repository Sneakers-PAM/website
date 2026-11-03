/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ComponentProps, ReactNode} from 'react';
import {useActiveDocContext} from '@docusaurus/plugin-content-docs/client';
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

type Props = ComponentProps<typeof DocsVersionDropdownNavbarItem>;

// The docs version dropdown, on doc pages only. Off them (the home page) it
// renders nothing, so that header stays the website's, pixel for pixel. A
// custom item type skips the config defaults the built-in
// 'docsVersionDropdown' type gets, so they're set here.
export function DocsVersionNavbarItem({dropdownItemsBefore = [], dropdownItemsAfter = [], ...props}: Props): ReactNode {
  const {activeVersion} = useActiveDocContext(props.docsPluginId);
  if (!activeVersion) return null;
  return (
    <DocsVersionDropdownNavbarItem
      dropdownItemsBefore={dropdownItemsBefore}
      dropdownItemsAfter={dropdownItemsAfter}
      {...props}
    />
  );
}
