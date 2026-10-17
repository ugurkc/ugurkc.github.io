# Fretboard Mastery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a guide-only practice app at `ugurkc.github.io/fretboard-mastery/` that walks a
guitarist through the six-step fretboard-notes method with a metronome, a per-beat cue, a
toggleable note chart and progress saved in the browser.

**Architecture:** A standalone Vite + React + TypeScript app in a new repo
`ugurkc/fretboard-mastery`, deployed by GitHub Actions to Pages. All method logic (note/fret
maths, beat sequences, progress rules, storage) lives in framework-free modules under
`src/lib/` with Vitest suites; React components under `src/components/` only render state
and dispatch events. The metronome uses a Web Audio lookahead scheduler.

**Tech Stack:** Vite 8, React 19, TypeScript 6, Vitest 4, oxlint, GitHub Pages.

**Spec:** `docs/plans/2026-10-17-fretboard-design.md` in the hub repo
(`~/repos/ugurkc.github.io`). Read it first.

**Conventions for the new repo:**
- Commits carry **no** `Co-Authored-By` or "Generated with Claude Code" trailers (the
  `CLAUDE.md` written in Task 1 says so; it follows the other essay repos).
- Strict TS: `verbatimModuleSyntax` (use `import type` for types), `erasableSyntaxOnly` (no
  enums, no constructor parameter properties), `noUnusedLocals/Parameters`.
- Vitest runs in the `node` environment and only picks up `src/**/*.test.ts` — pure logic
  only, no component tests. UI is verified by hand in Task 10.
- `npm run build` runs `tsc -b` over all of `src/`, **including test files** — a type
  error in a test breaks the build even when Vitest passes.

**Outward-facing steps need the user's go-ahead in chat:** creating the public GitHub repo
(Task 11) and pushing the hub repo (Task 12). Everything before Task 11 is local.

---

### Task 1: Scaffold the repo locally

**Files:**
- Create: `~/repos/fretboard-mastery/` with `package.json`, `vite.config.ts`, `index.html`,
  `.gitignore`, `.oxlintrc.json`, `CLAUDE.md`, `src/App.tsx`, plus template copies of
  `tsconfig*.json`, `.github/workflows/deploy.yml`, `src/main.tsx`, `src/vite-env.d.ts`,
  `src/index.css`

**Step 1: Check the name is free and copy the template files that need no changes**

```bash
gh repo view ugurkc/fretboard-mastery >/dev/null 2>&1 && echo "TAKEN" || echo "free"
test -e ~/repos/fretboard-mastery && echo "LOCAL DIR EXISTS" || echo "free"
```
Expected: `free` twice. Stop and ask the user otherwise.

```bash
T=~/.claude/skills/blog/templates/repo
mkdir -p ~/repos/fretboard-mastery/.github/workflows ~/repos/fretboard-mastery/src
cd ~/repos/fretboard-mastery
cp "$T/tsconfig.json" "$T/tsconfig.app.json" "$T/tsconfig.node.json" .
cp "$T/.github/workflows/deploy.yml" .github/workflows/
cp "$T/src/main.tsx" "$T/src/vite-env.d.ts" "$T/src/index.css" src/
```

**Step 2: Write the files that differ from the essay template (no CMS, no content model)**

`package.json`:
```json
{
  "name": "fretboard-mastery",
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
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0",
    "vitest": "^4.1.10"
  }
}
```

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fretboard-mastery/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎸</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Learn every note on the guitar fretboard in six steps, five minutes a day." />
    <title>Fretboard Mastery</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`.gitignore`:
```
node_modules
dist
dist-ssr
*.local
.DS_Store
```

`.oxlintrc.json`:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

`src/App.tsx` (placeholder, replaced in Task 9):
```tsx
export default function App() {
  return (
    <main>
      <h1>Fretboard Mastery</h1>
    </main>
  )
}
```

`CLAUDE.md`:
```markdown
# fretboard-mastery

A practice app for learning every note on the guitar fretboard, deployed to
`https://ugurkc.github.io/fretboard-mastery/` on every push to `main`. Part of
[ugurkc.github.io](https://github.com/ugurkc/ugurkc.github.io); the design spec is
`docs/plans/2026-10-17-fretboard-design.md` in that repo.

## Shape

- `src/lib/` — all method logic, framework-free, each module with a Vitest suite:
  `notes.ts` (note names, fret maths for standard tuning and a 12-fret window),
  `sequence.ts` (the beat sequence of every exercise), `progress.ts` (progress state,
  reducer, unlock rules, localStorage load/save), `metronome.ts` (Web Audio lookahead
  scheduler), `format.ts`, `steps.ts` (step copy).
- `src/components/` — React views only; they render state and dispatch `ProgressEvent`s.
- No CMS: there is no editable prose.

## Rules the app must keep (from the method)

- Strings in order, never skipped: up = 6→1, down = 1→6.
- The app never shows which fret to play — the chart is a reference with no highlight.
- Steps unlock in order; a locked step can still be opened after a warning.
- The app does not listen to the guitar. The player reports "clean" after each set.

## Testing conventions

- `npm run test` runs the full suite; CI runs it before every deploy. Never add
  `--passWithNoTests`.
- Logic changes go in `src/lib/` with a test first. UI is checked by hand in the browser
  (`npm run dev`), including phone width.

## Commit convention

No `Co-Authored-By` or "Generated with Claude Code" trailers on commits.
```

**Step 3: Install and build**

```bash
cd ~/repos/fretboard-mastery && npm install && npm run build
```
Expected: install succeeds; build prints `dist/index.html` and an asset bundle, exit 0.
(Do not run `npm run test` yet — Vitest exits 1 when there are no test files.)

**Step 4: Commit**

```bash
cd ~/repos/fretboard-mastery
git init -q -b main
git add -A
git commit -q -m "Scaffold fretboard-mastery: Vite + React + TS, Pages deploy"
```

---

### Task 2: Note and fret maths (`notes.ts`)

**Files:**
- Create: `src/lib/notes.ts`
- Test: `src/lib/notes.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  ACCIDENTALS,
  MAX_WINDOW_START,
  MIN_WINDOW_START,
  NATURALS,
  STRINGS_DOWN,
  WINDOW_SIZE,
  accidentalTip,
  chartLabel,
  clampWindowStart,
  displayName,
  fretFor,
  isNoteName,
  pitchClass,
} from './notes'

const ALL_NOTES = [...NATURALS, ...ACCIDENTALS]

describe('pitchClass', () => {
  it('maps naturals and enharmonic pairs', () => {
    expect(pitchClass('C')).toBe(0)
    expect(pitchClass('A')).toBe(9)
    expect(pitchClass('C#')).toBe(1)
    expect(pitchClass('Db')).toBe(1)
    expect(pitchClass('A#')).toBe(pitchClass('Bb'))
  })
})

describe('fretFor', () => {
  it('finds known positions in frets 1-12', () => {
    expect(fretFor('A', 6, 1)).toBe(5)
    expect(fretFor('E', 6, 1)).toBe(12)
    expect(fretFor('F', 6, 1)).toBe(1)
    expect(fretFor('A', 5, 1)).toBe(12)
    expect(fretFor('C', 2, 1)).toBe(1)
    expect(fretFor('D', 1, 1)).toBe(10)
  })

  it('puts sharps one fret above and flats one fret below their natural', () => {
    expect(fretFor('A#', 6, 1)).toBe(fretFor('A', 6, 1) + 1)
    expect(fretFor('Bb', 6, 1)).toBe(fretFor('B', 6, 1) - 1)
  })

  it('respects a shifted window', () => {
    expect(fretFor('E', 6, 5)).toBe(12)
    expect(fretFor('F', 6, 5)).toBe(13)
  })

  it('places every note exactly once per string inside every window', () => {
    for (let start = MIN_WINDOW_START; start <= MAX_WINDOW_START; start++) {
      for (const string of STRINGS_DOWN) {
        for (const note of ALL_NOTES) {
          const fret = fretFor(note, string, start)
          expect(fret).toBeGreaterThanOrEqual(start)
          expect(fret).toBeLessThan(start + WINDOW_SIZE)
          expect(chartLabel(string, fret)).toContain(displayName(note))
        }
      }
    }
  })
})

describe('chartLabel', () => {
  it('labels naturals plainly and accidentals with both names', () => {
    expect(chartLabel(6, 5)).toBe('A')
    expect(chartLabel(6, 6)).toBe('A♯/B♭')
  })
})

describe('displayName', () => {
  it('uses music symbols', () => {
    expect(displayName('A')).toBe('A')
    expect(displayName('C#')).toBe('C♯')
    expect(displayName('Bb')).toBe('B♭')
  })
})

describe('accidentalTip', () => {
  it('explains sharps and flats relative to the natural', () => {
    expect(accidentalTip('A#')).toBe('Find A, then go up one fret')
    expect(accidentalTip('Bb')).toBe('Find B, then go down one fret')
    expect(accidentalTip('G')).toBeNull()
  })
})

