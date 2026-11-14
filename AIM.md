# AIM — what we are building and why

> This file is the stable north star. It changes only when the owner changes their mind.
> The loop (see `LOOP.md`) reads it every iteration and never edits it except to append to "Owner amendments".

## One sentence

A beautiful, ambitious platformer / role-playing game for a **6-year-old (KS1, Year 1–2)**, played on a **tablet with a stylus**, that she will want to play for months, and that quietly teaches the KS1 curriculum — including **correct letter formation**.

## The player

- 6 years old, UK (KS1, British English, £ money, analogue clocks, UK spelling).
- Plays on a **tablet, with a stylus** (finger also works). Landscape. Touch-first; keyboard is a bonus.
- Familiar books (take inspiration, make her *recognise* the stories — homage, not copies of text or art):
  - *Don't Wake Mum*
  - *The Café at the Edge of the Woods*
  - *Bettsy Buglove*
  - the *Ottoline* series (Chris Riddell)
- More books may be added by the owner: add them to `SPEC.md` § Story sources.

## Must-haves (from the owner's brief)

1. **Platformer + RPG**: explore, jump, talk to characters, take on quests, collect things.
2. **Many interesting scenes, characters and stories** to explore, each with a recognisable nod to a book above.
3. **Lots of free-play sandboxes** with toys to role-play with (café, vet, potions, dolls' house, etc.). No score, no failure.
4. **Deep character customisation** — she might be a witch or a vet: dozens of options (outfit, hair, hats, wings, held items, face, pet).
5. **Covers KS1 curriculum** (maths, English, science, geography/history-lite, art, music…). Puzzles open doors and move her between scenes.
6. **A gem economy** to unlock new areas:
   - gems are found in the world;
   - picking one up requires solving a puzzle;
   - each new area needs a specific combination of specific gem colours to unlock.
7. **Handwriting & drawing challenges with the stylus** — especially **correct letter formation** (start point, stroke order, direction), building up to writing whole words on the lines.
8. **Be ambitious. Make it beautiful.**
9. **Continuous deployment**: every merged change is playable at a public URL.
10. **Rebuildable from spec**: `SPEC.md` must be sufficient to regenerate the game from scratch. If code and spec disagree, fix one of them in the same iteration.

## Non-goals / guard-rails

- No ads, no tracking, no accounts, no network calls at play-time (fonts aside, with a fallback). Saves live in `localStorage`.
- No failure states that feel punishing: wrong answers get a gentle retry and a hint, never a game-over.
- Never copy book text, illustrations or character designs. Evoke them with original art and original wording.
- Not a recreation of any existing *game*.
- Readable by a 6-year-old: big targets, short text, everything important read aloud (speech synthesis).

## Definition of "done enough to hand to her"

- Plays at 60fps on a mid-range tablet; no crashes in a 30-minute session.
- Every area reachable; every puzzle solvable; progress never gets stuck (there is always a way to earn the missing gem).
- Handwriting recogniser accepts correctly-formed letters and gently coaches mistakes.
- A parent can see progress (settings → grown-up page) without any of it being shown to the child as "scores".

## Owner amendments

*(append dated bullets here; never delete)*

- 2026-11-14: Played on a tablet with a stylus. Drawing/handwriting challenges wanted; correct letter formation, especially when writing words, is a priority area to improve.
- 2026-11-14: Work is done in an aim → spec → code loop (see `LOOP.md`).
