/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

import {contentWidthBootScript} from '@sneakers-pam/frame/full-width';
import {release} from '@sneakers-pam/frame/release';
import {themeBootScript} from '@sneakers-pam/frame/theme-pref';

import {oldDocsPaths} from './redirects';
import {DOCS_CONSENT_PREFIX} from './src/lib/consent';

// Versioned docs. Each release's snapshot lives in versioned_docs/ and is
// listed in versions.json; the newest one is the default at /docs/. The pages
// in docs/ are "vNext", unreleased main, served at /docs/vnext/ under a
// banner naming the release that may ship them and the current one
// (src/theme/DocVersionBanner, so Docusaurus's own banner is off). The
// deploy builds with DOCS_INCLUDE_NEXT=false, so the published site has the
// released versions only; every other build (dev, CI, previews) includes
// vNext.
const includeNext = process.env.DOCS_INCLUDE_NEXT !== 'false';

// Docusaurus rejects options for a version it isn't building.
const nextVersion: {[version: string]: {label: string; path: string; banner: 'none'}} = includeNext
  ? {current: {label: 'vNext', path: 'vnext', banner: 'none'}}
  : {};

// The share card for link previews, from packages/brand (public/), the same
// picture the site uses.
const SHARE_IMAGE = 'img/og-card.png';
const SHARE_IMAGE_ALT = 'The Sneakers-PAM mark and wordmark over the tagline: Privileged access, kept on a short leash.';

// The frame and the brand assets come from the shared packages: one copy of
// site-frame.css, the fonts, the marks and the favicon for both sites.
const framePackage = '../../packages/frame';
const brandPackage = '../../packages/brand';

const codeTheme = {
  ...prismThemes.dracula,
  plain: {...prismThemes.dracula.plain, color: '#e6e9ef', backgroundColor: '#0e1117'},
};

// The site's base path. Asset paths written into raw HTML below (the
// footer's mark, the font preloads) are built from it, since Docusaurus only
// rewrites the paths it renders itself.
const baseUrl = '/';

