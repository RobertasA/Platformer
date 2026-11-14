# SPEC — Hazelnut Hollow (living spec)

Source of truth for rebuilding the game. Read `AIM.md` for intent, `LOOP.md` for process.
Status keys: `[done]` `[building]` `[todo]` `[idea]`.

---

## 0. Status (update every iteration)

| Area | State |
|---|---|
| Repo, aim/spec/loop, CI deploy, smoke test | [done] iter0 |
| `js/core.js` namespace, save, input | [done] iter1, verified in browser |
| `js/audio.js` sfx/music/speech | [done] (headless: no audio check) |
| `js/art.js`, `js/scenery.js` | [done] iter1, verified in screenshots |
| `css/style.css`, `js/main.js` (fit, title, loop, debug steps) | [done] iter1 |
| `js/world.js` village (72×15, 5 NPCs, 9 gems, 4 gates) | [done] iter1 |
| `js/engine.js` physics, camera, gems, interact, travel | [done] iter1 |
| `js/ui.js` HUD, toast, dialogue, gate card, creator/wardrobe, settings | [done] iter1 |
| `js/puzzle.js` shell (choice / order / write) | [done] iter1 |
| `js/handwriting.js` pad, glyphs a–z A–Z 0–9, recogniser, coach | [done] iter1 (synthetic tests only; untested with a real stylus) |
| `js/curriculum.js` generators | see iteration log |
| Areas beyond the village (house, café, meadow, writing…) | [todo] — gates open but travel shows "still being built" |
| `js/sandbox.js` playrooms | [todo] stub |

Deploy URL: GitHub Pages for `RobertasA/Platformer` (set Pages source = "GitHub Actions" once in repo settings).

---

## 1. Product summary

**Hazelnut Hollow**: a cosy storybook world. The child makes a character, then explores a hub village and surrounding areas as a side-scrolling platformer. Characters ask for help (quests); sparkling **gems** are hidden around; touching a gem starts a short **puzzle**; solving it banks the gem. Locked **gates** to new areas need a specific **gem recipe**. **Playrooms** are no-pressure sandboxes with toys. **Writing Wood** (handwriting) is a stylus-based area and also appears as puzzle type inside other areas.

Target: iPad/Android tablet landscape ≥ 1024×700, stylus or finger; also works on desktop (keyboard) and phone.

---

## 2. Architecture

- Static site, **no build step**, no dependencies. `index.html` loads scripts in this order (shared global `window.G`):
  `core → audio → art → scenery → curriculum → puzzle → handwriting → world → engine → ui → sandbox → main`
- One full-window `<canvas id=game>` rendered at logical **1280×720**, letterboxed/scaled to fit (devicePixelRatio aware). DOM overlays (`#hud`, `#dialogue`, `#overlay`, `#touch`) sit above it for UI/puzzles.
- All art procedural (canvas 2D). No image files. Fonts: Fredoka (Google Fonts, with system fallbacks). Emoji used for small icons.
- Audio: WebAudio synth for SFX + generative music per theme; speech via `speechSynthesis` (en-GB) reading questions/dialogue; speaker button on every puzzle.
- Input: **Pointer Events** everywhere. Canvas & writing pads `touch-action:none`. On-screen buttons (◀ ▶ ⬆ ✋) shown on touch devices; keyboard: arrows/WASD, space jump, E/Enter/↓ interact.
- Save: `localStorage['hazelnut-hollow-save-v1']`, JSON of `G.S` (see §3). Debounced `G.saveGame()`.
- Debug hooks: `G.debug.tour()` (optional) used by `tools/check.js` to jump through scenes for screenshots.

