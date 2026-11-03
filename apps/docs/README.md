# docs 📚

> 🥿 The Sneakers-PAM system docs, docs.sneakers-pam.com, built with Docusaurus.

## 🏗️ What's here

The docs app of the website repo (`apps/docs`), imported from the Sneakers-PAM/docs repo's main as
one squashed commit.

- `docs/`: the documentation pages for Next (unreleased main), one Markdown file per page. The
  sidebar order lives in `sidebars.ts`.
- `versioned_docs/`, `versioned_sidebars/` and `versions.json`: one snapshot per release, newest
  first. The newest is the default at `/docs/`; see "Versioned docs" below.
- `src/pages/index.tsx`: the home page. It renders the site's home markup (the split hero with
  its terminal card, the sections and the feature cards), styled from the shared
  `packages/frame/site-frame.css`, so the two home pages line up. It shows the release version
  from `packages/frame/release.ts`. `src/css/custom.css` maps the Laces design tokens onto the
  theme.
- `src/components/docs-version-navbar-item.tsx` and `src/theme/NavbarItem/ComponentTypes.tsx`: the
  version picker, a `custom-docsVersion` navbar item that shows only on doc pages.
- The frame, fonts, marks and favicon aren't copied here: `docusaurus.config.ts` loads
  `packages/frame/site-frame.css` first and serves `packages/frame/public` and
  `packages/brand/public` as extra static folders, so `/fonts/`, `/img/mark-*.svg` and
  `/favicon.svg` are the same files the site serves. `scripts/site-frame.test.mjs` checks that
  wiring.
- `static/img/guides/`: the guide screenshots, made by
  [scripts/screenshots/](scripts/screenshots/README.md) from a lab appliance and scrubbed before
  they're saved.
- `docusaurus.config.ts`: site config, navbar (it mirrors the site's header, theme switch
  included) and footer. Broken links, anchors and Markdown links fail the build.

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
npm run serve -w @sneakers-pam/docs
```

The published build leaves Next out:

```bash
DOCS_INCLUDE_NEXT=false npm run build -w @sneakers-pam/docs
```

## ✍️ Writing pages

- Link to other pages by file, for example `[Approvals](./concepts/approvals.md)`, so the build
  can check the link.
- Callouts use admonitions: `:::danger`, `:::warning`, `:::caution`, `:::tip`, `:::info` and
  `:::note`, with an optional title in brackets, such as `:::info[Coming in v0.1.0]`.
- Steps that differ by operating system use tabs that stay in sync across the page and in the URL:

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
- **Next:** the pages in `docs/` are Next, unreleased main, at `/docs/next/`, under a banner that
  points at the current version. Write new and changed pages there. Dev, CI and preview builds
  include Next; the deploy builds with `DOCS_INCLUDE_NEXT=false`, so the published site has the
  released versions only.
- **The picker:** a version dropdown sits right after the wordmark on doc pages, where the site's
  header shows nothing, so the rest of the header lines up with the site's. It isn't on the home
  page, whose header matches the site's exactly. Below 997px there's no room beside the
  wordmark, so it moves into the menu, under Versions.
- **Cutting a version:** a release cuts its docs version in its own PR, from the repo root, after
  bumping `packages/frame/release.ts`:

```bash
npm run docs:version
```

That runs `docusaurus docs:version <version>` for the release version, copying `docs/` into
`versioned_docs/` and adding it to `versions.json`. Commit all three. The deploy refuses a release
whose version isn't cut (`npm run check:docs-version`).

- **Fixing a released version:** edit its copy in `versioned_docs/`. A fix that also applies to
  Next goes in `docs/` too.

## 📍 Where to look

- [docs/getting-started.md](docs/getting-started.md), [docs/concepts/](docs/concepts/),
  [docs/mcp-guide.md](docs/mcp-guide.md): the content pages.
- [docs/user-guide/](docs/user-guide/), [docs/admin-guide/](docs/admin-guide/),
  [docs/appliance-guide/](docs/appliance-guide/): the user, admin and appliance admin guides, in
  Next only until the next release cuts them.
- [docs/security.md](docs/security.md), [docs/contributing.md](docs/contributing.md): project
  pages.