describe('isNoteName', () => {
  it('accepts the 17 practice names and nothing else', () => {
    for (const n of ALL_NOTES) expect(isNoteName(n)).toBe(true)
    expect(isNoteName('H')).toBe(false)
    expect(isNoteName('E#')).toBe(false)
    expect(isNoteName(3)).toBe(false)
  })
})

describe('clampWindowStart', () => {
  it('clamps to 1-10 and rejects non-integers', () => {
    expect(clampWindowStart(5)).toBe(5)
    expect(clampWindowStart(0)).toBe(1)
    expect(clampWindowStart(99)).toBe(10)
    expect(clampWindowStart(2.5)).toBe(1)
    expect(clampWindowStart('3')).toBe(1)
  })
})
```

**Step 2: Run it to make sure it fails**

Run: `npx vitest run src/lib/notes.test.ts`
Expected: FAIL — cannot resolve `./notes`.

**Step 3: Implement**

```ts
export const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export const ACCIDENTALS = ['C#', 'Db', 'D#', 'Eb', 'F#', 'Gb', 'G#', 'Ab', 'A#', 'Bb'] as const

export type Natural = (typeof NATURALS)[number]
export type Accidental = (typeof ACCIDENTALS)[number]
export type NoteName = Natural | Accidental
export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6

/** Low E to high E: the direction the method calls "up". */
export const STRINGS_UP: readonly StringNumber[] = [6, 5, 4, 3, 2, 1]
export const STRINGS_DOWN: readonly StringNumber[] = [1, 2, 3, 4, 5, 6]
export const OPEN_NAMES: Record<StringNumber, string> = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' }

export const WINDOW_SIZE = 12
export const MIN_WINDOW_START = 1
export const MAX_WINDOW_START = 10

const NATURAL_PITCH: Record<Natural, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
// Standard tuning; string 1 is the high E.
const OPEN_PITCH: Record<StringNumber, number> = { 6: 4, 5: 9, 4: 2, 3: 7, 2: 11, 1: 4 }
const PITCH_LABELS = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B']

const ALL_NAMES: readonly string[] = [...NATURALS, ...ACCIDENTALS]

export function isNoteName(value: unknown): value is NoteName {
  return typeof value === 'string' && ALL_NAMES.includes(value)
}

export function isNatural(note: NoteName): note is Natural {
  return note.length === 1
}

export function pitchClass(note: NoteName): number {
  const base = NATURAL_PITCH[note[0] as Natural]
  const shift = note[1] === '#' ? 1 : note[1] === 'b' ? -1 : 0
  return (base + shift + 12) % 12
}

/** The fret where `note` sits on `string` inside the 12-fret window starting at `windowStart`. */
export function fretFor(note: NoteName, string: StringNumber, windowStart: number): number {
  const offset = (((pitchClass(note) - OPEN_PITCH[string] - windowStart) % 12) + 12) % 12
  return windowStart + offset
}

export function chartLabel(string: StringNumber, fret: number): string {
  return PITCH_LABELS[(OPEN_PITCH[string] + fret) % 12]
}

export function displayName(note: NoteName): string {
  return note.replace('#', '♯').replace(/^([A-G])b$/, '$1♭')
}

export function accidentalTip(note: NoteName): string | null {
  if (isNatural(note)) return null
  const direction = note[1] === '#' ? 'up' : 'down'
  return `Find ${note[0]}, then go ${direction} one fret`
}

export function clampWindowStart(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return MIN_WINDOW_START
  return Math.min(MAX_WINDOW_START, Math.max(MIN_WINDOW_START, value))
}
```

**Step 4: Run it to make sure it passes**

Run: `npx vitest run src/lib/notes.test.ts`
Expected: PASS (all tests).

**Step 5: Commit**

```bash
git add src/lib/notes.ts src/lib/notes.test.ts
git commit -q -m "Add note names and fret maths for standard tuning"
```

---

### Task 3: Beat sequences (`sequence.ts`)

**Files:**
- Create: `src/lib/sequence.ts`
- Test: `src/lib/sequence.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { NATURALS } from './notes'
import type { NoteName } from './notes'
import { ROUNDS_PER_SET, randomPair, run, setBeats, shuffled } from './sequence'
import type { Beat } from './sequence'

// Deterministic RNG so shuffle tests are repeatable.
function seeded(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function expectNoSkippedStrings(beats: Beat[]) {
  for (let i = 1; i < beats.length; i++) {
    expect(Math.abs(beats[i].string - beats[i - 1].string)).toBeLessThanOrEqual(1)
  }
}

const strings = (beats: Beat[]) => beats.map((b) => b.string)

describe('run', () => {
  it('goes 6 to 1 when up and 1 to 6 when down', () => {
    expect(strings(run('A', 'up'))).toEqual([6, 5, 4, 3, 2, 1])
    expect(strings(run('A', 'down'))).toEqual([1, 2, 3, 4, 5, 6])
    expect(run('A', 'up').every((b) => b.note === 'A' && b.direction === 'up')).toBe(true)
  })
})

describe('setBeats', () => {
  it('single-note exercises are three rounds of up then down', () => {
    for (const exercise of [1, 2, 3] as const) {
      const beats = setBeats({ exercise, note: 'G' })
      expect(beats).toHaveLength(ROUNDS_PER_SET * 12)
      expect(strings(beats.slice(0, 12))).toEqual([6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6])
      expect(beats.every((b) => b.note === 'G')).toBe(true)
      expectNoSkippedStrings(beats)
    }
  })

  it('pairs play the first note up and the second down, three times', () => {
    const beats = setBeats({ exercise: 4, pair: ['G', 'D'] })
    expect(beats).toHaveLength(ROUNDS_PER_SET * 12)
    expect(beats.slice(0, 6).every((b) => b.note === 'G' && b.direction === 'up')).toBe(true)
    expect(beats.slice(6, 12).every((b) => b.note === 'D' && b.direction === 'down')).toBe(true)
    expectNoSkippedStrings(beats)
  })

  it('the shuffled set alternates direction note by note', () => {
    const order: NoteName[] = ['D', 'F', 'C', 'E', 'A', 'G', 'B']
    const beats = setBeats({ exercise: 5, order })
    expect(beats).toHaveLength(42)
    order.forEach((note, i) => {
      const block = beats.slice(i * 6, i * 6 + 6)
      expect(block.every((b) => b.note === note)).toBe(true)
      expect(block[0].direction).toBe(i % 2 === 0 ? 'up' : 'down')
    })
    expectNoSkippedStrings(beats)
  })
})

describe('shuffled', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [...NATURALS]
    const out = shuffled(input, seeded(1))
    expect(input).toEqual([...NATURALS])
    expect([...out].sort()).toEqual([...NATURALS].sort())
  })

  it('is deterministic for a given rng', () => {
    expect(shuffled(NATURALS, seeded(7))).toEqual(shuffled(NATURALS, seeded(7)))
  })
})

describe('randomPair', () => {
  it('picks two different notes from the pool', () => {
    for (let seed = 0; seed < 50; seed++) {
      const [a, b] = randomPair(NATURALS, seeded(seed))
      expect(a).not.toBe(b)
      expect(NATURALS).toContain(a)
      expect(NATURALS).toContain(b)
    }
  })
})
```

**Step 2: Run it to make sure it fails**

Run: `npx vitest run src/lib/sequence.test.ts`
Expected: FAIL — cannot resolve `./sequence`.

**Step 3: Implement**

```ts
import { STRINGS_DOWN, STRINGS_UP } from './notes'
import type { NoteName, StringNumber } from './notes'

export type Direction = 'up' | 'down'
export type Exercise = 1 | 2 | 3 | 4 | 5

export interface Beat {
  note: NoteName
  string: StringNumber
  direction: Direction
}

export const ROUNDS_PER_SET = 3
export const BEATS_PER_RUN = 6

export type SetConfig =
  | { exercise: 1 | 2 | 3; note: NoteName }
  | { exercise: 4; pair: [NoteName, NoteName] }
  | { exercise: 5; order: readonly NoteName[] }

export function run(note: NoteName, direction: Direction): Beat[] {
  const strings = direction === 'up' ? STRINGS_UP : STRINGS_DOWN
  return strings.map((string) => ({ note, string, direction }))
}

function repeat<T>(items: T[], times: number): T[] {
  return Array.from({ length: times }, () => items).flat()
}

/** Every beat of one practice set, in order. */
export function setBeats(config: SetConfig): Beat[] {
  if (config.exercise === 4) {
    const [first, second] = config.pair
    return repeat([...run(first, 'up'), ...run(second, 'down')], ROUNDS_PER_SET)
  }
  if (config.exercise === 5) {
    return config.order.flatMap((note, i) => run(note, i % 2 === 0 ? 'up' : 'down'))
  }
  return repeat([...run(config.note, 'up'), ...run(config.note, 'down')], ROUNDS_PER_SET)
}