### Files
| File | Responsibility |
|---|---|
| `core.js` | `G`, `G.U` helpers, gem table, save/load, keyboard + touch input |
| `audio.js` | `G.sfx(name)`, `G.music.play(mood)`, `G.say(text)`, `G.hush()`, `G.note/drum` |
| `art.js` | `G.drawAvatar`, `G.drawCreature`, `G.drawGem`, `G.drawLook`, `G.portrait`, `G.OPTS`, `G.PRESETS`, shape helpers |
| `scenery.js` | `G.THEMES`, `G.drawBackground`, `G.drawSolid/Plat/Water/Decor/Door`, `G.DECOR` prop table |
| `curriculum.js` | puzzle generators by subject & level (§6) |
| `puzzle.js` | puzzle UI shell (modal): types, hints, retry, rewards (§6) |
| `handwriting.js` | stroke-order letter recogniser & trace/write UIs (§7) |
| `world.js` | area definitions: tile maps, entities, doors, NPCs, quests (§5) |
| `engine.js` | physics, camera, entities, collisions, interaction, area loading (§4) |
| `ui.js` | HUD, dialogue, journal, map, wardrobe/creator, settings, grown-up page |
| `sandbox.js` | free-play playrooms (§8) |
| `main.js` | boot, title screen, loop, scaling |

---

## 3. Data model — `G.S` (save)

```
name, created:bool, avatar:{skin,hair,hairCol,body,col1,col2,motif,shoes,hat,back,held,face,pet}
gems:{red,blue,green,yellow,purple}:int   coins:int
areas:{<areaId>:true}   area:<current>
taken:{"<areaId>:<entityId>":true}   // gems/coins/items already collected
locks:{<gateId>:true}   quests:{<questId>:stage}   bugs:{} (Bettsy bug collection)   owned:{"hat:goldcrown":true}
seen:{} (tutorial/dialogue flags)
level:{maths,words,nature,shapes,patterns}:int   // adaptive difficulty 0..4 per subject
streak:{...}  stats:{solved,vet,potions}  playsets:{<playset>:state}
handwriting:{<char>:{best:0..1, tries:int}}   [todo]
settings:{music,sfx,speech,year:'auto'|1|2}
```

### Gems = subjects
| Colour | Name | Subject | Label |
|---|---|---|---|
| red | Ruby | maths | Numbers |
| blue | Sapphire | words | Words (phonics, spelling, handwriting) |
| green | Emerald | nature | Nature (science) |
| yellow | Topaz | shapes | Shapes & Time (geometry, measures, time, money) |
| purple | Amethyst | patterns | Patterns & Logic (sequences, sorting, coding-lite) |

Coins: small economy for the toy shop / dress-up unlocks (§9). Gems are never spent on cosmetics — only on gates.

---

## 4. Engine rules [done iter1]

- Tile size 48. Tile map chars per area (see §5). Solid `#`, one-way platform `=`, water `~`, spikes-free (no hazards that hurt; "oops" = gentle respawn at last checkpoint with a giggle).
- Player: run 260px/s, jump 640px/s, gravity 1500 (1050 falling… see `PH` in engine.js), double jump always on (0.88× strength) — a 6-year-old needs it from the start, coyote time 0.1s, jump buffer 0.12s, variable jump height. Squash & stretch. Pet follows with delay.
- Camera: smooth follow, clamp to area bounds, look-ahead.
- Interact (✋ / E / tap on thing): talk, open door, pick gem, use toy.
- NPC: idle bob, speech bubble `!` when quest available. Dialogue box with portrait, tap to advance, read aloud.
- Falling off the bottom → respawn at last safe ground with a "Whoops! 🙃" toast (no penalty).
- Water `~`: slow sink (swimGrav 420), jump = swim-hop, splash.
- Tapping an NPC/gate/door/sign on the canvas (within 200px of the player) interacts too.
- Enemies: none that hurt. "Grumpy" characters that block the way until helped (puzzle/quest).
- Gem pickup: touch → sparkle burst → puzzle modal (subject by colour, difficulty from `level[subject]`) → on success gem flies to HUD, `taken[...]=true`; on failure gem wobbles, can retry any time.
- Gate: `needs:{red:2,blue:1}` etc. Shows recipe with gem icons + "have/need". If enough → press ✋ → gems are *shown* (not consumed? **consumed**: yes, spent) → gate opens permanently (`locks[id]=true`). Always ensure the world holds more gems than the total of all recipes (+ spares) so progress can't dead-end.
- Doors (within a scene): "maths door" = door requiring a puzzle (not gems) to pass.

