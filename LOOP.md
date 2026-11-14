# LOOP — how we work

Each iteration moves the game closer to `AIM.md` by updating **`SPEC.md` first**, then the code, then deploying.

```
read AIM.md ─► read SPEC.md (status + backlog) ─► pick the next slice
      ▲                                                    │
      │                                                    ▼
 deploy (push) ◄─ verify (headless run + screenshots) ◄─ update SPEC ─► write code
      │
      └─► log the iteration in SPEC.md § Iteration log, re-rank the backlog
```

## Steps

1. **Orient** – read `AIM.md`, then `SPEC.md` (§ Status, § Backlog). Run `./tools/check.sh` to see the game still boots.
2. **Pick a slice** – the top 1–3 backlog items that form something *playable and visible* (a scene, a puzzle type, a toy, a customisation batch). Prefer vertical slices over horizontal plumbing. Keep slices small enough to finish and verify in one iteration.
3. **Update the spec first** – describe the slice in `SPEC.md` precisely enough that someone could rebuild it from the text (data shapes, IDs, rules, numbers, copy). Mark it `[building]`.
4. **Write the code** – to match the spec. No build step: plain ES5/ES2017 scripts in `js/`, all art drawn in code, data in `js/*.js`.
5. **Verify** – `./tools/check.sh` (loads the page in headless Chromium, fails on any console error, takes screenshots into `shots/`, which is git-ignored). Look at the screenshots. For layout/touch work, test at 1180×820 (tablet landscape) and 844×390 (phone).
6. **Reconcile** – anything the code does that the spec doesn't say, add to the spec; anything the spec says that the code doesn't do, either do it or mark `[todo]`. Flip `[building]` → `[done]`.
7. **Log** – append to `SPEC.md` § Iteration log (what shipped, what was learnt, what's next) and re-rank the Backlog.
8. **Ship** – commit with a message of the form `iterN: <what the player can now do>`, push to the working branch. CI deploys to GitHub Pages (see `.github/workflows/pages.yml`).

## Rules

- `AIM.md` is read-only to the loop (except appending owner amendments the owner has given).
- The spec is the source of truth. Never leave code ahead of the spec at the end of an iteration.
- Every iteration must leave the game **bootable and deployable**.
- Content (stories, puzzles, items) is data, not code: add rows to the tables in `js/` and the matching table in the spec.
- Prefer delegating bulk content/code generation to cheaper sub-agents (e.g. Sonnet) with the relevant spec section as their brief; review their output before committing.
- Child-safety/tone check each iteration: gentle, funny, no scares beyond "a bit spooky-silly", no punishment.

## Status keys used in the spec

`[done]` shipped & verified · `[building]` in this iteration · `[todo]` agreed, not started · `[idea]` not yet agreed