/** Fisher-Yates; returns a new array. */
export function shuffled<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function randomPair(pool: readonly NoteName[], rng: () => number = Math.random): [NoteName, NoteName] {
  const [a, b] = shuffled(pool, rng)
  return [a, b]
}
```

**Step 4: Run it to make sure it passes**

Run: `npx vitest run src/lib/sequence.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/sequence.ts src/lib/sequence.test.ts
git commit -q -m "Add beat sequences for each exercise"
```

---

### Task 4: Progress rules (`progress.ts`)

**Files:**
- Create: `src/lib/progress.ts`
- Test: `src/lib/progress.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { ACCIDENTALS, NATURALS } from './notes'
import type { NoteName } from './notes'
import {
  STEPS,
  STORAGE_KEY,
  TARGET_BPM,
  doneItems,
  freshProgress,
  isStepComplete,
  isUnlocked,
  loadProgress,
  localDateKey,
  recommendedStep,
  reduce,
  saveProgress,
  secondsOn,
  step1Pass,
  stepProgressText,
  suggestNextBpm,
} from './progress'
import type { Progress, ProgressEvent } from './progress'
import type { Exercise } from './sequence'

const apply = (p: Progress, events: ProgressEvent[]) => events.reduce(reduce, p)
const clean = (exercise: Exercise, notes: readonly NoteName[], bpm: number | null): ProgressEvent[] =>
  notes.map((note): ProgressEvent => ({ type: 'cleanSet', exercise, note, bpm }))

const step1Done = (p: Progress) => apply(p, [...clean(1, NATURALS, null), ...clean(1, NATURALS, null)])
const throughStep = (n: number): Progress => {
  let p = freshProgress()
  if (n >= 1) p = step1Done(p)
  if (n >= 2) p = apply(p, clean(2, NATURALS, 40))
  if (n >= 3) p = apply(p, clean(3, ACCIDENTALS, 40))
  if (n >= 4) p = reduce(p, { type: 'markEasy' })
  if (n >= 5) p = reduce(p, { type: 'cleanSet', exercise: 5, bpm: 40 })
  if (n >= 6) p = reduce(p, { type: 'cleanSet', exercise: 5, bpm: TARGET_BPM })
  return p
}

function memoryStore(initial?: string) {
  const data = new Map<string, string>()
  if (initial !== undefined) data.set(STORAGE_KEY, initial)
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

describe('fresh progress', () => {
  it('starts on step 1 with only step 1 unlocked', () => {
    const p = freshProgress()
    expect(p.currentStep).toBe(1)
    expect(isUnlocked(p, 1)).toBe(true)
    expect(isUnlocked(p, 2)).toBe(false)
    expect(recommendedStep(p)).toBe(1)
  })
})

describe('step 1', () => {
  it('fills pass 1, then pass 2, and completes after both', () => {
    let p = apply(freshProgress(), clean(1, NATURALS, null))
    expect(p.step1.pass1).toHaveLength(7)
    expect(step1Pass(p)).toBe(2)
    expect(doneItems(p, 1)).toEqual([])
    expect(isStepComplete(p, 1)).toBe(false)
    p = apply(p, clean(1, NATURALS, null))
    expect(isStepComplete(p, 1)).toBe(true)
  })

  it('ignores repeats and accidentals', () => {
    const p = apply(freshProgress(), [...clean(1, ['A', 'A'], null), ...clean(1, ['A#'], null)])
    expect(p.step1.pass1).toEqual(['A'])
  })
})

describe('steps 2 and 3', () => {
  it('step 2 counts naturals only at 40 BPM or faster', () => {
    const p = apply(freshProgress(), [...clean(2, ['A'], 36), ...clean(2, ['B'], 40), ...clean(2, ['C#'], 40)])
    expect(p.step2).toEqual(['B'])
  })

  it('step 3 counts accidentals only and completes at ten', () => {
    let p = apply(freshProgress(), clean(3, ['A', 'A#'], 40))
    expect(p.step3).toEqual(['A#'])
    p = apply(p, clean(3, ACCIDENTALS, 40))
    expect(isStepComplete(p, 3)).toBe(true)
  })
})

describe('steps 4 to 6', () => {
  it('step 4 completes when marked easy', () => {
    expect(isStepComplete(reduce(freshProgress(), { type: 'markEasy' }), 4)).toBe(true)
  })

  it('step 5 completes with a clean pass at 40', () => {
    const p = reduce(freshProgress(), { type: 'cleanSet', exercise: 5, bpm: 40 })
    expect(isStepComplete(p, 5)).toBe(true)
  })

  it('step 6 needs step 5 clean at 80', () => {
    let p = reduce(freshProgress(), { type: 'cleanSet', exercise: 5, bpm: 76 })
    expect(isStepComplete(p, 6)).toBe(false)
    p = reduce(p, { type: 'cleanSet', exercise: 5, bpm: 80 })
    expect(isStepComplete(p, 6)).toBe(true)
  })

  it('keeps the best clean tempo per exercise', () => {
    const p = apply(freshProgress(), [
      ...clean(2, ['A'], 60),
      ...clean(2, ['A'], 52),
      { type: 'cleanSet', exercise: 4, bpm: 48 },
    ])
    expect(p.bestBpm[2]).toBe(60)
    expect(p.bestBpm[4]).toBe(48)
    expect(p.bestBpm[3]).toBe(0)
  })
})

describe('unlocking', () => {
  it('unlocks a step only when every earlier step is complete', () => {
    const p = apply(freshProgress(), clean(2, NATURALS, 40)) // step 2 done, step 1 not
    expect(isUnlocked(p, 3)).toBe(false)
    expect(isUnlocked(throughStep(2), 3)).toBe(true)
  })

  it('recommends the first incomplete step, or 6 when all are done', () => {
    expect(recommendedStep(throughStep(2))).toBe(3)
    expect(recommendedStep(throughStep(6))).toBe(6)
    for (const s of STEPS) expect(isStepComplete(throughStep(6), s)).toBe(true)
  })
})

describe('settings and time', () => {
  it('accumulates practice seconds per day and ignores bad values', () => {
    const p = apply(freshProgress(), [
      { type: 'practiced', date: '2026-10-17', seconds: 90 },
      { type: 'practiced', date: '2026-10-17', seconds: 30.4 },
      { type: 'practiced', date: '2026-10-17', seconds: -5 },
      { type: 'practiced', date: '2026-10-17', seconds: Number.NaN },
    ])
    expect(secondsOn(p, '2026-10-17')).toBeCloseTo(120.4)
    expect(secondsOn(p, '2026-10-18')).toBe(0)
  })

  it('clamps the window start and toggles the chart', () => {
    let p = reduce(freshProgress(), { type: 'setWindowStart', windowStart: 42 })
    expect(p.windowStart).toBe(10)
    p = reduce(p, { type: 'toggleChart' })
    expect(p.chartVisible).toBe(true)
  })

  it('reset clears progress but keeps settings', () => {
    let p = apply(throughStep(3), [
      { type: 'setWindowStart', windowStart: 5 },
      { type: 'toggleChart' },
    ])
    p = reduce(p, { type: 'reset' })
    expect(isStepComplete(p, 1)).toBe(false)
    expect(p.windowStart).toBe(5)
    expect(p.chartVisible).toBe(true)
  })
})

describe('helpers', () => {
  it('suggests +4 BPM, capped', () => {
    expect(suggestNextBpm(40)).toBe(44)
    expect(suggestNextBpm(158)).toBe(160)
  })

  it('formats local dates', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })

  it('describes step progress', () => {
    expect(stepProgressText(apply(freshProgress(), clean(1, ['A', 'B'], null)), 1)).toBe('Pass 1: 2/7 notes')
    expect(stepProgressText(throughStep(1), 1)).toBe('Done')
    expect(stepProgressText(freshProgress(), 6)).toBe('Best clean step-5 tempo: none yet (target 80 BPM)')
  })
})

describe('storage', () => {
  it('returns fresh progress when nothing is stored', () => {
    expect(loadProgress(memoryStore())).toEqual(freshProgress())
    expect(loadProgress(null)).toEqual(freshProgress())
  })

  it('round-trips through save and load', () => {
    const store = memoryStore()
    const p = throughStep(3)
    saveProgress(store, p)
    expect(loadProgress(store)).toEqual(p)
  })

  it('falls back to fresh progress on corrupt JSON or an unknown version', () => {
    expect(loadProgress(memoryStore('{not json'))).toEqual(freshProgress())
    expect(loadProgress(memoryStore(JSON.stringify({ ...throughStep(2), version: 2 })))).toEqual(freshProgress())
    expect(loadProgress(memoryStore('null'))).toEqual(freshProgress())
  })

  it('drops invalid entries and repairs bad fields', () => {
    const raw = {
      ...freshProgress(),
      currentStep: 9,
      step2: ['A', 'A', 'H', 'C#', 7],
      bestBpm: { 2: 'fast', 3: -10, 4: 52, 5: 61.6 },
      windowStart: 'x',
      practiceSeconds: { '2026-10-17': 60, nope: 5, '2026-10-16': -1 },
    }
    const p = loadProgress(memoryStore(JSON.stringify(raw)))
    expect(p.currentStep).toBe(1)
    expect(p.step2).toEqual(['A'])
    expect(p.bestBpm).toEqual({ 2: 0, 3: 0, 4: 52, 5: 62 })
    expect(p.windowStart).toBe(1)
    expect(p.practiceSeconds).toEqual({ '2026-10-17': 60 })
  })

  it('never throws when storage itself throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(loadProgress(broken)).toEqual(freshProgress())
    expect(() => saveProgress(broken, freshProgress())).not.toThrow()
  })
})
```

**Step 2: Run it to make sure it fails**

Run: `npx vitest run src/lib/progress.test.ts`
Expected: FAIL — cannot resolve `./progress`.

**Step 3: Implement**

```ts
import { ACCIDENTALS, NATURALS, clampWindowStart } from './notes'
import type { Accidental, Natural, NoteName } from './notes'
import type { Exercise } from './sequence'

