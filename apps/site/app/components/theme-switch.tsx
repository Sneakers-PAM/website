/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { pressThemeSwitch, rememberedTheme } from "@sneakers-pam/frame/theme-pref";
import { type FrameTheme, ThemeToggle } from "@sneakers-pam/frame/theme-toggle";
import { useBrowserConsent } from "@sneakers-pam/frame/use-consent";
import { useEffect, useSyncExternalStore } from "react";

import { applyTheme, pageTheme, SITE_CONSENT_PREFIX } from "~/theme";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getTheme = (): FrameTheme => pageTheme(document.documentElement.getAttribute("data-theme"));
const getServerTheme = (): FrameTheme => "light";

function show(theme: FrameTheme) {
  applyTheme(document.documentElement, theme);
  listeners.forEach((listener) => listener());
}

// The shared switch (packages/frame), wired to the site's theme on <html>.
// Before the visitor answers the cookie choice a press only opens the cookie
// bar; after that it flips the theme (stored only if they accepted). Until
// the visitor picks a theme of their own, the page follows the system
// setting, live.
export const ThemeSwitch = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const { consent } = useBrowserConsent(SITE_CONSENT_PREFIX);

  useEffect(() => {
    if (!consent) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      if (rememberedTheme(consent) === null) show(query.matches ? "dark" : "light");
    };
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, [consent]);

  const press = () => {
    if (!consent) return;
    const next = pressThemeSwitch(consent, theme);
    if (next) show(next);
  };
  return <ThemeToggle theme={theme} onToggle={press} />;
};
