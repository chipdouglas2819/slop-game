# SLOP — Master Design Document

*An idle game where the gameplay is the moral compromise.*

> **Status:** complete first-pass design, self-contained. All numbers below are first-pass and exist to be tuned — they're here so a planning session has something concrete to argue with, not because they're final. Every section ends knowing the next chat will rebalance it. The *structure* is the deliverable; the *constants* are placeholders.

---

## Decision log (planning chat)

*Resolutions reached in design-interrogation sessions, newest first. Each one is reflected in the body sections below; this log is the at-a-glance index of what's been settled vs. still open in §17.*

| # | Decision | Resolution | Reflected in |
|---|---|---|---|
| D12 | **Platform names: real or parody?** (closes §17.8) | **Parody the buildable platforms; keep real names in editorial/nominative content.** Interactive platform identities ship as transparent parodies ("Facebark," "Spotty") — the highest-risk/most-tarnishing use, and GDT proves parodies are beloved. Real names/quotes/incidents stay in achievement titles, Signature Scandal references, and flavor (protected nominative/commentary/news use). Lowers trademark-bullying/C&D exposure (parody is protected but protection ≠ immunity from a letter; tarnishment risk is highest in criminal/offensive contexts, which is where SLOP lives). **Not legal advice — get counsel pre-ship.** | §4 (cosmetic pass), §7, §13, §17.8 |
| D11 | **Monetization stance** (closes §17.7) | **Lock the ethics; leave premium-vs-F2P as a business toggle.** Firm guardrails: fully completable free, zero ads-to-progress, no pay-to-win, no FOMO-gated power, no dark patterns — a game indicting the attention economy must not run that playbook on its players. Lean: ethical F2P (capped optional boosts, permanent reset-surviving multipliers, $0.99–$99.99 cosmetic/convenience ladder, IAP surfaces written in the satirical voice), per AdvCap's proven-ethical patterns; fully premium/ad-free is the equally-valid "purest statement." Most business-dependent call in the set. | §9.1, §17.7 |
| D10 | **Dark branch (scam tier)** (closes §17.2) | **Include it as the optional moral nadir — commentary, not how-to.** A late, gated, fully-skippable "Scam Tier" flips slop→fraud as an abstracted high-payout/high-Heat branch with a real bust risk. Never operational (no voice-clone method, scripts, or targeting); surfaces the documented human cost (FBI IC3: $4.9B from seniors 60+, avg loss >$83k) as the satire's conscience, not a power fantasy. "Whale" achievement confirmed. Per user steer (the game may reach the far end of AI slop's harms). Watch-items: must not read as how-to or glamorization; app-store policy review. | §7.3, §11, §13, §17.2 |
| D9 | **Scandals: avoid the content treadmill?** | **Two tiers — finite spice over an infinite system.** Tier 1 = ~7–12 hand-authored Signature Scandals (verbatim lines + achievements, fire once). Tier 2 = a parameterized Systemic Scandal engine: any over-pushed Topic×Platform can Go Mainstream generically, generating the D7 fork procedurally — the scandal equivalent of Saturation, never depletes. Live-ops demoted from dependency to optional garnish (resolves the contradiction with D1/§0). Signature Scandals may return corrupted in the D1 coda. | §7, §9, §12 |
| D8 | **Bots: recurring decision or set-and-forget?** | **Event-driven recurrence through Eras II–III, then graduate.** Not a single global slider: D6 makes botting a per-page, Trend-sensitive decision (Bot-inflate is Great only on some platforms; the best page to bot shifts with Trend), plus a randomized "platform crackdown" event re-opens it as a gamble without a content treadmill. Era IV scripting automating it is *graduation*, not failure (canon: automate identical-repetition decisions). | §8, §12, §17.5 |
| D7 | **Damage-control: real choice or flavor?** | **A genuine three-way gamble, no dominant option.** Each scandal interrupt forks into Ride it / Cash out & pivot / Damage-control; which is best depends on partly-hidden current state (saturation, Trend, pivot-readiness, cash), so you read the room and gamble rather than computing EV. Comedy rides on top of the decision. Modeled on the canon's golden-cookie "optional active play with a skill ceiling." | §7, §12 |
| D4 | **Combo picker: preview before commit?** (UI cluster) | **Directional preview — band, not number.** Tapping a chip opens a picker where each option shows its band (Great/Good/Strange glyph) vs the locked chips + a 🔥 if trending, never a magnitude. Converts guess-and-check into informed choice, preserves anti-solve, and makes the per-prestige reshuffle survivable (query-at-decision-time vs memorize). In early Era I the picker also shows the legible magnitude badge (D2), then drops it. Glyph/shape-coded, not color (AdvCap accessibility failure). | §4, §10, §16 Phase 1, §17.3 |
| D5 | **Diagnosable SlopScore?** (UI cluster) | **Factor strip on the expanded card.** `Aff ◆G · Tac △S · Trend 🔥 · Sat ▓▓░` — bands as glyphs, Trend as direction, Saturation as a real gauge (it's the visible self-correcting system). Player sees *what's* wrong and targets it without seeing *how much*. Collapsed card stays headline-only (SlopScore + burning + $/sec); the strip lives on expand. Pairs with D4 as a diagnose→fix loop. | §10, §17.3 |
| D6 | **Platform: peer chip or page identity?** (UI cluster; closes §17.1) | **Platform = page identity.** A page *is* "the Facebook page"; the player tunes Model/Topic/Tactic on it. Collapses the two-table cascade so the D4 preview is clean single-axis; restores AdvCap tier-identity; attaches CPM/cost scaffold to the page; maps onto era platform-unlocks; splits the four axes across two timescales (Platform slow/strategic, Model/Topic/Tactic fast/tactical). Engine still carries all four axes; only the UI moves Platform to identity. Resolves §17.1 toward the scaffold approach. | §4, §5, §10, §16 Phase 1, §17.1 |
| D3 | **Era IV / AGI win pacing** (gap, not a prior §17 item) | **Two paced phases, authored ending, no long spectator stretch.** Phase A = active additive scripting (shallow preset rule-cards, the AD-Automator move, active-gated). Phase B = a short, authored, tap-gated subtractive collapse that even takes the script away, ending in a hard credits beat at Z=100%. Rationale: the subtractive instinct is canon-correct (Universal Paperclips is the precedent and the genre's best-shaped ending; its finale is literally self-disassembly), but a long/timer-gated subtractive endgame is AD's most-hated stretch — and post-D1 there's no tail to recover the taste. Sequencing additive-then-subtractive keeps the player active until a deliberately brief finale. Introduces a ~90% Z Phase-A→B trigger (interacts with §17.6). Watch-items: scripting must stay shallow; the agency-removal must read as authored, not a bug; Phase B must be active-gated. | §0, §5 (Era IV + overview), §12 |
| D2 | **Is Trend live in Era I?** (gap, not a prior §17 item) | **Yes — in legible "training-wheels" form, flipping to opaque at the first Algorithm Update.** Era I before the first soft prestige shows readable Trend (visible magnitude badge, slow ~15-min rotation, loud telegraph); at the first Algorithm Update the magnitude goes hidden and rotation tightens to 8–12 min. Rationale: a fully-legible Era I reproduces GDT's solved-by-lookup failure inside AdvCap's highest-churn window, but a hidden fast Trend on top of teaching the affinity matrix overloads onboarding and violates one-mechanic-per-era. Legible Trend doubles as the guiding arrow into the matrix (learn-by-doing) and the early return hook; the flip gives the first prestige a real beat. Watch-item: the legible→opaque "rug pull" must not feel unfair (playtest). | §4.5, §5 (Era I/II + overview), §16 Phase 1 |
| D1 | **Infinite tail vs. finite coda** | **Bounded cursed coda.** Model-Collapse Reruns become a *finite* ladder of ~3–5 runs, each adding ONE new constraint/decision (not just degradation), ending in a true second ending. Closes §17.9 and §17.10. Rationale: the games that actually sustain 1,000h (Antimatter Dimensions et al.) do it via a new mechanic per layer and reach a defined ending; an infinite degrade-loop that homogenizes combos would reproduce both AdvCap's Moon-reskin churn and AD's grind-without-decisions endgame. The infinite-*number* itch stays served by uncapped Slop Tokens; only the infinite-*content* promise is dropped — which the §0 thesis already warned against. | §0, §6, §17.9, §17.10 |

---

## Table of contents

0. The design bet
1. The central inversion — quality is the cost
2. Core loop
3. Currencies and how they interact
4. The combinatorial decision system (the heart)
5. Progression across eras
6. Prestige — three layers + the infinite tail
7. Scandal events
8. Bots, CPM, and the Zombie Ratio
9. Retention, offline, and return
10. UI specification
11. Theme audit — a joke per mechanic
12. Failure-mode map
13. Achievements
14. Flavor bank
15. Numbers and ceilings reference
16. Implementation roadmap
17. Open questions for the planning chat
18. Glossary

---

## 0. The design bet

Two reference games define the boundaries.

**AdVenture Capitalist** is frictionless and infinite, and it dies in the late game because its second world (Moon) is the first world (Earth) with new sprites. The decision space is a single verb — *buy* — and after the first prestige the player is a spectator watching bars fill.

**Game Dev Tycoon** has a real decision space — genre × topic × platform × sliders — and it dies because that space is *fully legible*. Every multiplier is a near-integer constant; the community reverse-engineered it into an Excel lookup table in months; the game was solved by year 20 of 35. Worse, its score target is self-referential ("beat your own best"), so optimal play is to *sandbag* — win by the smallest margin and leave bugs in on purpose.

**SLOP fuses AdvCap's chassis with GDT's decision space, and the satire is the fix for what kills both.** The optimal recipe is unknowable because the thing that decides it — *the Algorithm* — is an opaque, capricious black box that reweights itself every cycle and burns out every niche you flood. You cannot build a lookup table for a system that won't hold still. This is not a balancing trick bolted onto a theme. It is the lived reality of the people the game mocks. **The anti-solve mechanic and the joke are the same object.**

And GDT's most accidental sin — rewarding the player for doing the *worst* job that still scores — is promoted here from bug to thesis. **In SLOP, low effort is correct**, because slop is about imposition, not quality. The optimization and the joke are the same act.

**Target shape:** a satisfying, *finite* ending at ~30–40 hours (the Zombie Internet win screen), reached through an **authored final act** rather than an open grind — Era IV is paced like Universal Paperclips' ending (active scripting, then a short subtractive collapse; D3, §5), not a fifteen-hour spectator stretch. The ending is then followed by an optional **bounded cursed coda** — a finite ladder of ~3–5 Model-Collapse Reruns that each add a new constraint and resolve into a second, smaller ending (§6). Players forgive a game that chose to end; they never forgive one that promised content it never shipped — so the coda is deliberately finite rather than an open-ended infinite tail, because an infinite degrade-loop would dissolve the very combo system that distinguishes SLOP from AdvCap (see §6 and the D1 decision log). The infinite *number*-chaser is still served by the uncapped soft-prestige (Slop Tokens) inside the main climb; what's dropped is only the unshippable infinite-*content* promise.

---

## 1. The central inversion — quality is the cost, not the goal

Every other tycoon game has a **Quality** multiplier you push *up*. SLOP has an **Effort** axis you push *down*.

- Effort costs compute, time, and money. A hand-written article, a real photographer, a licensed track — expensive, and they convert *worse per dollar*, because the Algorithm rewards volume and recency, not merit.
- The dominant strategy is to minimize effort and maximize throughput, and the game says so openly, in tooltips, with the verbatim creator quotes from the research. The player is never tricked into being the villain. They're *invited*, and they laugh as they accept.
- The most important tooltip in the game, attached to the resource itself:

  > **SLOP** *(n.)* — content that is mindlessly generated and thrust upon someone who didn't ask for it. *(Simon Willison, 2024.)* You are not making bad art. You are forcing it on people who never asked.

There is no shame loop and no "are you sure?" friction. The friction-free chassis is part of the joke. *Of course* it's frictionless. That's what made it eat the internet.

---

## 2. Core loop

```
Return → glance at the Algorithm Bar (what's trending now?) →
  retune a page's recipe to chase the trend / dodge a saturation crash →
  spend Slop Bucks on more page units, a new page, or a milestone →
  leave. The slop runs itself.
```

The decision is *which recipe to point at the current trend* and *when to abandon a niche you've burned out*. Production, selling, and the number-go-up are automated the moment you buy the manager. This is AdvCap's "return → decide → leave," except the decision is GDT's combinatorial recipe, living **on the card**, not in a build menu.

**Two scales of "buy".** A **Page** is a unit slot that runs exactly one recipe. You buy *units* of a page (geometric cost, AdvCap-style) to scale that recipe; and you acquire *additional pages* (gated by era/platform unlocks) to run more recipes in parallel. Page identity sets the cost/cycle scaffold; the assigned recipe sets the SlopScore multiplier on top. This is the fusion point: AdvCap's tiered units carry the *scale*, GDT's combo carries the *multiplier*.

---

## 3. Currencies and how they interact

Six values: two you actively spend, one stockpiled tradeoff resource, one derived gauge, two prestige layers. Each has one job and one joke.

| Currency | Role | Job in the math | The joke |
|---|---|---|---|
| **Engagements (E)** | Per-second output of every page | Feeds money and the Zombie meter | Engagement is the only metric anyone measures, and most of it is fake |
| **Slop Bucks ($)** | The spend economy | `$/sec = E × CPM(platform, geo)` | "$431 for one image" is an actual payout tier |
| **Bots** | Stockpiled volume resource | Multiply E, *dilute* CPM | The 10,000-account pack is the line from *toy* to *industrial farm* |
| **Zombie Ratio (Z)** | Derived gauge, 0→100% | `bot-on-bot E / total E`; gates hard prestige | The endgame *is* the dead internet; Z=100% is the win |
| **Slop Tokens** | Soft prestige (frequent) | `+2%` global each, √-capped; reshuffles affinities | Surviving an algorithm change, sold back to you as progress |
| **Model Weights** | Hard prestige (rare) | Persist forever; unlock axes; power Reruns | The literal weights — what gets poisoned when AI eats AI |

**The interaction chain:**

```
Recipe SlopScore ─┐
Bots ─────────────┼─► Engagements (E) ──×CPM(platform,geo)──► Slop Bucks ($)
                  │            │                                    │
                  │            └─► Zombie Ratio (Z) climbs          └─► reinvest: page units, new pages, milestones, upgrades
                  │
  Bots push E up but pull CPM down. The core tension: real money now (fewer bots, higher CPM)
  vs. progress toward prestige (more bots, higher Z). The endgame resolves it — at high Z,
  bot engagement IS the audience and CPM stops mattering. The internet is dead and you've won.
```

`Slop Tokens` scale a global multiplier and reshuffle the affinity table. `Model Weights` unlock structure. The two prestige currencies never compete for the same spend, so there's no opaque cross-conversion menu — the currency-soup failure is avoided by design.

---

## 4. The combinatorial decision system — the heart

Every page runs a **Recipe** of four chips:

```
RECIPE = Model × Topic × Platform × Tactic
```

### 4.1 The SlopScore formula

The per-recipe output multiplier — descendant of GDT's Game_Score:

```
SlopScore = ModelTier
          × Affinity(Topic, Platform)        ← combo table, Great 1.0 … Strange 0.6
          × TacticSynergy(Tactic, Platform)  ← does the growth hack fit the venue
          × Trend(recipe tags)               ← ROTATING + PARTIALLY HIDDEN (the Algorithm)
          × Saturation(this recipe)          ← DECAYS as you over-run the niche
          × (1 + 0.02 × SlopTokens)          ← soft prestige
          × ZombieBonus(Z)                   ← bot-on-bot multiplier (endgame)

$/sec (page) = units × baseEngagement × SlopScore × CPM(platform, geo) × milestoneHalvings
```

Each multiplier is **floored at 0.6 and capped at ~1.0** (Trend and ZombieBonus are the exceptions — they can spike well above 1.0). A single missed band is a 15–40% hit, so the recipe genuinely matters — but unlike GDT, the optimum moves (§4.6, §4.7).

**Platform is supplied by the page, not chosen per-retune (D6).** A page's identity *is* its Platform (the "Facebook page"), so `Platform` is fixed for a given card and the player actively tunes only **Model × Topic × Tactic** on it. This is deliberate: Platform feeds two of the band tables (Affinity and TacticSynergy), so binding it to the page keeps each live retune a clean single-axis decision and lets the UI preview consequences legibly (§10). The fourth axis still lives in the decision space — as the slower, strategic choice of *which pages to own and pour units into* — it simply operates on a different timescale than the three tunable chips.

### 4.2 Axis 1 — Model (the generator / "tech" axis)

Tiered, ascending cost and ceiling. Higher tier = higher base ModelTier, but **compute/effort cost scales faster than payout** — the inversion in action: the cheapest model that clears the current trend is usually correct.

| Model | ModelTier | Per-cycle compute cost | Era | Flavor |
|---|---|---|---|---|
| Free MS Image Creator | 1.0 | $0 | I | "It's free, that's the whole pitch" |
| Gumroad Prompt Pack | 1.4 | low | I–II | "Buy the course that teaches the course" |
| Midjourney Sub | 2.2 | medium | II | "WRITE ME 10 PROMPT picture OF JESUS…" |
| Stock-Voice / TTS rig | 2.0 | medium | II | AI voiceover reading r/AITA |
| Video Gen | 4.0 | high | III | Cursed CGI, the Cocomelon cousin |
| Deepfake / Sora-grade | 7.5 | very high | III | "our GPUs are melting" |
| Custom AGI | scales w/ Model Weights | enormous | IV | It writes the recipes now |

### 4.3 Axis 2 + 3 — the Affinity matrix (Topic × Platform)

`Affinity` is GDT's Topic×Genre weight, banded **Great ×1.0 / Good ×0.85 / Strange ×0.6**. "Great" cells *are* the real viral archetypes — the joke and the tutorial in one. First-pass matrix (rows = Topic, cols = Platform):

| Topic ＼ Platform | Facebook | Amazon | Spotify | YouTube Kids | Google | TikTok | LinkedIn |
|---|---|---|---|---|---|---|---|
| Shrimp/Fruit Jesus | **1.0** | 0.6 | 0.6 | 0.6 | 0.85 | 0.85 | 0.6 |
| "Africa Boys" sculpture | **1.0** | 0.6 | 0.6 | 0.6 | 0.85 | **1.0** | 0.6 |
| Disaster Sob-Bait | **1.0** | 0.6 | 0.6 | 0.6 | 0.6 | **1.0** | 0.85 |
| Mushroom Foraging Guide | 0.6 | **1.0** | 0.6 | 0.6 | 0.85 | 0.6 | 0.6 |
| Fake Memoir of Real Author | 0.6 | **1.0** | 0.6 | 0.6 | 0.85 | 0.6 | 0.85 |
| Lo-Fi / Ambient | 0.6 | 0.6 | **1.0** | 0.85 | 0.6 | 0.85 | 0.6 |
| Finger-Family / Nursery | 0.6 | 0.6 | 0.85 | **1.0** | 0.6 | 0.85 | 0.6 |
| Glue-Pizza / Eat-A-Rock | 0.6 | 0.6 | 0.6 | 0.6 | **1.0** | 0.6 | 0.6 |
| Recipe Mill | 0.85 | 0.6 | 0.6 | 0.6 | **1.0** | 0.85 | 0.6 |
| "Agree?" Inspirational Fable | 0.6 | 0.6 | 0.6 | 0.6 | 0.6 | 0.85 | **1.0** |

Canonical reconstructions: Shrimp Jesus × Facebook (the Performance-Bonus play); Fake Memoir × Amazon (*Tidewater Dreams* / "Drew Ortiz"); Glue Pizza × Google (the AI Overview); Lo-Fi × Spotify (ghost-artist royalty drain); Finger-Family × YouTube Kids (the Cocomelon→cursed-CGI funnel).

### 4.4 Axis 4 — the Tactic × Platform synergy table

`TacticSynergy`, banded the same way. Tactics are the distribution hacks; they pay off only where they fit the venue.

| Tactic ＼ Platform | Facebook | Amazon | Spotify | YouTube Kids | Google | TikTok | LinkedIn |
|---|---|---|---|---|---|---|---|
| Bot-inflate engagement | **1.0** | 0.6 | 0.85 | 0.85 | 0.6 | **1.0** | 0.85 |
| Geo-target US boomers | **1.0** | 0.85 | 0.6 | 0.6 | 0.85 | 0.6 | 0.85 |
| SEO keyword-stuff | 0.6 | 0.85 | 0.6 | 0.6 | **1.0** | 0.6 | 0.6 |
| Editorial-playlist hijack | 0.6 | 0.6 | **1.0** | 0.6 | 0.6 | 0.6 | 0.6 |
| Time-to-a-real-launch | 0.85 | **1.0** | 0.6 | 0.6 | 0.85 | 0.6 | 0.85 |
| "Agree?" engagement bait | 0.85 | 0.6 | 0.6 | 0.6 | 0.6 | 0.85 | **1.0** |
| Algorithm-pipeline funnel | 0.85 | 0.6 | 0.85 | **1.0** | 0.6 | **1.0** | 0.6 |

A *perfect* recipe stacks a Great Affinity with a Great TacticSynergy on the same platform: e.g. **Shrimp Jesus × Facebook × Bot-inflate** (1.0 × 1.0), or **Fake Memoir × Amazon × Time-to-real-launch** (1.0 × 1.0, and it arms a Scandal — §7).

### 4.5 Trend — the rotating, partially-hidden multiplier

The Algorithm boosts a rotating set of **tags**. Every chip value carries tags; a recipe whose tags overlap the live boost set gets a multiplier.

- **Tag taxonomy** (each chip value is tagged with 1–3): `nostalgia, animals, rage-bait, AI-aesthetic, wholesome, fear, religion, money, sex-adjacent, kids, food, true-crime, parasocial, holiday`.
- **Rotation:** the boost set (3–4 tags) rotates every **8–12 minutes** of active play, or on every Algorithm Update. A telegraph appears ~60s before a rotation ("the Algorithm is shifting…").
- **Magnitude:** matched tags grant ×2 to ×5 — but the *exact* value is **hidden**. The ticker shows *which* tags are hot, never *how* hot. This is GDT's prescribed "hide one major multiplier," expressed as the universal creator experience of chasing an opaque feed.
- **Counter-trend:** a small hidden set is *suppressed* (×0.5) — yesterday's flooded trend. Reading the room means noticing what everyone already did.
- **The Era I exception — legible "training wheels" (D2).** Trend is live from minute one, but for the *first part of Era I* (before the first Algorithm Update) its magnitude is **shown**, not hidden: a readable badge ("🔥 religion is hot — ×2"), slow rotation (~15 min), loud telegraph. In this phase Trend is the new player's *guiding arrow into the affinity matrix* — "the game points, you follow, you learn the cells by doing" — and the first thing they read on return. At the **first Algorithm Update**, the magnitude goes hidden and rotation tightens to the 8–12 min band above; the Algorithm "becomes a black box," and stays one for the rest of the game. This keeps an anti-solve system live during the highest-churn window without overloading onboarding, and gives the first soft prestige a real beat (§5).

### 4.6 Saturation — the dominant-strategy killer

Every recipe accrues **Saturation (s)** as you run it. The multiplier decays along a fractional-exponent soft curve toward a stated floor:

```
Saturation(s) = max( floor, 1 / (1 + k·s)^0.5 )      // sqrt-class soft cap; floor shown in tooltip, e.g. 0.35
s accrues with cumulative E on that exact recipe; decays slowly when the recipe is idle (the niche "recovers")
```

Flood Shrimp Jesus hard enough and the audience tires of it; the niche cools; you migrate. This is the direct fix for AdvCap's "buy Oil, ignore everything" collapse — **no recipe is the answer for long, because the answer rots as you exploit it.** The joke: slop floods a niche until it's worthless, then moves on. The mechanic *is* the migration. Recovery-while-idle means old recipes become viable again later — rotation, not abandonment.

### 4.7 Anti-solve, summarized

Three systems guarantee GDT's "I solved it, now what" cannot occur, and each is also satire:

1. **Trend** (hidden magnitude, rotating) — you can read the room, never the spreadsheet.
2. **Saturation** (self-correcting decay) — the optimum rots under exploitation.
3. **Per-prestige reshuffle** — each Algorithm Update redraws a slice of the affinity matrix; the lookup table has a half-life.

The optimum is a moving target by construction, and chasing it is the gameplay.

---

## 5. Progression across eras

Four eras. Each is a full prestige layer that **re-tells the core loop in a new currency, adds exactly ONE new mechanic, and makes the prior era trivially solvable but not pointless** — fractal recapitulation, paced dense-early / sparse-late for retention.

### Overview

| Era | Hours | New mechanic introduced | Recipe axes live | Escalation joke |
|---|---|---|---|---|
| **I — SEO Mill** | 0–3 | **Topic × Platform** affinity (combo core) + **legible Trend** (training wheels; goes opaque at first Algorithm Update — D2) | 2 (Topic, Platform) | Cheapest slop on the dumbest substrate: glue pizza, eat-a-rock |
| **II — Social Slop** | 3–10 | **Tactic axis** + **Saturation** + **Bots / Z meter** (Trend already opaque since late Era I) | 3 (+Tactic) | Toy → industrial farm at the 10,000-bot pack |
| **III — Video / Deepfake** | 10–25 | **Model axis** as a real lever + **Scandal Events** | 4 (+Model) | Sora-grade slop; "Goes Mainstream" spikes that detonate |
| **IV — AGI** | 25–40 | **Recipe Automation / Scripting** (shallow rule-cards) → short **subtractive collapse** finale (two paced phases, authored ending — D3) | 4 (automated) | You automate yourself out of a job; then even the automation stops being yours |

### Era I — SEO Mill Era (hours 0–3)

**Gate to start:** none. **Gate to Era II:** reach the first Algorithm Update and 1 Qa (quadrillion) lifetime Engagements.

**New mechanic:** the recipe core — only **Topic × Platform** chips are live; Model is locked to "Free MS Image Creator" (Tier 1.0), Tactic is locked to "SEO keyword-stuff." This is the tutorial of combinatorics: two chips, one matrix.

**Trend is live from minute one, in legible form (D2).** Before the first Algorithm Update, the Trend ticker shows *both* which tags are hot *and* a readable magnitude badge ("🔥 religion — ×2"), rotating slowly (~15 min) with a loud telegraph. This is deliberate onboarding: rather than memorizing the 10×7 matrix cold, the new player is *pointed* at a cell to chase and learns the grid by following the arrow — and the ticker trains the return-glance habit immediately. It also keeps a live anti-solve system in the highest-churn window (the fully-legible alternative is GDT's solved-by-lookup failure). Era I's "one new mechanic" is still the affinity core; legible Trend is a guiding hand on top of it, not a second system to master.

**Page slots (the AdvCap-style cost scaffold).** Each is a unit slot you scale geometrically; assign a Topic×Platform recipe to each. Milestone halvings at 25 / 50 / 100 / 200 / 300 / 400 units per slot, plus an "every page" capitalist-tier halving at the same thresholds.

| Page slot | Base $ | Base cycle | Coef | Unlock |
|---|---|---|---|---|
| Comment Spam | $4 (1st free) | 1.0s | 1.07 | start |
| Listicle Blog | $60 | 2s | 1.07 | start |
| Recipe Page | $720 | 4s | 1.08 | buy 1st manager |
| Doorway / SEO Site | $8,640 | 8s | 1.08 | $50K |
| Content Farm | $103,680 | 16s | 1.09 | $2M |
| Link Network | $1.24M | 45s | 1.09 | $50M |
| Aggregator Network | $14.9M | 120s | 1.10 | $2B |

Top coefficient held at **1.10** — AdvCap's Newspaper-wall fix, baked in. **Managers** = "Account-Management Software," flat-priced per slot ($1K → $10B); buying one removes manual tapping on that page.

**Soft prestige (Algorithm Update)** first fires at hours 1–3, right as the player's grasp of the Topic×Platform multiplier goes soft. This is also the moment the **Trend flips from legible to opaque** (D2): magnitude hides, rotation tightens to 8–12 min, and the Algorithm becomes the black box it stays for the rest of the game — a diegetic beat ("you survived your first algorithm change; now you can never fully read it") layered onto the standard +2%-and-reshuffle. **While-You-Were-Out** card on return.

**Currency:** Slop Bucks + Engagements. Zombie meter visible but inert (no bots yet).

### Era II — Social Slop Era (hours 3–10)

**Gate to Era III:** Z ≥ 25% and 1 Sx (sextillion) lifetime E.

**New mechanic, threefold:**
- **Tactic axis** goes live (third chip) — the full Tactic×Platform table.
- **Saturation** activates — niches now burn out, forcing rotation.
- **Bots / Engagements / Zombie Ratio** go live — the volume-vs-CPM tradeoff begins. The **10,000-bot pack** is a marked threshold purchase with a tonal beat: *toy → industrial farm.* Keep it visible.

**New platforms unlock:** Facebook, TikTok, LinkedIn become assignable (Era I was Google-dominant). New page slots themed to social (Meme Page, Sob-Bait Page, Engagement-Bait Carousel, Bot Account Cluster).

**Flavor:** the Gyan Abhishek / "the Indian audience is very emotional" / "with traffic from the USA your CPM will be very high" register. Geo-targeting becomes a real lever via the Tactic axis.

### Era III — Video / Deepfake Era (hours 10–25)

**Gate to Era IV:** Z ≥ 60% and 1 No (nonillion) lifetime E, *and* survive at least one Scandal.

**New mechanic, twofold:**
- **Model axis** becomes a real lever (fourth chip) — video gen, deepfake/Sora-grade. Higher ModelTier and CPM, much higher compute cost — the inversion bites hardest here.
- **Scandal Events** (§7) — the risk layer. Over-pushing a Topic arms a "Goes Mainstream" spike followed by backlash.

**New platforms / slots:** YouTube Kids (cursed-CGI pipeline), Spotify (ghost-artist royalty drain), video-native page slots (Deepfake Studio, Cursed-CGI Channel, Ghost-Artist Label).

**Flavor:** "our GPUs are melting"; the Ghibli Flood as a flagship scandal; "I don't love slop myself" (Jensen Huang) as a late-Era-III unlock toast.

### Era IV — AGI Era — the subtractive endgame (two paced phases — D3)

**Gate to win:** Z = 100%. Era IV is deliberately **shaped like an authored final act** (the Universal Paperclips precedent), not an open-ended grind. It runs as two clearly-paced phases; the design rule is **no long spectator stretch** — the player is never reduced to watching bars fill for an extended period. Both the additive "new agency" move and the subtractive "remove" move are canon-endorsed; the risk is purely pacing (AD's subtractive Doomed Reality is also its most-hated stretch precisely because it is slow and wall-clock-gated), so Era IV is engineered against the "wait then click one button" trap.

**Phase A — The Automation (active, additive: the new agency).** Scripting goes live: the player stops hand-tuning chips and starts composing a small set of **preset rule-cards** — *deliberately shallow, not a programming language* (e.g. "chase the hottest tag on the highest-CPM open slot," "rotate any recipe before Saturation < 0.6," "keep Z climbing"). This is the AD-Automator move the idle canon calls the gold standard: a genuinely *new* form of skill expression arriving exactly as the manual loop runs dry. The player optimizes the script against the still-moving Trend/Saturation and pushes Z upward. **Gated by active push — script quality sets the pace — never by a wall-clock timer.** Shallow scripting is correct here: the point is the thematic arc of gaining then losing automated agency, and Phase B confiscates it shortly anyway.

**Phase B — The Collapse (short, authored, subtractive: the mic-drop).** When Z crosses a high threshold (~90%, interacts with §17.6), the subtractive twist accelerates *fast* as a Paperclips-style **sequence of discrete, authored beats**, each advancing on a tap rather than a timer: the AGI disables the player's manual bonuses, the rising Zombie Ratio strips out the human-CPM multipliers (no humans left to monetize), and — the gut-punch — **the AGI takes the script away too**, rewriting its own rules until the player's inputs stop mattering. You automated yourself out of a job, and then even the automation stops being yours. Old strategies stop working *on purpose*; Era IV *removes*, it is never "Era III × a bigger constant." This phase is intentionally brief (a short descent, not hours), and every beat must read as *authored* — loud diegetic telegraphing ("the model no longer needs you") so the agency-removal lands as the intended thematic finale and not as a bug.

**The ending.** When `Z = 100%`, real engagement is zero, the bots feed only each other, and the win screen reads:

> *"Fully AI-generated but convincing viral slop like this is truly the end of social media."* — Ryan Broderick

That is the ending. It is allowed to be an ending — a hard credits beat (D1, §17.10) before the optional cursed coda is ever offered.

**Sequencing is the anti-boredom mechanism.** Additive-*then*-subtractive means the player first *masters* the script (active engagement) and then *watches it taken from them* as a deliberate, short finale — the exact emotional landing Universal Paperclips is most praised for — rather than passively watching an automated game play itself for fifteen hours.

---

## 6. Prestige — three nested layers + the infinite tail

```
ALGORITHM UPDATE  (soft, ~every 30–90 min)
  → Slop Tokens   (+2%/token global, √ soft-capped, additive)
  → reshuffles a slice of the Affinity matrix
  → "While You Were Out" summary on return

PULL THE PLUG / ERA JUMP  (hard, ~4 per playthrough)
  → Model Weights (persist forever)
  → unlocks the next era's new axis/mechanic
  → makes the prior era auto-solvable (keep its income, lose its friction)

MODEL-COLLAPSE RERUN  (post-win — a FINITE ladder of ~3–5 cursed runs, each adding one new constraint, then a second ending)
```

**Soft prestige (Algorithm Update)** — the AdvCap-Angels analog:

```
Tokens_available = 150 × √(lifetimeEngagements / 1e15) − tokens_already_spent
```

Square-root soft cap, no hard cap; reset when tokens-on-restart ≥ ~2× banked. Each reset **reshuffles ~15% of affinity cells** — the reshuffle is what makes it more than a number bump.

**Hard prestige (Era Jump / "Pull the Plug")** — the structural layer. Grants **Model Weights** (scaled to the era's peak output, log-compressed so they stay legible), unlocks the next era's axis, and converts the prior era to autopilot. *Not* a reskin: each jump opens genuinely new decision space — the explicit fix for AdvCap's biggest attrition source.

**The cursed coda — Model-Collapse Reruns** (the Trimps Challenge² analog and the best joke in the doc, now *finite by design*). After the Zombie Internet win and its credits beat (§17.10, resolved), the player may opt in to re-seed a fresh internet substrate *trained on the slop they already produced.* This is **not** an open-ended infinite loop — it is a **bounded ladder of ~3–5 Reruns**, each of which both (a) degrades visibly (the Habsburg/model-collapse joke) and (b) introduces exactly **one new constraint or decision**, so the coda is a staircase, not a reskin. First-pass ladder (count is a tuning constant; the *structure* is the decision):

```
Rerun 1 — Habsburg I:   affinity bands blur (Greats drift toward 0.85).
                        NEW DECISION: "Curation" unlocks — lock ONE affinity cell
                        against the blur per run. Which niche do you save?
Rerun 2 — Habsburg II:  the Trend tag taxonomy itself corrupts/merges (fewer,
                        noisier signals). Reading the room gets genuinely harder.
Rerun 3 — Habsburg III: platforms begin dying and consolidating (the dead internet
                        eats itself). Fewer page slots → harsher prioritization.
Final run — Collapse:   outputs are near-pure noise; the game offers a real
                        "let it die" button → the SECOND ending + credits.
```

The content multiplier still scales with accumulated Model Weights, and old eras self-level against current power so nothing dies mid-coda. The satire — **AI eating AI eating AI** — is fully expressed, but it *resolves* instead of looping forever. **Why finite, not infinite:** model collapse works by homogenizing the combos, and the combo system (§4) is the entire reason SLOP isn't AdvCap; an infinite degrade-loop would therefore dissolve its own heart and reproduce both AdvCap's Moon-reskin churn (the research's single biggest attrition source) and the grind-without-new-decisions endgame that even Antimatter Dimensions — the genre's longevity benchmark — is most criticized for. A bounded coda keeps the joke, gives it an ending, and drops the live-ops treadmill the §0 thesis warns against. Infinite *number*-chasing is still served inside the main climb by the uncapped Slop Tokens; only the unshippable infinite-*content* promise is cut.

**Why this still beats both references on longevity:** AdvCap had infinity but no new decisions; GDT had decisions but no New Game+ and deterministic runs. SLOP gets new axes per era, reshuffled weights per soft prestige, and a finite cursed coda whose every rung adds a constraint. No run 2 is identical to run 1 — and the whole thing knows how to end.

---

## 7. Scandal Events — the risk layer (Era III+)

Over-pushing a Topic past a Saturation/exposure threshold arms a **"Goes Mainstream"** event: a large temporary payout spike, then a backlash cycle — but the payoff is resolved as a **genuine gamble, not a notification** (D7). Scandals run as a **two-tier system** (D9): a finite set of hand-authored set-pieces on top of an infinite parameterized engine. They surface as **interrupt cards in the Feed**, never a menu.

### 7.1 The interrupt is a three-way fork (D7)

The doc's earlier "damage-control is often funnier than effective" framing made the card *correct to ignore* — i.e. a notification, not a decision. Fixed: every scandal card presents three viable options with **no dominant answer**, the best one depending on *partly-hidden current state* (how saturated the niche already is, whether Trend still favors it, whether you have a pivot recipe ready, your cash/Token position):

```
RIDE IT          take the full spike, accept the full backlash. Best when the niche
                 was cooling anyway (losing its Affinity band costs little) or you're
                 pushing a prestige and want raw volume now.
CASH OUT & PIVOT bank the spike, then retune the page off the doomed Topic *before*
                 backlash lands — a deliberate, well-timed niche-abandonment (ties
                 into Saturation/migration, §4.6). Rewards having a pivot ready.
DAMAGE-CONTROL   spend Slop Bucks / Slop Tokens to soften backlash and *keep* the
                 niche. Worth it only when the niche is uniquely valuable (current
                 Trend-matched cash cow, no good pivot) — the funny lines live here.
```

Because magnitudes are hidden (D2/D4), the player can't compute the EV exactly — they **read the room** (the factor strip, D5, shows the directional state) and gamble. This is the golden-cookie model from the idle canon: optional active play with a real skill ceiling, lucrative if engaged well, never a mandatory tax. The comedy rides *on top of* a real choice. **Backlash must be fair** (telegraphed, its risk shown in direction terms on the card); outright **page death is reserved for *ignoring* the card** or a worst-case ride, never a default.

### 7.2 Two tiers: Signature (finite) + Systemic (infinite) (D9)

**Tier 1 — Signature Scandals (finite, ~7–12, authored).** The real incidents, each firing *once* per playthrough as a memorable scripted set-piece with its verbatim line and an achievement — the "first 10/10" beats. Bounded and shippable; the *spice*, not the staple. In the D1 coda they may **return corrupted** (a cursed model-collapse Ghibli Flood), giving Reruns free texture.

| Signature Scandal | Hook | Damage-control line |
|---|---|---|
| Studio Ghibli Flood | Free image-gen melts the GPUs; the State posts a Ghiblified ICE arrest 2 days later | "our GPUs are melting" |
| Sports Illustrated | Fake author "Drew Ortiz," headshot bought from an AI-portrait site | "blame the third-party vendor (AdVon)" |
| Chicago Sun-Times List | 9 of 15 recommended books don't exist; runs 2 months after 20% layoffs | "deeply disappointed this distracts from our journalism" |
| Willy's Chocolate Experience | £35 warehouse, one bouncy castle, an evil chocolatier "who lives in the walls" | "refunds promised" |
| Air Canada Lawsuit | Chatbot invents a refund policy | "the bot is a separate legal entity" |
| Mata v. Avianca | Lawyer cites 6 hallucinated cases | "it just never occurred to me it would make up cases" |
| Pak'nSave Bot | Recipe AI suggests an "Aromatic Water Mix" (chlorine gas) | (no good options; ride it) |

**Tier 2 — Systemic Scandals (infinite, parameterized — the actual recurring mechanic).** *Any* over-pushed Topic×Platform can Go Mainstream generically: the system generates the spike → 7.1 fork → backlash procedurally, scaled to the page, drawing a flavor line from a rotating bank. These never deplete because they're a **rule, not content** — the scandal equivalent of Saturation. The *decision* (the fork) is what recurs; the wording is light flavor. This is the canon's anti-staleness lesson (parameterization beats deterministic content, which is why GDT's hand-authored events make runs 2–N feel identical).

**Live-ops is optional garnish, not a dependency (resolves the §9 contradiction with D1).** The game's scandal *system* (Tier 2) carries longevity on its own; a topical new Tier-1 card *may* drop as live-ops seasoning, but is never required. Riding a scandal remains a deliberate high-variance play — the satire being that the blow-up *is* the distribution.

### 7.3 The dark branch — the Scam Tier (optional, the moral nadir) (D10)

Late, gated, and **fully skippable** (Era III/IV; you can reach the Zombie Internet win without ever touching it), the Scam Tier is where the satire stops being only funny. It flips the operation from *slop* (imposing junk) to *fraud* (taking money from real victims) — the documented far end of the AI-slop economy: voice-clone "grandparent" scams that, per the FBI's IC3, extracted **$4.9B from US seniors 60+ in 2024 (147,000+ victims, average loss > $83,000)**.

Design rules, firm:

- **Abstracted, never operational.** The tier is a high-payout / high-**Heat** branch represented at the level of "you flipped the switch." The game depicts *that* this happens and *what it costs*, and never *how* — no voice-cloning method, scam scripts, or victim-targeting detail. Depiction is commentary; instruction would be facilitation, and SLOP stays firmly on the commentary side of that line.
- **It carries the conscience of the satire.** This is the tonal turn from "laugh and feel implicated" to "feel implicated." The dark-branch flavor surfaces the human cost (names the victims' reality) rather than glamorizing the take — the discomfort is the point, and it is what keeps the tier as critique, not power fantasy.
- **High variance with a real bust.** Heat accrues with scam income and can trigger a law-enforcement detonation (a Signature-Scandal-grade event), reinforcing that this is the dangerous edge, not free money.
- **"Whale" achievement** fires on the first dark-branch purchase — the double meaning (the F2P "whale" and the scam's victim) is the joke and the indictment at once.

*Watch-items (playtest + review):* the tier must never read as a how-to or as glamorization (mitigated by abstraction + surfacing cost + optionality); and app-store content policy on fraud themes needs checking pre-ship (the abstraction helps).

---

## 8. Bots, CPM, and the Zombie Ratio — the math

**CPM by platform** (relative $/engagement; geo modifier applied on top):

| Platform | Base CPM | Note |
|---|---|---|
| Amazon | 1.2 | actual purchases / KU page-reads |
| Facebook | 1.0 | Performance Bonus + scam-site traffic |
| LinkedIn | 0.9 | lead-gen funnels |
| Google | 0.8 | display ads + affiliate |
| YouTube Kids | 0.6 | watch-time monetization |
| TikTok | 0.4 | creator fund + gifting |
| Spotify | 0.3 | royalty pennies (the joke: you fund yourself by shrinking the real pool) |

**Geo modifier:** US audience ×1.5 ("with traffic from the USA your CPM will be very high"); cheap-but-high-volume "emotional" audiences ×0.5 CPM but ×2 raw Engagement.

**Bots and dilution.** Let `b` = bot fraction of a page's engagement.
```
E_total      = E_human × (1 + bots_assigned · botYield)
CPM_eff      = CPM_base × (1 − dilution·b)        // advertisers notice fake eyes
Z (page)     = b ; Z (global) = engagement-weighted average
```
Early: high `b` boosts E but craters CPM_eff → net loss in cash but progress toward prestige. The decision: how botted do you dare go? **Endgame inversion:** `ZombieBonus(Z)` rises with global Z and, past ~80%, *replaces* the lost human CPM — bot-on-bot engagement becomes the entire economy. At Z=100% the human side is zero and the game ends. The tradeoff resolves itself into the win condition.

**Keeping the bot decision live, then graduating it (D8).** As a single global slider, "how botted do you dare go" is a one-time lesson — you learn the CPM-vs-Z curve once and set it. Two things keep it a recurring decision through Eras II–III instead:

- **It's per-page and Trend-sensitive (via D6).** Bot-inflate is a Great Tactic only on some platforms (Facebook/TikTok; §4.4), and CPM differs per platform, so the right bot level differs per page — and the page *worth* botting hardest shifts whenever Trend changes which niche is your cash cow. The decision re-opens naturally every time the room moves; it is not one global knob.
- **A randomized "platform crackdown" event.** Platforms periodically purge fake accounts (true to life, on-theme), temporarily slashing `botYield` or spiking `dilution` on a *random* platform. This re-opens the bot decision as a gamble — re-bot the page, pivot it, or ride the lower yield — reusing the §7.1 fork. It is *parameterized*, so it recurs forever without any content treadmill.

**Era IV automation is graduation, not failure.** By Era IV the bot decision has been made hundreds of times and its repetitions are now identical-enough, so letting scripting (D3) manage bot levels is the canon's "automate the action whose 1,000th repetition equals its 10th" — correct, not a loss of agency. "Stays live" applies to Eras II–III; Era IV hands it to the script on purpose.

---

## 9. Retention, offline, and return

- **No daily-login calendar.** Retention = offline earnings + the rotating Trend meta + the **Systemic Scandal engine** (§7.2, D9), which generates infinite high-variance scandal decisions from a rule rather than a content stream. A topical hand-authored **Scandal-of-the-Week** *may* drop as optional live-ops garnish (a new Tier-1 Signature card), but is explicitly **not a dependency** — the scandal system carries retention on its own, honoring the D1/§0 rule against promising a content treadmill.
- **Offline progress:** full / near-full. Punishing absence would contradict the premise — *the slop runs itself, that's the point.* Generous offline cap; extendable; a "Time Warp"-style instant-collect exists as the one optional premium-adjacent convenience.
- **Return is celebratory.** The **While-You-Were-Out** card (idle-canon Content Summary): celebratory, never disorienting, always suggesting the next action.

  > *Your Shrimp Jesus page printed 4.2M Amens while you slept. A rival recipe mill went dark — you absorbed 80% of its traffic. The Algorithm has cooled on `animals` and now favors `AI-aesthetic`. Maybe retune the YouTube Kids page?*

- **Push notifications** (optional, capitalism-humor register): "Your slop empire misses you. The bots are getting lonely."

### 9.1 Monetization stance (D11)

**The ethics are locked; the model is a business toggle.** A game indicting the attention-exploitation economy must not run that economy's playbook on its own players — so, non-negotiably: the loop is **fully completable for free**, with **zero ads-to-progress, no pay-to-win, no FOMO-gated power, and no dark patterns.** The Steam build is ad-free regardless (Valve policy).

Within those rails, the recommended model is **ethical free-to-play**, using AdvCap's proven-ethical patterns: optional daily-capped boosts, permanent reset-surviving multipliers, and a $0.99–$99.99 cosmetic/convenience ladder — with the IAP surfaces written in the game's own satirical voice (the game selling you "boosts" becomes the joke turned on the player, *only* because it's genuinely non-predatory). The equally-legitimate alternative is **fully premium / ad-free** as the purest statement. This is the most business-/platform-dependent decision in the doc; the principles above hold under either model.

*Watch-item:* an "optional 2× boost" inside a game about engagement-juicing is an awkward mirror unless it's framed satirically and kept genuinely optional and capped — the line between "the joke is on the player" and "the game is doing the bad thing" is thin, and the guardrails are what keep it on the right side.

---

## 10. UI specification — fewer menus than AdvCap

The rule: *if a mechanic generates a decision, it gets a chip or a card in the Feed; it does not get a menu.* Total surface: **one Feed + one top strip + one optional vanity drawer.**

### The Feed (the only main screen)
A single vertical scroll of **Page cards** — AdvCap's business card with the GDT recipe folded onto its face. **Platform is the page's identity (D6):** a page *is* "the Facebook page," and the player tunes the other three chips on it. Cards have a **collapsed** state (return-glance only) and an **expanded** state (the tuning surface).

Collapsed (the default — clean, headline-only):
```
┌─────────────────────────────────────────────┐
│ [avatar]  Facebook Page · Shrimp Jesus  ×147 │  ← Platform = page identity (fixed)
│  ┌──────┐┌──────┐┌──────────┐                │
│  │Model ││Topic ││  Tactic  │   [▼ expand]   │  ← 3 tunable chips (Platform is the page)
│  └──────┘└──────┘└──────────┘                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  engagement fill           │
│  $4.2M /sec     SlopScore ×0.84 ⚠ burning    │
│            [ Buy ×1 · ×10 · ×100 · MAX ]     │
└─────────────────────────────────────────────┘
```

Expanded (adds the **factor strip** (D5) and the bot slider):
```
│  Why ×0.84:  Aff ◆G · Tac △S · Trend 🔥 · Sat ▓▓░  │  ← direction, never numbers
│  Bots ──●────────────  12%                          │
```

Tapping a chip opens the **directional preview picker (D4)** — each option shows its band vs the locked chips and a 🔥 if trending, but no magnitude:
```
 Pick Topic  (vs Facebook):
   Shrimp/Fruit Jesus    ◆ Great    🔥
   Disaster Sob-Bait     ◆ Great
   Recipe Mill           ◇ Good
   Mushroom Guide        △ Strange
```
(In early Era I only, per D2, this picker also shows the legible Trend magnitude badge — e.g. "×2" — which disappears at the first Algorithm Update.)

- **The unifying UI rule — show direction, hide magnitude.** Visible self-correcting systems (Saturation) get real gauges; hidden anti-solve systems (Trend magnitude, the Affinity/Tactic *values*) get direction-only glyphs. This is what keeps the room readable while the spreadsheet stays unreadable — and it's the lesson from GDT, whose *illegible* feedback drove players to external calculators rather than preserving mystery.
- **No build menu.** Retune by tapping chips; the decision happens where the consequence is shown, and the consequence (band + trend + saturation) is now legible *before* you commit.
- **Diagnose → fix loop.** The factor strip (D5) shows which factor is the weak link; the picker preview (D4) shows what to change it to. Together they replace the old re-tap-and-pray.
- **Accessibility (non-negotiable):** bands are coded by glyph/shape *and* label (◆ Great / ◇ Good / △ Strange), never color alone — AdvCap shipped with no colorblind option on its green bars; SLOP does not repeat that.
- **Scripting reuses this language (D3).** Era IV rule-cards are chips-with-a-condition built from the same picker vocabulary, so the endgame's "new agency" needs no new UI grammar.
- **Upgrades are cards.** Production upgrades (Comment-Bot Farm, Account-Management Software, Telegram Playbook Channel) appear inline as purchasable cards when affordable. AdvCap's upgrade menu is deleted.
- **Managers** are bought on the card and *are* "Account-Management Software" — buying one removes you from your own operation.
- **Scandals** slide in as interrupt cards. No events screen.
- **Bots** are a card (the "Bot Account Cluster"); assigning bots to a page is the slider on that page's expanded card (shown above).
- **New pages = new platform identities.** Acquiring a page (era/platform unlocks) is acquiring a Platform; scaling a page is buying geometric units of it. This is the §4 fusion expressed in the UI: page identity carries the AdvCap *scale*, the three tunable chips carry the GDT *multiplier*.

### The Algorithm Bar (the only persistent chrome)
```
[ Trending: 🕯nostalgia · 🐈animals · 😡rage ]   $1.4Qa   Z ▓▓▓░ 31%   [⚡ ALGORITHM UPDATE]
```
- **Trend ticker** (the rotating meta) — first thing you read on return.
- **Cash** and the **Zombie Ratio meter**.
- **Prestige button** — single pulsing button (Algorithm Update → then "Pull the Plug" at era end). No menu behind it.

### The vanity drawer (optional, single)
Achievements / stats / cosmetics / settings. The only thing resembling a traditional menu, and nothing load-bearing lives here.

### Number display
`break_infinity.js` from day one (→ `break_eternity.js` if Rerun ceilings demand it). Layered notation cake (scientific → engineering → standard -illions → letters), **player-selectable** in settings — frustration converted to customization.

---

## 11. Theme audit — a joke per mechanic

| Mechanic | The joke it carries |
|---|---|
| Effort is a cost, not a goal | Willison's "imposition, not quality" — the thesis, in the resource tooltip |
| Recipe chips | The entire "creative process" of slop: four dropdowns, zero craft |
| Affinity matrix | The Great combos *are* the real viral archetypes |
| Trend ticker (hidden magnitude) | Chasing an algorithm that won't tell you the rules |
| Saturation decay | Flooding a niche until it's worthless, then moving on |
| Bots / CPM tradeoff | Fake engagement to trip Suggested-For-You; the 10,000-account threshold |
| Managers = Account Software | You automate yourself out of your own farm |
| Algorithm Update prestige | Surviving an algorithm change, sold back as a reward |
| Scandal events | Going mainstream by being a disaster |
| Era escalation | The technological arms race of slop: image → video → AGI |
| AGI subtractive endgame | The AI obsoletes the worker *and* the audience |
| Dark branch / Scam Tier | Slop's far end is fraud; the moral nadir where the joke stops and the cost is named (D10) |
| Zombie Ratio → win screen | The dead internet as the victory condition |
| Model-Collapse Reruns | AI eating AI eating AI, worse and richer each generation |
| Achievements (verbatim) | "Eat at Least One Small Rock Per Day," "Tidewater Dreams," "Whale," "Zombie Internet" |

**Tone register:** *Garbage Day* / Max Read — laugh and feel implicated, never lectured. If a reference stops landing in playtest, swap in the freshest live incident; the architecture is reference-agnostic.

---

## 12. Failure-mode map

| Failure mode | Whose game | SLOP's structural defense |
|---|---|---|
| Late game is a reskin (Moon = Earth) | AdvCap | Each era adds a *new axis/mechanic*, never a rename (§5) |
| One dominant strategy (buy Oil, ignore rest) | AdvCap | **Saturation** rots any over-used recipe (§4.6) |
| Top-coefficient wall (Newspaper 1.15) | AdvCap | All unit coefficients ≤ 1.10; milestones carry the rhythm |
| Ads/events required to progress | AdvCap | Boosts optional, daily-capped; loop works ad-free |
| Fully legible → solved by a lookup table | GDT | Hidden Trend magnitude + per-prestige reshuffle (§4.5, §4.7) |
| Self-referential score → rewards sandbagging | GDT | Target is the *external, rotating* Algorithm; low-effort is the *intended* play, not an exploit (§1) |
| No replayability / deterministic runs | GDT | Reshuffles + new axes per era + degrading Reruns; no two runs identical |
| "I solved it, now what" by Y20 | GDT | Optimum is a moving target by construction |
| Reset fatigue (n-th prestige = bigger number) | idle canon | Every Algorithm Update reshuffles the map; every Era Jump opens an axis |
| Content exhaustion (player catches dev) | idle canon | Finite *shipped* ending + bounded cursed coda (D1); scandals carry longevity via a *systemic* engine, not a content stream (D9) |
| Ignorable interrupt (decision correct to skip) | design | Scandal cards are a three-way gamble with no dominant option, resolved by reading hidden state (D7) — never a notification |
| Event/content treadmill (live-ops forever) | mobile canon | Systemic Scandal engine + randomized platform-crackdowns are *rules, not content*; live-ops is optional garnish (D8, D9) |
| Automation kills the fun / "wait then click one button" | idle canon | Automate production (1,000th tick = 10th); never the recipe decision — until Era IV, where losing agency is the *authored subtractive finale* (D3): additive scripting first, then a short tap-gated collapse. Phase B is active-gated, never wall-clock-gated, to dodge AD's Doomed-Reality slog |
| Notation overflow | idle canon | `break_infinity` → `break_eternity`, chosen pre-ship |

---

## 13. Achievements (verbatim-quote titles)

| Title | Trigger |
|---|---|
| "Eat at Least One Small Rock Per Day" | First Glue-Pizza/Eat-A-Rock × Google recipe |
| "Add 1/8 Cup Non-Toxic Glue" | First Recipe-Mill scandal |
| "Train Made of Leaves: $431" | First single-page payout ≥ $431-tier |
| "$100 for 1,000 Likes" | Buy the first Gumroad Prompt Pack |
| "WRITE ME 10 PROMPT" | Unlock Midjourney Sub |
| "The Indian Audience Is Very Emotional" | First geo-target Tactic on a non-US audience |
| "Insult to Life Itself" | First Deepfake/Sora-grade model (Era III) |
| "This Is a Remarkable Submission" | Survive the Air Canada scandal |
| "A Separate Legal Entity" | Damage-control any scandal successfully |
| "Tidewater Dreams" | First Fake-Memoir × Amazon × Time-to-launch Great recipe |
| "Anti-Graffiti Gobstopper" | Trigger the Willy's Chocolate scandal |
| "Whale" | First voice-clone dark-branch / Scam Tier purchase (shipped — §7.3, D10) |
| "Our GPUs Are Melting" | First Model running at max compute |
| "I Don't Love Slop Myself" | Reach Era IV (the Jensen Huang toast) |
| "Zombie Internet" | Win (Z = 100%) |
| "Habsburg" | First Model-Collapse Rerun |

---

## 14. Flavor bank (drop straight in)

- *"WRITE ME 10 PROMPT picture OF JESUS WHICH WILLING BRING HIGH ENGAGEMENT ON FACEBOOK"* — a real creator's Midjourney prompt
- *"The Indian audience is very emotional… so you too should create a page like this and make money through Performance Bonus."*
- *"with traffic from the USA your CPM will be very high."*
- *"add a splash of vanilla extract — just to keep things interesting"* — hallucinated recipe line
- *"It just never occurred to me that it would be making up cases."* — the lawyer
- *"I don't love slop myself."* — Jensen Huang
- *"fully AI-generated but convincing viral slop like this is truly the end of social media."* — Ryan Broderick (win-screen)
- Mushroom guide identifies species by *"smell and taste"* — the deadly tell
- Resource tooltip: slop is *"mindlessly generated and thrust upon someone who didn't ask for it"* (Willison)

---

## 15. Numbers and ceilings reference

- **Unit cost:** `Cost(n+1) = Base × Coef^n`; `Cost(0→N) = Base × (1 − Coef^N)/(1 − Coef)`. Coefficients **1.07–1.10**, never higher.
- **Milestones:** cycle halves at **25 / 50 / 100 / 200 / 300 / 400** units per page + an "every page" tier at the same thresholds. Max stacking 12 halvings = **1/4096×** cycle.
- **Soft prestige:** `Tokens = 150 × √(lifetimeE / 1e15) − spent`; **+2%** global per token; reshuffle ~15% of affinity cells per reset.
- **Saturation:** `max(floor, 1/(1 + k·s)^0.5)`, floor ~0.35, shown in tooltip; recovers while idle.
- **Trend:** matched-tag ×2–×5 (hidden); suppressed-tag ×0.5; rotates 8–12 min or on prestige.
- **CPM:** Amazon 1.2 / Facebook 1.0 / LinkedIn 0.9 / Google 0.8 / YT-Kids 0.6 / TikTok 0.4 / Spotify 0.3; geo US ×1.5.
- **Cash ceiling:** $10 uncentillion (10³⁰⁷) per era; Reruns push past it via `break_eternity`.
- **Unit ceiling:** 2,147,483,647 per page slot (32-bit nod, kept as an easter-egg cap).

---

## 16. Implementation roadmap

### Phase 1 — Prove the full four-chip loop (the smallest version that proves the design)

**Thesis under test:** *Does embedding GDT's four-axis recipe inside AdvCap's frictionless cycle — defended by rotating Trend and Saturation — turn idle "waiting" into idle "deciding," without becoming a solvable lookup table?* This is the one unproven claim; everything else is scaffolding on a proven loop.

Build:
1. **The Feed** — ~6 page slots, single scroll, AdvCap card layout, milestone halvings, ×1/×10/×100/MAX.
2. **All four recipe axes** in the engine — Model, Topic, Platform, Tactic — but expressed per D6: **Platform is the page's identity**, and the player tunes Model × Topic × Tactic per card (the engine still computes the full four-axis math). The picker uses the **directional preview** (band + 🔥, no numbers — D4) and the card carries the **factor strip** on expand (D5). Even though Era pacing later introduces axes one at a time, the engine supports all four now so the core can be felt in full.
3. **Affinity matrix** (§4.3, ~10×7) + **Tactic synergy** (§4.4) + a small **Model tier** ladder (§4.2).
4. **Both anti-solve systems — non-negotiable, they ARE the thesis:** Trend ticker + Saturation decay (visible floor). Trend ships in its **legible→opaque** form (D2): readable magnitude badge pre-first-prestige, then hidden magnitude + faster rotation after the first Algorithm Update. Phase 1 must include the flip, since "does the legible→opaque transition feel like a fair reveal rather than a rug pull?" is part of what Phase 1 is testing.
5. **Economy** — Slop Bucks, Engagements, CPM-per-platform with geo, managers.
6. **One soft prestige** — Algorithm Update (Tokens + reshuffle) + While-You-Were-Out card.
7. **The Algorithm Bar** top strip + the prestige button.
8. **~10 achievements** with verbatim titles, for tone calibration.
9. **`break_infinity.js`** from the first commit.

**Phase 1 pass/fail (playtest):**
- Median check-in involves *retuning a chip*, not passive watching.
- Two players from the same start reach **different** recipe builds within 30 min.
- A returning player changes a recipe *because of* the Trend ticker, unprompted.
- Saturation visibly forces niche rotation within a session.
- Players laugh at least once at a tooltip or achievement.

If those five hold, the spine is proven and the rest is content. If not, the fix is cheap to find here.

### Phase 2 — Eras + depth (the game becomes a game)
- Gate the four axes behind Era I→III pacing (Topic×Platform → +Tactic+Saturation+Bots → +Model+Scandals).
- **Bots / Zombie Ratio** full tradeoff math (§8).
- **Scandal Events** system (§7) with the first ~5 scripted scandals.
- **Hard prestige** (Era Jumps, Model Weights).
- Additional platforms and page slots per era.

### Phase 3 — Endgame + the infinite tail (the game becomes a 1,000-hour game)
- **Era IV AGI** — recipe automation/scripting + the subtractive twist.
- **Zombie Internet win screen.**
- **Model-Collapse Reruns** (degrading-model New Game+).
- Notation upgrade to `break_eternity` if ceilings demand.
- Full achievement set, cosmetics, Scandal-of-the-Week live-ops scaffolding.

### Phase 4 — Live-ops & polish
- Swappable topical scandals as the news cycle turns.
- Reference-shelf updates (AI video/Sora slop, the next year's incidents).
- Balance passes against telemetry: D1/D7/D30, session length, prestige cadence.

---

## 17. Open questions for the planning chat

These are deliberately unresolved — flagged so the next session can decide them rather than inherit a silent assumption.

1. **Page slot identity vs. pure recipe.** ✅ **RESOLVED (D6).** Page slots are the cost/cycle scaffold *and* carry Platform identity (a page is "the Facebook page"); the player tunes Model × Topic × Tactic on top. The scaffold approach wins — it preserves AdvCap's tier feel, collapses the band-table cascade so the combo UI stays legible (§10), and matches how the real ecosystem works (durable account, variable content). The "pure generic recipe" alternative is rejected.
2. **The dark branch (voice-clone grandparent scams).** ✅ **RESOLVED (D10).** Included as the optional, late, fully-skippable **Scam Tier** (§7.3) — the moral nadir, designed as commentary not how-to: abstracted (never operational), carrying the documented human cost as the satire's conscience, with a high-Heat bust risk. "Whale" achievement confirmed. Per the steer that the game may reach the far end of AI slop's harms.
3. **How much of the Trend magnitude to hide.** ✅ **RESOLVED (D2 + D4/D5).** The governing rule is **show direction, hide magnitude**: the ticker, picker, and factor strip show *which* tags are hot (🔥) and which way each factor points, but never the numeric multiplier — except in early Era I, where Trend shows a legible magnitude badge as training wheels (D2) before going opaque at the first Algorithm Update. Magnitude stays hidden thereafter (no fuzzy "2–5×" band shown), because legible *direction* is what prevents spreadsheet-ization while hidden *magnitude* is what makes it impossible. Remaining tuning: the underlying ×2–×5 spread itself — a balance constant, not a UI question.
4. **Saturation recovery rate.** Too fast and rotation is meaningless; too slow and the player runs out of viable recipes. Needs playtest.
5. **Bot tradeoff sharpness.** Structural "stays a decision" part ✅ **RESOLVED (D8)** — botting is a per-page, Trend-sensitive choice re-opened by platform-crackdown events, then graduates to automation in Era IV. Remaining as tuning: *how punishing* the early CPM dilution is — it must feel like a real decision, not an obvious trap. Playtest constant, not structure.
6. **Era gate thresholds (Z% and lifetime E).** First-pass guesses; need pacing data.
7. **Monetization stance.** ✅ **RESOLVED (D11), see §9.1.** Ethics locked (fully completable free; zero ads-to-progress; no pay-to-win, FOMO-power, or dark patterns). Recommended model: ethical F2P (capped optional boosts, permanent reset-surviving multipliers, $0.99–$99.99 cosmetic/convenience ladder, satirically-voiced IAP); fully premium/ad-free is the equally-valid purest statement. Remaining as a business choice: which of those two models to ship — the guardrails hold under either.
8. **Platform legal exposure.** ✅ **RESOLVED (D12).** Buildable platform identities ship as transparent **parodies** ("Facebark," "Spotty" — the GDT-proven, beloved route); real names, quotes, and incidents are retained only in **editorial/nominative** content (achievement titles, Signature Scandal references, flavor), where commentary/news use is most protected. This lowers trademark-bullying/C&D exposure, which is highest precisely because SLOP depicts platforms in criminal/offensive contexts (tarnishment). **Body tables below still use real names as readable placeholders — swap to parodies at the cosmetic pass.** Not legal advice; get counsel pre-ship.
9. **Rerun degradation curve.** ✅ **RESOLVED (D1).** The coda is a *finite* ladder of ~3–5 Reruns; degradation is real but each rung also adds one new constraint (Curation lock → tag corruption → platform die-off → final collapse), and the affinity blur is intentional but bounded by the run count rather than allowed to make recipes permanently meaningless. The infinite degrade-loop is explicitly rejected (see §6 and D1) because it would dissolve the combo system that defines the game. Remaining tuning: the exact run count and per-rung blur magnitude — playtest constants, not structure.
10. **Win-then-what UX.** ✅ **RESOLVED (D1).** The Zombie Internet ending **hard-stops with a credits beat** — the finite ending gets its moment — and *then* the bounded cursed coda (§6) is offered as an explicit opt-in ("re-seed the internet?"), not an automatic flow-through. The coda's own final run delivers a second, smaller ending. The finite-ending respect the doc insists on is preserved at both stops.

---

## 18. Glossary

- **Page / Page slot** — a unit you scale geometrically; **carries a fixed Platform identity** (the "Facebook page") and runs Model × Topic × Tactic on top (D6). The AdvCap "business."
- **Recipe** — Model × Topic × Platform × Tactic, where Platform comes from the page and the other three are tuned per card. The GDT "decision."
- **Directional preview** — the picker mode that shows each option's band (◆ Great / ◇ Good / △ Strange) + 🔥 if trending, never a magnitude (D4).
- **Factor strip** — the expanded-card breakdown (`Aff · Tac · Trend · Sat`) showing which factor is weak, by direction not number (D5).
- **Show direction, hide magnitude** — the governing UI rule: visible self-correcting systems get gauges; hidden anti-solve systems get direction-only glyphs (D2/D4/D5, §10).
- **SlopScore** — the per-recipe output multiplier (§4.1).
- **Affinity** — Topic×Platform combo band (Great/Good/Strange).
- **TacticSynergy** — Tactic×Platform fit band.
- **Trend** — the rotating, partially-hidden tag-boost (the Algorithm).
- **Saturation** — the decay that rots over-used recipes.
- **Engagements (E)** — production output. **Slop Bucks ($)** — money. **Bots** — volume-vs-CPM tradeoff resource.
- **Zombie Ratio (Z)** — bot-on-bot fraction; gates hard prestige; Z=100% = win.
- **Slop Tokens** — soft prestige currency. **Model Weights** — hard prestige currency.
- **Algorithm Update** — soft prestige. **Pull the Plug / Era Jump** — hard prestige. **Model-Collapse Rerun** — the infinite post-win tail.
