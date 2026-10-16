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

- `app/routes/home.tsx` - the one page, composed from components and content.
- `app/content/` - the copy (`sneakers-pam.ts`) and the release data (`release.ts`, with its own
  test file).
- `app/components/` - the hero, nav, footer, feature grid, terminal card and downloads table.
- `public/` - the favicon and logo marks, served as-is.

## Build, test, lint

- Build: `npm run build` (writes static HTML to `build/client/`)
- Typecheck: `npm run typecheck`
- Test: `npm test` (the release data's own invariants; no fixtures or services needed)
- Lint: `npm run lint`
- Preview locally: `npm run preview` (serves `build/client` with `serve`)

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
- `PREVIEW_BASE_PATH` (an env var, read by both `vite.config.ts` and `react-router.config.ts`)
  lets a one-off build set the router's basename and asset base for serving from a sub-path
  (e.g. a preview). It's unset in the real build, so both default to `/`; never hardcode a
  sub-path into either config file.
- The hero headline and the footer's trademark notice each bind a mark's `™` to its last word in
  a `.nowrap` span (see `app/components/split-hero.tsx` and `footer.tsx`). Keep that pairing when
  editing either line; a mark must never wrap onto its own line.