---

## 5. World — areas, characters, stories [todo iter1+]

Each area = `{id, theme, w,h tiles, map[], spawn, entities[], decor[], doors[], music, needs}`. Homage list (original characters evoking the books; **no copied text/art**):

| Area id | Theme | Inspiration | Content |
|---|---|---|---|
| `village` Hazelnut Hollow | village | hub | notice board, toy shop, café sign, wardrobe cottage, fountain, 4 gates out |
| `house` Sleepy House ("Hush House") | house (night-time interior) | *Don't Wake Mum* | tip-toe platforming past a snoring Mum (noise meter: landing noisily raises it; mild reset to bed), creaky stairs, toys on floor; gems in the bath, kitchen, wardrobe; puzzle "hush" doors. Ends with the child tucking Mum in. |
| `cafe` Twiggy Spoon Café | woods edge | *Café at the Edge of the Woods* | forest-folk customers (bear, badger, fox, hedgehog, owl, ogre) order from a menu: **counting, money (£/p), reading orders, handwriting orders**. Cooking mini-game. Tables, teapots, a cosy kitchen. Sandbox: "Run the café". |
| `meadow` Bugglemead | meadow (giant flowers) | *Bettsy Buglove* | bug-collecting: net, magnifier, journal; sort bugs by legs/wings/habitat; beehive, ladybird, snail, butterfly, worm; science gems (green). A kind "Bettsy"-like bug-lover NPC (name it **Bettina Bugbright**) gives quests. |
| `tower` Teapot Tower ("Tall House") | tower (interior, tall vertical level) | *Ottoline* | collector's apartment of curios, **Mr Munroe**-like hairy bog-creature friend ("Mr Tuft" — also a pet option), letters & postcards (reading/handwriting), secret-agent-ish detective tasks (patterns/logic), odd shoes shelf (sorting/pairs), cloud-view balcony. |
| `woods` Whispering Woods | woods | café/Ottoline | glowing paths, fireflies, hidden dens, dark-ish but cosy; needs gems; talking trees; gate to caves. |
| `caves` Crystal Caves | caves | gem-economy | big gem showcase; shapes/time puzzles; minecart ride; deepest recipe gates. |
| `clouds` Cloudtop Kingdom | clouds | finale | rainbow bridges, castle, unlocks golden crown `hat:goldcrown`. |
| `writing` Writing Wood | woods/meadow | handwriting | stylus areas: **letter-tree** per letter, ink-pond for words, sign-painting; leads to `blue` gems. |
| `play_*` Playrooms | sandbox | free play | see §8; reachable from village "Playroom" button and a door in each area. |

### Gate recipes (initial; tune in play)
| Gate | Leads to | Needs |
|---|---|---|
| village→house | Hush House | red×1 |
| village→cafe | Twiggy Spoon Café | blue×1 |
| village→meadow | Bugglemead | green×1 |
| village→writing | Writing Wood | blue×2 |
| cafe→woods | Whispering Woods | red×2, blue×1 |
| meadow→tower | Teapot Tower | green×2, purple×1 |
| woods→caves | Crystal Caves | yellow×2, purple×2 |
| caves→clouds | Cloudtop Kingdom | red×2, blue×2, green×2, yellow×2, purple×2 |

Gem supply target: ≥ 6 gems of each colour reachable before the finale gate, plus replayable "gem trees" that regrow daily.

### Characters (originals)
Mum (sleepy, big hair, humming), Wilf the Fox (café waiter), Mrs Bramble (badger, café owner), Ogden (ogre who loves tiny cakes), Hettie Hedgehog, Professor Hoot (owl), Bettina Bugbright, Mr Tuft (hairy forest friend), Captain Quill (letter-writing duck, Writing Wood guide), Pip the toy-shop mouse, Mole the gem merchant (specs), Rosie Robot (tower helper).

