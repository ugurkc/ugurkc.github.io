# Fretboard Mastery: Step 0 Position Charts — Change Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace the self-paced one-note exercise (old step 1) with a step 0 study page that
shows every position of a chosen note on one big fretboard chart, and renumber the
remaining steps 1–5.

**Spec:** `docs/plans/2026-10-17-fretboard-design.md` (revised the same day). Repo:
`~/repos/fretboard-mastery`, branch `step-0-positions` (never push; `main` deploys).

**Conventions:** strict TS (`verbatimModuleSyntax`, `erasableSyntaxOnly`,
`noUnusedLocals/Parameters`; `tsc -b` type-checks tests too). TDD for `src/lib`. Commits
have **no** `Co-Authored-By` / "Generated with" trailers. `npm run test`, `npm run build`,
`npm run lint` must pass after every task.

## Old → new numbering

| Old step | New step | Old exercise id | New exercise id |
|---|---|---|---|
| 1 one note, self-paced | **removed** → step 0 is the positions page | 1 | — |
| 2 one natural @40 | 1 | 2 | 1 |
| 3 accidentals @40 | 2 | 3 | 2 |
| 4 two notes | 3 | 4 | 3 |
| 5 all seven shuffled | 4 | 5 | 4 |
| 6 speed up (drills 2–5) | 5 (drills 1–4) | — | — |

---

### Task A: Logic — notes, sequence, progress (with v1 → v2 migration)

**`src/lib/notes.ts`** (add, keep everything else):
- `export const SHARPS = ['C#', 'D#', 'F#', 'G#', 'A#'] as const` — one chip per black-key
  pitch on the step 0 page.
- `export function pitchLabel(note: NoteName): string` — the chart label of the note's
  pitch class, e.g. `'A'`, `'C♯/D♭'` (same strings `chartLabel` uses).
- `export interface Position { string: StringNumber; fret: number }` and
  `export function positionsOf(note: NoteName, windowStart: number): Position[]` — one
  entry per string, strings 1→6, fret from `fretFor`.
- Tests: `positionsOf('C', 1)` = string 1 fret 8, 2→1, 3→5, 4→10, 5→3, 6→8; length 6
  for every note and window; enharmonics give identical positions; `pitchLabel('Db')` and
  `pitchLabel('C#')` are both `'C♯/D♭'`; `pitchLabel('G')` is `'G'`.

**`src/lib/sequence.ts`:**
- `export type Exercise = 1 | 2 | 3 | 4` (1 = one natural, 2 = one accidental, 3 = pair,
  4 = shuffled seven).
- `SetConfig = { exercise: 1 | 2; note } | { exercise: 3; pair } | { exercise: 4; order }`;
  `setBeats` unchanged in behaviour (single note: 3 rounds up+down; pair: 3 rounds; order:
  alternate per note).
- Renumber the existing tests (old 1–3 → 1–2, old 4 → 3, old 5 → 4); keep every
  assertion's strength.

**`src/lib/progress.ts`** — data version 2, same storage key `fretboard-mastery:v1`:
- `StepId = 0 | 1 | 2 | 3 | 4 | 5`; `export type PracticeStep = Exclude<StepId, 0>`;
  `STEPS = [0,1,2,3,4,5]`; `TempoExercise` removed — use `Exercise`.
- `Progress`:
  `{ version: 2; currentStep: StepId; step1: Natural[]; step2: Accidental[];
  step3Easy: boolean; step4Clean: boolean; bestBpm: Record<Exercise, number>;
  windowStart; chartVisible; practiceSeconds }`.
- `freshProgress()` → `currentStep: 0`, everything else empty/false/0 as before.
- `ProgressEvent` `cleanSet`: `{ type: 'cleanSet'; exercise: Exercise; note?: NoteName; bpm: number }`
  (bpm no longer nullable; keep the non-finite / ≤0 guard). Rules: exercise 1 ticks a
  natural into `step1` at ≥ BASE_BPM; 2 ticks an accidental into `step2`; 4 sets
  `step4Clean`; every valid clean set raises `bestBpm[exercise]`. `markEasy` sets
  `step3Easy`. Other events unchanged; `reset` keeps windowStart, chartVisible,
  practiceSeconds and returns `currentStep: 0`.
- `doneItems(p, exercise: 1 | 2)`. Remove `step1Pass` and `recommendedStep` (unused).
- `isStepComplete(p, step)`: 0 → `true` (never gates); 1 → all 7 naturals; 2 → all 10
  accidentals; 3 → `step3Easy`; 4 → `step4Clean`; 5 → `bestBpm[4] >= TARGET_BPM`.
- `isUnlocked(p, step)`: every step `s` with `0 < s < step` is complete (so 0 and 1 are
  always unlocked).
- `stepProgressText`: 0 → `'A study page: nothing to tick off'`; 1 → `'n/7 notes clean at
  40 BPM'`; 2 → `'n/10 sharps and flats clean at 40 BPM'`; 3 → `'Not marked easy yet'`;
  4 → `'No clean pass yet'`; 5 → `'Best clean step-4 tempo: … (target 80 BPM)'`; steps
  1–4 say `'Done'` when complete (as now, using the constants, not literals).
