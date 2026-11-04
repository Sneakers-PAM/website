/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { ConsentBanner } from "@sneakers-pam/frame/consent-banner";
import { useBrowserConsent } from "@sneakers-pam/frame/use-consent";

import { SITE_CONSENT_PREFIX } from "~/theme";

// The shared cookie choice (packages/frame). It shows only once a visitor
// presses the theme switch without having answered yet.
export const ConsentBar = () => {
  const { consent, asking } = useBrowserConsent(SITE_CONSENT_PREFIX);
  if (!consent || !asking) return null;
  return <ConsentBanner onAccept={consent.accept} onDecline={consent.decline} />;
};
