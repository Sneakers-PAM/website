/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ComponentProps, ReactNode} from 'react';
import {useActiveDocContext} from '@docusaurus/plugin-content-docs/client';
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

type Props = ComponentProps<typeof DocsVersionDropdownNavbarItem>;

// The docs version dropdown, in the doc toolbar (doc-toolbar.tsx). Off a
// doc page it renders nothing. Used outside the navbar config, it skips the
// defaults the built-in 'docsVersionDropdown' type gets, so they're set here.
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
