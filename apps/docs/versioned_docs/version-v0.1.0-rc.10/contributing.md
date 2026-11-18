# Contributing

Sneakers-PAM is developed in the open across several repositories under the
[Sneakers-PAM](https://github.com/Sneakers-PAM) GitHub organization. This page covers
contributing to the project generally; each repository's own README and `CONTRIBUTING.md` cover
its specific build and test steps.

## Workflow

1. Open an issue from the repository's template — free-form issues are disabled. Multi-step work
   uses a parent issue with ordered sub-issues, on the active milestone.
2. Branch from `main` as `<type>/<issue#>-<slug>`, for example `feat/12-add-listener`.
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope):
   description`). No attribution trailers, no emoji in source or commit messages.
4. Open a pull request with a Conventional Commit title, referencing the issue it closes.
5. Pull requests merge by squash, once CI is green.

Keep one concern per pull request, even a small one.

## Developer Certificate of Origin (DCO)

Every commit must be signed off:

```bash
git commit -s -m "type(scope): description"
```

This adds a `Signed-off-by` trailer certifying that you wrote the change, or otherwise have the
right to submit it, under the [Developer Certificate of Origin](https://developercertificate.org/).
A pull request with any unsigned commit won't be merged.

## No real identifiers

Every Sneakers-PAM repository is public. Code, tests, fixtures and docs use `example.org`,
`192.0.2.0/24`, `2001:db8::/32` and invented names — never a real hostname, address, or anyone's
real identifying details from a production deployment.

## Where to start

Issues labelled `help wanted` or `good first issue` on any repository are a reasonable place to
begin. See [Governance](./governance.md) for how decisions get made, and
[Security](./security.md) for how to report a vulnerability rather than filing it as a regular issue.
