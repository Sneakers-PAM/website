# AGENTS.md - website

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

The Sneakers-PAM product site and docs site, as one npm workspace:

- `apps/site`: the product site (www.sneakers-pam.com): the pitch, the download and how to verify
  it. A React Router v7 app with `ssr: false`, prerendered at build time to static HTML in
  `apps/site/build/client/`; there is no Node server at request time.
- `apps/docs`: the docs site (docs.sneakers-pam.com), Docusaurus with versioned docs. It came from
  the Sneakers-PAM/docs repo's main as one squashed `git subtree` import; see
  [apps/docs/README.md](apps/docs/README.md).
- `packages/frame`: `site-frame.css`, the fonts in `public/fonts/`, `release.ts`, the release
  version both sites show, and the consent-first preferences (`consent.ts`, `theme-pref.ts`,
  `full-width.ts` and their React pieces); see [packages/frame/README.md](packages/frame/README.md).
  `packages/brand`: the marks, favicon, touch icon and link-preview card in `public/`.
- `scripts/`: `docs-version.mjs` (with `check-docs-version.mjs` and `cut-docs-version.mjs`),
  `check-no-storage.mjs`, which fails a build that writes browser storage before consent, and
  `changed-apps.mjs`, the path filter the workflows use. Their tests are `scripts/*.test.mjs`.

Nothing here publishes to npm. One published GitHub Release deploys both sites to Cloudflare Pages
through `deploy.yml`.

