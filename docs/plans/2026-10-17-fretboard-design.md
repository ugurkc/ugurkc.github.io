# Fretboard Mastery — practice app design

**Date:** 2026-10-17
**Status:** Approved (revised 2026-10-17: the self-paced one-note exercise became the
step 0 position charts; the other steps renumbered 1–5)

## Goal

A practice app that walks a guitarist through a study page and five practice steps for learning every
note on the fretboard, 5 minutes a day. The app runs the metronome, tells the player
what to play on each beat, and tracks progress through the steps. It does not listen
to the guitar: the player reports whether each set was clean (honor system).

Credit, in the footer: *"Thanks to Bahadır Peker for introducing me to this method."*
No other attribution.

## Where it lives

- New repo `ugurkc/fretboard-mastery`, deployed at `ugurkc.github.io/fretboard-mastery/`.
- Stack as the other pieces: Vite + React + TypeScript, Vitest, `base: '/fretboard-mastery/'`,
  deploy workflow copied from movements (test → build → deploy-pages).
- No Sveltia CMS: there is no editable prose. (The `/blog` scaffold minus the admin
  steps.)
- One entry added to `src/data/publishings.yaml` in this repo.

## The method (what the app enforces)

Shared rules, every step:

- A 12-fret window, frets 1–12 by default, no open strings. The window can slide
  (start fret 1–10) for players who want the upper neck. Inside any 12-fret window
  each note occurs exactly once per string, so "A on string 4" is unambiguous.
- Standard tuning (E A D G B E; string 6 = low E).
- Strings in order, never skipping: up = 6→1, down = 1→6. A **round** is up then down.
- One note per beat (steps 1–5).
- Charts are allowed; patterns are not to be memorized. During practice (steps 1–5) the
  app never shows the fret; step 0 is the one place positions are shown.

| Step | What is played | Set | Done when |
|---|---|---|---|
| 0 | Nothing: a study page. One big fretboard chart for the current window; pick a note and every position of it lights up. Naturals by default; a switch adds the five sharps/flats (C♯/D♭ …) | — | Never gated, no tick |
| 1 | One natural note, rounds 6→1→6, metronome at 40 BPM | 3 rounds | Each natural clean once at 40 |
| 2 | The 10 accidentals (C♯ D♭ D♯ E♭ F♯ G♭ G♯ A♭ A♯ B♭) at 40 BPM; tip "A♯ = find A, up one fret" / "B♭ = find B, down one fret". A♯ and B♭ are separate items | 3 rounds | Each accidental clean once at 40 |
| 3 | Two notes (picked or random; naturals, optionally accidentals): first note 6→1, second 1→6, no pause | 3 rounds of the pair | Player marks "this feels easy" |
| 4 | App shuffles the 7 naturals (e.g. D F C E A G B) and shows the row; alternate up/down per note, no pause | one pass (42 beats) | One clean pass at 40 |
| 5 | Steps 1–4 again with rising tempo; starts at that step's best clean tempo; after a clean set the app suggests +4 BPM | per step | Step 4 clean at ≥ 80 BPM |

Step 1 is unlocked from the start; each later step unlocks when every practice step
before it is complete. New players land on step 0.

After each set the metronome stops and the app asks **Clean? Yes / No**. Yes
records the item; No just lets the player go again.

## Screen

- **Top bar:** step tabs 0–5; below them, per step, the note picker (or pair picker /
  shuffle for 3–4; drill and BPM for 5) and Start/Stop. The fret-window select sits next
  to the chart toggle.
- **Centre:** big cue (**A · string 4**) with a direction arrow, a smaller "next: string
  3", and a 6→1 string ladder with the current string lit. Step 4 also shows the shuffled
  note row with the current note highlighted.
- **Step 0 (positions):** note chips (7 naturals; a "Sharps & flats" switch adds five
  enharmonic chips such as C♯/D♭), then one large chart: strings 1–6 as rows, the 12
  frets of the current window as columns, fret numbers above, and a marked dot carrying
  the note name at every position of the chosen note. No metronome, no Start button.
- **Chart toggle:** full note chart for the current window, no highlighting. Off by
  default; remembered. Hidden on step 0, which has its own chart; the fret-window select
  stays and drives the step 0 chart too.
- **Metronome:** Web Audio clicks scheduled ahead of time (lookahead scheduler, not
  `setInterval` per beat) for steady timing; one-bar count-in; accent click at the start of each
  6-string run; visual pulse on each beat. Cues fire when the click is audible (output
  latency included); Stop silences clicks already queued; one shared AudioContext.
- **Clean prompt:** takes focus itself rather than its Yes button, so a stray Space or
  Enter can never record a clean set.
- **Footer:** the credit line above.

## Progress and override

- Saved in `localStorage` under the key `fretboard-mastery:v1`, data `version: 2`:
  per-step item checkmarks, current step, best clean BPM for steps 1–4, step 3 "easy"
  flag, practice seconds per calendar day. Version-1 data is
  migrated: old steps 2–6 map to 1–5 (their ticks, flags and best tempos carry over),
  the old step 1 ticks are dropped, and an old current step of 1 becomes 0.
- "Practised today: 3m 20s" counter (time with the metronome running).
  A nudge, not a gate.
- Locked steps stay clickable: opening one shows "The method asks you to do the steps in
  order — continue anyway?" then lets the player through.
- "Reset progress" with a confirmation. It clears ticks, best tempos and the current step;
  it keeps the chart and fret-window settings and the practice-time log.
- Every storage read/write is wrapped in try/catch; unreadable or unknown-version data
  falls back to fresh progress, and the app works with storage unavailable.

## Code shape

Pure logic, framework-free and fully unit-tested:

- `notes.ts` — note names, accidentals, fret ↔ note for each string in standard tuning,
  the fret of a note on a string within a window.
- `sequence.ts` — beat sequence for each practice step (string order, round/pass structure, pair
  and shuffle alternation).
- `progress.ts` — progress state, reducer for "set clean" events, unlock rules, storage
  load/save with version check.

`metronome.ts` — a `Metronome` class (Web Audio lookahead scheduler), one instance shared
app-wide.

UI (React): `PositionsScreen` (step 0), `PracticeScreen` (steps 1–5, with the clean
prompt inline), `Cue`, `StringLadder`, `FretChart`, `StepTabs`.

## Testing

- Vitest on the pure modules: no skipped strings and correct up/down alternation in every
  step's sequence; fret maths across all strings and window starts (each note exactly once
  per string per window); the positions of a note on every string for step 0; unlock and
  completion rules for each step; storage round-trip, corrupt JSON, unknown version, and
  the version-1 migration; the metronome against a fake audio clock (beat
  count and order, stop/restart, latency alignment, skipped late beats).
- Manual browser check of the metronome timing, cue display, chart toggle and the
  phone-width layout.

## Out of scope

Microphone pitch detection, alternate tunings, accounts or cross-device sync, left-handed
chart (possible later).