---

## 6. Curriculum & puzzles [todo iter1+]

Puzzle shell: modal card, big read-aloud 🔊 button, answers as large tiles or interactive widget, **gentle retry (never fail)**: 1st wrong → wobble + hint; 2nd wrong → easier hint, 3rd → reveals and still lets her continue (gem is awarded for completion, with an "almost" sparkle; adaptive `level` goes down). Correct streak raises `level`. Year toggle (Y1/Y2/auto).

Types (widgets): `choice` (tiles), `count` (tap objects), `drag` (drop into slots/sort), `order` (tap in order), `number-line`, `clock` (set hands), `coins` (pay exact amount), `build` (assemble word/number), `pattern` (continue), `match` (pairs), `write` (stylus letters/words §7), `draw` (draw a shape / symmetry half).

| Subject | KS1 content by level (0 easiest → 4) |
|---|---|
| maths | 0: count to 10, number bonds to 5 · 1: add/sub within 10, more/less, number bonds to 10 · 2: within 20, missing number, doubles/halves, place value tens/ones · 3: count in 2s/5s/10s, odd/even, ×2/×5/×10 intro, share equally, fractions ½ ¼ · 4: add/sub 2-digit, ordering to 100, word problems, £/p change |
| words | 0: letter sounds, first letter · 1: CVC blending, rhyme, sentence order · 2: digraphs (sh ch th ai ee oa), tricky words (the, said, was…), capital & full stop · 3: plurals, suffixes -ing/-ed, compound words, nouns/verbs/adjectives · 4: spelling by listening, short reading comprehension, punctuation `? !` |
| nature (science) | animals & habitats, plants (parts, growing), seasons & weather, materials (hard/soft, float/sink), human body & senses, living / not living, food chains basics, bugs sorting |
| shapes (geometry, measure, time, money) | 2D/3D names & properties, symmetry, position & direction (left/right, turns), length/mass/capacity compare, time: o'clock, half past, quarter past/to, days/months, money: coin recognition, totals |
| patterns & logic | colour/shape repeats ABAB, ABC, growing, odd-one-out, sorting by rule (Venn-lite), sequences of steps (algorithm), maze path with arrows |

Content is generated parametrically in `curriculum.js` (e.g. `gen.maths.add(level)` returns `{q, say, type, answers, correct, hint}`) with a curated list for words/nature.

---

## 7. Handwriting & drawing (stylus) — HIGH PRIORITY [todo iter1–2]

**Goal:** teach correct letter formation (start point, direction, stroke order, size, baseline), then joining words on lines. Works with stylus (preferred), finger. Uses Pointer Events with `pointerType`, pressure, and palm rejection (if a pen is active, ignore `touch` pointers on the pad).

### 7.1 Letter model
Each glyph defined in a 100×(0..160) coordinate box on the 4-line grid (descender −40…0 baseline … x-height 50 … ascender 100): ordered **strokes**, each a polyline of waypoints with a start dot. Child-friendly **print** letters ("pre-cursive" with exit flicks is a setting, default plain print, as taught in most UK Reception/Y1). Cover a–z, A–Z, 0–9, with the standard school stroke orders, e.g.:
- `a`: anticlockwise round starting at ~1 o'clock, then down the right-hand line
- `d`: round (as for `a`) then ascender line up and down; `b`: down the line, then bump
- `c`,`e`,`o`,`g`,`q`,`s` start top-right/centre going anticlockwise… (full table lives in `js/handwriting.js` `GLYPHS`; keep this table in sync)
- `t`,`f`: down, then cross; `k`,`x`,`v`,`w`,`y`,`z` etc. per standard
- digits 0–9 standard strokes; capital letters one-stroke-per-line rules.

