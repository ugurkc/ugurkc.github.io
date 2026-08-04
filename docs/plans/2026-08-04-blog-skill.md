# `/blog` Essay-Scaffolding Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A user-level Claude Code skill (`/blog <slug>`) that scaffolds a new interactive essay's infrastructure — GitHub repo, Pages, deploy workflow, Sveltia CMS admin, and a minimal generic content model — without scaffolding any visual/interactive shell.

**Architecture:** `~/.claude/skills/blog/` holds `SKILL.md` (the prose instructions Claude follows), `scaffold.sh` (one script that does every mechanical step: template copy + placeholder substitution, npm install, git/gh operations, hub housekeeping), and `templates/repo/` (a 1:1 copy of the new repo's file tree, with `{{SLUG}}`/`{{REPO}}`/`{{TITLE}}` placeholders). Claude gathers the slug, shows the user the plan, waits for confirmation in chat, then runs `scaffold.sh <slug>` once. Design doc: `docs/plans/2026-08-04-blog-skill-design.md`.

**Tech Stack:** Bash (the script), Vite + React 19 + TS (the scaffolded app, matching the watershed repo's proven dependency versions), vitest, `@sveltia/cms` 0.178.0 (exact-pinned, matching the two existing repos).

**Where things live:**
- Skill: `~/.claude/skills/blog/` — NOT inside either git repo we've been working in. `~/.claude` is not itself a git repo, so this plan initializes a small **local-only** git repo at `~/.claude/skills/blog/` for history (no remote — personal tooling, nothing to push).
- Design doc + this plan: `ugurkc.github.io` repo (`docs/plans/`), since that repo already hosts the personal-site-system's documentation.
- Reference repos: `~/repos/markov-transitions` (= watershed, read from during template creation, never modified) and `~/repos/ugurkc.github.io` (the hub — the skill DOES write to this one at runtime, adding the new essay's publishings entry and robots line).

**Hard rules:**
- No `Co-Authored-By` / "Generated with Claude Code" trailers on any commit — including ones the *scaffolded skill* makes on the user's behalf. Bake this into `scaffold.sh`'s commit calls directly (never rely on a template file to enforce it).
- Task 9 (the real end-to-end test) creates a public GitHub repo and modifies the **live hub site** (adds an entry to `publishings.yaml`, pushes, deploys). This is "modifying public content" — get the user's explicit go-ahead in chat immediately before running it, even though it's part of an approved plan. Clean up afterward (delete the throwaway repo, revert the hub changes) so no permanent test cruft survives on the live site.

---

### Task 1: Skill scaffold + local git repo

**Files:**
- Create: `~/.claude/skills/blog/SKILL.md` (skeleton only — full content in Task 8)
- Create: `~/.claude/skills/blog/templates/repo/` (empty dir, populated in Tasks 2–6)

**Step 1: Create the directory structure and a skeleton `SKILL.md`**

```bash
mkdir -p ~/.claude/skills/blog/templates/repo
cat > ~/.claude/skills/blog/SKILL.md <<'EOF'
---
name: blog
description: placeholder — replaced in Task 8
user_invocable: true
---

placeholder
EOF
```

**Step 2: Init a local-only git repo for the skill**

```bash
cd ~/.claude/skills/blog
git init -q -b main
git add -A
git commit -q -m "Scaffold the /blog skill directory"
```

Verify: `git -C ~/.claude/skills/blog log --oneline` shows one commit. `git -C ~/.claude/skills/blog remote -v` is empty (no remote — this repo is never pushed anywhere).

---

### Task 2: Templates — base Vite + React + TS app

**Files (all under `~/.claude/skills/blog/templates/repo/`):**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/vite-env.d.ts`, `src/index.css`, `src/App.tsx`

These mirror the watershed repo's proven, already-tested versions — minus watershed-specific dependencies (`@xyflow/react`, `react-markdown`) and minus any chassis (theme toggle, sidebar, dark-mode preload script). `{{SLUG}}` and `{{TITLE}}` are substituted by `scaffold.sh` at run time (Task 7) — do not resolve them here.

**`package.json`:**

```json
{
  "name": "{{SLUG}}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@sveltia/cms": "0.178.0",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0",
    "vitest": "^4.1.10",
    "yaml": "^2.9.0"
  }
}
```

**`vite.config.ts`:**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/{{SLUG}}/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

**`tsconfig.json`:**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**`tsconfig.app.json`** (types includes `node` — `adminConfig.test.ts`, added in Task 6, uses `node:fs`/`node:path`/`node:url`):

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client", "node"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "strict": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**`tsconfig.node.json`:**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

**`index.html`** (a tiny inline SVG favicon — zero assets, matches the hub blog-page pattern; no theme-preload script, no chassis):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{TITLE}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`.gitignore`:**

```
node_modules
dist
dist-ssr
*.local
.DS_Store
```

**`src/main.tsx`:**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`src/vite-env.d.ts`:**

```ts
/// <reference types="vite/client" />
```

**`src/index.css`** (deliberately minimal — no design tokens, no dark mode; that's chassis territory, left to the user):

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}
```

**`src/App.tsx`** (proves the content model loads and renders, nothing more — plain text, no markdown rendering library):

```tsx
import { loadMeta, loadSections } from './lib/essayContent'

function App() {
  const meta = loadMeta()
  const sections = loadSections()

  return (
    <main>
      <p>{meta.eyebrow}</p>
      <h1>{meta.title}</h1>
      <p>{meta.subtitle}</p>
      {sections.map((s) => (
        <section key={s.order}>
          {s.heading && <h2>{s.heading}</h2>}
          <p>{s.body}</p>
        </section>
      ))}
    </main>
  )
}

export default App
```

**Verify:** these are template files, not a runnable project yet (`src/lib/essayContent.ts` doesn't exist until Task 3). No build/test to run here — just confirm every file above exists with `find ~/.claude/skills/blog/templates/repo -type f`.

**Commit:**

```bash
cd ~/.claude/skills/blog
git add templates/repo
git commit -q -m "Add base Vite+React+TS app template"
```

---

### Task 3: Templates — content model

**Files:**
- Create: `~/.claude/skills/blog/templates/repo/src/content/meta.md`
- Create: `~/.claude/skills/blog/templates/repo/src/content/sections/01-intro.md`
- Create: `~/.claude/skills/blog/templates/repo/src/lib/essayContent.ts`
- Create: `~/.claude/skills/blog/templates/repo/src/lib/essayContent.test.ts`

`essayContent.ts` and `essayContent.test.ts` are copied **verbatim** from the watershed repo (`/Users/ugurkoc/repos/markov-transitions/src/lib/`) — that loader is already generic (order/id/label/heading/body; nothing watershed-specific), and its test suite encodes real, hard-won failure modes (unquoted CMS dates, empty-order sorting, raw HTML silently dropped by markdown renderers, quote-escaping edge cases). Do not paraphrase — copy exactly, then diff to prove byte-identity.

**`src/content/meta.md`:**

```markdown
---
eyebrow: TODO — a short kicker line
title: {{TITLE}}
---

TODO — write a one-paragraph subtitle here. Keep it a single paragraph (no
blank lines) — both the CMS and CI guard that.
```

**`src/content/sections/01-intro.md`:**

```markdown
---
order: 1
---

TODO — write your opening section here. Every section needs at least
`order`; add `id` and `label` too if it should get its own sidebar entry
and anchor link once you build the real layout.
```

CAUTION — content-vs-test consistency: the copied `essayContent.test.ts` requires section bodies >40 chars, a meta subtitle >40 chars with no blank line, no raw HTML, no ATX headings. The two placeholder files above satisfy all of these — if you reword them, KEEP them satisfying the tests (that's verified end-to-end in Task 7's dry run and Task 9).

**Step: copy and verify**

```bash
mkdir -p ~/.claude/skills/blog/templates/repo/src/lib
cp /Users/ugurkoc/repos/markov-transitions/src/lib/essayContent.ts \
   ~/.claude/skills/blog/templates/repo/src/lib/essayContent.ts
cp /Users/ugurkoc/repos/markov-transitions/src/lib/essayContent.test.ts \
   ~/.claude/skills/blog/templates/repo/src/lib/essayContent.test.ts
diff /Users/ugurkoc/repos/markov-transitions/src/lib/essayContent.ts \
     ~/.claude/skills/blog/templates/repo/src/lib/essayContent.ts && echo identical-1
diff /Users/ugurkoc/repos/markov-transitions/src/lib/essayContent.test.ts \
     ~/.claude/skills/blog/templates/repo/src/lib/essayContent.test.ts && echo identical-2
```

Expected: `identical-1`, `identical-2`.

**Commit:**

```bash
cd ~/.claude/skills/blog
git add templates/repo/src/content templates/repo/src/lib
git commit -q -m "Add the generic content model template"
```

---

### Task 4: Template — `CLAUDE.md`

**Files:**
- Create: `~/.claude/skills/blog/templates/repo/CLAUDE.md`

**Full content:**

```markdown
# {{SLUG}}

This is an interactive essay for [ugurkc.github.io](https://ugurkc.github.io/),
deployed to `https://ugurkc.github.io/{{SLUG}}/` on every push to `main`.

## What's here vs. what's not

The infrastructure is fully wired: GitHub Pages deploy, a content model, and a
browser CMS. The actual interactive tool and the real essay prose are **not**
built yet — that's the next piece of work. `src/App.tsx` currently just proves
the content model loads; replace it with the real essay layout + interactive
component once you know what this essay is about. The watershed repo
(github.com/ugurkc/watershed) is the reference implementation: theme toggle,
sidebar derived from section frontmatter, react-markdown rendering (memoized —
prose must not re-parse on animation frames), sticky tool aside.

## Content model

- `src/content/meta.md` — the essay header: `eyebrow` + `title` frontmatter,
  and a body that's the subtitle (must stay a single paragraph — CI guards
  this).
- `src/content/sections/*.md` — one file per prose section. Frontmatter:
  `order` (drives sequence, required), optional `id` (anchor for deep links),
  optional `label` (gives the section a sidebar entry — requires `id`),
  optional `heading`.
- Loaded and validated by `src/lib/essayContent.ts` / `essayContent.test.ts`
  — read that test file before changing the content shape; it encodes real
  failure modes hit while building the first essay (unquoted CMS dates,
  empty-order sorting bugs, raw HTML silently dropped by markdown renderers).
- Editable in the browser at `https://ugurkc.github.io/{{SLUG}}/admin/`
  (Sveltia CMS, vendored in `public/admin/`), or by hand — same files either
  way.

## Testing conventions

- Every CMS-editable surface (content shape, admin config) has a guard test.
  If you change what the CMS can write, update the matching test — don't
  just add the field.
- `npm run test` must reflect real coverage; never reintroduce
  `--passWithNoTests` once tests exist — it lets test-discovery regressions
  pass CI silently (a mistake made and fixed elsewhere in this system).
- The deploy workflow (`.github/workflows/deploy.yml`) runs the full suite
  before build, before deploy. A failing edit — from the CMS or from code —
  never reaches production; the live site stays on the last good version.
  Don't weaken this gate.

## Commit convention

No `Co-Authored-By` or "Generated with Claude Code" trailers on commits.

## Wider system

This essay is one of several under
[ugurkc.github.io](https://github.com/ugurkc/ugurkc.github.io) — see that
repo's README for the full personal-site recipe (publishing, the hub's own
CMS, the fine-grained PAT setup, adding this repo to the token's scope).
```

**Commit:**

```bash
cd ~/.claude/skills/blog
git add templates/repo/CLAUDE.md
git commit -q -m "Add the CLAUDE.md template"
```

---

### Task 5: Templates — deploy workflow + lint config

**Files:**
- Create: `~/.claude/skills/blog/templates/repo/.github/workflows/deploy.yml`
- Create: `~/.claude/skills/blog/templates/repo/.oxlintrc.json`

Both copied verbatim from watershed — no placeholders (the workflow doesn't reference the repo name; the base path lives in `vite.config.ts`, already templated).

**Step: copy and verify**

```bash
mkdir -p ~/.claude/skills/blog/templates/repo/.github/workflows
cp /Users/ugurkoc/repos/markov-transitions/.github/workflows/deploy.yml \
   ~/.claude/skills/blog/templates/repo/.github/workflows/deploy.yml
cp /Users/ugurkoc/repos/markov-transitions/.oxlintrc.json \
   ~/.claude/skills/blog/templates/repo/.oxlintrc.json
diff /Users/ugurkoc/repos/markov-transitions/.github/workflows/deploy.yml \
     ~/.claude/skills/blog/templates/repo/.github/workflows/deploy.yml && echo identical-1
diff /Users/ugurkoc/repos/markov-transitions/.oxlintrc.json \
     ~/.claude/skills/blog/templates/repo/.oxlintrc.json && echo identical-2
python3 -c "import yaml; yaml.safe_load(open('$HOME/.claude/skills/blog/templates/repo/.github/workflows/deploy.yml')); print('valid')"
```

Expected: `identical-1`, `identical-2`, `valid`. (This picks up the hardened workflow: current action majors, `cancel-in-progress: false`, test-before-build.)

**Commit:**

```bash
cd ~/.claude/skills/blog
git add templates/repo/.github templates/repo/.oxlintrc.json
git commit -q -m "Add the deploy workflow and lint config templates"
```

---

### Task 6: Templates — Sveltia admin

**Files:**
- Create: `~/.claude/skills/blog/templates/repo/public/admin/index.html`
- Create: `~/.claude/skills/blog/templates/repo/public/admin/config.yml`
- Create: `~/.claude/skills/blog/templates/repo/src/lib/adminConfig.test.ts`

`public/admin/sveltia-cms.js` is deliberately **not** a template file — `scaffold.sh` vendors it fresh from `node_modules` at run time (Task 7), so a version bump only ever touches the pinned version string in `package.json`, never a 2.4MB blob in the skill's git history.

**`public/admin/index.html`** — copy verbatim from `/Users/ugurkoc/repos/markov-transitions/public/admin/index.html` (IIFE script tag without `type="module"`, noindex meta, version-pin comment). Verify with `diff` → identical.

**`public/admin/config.yml`** — start from `/Users/ugurkoc/repos/markov-transitions/public/admin/config.yml` and replace the repo-specific values with placeholders: `repo: {{REPO}}`, the two `/watershed/` occurrences (comment + `public_folder`) become `/{{SLUG}}/`, and the comment's site path likewise. Everything else — `auth_methods: [token]`, `output.yaml.quote: double`, `slug: {encoding: ascii, clean_accents: true}`, the sections + meta collections with their field definitions and rationale comments — stays byte-identical to watershed's.

**`src/lib/adminConfig.test.ts`** — start from `/Users/ugurkoc/repos/markov-transitions/src/lib/adminConfig.test.ts` and replace exactly two repo-specific literals with placeholders: `repo: 'ugurkc/watershed'` → `repo: '{{REPO}}'`, and the `public_folder` assertion's `'/watershed/'` → `'/{{SLUG}}/'` (plus its comment). All eight guards keep their exact logic: backend target, path existence, sections/meta field-name matches, yaml-quote, ascii slug, base-path prefix, vendored-bundle byte-identity.

**Verify placeholders are exact and nothing else leaked:**

```bash
grep -o '{{[A-Z]*}}' ~/.claude/skills/blog/templates/repo/public/admin/config.yml \
  ~/.claude/skills/blog/templates/repo/src/lib/adminConfig.test.ts | sort -u
# Expected output: exactly two token types across the files — {{REPO}} and {{SLUG}}
grep -rn 'watershed' ~/.claude/skills/blog/templates/repo/ && echo "LEAK — fix before committing" || echo clean
```

Expected: `clean` (no watershed literal anywhere in the templates; CLAUDE.md's reference-implementation mention from Task 4 is the one allowed exception — if that trips the grep, scope the check to exclude CLAUDE.md and confirm the rest is clean).

**Commit:**

```bash
cd ~/.claude/skills/blog
git add templates/repo/public/admin templates/repo/src/lib/adminConfig.test.ts
git commit -q -m "Add the Sveltia admin templates"
```

---

### Task 7: `scaffold.sh` — the orchestration script

**Files:**
- Create: `~/.claude/skills/blog/scaffold.sh` (executable)

**Full content:**

```bash
#!/usr/bin/env bash
set -euo pipefail

GH_OWNER="ugurkc"
REPOS_ROOT="$HOME/repos"
HUB_DIR="$REPOS_ROOT/ugurkc.github.io"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SKILL_DIR/templates/repo"

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: scaffold.sh <slug>" >&2
  exit 1
fi
if [[ ! "$SLUG" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "ERROR: invalid slug '$SLUG' (must match ^[a-z][a-z0-9-]*\$)" >&2
  exit 1
fi

REPO="$GH_OWNER/$SLUG"
DEST="$REPOS_ROOT/$SLUG"
TITLE=$(echo "$SLUG" | sed 's/-/ /g' | awk '{for (i = 1; i <= NF; i++) $i = toupper(substr($i, 1, 1)) substr($i, 2)} 1')

echo "== Checking availability =="
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "ERROR: $REPO already exists on GitHub." >&2
  exit 1
fi
if [[ -e "$DEST" ]]; then
  echo "ERROR: $DEST already exists locally." >&2
  exit 1
fi
if [[ ! -d "$HUB_DIR" ]]; then
  echo "ERROR: hub repo not found at $HUB_DIR." >&2
  exit 1
fi

echo "== Scaffolding $DEST from templates =="
mkdir -p "$DEST"
cp -R "$TEMPLATES_DIR/." "$DEST/"
find "$DEST" -type f -exec sed -i '' \
  -e "s/{{SLUG}}/$SLUG/g" \
  -e "s#{{REPO}}#$REPO#g" \
  -e "s/{{TITLE}}/$TITLE/g" \
  {} +

echo "== Installing dependencies =="
cd "$DEST"
npm install

echo "== Vendoring the Sveltia CMS bundle =="
BUNDLE_SRC="node_modules/@sveltia/cms/dist/sveltia-cms.js"
if [[ ! -f "$BUNDLE_SRC" ]]; then
  echo "ERROR: $BUNDLE_SRC not found after npm install." >&2
  exit 1
fi
cp "$BUNDLE_SRC" public/admin/sveltia-cms.js

echo "== Verifying the scaffold tests and builds clean =="
npm run test
npm run build

echo "== git init + first commit =="
git init -q -b main
git add -A
git commit -q -m "Scaffold $SLUG: Pages deploy, Sveltia admin, content model"

echo "== Creating the GitHub repo and pushing =="
gh repo create "$REPO" --public --source . --push \
  --description "Interactive essay (scaffolded, not yet written)"

echo "== Enabling GitHub Pages (Actions source) =="
if ! gh api "repos/$REPO/pages" -X POST -f build_type=workflow >/dev/null 2>&1; then
  gh api "repos/$REPO/pages" -X PUT -f build_type=workflow >/dev/null
fi

echo "== Watching the first deploy =="
sleep 5
RUN_ID=$(gh run list --repo "$REPO" --limit 1 --json databaseId --jq '.[0].databaseId')
if ! gh run watch --repo "$REPO" --exit-status "$RUN_ID"; then
  BUILD_CONCLUSION=$(gh run view --repo "$REPO" "$RUN_ID" --json jobs \
    --jq '.jobs[] | select(.name=="build") | .conclusion')
  if [[ "$BUILD_CONCLUSION" == "success" ]]; then
    echo "Build succeeded; deploy likely raced Pages enablement — rerunning failed jobs."
    gh run rerun --repo "$REPO" "$RUN_ID" --failed
    gh run watch --repo "$REPO" --exit-status "$RUN_ID"
  else
    echo "ERROR: the build job failed. Log:" >&2
    gh run view --repo "$REPO" "$RUN_ID" --log-failed >&2
    exit 1
  fi
fi

echo "== Updating the hub repo =="
cd "$HUB_DIR"
git pull -q
TODAY=$(date -u +%Y-%m-%d)
cat >> src/data/publishings.yaml <<EOF
- title: $TITLE
  description: TODO — one or two sentences describing this essay.
  date: "$TODAY"
  url: /$SLUG/
EOF
echo "Disallow: /$SLUG/admin/" >> public/robots.txt
npm run test
git add src/data/publishings.yaml public/robots.txt
git commit -q -m "Add $SLUG to publishings and robots.txt"
git push -q

sleep 5
HUB_RUN_ID=$(gh run list --repo "$GH_OWNER/ugurkc.github.io" --limit 1 \
  --json databaseId --jq '.[0].databaseId')
gh run watch --repo "$GH_OWNER/ugurkc.github.io" --exit-status "$HUB_RUN_ID"

echo "== Done =="
echo "Local:  $DEST"
echo "Repo:   https://github.com/$REPO"
echo "Live:   https://ugurkc.github.io/$SLUG/"
echo "Admin:  https://ugurkc.github.io/$SLUG/admin/"
```

Notes for the implementer: `sed -i ''` is the macOS (BSD) in-place form — this skill targets this Mac only. The hub-side `npm run test` before commit means a malformed generated publishings entry can never even be committed, let alone deployed.

**Step: make executable, syntax-check**

```bash
chmod +x ~/.claude/skills/blog/scaffold.sh
bash -n ~/.claude/skills/blog/scaffold.sh && echo syntax-ok
```

**Step: argument-validation smoke tests (no side effects — these fail before touching disk or network)**

```bash
~/.claude/skills/blog/scaffold.sh 2>&1 | tail -1
# Expected: "Usage: scaffold.sh <slug>"
~/.claude/skills/blog/scaffold.sh "Bad Slug!" 2>&1 | tail -1
# Expected: ERROR: invalid slug ...
~/.claude/skills/blog/scaffold.sh watershed 2>&1 | tail -1
# Expected: ERROR: ugurkc/watershed already exists on GitHub.
```

All three exit non-zero before any file is written.

**Step: local-only dry run of the template substitution** (everything up to but NOT including repo creation): temporarily copy templates + substitute for a scratch slug into the scratchpad (replicate the script's `cp -R` + `sed` block by hand with `DEST=<scratchpad>/dryrun-essay`, `SLUG=dryrun-essay`), then `npm install && npm run test && npm run build` there. Expected: 20 tests pass (12 essayContent + 8 adminConfig — the adminConfig bundle-identity test passes because `node_modules` exists and the vendor `cp` step is replicated too), build green. Then delete the scratch dir. This proves templates+substitution produce a working repo without touching GitHub.

**Commit:**

```bash
cd ~/.claude/skills/blog
git add scaffold.sh
git commit -q -m "Add the scaffold.sh orchestration script"
```

---

### Task 8: `SKILL.md` — full instructions

**Files:**
- Modify: `~/.claude/skills/blog/SKILL.md` (replace the Task 1 skeleton)

**Full content:**

```markdown
---
name: blog
description: Scaffold a new interactive essay's infrastructure (GitHub repo, GitHub Pages, deploy workflow, Sveltia CMS admin, minimal content model) for ugurkc.github.io. Use when the user wants to start a new interactive essay, invokes "/blog <slug>", or asks to set up a new essay repo.
user_invocable: true
---

# blog

Scaffolds a new interactive essay's infrastructure. Does **not** scaffold
any visual or interactive shell (no theme toggle, no sidebar, no layout,
no component) — that's per-essay creative work, done afterward in a normal
session. This skill only wires up: a GitHub repo, Pages, the deploy
workflow, the Sveltia CMS admin, and a minimal generic content model.

## Usage

The user provides a slug: `/blog <slug>` (e.g. `/blog cohort-decay`). The
slug becomes the repo name (`ugurkc/<slug>`) and the URL path
(`ugurkc.github.io/<slug>/`). If no slug was given, ask for one before
continuing — lowercase-with-dashes.

## Step 1: Show the plan, get confirmation

Before running anything, tell the user exactly what's about to happen:

- New **public** GitHub repo: `ugurkc/<slug>`
- Local clone: `~/repos/<slug>`
- Live URL once deployed: `https://ugurkc.github.io/<slug>/`
- Admin URL: `https://ugurkc.github.io/<slug>/admin/`
- Scaffolded: bare Vite+React+TS app, minimal content model (one
  placeholder section), deploy workflow, Sveltia CMS admin, `CLAUDE.md`
- NOT scaffolded: any visual design, theme, layout, or the interactive
  component itself — that's the next session's work
- It also adds one entry to the hub repo's `publishings.yaml` and one line
  to its `robots.txt`, then pushes — **this modifies the live personal
  site**: a new card appears on the homepage with a TODO description until
  edited

Wait for the user to confirm in chat before running anything. The `/blog`
invocation itself is not sufficient confirmation — the plan above is what
they're confirming (it catches slug typos before anything becomes public).

## Step 2: Run the script

Once confirmed:

```bash
~/.claude/skills/blog/scaffold.sh <slug>
```

One script does everything: templates → substitution → npm install →
vendor the Sveltia bundle → run the full test suite and build as a local
gate → git init + commit → create the GitHub repo + push → enable Pages
(handles the "deploy job raced Pages enablement" case by rerunning failed
jobs once) → watch the first deploy → add the essay to the hub's
publishings + robots.txt → push and watch the hub deploy.

Takes a few minutes — mostly npm install and two Actions runs. Run it in
the foreground with a generous timeout and let it finish.

## If it fails

The script is `set -euo pipefail` — it stops at the first failure inside a
clearly-labeled stage. Report the exact error and stage to the user, plus
what state exists (was the GitHub repo created? pushed? was the hub
modified?). Do not improvise recovery — if the repo was created but a
later step failed, `gh repo delete ugurkc/<slug> --yes` is the clean
rollback, but only run it if the user explicitly asks.

## When it succeeds

Relay the four URLs the script prints. Then walk the user through the two
things that cannot be automated:

1. **Add `<slug>` to the fine-grained PAT's repository list** — GitHub →
   Settings → Developer settings → Fine-grained tokens → edit → add the
   repo. Without this the new essay's `/admin/` cannot sign in (there is
   no GitHub API for this; it's browser-only).
2. **Build the actual essay** — the interactive component and real prose.
   The scaffolded repo's `CLAUDE.md` briefs whichever session picks that
   up; the watershed repo is the reference implementation. Offer to start
   on it.

Also mention: the new homepage card's description reads "TODO — one or two
sentences describing this essay" and the title is the title-cased slug —
both editable via the hub's `/admin/` or `src/data/publishings.yaml`.
```

**Verify:** re-read the file after writing; confirm the frontmatter block is intact (starts `---`, has `name: blog`, `user_invocable: true`) and the heredoc didn't swallow the inner code fences.

**Commit:**

```bash
cd ~/.claude/skills/blog
git add SKILL.md
git commit -q -m "Write the full SKILL.md instructions"
```

---

### Task 9: End-to-end real test (requires explicit user go-ahead first)

**This task creates a real public GitHub repo and modifies the live hub site.** Immediately before running it, tell the user: a throwaway repo `ugurkc/blog-skill-smoke-test` will be created, the live homepage will briefly show a TODO card for it, and both will be fully cleaned up afterward. Get an explicit yes in chat — this needs per-action confirmation regardless of the plan being approved.

**Step 1: Run the real scaffold**

```bash
~/.claude/skills/blog/scaffold.sh blog-skill-smoke-test
```

Expected: completes with the four-URL summary. If the Pages race triggers, confirm the rerun-failed fallback recovers it naturally.

**Step 2: Verify live**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://ugurkc.github.io/blog-skill-smoke-test/
curl -s -o /dev/null -w "%{http_code}\n" https://ugurkc.github.io/blog-skill-smoke-test/admin/
curl -s https://ugurkc.github.io/ | grep -c 'blog-skill-smoke-test'
curl -s https://ugurkc.github.io/robots.txt | grep 'blog-skill-smoke-test'
```

Expected: `200`, `200`, `1`, `Disallow: /blog-skill-smoke-test/admin/`. Browser check: the scaffolded page renders the placeholder content; `/blog-skill-smoke-test/admin/` shows ONLY "Sign In Using Access Token" (the `auth_methods: [token]` template took effect).

**Step 3: Confirm the scaffolded repo's CI is real, not vacuous**

The first Actions run already passed (Step 1 watched it) — additionally verify the suite locally in the scaffold at `~/repos/blog-skill-smoke-test`: `npm run test` → 20 tests (12 essayContent + 8 adminConfig), `npm run lint` clean.

**Step 4: Clean up — leave no trace on the live site**

```bash
gh repo delete ugurkc/blog-skill-smoke-test --yes
rm -rf ~/repos/blog-skill-smoke-test

cd ~/repos/ugurkc.github.io
git revert --no-edit HEAD   # reverts "Add blog-skill-smoke-test to publishings and robots.txt"
git push
```

Verify after the hub redeploys (~1–2 min): homepage grep for `blog-skill-smoke-test` → 0; `gh repo view ugurkc/blog-skill-smoke-test` → not found. Note: `gh repo delete` may require the `delete_repo` scope — if it errors, tell the user to delete it from the GitHub UI (Settings → Danger Zone) rather than escalating token scopes.

**No commit for this task** unless Steps 1–3 surface a bug in the skill — then fix, commit in the skill repo, and re-run Task 9 with a fresh throwaway slug.

---

### Done criteria

- `/blog <slug>` from a fresh session in any directory produces a live, deployed, CMS-equipped, CI-tested essay repo after one confirmation.
- The scaffolded repo's own suite (20 tests) passes on its first CI run — templates are internally consistent, not just individually well-formed.
- The only live-site side effect per invocation is the documented publishings + robots update.
- `~/.claude/skills/blog` has local git history tracking the skill's evolution.
