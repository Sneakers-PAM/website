# website 🌐

> 🥿 The public Sneakers-PAM project site and system docs, built with Docusaurus.

## 🏗️ What's here

- `docs/`: the documentation pages, one Markdown file per page. The sidebar order lives in
  `sidebars.ts`.
- `src/pages/index.tsx`: the home page. `src/css/custom.css` maps the Laces design tokens onto the
  theme.
- `static/img/`: the logo, mark and favicon.
- `docusaurus.config.ts`: site config, navbar and footer. Broken links, anchors and Markdown links
  fail the build.
- `.github/workflows/checks.yml`: the org scrub (leak guard) plus the `🧪 Build & Test` job, which
  type-checks and builds the site on every PR.

Nothing deploys from this repo: there is no Pages or deploy workflow.

## 🚀 Run it locally

Use the Node.js version in `.nvmrc`, then:

```bash
npm ci --ignore-scripts
npm run start
```

Build the static site the same way CI does (the output lands in `build/`):

```bash
npm ci --ignore-scripts
npm run typecheck
npm run build
npm run serve
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

Versioning is on, with no snapshots yet: the pages in `docs/` are the current ("Next") version and
the whole site. When a release ships, cut its snapshot with:

```bash
npm run docusaurus docs:version 0.1.0
```

That copies `docs/` into `versioned_docs/` and adds `versions.json`; the version dropdown in the
navbar appears once there's more than one version. From then on, build the published site with
`DOCS_INCLUDE_NEXT=false` so the unreleased "Next" pages stay local.

## 📍 Where to look

- [docs/getting-started.md](docs/getting-started.md), [docs/concepts/](docs/concepts/),
  [docs/mcp-guide.md](docs/mcp-guide.md): the content pages.
- [docs/security.md](docs/security.md), [docs/contributing.md](docs/contributing.md): project
  pages.

## 📄 License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
