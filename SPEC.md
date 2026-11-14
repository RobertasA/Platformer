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
| `js/curriculum.js` generators (80 generators over 5 subjects, L0–4, `selfTest()` clean) | [done] iter3 |
| `js/lessons.js` + `writing` area (Writing Wood) | [done] iter2 |
| `house` area (Hush House: noise meter, creaky boards, squeaky toys, maths doors, tuck Mum in) | [done] iter3 |
| `cafe` area + `js/cafe.js` order cards (Twiggy Spoon Café, §7.2d) | [done] iter4 |
| Wardrobe polish (NEW badges, lock hints, undo, My outfits) + Pip's toy shop `G.UI.shop` (§9) | [done] iter5 |
| `meadow` Bugglemead + `js/meadow.js` + `js/bugart.js` (§7.2e) | [done] iter6 |
| Sentence Shore, capitals & digits trees, journal Writing tab (§7.2f) | [done] iter7 |
| `tower` Teapot Tower + `js/tower.js` (§7.2g) | [done] iter8 |
| `woods` + `js/woods.js`, `caves` + `js/caves.js`, bounce/raft/pick/dark (§7.2h) | [done] iter10 |
| `clouds` + `js/clouds.js`, finale `js/finale.js`, grown-ups page (§7.2i) | [done] iter11 |
| `js/sandbox.js` toy box + `js/play-*.js` playrooms (potion, vet, dolls, art) + world map (§8) | [done] iter9 |

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

## 7. Handwriting & drawing (stylus) — HIGH PRIORITY [building: pad + Writing Wood done]

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

### 7.2b Writing Wood (iter2)
Area `writing` (woods theme, 64×15) reached through the village gate (blue×2). Captain Quill explains. Entities `k:'lesson'`:
- **Letter trees** (UK letter families): Curly caterpillar `cadgoqe` 🐛, Long ladder `litujy` 🪜, One-armed robot `rnmhbkp` 🤖, Zig-zag monster `zvwxsf` ⚡. A visit = 4 random letters from the family.
- **Word stones** 🪨: CVC words (cat, dog, sun…) and CCVC/CVCC words (fish, ship, frog…) with a picture emoji; 3 words a visit, first traced, then fading guide.
- Per-letter mode (`G.LS.modeFor`): `trace` → `fade` once best score ≥ 0.7 → `memory` once best ≥ 0.85 over ≥ 3 tries (`S.handwriting[ch]`).
- First completion → blue gem (+ ⭐ on the board, `S.quests['lesson:<id>']` counts visits); repeat → +2 coins. Closing a puzzle ends the visit with no penalty. Lessons do not change `S.level.words` (`noAdapt`).
- Area also has 5 ordinary gems (blue×2, purple, green in the ink pond, yellow) and a door 🏡 back to the village gate.

### 7.2c Hush House (iter3) — built as `house` in world.js; rules live in engine.js `updateHush`
- Area flag `hush:true` shows `#noisebar` (🤫 → 😴) and lowers top walking speed to 75% (tiptoe). `E.noise` runs 0…1.
- Noise sources: walking on a `creak` span (x0..x1 tiles, +0.42/s, "creak!" pop-up), stepping on a `squeak` toy (+0.22, 1.5 s cool-down), any landing (+0.05, more for long falls). Quiet decays −0.07/s. Shelves above each creaky span are the quiet route.
- At 0.7 a toast warns "Shh! Mum is stirring…" and Mum looks 😟. At 1.0 she murmurs, the screen fades, the player returns to the last 🌙 `check` night-light passed, noise → 0. No lives, no fail.
- `mdoor` maths doors (3) are full-height walls until solved: ✋ → "Number lock" line → red maths puzzle (`G.PZ.run({colour:'red'})`, adaptive). Solved → `S.locks[id]`, stays open. Closing the puzzle leaves it shut.
- Goal `mum` (bed with snoring Mum): ✋ → two lines → `S.quests.hush`, +1 yellow gem, +5 coins, unlocks `held:lantern`. Afterwards: "Sweet dreams, Mum."
- Layout (64×15): kitchen → door1 → hall (duck, frog toy) → door2 → sitting room (bookcase climb) → door3 → bedroom. Gems: red×2, yellow, purple on shelves. Door 🏡 back to the village gate.

### 7.2d Twiggy Spoon Café (iter4) — `cafe` in world.js; order cards in `js/cafe.js` (`G.CAFE`)
- Area `cafe` (56×15, theme `cafe`: warm cream wallpaper with gingham stripes, honey floorboards, dusk woods through the windows). Door 🏡 back to the village café gate. Gate 🌲 `gate-woods` (needs red×2, blue×1) to Whispering Woods (not built yet → "still being built").
- **Mrs Bramble** (badger, chef hat) runs the café; **Wilf** (fox) carries the plates. Intro: "Welcome to the Twiggy Spoon! I am Mrs Bramble." / "Our customers are hungry. Tap a customer to take their order." / "Serve all four and you can be a real waiter!"
- Customers `k:'cust'` sit at tables. Each has a fixed story order `kind` and a speech bubble above (🧁 count, 📜 read, 🪙 money, ✏️ write; 💖 when served).
  | id | who | kind |
  |---|---|---|
  | `cf-bear` | Barnaby Bear (bear, scarf) | count |
  | `cf-hettie` | Hettie Hedgehog | read |
  | `cf-hoot` | Professor Hoot (owl) | money |
  | `cf-ogden` | Ogden (ogre, napkin) — loves tiny cakes | write |
