/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// The site's light and dark theme. Before the visitor answers the cookie
// choice, and after they decline, the site follows the system setting
// (prefers-color-scheme) and stores nothing; the switch only works once
// they've answered (packages/frame theme-pref.ts and consent.ts, under
// SITE_CONSENT_PREFIX). The theme lands on <html> as data-theme, which
// app.css and site-frame.css read, the same attribute the docs set. Dark is
// for screens only, so the security review PDF still prints in light.
import { type FrameTheme, themeBootScript } from "@sneakers-pam/frame/theme-pref";

export const SITE_CONSENT_PREFIX = "sneakers-site";

export const pageTheme = (value: string | null): FrameTheme => (value === "dark" ? "dark" : "light");

interface ThemeRoot {
  setAttribute: (name: string, value: string) => void;
  style: { colorScheme: string };
}

export function applyTheme(root: ThemeRoot, theme: FrameTheme) {
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

// Runs in <head> before the page paints: the visitor's stored choice once
// they've accepted, otherwise the system setting. It only reads storage.
export const themeInitScript = themeBootScript(SITE_CONSENT_PREFIX);
