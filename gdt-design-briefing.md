# Game Dev Tycoon — Design Briefing

## The core machine
The "review score" is **not** an evaluation of your game. It's your current Game Score compared against your own previous best:

```
Game_Score = (Design + Tech / size_mod) × Quality × PlatformGenre × TopicAudience × BugRatio × Trend
Target      = Top_Score + delta   (delta ≈ 12–20% of Top_Score)
```

- Beat Target by ≥12% → 9+. Miss → proportional drop.
- Every quality multiplier is **capped at 1.0, floored at ~0.6**. One missed check = 15–40% loss in a single multiply; two stacked 0.6 penalties floor you at ~0.36.
- **Design implication:** the scoring rival is *you*. Overshooting raises the plank ~20% and punishes the next ~5 games — so optimal play is to win by the *smallest* margin, deliberately leaving bugs in. The community built Excel sheets to compute exactly how many. That is the whole critique in one sentence.

## The four levers that decide quality
1. **Genre T/D target** (biggest hidden factor): Action 1.8, Sim 1.6, Strategy 1.4, RPG 0.6, Casual 0.5, Adventure 0.4. Adventure/RPG are design-weighted → easiest to balance → every guide funnels new players there.
2. **Topic×Genre combo weight**: Great = **1.0**, Strange = **0.6**, intermediate = Good. Same number triples as quality mult, point-gen coefficient, and specialization threshold (900 × weight).
3. **Slider time-allocation**: the **bottom composite bar matters, not individual slider %.** Each slider has a fixed T/D bias (Engine 80T, Gameplay/Story 80D, Dialogues 90D, AI 80T, Graphics 70T…). Spending >40% of a phase on a high-priority design area gives +0.2 Quality per hit.
4. **Penalty stack**: repeat topic+genre back-to-back → −0.4. Sequel <40 weeks → −0.4. Sequel same engine → −0.1 (better engine → +0.2). Bug ratio <0.9 → "too many bugs."

**10/10 recipe:** hit Target ≥12% + Great combo + correct T/D + slider time bonus + no repeat/sequel penalty + bug ratio ≥0.9 + enough fans for game size + (AAA) ≥3 specialists on genre-important sliders. Miss the fan/specialist cap ("Technical Expertise") and your max score is clamped invisibly.

## Progression gates (worth stealing)
- Garage → Office: **$1M cash**. → Tech Park: **Y11, 2 staff, $500K**. → Final office: **Y13, 4 staff, $16M** (6-staff cap).
- **R&D Lab**: train one staff to 700 Design. **Hardware Lab**: 700-Tech staff + Hardware research (800 RP). Gating major systems behind a *trained specialist* rather than just money paces the midgame well.
- R&D tree: Internet (500 RP) → MMO/passive income; Hardware → custom console; AAA (after a large game ≥9.25 avg) → 3D V6; SDK (after 10 engines) → passive engine licensing → money becomes effectively infinite.
- **Custom console quirk:** genre fit is generated *inverted* from your release history — your most-used genres become the *worst* console matches.

## Where the design breaks
- **Fully legible system = solvable system.** Every multiplier is a visible near-integer constant; the wiki reverse-engineered it in months and the strategic space collapsed to a slider preset. This is the central lesson.
- **No replayability layer.** Only achievements carry between runs — no New Game+, no persistent unlocks, no per-run weight shuffling. Combos and slider templates are deterministic, so run 2+ is identical. Randomized variables (trends, famous-hire NPCs, contracts) are too thin to matter.
- **"I solved it, now what."** Once you have the combo table + Adventure/RPG slider template, the challenge is over — usually by ~Y20 of a 35-year game. The last decade adds platforms but no mechanics.
- **MMO is a trap:** maintenance scales unbounded; even a 10/10 MMO eventually bleeds you out. Intentional (mirrors real MMO shutdowns) but under-communicated.

## Transferable design principles
1. **Hide at least one major multiplier, or randomize weights per run** — or a committed community will turn your metagame into a lookup table.
2. **Pace systems behind earned specialists, not just cash** (the 700-stat gate beats a price tag).
3. **Avoid a self-referential score target unless you want optimal play to be sandbagging.** Beating your own best is elegant but incentivizes leaving bugs in.
4. **Some illegibility is the price of replayability** — contrast emergent-narrative games (Dwarf Fortress, RimWorld) where hidden variance sustains runs indefinitely.
5. **Legibility wins the first-play fantasy, loses the hundredth.** GDT nails the 15–25h first run (garage→office, first 10/10, first console are the peak beats) and offers nothing after. Know which one you're designing for.
