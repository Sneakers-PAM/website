# CLAUDE.md - website

Working agreement for this repository. The governance below is shared across the org's repos and
kept in sync with them.

## Enforced by hooks (run `bash .claude/hooks/install.sh` once per clone)

- Conventional Commits on commits, issue titles, and PR titles.
- No AI tells in commits/issues/PRs/comments/source; no emoji in source or commit messages (emoji
  are allowed in Markdown docs and CI workflow files).
- Pre-push: the ecosystem's format/lint/test gate must pass (Go: gofmt/vet/golangci-lint/test;
  npm: lint/test scripts; Python: ruff/pytest).

## Conventions

- Branching: never commit to `main`. Work on a feature/working branch; open a PR.
- Commits: Conventional Commits (`type(scope): description`). The operator (@Bugs5382) is the
  author of record on every commit.
- Voice: human-authored. No attribution trailers (`Co-Authored-By`, `Generated with`), no robot
  glyphs/emoji, no session framing.
- Local notes live in the git-ignored `.local/` folder; delete a note when its work is done.
- GitHub Actions: a job id must be a plain identifier (a letter or `_`, then alphanumerics/`-`/`_`);
  put emoji and display text in the job's `name:`, never the job key. The Actionlint check
  (`.github/workflows/action-lint.yaml`) enforces this, so a malformed workflow fails at PR time
  instead of silently at startup on `main`.

<!-- layout:begin npm/app -->
## Project layout

The `npm/app` layout, as a static product site (not a published package).
The governance sync replaces this whole CLAUDE.md with the shared template on
every run. Only the layout choice in the begin marker carries over, and this
section is rendered again from it. Anything else written here is replaced, so
keep repo-specific notes in AGENTS.md, which the sync leaves alone.

A React Router v7 site (`ssr: false`, prerendered at build time) that builds to static HTML in
`build/client/`. Nothing publishes to npm; the deploy workflow (`deploy.yml`) pushes `build/client`
to Cloudflare Pages, and only when a GitHub Release is published. The version comes from Release
Drafter, not a package bump.

### Tree

```text
.
├── app/
│   ├── root.tsx              the HTML shell (head, fonts, scripts)
│   ├── routes.ts             the route table
│   ├── routes/
│   │   └── home.tsx          the one page, composed from components + content
│   ├── components/           reusable presentational pieces (hero, nav, footer, ...)
│   ├── content/               the copy and release data; a new release changes release.ts only
│   └── app.css                global tokens (the Laces palette) and resets
├── public/                   static files served as-is (favicon, logo marks)
├── react-router.config.ts    ssr: false, the prerendered route list, PREVIEW_BASE_PATH
├── vite.config.ts            the Vite build, also reads PREVIEW_BASE_PATH
├── package.json
└── tsconfig.json
```

### What goes where

- `app/content/release.ts`: the current release's downloads and the verify key. A new release is
  a change to this file only.
- `app/content/sneakers-pam.ts`: the page copy (hero, sections, footer marks).
- `app/components/`: no business logic; props in, markup out. Shared CSS lives in
  `marketing.css`, imported by each component that needs it.
- `build/` is gitignored; nothing under it is ever committed.

### Naming

- Files: `kebab-case.tsx` for components and routes, matching React Router's own convention.
- Types and interfaces are `PascalCase`; functions and variables `camelCase`.
- Named exports only.

### Tests

- `app/content/release.test.ts` (Node's test runner, via `--experimental-strip-types`) checks the
  release data's own invariants (every asset's URL matches the current tag, no duplicate names, no
  ISO where the release ships none). There is no component test harness yet; add one before this
  site grows past a single page.
<!-- layout:end -->

## CI and Actions minutes

GitHub bills every job for at least one full minute, and a private org's included minutes run out
fast during a wave of PRs. The shipped workflows are shaped around that:

- **Drafts run nothing.** PR workflows skip draft PRs and run on `ready_for_review`, `opened`,
  `synchronize` and `reopened`. Open a PR as a draft, run the full checks locally, push once they
  pass, and mark it ready when the work is finished. That starts one CI run. After it is ready,
  push only real fixes, batched into one push.
- **One job for the small checks.** PR Title, PR Body, PR Hygiene and the gitleaks secret scan are
  steps of one `✅ PR Checks` job (`job-pr-checks.yaml`). Every step runs even when an earlier one
  fails, so the log shows every failure. This job and the label checker are the only workflows
  that react to `edited`: a title or body fix reruns them, not the build.
- **Pull requests only.** Build, test, lint, licence and link-check workflows run on pull requests,
  not on push to `main`. The squash merge lands the tree the PR run already tested. Only Release
  Drafter runs on `main`, and `deploy.yml` runs only on a published release.