- **Migration in `sanitize`:** `version: 2` → sanitize as today. `version: 1` → map to v2
  first, then sanitize: `currentStep` 1→0, n→n−1 (2..6 → 1..5); `step2`→`step1`;
  `step3`→`step2`; `step4Easy`→`step3Easy`; `step5Clean`→`step4Clean`;
  `bestBpm {2,3,4,5}`→`{1,2,3,4}`; old `step1` (pass1/pass2) dropped; windowStart,
  chartVisible, practiceSeconds kept. Any other version → fresh.
- Tests: port the existing suite to the new numbering with the same strength (cutoffs at
  39/40 and 79/80, NaN/Infinity, reset whole-object equality, sanitize filtering and caps,
  throwing storage), plus: step 0 complete and unlocked on fresh progress and never
  blocks step 1; step 2 locked until step 1 complete; a full v1 → v2 migration fixture
  (every field above, including currentStep 1→0 and 6→5) and a v1 fixture with junk
  fields still sanitizes; version 3 → fresh.

Commit: `Renumber steps around a step 0 study page and migrate saved progress`.

---

### Task B: UI — step 0 positions page, renumbered practice screen

**`src/lib/steps.ts`:** `STEP_INFO` keyed 0–5.
- 0 `Positions` — instructions: "Study where each note lives before you practise. Pick a
  note and look at every place it sits, one per string, inside the 12 frets you're using.
  Come back here whenever you need to." Goal: "No goal: this page is for reference."
- 1 `One note` — "Pick a natural note and play it on every string, 6 to 1 and back to 6,
  one note per click at 40 BPM. Stay at 40 even if it feels slow; the small time pressure
  is what makes it stick. Use the chart if you need it; don't try to memorise shapes."
  Goal: "Three clean rounds at 40 BPM for each natural note."
- 2, 3, 4: the old 3, 4, 5 copy unchanged.
- 5 `Speed up`: "Go back through steps 1 to 4 and raise the tempo …"; goal "Step 4 clean
  at 80 BPM. Then you know your fretboard."

**New `src/components/PositionsScreen.tsx`** — props `{ windowStart: number;
onStartPractice: () => void }`:
- Brief (h2 "Step 0: Positions", instructions, goal) like PracticeScreen's.
- Note chips: the 7 naturals; a checkbox "Sharps & flats" appends the 5 `SHARPS` chips,
  labelled with `pitchLabel` (e.g. "C♯/D♭"). Selected chip `aria-pressed`. Default `C`.
  Unticking the switch while a sharp is selected falls back to `C`. Local state only.
- One large chart (`<table className="positions">` inside `.chart-scroll`): caption "Where
  <note> sits in frets a–b"; header row of fret numbers; rows strings 1→6 with the
  string number and open name; each cell empty except at `positionsOf(note, windowStart)`,
  which renders `<span className="dot">{label}</span>` where label is the display name
  (or `pitchLabel` for sharps). Cells have a visible fret line (border) so the grid reads
  as a fretboard; single-dot fret markers (3, 5, 7, 9) and a double marker at 12 in the
  header row are a nice touch if cheap.
- A primary button "Start step 1" → `onStartPractice`.

**`src/components/PracticeScreen.tsx`** — practice steps only (`step: PracticeStep`):
- Remove the self-paced path: `advance`, the Space keydown effect, `nextButton`, the
  "Next string" button, and any `exercise === 1 ? null` bpm branches (bpm is always the
  tempo now).
- Renumber: `exercise = step === 5 ? drill : step`; drills `[1, 2, 3, 4]` labelled
  "Step 1"…"Step 4"; note picker for exercises 1–2 (pool: naturals for 1, accidentals for
  2); pair controls for 3; order row for 4; `step === 3` shows "This feels easy: mark step
  3 done" (`progress.step3Easy`); step 5 tempo seeded from `bestBpm[drill]`; status line
  shows "· Tempo 40 BPM" for steps 1–4.
- Everything else (shared metronome, layout-effect cleanup, prompt focus, M1/M2 fixes)
  stays.

**`src/components/StepTabs.tsx`:** tabs 0–5. Step 0 never shows ✓ or the locked style
(aria-label "Step 0: Positions"). Others as now.

**`src/App.tsx`:** `currentStep === 0` renders `<PositionsScreen windowStart onStartPractice={() => dispatch({ type: 'setStep', step: 1 })} />`; otherwise
`<PracticeScreen key={currentStep} step={currentStep} …/>`. On step 0 hide the "Show/Hide
note chart" button and the reference `FretChart`, keep the fret-window select (it drives the
step 0 chart). Unlock confirm unchanged.

**`src/index.css`:** styles for `.positions` (bigger cells than `.chart`, min-width ~640px
inside the existing scroll box, fret lines, string lines, `.dot` as an accent-filled circle
with the note name in `--accent-ink`, works in light and dark), and the step 0 chips. Keep
the 375px no-horizontal-scroll rule.

**`CLAUDE.md`:** update the Shape section (PositionsScreen; steps 0–5) and the rule: "During
practice (steps 1–5) the app never shows which fret to play; step 0 is the one place
positions are shown."

Commit: `Add step 0 position charts and drop the self-paced exercise`.

---

### Task C: Verify and ship (controller)

Browser check (step 0 chart for several notes and windows, sharps switch, step 1–5
flows, migration from a hand-written v1 localStorage value, 375px, light/dark), final
review, then ask the user before merging to `main` and pushing.
