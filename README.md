# website 🌐

> 🥿 The public Sneakers-PAM product site: the pitch, the download and how to verify it.

## 🏗️ What's here

- `app/routes/home.tsx`: the one page. `app/content/sneakers-pam.ts` holds its copy,
  `app/content/release.ts` holds the current release's downloads — a new release is a change to
  that file only.
- `app/components/`: the split hero, feature grid, terminal card, downloads table and nav/footer.
  Plain CSS in `app/components/marketing.css`, no Tailwind.
- `react-router.config.ts`: `ssr: false` with the home route prerendered, so the build is static
  HTML — no Node server at request time.
- `.github/workflows/checks.yml`: the org scrub (leak guard) plus build and a link check on every
  PR. `.github/workflows/deploy.yml`: deploys only when a GitHub Release is published.

## 🚀 Run it locally

```bash
npm ci
npm run typecheck
npm run build
npm run preview
```

## 🙏 Acknowledgements

Sneakers-PAM was originally written by [@Bugs5382](https://github.com/Bugs5382).

## 📄 License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
