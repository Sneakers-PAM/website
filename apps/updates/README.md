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
- `public/<channel>/index.json` and `public/<channel>/index.json.sigstore.json`, channel `rc` or
  `stable`: the feed and its cosign blob bundle. They are not in the repo until a release adds them.
  A feed file that is missing answers 404, and the box falls back to GitHub.

The format of `index.json` is fixed for the box, the publisher and this host (issue #60). The feed
files are produced and signed by the appliance's release workflow and proposed here as pull requests.

## Guards

- `npm test` checks the redirect, the headers and that nothing else can be served
  (`scripts/updates-host.test.mjs`).
- `npm run check:feed-docs` fails when a change adds a version to an index whose docs snapshot is not
  in `apps/docs/versions.json` yet (`scripts/check-feed-docs.mjs`). It compares with `origin/main`
  (`--base=<ref>` to change it). It runs on pull requests and again before the deploy.

## Deploy

`.github/workflows/deploy-updates.yml` deploys `public/` to the Pages project `sneakers-pam-updates`
on its own when a change under `apps/updates/**` merges to `main` (or from a manual run). It does not
wait for a release, unlike the site and the docs.
