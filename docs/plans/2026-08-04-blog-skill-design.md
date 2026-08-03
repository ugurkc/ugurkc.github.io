# `/blog` Claude Code skill — Design

**Date:** 2026-08-04
**Status:** Approved

## Goal

A user-level Claude Code skill, invoked as `/blog <slug>` from any session, that automates
the infrastructure setup currently done by hand for every new interactive essay: GitHub
repo, Pages, deploy workflow, and the Sveltia CMS admin + a minimal content model. It does
**not** scaffold the essay's visual/interactive shell — that stays a per-essay creative
decision made afterward.

## Where it lives

`~/.claude/skills/blog/SKILL.md` (user-level, not project-scoped) — matches the existing
`peon-ping-*` skills' format (`name`/`description`/`user_invocable` frontmatter). User-level
because `/blog` must work from a fresh session regardless of the current working directory.

## Invocation

`/blog <slug>` — slug is the repo name and the URL path (`ugurkc.github.io/<slug>/`),
lowercase-with-dashes. If omitted, the skill asks for it before doing anything else.

## What it does, in order

1. **Validate** the slug (`^[a-z][a-z0-9-]*$`); compute the local path `~/repos/<slug>`;
   check the repo name isn't already taken (`gh repo view ugurkc/<slug>` should 404).
2. **Print the plan** — repo name, local path, the full step list below — and ask for
   confirmation before any GitHub-visible action.
3. **Scaffold a bare Vite + React + TS app**: `npm create vite@latest . -- --template
   react-ts`, `npm install`. No styling, no components — just something that builds.
4. **Wire the build**: set `base: '/<slug>/'` in `vite.config.ts`; add `vitest` + a `test`
   script (the deploy workflow requires one — mirrors the `--passWithNoTests` → real-suite
   lesson learned on the hub/watershed repos, starting with a real test from day one).
5. **Minimal generic content model**: `src/content/meta.md` (placeholder eyebrow/title/
   subtitle) + `src/content/sections/01-intro.md` (one placeholder section) + the same
   tested `essayContent.ts` loader pattern used in watershed (generic: order/id/label/
   heading/body — not watershed-specific), with its guard test suite.
5.5. **Write `CLAUDE.md`** (templated) covering: what this repo is and where it deploys;
   the content model and how it's CMS-edited; this project's testing conventions (guard
   tests for CMS-editable surfaces, full suite gates every deploy); the commit convention
   (no `Co-Authored-By`/"Generated with Claude Code" trailers); what's *not* built yet
   (the interactive component and real prose); a pointer to the hub repo's README recipe
   for the wider system.
6. **Copy the deploy workflow** (test → build → deploy-pages, current action majors,
   `cancel-in-progress: false` — the hardened version, not the original).
7. **Sveltia admin**: `npm install -D @sveltia/cms@<pinned-version>` (same exact pin as the
   hub/watershed repos), vendor `node_modules/@sveltia/cms/dist/sveltia-cms.js` into
   `public/admin/`, write `config.yml` (backend → this repo, `auth_methods: [token]`,
   `output.yaml.quote: double`, `slug: {encoding: ascii, clean_accents: true}`,
   `public_folder: /<slug>/uploads`, sections + meta collections), and the
   `adminConfig.test.ts` guard suite (same shape as the two existing repos: backend
   target, path existence, field-name match, yaml-quote guard, slug guard, bundle
   byte-identity, public_folder base-path prefix).
8. **Git + GitHub**: `git init`, initial commit, `gh repo create ugurkc/<slug> --public
   --push`, enable Pages (`gh api repos/ugurkc/<slug>/pages -X POST -f
   build_type=workflow`), watch the first deploy run to completion.
9. **Hub repo housekeeping**: add one entry to `publishings.yaml`, add
   `Disallow: /<slug>/admin/` to `robots.txt`, commit, push, watch that deploy too.
10. **Final checklist**, printed to the user — the things that cannot be automated:
    - Add `<slug>` to the fine-grained PAT's repository access list (Settings →
      Developer settings → Fine-grained tokens → edit) — no GitHub API for this.
    - Build the actual interactive component and write the real prose (next session).

## Templates

Step 3–9's file contents (deploy.yml, config.yml, essayContent.ts, package.json fields,
CLAUDE.md) are embedded as static templates inside the skill directory
(`~/.claude/skills/blog/templates/`) with `{{SLUG}}`/`{{REPO}}` placeholders substituted at
run time — not fetched live from watershed/hub, since we already know these are correct
from this session's work, and static templates don't depend on those repos' state staying
unchanged. The Sveltia bundle itself is **not** vendored statically inside the skill (a
2.4MB binary doesn't belong in skill source) — it's installed fresh and copied from
`node_modules` each run, same as the manual process, so a version bump only touches one
pinned version string.

## Safety / failure handling

Every step either checks its own precondition before running (idempotent-safe to re-invoke)
or stops immediately and reports exactly what succeeded vs. what didn't — no silent partial
state. Real, hard-to-reverse actions (repo creation, push, Pages enablement) only happen
after the Step 2 confirmation. No destructive actions (repo deletion, force-push) are ever
part of this skill.

## Out of scope (YAGNI)

- Any visual/component/theme scaffolding — per-essay creative work, done afterward.
- Automating the PAT repository-list edit — no GitHub API surface for it.
- Rollback/cleanup tooling for a partially-created repo — manual `gh repo delete` if a
  throwaway test run needs cleanup.
- Multi-slug/batch creation, dry-run mode.
