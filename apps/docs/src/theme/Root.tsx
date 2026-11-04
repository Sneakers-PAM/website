/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ReactNode} from 'react';
import {ConsentBanner} from '@sneakers-pam/frame/consent-banner';
import {useBrowserConsent} from '@sneakers-pam/frame/use-consent';

import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';

// Wraps every page so the cookie choice (packages/frame) can show on any of
// them. It only shows once a visitor changes a setting that could be
// remembered (the theme or the full-width switch) without having answered
// yet.
export default function Root({children}: {children: ReactNode}): ReactNode {
  const {consent, asking} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  return (
    <>
      {children}
      {consent && asking && <ConsentBanner onAccept={consent.accept} onDecline={consent.decline} />}
    </>
  );
}
