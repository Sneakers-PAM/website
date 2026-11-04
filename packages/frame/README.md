# @sneakers-pam/frame 🖼️

> 🧩 What the Sneakers-PAM product site and the docs share: the frame, the fonts, the current release, and consent-first preferences

A private workspace package: `apps/site` and `apps/docs` import it, nothing is published. Run its
tests with `npm test`, here or from the repo root.

## 📦 What's in it

- 🎨 **`site-frame.css`:** the font faces, the frame tokens (column, header, footer), the frame
  colours in light and dark, the home page's hero and sections, and the classes for the theme
  switch, the full-width switch and the cookie bar.
- 🏷️ **`release.ts`:** the current Sneakers-PAM release, the one version both sites show and the
  docs version a release deploys.
- 🍪 **`consent.ts`:** the cookie choice, framework-free. See below.
- 🌗 **`theme-pref.ts`, `theme-toggle.tsx`:** the light and dark choice, consent first, and the
  header's switch both sites render.
- ↔️ **`full-width.ts`, `full-width-toggle.tsx`:** the docs' full-width content choice, consent
  first, and its switch ("Full width" while off, "Standard width" while on).
- ⚛️ **`use-consent.ts`, `consent-banner.tsx`:** the React side: hooks for the store and the cookie
  bar.
- 🔤 **`emoji.ts`:** strips emoji from navigation labels (the docs sidebar).
- 📁 **`public/fonts/`:** the self-hosted fonts and their licences.

## 🍪 Consent-first preferences

Nothing either site does is written to browser storage (localStorage, sessionStorage, cookies or
IndexedDB) until the visitor accepts the cookie choice. There's no tracking behind it; it only
decides whether a preference (the theme, the content width) is remembered on that machine.

- 🕓 **Before an answer:** the theme follows the visitor's system setting (`prefers-color-scheme`,
  light when the browser can't say) and nothing is stored. Pressing the theme switch only opens
  the cookie bar (`ask()`); the page doesn't change. The full-width switch works at once, in
  memory, and opens the bar too. The bar shows only to someone who touched one of those switches.
- ✅ **Accept:** the answer and the preferences are stored (`<prefix>:consent` and
  `<prefix>:pref:<name>` in localStorage). From then on the theme switch flips the theme and the
  choice is stored, and a small head script applies it before the next page paints.
- 🚫 **Decline:** nothing is stored, not even the refusal, and anything stored before is cleared.
  The theme keeps following the system setting; the switch then flips it for this visit only, in
  memory. A later visit can ask again.

Each site has its own prefix: `sneakers-site` (`apps/site/app/theme.ts`) and `sneakers-docs`
(`apps/docs/src/lib/consent.ts`). `consent.ts`, `theme-pref.ts` and `full-width.ts` have no
framework in them; each site adds a thin wrapper:

- **Site (React Router):** `apps/site/app/components/theme-switch.tsx` calls `pressThemeSwitch`
  and applies what it returns to `data-theme` on `<html>`, and follows system changes until the
  visitor picks a theme; `consent-bar.tsx` renders `ConsentBanner` when the store is asking;
  `root.tsx` puts `themeBootScript(prefix)` in `<head>`. React Router's `ScrollRestoration` is
  replaced with `scroll-to-top.tsx`, because it writes to sessionStorage.
- **Docs (Docusaurus):** `apps/docs/src/components/theme-toggle-navbar-item.tsx` calls
  `pressThemeSwitch` and applies what it returns with `setColorMode(theme, {persist: false})`
  (with `respectPrefersColorScheme: true`, Docusaurus follows the system until then);
  `src/theme/Root.tsx` renders the cookie bar; `docusaurus.config.ts` turns off Docusaurus's own
  storage (`disableSwitch`, no announcement bar, `versionPersistence: 'none'`, and `src/theme/Tabs`
  keeps tab choices in the URL until consent) and runs the boot scripts at the top of `<body>`,
  after Docusaurus's own theme script.

`scripts/check-no-storage.mjs` proves it on the built sites: it loads every page in jsdom with
storage watched, light and dark, and on the docs it also hydrates a few pages and uses the
switches. CI runs it after each build (`npm run check:storage:site`, `check:storage:docs`).

## 🧩 Adding a preference

1. Keep the value in the consent store under a name of its own: `consent.set(name, value)` and
   `consent.get(name)`. Never call `localStorage` directly.
2. If the page needs it before it paints, add a head script that only reads, as
   `themeBootScript` and `contentWidthBootScript` do, and test it against a fake page.
3. Extend `scripts/check-no-storage.mjs` to use the new switch before consent.

Restyle the bar and the buttons through the `--frame-*` colour tokens; the markup stays the same.
