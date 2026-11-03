# AGENTS.md - website

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

The Sneakers-PAM product site: the pitch, the download and how to verify it. A React Router v7
app with `ssr: false`, prerendered at build time to static HTML in `build/client/` — there is no
Node server at request time, and nothing here publishes to npm. It ships as one deployable
artifact: the static site, pushed to Cloudflare Pages only when a GitHub Release is published.

An agent changing this repo should know: a new release is a change to `app/content/release.ts`
only (every download's URL, size and the verify key come from there); the home page is composed
from small presentational components in `app/components/` with no logic of their own; and nothing
deploys on a merge to `main` by itself — only publishing a Release does, via `deploy.yml`.

## Layout

- `app/routes/home.tsx` - the home page, composed from components and content.
- `app/routes/trust.tsx` - the trust center at `/trust`: posture, controls by area, documents,
  sub-processors and how to report a vulnerability.
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
- `app/site-frame.css` - the frame shared with the docs site: header, page column and footer
  sizes, the frame colours, and the `@font-face` rules for the self-hosted fonts in
  `public/fonts/`. The nav and footer in `marketing.css` and the docs' header and footer are laid
  out from these tokens only, so the two sites line up to the pixel. This copy is the source of
  truth. To change it, edit it here, copy it and `public/fonts/` to the docs repo
  (`src/css/site-frame.css`, `static/fonts/`) unchanged, and update the two checksums in
  `app/site-frame.test.ts` and the docs' `scripts/site-frame.test.mjs`. `root.tsx` preloads the
  three fonts the frame draws with, the same three the docs preload.
- `app/theme.ts` - light and dark mode. `app/app.css` holds both palettes as tokens (the dark one is
  the web UI kit's and the docs site's); with no choice made the page follows the system setting.
  The header's theme switch (`components/theme-switch.tsx`) cycles System, Light, Dark like the
  docs site's, keeps the choice in localStorage under `theme`, and an inline script in `root.tsx`
  sets `data-theme` before the first paint. `theme.test.ts` runs that script against a fake page.
  Dark is screen-only, so the security review PDF prints in light. Every colour lives in a token;
  `components/mark.tsx` swaps the light and dark marks.
- `public/` - the favicon, logo marks and `apple-touch-icon.png`, served as-is. The touch icon is a
  180x180 render of `img/mark-light.svg` on the page background; re-render it if the mark changes.
- Link previews: the Open Graph and Twitter card tags in `app/routes/home.tsx` read their values
  from `meta` in `app/content/sneakers-pam.ts`. There is no og:image yet.

## Build, test, lint

- Build: `npm run build` (writes static HTML to `build/client/`)
- Typecheck: `npm run typecheck`
- Test: `npm test` (the release data's own invariants; no fixtures or services needed)
- Lint: `npm run lint`
- Preview locally: `npm run preview` (serves `build/client` with `serve`)
- Security review PDF: `npm run build` ends by printing `/trust/security-review` with headless Chrome
  (`CHROME_PATH` if it isn't in a standard place; GitHub's Ubuntu runners have it) to
  `build/client/trust/sneakers-security-review.pdf`, the file the trust center's Documents section
  links for download. A build without Chrome fails rather than ship a page with a dead link.
- Evidence check: `TRUST_EVIDENCE_ROOT=<folder with the Sneakers-PAM checkouts> npm run check:evidence`
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
- `PREVIEW_BASE_PATH` (an env var, read by both `vite.config.ts` and `react-router.config.ts`,
  and by `scripts/build-security-pdf.mjs` through `scripts/pdf-paths.mjs`) lets a one-off build
  set the router's basename and asset base for serving from a sub-path (e.g. a preview). A
  preview build prints the PDF too, into `build/client/<base>/trust/`. It's unset in the real
  build, so all of them default to `/`; never hardcode a sub-path into any of them.
- The hero headline and the footer's trademark notice each bind a mark's `™` to its last word in
  a `.nowrap` span (see `app/components/split-hero.tsx` and `footer.tsx`). Keep that pairing when
  editing either line; a mark must never wrap onto its own line.
