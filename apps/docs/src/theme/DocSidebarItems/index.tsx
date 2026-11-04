/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import {memo, type ReactNode} from 'react';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';
import DocSidebarItemsOriginal from '@theme-original/DocSidebarItems';
import type DocSidebarItemsType from '@theme/DocSidebarItems';
import type {WrapperProps} from '@docusaurus/types';
import {stripEmoji} from '@sneakers-pam/frame/emoji';

type Props = WrapperProps<typeof DocSidebarItemsType>;

// The sidebar reads as plain text: page titles keep their emoji on the page
// itself, but the sidebar shows the labels without them.
const plain = (item: PropSidebarItem): PropSidebarItem => {
  if (item.type === 'html') return item;
  if (item.type === 'category') return {...item, label: stripEmoji(item.label), items: item.items.map(plain)};
  return {...item, label: stripEmoji(item.label)};
};

function DocSidebarItems({items, ...props}: Props): ReactNode {
  return <DocSidebarItemsOriginal items={items.map(plain)} {...props} />;
}

export default memo(DocSidebarItems);
