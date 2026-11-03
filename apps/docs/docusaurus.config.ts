import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

// Versioned docs: until the first release there are no snapshots, so the
// unversioned "current" docs are the whole site and must stay included. Once a
// version is cut, the release build sets DOCS_INCLUDE_NEXT=false so "next" is
// served locally but left out of the published site.
const includeNext = process.env.DOCS_INCLUDE_NEXT !== 'false';

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
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.sneakers-pam.com',
  baseUrl,
  trailingSlash: false,

  organizationName: 'Sneakers-PAM',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // The fonts are self-hosted (static/fonts) and declared in
  // src/css/site-frame.css, shared with the website. The three the header
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
          editUrl: 'https://github.com/Sneakers-PAM/docs/edit/main/',
          showLastUpdateTime: true,
          includeCurrentVersion: includeNext,
        },
        blog: false,
        theme: {
          customCss: ['./src/css/site-frame.css', './src/css/custom.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // The link-preview card is the website's: a plain summary card under the
    // same site name.
    metadata: [
      {name: 'theme-color', content: '#2F5BD3'},
      {property: 'og:site_name', content: 'Sneakers-PAM'},
      {name: 'twitter:card', content: 'summary'},
    ],
    colorMode: {
      // The switch cycles System, Light, Dark, the same as the website's, and
      // sits at the same spot: the right end of the header, after GitHub.
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
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
      items: [
        {href: 'https://www.sneakers-pam.com/#what-it-is', html: 'What it is', target: '_self', position: 'right'},
        {href: 'https://www.sneakers-pam.com/#different', html: 'What&#39;s different', target: '_self', position: 'right'},
        {href: 'https://www.sneakers-pam.com/#download', html: 'Download', target: '_self', position: 'right'},
        {href: 'https://www.sneakers-pam.com/trust', html: 'Trust', target: '_self', position: 'right'},
        {to: '/', label: 'Docs', activeBaseRegex: '^/', position: 'right'},
        {href: 'https://github.com/Sneakers-PAM', html: 'GitHub', target: '_self', position: 'right'},
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