- **Keep the PR run honest:** the PR run covers the merged code only when the branch is up to date
  with `main` before it merges. In the branch ruleset, add **Require status checks to pass** with
  the repo's check names and turn on **Require branches to be up to date before merging** (API:
  the `required_status_checks` rule with `strict_required_status_checks_policy: true`; classic
  branch protection: `required_status_checks.strict: true`). The setting only exists alongside
  required checks. Use GitHub's "Update branch" when a PR falls behind.
- **No no-op jobs.** The licence check ships per ecosystem: `job-license-check-go.yaml` only where
  there is a root `go.mod`, `job-license-check-npm.yaml` only where there is a root `package.json`.
- **Every job has a `timeout-minutes`** (10 for small checks, 15 to 30 for builds, scans and
  releases), so a hung job stops long before GitHub's 360-minute default. Jobs that call a reusable
  workflow (`uses:`) cannot take one; the called workflow's jobs carry it.
- **Required checks:** if the ruleset or branch protection lists required checks, use the job
  names: `✅ PR Checks` replaces `PR Title`, `PR Body`, `PR Hygiene` and `Gitleaks (secret scan)`.

## Engineering discipline

- Root-cause before fixing: confirm the actual cause with evidence before changing code; do not
  patch symptoms.
- Map every reference before removing a feature: trace its wiring across the tree first, preserve
  adjacent behavior that only looks related, and defer-and-flag an entangled piece rather than
  guessing it.
- Verify with evidence, not assertions: run the real check for what changed (lint, a full
  template/build render, `actionlint` for workflows) before calling it done. Green CI is necessary,
  not sufficient.
- One concern per branch/PR, even tiny ones — it keeps reviews and the drafted changelog clean.
- When PRs interact, state an explicit merge ORDER rather than opening them and walking away:
  anything a *tag* triggers needs its inputs on `main` first; a new *gate* (check) needs the
  violations it catches fixed first; a workflow that builds from committed content needs that
  content merged first.
- Semver framing: `breaking` only means breaking against a *released* version; removing something
  that was never shipped is not a breaking change.
- Cross-repo reconciliation goes through a neutral drop-zone outside both repos — never a repo
  inside a repo, and no accidental gitlinks/submodules.

## Logging

- Log generously in any code you write or touch: entry and exit of significant operations, the
  decisions and branches taken, retries, state changes, external calls (target, duration,
  outcome), and every error with its context. Finding a problem fast matters more than quiet code.
- Pick the level by detail: `trace` for step-by-step detail and values, `debug` for flow, `info`
  for lifecycle, `warn` and `error` for problems. The environment level filters the volume, so
  too much logging is fine.
- Levels by environment: local dev `trace`; dev cluster `debug`; pre-production (qa/staging)
  `info`; production `error`. Set them per environment through `LOG_LEVEL` and `LOG_FORMAT`, never
  by changing code. Library fallbacks stay safe when nothing is set.
- Format: local dev is human-readable (`LOG_FORMAT=console`), never JSON. Every cluster
  environment logs JSON. Local run targets (the Taskfile, or `.env.example` where there is no run
  target) set `LOG_LEVEL=trace LOG_FORMAT=console`.
- Deployment defaults are production-safe: a Helm chart's `values.yaml` defaults to `json` and
  `error`, and a dev values overlay sets `debug`.
- Never log secrets, tokens, or personal data, not even at `trace`. Log an opaque or keyed ID
  instead.

## Workflow

Issue (from a template; free-form issues are disabled) -> for sequential / multi-step work, a parent
issue with ordered **sub-issues** -> put it on the active **milestone** -> branch
`<type>/<issue#>-<slug>` -> code (comments cite the issue) -> PR with a Conventional Commit title
(the autolabeler sets the category label from the title), the template body, and a **closing
summary** before merge -> **squash** merge. The operator (@Bugs5382) is the assignee.

On merge, release-drafter drafts the next notes by label and `CHANGELOG.md` updates on `main` via the
changelog action -- **nothing tags automatically**. When the first push to main resolves the version,
rename the milestone to that version. The maintainer then **manually publishes the GitHub Release**,
which creates the tag with the finalized changelog (and triggers the publish where the repo ships a
package).

Keep public artifacts (issues, PRs, commit messages) free of references to local-only design notes.

## Releasing

There is no version-bump workflow and no `CHANGELOG.md` here: this repo ships a site, not a
package. **Release Drafter** (`.github/workflows/release-drafter.yml`) drafts the next release's
notes on every push to `main`, extending `Sneakers-PAM/.github`'s canonical config. Releases are
plain SemVer starting at `0.1.0`, with no prereleases; publishing a release deploys the live
site. **Nothing tags automatically.** The maintainer publishes the drafted GitHub Release by
hand, which creates the `vX.Y.Z` tag and fires `deploy.yml`: a clean build of `build/client`,
deployed to Cloudflare Pages. A push to `main` that isn't released never deploys anything.
