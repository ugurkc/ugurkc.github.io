# ugurkc.github.io

Personal site: bio + publishings. Built with [Astro](https://astro.build),
deployed to GitHub Pages on every push to `main`.

## Amending the site

- **Add/edit a publishing:** edit `src/data/publishings.yaml` (one entry per
  publishing: `title`, `description`, `date` — quoted, `"YYYY-MM-DD"` — and
  `url` — site-relative like `/watershed/`, or absolute `http(s)://...`),
  then push. That's it.
- **Edit the bio:** edit the header section in `src/pages/index.astro`.

## Local development

    npm install
    npm run dev        # http://localhost:4321
    npm run test       # validates publishings.yaml shape
    npm run build      # output in dist/

## Publishing a new interactive essay

Each essay lives in its own repo and appears at
`ugurkc.github.io/<repo-name>/`:

1. Create the repo `ugurkc/<slug>`. Set the build's base path to `/<slug>/`
   (Vite: `base: '/<slug>/'` in `vite.config.ts`).
2. Copy `.github/workflows/deploy.yml` from the
   [watershed repo](https://github.com/ugurkc/watershed) into the new repo.
3. Enable Pages for the repo with source "GitHub Actions":
   `gh api repos/ugurkc/<slug>/pages -X POST -f build_type=workflow`
4. Push to `main` — the essay goes live at `ugurkc.github.io/<slug>/`.
5. Add an entry for it in `src/data/publishings.yaml` here and push.
