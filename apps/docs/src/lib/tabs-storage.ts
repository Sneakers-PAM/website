/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Docusaurus's Tabs remember a tab group's choice (groupId) in browser
// storage. Before the visitor accepts the cookie choice, a group keeps its
// choice in the URL instead (queryString, named after the group), so tab
// groups on a page still switch together and nothing is stored. After they
// accept, the props pass through unchanged.
type TabsStorageProps = {
  groupId?: string;
  queryString?: string | boolean;
};

export function tabsWithoutStorage<P extends TabsStorageProps>(props: P, accepted: boolean): P {
  if (accepted || !props.groupId) return props;
  const queryString = typeof props.queryString === 'string' ? props.queryString : props.groupId;
  return {...props, groupId: undefined, queryString};
}