export type StepId = 1 | 2 | 3 | 4 | 5 | 6
export type TempoExercise = 2 | 3 | 4 | 5

export const STEPS: readonly StepId[] = [1, 2, 3, 4, 5, 6]
export const BASE_BPM = 40
export const TARGET_BPM = 80
export const MIN_BPM = 40
export const MAX_BPM = 160
export const BPM_STEP = 4
export const STORAGE_KEY = 'fretboard-mastery:v1'

export interface Progress {
  version: 1
  currentStep: StepId
  step1: { pass1: Natural[]; pass2: Natural[] }
  step2: Natural[]
  step3: Accidental[]
  step4Easy: boolean
  step5Clean: boolean
  /** Best tempo with a clean set, per exercise; 0 = none yet. */
  bestBpm: Record<TempoExercise, number>
  windowStart: number
  chartVisible: boolean
  /** Seconds practised, keyed by local date YYYY-MM-DD. */
  practiceSeconds: Record<string, number>
}

export type ProgressEvent =
  | { type: 'cleanSet'; exercise: Exercise; note?: NoteName; bpm: number | null }
  | { type: 'markEasy' }
  | { type: 'practiced'; date: string; seconds: number }
  | { type: 'setStep'; step: StepId }
  | { type: 'setWindowStart'; windowStart: number }
  | { type: 'toggleChart' }
  | { type: 'reset' }

export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function freshProgress(): Progress {
  return {
    version: 1,
    currentStep: 1,
    step1: { pass1: [], pass2: [] },
    step2: [],
    step3: [],
    step4Easy: false,
    step5Clean: false,
    bestBpm: { 2: 0, 3: 0, 4: 0, 5: 0 },
    windowStart: 1,
    chartVisible: false,
    practiceSeconds: {},
  }
}

const isNaturalName = (n: unknown): n is Natural => (NATURALS as readonly unknown[]).includes(n)
const isAccidentalName = (n: unknown): n is Accidental => (ACCIDENTALS as readonly unknown[]).includes(n)

function addUnique<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list : [...list, item]
}

export function step1Pass(p: Progress): 1 | 2 {
  return p.step1.pass1.length < NATURALS.length ? 1 : 2
}

/** Notes already ticked off for the exercise (step 1: the current pass). */
export function doneItems(p: Progress, exercise: 1 | 2 | 3): readonly NoteName[] {
  if (exercise === 1) return step1Pass(p) === 1 ? p.step1.pass1 : p.step1.pass2
  return exercise === 2 ? p.step2 : p.step3
}

function applyCleanSet(p: Progress, e: Extract<ProgressEvent, { type: 'cleanSet' }>): Progress {
  const { exercise, note, bpm } = e
  if (exercise === 1) {
    if (!isNaturalName(note)) return p
    const key = step1Pass(p) === 1 ? 'pass1' : 'pass2'
    return { ...p, step1: { ...p.step1, [key]: addUnique(p.step1[key], note) } }
  }
  if (bpm === null) return p
  const next: Progress = { ...p, bestBpm: { ...p.bestBpm, [exercise]: Math.max(p.bestBpm[exercise], bpm) } }
  if (bpm < BASE_BPM) return next
  if (exercise === 2 && isNaturalName(note)) next.step2 = addUnique(p.step2, note)
  if (exercise === 3 && isAccidentalName(note)) next.step3 = addUnique(p.step3, note)
  if (exercise === 5) next.step5Clean = true
  return next
}

export function reduce(p: Progress, e: ProgressEvent): Progress {
  switch (e.type) {
    case 'cleanSet':
      return applyCleanSet(p, e)
    case 'markEasy':
      return { ...p, step4Easy: true }
    case 'practiced': {
      if (!Number.isFinite(e.seconds) || e.seconds <= 0) return p
      const total = (p.practiceSeconds[e.date] ?? 0) + e.seconds
      return { ...p, practiceSeconds: { ...p.practiceSeconds, [e.date]: total } }
    }
    case 'setStep':
      return { ...p, currentStep: e.step }
    case 'setWindowStart':
      return { ...p, windowStart: clampWindowStart(e.windowStart) }
    case 'toggleChart':
      return { ...p, chartVisible: !p.chartVisible }
    case 'reset':
      return { ...freshProgress(), windowStart: p.windowStart, chartVisible: p.chartVisible }
  }
}

export function isStepComplete(p: Progress, step: StepId): boolean {
  switch (step) {
    case 1:
      return p.step1.pass1.length === NATURALS.length && p.step1.pass2.length === NATURALS.length
    case 2:
      return p.step2.length === NATURALS.length
    case 3:
      return p.step3.length === ACCIDENTALS.length
    case 4:
      return p.step4Easy
    case 5:
      return p.step5Clean
    case 6:
      return p.bestBpm[5] >= TARGET_BPM
  }
}

export function isUnlocked(p: Progress, step: StepId): boolean {
  return STEPS.filter((s) => s < step).every((s) => isStepComplete(p, s))
}

export function recommendedStep(p: Progress): StepId {
  return STEPS.find((s) => !isStepComplete(p, s)) ?? 6
}

export function stepProgressText(p: Progress, step: StepId): string {
  if (step !== 6 && isStepComplete(p, step)) return 'Done'
  switch (step) {
    case 1:
      return `Pass ${step1Pass(p)}: ${doneItems(p, 1).length}/7 notes`
    case 2:
      return `${p.step2.length}/7 notes clean at 40 BPM`
    case 3:
      return `${p.step3.length}/10 sharps and flats clean at 40 BPM`
    case 4:
      return 'Not marked easy yet'
    case 5:
      return 'No clean pass yet'
    case 6: {
      const best = p.bestBpm[5]
      return `Best clean step-5 tempo: ${best ? `${best} BPM` : 'none yet'} (target ${TARGET_BPM} BPM)`
    }
  }
}

export function suggestNextBpm(bpm: number): number {
  return Math.min(MAX_BPM, bpm + BPM_STEP)
}

export function localDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function secondsOn(p: Progress, date: string): number {
  return p.practiceSeconds[date] ?? 0
}

// --- storage -------------------------------------------------------------

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Keeps only allowed values, deduped, in canonical order. */
function pick<T>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return []
  return allowed.filter((a) => value.includes(a))
}

function bpmValue(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : 0
}

function secondsMap(v: unknown): Record<string, number> {
  if (!isRecord(v)) return {}
  const out: Record<string, number> = {}
  for (const [date, secs] of Object.entries(v)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof secs === 'number' && Number.isFinite(secs) && secs >= 0) {
      out[date] = secs
    }
  }
  return out
}

function sanitize(raw: unknown): Progress {
  const base = freshProgress()
  if (!isRecord(raw) || raw.version !== 1) return base
  const step1 = isRecord(raw.step1) ? raw.step1 : {}
  const best = isRecord(raw.bestBpm) ? raw.bestBpm : {}
  return {
    version: 1,
    currentStep: (STEPS as readonly unknown[]).includes(raw.currentStep) ? (raw.currentStep as StepId) : base.currentStep,
    step1: { pass1: pick(step1.pass1, NATURALS), pass2: pick(step1.pass2, NATURALS) },
    step2: pick(raw.step2, NATURALS),
    step3: pick(raw.step3, ACCIDENTALS),
    step4Easy: raw.step4Easy === true,
    step5Clean: raw.step5Clean === true,
    bestBpm: { 2: bpmValue(best[2]), 3: bpmValue(best[3]), 4: bpmValue(best[4]), 5: bpmValue(best[5]) },
    windowStart: clampWindowStart(raw.windowStart),
    chartVisible: raw.chartVisible === true,
    practiceSeconds: secondsMap(raw.practiceSeconds),
  }
}

export function loadProgress(store: KeyValueStore | null): Progress {
  try {
    const raw = store?.getItem(STORAGE_KEY)
    return raw ? sanitize(JSON.parse(raw)) : freshProgress()
  } catch {
    return freshProgress()
  }
}

export function saveProgress(store: KeyValueStore | null, p: Progress): void {
  try {
    store?.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // Storage full or blocked: the app keeps working for this visit.
  }
}

