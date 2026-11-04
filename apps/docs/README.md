# docs 📚

> 🥿 The Sneakers-PAM system docs, docs.sneakers-pam.com, built with Docusaurus.

## 🏗️ What's here

The docs app of the website repo (`apps/docs`), imported from the Sneakers-PAM/docs repo's main as
one squashed commit.

- `docs/`: the documentation pages for vNext (unreleased main), one Markdown file per page. The
  sidebar order lives in `sidebars.ts`.
- `versioned_docs/`, `versioned_sidebars/` and `versions.json`: one snapshot per release, newest
  first. The newest is the default at `/docs/`; see "Versioned docs" below.
- `src/pages/index.tsx`: the home page. It renders the site's home markup (the split hero with
  its terminal card, the sections and the feature cards), styled from the shared
  `packages/frame/site-frame.css`, so the two home pages line up. It shows the release version
  from `packages/frame/release.ts`. `src/css/custom.css` maps the Laces design tokens onto the
  theme.
- `src/theme/DocBreadcrumbs` and `src/components/doc-toolbar.tsx`: the breadcrumb line, with the
  doc toolbar at its right end: the version picker (`docs-version-navbar-item.tsx`) and the
  full-width switch from `packages/frame`. A trail too long for the line folds its oldest crumbs
  into one "…" item (`src/lib/breadcrumb-fold.ts`); its title names them.
- `src/components/theme-toggle-navbar-item.tsx`, `src/theme/NavbarItem/ComponentTypes.tsx` and
  `src/theme/Root.tsx`: the header's theme switch (`custom-themeToggle`) and the cookie bar, both
  shared with the site through `packages/frame`. `src/theme/Tabs` keeps tab choices in the URL
  until the visitor accepts the cookie choice. Nothing is stored before then; see
  [packages/frame/README.md](../../packages/frame/README.md).
- `src/theme/DocVersionBanner` and `src/lib/vnext-banner.ts`: the banner on vNext pages.
- `src/theme/DocSidebarItems`: the sidebar shows labels without emoji; pages keep theirs.
- `redirects.ts`: the old `/docs/next/` paths, redirected to `/docs/vnext/`.
- The frame, fonts, marks and favicon aren't copied here: `docusaurus.config.ts` loads
  `packages/frame/site-frame.css` first and serves `packages/frame/public` and
  `packages/brand/public` as extra static folders, so `/fonts/`, `/img/mark-*.svg` and
  `/favicon.svg` are the same files the site serves. `scripts/site-frame.test.mjs` checks that
  wiring.
- `static/img/guides/`: the guide screenshots, made by
  [scripts/screenshots/](scripts/screenshots/README.md) from a lab appliance and scrubbed before
  they're saved.
- `docusaurus.config.ts`: site config, navbar (it mirrors the site's header, theme switch
  included), footer and the link-preview card (`image`, the site's `img/og-card.png`). Broken
  links, anchors and Markdown links fail the build.

CI and the deploy live at the repo root; see the [root README](../../README.md).

## 🚀 Run it locally

Use the Node.js version in `.nvmrc`, install once at the repo root, then start this app:

```bash
npm ci --ignore-scripts
npm run start -w @sneakers-pam/docs
```

Build the static site the same way CI does (the output lands in `apps/docs/build/`):

```bash
npm run typecheck -w @sneakers-pam/docs
npm test -w @sneakers-pam/docs
npm run build -w @sneakers-pam/docs
npm run check:storage:docs
npm run serve -w @sneakers-pam/docs
```

`npm run check:storage:docs` runs from the repo root against `apps/docs/build`: it fails if any
page writes browser storage before the visitor accepts the cookie choice.

The published build is the same as the default, with vNext in it. To build without vNext:

```bash
DOCS_INCLUDE_NEXT=false npm run build -w @sneakers-pam/docs
```

## ✍️ Writing pages

- Link to other pages by file, for example `[Approvals](./concepts/approvals.md)`, so the build
  can check the link.
- Callouts use admonitions: `:::danger`, `:::warning`, `:::caution`, `:::tip`, `:::info` and
  `:::note`, with an optional title in brackets, such as `:::info[Coming in v0.1.0]`.
- Steps that differ by operating system use tabs that stay in sync across the page and in the URL
  (a tab group only remembers its choice across pages once the visitor accepts the cookie choice):

```mdx
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="os" queryString>
  <TabItem value="linux" label="Linux">...</TabItem>
  <TabItem value="macos" label="macOS">...</TabItem>
</Tabs>
```

## 🗂️ Versioned docs

- **Versions:** each release has a snapshot in `versioned_docs/version-<version>/`, listed in
  `versions.json`. The first is `v0.1.0-rc.7`. The newest is the default at `/docs/`; older ones
  live at `/docs/<version>/`.
- **vNext:** the pages in `docs/` are vNext, unreleased main, at `/docs/vnext/`, under a banner
  that says the page is planned, or may ship soon in the next release, worked out from the
  current one in `packages/frame/release.ts` (v0.1.0-rc.7 gives v0.1.0-rc.8; v0.1.0 gives
  v0.2.0). Write new and changed pages there. The old `/docs/next/` paths redirect to
  `/docs/vnext/`. Every build includes vNext, the deploy too
  (`DOCS_INCLUDE_NEXT=true`), so the published site carries it beside the released versions.
- **The picker:** the version dropdown sits in the doc toolbar at the right end of the breadcrumb
  line, beside the full-width switch, so the header is the site's, item for item, on every page.
  On phones and tablets the toolbar takes a line of its own under the breadcrumbs.
- **Full width:** the toolbar's switch reads "Full width" while off and "Standard width" while on.
  On, the sidebar, the page and its table of contents span the window, the sidebar at the left
  edge. It shows only where the window is wider than the page column, and is remembered only
  after the visitor accepts the cookie choice.
- **Cutting a version:** a release cuts its docs version in its own PR, from the repo root, after
  bumping `packages/frame/release.ts`:

```bash
npm run docs:version
```

That runs `docusaurus docs:version <version>` for the release version, copying `docs/` into
`versioned_docs/` and adding it to `versions.json`. Commit all three. The deploy refuses a release
whose version isn't cut (`npm run check:docs-version`).

- **Fixing a released version:** edit its copy in `versioned_docs/`. A fix that also applies to
  vNext goes in `docs/` too.

## 📍 Where to look

- [docs/getting-started.md](docs/getting-started.md), [docs/concepts/](docs/concepts/),
  [docs/mcp-guide.md](docs/mcp-guide.md): the content pages.
- [docs/user-guide/](docs/user-guide/), [docs/admin-guide/](docs/admin-guide/),
  [docs/appliance-guide/](docs/appliance-guide/): the user, admin and appliance admin guides, in
  vNext only until the next release cuts them.
- [docs/security.md](docs/security.md), [docs/contributing.md](docs/contributing.md): project
  pages.
