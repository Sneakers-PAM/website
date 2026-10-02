# website 🌐

> 🥿 The public Sneakers-PAM project site and system docs, built with VitePress and deployed by
> GitHub Pages.

## 🏗️ What's here

- `docs/`: the VitePress site source — one Markdown page per doc, under `docs/.vitepress/` for
  config and theme.
- `.github/workflows/checks.yml`: the org scrub (leak guard) plus a build check on every PR.
- `.github/workflows/deploy.yml`: builds and deploys the site to GitHub Pages on every push to
  `main`.

## 🚀 Run it locally

```bash
cd docs
npm install
npm run dev
```

Build the static site the same way CI does:

```bash
cd docs
npm install
npm run build
```

## 📍 Where to look

- [Live site](https://sneakers-pam.github.io/website/) (once Pages is serving it).
- [docs/index.md](docs/index.md): the home page.
- [docs/getting-started.md](docs/getting-started.md), [docs/concepts/](docs/concepts/),
  [docs/mcp-guide.md](docs/mcp-guide.md): the content pages.

## 📄 License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
