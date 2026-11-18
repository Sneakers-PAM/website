# apps/updates

The signed update feed host, updates.sneakers-pam.com: a third static app beside `apps/site` and
`apps/docs`. It is plain files, with no build step. `public/` is the deploy directory.

## Files

- `public/_redirects`: every path that is not a feed path goes to https://sneakers-pam.com with a 302.
  Cloudflare Pages applies redirects before it looks for a file, and only the first matching rule
  applies, so each feed path has a 200 rule for itself ahead of the splat. That keeps the feed files
  out of the redirect.
- `public/_headers`: the four feed paths are `application/json`, `Cache-Control: public, max-age=300`
  and `X-Content-Type-Options: nosniff`.
- `public/index.html`: a plain page, reached only if the redirect does not catch the request.
- `feed/<channel>/index.json`, channel `rc` or `stable` (a `.gitkeep` holds each directory): the
  reviewed, UNSIGNED source of the feed. The appliance's feed workflow proposes changes to it as pull
  requests; nothing signed is ever committed.
- `public/<channel>/index.json` and `public/<channel>/index.json.sigstore.json`: the feed and its
  cosign blob bundle, as the box reads them. Both are generated at deploy time and git-ignored. A
  channel with no source has no file there and answers 404, and the box falls back to GitHub.
- `feed-public-key.pem`: the public half of the feed signing key. The deploy verifies every signature
  with it before anything goes live.

The format of `index.json` is fixed for the box, the publisher and this host (issue #60). The signature
is a cosign blob bundle over the exact bytes of the source file.

## Guards

- `npm test` checks the redirect, the headers and that nothing else can be served
  (`scripts/updates-host.test.mjs`).
- `npm run check:feed-docs` fails when a change adds a version to an index whose docs snapshot is not
  in `apps/docs/versions.json` yet (`scripts/check-feed-docs.mjs`). It compares with `origin/main`
  (`--base=<ref>` to change it). It runs on pull requests and again before the deploy.
- `npm run check:feed-content` checks each source index (`scripts/feed-content.mjs`): the `feed`
  section (channel equal to the directory, an integer `sequence` of 1 or more, an RFC 3339
  `generated_at`), the `withdrawn` entries, `file`, `tag` and a positive `size` on every entry, a
  `sequence` strictly above the deployed feed's (unless the bytes are the same), and that each
  entry's release asset exists with that size. Pull requests pass `--skip-network`, which leaves the
  asset lookups out; the deploy runs the whole check (`GITHUB_TOKEN` is used when set).
- `npm run stage:feed` copies each source index to `public/<channel>/index.json`
  (`scripts/feed-stage.mjs`) and fails on an empty source.

## Deploy

`.github/workflows/deploy-updates.yml` runs when a change under `apps/updates/**` merges to `main` (or
from a manual run). It does not wait for a release, unlike the site and the docs.

1. Job `check` (no secrets): the docs check and the full feed content check.
2. Job `sign_and_deploy`, in the `feed-signing` environment, so the owner approves each run: it stages
   the sources into `public/`, signs each staged index with cosign (`FEED_SIGNING_KEY` and
   `COSIGN_PASSWORD`, secrets of that environment only, no transparency log), verifies each signature
   with `feed-public-key.pem`, keeps the signed files as the `signed-feed` workflow artifact, and
   deploys `public/` to the Pages project `sneakers-pam-updates`.

A push that changes only the static files (for example `public/_headers`) goes through the same job.
The staged sources are signed again; the bytes signed are the same reviewed source, so that is safe.
A channel with no source is not signed or served.