export function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
```

Note: the reducer test for step 1 pass 2 (`clean(1, NATURALS)` twice) relies on
`step1Pass` switching to 2 as soon as pass 1 holds all seven. The step 2 test
`clean(2, ['A'], 36)` checks that sub-40 sets record a best tempo but no tick.

**Step 4: Run it to make sure it passes**

Run: `npx vitest run src/lib/progress.test.ts`
Expected: PASS. If `tsc` complains that `reduce`/`isStepComplete`/`stepProgressText` lack a
final return, the switch is not seen as exhaustive — check that every case of the union is
handled rather than adding a default.

**Step 5: Commit**

```bash
git add src/lib/progress.ts src/lib/progress.test.ts
git commit -q -m "Add progress state, unlock rules and safe storage"
```

---

### Task 5: Formatting and metronome scheduling maths

**Files:**
- Create: `src/lib/format.ts`, `src/lib/metronome.ts` (pure part only for now)
- Test: `src/lib/format.test.ts`, `src/lib/metronome.test.ts`

**Step 1: Write the failing tests**

`src/lib/format.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { formatDuration } from './format'

describe('formatDuration', () => {
  it('shows seconds under a minute and m/ss above', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(45.6)).toBe('45s')
    expect(formatDuration(200)).toBe('3m 20s')
    expect(formatDuration(300)).toBe('5m 00s')
  })
})
```

`src/lib/metronome.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { beatsInWindow } from './metronome'

describe('beatsInWindow', () => {
  it('lists beat times from nextTime up to (not including) the horizon', () => {
    expect(beatsInWindow(1, 2.6, 0.5)).toEqual([1, 1.5, 2, 2.5])
    expect(beatsInWindow(1, 1.25, 0.5)).toEqual([1])
  })

  it('returns nothing when the next beat is past the horizon', () => {
    expect(beatsInWindow(3, 2.9, 0.5)).toEqual([])
  })
})
```

**Step 2: Run them to make sure they fail**

Run: `npx vitest run src/lib/format.test.ts src/lib/metronome.test.ts`
Expected: FAIL — modules not found.

**Step 3: Implement**

`src/lib/format.ts`:
```ts
export function formatDuration(seconds: number): string {
  const total = Math.floor(seconds)
  if (total < 60) return `${total}s`
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`
}
```

`src/lib/metronome.ts` (pure part; the class is added in Task 6):
```ts
/** Beat times in [nextTime, horizon), spaced by secondsPerBeat. */
export function beatsInWindow(nextTime: number, horizon: number, secondsPerBeat: number): number[] {
  const times: number[] = []
  for (let t = nextTime; t < horizon; t += secondsPerBeat) times.push(t)
  return times
}
```

**Step 4: Run them to make sure they pass**

Run: `npm run test`
Expected: PASS — all suites (notes, sequence, progress, format, metronome).

**Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts src/lib/metronome.ts src/lib/metronome.test.ts
git commit -q -m "Add duration formatting and metronome scheduling maths"
```

---

### Task 6: Metronome audio scheduler

**Files:**
- Modify: `src/lib/metronome.ts` (append the class)

Web Audio can't run under Vitest's node environment, so this class is verified by ear in
Task 10. Keep it thin: all timing arithmetic is in `beatsInWindow`.

**Step 1: Append the scheduler**

```ts
const LOOKAHEAD_SECONDS = 0.1
const TICK_MS = 25
const START_DELAY_SECONDS = 0.1

export interface MetronomeRun {
  bpm: number
  /** Clicks before beat 0; their indices are negative (-countIn .. -1). */
  countIn: number
  totalBeats: number
  isAccent: (index: number) => boolean
  /** Called on time with each beat, including count-in beats. */
  onBeat: (index: number) => void
  /** Called one beat after the last beat. */
  onDone: () => void
}

type ClickKind = 'count' | 'beat' | 'accent'

export class Metronome {
  private ctx: AudioContext | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private uiTimers: ReturnType<typeof setTimeout>[] = []

  /** Must be called from a user gesture (click) so the browser allows audio. */
  start(run: MetronomeRun): void {
    this.stop()
    this.ctx ??= new AudioContext()
    const ctx = this.ctx
    void ctx.resume()
    const secondsPerBeat = 60 / run.bpm
    let index = -run.countIn
    let nextTime = ctx.currentTime + START_DELAY_SECONDS

    const tick = () => {
      for (const time of beatsInWindow(nextTime, ctx.currentTime + LOOKAHEAD_SECONDS, secondsPerBeat)) {
        if (index >= run.totalBeats) {
          this.clearScheduler()
          this.at(time, () => {
            this.stop()
            run.onDone()
          })
          return
        }
        const beat = index
        this.click(time, beat < 0 ? 'count' : run.isAccent(beat) ? 'accent' : 'beat')
        this.at(time, () => run.onBeat(beat))
        index += 1
        nextTime = time + secondsPerBeat
      }
    }
    tick()
    this.timer = setInterval(tick, TICK_MS)
  }

  stop(): void {
    this.clearScheduler()
    for (const t of this.uiTimers) clearTimeout(t)
    this.uiTimers = []
  }

  private clearScheduler(): void {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
  }

  /** Runs fn when the audio clock reaches `time`. */
  private at(time: number, fn: () => void): void {
    const ctx = this.ctx
    if (!ctx) return
    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000)
    this.uiTimers.push(setTimeout(fn, delayMs))
  }

  private click(time: number, kind: ClickKind): void {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = kind === 'accent' ? 1500 : kind === 'count' ? 800 : 1000
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.5, time + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.06)
  }
}
```

**Step 2: Type-check and test**

Run: `npm run build && npm run test`
Expected: both exit 0.

**Step 3: Commit**

```bash
git add src/lib/metronome.ts
git commit -q -m "Add Web Audio metronome with lookahead scheduling"
```

---

### Task 7: Step copy and the small display components

**Files:**
- Create: `src/lib/steps.ts`, `src/components/StepTabs.tsx`, `src/components/Cue.tsx`,
  `src/components/StringLadder.tsx`, `src/components/FretChart.tsx`

**Step 1: `src/lib/steps.ts`**

```ts
import type { StepId } from './progress'

export interface StepInfo {
  label: string
  instructions: string
  goal: string
}

export const STEP_INFO: Record<StepId, StepInfo> = {
  1: {
    label: 'One note',
    instructions:
      "Pick a natural note and play it on every string, 6 to 1 and back to 6, at your own pace. Press Space or tap Next for each string. Use the chart if you need it. Don't try to memorise shapes; just play.",
    goal: 'Three clean rounds per note. All seven notes, twice through.',
  },
  2: {
    label: '40 BPM',
    instructions:
      'The same exercise with the metronome at 40 BPM: one note per click. Stay at 40 even if it feels slow. The small time pressure is what makes it stick.',
    goal: 'Three clean rounds at 40 BPM for each natural note.',
  },
  3: {
    label: 'Sharps & flats',
    instructions:
      'Add the sharps and flats at 40 BPM. For a sharp, find the natural note and go up one fret; for a flat, find it and go down one. A♯ and B♭ are separate exercises because you think of them differently.',
    goal: 'Three clean rounds at 40 BPM for each of the ten sharps and flats.',
  },
  4: {
    label: 'Two notes',
    instructions:
      "Two notes at a time: the first going up the strings, the second coming back down. Don't stop when the note changes.",
    goal: 'Practise until it feels easy, then mark the step done.',
  },
  5: {
    label: 'All seven',
    instructions:
      'All seven natural notes in a random order, alternating up and down, without stopping between notes.',
    goal: 'One clean pass at 40 BPM.',
  },
  6: {
    label: 'Speed up',
    instructions:
      'Go back through steps 2 to 5 and raise the tempo a little after each clean set. The app suggests 4 BPM more each time.',
    goal: 'Step 5 clean at 80 BPM. Then you know your fretboard.',
  },
}
```

**Step 2: `src/components/StepTabs.tsx`**

```tsx
import { STEPS, isStepComplete, isUnlocked } from '../lib/progress'
import type { Progress, StepId } from '../lib/progress'
import { STEP_INFO } from '../lib/steps'

interface Props {
  progress: Progress
  onOpen: (step: StepId) => void
}

export function StepTabs({ progress, onOpen }: Props) {
  return (
    <nav className="steps" aria-label="Steps">
      {STEPS.map((step) => {
        const current = step === progress.currentStep
        const done = isStepComplete(progress, step)
        const locked = !isUnlocked(progress, step)
        const classes = ['step', current && 'is-current', done && 'is-done', locked && 'is-locked']
        return (
          <button
            key={step}
            type="button"
            className={classes.filter(Boolean).join(' ')}
            aria-current={current ? 'step' : undefined}
            onClick={() => onOpen(step)}
          >
            <span className="step-num">{done ? '✓' : step}</span>
            <span className="step-label">{STEP_INFO[step].label}</span>
          </button>
        )
      })}
    </nav>
  )
}
```

**Step 3: `src/components/Cue.tsx`**

```tsx
import { accidentalTip, displayName } from '../lib/notes'
import type { Beat } from '../lib/sequence'