- **Order cards** `G.CAFE.order(cust)` → Promise<{ok}> (same never-fail rules as puzzles: wrong → wobble + hint, 3rd wrong → show the answer and still serve; ✕ closes, nothing lost). Levels follow `S.level.maths` (count, money) and `S.level.words` (read, write) and adapt via `G.PZ.adapt`.
  - **count** "I would like N acorn cakes, please!" — tap 🧁 on the tray to put them on the plate, tap a plate cake to put it back, **Serve**. N: L0 2–4, L1 3–6, L2 5–10, L3+ 5–9 plus "and one more" (N+1). Tray holds N+3 cakes (max 12).
  - **read** a ticket shows a food word; pick the matching picture from 3. Words (`CAFE.EASY`, L0–1): egg, tea, pie, nut, ham, bun, cup; (`CAFE.HARD`, L2+): cake, milk, soup, toast, honey, apple, pear, bread, cheese. (No jam/fig/peas: their emoji are unreliable on tablets.)
  - **money** "A bun / cup of tea / slice of pie / cake / honey toast costs Np. Can you help me find the coins?" — tap coins (1p, 2p, 5p, 10p) into the purse, tap a purse coin to take it out, **Pay**. N: L0 2–5 (1p, 2p only), L1 3–10 (+5p), L2+ 6–20 (+10p). Any coin mix that adds up is right (purse max 14 coins). Reveal = greedy coins (`CAFE.payWith`). The chalkboard prices are decor only.
  - **write** "I want a W, please! Can you write it on your notepad?" — handwriting pad with the word; mode by words level: L0 trace, L1 fade, L2+ memory — and at L2+ the order shows the picture instead of the word. Words: `CAFE.EASY`.
- Rewards: each served order +2 coins, 💖 bubble. Serving all four story orders → `S.quests.cafe`, +1 blue gem, unlocks `hat:chef`, banner "Super waiter! ☕".
- **Run the café** (free play, after the story): each customer re-orders 25 s after being served, with a random kind; +2 coins each. No end, no failure.
- Gems on the café shelves: blue, red, green, purple. Music: `village`. On finishing the story the other customers re-order after 8 s.
- [todo] cooking mini-game (stir, pour, decorate cakes).

### 7.2e Bugglemead (iter6) — `meadow` in world.js; bug cards, sorting hoops, journal in `js/meadow.js` (`G.MEAD`); bug art in `js/bugart.js` (`G.drawBug`)
- Area `meadow` (90×15, theme `meadow`, giant flowers, leaf platforms, a hive, log pile, pond). Door 🏡 back to the village (arrives by the Bugglemead gate). Gate 🫖 `gate-tower` (green×2, purple×1) → Teapot Tower (not built yet).
- **Bettina Bugbright** (bug-lover, net, glasses): "Hello! I am Bettina Bugbright. I love bugs!" / "Bugs live all over the meadow. Tap a bug to look at it with your magnifier." / "Count their legs, then let them go home. Find six bugs for a prize!" Later visits: progress line ("You have found N bugs. M more to find!").
- **Bugs** `k:'bug'` (10 kinds, `G.BUGS`): crawlers walk to and fro in a small range; flyers (`fly:true`) bob in the air. Data (curriculum-checked):
  | kind | legs | wings | home | fact |
  |---|---|---|---|---|
  | ladybird | 6 | yes | leaves | Ladybirds eat tiny greenfly. |
  | bee | 6 | yes (4) | hive | Bees visit flowers and make honey. |
  | butterfly | 6 | yes (4) | flowers | A butterfly was once a caterpillar. |
  | snail | 0 | no | damp leaves | A snail carries its shell on its back. |
  | worm | 0 | no | soil | Worms mix the soil and help plants grow. |
  | spider | 8 | no | web | A spider is not an insect. It has eight legs. |
  | ant | 6 | no | nest | Ants work together in a big team. |
  | grasshopper | 6 | yes | long grass | Grasshoppers can jump a long way. |
  | woodlouse | 14 | no | under logs | A woodlouse rolls into a ball to stay safe. |
  | dragonfly | 6 | yes (4) | pond | Dragonflies lay their eggs in ponds. |
- **Magnifier card** `G.MEAD.look(kind)`: big animated bug in a magnifier ring, name (read aloud), one question by `S.level.nature`: L0 legs ("How many legs?" 3 number choices), L1 wings (Yes/No), L2+ legs, wings or home (3 picture choices). Never fails (hint → hint → reveal). Then the fact is read and a "Let it go 🍃" button. First look → `S.bugs[kind]=true`, "New bug for your journal!", +1 coin. Repeat looks → +0, still fine.
- Rewards: 6 kinds → `G.unlock('hat:antennae')` + green gem; all 10 → `G.unlock('back:beewings')` + purple gem; banners "Bug spotter! 🐞" / "Bug expert! 🐝".
- **Sorting hoops** `k:'sorter'` next to Bettina → `G.MEAD.sort()`: 5 bugs to sort into hoops; tap a bug then a hoop. L0–1: legs (No legs / 6 legs / 8 legs; woodlouse never used). L2+: alternates legs with wings (Wings / No wings). Wrong → wobble + hint ("Count the legs!"); 3rd miss on a bug → it hops into the right hoop. Finish → first time green gem (`S.quests.sort`), then +2 coins.
- **Bug journal** (📖 HUD button) `G.UI.journal()`: grid of all 10 bugs — found ones drawn in colour with name (tap: name + fact read aloud); unfound ones as silhouettes with "?". Header "N of 10 bugs".
- Gems: green×3 (nature puzzles), red, yellow, purple on the platforms.

