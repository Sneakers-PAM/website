/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {ReactNode} from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import {ThemeToggle} from '@sneakers-pam/frame/theme-toggle';
import {pressThemeSwitch, type FrameTheme} from '@sneakers-pam/frame/theme-pref';
import {useBrowserConsent} from '@sneakers-pam/frame/use-consent';

import {DOCS_CONSENT_PREFIX} from '@site/src/lib/consent';

// setColorMode takes a second argument its type leaves out: {persist: false}
// sets the colour mode without Docusaurus writing it to storage.
type SetColorMode = (mode: FrameTheme, options: {persist: boolean}) => void;

// The light and dark switch from packages/frame, the same button the site
// shows at the same spot, driven by Docusaurus's colour mode, which follows
// the system setting until the visitor picks a theme. Docusaurus never
// stores it; the pick goes to the consent store, which remembers it only
// after the visitor accepts (packages/frame theme-pref.ts). The switch stays
// in the header at every width, so it renders nothing in the phone menu.
export function ThemeToggleNavbarItem({mobile}: {mobile?: boolean}): ReactNode {
  const {colorMode, setColorMode} = useColorMode();
  const {consent} = useBrowserConsent(DOCS_CONSENT_PREFIX);
  if (mobile) return null;
  // Before the visitor answers the cookie choice a press only opens the
  // cookie bar; after that it flips the theme (stored only if they accepted).
  const press = () => {
    if (!consent) return;
    const next = pressThemeSwitch(consent, colorMode);
    if (next) (setColorMode as SetColorMode)(next, {persist: false});
  };
  return (
    <div className="navbar__item navbar__theme">
      <ThemeToggle theme={colorMode} onToggle={press} />
    </div>
  );
}