interface Props {
  current: Beat | null
  upcoming: Beat | null
  countIn: number | null
}

export function Cue({ current, upcoming, countIn }: Props) {
  if (countIn !== null) {
    return (
      <div className="cue">
        <p className="cue-main">{countIn}</p>
        {upcoming && (
          <p className="cue-next">
            First: {displayName(upcoming.note)} on string {upcoming.string}
          </p>
        )}
      </div>
    )
  }
  if (current === null) {
    return (
      <div className="cue cue-idle">
        <p className="cue-main">{upcoming ? displayName(upcoming.note) : ''}</p>
        {upcoming && <p className="cue-next">Starts on string {upcoming.string}. Press Start when ready.</p>}
      </div>
    )
  }
  const tip = accidentalTip(current.note)
  const noteChanges = upcoming !== null && upcoming.note !== current.note
  return (
    <div className="cue">
      <p className="cue-main">
        {displayName(current.note)}
        <span className="cue-string"> string {current.string}</span>
        <span className="cue-dir" aria-hidden="true">
          {current.direction === 'up' ? ' ↑' : ' ↓'}
        </span>
      </p>
      {tip && <p className="cue-tip">{tip}</p>}
      <p className="cue-next">
        {upcoming === null
          ? 'Last one'
          : `Next: ${noteChanges ? `${displayName(upcoming.note)} on ` : ''}string ${upcoming.string}`}
      </p>
    </div>
  )
}
```

**Step 4: `src/components/StringLadder.tsx`**

```tsx
import { OPEN_NAMES, STRINGS_DOWN } from '../lib/notes'
import type { StringNumber } from '../lib/notes'

export function StringLadder({ active }: { active: StringNumber | null }) {
  return (
    <ol className="ladder" aria-label="Strings, high e at the top">
      {STRINGS_DOWN.map((s) => (
        <li key={s} className={s === active ? 'is-active' : undefined}>
          <span className="ladder-num">{s}</span>
          <span className="ladder-line" />
          <span className="ladder-name">{OPEN_NAMES[s]}</span>
        </li>
      ))}
    </ol>
  )
}
```

**Step 5: `src/components/FretChart.tsx`**

```tsx
import { OPEN_NAMES, STRINGS_DOWN, WINDOW_SIZE, chartLabel } from '../lib/notes'

