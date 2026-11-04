# website 🌐

> 🥿 The public Sneakers-PAM product site and docs site, in one repo: the pitch, the download, how
> to verify it, and the system docs.

## 🏗️ What's here

An npm workspace with two apps and the two packages they share:

```text
.
├── apps/
│   ├── site/        www.sneakers-pam.com: React Router v7, prerendered to static HTML
│   └── docs/        docs.sneakers-pam.com: Docusaurus, with versioned docs
├── packages/
│   ├── frame/       site-frame.css, the fonts, the release version and the consent-first switches
│   └── brand/       the marks, the favicon, the touch icon and the link-preview card
├── scripts/         the docs version, no-storage and path-filter scripts the workflows run
└── .github/         one checks, one Release Drafter and one deploy workflow for both sites
```

- `apps/site`: the product site. `app/content/sneakers-pam.ts` holds its copy and
  `app/content/release.ts` the current release's downloads. See [AGENTS.md](AGENTS.md) for the
  layout inside it.
- `apps/docs`: the docs site, imported from the Sneakers-PAM/docs repo's main as one squashed
  `git subtree` commit (the content, not its commit history). See
  [apps/docs/README.md](apps/docs/README.md) for writing pages and how the versions work.
- `packages/frame`: the one copy of the frame both sites share (the header, page column and footer
  sizes, the frame colours, the hero and section styles), the fonts in `public/fonts/`,
  `release.ts`, the release version both sites show, and the consent-first preferences: the
  cookie choice, the theme switch both headers render and the docs' full-width switch. Change it
  here and both sites change. See [packages/frame/README.md](packages/frame/README.md).
- `packages/brand`: the marks, favicon, touch icon and link-preview card (`img/og-card.png`, made
  from `og-card.html`) in `public/`. Both sites serve the two packages' `public/` folders from
  their own root (`/fonts/`, `/img/`, `/favicon.svg`).

## 🍪 Privacy

Neither site stores anything in the browser (localStorage, sessionStorage, cookies or IndexedDB)
until the visitor accepts the cookie choice, which only shows once they use the theme or
full-width switch. Until then the theme follows the system setting. CI checks both builds with
`scripts/check-no-storage.mjs`.

## 🚀 Run it locally

Use the Node.js version in `.nvmrc`, then install once at the root:

```bash
npm ci --ignore-scripts
```

Every check, the same way CI runs it:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check:storage:site
npm run check:storage:docs
```

One app at a time:

```bash
npm run dev -w @sneakers-pam/site
npm run start -w @sneakers-pam/docs
```

The site builds to `apps/site/build/client`, the docs to `apps/docs/build`. The site's build also
prints the security review PDF with headless Chrome; see [AGENTS.md](AGENTS.md).

## 🔖 Cutting a release

A release ships both sites, and the docs get a version for it:

1. Bump the version in `packages/frame/release.ts` and update the site's
   `apps/site/app/content/release.ts` (downloads, sizes, guides) in the release's PR.
2. In the same PR, cut the docs version with `npm run docs:version`. It snapshots `apps/docs/docs`
   (vNext) into `apps/docs/versioned_docs/` under that version, which becomes the default at
   `/docs/`. Commit `apps/docs/versions.json`, `versioned_docs/` and `versioned_sidebars/`.
3. Merge it, then publish the GitHub Release.

`npm run check:docs-version` fails unless the release version is cut and is the newest docs
version, and no cut version takes vNext's name or path (`vnext`, `next` or `current`). The deploy runs it first, so a release without its docs version deploys nothing.

## 🚢 Deploying

A published GitHub Release builds both apps, then deploys `apps/site/build/client` to the
Cloudflare Pages project `sneakers-pam-www` and `apps/docs/build` to `sneakers-pam-docs`, creating
each project on the first run if it doesn't exist yet. A release published as a pre-release goes
to each project's `dev` branch, its dev site; any other release goes to production. The docs are
built with `DOCS_INCLUDE_NEXT=true`, so the published docs carry vNext (unreleased `main`) under
its banner beside the released versions, with the released version as the default.
Nothing else deploys: a merge to `main` only drafts the next release. The custom domains
(sneakers-pam.com, www.sneakers-pam.com, docs.sneakers-pam.com) are added by hand in Cloudflare,
not by this workflow.

## ✅ CI

`.github/workflows/checks.yml` runs the org scrub (leak guard) and the `🧪 Build & Test` job.
`scripts/changed-apps.mjs` picks what that job builds: a change under `apps/site` or `apps/docs`
alone builds that app; anything shared (the packages, the root manifests, the workflows) builds
both. Lint and the shared packages' tests always run. After each app's build, the no-storage check
loads its pages and fails on any write to browser storage before consent. The link check builds
the site only when the site could have changed.

## 🙏 Acknowledgements

Sneakers-PAM was originally written by [@Bugs5382](https://github.com/Bugs5382).

## 🔐 Export compliance

Sneakers-PAM is published from the United States and uses only standard, publicly available
cryptography; see [CRYPTO.md](CRYPTO.md). You are responsible for complying with applicable
export control and sanctions laws, including not using, exporting or re-exporting it in violation
of those laws or if you are on a restricted-party list.

## 📄 License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
