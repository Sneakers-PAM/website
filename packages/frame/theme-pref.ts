/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { type Consent, consentKeys } from "./consent.ts";

// The light and dark choice, consent first, for both sites.
//
// - Before the visitor answers the cookie choice, the page follows the
//   system setting (prefers-color-scheme) and nothing is stored. Pressing
//   the switch only asks for an answer; the theme doesn't change.
// - After Accept, the switch flips the theme and the choice is stored, and
//   the head script applies it before the next page paints.
// - After Decline, the page still follows the system setting and nothing is
//   stored; the switch flips the theme for this visit only, in memory.
//
// Framework-free: each site applies the theme to its page (the site's
// <html>, Docusaurus's colour mode) with what pressThemeSwitch returns.

export type FrameTheme = "dark" | "light";

export const THEME_PREF = "theme";

const asTheme = (value: string | null): FrameTheme | null =>
  value === "light" || value === "dark" ? value : null;

// The visitor's own choice, stored or for this visit, or null when the page
// follows the system setting.
export function rememberedTheme(consent: Consent): FrameTheme | null {
  return asTheme(consent.get(THEME_PREF));
}

// What the switch says: what pressing it does, from the theme on the page.
export const themeToggleLabel = (theme: FrameTheme) =>
  theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

// What a press of the switch does, given the theme the page shows now: the
// theme to show next, or null when the press only asked for an answer.
export function pressThemeSwitch(consent: Consent, current: FrameTheme): FrameTheme | null {
  if (consent.state() === "unset") {
    consent.ask();
    return null;
  }
  const next: FrameTheme = current === "dark" ? "light" : "dark";
  consent.set(THEME_PREF, next);
  return next;
}

// An inline script that settles the theme on <html> before the first paint:
// the visitor's stored choice once they've accepted, otherwise the system
// setting, light when the browser can't say (the brand is light first). It
// sets data-theme, Docusaurus's data-theme-choice ("system"
// when following it) and the colour scheme. It
// only reads storage. On the docs it runs after Docusaurus's own theme
// script, so the two agree.
export function themeBootScript(prefix?: string): string {
  const keys = consentKeys(prefix);
  return (
    `(function(){var c=null;try{if(localStorage.getItem(${JSON.stringify(keys.consent)})==="accepted"){` +
    `var s=localStorage.getItem(${JSON.stringify(keys.pref(THEME_PREF))});if(s==="light"||s==="dark")c=s}}catch(e){}` +
    `var t=c;if(!t){t="light";try{if(matchMedia("(prefers-color-scheme: dark)").matches)t="dark"}catch(e){}}` +
    `var r=document.documentElement;` +
    `r.setAttribute("data-theme",t);r.setAttribute("data-theme-choice",c||"system");` +
    `r.style.colorScheme=t})();`
  );
}
