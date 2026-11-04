/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ReactNode} from 'react';
import TabsOriginal from '@theme-original/Tabs';
import type TabsType from '@theme/Tabs';
import type {WrapperProps} from '@docusaurus/types';
import {useBrowserConsent} from '@sneakers-pam/frame/use-consent';

import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';
import {tabsWithoutStorage} from '@site/src/lib/tabs-storage';

type Props = WrapperProps<typeof TabsType>;

// Tab groups remember their choice only after the visitor accepts the cookie
// choice (src/lib/tabs-storage.ts). Picking a tab doesn't ask; only the
// theme and full-width switches do.
export default function Tabs(props: Props): ReactNode {
  const {state} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  return <TabsOriginal {...tabsWithoutStorage(props, state === 'accepted')} />;
}