export function FretChart({ windowStart }: { windowStart: number }) {
  const frets = Array.from({ length: WINDOW_SIZE }, (_, i) => windowStart + i)
  return (
    <div className="chart-scroll">
      <table className="chart">
        <caption>Notes in frets {windowStart}–{windowStart + WINDOW_SIZE - 1}, standard tuning</caption>
        <thead>
          <tr>
            <th scope="col">String</th>
            {frets.map((f) => (
              <th key={f} scope="col">
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STRINGS_DOWN.map((s) => (
            <tr key={s}>
              <th scope="row">
                {s} <span className="muted">{OPEN_NAMES[s]}</span>
              </th>
              {frets.map((f) => {
                const label = chartLabel(s, f)
                return (
                  <td key={f} className={label.length === 1 ? 'nat' : 'acc'}>
                    {label}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Step 6: Type-check**

Run: `npm run build`
Expected: exit 0 (components are unused so far, but they must compile; `noUnusedLocals`
does not flag unused exports).

**Step 7: Commit**

```bash
git add src/lib/steps.ts src/components
git commit -q -m "Add step copy, step tabs, cue, string ladder and note chart"
```

---

### Task 8: The practice screen

**Files:**
- Create: `src/components/PracticeScreen.tsx`

**Step 1: Write the component**

```tsx
import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { ACCIDENTALS, NATURALS, displayName } from '../lib/notes'
import type { NoteName } from '../lib/notes'
import { BEATS_PER_RUN, randomPair, setBeats, shuffled } from '../lib/sequence'
import type { Exercise, SetConfig } from '../lib/sequence'
import {
  BASE_BPM,
  BPM_STEP,
  MAX_BPM,
  MIN_BPM,
  doneItems,
  localDateKey,
  stepProgressText,
  suggestNextBpm,
} from '../lib/progress'
import type { Progress, ProgressEvent, StepId, TempoExercise } from '../lib/progress'
import { STEP_INFO } from '../lib/steps'
import { Metronome } from '../lib/metronome'
import { Cue } from './Cue'
import { StringLadder } from './StringLadder'

const COUNT_IN = 4
const DRILLS: readonly TempoExercise[] = [2, 3, 4, 5]

type Phase = 'idle' | 'running' | 'confirm'

interface Props {
  step: StepId
  progress: Progress
  dispatch: Dispatch<ProgressEvent>
}

export function PracticeScreen({ step, progress, dispatch }: Props) {
  const [drill, setDrill] = useState<TempoExercise>(2)
  const exercise: Exercise = step === 6 ? drill : step
  const [bpm, setBpm] = useState(BASE_BPM)
  const tempo = step === 6 ? bpm : BASE_BPM

  const [chosenNote, setChosenNote] = useState<NoteName | null>(null)
  const [withAccidentals, setWithAccidentals] = useState(false)
  const [pair, setPair] = useState<[NoteName, NoteName]>(() => randomPair(NATURALS))
  const [order, setOrder] = useState<NoteName[]>(() => shuffled(NATURALS))

  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const metronome = useRef<Metronome | null>(null)
  const startedAt = useRef<number | null>(null)
  const nextButton = useRef<HTMLButtonElement>(null)

  const pool: readonly NoteName[] = exercise === 3 ? ACCIDENTALS : NATURALS
  const done: readonly NoteName[] =
    exercise === 1 || exercise === 2 || exercise === 3 ? doneItems(progress, exercise) : []
  const note =
    chosenNote && pool.includes(chosenNote) ? chosenNote : (pool.find((n) => !done.includes(n)) ?? pool[0])
  const pairPool: readonly NoteName[] = withAccidentals ? [...NATURALS, ...ACCIDENTALS] : NATURALS

  const config: SetConfig =
    exercise === 4 ? { exercise, pair } : exercise === 5 ? { exercise, order } : { exercise, note }
  const beats = setBeats(config)

  const busy = phase !== 'idle'
  const running = phase === 'running'

  function logPractice() {
    if (startedAt.current === null) return
    const seconds = (Date.now() - startedAt.current) / 1000
    startedAt.current = null
    dispatch({ type: 'practiced', date: localDateKey(new Date()), seconds })
  }

  function finish() {
    logPractice()
    setPhase('confirm')
  }

  function start() {
    startedAt.current = Date.now()
    setPhase('running')
    if (exercise === 1) {
      setIndex(0)
      return
    }
    setIndex(-COUNT_IN)
    metronome.current ??= new Metronome()
    metronome.current.start({
      bpm: tempo,
      countIn: COUNT_IN,
      totalBeats: beats.length,
      isAccent: (i) => i % BEATS_PER_RUN === 0,
      onBeat: setIndex,
      onDone: finish,
    })
  }

  function stop() {
    metronome.current?.stop()
    logPractice()
    setPhase('idle')
  }

  function advance() {
    if (index + 1 >= beats.length) finish()
    else setIndex(index + 1)
  }

  function answer(clean: boolean) {
    setPhase('idle')
    if (!clean) return
    dispatch({
      type: 'cleanSet',
      exercise,
      note: exercise <= 3 ? note : undefined,
      bpm: exercise === 1 ? null : tempo,
    })
    if (step !== 6) setChosenNote(null) // move on to the next unticked note
    if (exercise === 5) setOrder(shuffled(NATURALS))
    if (step === 6) setBpm(suggestNextBpm(tempo))
  }

  // Step 1: Space advances. A focused button handles Space itself, so skip those.
  useEffect(() => {
    if (!running || exercise !== 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || e.target instanceof HTMLButtonElement) return
      e.preventDefault()
      advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (running && exercise === 1) nextButton.current?.focus()
  }, [running, exercise])

  // Leaving the step (the parent remounts us per step) stops the click and keeps the time.
  useEffect(
    () => () => {
      metronome.current?.stop()
      logPractice()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only; logPractice reads refs
    [],
  )

  const current = running && index >= 0 ? beats[index] : null
  // During the count-in (index < 0) the next beat is the first one.
  const upcoming = running ? (beats[Math.max(index, -1) + 1] ?? null) : beats[0]
  const countIn = running && index < 0 ? -index : null
  const currentRun = running && index >= 0 ? Math.floor(index / BEATS_PER_RUN) : -1
  const info = STEP_INFO[step]

  return (
    <main className="practice">
      <section className="brief">
        <h2>
          Step {step}: {info.label}
        </h2>
        <p>{info.instructions}</p>
        <p className="goal">
          <strong>Goal:</strong> {info.goal}
        </p>
        <p className="status">
          {stepProgressText(progress, step)}
          {exercise !== 1 && step !== 6 && <> · Tempo {BASE_BPM} BPM</>}
        </p>
      </section>

      <section className="controls">
        {step === 6 && (
          <div className="drill">
            <div className="picker" role="group" aria-label="Exercise">
              {DRILLS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={d === drill ? 'chip is-selected' : 'chip'}
                  aria-pressed={d === drill}
                  disabled={busy}
                  onClick={() => setDrill(d)}
                >
                  Step {d}
                </button>
              ))}
            </div>
            <div className="tempo">
              <button
                type="button"
                aria-label="Slower"
                disabled={busy || bpm <= MIN_BPM}
                onClick={() => setBpm(Math.max(MIN_BPM, bpm - BPM_STEP))}
              >
                −
              </button>
              <output>{bpm} BPM</output>
              <button
                type="button"
                aria-label="Faster"
                disabled={busy || bpm >= MAX_BPM}
                onClick={() => setBpm(Math.min(MAX_BPM, bpm + BPM_STEP))}
              >
                +
              </button>
              <span className="muted">Best clean: {progress.bestBpm[drill] || '—'} BPM</span>
            </div>
          </div>
        )}

        {exercise <= 3 && (
          <div className="picker" role="group" aria-label="Note">
            {pool.map((n) => {
              const ticked = done.includes(n)
              return (
                <button
                  key={n}
                  type="button"
                  className={['chip', n === note && 'is-selected', ticked && 'is-done'].filter(Boolean).join(' ')}
                  aria-pressed={n === note}
                  disabled={busy}
                  onClick={() => setChosenNote(n)}
                >
                  {displayName(n)}
                  {ticked && ' ✓'}
                </button>
              )
            })}
          </div>
        )}

        {exercise === 4 && (
          <div className="pair">
            <label>
              Up{' '}
              <select
                value={pair[0]}
                disabled={busy}
                onChange={(e) => setPair([e.target.value as NoteName, pair[1]])}
              >
                {pairPool.map((n) => (
                  <option key={n} value={n}>
                    {displayName(n)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Down{' '}
              <select
                value={pair[1]}
                disabled={busy}
                onChange={(e) => setPair([pair[0], e.target.value as NoteName])}
              >
                {pairPool.map((n) => (
                  <option key={n} value={n}>
                    {displayName(n)}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" disabled={busy} onClick={() => setPair(randomPair(pairPool))}>
              Random pair
            </button>
            <label className="check">
              <input
                type="checkbox"
                checked={withAccidentals}
                disabled={busy}
                onChange={(e) => {
                  setWithAccidentals(e.target.checked)
                  if (!e.target.checked) setPair(randomPair(NATURALS))
                }}
              />{' '}
              Include sharps and flats
            </label>
          </div>
        )}

        {exercise === 5 && (
          <div className="order">
            <ol className="order-row" aria-label="Note order">
              {order.map((n, i) => (
                <li key={n} className={i === currentRun ? 'is-current' : undefined}>
                  {displayName(n)}
                  <small aria-hidden="true">{i % 2 === 0 ? '↑' : '↓'}</small>
                </li>
              ))}
            </ol>
            <button type="button" disabled={busy} onClick={() => setOrder(shuffled(NATURALS))}>
              Shuffle
            </button>
          </div>
        )}
      </section>

      <section className="stage">
        {phase === 'confirm' ? (
          <div className="cue confirm">
            <p className="cue-main cue-question">Was that clean?</p>
            <p className="cue-next">Every string in order, no wrong notes, no pauses.</p>
            <div className="confirm-buttons">
              <button type="button" className="primary" onClick={() => answer(true)}>
                Yes, clean
              </button>
              <button type="button" onClick={() => answer(false)}>
                No, again
              </button>
            </div>
          </div>
        ) : (
          <Cue key={running ? index : 'idle'} current={current} upcoming={upcoming} countIn={countIn} />
        )}
        <StringLadder active={current?.string ?? null} />
      </section>

      <div className="actions">
        {phase === 'idle' && (
          <button type="button" className="primary" onClick={start}>
            Start
          </button>
        )}
        {running && exercise === 1 && (
          <button type="button" ref={nextButton} className="primary" onClick={advance}>
            Next string
          </button>
        )}
        {running && (
          <button type="button" onClick={stop}>
            Stop
          </button>
        )}
        {step === 4 && phase === 'idle' && !progress.step4Easy && (
          <button type="button" onClick={() => dispatch({ type: 'markEasy' })}>
            This feels easy: mark step 4 done
          </button>
        )}
      </div>
    </main>
  )
}
```

Notes for the implementer:
- `key={running ? index : 'idle'}` on `Cue` remounts it every beat so the CSS pulse
  animation (Task 9) restarts on each click.
- Remove the `eslint-disable` comment if oxlint reports it as unused; the project lints with
  oxlint, which may not know that rule.

**Step 2: Type-check**

Run: `npm run build`
Expected: exit 0.

**Step 3: Commit**

```bash
git add src/components/PracticeScreen.tsx
git commit -q -m "Add the practice screen: cue, controls, metronome and clean prompt"
```

---

### Task 9: App shell and styles

**Files:**
- Modify: `src/App.tsx` (replace placeholder)
- Modify: `src/index.css` (replace template)

**Step 1: `src/App.tsx`**

```tsx
import { useEffect, useReducer } from 'react'
import { FretChart } from './components/FretChart'
import { PracticeScreen } from './components/PracticeScreen'
import { StepTabs } from './components/StepTabs'
import { formatDuration } from './lib/format'
import { MAX_WINDOW_START, MIN_WINDOW_START, WINDOW_SIZE } from './lib/notes'
import {
  browserStore,
  isUnlocked,
  loadProgress,
  localDateKey,
  reduce,
  saveProgress,
  secondsOn,
} from './lib/progress'
import type { StepId } from './lib/progress'

const store = browserStore()
const DAILY_GOAL_SECONDS = 5 * 60
const WINDOW_STARTS = Array.from(
  { length: MAX_WINDOW_START - MIN_WINDOW_START + 1 },
  (_, i) => MIN_WINDOW_START + i,
)

export default function App() {
  const [progress, dispatch] = useReducer(reduce, null, () => loadProgress(store))

  useEffect(() => {
    saveProgress(store, progress)
  }, [progress])

  function openStep(step: StepId) {
    if (step === progress.currentStep) return
    if (
      !isUnlocked(progress, step) &&
      !window.confirm(
        'The method works best when the steps are done in order, even the easy ones. Open this step anyway?',
      )
    ) {
      return
    }
    dispatch({ type: 'setStep', step })
  }

  function resetAll() {
    if (window.confirm('Reset all progress? Your ticks and best tempos will be cleared.')) {
      dispatch({ type: 'reset' })
    }
  }

  const today = secondsOn(progress, localDateKey(new Date()))

  return (
    <div className="app">
      <header className="top">
        <h1>Fretboard Mastery</h1>
        <p className={today >= DAILY_GOAL_SECONDS ? 'today is-met' : 'today'}>
          Practised today: {formatDuration(today)} <span className="muted">/ 5m</span>
        </p>
      </header>

      <StepTabs progress={progress} onOpen={openStep} />

      <PracticeScreen key={progress.currentStep} step={progress.currentStep} progress={progress} dispatch={dispatch} />

      <section className="reference">
        <div className="reference-bar">
          <button type="button" onClick={() => dispatch({ type: 'toggleChart' })} aria-expanded={progress.chartVisible}>
            {progress.chartVisible ? 'Hide note chart' : 'Show note chart'}
          </button>
          <label>
            Frets{' '}
            <select
              value={progress.windowStart}
              onChange={(e) => dispatch({ type: 'setWindowStart', windowStart: Number(e.target.value) })}
            >
              {WINDOW_STARTS.map((s) => (
                <option key={s} value={s}>
                  {s}–{s + WINDOW_SIZE - 1}
                </option>
              ))}
            </select>
          </label>
        </div>
        {progress.chartVisible && <FretChart windowStart={progress.windowStart} />}
      </section>

      <footer className="foot">
        <p>Thanks to Bahadır Peker for introducing me to this method.</p>
        <button type="button" className="link" onClick={resetAll}>
          Reset progress
        </button>
      </footer>
    </div>
  )
}
```

**Step 2: `src/index.css`**

```css
:root {
  --ink: #16181d;
  --muted: #5f6572;
  --accent: #4f46e5;
  --accent-ink: #ffffff;
  --done: #15803d;
  --paper: #f7f8fa;
  --card: #ffffff;
  --border: #e5e7eb;
  --soft: #eef0f4;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #e8eaf0;
    --muted: #9aa1af;
    --accent: #8b85f4;
    --accent-ink: #101116;
    --done: #4ade80;
    --paper: #101116;
    --card: #181a21;
    --border: #2a2d38;
    --soft: #20232c;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

button,
select,
input {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  min-height: 44px;
}

button:disabled {
  cursor: default;
  opacity: 0.5;
}

button.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
  font-weight: 600;
}

button.link {
  border: none;
  background: none;
  padding: 0;
  min-height: 0;
  color: var(--muted);
  text-decoration: underline;
}

select {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 0.4rem 0.5rem;
  min-height: 44px;
}

.muted {
  color: var(--muted);
}

.app {
  max-width: 880px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: grid;
  gap: 20px;
}

.top {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.top h1 {
  margin: 0;
  font-size: 1.6rem;
}

.today {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.today.is-met {
  color: var(--done);
}

/* Step tabs */
.steps {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  font-size: 0.8rem;
}

.step-num {
  font-weight: 700;
  font-size: 1rem;
}

.step.is-current {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.step.is-done .step-num {
  color: var(--done);
}

.step.is-locked {
  opacity: 0.55;
}

@media (max-width: 560px) {
  .step-label {
    display: none;
  }
}

/* Practice */
.practice {
  display: grid;
  gap: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.brief h2 {
  margin: 0 0 4px;
  font-size: 1.2rem;
}

.brief p {
  margin: 4px 0;
}

.status {
  color: var(--muted);
  font-size: 0.9rem;
}

.controls {
  display: grid;
  gap: 12px;
}

.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  min-width: 52px;
}

.chip.is-selected {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
  font-weight: 600;
}

.chip.is-done {
  color: var(--done);
}

.drill,
.pair,
.order {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.tempo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tempo output {
  min-width: 72px;
  text-align: center;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.order-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.order-row li {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 600;
}

.order-row li small {
  margin-left: 4px;
  color: var(--muted);
}

.order-row li.is-current {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.order-row li.is-current small {
  color: inherit;
}

/* Stage: cue + ladder */
.stage {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  background: var(--soft);
  border-radius: 12px;
  padding: 20px 16px;
  min-height: 220px;
}

.cue {
  text-align: center;
  animation: pulse 180ms ease-out;
}

.cue-main {
  margin: 0;
  font-size: clamp(2.5rem, 10vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
}

.cue-idle .cue-main {
  color: var(--muted);
}

.cue-string {
  font-size: 0.45em;
  font-weight: 600;
  color: var(--muted);
}

.cue-dir {
  font-size: 0.45em;
  color: var(--accent);
}

.cue-tip {
  margin: 6px 0 0;
  color: var(--accent);
  font-weight: 600;
}

.cue-next {
  margin: 10px 0 0;
  color: var(--muted);
}

.cue-question {
  font-size: clamp(1.8rem, 7vw, 2.6rem);
}

.confirm-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
}

@keyframes pulse {
  from {
    transform: scale(1.04);
    opacity: 0.7;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cue {
    animation: none;
  }
}

.ladder {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
  width: 120px;
}

.ladder li {
  display: grid;
  grid-template-columns: 16px 1fr 16px;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 0.8rem;
}

.ladder-line {
  height: 2px;
  background: var(--border);
  border-radius: 2px;
}

.ladder li.is-active {
  color: var(--ink);
  font-weight: 700;
}

.ladder li.is-active .ladder-line {
  height: 4px;
  background: var(--accent);
}

@media (max-width: 560px) {
  .stage {
    grid-template-columns: 1fr;
  }

  .ladder {
    width: 100%;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.actions .primary {
  min-width: 140px;
}

/* Reference chart */
.reference {
  display: grid;
  gap: 12px;
}

.reference-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chart-scroll {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
}

.chart {
  border-collapse: collapse;
  width: 100%;
  min-width: 640px;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.chart caption {
  text-align: left;
  padding: 10px 12px 4px;
  color: var(--muted);
  font-size: 0.8rem;
}

.chart th,
.chart td {
  padding: 6px 4px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.chart thead th {
  color: var(--muted);
  font-weight: 600;
  border-top: none;
}

.chart tbody th {
  text-align: left;
  padding-left: 12px;
  white-space: nowrap;
}

.chart td.nat {
  font-weight: 700;
}

.chart td.acc {
  color: var(--muted);
  font-size: 0.75rem;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}

.foot p {
  margin: 0;
}
```

**Step 3: Build, test, lint**

Run: `npm run build && npm run test && npm run lint`
Expected: build and test exit 0; lint shows no errors (warnings are acceptable but read them).

**Step 4: Commit**

```bash
git add src/App.tsx src/index.css
git commit -q -m "Wire up the app shell, note chart toggle and styles"
```

---

### Task 10: Check it in the browser

**Files:** none (fix anything found with a test first if it is logic, in place if it is UI)

**Step 1: Start the dev server**

Add a `.claude/launch.json` in the new repo if using the Claude desktop preview:
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "fretboard-mastery", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173 }
  ]
}
```
Open `http://localhost:5173/fretboard-mastery/`.

**Step 2: Walk through this checklist**

- [ ] Step 1: Start → cue shows "<note> string 6 ↑"; Space and the Next button each advance
      exactly one string; after 36 strings the "Was that clean?" prompt appears; Yes ticks
      the note and selects the next unticked one.
- [ ] Step 2 (open via the locked tab → confirm dialog appears → OK): 4 count-in clicks
      (lower pitch), then one click per beat at 40 BPM, a higher accent click on strings 6
      and 1 turn-arounds; the cue changes on the click, not before or after; Stop silences it
      immediately.
- [ ] Step 3: tip line "Find A, then go up one fret" shows for A♯.
- [ ] Step 4: pair selects, Random pair, the accidentals checkbox; "This feels easy" ticks
      the tab.
- [ ] Step 5: the order row highlights the current note and arrows alternate.
- [ ] Step 6: exercise chips 2–5, − / + tempo; after a clean set the tempo goes up by 4 and
      "Best clean" updates.
- [ ] Note chart toggles, never highlights anything, and the fret-window select relabels
      the columns.
- [ ] Reload: progress, chart visibility and window persist; "Practised today" counts up
      after a set.
- [ ] Reset progress clears ticks and keeps chart/window settings.
- [ ] Phone width (375px): no horizontal page scroll, chart scrolls inside its box, tabs show
      numbers only, stage stacks.
- [ ] Dark mode renders with readable contrast.
- [ ] Browser console has no errors.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -q -m "Fix issues found in browser check"
```
(Skip if nothing changed. Don't commit `.claude/launch.json` unless the user wants it.)

---

### Task 11: Publish the repo (ask the user first)

**Step 1: Confirm with the user** that a **public** repo `ugurkc/fretboard-mastery` may be
created and the app published at `https://ugurkc.github.io/fretboard-mastery/`.

**Step 2: Create, push, enable Pages**

```bash
cd ~/repos/fretboard-mastery
gh repo create ugurkc/fretboard-mastery --public --source . --push \
  --description "Practice app for learning every note on the guitar fretboard"
gh api repos/ugurkc/fretboard-mastery/pages -X POST -f build_type=workflow \
  || gh api repos/ugurkc/fretboard-mastery/pages -X PUT -f build_type=workflow
```

**Step 3: Watch the first deploy**

```bash
SHA=$(git rev-parse HEAD)
RUN_ID=$(gh run list --repo ugurkc/fretboard-mastery --json databaseId,headSha \
  --jq "map(select(.headSha==\"$SHA\"))[0].databaseId")
gh run watch --repo ugurkc/fretboard-mastery --exit-status "$RUN_ID"
```
Expected: the run succeeds. If `RUN_ID` is empty, wait a few seconds and repeat the
`gh run list`. If the build job passed but deploy failed (Pages enabled after the run
started), run `gh run rerun --repo ugurkc/fretboard-mastery "$RUN_ID" --failed` and watch
again.

**Step 4: Verify live**

Open `https://ugurkc.github.io/fretboard-mastery/` and repeat the first two items of the
Task 10 checklist.

---

### Task 12: List it on the homepage (hub repo; ask before pushing)

**Files:**
- Modify: `~/repos/ugurkc.github.io/src/data/publishings.yaml` (append)

Work on the hub branch `docs/fretboard-design`, which already holds the spec and this plan.

**Step 1: Append the entry** (use the date the app went live)

```yaml

- title: "Fretboard Mastery"
  description: "A practice app for learning every note on the guitar fretboard, five minutes a day: a metronome, a cue for every beat, and six steps from one note at your own pace to all seven at 80 BPM."
  date: "2026-10-17"
  url: "/fretboard-mastery/"
```

No `robots.txt` change: this app has no `/admin/`.

**Step 2: Test the hub**

Run: `cd ~/repos/ugurkc.github.io && npm run test`
Expected: PASS (the publishings schema test covers the new entry).

**Step 3: Commit**

```bash
git add src/data/publishings.yaml
git commit -q -m "Add Fretboard Mastery to publishings"
```
(The hub repo's commits end with the session's `Co-Authored-By` trailer, as its history
does.)

**Step 4: Ask the user** before merging `docs/fretboard-design` into `main` and pushing —
the push deploys the live homepage. On a yes:

```bash
git switch main && git pull --ff-only && git merge --ff-only docs/fretboard-design && git push
```
Then watch the hub's deploy run the same way as Task 11 Step 3 (repo
`ugurkc/ugurkc.github.io`) and check the new card on `https://ugurkc.github.io/`.
