# Fretboard Mastery — practice app design

**Date:** 2026-10-17
**Status:** Approved

## Goal

A practice app that walks a guitarist through a six-step method for learning every
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
- One note per beat (steps 2–6).
- Charts are allowed; patterns are not to be memorized. The app never shows the fret.

| Step | What is played | Set | Done when |
|---|---|---|---|
| 1 | One natural note, rounds 6→1→6, self-paced (Space / tap advances) | 3 rounds | Each of the 7 naturals clean, two full passes |
| 2 | Same, metronome at 40 BPM | 3 rounds | Each natural clean once at 40 |
| 3 | The 10 accidentals (C♯ D♭ D♯ E♭ F♯ G♭ G♯ A♭ A♯ B♭) at 40 BPM; tip "A♯ = find A, up one fret" / "B♭ = find B, down one fret". A♯ and B♭ are separate items | 3 rounds | Each accidental clean once at 40 |
| 4 | Two notes (picked or random; naturals, optionally accidentals): first note 6→1, second 1→6, no pause | 3 rounds of the pair | Player marks "this feels easy" |
| 5 | App shuffles the 7 naturals (e.g. D F C E A G B) and shows the row; alternate up/down per note, no pause | one pass (42 beats) | One clean pass at 40 |
| 6 | Steps 2–5 again with rising tempo; starts at that step's best clean tempo; after a clean set the app suggests +4 BPM | per step | Step 5 clean at ≥ 80 BPM |

After each set the metronome stops and the app asks **Clean? Yes / No**. Yes
records the item; No just lets the player go again.

## Screen

- **Top bar:** step tabs 1–6; below them, per step, the note picker (or pair picker /
  shuffle for 4–5; drill and BPM for 6) and Start/Stop. The fret-window select sits next
  to the chart toggle.
- **Centre:** big cue (**A · string 4**) with a direction arrow, a smaller "next: string
  3", and a 6→1 string ladder with the current string lit. Step 5 also shows the shuffled
  note row with the current note highlighted.
- **Chart toggle:** full note chart for the current window, no highlighting. Off by
  default; remembered.
- **Metronome:** Web Audio clicks scheduled ahead of time (lookahead scheduler, not
  `setInterval` per beat) for steady timing; one-bar count-in; accent click at the start of each
  6-string run; visual pulse on each beat. Cues fire when the click is audible (output
  latency included); Stop silences clicks already queued; one shared AudioContext.
- **Clean prompt:** takes focus itself rather than its Yes button, so a stray Space or
  Enter can never record a clean set.
- **Footer:** the credit line above.

## Progress and override

- Saved in `localStorage` under a versioned key (`fretboard-mastery:v1`): per-step item
  checkmarks (step 1 per pass), current step, best clean BPM for steps 2–5, step 4
  "easy" flag, practice seconds per calendar day.
- "Practised today: 3m 20s" counter (time with the metronome or step-1 session running).
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
- `sequence.ts` — beat sequence for each step (string order, round/pass structure, pair
  and shuffle alternation).
- `progress.ts` — progress state, reducer for "set clean" events, unlock rules, storage
  load/save with version check.

`metronome.ts` — a `Metronome` class (Web Audio lookahead scheduler), one instance shared
app-wide.

UI (React): `PracticeScreen` (with the clean prompt inline), `Cue`, `StringLadder`,
`FretChart`, `StepTabs`.

## Testing

- Vitest on the pure modules: no skipped strings and correct up/down alternation in every
  step's sequence; fret maths across all strings and window starts (each note exactly once
  per string per window); unlock and completion rules for each step; storage round-trip,
  corrupt JSON, and unknown version; the metronome against a fake audio clock (beat
  count and order, stop/restart, latency alignment, skipped late beats).
- Manual browser check of the metronome timing, cue display, chart toggle and the
  phone-width layout.

## Out of scope

Microphone pitch detection, alternate tunings, accounts or cross-device sync, left-handed
chart (possible later).
