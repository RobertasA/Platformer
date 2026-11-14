# Hazelnut Hollow 🌰

A storybook platformer / role-playing game for a 6-year-old (KS1), played on a tablet with a stylus.
Dress up as a witch or a vet, explore cosy places inspired by favourite picture books, solve little maths / reading / science / pattern puzzles to collect gems, unlock new lands, practise **handwriting with correct letter formation**, and play in toy-filled sandboxes.

- **Aim:** [`AIM.md`](AIM.md) — what and why
- **Spec:** [`SPEC.md`](SPEC.md) — living spec; the game can be rebuilt from it
- **Loop:** [`LOOP.md`](LOOP.md) — aim → spec → code → verify → deploy
- **Agents:** [`CLAUDE.md`](CLAUDE.md)

## Feedback
Watched her play and noticed something? Open an issue with the label **`feedback`** (one observation per issue). Each loop iteration reads them first, queues them in the spec backlog, and closes them when shipped. See [`LOOP.md`](LOOP.md#giving-feedback-for-the-owner).

## Run it
No build step.
```
python3 -m http.server 8000   # then open http://localhost:8000
./tools/check.sh              # headless smoke test + screenshots in shots/
```

## Deploy
Pushes to `main` or `claude/kids-platformer-game-ndef40` deploy to GitHub Pages via `.github/workflows/pages.yml`
(one-time: repo **Settings → Pages → Source: GitHub Actions**).