const config: Config = {
  title: 'Sneakers-PAM',
  tagline: 'An open-source, Apache-2.0 privileged access management system.',
  favicon: 'favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.sneakers-pam.com',
  baseUrl,
  trailingSlash: false,

  // Read by the vNext banner (src/theme/DocVersionBanner).
  customFields: {
    releaseVersion: release.version,
  },

  organizationName: 'Sneakers-PAM',
  projectName: 'website',

  // static/ holds the docs' own images; /fonts/ comes from packages/frame
  // and /img/mark-*.svg and /favicon.svg from packages/brand.
  staticDirectories: ['static', `${framePackage}/public`, `${brandPackage}/public`],

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    // future.v4 turns this off by default; the user, admin and appliance
    // guides use explicit heading IDs (`## Heading {#id}`), which need it.
    mdx1Compat: {
      headingIds: true,
    },
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // The fonts are self-hosted (packages/frame/public/fonts) and declared in
  // packages/frame/site-frame.css, shared with the website. The three the header
  // and footer draw with are preloaded, the same files the website preloads.
  headTags: [
    'bricolage-grotesque-latin.woff2',
    'atkinson-hyperlegible-400-latin.woff2',
    'jetbrains-mono-latin.woff2',
  ].map((font) => ({
    tagName: 'link',
    attributes: {rel: 'preload', href: `${baseUrl}fonts/${font}`, as: 'font', type: 'font/woff2', crossorigin: 'anonymous'},
  })),

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Sneakers-PAM/website/edit/main/apps/docs/',
          showLastUpdateTime: true,
          includeCurrentVersion: includeNext,
          versions: nextVersion,
        },
        blog: false,
        theme: {
          customCss: [`${framePackage}/site-frame.css`, './src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // The unreleased docs moved from /docs/next/ to /docs/vnext/. Each vNext
    // page answers at its old path too (redirects.ts), so links already out
    // there keep working.
    ['@docusaurus/plugin-client-redirects', {createRedirects: oldDocsPaths}],
    // A remembered theme and full-width choice (only stored once the visitor
    // accepts the cookie choice) go on <html> before the first paint. These
    // run at the top of <body>, after Docusaurus's own theme script, which
    // would otherwise set data-theme on its own.
    () => ({
      name: 'consent-boot',
      injectHtmlTags: () => ({
        preBodyTags: [
          {tagName: 'script', innerHTML: themeBootScript(DOCS_CONSENT_PREFIX)},
          {tagName: 'script', innerHTML: contentWidthBootScript(DOCS_CONSENT_PREFIX)},
        ],
      }),
    }),
  ],

  themeConfig: {
    // Link previews, the same card as the website's. Docusaurus writes each
    // page's og:title, og:description, og:url, og:image, twitter:image and
    // twitter:card (summary_large_image, since there's an image) itself, from
    // the page's title and description, as absolute URLs on the configured
    // url. The share image is packages/brand's, served from
    // staticDirectories; the rest is the same for every page.
    image: SHARE_IMAGE,
    metadata: [
      {name: 'theme-color', content: '#2F5BD3'},
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'Sneakers-PAM'},
      {property: 'og:image:width', content: '1200'},
      {property: 'og:image:height', content: '630'},
      {property: 'og:image:type', content: 'image/png'},
      {property: 'og:image:alt', content: SHARE_IMAGE_ALT},
      {name: 'twitter:image:alt', content: SHARE_IMAGE_ALT},
    ],
    // The theme follows the system setting until the visitor picks one, as
    // on the site. Nothing in the docs writes to browser storage before the
    // visitor accepts the cookie choice, so Docusaurus's own storage is kept
    // out of it:
    // - colour mode: Docusaurus's switch is off, so it never stores 'theme'.
    //   The header shows the shared switch from packages/frame (the
    //   'custom-themeToggle' item below): before an answer it only opens the
    //   cookie bar; after one it sets the colour mode without persisting it
    //   and keeps the pick in the consent store (packages/frame
    //   theme-pref.ts).
    // - versions: the picked docs version isn't stored (versionPersistence).
    // - tabs: src/theme/Tabs only lets a tab group remember its choice after
    //   consent; before that the choice rides in the URL.
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: true,
    },
    docs: {
      versionPersistence: 'none',
      sidebar: {
        hideable: true,
      },
    },
    // The header mirrors the website's (website app/components/nav.tsx and
    // app/content/sneakers-pam.ts nav.links): same mark, wordmark and links in
    // the same order, so the two read as one site. Website links open in the
    // same tab, as they do there, and the mark goes to the website's home.
    navbar: {
      title: 'sneakers·pam',
      logo: {
        alt: '',
        href: 'https://www.sneakers-pam.com/',
        target: '_self',
        src: 'img/mark-light.svg',
        srcDark: 'img/mark-dark.svg',
        width: 28,
        height: 28,
      },
      // The header is the site's, item for item, on every page. The docs
      // version picker and the full-width switch live in the doc toolbar on
      // the breadcrumb line (src/theme/DocBreadcrumbs), not here.
      items: [
        {href: 'https://www.sneakers-pam.com/#what-it-is', html: 'What it is', target: '_self', position: 'right'},
        {href: 'https://www.sneakers-pam.com/#different', html: 'What&#39;s different', target: '_self', position: 'right'},
        {href: 'https://www.sneakers-pam.com/#download', html: 'Download', target: '_self', position: 'right'},
        {href: 'https://www.sneakers-pam.com/trust', html: 'Trust', target: '_self', position: 'right'},
        {to: '/', label: 'Docs', activeBaseRegex: '^/', position: 'right'},
        {href: 'https://github.com/Sneakers-PAM', html: 'GitHub', target: '_self', position: 'right'},
        {type: 'custom-themeToggle', position: 'right'},
      ],
    },
    // The footer mirrors the website's (website app/components/footer.tsx
    // and app/content/sneakers-pam.ts footer): the brand and tagline, the same
    // three link groups, then the same legal line.
    footer: {
      style: 'light',
      links: [
        {
          title: null,
          items: [
            {
              html:
                '<div class="footer__brand"><p class="footer__name">' +
                `<img class="mark mark--light" src="${baseUrl}img/mark-light.svg" width="24" height="24" alt="" />` +
                `<img class="mark mark--dark" src="${baseUrl}img/mark-dark.svg" width="24" height="24" alt="" />` +
                'sneakers·pam</p>' +
                '<p class="footer__tagline">Open-source privileged access management you run yourself.</p></div>',
            },
          ],
        },
        {
          title: 'Product',
          items: [
            {label: 'What it is', href: 'https://www.sneakers-pam.com/#what-it-is', target: '_self'},
            {label: 'What\'s different', href: 'https://www.sneakers-pam.com/#different', target: '_self'},
            {label: 'Download', href: 'https://www.sneakers-pam.com/#download', target: '_self'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Docs', to: '/'},
            {label: 'GitHub', href: 'https://github.com/Sneakers-PAM', target: '_self'},
            {label: 'Releases', href: 'https://github.com/Sneakers-PAM/sneakers-release/releases', target: '_self'},
          ],
        },
        {
          title: 'Trust',
          items: [
            {label: 'Trust center', href: 'https://www.sneakers-pam.com/trust', target: '_self'},
            {
              label: 'Security policy',
              href: 'https://github.com/Sneakers-PAM/.github/blob/main/.github/SECURITY.md',
              target: '_self',
            },
            {label: 'Report a vulnerability', href: 'https://www.sneakers-pam.com/trust#report', target: '_self'},
          ],
        },
      ],
      copyright:
        '<span class="nowrap">Sneakers-PAM<sup class="tm">™</sup></span> and Privileged access, kept on a short ' +
        '<span class="nowrap">leash<sup class="tm">™</sup></span> are trademarks of the Sneakers-PAM project. ' +
        `&copy; ${new Date().getFullYear()} The Sneakers-PAM Authors. Licensed under Apache-2.0.`,
    },
    // Code blocks are dark in both themes, as on the website, with its
    // terminal colours (--color-term-bg and --color-term-fg) for the block.
    prism: {
      theme: codeTheme,
      darkTheme: codeTheme,
      additionalLanguages: ['bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
