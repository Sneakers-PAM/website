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
  test file). `release.ts` also holds the `kubernetes` links: the same tag's Helm chart release on
  sneakers-release and its install guide's CPU architecture section, for arm64 (Raspberry Pi)
  installs, and the `proxmox` link: the qcow2's Proxmox VE guide at the same tag. The tests
  require every OVA and qcow2 to be listed with its `.sha256`, and the qcow2's label to say it's
  untested on Proxmox VE until it has been.
- `app/components/` - the hero, nav, footer, feature grid, terminal card and downloads table.
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