### 7.2f Sentence Shore + capitals & digits (iter7) [done] — east end of `writing` (area widened 64 → 80)
- **Full stop glyph** `'.'` (w 20, one dot at the baseline). Recogniser: a glyph with no main strokes passes when any small mark (bbox < 30 units) lands near the dot; nothing drawn → "Don't forget the full stop!".
- **Capital castle** tree (`lt-caps`, x37 on the mossy bank): `letters:` all of A–Z (4 picked per visit); same trace → fade → memory ladder per letter. Say: "Capital letters are tall. They start at the top line."
- **Number nest** tree (`lt-digits`, x65): `letters:'0123456789'`. Say: "Number letters! Start at the top."
- **Sentence stone** (`ss-1`, x75, a big stone with a ✏️): `sentences:[[text, emoji], …]` — e.g. "I can run.", "A cat sat.", "I see a bus.", "The dog ran.", "I am six.", "Mum is up.". 2 sentences per visit: first traced, second faded. Prompt reminds: capital at the start, finger spaces, full stop at the end. Finger spaces are the pad's existing 36-unit gaps (drawn as a pale finger-tip oval under the line in each gap). First finish → blue gem; repeats +2 coins.
- **Journal Writing tab**: 📖 journal gets two tabs, 🐞 Bugs | ✏️ Writing. Writing shows a grid of a–z (and A–Z, 0–9 rows when any tried): each cell the letter + 0–3 stars from `S.handwriting[ch].best` (≥0.5 ★, ≥0.7 ★★, ≥0.85 ★★★); untried letters faint. Tap → says the letter. No percentages (grown-up detail stays for the grown-up page, #12).
- Area: right wall moves to x79; a leaf platform at 68–70 row 9 with a blue gem; a sign "Sentence Shore" at x70.

### 7.2g Teapot Tower (iter8) — `tower` in world.js (32×48, vertical); cards in `js/tower.js` (`G.TOWER`)
A tall, cosy collector's house (Ottoline homage). Five floors joined by zig-zag stairwells of shelf steps (2 rows apart, so one jump each). Feet rows: ground 45, F1 37, F2 29, F3 21, balcony 13 (open sky above). Arrive at ground floor from the meadow gate; 🏡 door back to the meadow.
- **Mr Tuft** (`G.PEOPLE.tuft`, hairy creature `cre:'tuft'`) on the ground floor: friendly, shy, loves curios. Lines depend on progress (`G.TOWER.tuftLines()`).
- **Curios** `k:'curio'` (6: 🐚 shell, 🗝️ key, 🪶 feather, 🧭 compass, 🔮 marble, 🦴 fossil) tucked on every floor and step. Touch to collect (no puzzle) → `S.curios[id]`, sparkle, toast "You found a shell!". Drawn bobbing with a glow.
- **F1 Odd shoes shelf** `k:'shoes'` → `G.TOWER.shoes()`: memory pairs. Cards face down; tap two; matching shoe pair stays up. L0 (`level.patterns` 0) 3 pairs, L1 4 pairs, L2+ 6 pairs. Shoes are emoji (👟 👞 👠 🥾 👡 🩰 🧦 🩴). No fail state; after 4 mismatches in a row the next pair glows briefly. Finish: first time purple gem (`quests.shoes`), later +2 coins.
- **F2 Postcard desk** `k:'post'` → `G.TOWER.postcard()`: a postcard from a friend (picture + 1–2 short sentences, read aloud): question with 3 picture answers (hint → hint → reveal), then "Write back!" one word from the card on the pad (fade mode, `G.HW.mount`). First time blue gem (`quests.post`), later +2 coins.
- **F3 Detective case** `k:'case'` → `G.TOWER.case()`: "Crack the code!" 3 pattern puzzles in a row via `G.PZ.run({colour:'purple', subject:'patterns'})`. First time: `hat:detective` + yellow gem (`quests.case`), later +2 coins.
- **Balcony curio cabinet** `k:'cabinet'` → `G.TOWER.cabinet()`: 6 shelf cubbies; found curios shown, missing as "?". All 6 found (first time) → unlock `pet:tuft` ("a little Tuft") + green gem (`quests.curios`).
- Gems on steps/shelves: red, blue, green, yellow, purple ×1 each.
- Save: `S.curios` (new key in `blank()`).

### 7.2h Whispering Woods and Crystal Caves (iter10) [done]
New engine pieces (all in `engine.js`):
- **Bounce** `k:'bounce'` (`look:'mushroom'|'crystal'`, `pow` default 900): landing on its cap flings the player up about 5½ tiles (a double jump is still allowed after). Every bounce also has an ordinary stepped route, so nothing *needs* it.
- **Raft** `k:'raft'` (`x0`,`x1` tile range, `w` tiles wide, default 3, `speed` px/s default 50): a platform that glides to and fro on the water; the player stands on it and is carried. Only ever over swimmable water.
- **Pick-ups** `k:'pick'` (`set`, `icon`, `name`, optional `fly`): touched to collect, like curios; saved in `S.picks[id]`. `G.pickCount(set)` → `{have, total}` over all areas. Toast "You found a firefly! 2 of 5".
- **Darkness** `area.dark` (0–1): a dark wash over the world with soft holes of light round the player (radius 190, or 300 when holding the lantern), gems, pick-ups, characters, doors, chimes and the nest.
- NPC lines by name: `e.lines` → `G.NPC_LINES[name]()`.
- A bounce sets `P.flung` so the variable-jump cut does not shorten it (cleared when the player starts to fall).
- As built in the cards: the trail reward comes after the fox finishes walking; L2 routes are always 1 square then 2 at right angles; crystals answer on `pointerdown`; `G.WOODS.makeTrail(level)` and `G.CAVES.makeTune(n)` are pure generators for tests.

**Whispering Woods** `woods` (100×15, theme woods, `dark: 0.3` dusk). Door back to the café. **Rosie Rabbit** the ranger (`G.PEOPLE.rosie`, bunny + scarf) asks you to find **five fireflies** (`pick`, set `fireflies`); when all five are found she gives a yellow gem (`quests.fireflies`). Two streams with rafts, a bouncy mushroom up to a tree branch, hollow-log steps.
- **Trail signs** `k:'trail'` ×3 → `G.WOODS.trail(e)`: a little picture map (5×4 grid of landmarks, compass rose, fox token). L0 (`level.shapes` 0): one step — "Start at the camp. Go north. What do you find?"; L1: two squares one way; L2+: two legs ("Go 1 north, then 2 west"). Three picture answers; the fox walks the route when answered; hint → hint → reveal. First time at each sign: gem of the sign's `col` (`quests['trail:'+id]`), later +2 coins.
- **Campfire story** `k:'story'` → `G.WOODS.story(e)`: one of 6 four-card picture stories, shuffled; tap the cards in order to fill four slots; wrong card wobbles with a hint; when complete the story is read aloud card by card. First time purple gem (`quests.story`), later +2 coins.
- Gems: red (branch), blue (logs), green ×2 + yellow (trail signs), purple (story), yellow (fireflies). Gate to the caves at the far end: yellow 2, green 2.

**Crystal Caves** `caves` (90×15, theme caves, `dark: 0.72`). Door back to the woods. **Mole** (`G.PEOPLE.mole`) explains the dark and the lantern. An underground lake with a raft, a crystal bounce, ledges.
- **Crystal chimes** `k:'chime'` ×3 → `G.CAVES.chime(e)`: five glowing crystals (notes C D E G A, `G.note`). The cave plays a tune (3 notes at `level.patterns` 0, 4 at 1, 5 at 2+); tap the crystals to play it back. A wrong note → "Listen again" and a replay; after 3 misses the crystals show the order as numbers. Free play afterwards. First time at each chime: gem of its `col` (`quests['chime:'+id]`), later +2 coins.
- **Dragon nest** `k:'nest'` → `G.CAVES.nest(e)`: the egg is cold; find **three warm stones** (`pick`, set `embers`). With all three: the egg wobbles, cracks and hatches → `pet:dragon` + red gem (`quests.dragon`). Later visits: the baby dragon says hello.
- Gems: blue, purple, yellow (chimes), yellow (ledge), green (in the lake), red ×2 (floor, nest). Gate to Cloudtop Kingdom at the far end: red 3, yellow 3, purple 2.

### 7.2i Cloudtop Kingdom, the finale and the grown-ups page (iter11) [done]
**Cloudtop Kingdom** `clouds` (90×24, theme clouds). Arrive from the caves gate; door back to the caves. Fluffy cloud platforms climb up and to the right to the Cloud Castle; cloud bounces (`look:'cloud'`); a solid cloud floor runs along the bottom so nobody can fall out. **Luna the unicorn** (`G.PEOPLE.luna`, `cre:'unicorn'`) greets you and says what the castle needs (`G.CLOUDS.lunaLines()`).
- **Weather station** `k:'weather'` → `G.CLOUDS.weather(e)`: 3 rounds. A window shows the weather (sunny and hot, rainy, snowy, windy, frosty, stormy) with a thermometer; pick the right thing for teddy to wear/take from 3 pictures (sun hat, umbrella, woolly hat and scarf, kite, mittens, wellies…). Hint → hint → reveal. First time blue gem (`quests.weather`), later +2 coins. Adapts `nature`.
- **Star counter** `k:'stars'` → `G.CLOUDS.stars(e)`: place value, 3 rounds. Stars shown in ten-frames (full frames = tens) plus loose ones; "How many stars?" with 3–4 number answers; L0 (`level.maths` 0) 6–15, L1 11–29, L2+ 20–59 and the question alternates with "How many tens?". On the answer the tens and ones are spoken ("2 tens and 4 ones make 24"). First time yellow gem (`quests.stars`), later +2 coins. Adapts `maths`.
- **Rainbow maker** `k:'rainbow'` → `G.CLOUDS.rainbow(e)`: seven colour jars; tap them in rainbow order (red, orange, yellow, green, blue, indigo, violet) to paint each arc of a big rainbow from the outside in. A wrong jar wobbles; a hint names the next colour; after 2 misses the right jar glows. First time purple gem (`quests.rainbow`), later +2 coins. Once done a rainbow arcs over the castle in the level.
- Gems on the clouds: red ×2, green ×2, yellow, blue.
- **Cloud Castle** `k:'castle'` → `G.FINALE.castle(e)`: the royal door needs **5 red, 5 blue, 5 green, 5 yellow and 4 purple** gems (gems are never spent). Not enough: a card shows the five counts with ticks and says which colours are still needed ("Gems hide in every land. Look at the map!"). Enough → **the party** (`G.FINALE.party()`): a hall with all the friends she has met (portraits via `G.portrait`), bunting and confetti; three short spoken lines; then "Sign the royal book": she writes her own name on the handwriting pad (`G.HW.mount`, fade mode; if the name is empty or has characters the pad cannot do, the text is "I did it"); then the crown: `G.unlock('hat:goldcrown')`, `quests.finale`, fanfare, "You are the hero of Hazelnut Hollow! Keep playing — the playroom and all your friends are still here." Later visits replay the party without the reward.

**Grown-ups page** `G.UI.grownups()` — from Settings → "For grown-ups 🔒" (hold the button for 2 seconds). Plain text, not shown to the child as scores: puzzles solved; level per subject with a one-line meaning; handwriting — letters practised, letters with ≥ 2 stars, and the five weakest letters to practise; quests finished; areas visited; gems by colour; playroom counts (potions, pets cured, pictures saved). Controls: handwriting strictness (gentle / normal / strict → `settings.writeTol` 1.3 / 1 / 0.8), left-handed pad. (Reset progress stays in Settings, hold 2 s.) Finishing the party also gives 20 coins. A line on how to send feedback (GitHub issue labelled `feedback`).

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

## 8. Free-play playrooms [done iter9: toy box + 4 rooms]

No goals, no scores, no failure, gentle sounds. Opened from the HUD 🧸 button or the playroom door in the village (`G.SB.open()`).

### 8.1 Framework — `js/sandbox.js` (`G.SB`)
- `G.SB.register(id, { name, icon, col, blurb, mount(stage, api) })` — a room module registers itself at load. `mount` builds the room inside `stage` and may return `{ destroy() }` (stop timers/audio, remove window listeners).
- `G.SB.open(id?)` — pauses the game, hides the HUD, fills the overlay with `.sbwrap`. No id → the **toy box**: one big card per room (icon, name, blurb), ✕ to leave. With an id → that room: a `.sbstage` div exactly **1280×720** logical px (the overlay is already scaled to fit the screen) with a ⬅ back button (top-left, 84×84; rooms keep the top-left 110×100 clear) that returns to the toy box.
- `api`: `state` (plain object persisted at `G.S.playsets[id]`; mutate then call `api.save()`), `save()`, `say(text)`, `sfx(name)`, `W` 1280, `H` 720, `pos(evt)` → `{x, y}` in stage px from a pointer event, `spark(x, y, emoji?)` (a little burst of ✨ at stage x,y), `drag(el, { onStart, onMove(x, y), onEnd(x, y) })` (pointer-capture drag helper that reports stage px).
- Rooms are plain DOM/canvas inside the stage; every interactive thing ≥ 64px; Pointer Events only; `touch-action:none` on draggable/drawable things. Each room has its own stylesheet `css/play-<id>.css` and script `js/play-<id>.js` (loaded after `sandbox.js`).

### 8.2 Rooms [done iter9]
| id | Room | What you can do |
|---|---|---|
| `potion` | **Potion Kitchen** 🧪 (witch) | Shelf of 8 ingredient jars (🍓 red, 🍋 yellow, 🫐 blue, 🍃 green, 🌸 pink, ⭐ sparkle, 🕷️ spooky, 🧊 ice). Drag or tap one into the big cauldron: plop, the liquid **mixes like paint** (red + yellow → orange, blue + yellow → green, red + blue → purple, everything → muddy brown; ice lightens, spooky darkens, sparkle adds glitter) and bubbles. Drag the spoon round to stir (swirl). Tap the wand ✨ to cast: the pet toad beside the cauldron gets a silly effect chosen from the potion (turns its colour, grows huge, shrinks, floats, spots, party hat, rainbow) and says a line ("Ribbit! I am orange!"). Tap an empty bottle to bottle the potion (up to 8 kept on a shelf, `state.bottles` = colours; tap a full bottle to pour it back / empty it). 🪣 empties the cauldron. `G.S.stats.potions++` per cast. |
| `vet` | **Vet Clinic** 🩺 | Waiting bench of 5 patients (cat, dog, bunny, owl, dragon — drawn with `G.drawCreature` on small canvases), each with a thought bubble showing what is wrong: 🤒 poorly (thermometer, then medicine), 🩹 sore paw (bandage), 🦠 mucky (sponge → bubbles), 😋 hungry (food bowl), 💤 can't sleep (cuddle/blanket). Tap a patient → it hops onto the table. Tool tray: 🩺 stethoscope (heartbeat sound, a pulsing heart), 🌡️ thermometer (shows a number), 💊 medicine, 🩹 bandage (sticks where dropped), 🧼 sponge (rub for bubbles), 🥕 food, 🧸 cuddle. Any tool works on any patient and does something cute; the *helpful* tool clears the bubble: sparkles, "Thank you, vet!", patient goes back to the bench with 💖 and gets a new worry a little later. `G.S.stats.vet++` per cure. |
| `dolls` | **Dolls' House** 🏠 | A cut-away house with 6 rooms (attic, bedroom, bathroom, kitchen, living room, garden). A scrolling drawer of ~36 stickers (furniture, people, pets, food, toys). Drag from the drawer into the house; drag to move; drop on the bin to remove; tap = wobble + its name spoken. 🌞/🌙 switch: night dims the house, windows and lamps glow, stars come out. Persisted `state.items` = `[{ch, x, y}]` (max 60), `state.night`. |
| `art` | **Art Studio** 🎨 | A big paper canvas for the stylus: pressure-aware round brush, 12 colours, 3 sizes, 🌈 rainbow brush, ✨ glitter brush, eraser, 🪞 mirror (left-right symmetry) toggle, emoji stamps (12), 3 papers (white, cream, night-blue), ↩ undo (10 steps), 🗑 clear, 💾 save to gallery (6 slots, `state.gallery` = JPEG data URLs ≤ 640×360; tap a thumbnail to load it back). |

As built: bottling does not use up the potion (fill several bottles from one brew) and pouring a bottle back blends its colour in; casting on an empty pot only prompts "Add magic first!". The toad is its own SVG so CSS can tint/scale it. Cast effect by colour: red huge, orange tint, yellow/white float, green/brown spots, blue/black tiny, purple rainbow, pink party hat. In the vet a poorly pet's bubble turns to 💊 after the thermometer; medicine first makes the thermometer wiggle. Dolls' house: the garden is a strip beside the house, the drawer scrolls sideways and a sticker lifts out when dragged upwards; a new house starts with six stickers.

Later rooms [todo]: café (free play), bug garden, shop, music room, builder's yard.

### 8.3 World map [done iter9] — `G.UI.map()`
HUD 🗺️ opens a picture map: one round badge per area on a winding path (village, Hush House, café, Bugglemead, Writing Wood, Teapot Tower, Whispering Woods, Crystal Caves, Cloudtop Kingdom). Visited areas (`S.areas[id]`) are in colour and can be tapped to travel there (arrive at the area's spawn); unvisited ones are grey with a 🔒 and say "Find the gate first!". The current area has a "You are here" bounce.

---

## 9. Character customisation [done art / todo UI]

`G.OPTS` lists all options (see `art.js`): 8 skin tones (incl. fantasy), 11 hair colours, 11 hair styles, 8 outfits, 14 colours ×2, 11 chest motifs, 22 hats, 9 back items (cape/wings…), 16 held items, 9 face items, 12 pets. **Presets** (`G.PRESETS`) = 18 jobs: Witch, Vet, Fairy, Astronaut, Knight, Pirate, Chef, Explorer, Superhero, Princess, Wizard, Bug Hunter, Firefighter, Artist, Ballerina, Kitty, Doctor, Party — one tap applies, then everything can be tweaked.
Locked cosmetics (`G.LOCKED`) are unlocked via quests/shop/finale and live in `S.owned`.
Creator UI: big preview with idle animation (wave on tap), category tabs with icon swatches, randomise 🎲, name entry (stylus handwriting optional), reachable any time from the 👗 HUD button.

**iter5 wardrobe polish + toy shop** [done iter5]
- `G.unlock(key)` sets `S.owned[key]` and marks it new in `S.fresh[key]`. A new item shows a ✨NEW badge on its chip (and a dot on its tab) until that tab is opened.
- Locked chips say how to get them: shop items → "Pip sells this in the toy shop for N coins!"; quest items → `G.UNLOCK_HINT[key]` (chef hat: "Serve the customers at the café!", lantern: "Tuck Mum in at Hush House!", gold crown: "Finish the whole adventure!") else "Help a friend to win this!".
- Tab name shown above the swatches. ↩️ Undo button (stack of avatar snapshots) next to 🎲.
- 🧺 **My outfits** tab: 3 hangers in `S.outfits` (array of avatar objects). Tap a hanger to wear it; "Keep this" saves the current look onto it.
- **Pip's toy shop** (`G.UI.shop()`): talk to Pip in the village (first time: intro lines, then the shop; afterwards the shop opens straight away). Items = keys with `G.LOCKED[key]==='shop'`, prices `G.PRICE` (unicorn horn 8, dragon wings 10, rainbow cape 12, baby unicorn 15). Each tile: preview, name, price. Tap → "Buy for N coins?" → coins go down, fanfare, "Wear it now ▶" button. Not enough → "You have A coins. It costs B. You need C more!" (subtraction practice) + tip "Serve at the café to earn coins."

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
3. **[done iter2] Handwriting v1 → Writing Wood**: `handwriting.js` is done (iter1); still needed: the `writing` area with Captain Quill, letter-family lessons (§7.3 ladder), handwriting progress in a journal; blue gems via writing; works with stylus pointer events.
4. **[done iter3] Hush House** level (noise meter, Mum snoring) with maths door puzzles.
5. **[done iter4] Twiggy Spoon Café** story + order-taking (count/money/read/write) + Run-the-café sandbox (§7.2d). Cooking mini-game → later.
6. **[done iter5] Wardrobe/creator UI polish** with locked-item hints, NEW badges, undo, saved outfits + Pip's toy shop (coins finally buy things) (§9).
7. **[done iter6] Bugglemead** + bug journal + science puzzles (§7.2e).
8. **[done iter7] Sentences on lines** (words done in iter2); handwriting progress page in the journal; capitals & digits trees.
9. **[done iter8] Teapot Tower** vertical level; letters & curios; sorting/pattern puzzles.
10. **[done iter9] Playrooms**: toy box, potion kitchen, vet, dolls' house, art studio; world map.
11. **[done iter10] Woods + Caves**; **[done iter11] Clouds** + finale, golden crown.
12. **[done iter11] Grown-up page**. **[todo]** offline PWA, accessibility settings, polish pass (juice, music, particles), tile-layer cache.
13. **[todo] More playrooms** (café free play, bug garden, shop, music room, builder's yard) and a second visit reason for finished areas (daily surprises).

---

## 14. Iteration log

**iter0 — set-up (this commit).** Wrote AIM/LOOP/SPEC/CLAUDE.md, CI deploy workflow, smoke test. Already drafted engine foundations: `core.js`, `audio.js`, `art.js` (avatar with ~150 customisation options + creatures + gems), `scenery.js` (7 themes, ~60 props, doors/gates). Owner added: tablet + stylus, handwriting/letter-formation as a priority (§7). Next: backlog #1 and #2, using sub-agents for bulk content.

**iter1 — playable village.** Wrote style.css, world.js (village), engine.js, ui.js (HUD, dialogue, gate recipe card, character creator with 14 tabs + 20 job presets, settings with 2-second hold to reset), puzzle.js (choice / order / write; never fails: hint → hint → reveal and keep the gem), main.js (letterbox fit, title over a panning village, debug steps). Sonnet agents wrote handwriting.js (62 glyphs, deterministic recogniser, coach messages, demo/fade guides, 310/310 synthetic tests) and curriculum.js. check.js now runs `G.debug.steps` and screenshots each (walk, talk, maths, words, write, gate, creator, settings). Feedback: 0 issues. Next: Writing Wood area (backlog #3), Hush House (#4).

**iter2 — Writing Wood.** Feedback: 0 issues. Added `js/lessons.js` (letter-family trees + word stones, trace→fade→memory ladder per letter, gem on first completion, coins on repeat) and the `writing` area. Doors can carry `at` (arrival spot). Puzzles accept `noAdapt`. New debug steps: wood, wood2, lesson. Next: Hush House (#4), then café.

**iter3 — Hush House + curriculum.** Feedback: 0 issues. Built the `house` area (§7.2c): noise meter, tiptoe speed, creaky boards, squeaky toys, night-light checkpoints, three maths doors, tuck-Mum-in ending with a lantern reward. Integrated `curriculum.js` from a Sonnet sub-agent (selfTest clean); fixed "1 pebbles" in story sums (min 2). New debug steps `house`, `house2`, `mdoor`, `mum`, `curr` (runs `G.CURR.selfTest()`, throws on problems). A scripted Playwright run checked noise rise, the wake → checkpoint reset, door blocking and the reward. Next: the café (backlog #5).

**iter4 — Twiggy Spoon Café.** Feedback: 0 issues. Built the `cafe` area (§7.2d): Mrs Bramble, Wilf, four customers with order cards in `js/cafe.js` — count cakes onto a plate, read an order ticket, pay with coins into a purse, write the order on a notepad (handwriting pad). Never-fail rules and adaptive levels as for puzzles. Serving all four → blue gem + chef hat, then "Run the café" free play (customers re-order with random kinds). New decor: counter with cake dome and till, chalkboard menu; new theme `cafe` (gingham wallpaper). Debug steps `cafe`, `order-count/read/money/write`, `cafe2`; a scripted run checked rewards and re-orders. Next: wardrobe polish (#6), Bugglemead (#7).

**iter5 — wardrobe polish + Pip's toy shop.** Feedback: 0 issues. Coins now buy things: Pip's shop sells the four shop-locked items (8–15 coins) with a "you need N more" subtraction message. Wardrobe: `G.unlock` + ✨NEW badges, lock hints that say where to win an item, tab names, ↩️ undo, 🧺 My outfits (3 hangers). Fixed the Done button wrapping and the shop wrapping on phone. Debug steps `shop`, `shop-poor`, `wardrobe-new`, `outfits`; a scripted run checked buy → wear → NEW badge → undo. Next: Bugglemead (#7).
**iter6 — Bugglemead.** New area `meadow` (90 wide: flowers, hive, logs, pond, leaf platforms; gate to Teapot Tower). `js/bugart.js` (Sonnet sub-agent): 10 procedural bugs with countable legs/wings + silhouettes. `js/meadow.js`: bug data (`G.BUGS`), magnifier card (legs → wings → legs/wings/home by `level.nature`, never fails), milestone prizes (6 → antennae + green, 10 → bee wings + purple), sorting hoops (always one bug per hoop), Bettina's progress lines. 📖 HUD button now opens the bug journal. Scripted test: 6 looks → prize; woodlouse wings reveal; sort with 3 misses auto-places, green gem; no page errors. Fix found in test: sort set could miss the "No legs" bug — now built per hoop. Feedback: none open. Next: #8 sentences on lines / capitals & digits.

**iter7 — Sentence Shore, capitals & digits, writing stars.** Writing Wood widened to 80. New `'.'` glyph + recogniser rule (any small mark near the line). Pad draws a finger-tip oval in each word gap. `G.LS.run` takes `sentences` (2 per visit: trace then fade). New lessons: Capital castle (A–Z), Number nest (0–9), Sentence stone (6 short sentences) + blue gem on a leaf. 📖 journal now has 🐞 Bugs | ✏️ Writing tabs; Writing shows 0–3 stars per letter from `S.handwriting` (capitals/digits rows appear once tried). Scripted test: drew 'I can run.' stroke-by-stroke on a real pad → all 8 slots 1.00, ok; leaving out the full stop holds on the '.' slot; sentence stone gives a gem; no page errors. Feedback: none open. Next: #9 Teapot Tower.

**iter8 — Teapot Tower.** New vertical area `tower` (32×48, five floors joined by zig-zag shelf steps) behind the meadow gate, with Mr Tuft (`G.PEOPLE.tuft`, progress-aware lines). `js/tower.js` (`G.TOWER`, written by a Sonnet sub-agent): odd-shoes memory pairs (3/4/6 pairs by patterns level, glow hint after 4 misses), postcard read-and-write-back (3 picture answers, then one word in fade mode), detective case (3 pattern puzzles → `hat:detective`), curio cabinet (6 curios touched to collect → `pet:tuft`). `S.curios` added to the save. Engine: curio pickup, furniture art with gem badges until the quest is done, `warp(x, row)` debug. Fix: emoji drawn after a translucent `fillStyle` inherit its alpha — reset `fillStyle` first. Scripted test: curio pickup + persistence, shoes win → purple gem, case → hat + yellow, all six → Little Tuft + green; no page errors. Feedback: none open. Next: #10 Playrooms.

**Review after iter8 (owner asked for an ambitious review).** Method and findings:
- *Reachability* — new `tools/reach.js` (run by `check.sh`): BFS over standable cells, then a bot drives the **real engine physics** to every entity in every area. All 98 entities reached (village 20, writing 18, house 10, café 12, meadow 21, tower 18). Keeps AIM's "every area reachable" true as levels are added.
- *Stability* — new `tools/monkey.js` (150 s of random keys, taps, scribbles and area hops): no page errors, heap flat (~10 MB), gems still earnable.
- *Content* — sampled ~680 generated puzzles across 5 subjects × 5 levels: answers sound; fixed "a elephant / a ant" (a → an before a vowel, in `CURR.make`).
- *Performance* — `E.draw` averages 4–10 ms per frame in headless software rendering (Hush House heaviest). Fine for now; cache the tile layer if a real tablet stutters.
- *Gaps against AIM* — (1) must-have #3 "lots of free-play sandboxes": none existed, and the HUD 🧸 and 🗺️ buttons plus the playroom door all said "still being built" → iter9. (2) Woods, Caves, Clouds gates open on nothing → iter10–11. (3) No grown-up page yet. (4) Handwriting is still untested with a real stylus — needs the owner's feedback.

**iter9 — Playrooms and the world map.** `js/sandbox.js` framework (`G.SB.register/open/close`, 1280×720 stage, `api` with state/save/say/sfx/pos/spark/drag) and a toy box opened from the HUD 🧸 or the playroom door. Four rooms, one file + stylesheet each: Potion Kitchen, Vet Clinic, Dolls' House (three Sonnet sub-agents in parallel, each given §8 as the brief and told to verify with screenshots) and Art Studio (pressure-aware brush, rainbow, glitter, stamps, mirror, undo, 6-slot gallery). `G.UI.map()` replaces the "still being built" map: visited areas are fast-travel buttons. Learnt: one file + one scoped stylesheet per room lets agents work in parallel without conflicts. Scripted tests per room (real pointer events), no page errors at tablet and phone sizes. Feedback: none open. Next: #11 Woods + Caves.

**iter10 — Whispering Woods and Crystal Caves.** Two new areas behind the café's woods gate. Engine: bouncy mushrooms/crystals, rafts (moving platforms that carry the player), touch pick-ups in sets (`S.picks`, `G.pickCount`), darkness with holes of light (bigger with the lantern), `G.NPC_LINES`. Woods: Rosie Rabbit's five fireflies, three compass-and-map trail signs (geography), a campfire story to put in order. Caves: Mole, three crystal chimes (music memory), three warm stones to hatch the dragon egg → `pet:dragon`. Cards by two Sonnet sub-agents (`js/woods.js`, `js/caves.js`). Learnt: the jump-cut killed bounces (fixed with `P.flung`); `tools/reach.js` now also collects pick-ups, and found a branch that was one tile too far and a lake gem set too deep — both fixed before shipping. Check: 31 new entities reached by the physics bot; raft carry and bounce height (5.7 rows) tested with the real engine. Feedback: none open. Next: Clouds + finale.

**iter11 — Cloudtop Kingdom, the finale and the grown-ups page.** The last area: cloud platforms and three cloud bounces up to the Cloud Castle, Luna the unicorn, weather station (dress Teddy for the weather), star counter (tens and ones in ten-frames), rainbow maker (colour order; the rainbow then arcs over the castle). The castle needs 5/5/5/5/4 gems; inside is the party with every friend, "sign the royal book" (her own name on the handwriting pad) and the golden crown. Settings → "For grown-ups" (hold 2 s): levels per subject in plain words, handwriting letters to practise, adventure and playroom counts, handwriting strictness. The whole story is now playable from the first gate to the crown. Note: both Sonnet sub-agents were cut off by the usage limit before they could verify; the files they left were complete, and I tested every card to its reward and the party to the crown myself (fixed: crown covered the face, invisible ✕ on the star card, a doubled crown badge). Check: 13 cloud entities reached by the physics bot; no page errors at tablet and phone sizes. Feedback: none open. Next: #12 polish/offline, #13 more playrooms — and real-tablet feedback on handwriting.
