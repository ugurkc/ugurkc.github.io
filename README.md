# ugurkc.github.io

Personal site: bio + publishings + blog. Built with
[Astro](https://astro.build), deployed to GitHub Pages on every push to
`main`.

## Amending the site

Everything below can now also be edited in the browser — see
[Editing content (no code)](#editing-content-no-code). To edit the files
directly instead:

- **Add/edit a publishing:** edit `src/data/publishings.yaml` (one entry per
  publishing: `title`, `description`, `date` — quoted, `"YYYY-MM-DD"` — and
  `url` — site-relative like `/movements/`, or absolute `http(s)://...`),
  then push. That's it.
- **Edit the bio:** edit `src/data/bio.md`.
- **Add/edit a blog post:** add or edit a markdown file in
  `src/content/blog/` (frontmatter: `title`, `description`, `date` — quoted
  `"YYYY-MM-DD"` — and `draft`).

## Editing content (no code)

Two admin panels ([Sveltia CMS](https://github.com/sveltia/sveltia-cms),
vendored in each repo) let the owner edit content from the browser:

- **<https://ugurkc.github.io/admin/>** — blog posts, the publishings list,
  and the bio (this repo).
- **<https://ugurkc.github.io/movements/admin/>** — the *Movements*
  essay text (the [movements](https://github.com/ugurkc/movements) repo).

### One-time setup: a fine-grained access token

The admin signs in with a GitHub fine-grained personal access token:

1. GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → **Generate new token**.
2. Repository access: **Only select repositories** → `ugurkc.github.io` and
   `movements`.
3. Permissions → Repository permissions → **Contents: Read and write**
   (Metadata: Read-only is added automatically).
4. Generate and copy the token.
5. In the admin, choose **Sign In Using Access Token** and paste it. The
   token is stored in the browser, so this is once per browser/device.

**Security:** never share the token or paste it anywhere other than these
two admin pages — it can push to both repos. Contents write also means
CI-executed code (`npm ci` and the `test` script both live in
`package.json`, which the token can rewrite), so treat a leaked token as
full repo compromise, not just an unwanted content edit. Revoke it at any
time from the same GitHub tokens page.

Content you paste into the CMS is markup, not just text: raw HTML and
`javascript:` links in a blog post or the bio would execute on the live
site, so CI rejects both (`src/lib/markup.test.ts`). Uploaded `.svg` files
are rejected for the same reason (`src/lib/uploads.test.ts`) — convert
graphics to PNG or JPG before uploading.

### Publishing model

Save = a commit to `main` → the repo's full test suite runs in CI (22 tests
in this repo, 299 in movements) → the site deploys, live in about a minute.
A failing edit does **not** deploy — the site stays on the last good
version. If an edit doesn't appear, check the repo's Actions tab.

### Blog drafts

`Draft` ON = unlisted preview: the post renders at its URL (shareable
link), but it's not on the homepage and carries `noindex`. Switch `Draft`
OFF to publish.

### Maintenance

To update the CMS: bump the exact-pinned `@sveltia/cms` version in each
repo's `package.json`, `npm install`, and push. The 2.4 MB admin bundle is
**not** committed — `npm run dev` and `npm run build` copy it out of
`node_modules` each time (the `predev`/`prebuild` scripts), so it can never
drift from the installed version and never bloats git history.

## Local development

    npm install
    npm run dev        # http://localhost:4321
    npm run test       # run the test suite
    npm run build      # output in dist/

## Publishing a new interactive essay

Each essay lives in its own repo and appears at
`ugurkc.github.io/<repo-name>/`:

1. Create the repo `ugurkc/<slug>`. Set the build's base path to `/<slug>/`
   (Vite: `base: '/<slug>/'` in `vite.config.ts`).
2. Copy `.github/workflows/deploy.yml` from the
   [movements repo](https://github.com/ugurkc/movements) into the new repo.
   The workflow runs `npm run test` — make sure `package.json` has a `test`
   script (e.g. `"test": "vitest run --passWithNoTests"`), or delete that
   line from the copied workflow.
3. Enable Pages for the repo with source "GitHub Actions":
   `gh api repos/ugurkc/<slug>/pages -X POST -f build_type=workflow`
4. Push to `main` — the essay goes live at `ugurkc.github.io/<slug>/`.
5. Add an entry for it in `src/data/publishings.yaml` here and push.
6. *(Optional)* For web-editable prose, copy the pattern from the movements
   repo — all of: `src/content/`, `src/lib/essayContent.*` (loader + tests),
   `src/lib/adminConfig.test.ts`, `public/admin/`, and the `@sveltia/cms` +
   `yaml` devDependencies (exact-pinned). Then:
   - In the new repo's `config.yml`: set `repo: ugurkc/<slug>` and
     `public_folder: /<slug>/uploads`.
   - Add the new repo to your fine-grained token's repository list
     (GitHub → Settings → Developer settings → Fine-grained tokens → edit) —
     without this the new admin cannot sign in.
   - Add `Disallow: /<slug>/admin/` to `public/robots.txt` **in this repo**
     (project pages can't serve the root robots.txt themselves).