### 7.2 Recogniser (no ML, deterministic)
For a drawn stroke S and the expected stroke E (resampled to N=32 points, scaled to the pad's glyph box):
1. **Start**: distance(S[0], E[0]) ≤ tolerance (≈ 0.22·height).
2. **Direction/Shape**: mean point-wise distance after alignment ≤ tol, with Hausdorff max ≤ 1.6·tol; reversed stroke (end↔start closer) → flagged "wrong direction".
3. **Order**: strokes must be drawn in expected order; extra/missing strokes flagged.
4. **Size/baseline**: bbox sits on the baseline, x-height/ascender within ±25%.
5. Score 0..1 and a **coach message** keyed to the first failure ("Start at the top!", "Go the other way round", "Sit on the line", "Make it taller").

### 7.3 Challenge modes (ladder; each is also a puzzle `type:'write'`)
1. **Watch & trace** — animated pen shows the stroke order; child traces over a dotted guide; green ink on success; start dots pulse.
2. **Fading guide** — guide fades to start dot only.
3. **From memory** — "Write the letter that says /s/" / hear name → write on lines; compare to glyph.
4. **Words on lines** — CVC/word writing from picture/audio ("Write: cat"): per-letter segmentation by x-gaps, each letter recognised in turn; spacing and baseline feedback; sits on 4-line paper with a ruled baseline.
5. **Sentence** (Y2): capital letter + finger spaces + full stop.
6. **Drawing**: trace/complete shapes, symmetry, number formation, "draw a pattern", sign-painting; freeform **art easel** in playrooms with brushes, stickers, undo.

Writing success gives blue gems / coins / sticker-book pages; progress `handwriting[char]` shown to grown-ups only.

Accessibility: left-/right-handed toggle (pad offsets), generous tolerance setting, "wobbly lines are fine" on shape-only tasks.

---

## 8. Free-play sandboxes [todo]

No goals, no failure, gentle sounds. Each playroom = a scene with toys the avatar can pick up/place/drag; items are emoji/procedural sprites. State persists in `playsets`.

| Playroom | Toys / actions |
|---|---|
| Café | menu board, make tea/cakes, take orders (write them!), customers (animal folk), tills & coins |
| Vet Clinic | animal patients (cat, dog, bunny, owl, dragon!), stethoscope, bandages, thermometer, feeding, wash, X-ray; they get better with sparkles |
| Witch's Kitchen | cauldron, ingredients, mix potions (colours), spells with wand, pet toad/cat, broom |
| Dolls' House | rooms, furniture, little people, move/arrange, day→night |
| Bug Garden | place bugs/flowers, net, jar, magnifier |
| Shop | scales, coins, price tags, shopping basket |
| Art Studio | stylus easel (§7.3), stickers, stamps, save gallery |
| Music Room | xylophone, drums, bells; record & replay; patterns |
| Dress-up Wardrobe | the character creator on a stage with a mirror and quick jobs (§9) |
| Builder's Yard | blocks, cars, train track |

---

## 9. Character customisation [done art / todo UI]

`G.OPTS` lists all options (see `art.js`): 8 skin tones (incl. fantasy), 11 hair colours, 11 hair styles, 8 outfits, 14 colours ×2, 11 chest motifs, 22 hats, 9 back items (cape/wings…), 16 held items, 9 face items, 12 pets. **Presets** (`G.PRESETS`) = 18 jobs: Witch, Vet, Fairy, Astronaut, Knight, Pirate, Chef, Explorer, Superhero, Princess, Wizard, Bug Hunter, Firefighter, Artist, Ballerina, Kitty, Doctor, Party — one tap applies, then everything can be tweaked.
Locked cosmetics (`G.LOCKED`) are unlocked via quests/shop/finale and live in `S.owned`.
Creator UI: big preview with idle animation (wave on tap), category tabs with icon swatches, randomise 🎲, name entry (stylus handwriting optional), reachable any time from the 👗 HUD button.

---

## 10. UX for a 6-year-old on a tablet

- Min tap target 56px; HUD buttons 64px; spacing generous; no hover-only UI.
- Everything important is spoken; icons + words; numerals shown with ten-frames/objects.
- Touch controls: left thumb ◀ ▶, right thumb ✋ ⬆; or **tap-to-walk** (tap ground to go) as alternative control `[idea]`.
- Orientation: landscape; if portrait show "turn me" screen.
- Prevent accidental gestures: `touch-action:none`, `overscroll-behavior:none`, no text selection, no context menus; fullscreen button; `viewport-fit=cover`.
- Settings (⚙️ behind a hold-for-2s "grown-ups" gate): music/sfx/speech, year level, handedness, writing tolerance, reset progress, progress report.

---

## 11. Deployment & tooling

- `.github/workflows/pages.yml`: on push to `main` or the dev branch → stamps `js/build.js` → deploys repo root to GitHub Pages. (One-time: repo Settings → Pages → Source: GitHub Actions.)
- `tools/check.sh` / `tools/check.js`: headless boot test + screenshots (tablet 1180×820, phone 844×390).
- Optional later: service worker + web manifest for offline "Add to Home Screen" `[todo]`.

---

## 12. Story sources (extend as owner adds books)
- *Don't Wake Mum* → Hush House
- *The Café at the Edge of the Woods* → Twiggy Spoon Café, Whispering Woods
- *Bettsy Buglove* → Bugglemead, bug journal
- *Ottoline* series → Teapot Tower, Mr Tuft, curios, letters

---

## 13. Backlog (ranked; loop picks from the top)

1. **[done iter1] Boot slice**: `style.css`, `main.js`, `engine.js`, `world.js` (village only), HUD, title + character creator → player can walk/jump around the village with the avatar. *Smoke test green.*
2. **[done iter1] Gem + puzzle loop**: `curriculum.js` (maths L0–2, words L0–1), `puzzle.js` shell (choice/count), gem pickup → puzzle → HUD, first gate (village→house).
3. **[todo] Handwriting v1 → Writing Wood**: `handwriting.js` is done (iter1); still needed: the `writing` area with Captain Quill, letter-family lessons (§7.3 ladder), handwriting progress in a journal; blue gems via writing; works with stylus pointer events.
4. **[todo] Hush House** level (noise meter, Mum snoring) with maths door puzzles.
5. **[todo] Twiggy Spoon Café** story + order-taking (count/money/read/write) + Run-the-café sandbox.
6. **[todo] Wardrobe/creator UI polish** with all presets and locked items.
7. **[todo] Bugglemead** + bug journal + science puzzles.
8. **[todo] Words on lines** handwriting (CVC words), sentence writing.
9. **[todo] Teapot Tower** vertical level; letters & curios; sorting/pattern puzzles.
10. **[todo] Playrooms**: vet, witch kitchen, dolls' house, art easel.
11. **[todo] Woods, Caves, Clouds** + final gates, finale, golden crown.
12. **[todo] Grown-up page**, offline PWA, accessibility settings, polish pass (juice, music, particles).

---

## 14. Iteration log

**iter0 — set-up (this commit).** Wrote AIM/LOOP/SPEC/CLAUDE.md, CI deploy workflow, smoke test. Already drafted engine foundations: `core.js`, `audio.js`, `art.js` (avatar with ~150 customisation options + creatures + gems), `scenery.js` (7 themes, ~60 props, doors/gates). Owner added: tablet + stylus, handwriting/letter-formation as a priority (§7). Next: backlog #1 and #2, using sub-agents for bulk content.

**iter1 — playable village.** Wrote style.css, world.js (village), engine.js, ui.js (HUD, dialogue, gate recipe card, character creator with 14 tabs + 20 job presets, settings with 2-second hold to reset), puzzle.js (choice / order / write; never fails: hint → hint → reveal and keep the gem), main.js (letterbox fit, title over a panning village, debug steps). Sonnet agents wrote handwriting.js (62 glyphs, deterministic recogniser, coach messages, demo/fade guides, 310/310 synthetic tests) and curriculum.js. check.js now runs `G.debug.steps` and screenshots each (walk, talk, maths, words, write, gate, creator, settings). Feedback: 0 issues. Next: Writing Wood area (backlog #3), Hush House (#4).