An agent changing this repo should know: a new release bumps `packages/frame/release.ts`, updates
`apps/site/app/content/release.ts` (every download's URL, size and the verify key come from there)
and cuts the docs version with `npm run docs:version`, all in one PR; the home page is composed
from small presentational components in `apps/site/app/components/` with no logic of their own;
and nothing deploys on a merge to `main` by itself — only publishing a Release does.

## Layout (apps/site)

Paths below are under `apps/site/` unless they say otherwise.

- `app/routes/home.tsx` - the home page, composed from components and content.
- `app/routes/trust.tsx` - the trust center at `/trust`: posture, controls by area, documents,
  sub-processors and how to report a vulnerability. The controls list has status chips (each with
  its count, toggles) and a sort by area or status. The view lives only in the URL hash
  (`#status=shipped,partial&sort=status`); nothing is stored in the browser. The prerendered HTML
  lists every control, so with JavaScript off nothing is hidden. The logic is pure, in
  `app/content/trust/filter.ts`, with `filter.test.ts`.
- `app/routes/security-review.tsx` - the print source of the security review PDF at
  `/trust/security-review` (noindex, not linked from the nav).
- `app/content/trust/` - the one source behind both: `controls.ts` (the control register: status,
  first tag, evidence, framework mappings, open issues), `review.ts` (the review's long-form
  sections), `trust-center.ts` (the page copy) and `types.ts`. A claim lives in one place; both
  pages render from it. `trust.test.ts` holds the invariants: evidence and issues point only at
  public repos, a shipped control names its tag and evidence, a planned one links its issue, and
  the content claims no certification.
- `app/content/` - the copy (`sneakers-pam.ts`) and the release data (`release.ts`, with its own
  test file). `release.ts` also holds the `kubernetes` details: the same tag on sneakers-release,
  the chart's path and version, and its install guide with the CPU architecture section for arm64
  (Raspberry Pi) installs; the `proxmox` and `esxi` guide links; and `installTargets`, the install
  target table (OVA, qcow2 and Helm available, ISO not yet available, AWS AMI being considered,
  with each one's CPU architecture). The tests require every OVA and qcow2 to be listed with its
  `.sha256`, only an available target to link a guide, and the appliance images to say amd64 only.
- `app/components/` - the hero, nav, footer, feature grid, terminal card and downloads table.
- `packages/frame/site-frame.css` (repo root) - the frame shared with the docs: header, page
  column and footer sizes, the frame colours, and the `@font-face` rules for the self-hosted fonts
  in `packages/frame/public/fonts/`. The nav and footer in `marketing.css` and the docs' header
  and footer are laid out from these tokens only, so the two sites line up to the pixel. It's the
  one copy: `root.tsx` imports it as `@sneakers-pam/frame/site-frame.css` and the docs config
  loads the same file, so a change here changes both sites. `root.tsx` preloads the three fonts
  the frame draws with, the same three the docs preload (`app/root.test.ts`).
- `shared-public.ts` - the Vite plugin that serves `packages/frame/public` and
  `packages/brand/public` from the site root, in dev and in the build output, the way Vite serves
  `public/`. The site has no `public/` folder of its own.
- `app/theme.ts` - light and dark mode, consent first. `app/app.css` holds both palettes as tokens
  (the dark one is the web UI kit's and the docs site's). Until the visitor accepts the cookie
  choice the page follows the system setting and nothing is stored. The header's switch
  (`components/theme-switch.tsx`, the shared `ThemeToggle` from packages/frame) only opens the
  cookie bar (`components/consent-bar.tsx`) before an answer; after one it flips Light and Dark,
  stored under `sneakers-site:` keys only if they accepted. An inline script in `root.tsx` sets
  `data-theme` before the first paint; `theme.test.ts` runs it against a fake page.
  `components/scroll-to-top.tsx` stands in for React Router's `ScrollRestoration`, which writes
  sessionStorage. Dark is screen-only, so the security review PDF prints in light. Every colour
  lives in a token; `components/mark.tsx` swaps the light and dark marks.
- `packages/brand/public/` (repo root) - the favicon, logo marks and `apple-touch-icon.png`,
  served as-is by both sites. The touch icon is a 180x180 render of `img/mark-light.svg` on the
  page background; re-render it if the mark changes (`packages/brand/brand.test.ts`).
- Link previews: every route's title, Open Graph and Twitter card tags come from `pageMeta` in
  `app/content/meta.ts` (summary_large_image, absolute URLs), with the share card
  `packages/brand/public/img/og-card.png` (1200x630), made from `packages/brand/og-card.html`. To
  change the card, edit that page and render it headless at 1200x630, device scale 1;
  `app/content/meta.test.ts` and `packages/brand/brand.test.ts` check the tags and the file. The
  docs use the same card (`image` in `apps/docs/docusaurus.config.ts`).

## Build, test, lint

Install once at the root with `npm ci --ignore-scripts`. At the root, each command runs over every
workspace; add `-w @sneakers-pam/site` or `-w @sneakers-pam/docs` for one app.

- Build: `npm run build` (the site to `apps/site/build/client/`, the docs to `apps/docs/build/`)
- Typecheck: `npm run typecheck`
- Test: `npm test` (every workspace's tests plus `scripts/*.test.mjs`; no fixtures or services)
- Lint: `npm run lint` (ESLint over the whole repo, from the root `eslint.config.mjs`)
- No storage before consent: `npm run check:storage:site` and `npm run check:storage:docs`, after
  the builds. They load every page in jsdom with storage watched (and hydrate and use a few docs
  pages); CI runs both.
- Preview locally: `npm run preview -w @sneakers-pam/site` (serves `build/client` with `serve`),
  `npm run serve -w @sneakers-pam/docs`
- Docs version: `npm run docs:version` cuts the docs version for `packages/frame/release.ts`;
  `npm run check:docs-version` fails unless it's cut and newest, and no cut version is named
  `vnext`, `next` or `current`. The deploy runs the check first.
- Security review PDF: `npm run build` ends by printing `/trust/security-review` with headless Chrome
  (`CHROME_PATH` if it isn't in a standard place; GitHub's Ubuntu runners have it) to
  `build/client/trust/sneakers-security-review.pdf`, the file the trust center's Documents section
  links for download. A build without Chrome fails rather than ship a page with a dead link.
- Evidence check (from the root or `apps/site`):
  `TRUST_EVIDENCE_ROOT=<folder with the Sneakers-PAM checkouts> npm run check:evidence`
  confirms every evidence path and Go test name in `controls.ts` exists. It needs the other repos
  checked out, so it isn't in CI; run it whenever the control register changes.

## Logging

Follow the logging rules in `CLAUDE.md`. In short:

- Log generously: entry and exit of significant operations, decisions and branches, retries, state
  changes, external calls (target, duration, outcome), and every error with its context.
- Levels: `trace` for step-by-step detail, `debug` for flow, `info` for lifecycle, `warn` and
  `error` for problems. The environment filters the volume, so err on the side of too much.
- Environments: local dev `trace` with `LOG_FORMAT=console` (never JSON), dev cluster `debug`,
  qa/staging `info`, production `error`. Every cluster environment logs JSON. Set levels through
  `LOG_LEVEL` and `LOG_FORMAT`, never in code; local settings live in the run target or
  `.env.example`.
- Never log secrets, tokens, or personal data, not even at `trace`. Log an opaque or keyed ID.

## Conventions and gotchas

- See `CLAUDE.md` for the branch/commit/PR rules; they are enforced by the git hooks in
  `.claude/hooks` (run `bash .claude/hooks/install.sh` once per clone).
- Open every PR as a draft. CI skips drafts, so run the full checks locally, push once they pass,
  and mark the PR ready when the work is finished; see CLAUDE.md "CI and Actions minutes".
- `PREVIEW_BASE_PATH` (an env var, read by both `apps/site/vite.config.ts` and
  `react-router.config.ts`, and by `scripts/build-security-pdf.mjs` through `scripts/pdf-paths.mjs`)
  lets a one-off site build set the router's basename and asset base for serving from a sub-path
  (e.g. a preview). A preview build prints the PDF too, into `build/client/<base>/trust/`. It's
  unset in the real build, so all of them default to `/`; never hardcode a sub-path into any of
  them. The docs take their base from `baseUrl` in `apps/docs/docusaurus.config.ts`.
- vNext (unreleased main) is in every docs build, the deploy included (`DOCS_INCLUDE_NEXT=true`);
  only a build that sets `DOCS_INCLUDE_NEXT=false` leaves it out.
- CI builds only what a change touches (`scripts/changed-apps.mjs`): `apps/site` or `apps/docs`
  alone builds that app; anything else builds both. Keep a new shared path out of `ROOT_DOCS`
  there unless neither app reads it.
- The hero headline and the footer's trademark notice each bind a mark's `™` to its last word in
  a `.nowrap` span (see `app/components/split-hero.tsx` and `footer.tsx`). Keep that pairing when
  editing either line; a mark must never wrap onto its own line.
