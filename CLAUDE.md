# Hazelnut Hollow — agent instructions

A kids' platformer/RPG for a 6-year-old on a tablet + stylus. No build step: open `index.html` or run `python3 -m http.server`.

**Start here every session:**
1. `AIM.md` — what and why (read-only).
2. `LOOP.md` — the iteration procedure. Follow it.
3. `SPEC.md` — the living spec: architecture, content tables, status, backlog, iteration log. **Update it before and after changing code.**

Conventions
- Develop on branch `claude/kids-platformer-game-ndef40`; push there. **Every deploy: merge into `main` and push `main`** (the owner asked for this) — only `main` deploys via the GitHub Pages workflow. Check the Actions run afterwards.
- Plain browser JS in `js/`, shared namespace `window.G` (see SPEC § Architecture). Script load order is in `index.html`.
- All art is procedural canvas drawing — no image assets. Sounds are synthesised (WebAudio). Speech via `speechSynthesis`.
- Touch/stylus first: use Pointer Events, `touch-action: none` on the canvas and writing pads, 56px+ targets.
- British English in all player-facing text. Keep copy short (target reading age ≤ 6) and read-aloud friendly.
- Verify with `./tools/check.sh` before pushing; look at the screenshots.
