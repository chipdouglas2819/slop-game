# Idle Game Design — Actionable Briefing

## Core architecture (the genre's shared spine)
- **Exponential growth + predictable milestones is the engagement engine.** Variable-ratio events (golden cookies, drops) are flavoring, not the load-bearing wall. Don't build the game around RNG compulsion — build it around legible rollover.
- **Prestige is fractal recapitulation.** Each new layer = (a) new currency, (b) re-tells the previous loop's structure in that currency, (c) adds *one* new mechanic the prior layer lacked (item system, skill tree, scripting language), (d) makes the previous layer trivially solvable but not pointless.
- **Idle is a check-in game, not a watch-it game.** The loop is *return → make a decision → leave*. The decision is the gameplay. "I'm out of cash, come back later" is a self-imposed energy system — players accept it because they chose it.

## Number-go-up
- Pick a number library **before ship**, sized one order of magnitude (in the exponent) past your design ceiling. >1e308 → `break_infinity.js`. >1e9e15 → `break_eternity.js`. Never ship past a 4-hr prototype on raw JS `Number`.
- Layer your notation cake: scientific → engineering → standard (-illions) → letters → tetration. **Let the player choose the notation** — converts a frustration into customization.
- **Make it bumpy.** Smooth curves bore. Schedule "wow" milestones; pair each with a new mechanic or an unlock, not just a bigger number.

## Soft caps & hard caps
- **Soft-cap with fractional exponents, not logs.** sqrt = 4× to double; cube root = 8× to double; ^0.14 = 128× to double (Egg, Inc. grind — use only on purpose). If forums ask "is it supposed to be this slow," you picked wrong.
- **Soft caps = curve changes** (asymptote toward a stated floor, costed power vs. uncosted cap). **Hard caps = triggers** (AD's 1.79e308 antimatter cap *is* the first-prestige condition).
- A cap feels **fair** when it is (1) visible in advance, (2) explained by a tooltip number or fiction, (3) followed by a new progression axis. Silent caps, or caps that punish a previously-rewarded strategy, read as "stop playing."
- Best pattern: the **wallet-grows cap** (Trimps Heirlooms/Nullifium) — no drop is ever wasted; recycling raises the ceiling on everything.

## Prestige layers
- **First prestige at hours 1–3.** Sooner = tutorial reset; later = where players churn before returning. Trigger it right as the player's grasp of the core multiplier goes soft.
- Per-run reset rule of thumb: reset at **+50% to +200%** prestige currency gain.
- Build **≥3 layers** with a finite endpoint — *or* commit to an explicit finite ending (Paperclips: 3 acts, 4–6 hrs, done). Players forgive a finished 6-hr game; not an unfinished 200-hr one.
- **Deep endgame is subtractive.** Once you've stacked 4 layers, layer N+1 can't just multiply a currency by a new constant — it must remove/constrain (Pelle disables prior bonuses). If your new layer is just ×constant, scrap it.

## Active vs. passive
- **Active play should be an optional multiplier blowout, never a baseline requirement.** Cookie Clicker combos = days of CpS in a 13s window, but idle still works.
- Consider letting **playstyle dictate build** (Realm Grinder: click/spell factions vs. time-scaling passive factions). Tells the desk-player and the check-in-player they're both optimal.
- **Automate after ~100 manual reps.** Earlier strips agency; later strands the player in chores. Diagnostic: if the wiki says "set the autobuyer to…", that's the right moment.
- **Automate the action whose 1,000th rep == its 10th. Never automate the one whose 1,000th rep is a new decision.** Best case, automation grants *new* agency (AD's scripting language) right as the manual loop runs out of skill expression.
- **Reward return, never punish absence.** Full/near-full offline progress. Add a Content Summary on return that suggests the next action — celebratory, not disorienting.

## Content longevity (the "what's next" problem)
Four viable strategies — pick one as primary:
1. **Replace the loop on a cadence** (AD reinvents every ~10 hrs mid-game). Dense new mechanics in the first 5 hrs (retention-critical), then one new mechanic per 10–20 hrs through mid-game, sparser in deep endgame.
2. **Finite story with an ending** (Paperclips). Refusing to be long is a legitimate, high-respect design.
3. **Breadth / MMO content** (Melvor): many orthogonal progression bars instead of deeper loops. No prestige needed.
4. **Content multipliers** (Trimps Challenge²/³): parameterize old content over current power so it stays live and self-leveling.

## Failure modes → fixes
| Failure | Cause | Fix |
|---|---|---|
| Content exhaustion | Player catches dev | Episodic drops, expansion pipeline, or finite design. *Don't* promise content that never ships. |
| Broken economy | One dominant strategy | Branch/respec-gate build paths (AD Time Studies); avoid letting one path inflate prestige currency. |
| Notation overflow | Game can't display its numbers | Right library + layered notation, chosen pre-ship. |
| "Wait 4 hrs, click once" | Soft cap set too low vs. resource ceiling; nothing to optimize | Gate by *active* resource not wall-clock, or add a parallel active loop. |
| Difficulty cliff | Wall requires a system the player meets only at the wall | Force path commitment early (skill tree) or self-level the wall (Challenge²). |
| Reset fatigue | n-th prestige rewards only "bigger number" | Bundle goal-clears into each reset; every reset must grant something beyond scale. |
| Automation kills the fun | Automated the *interesting* mechanic | Automate only the repetitive part (see rule above). |
| Dev burnout | Solo dev, long roadmap | Team up, open-source, or get studio backing. Trigger: roadmap >18 months. |

## The nine rules, stripped
1. Number library one exponent-order past your ceiling, before ship.
2. First prestige at hrs 1–3.
3. ≥3 layers + finite endpoint, or an explicit finite ending.
4. Fractional-exponent soft caps (sqrt/cube root); logs only with reason.
5. Automate after ~100 manual reps.
6. Content Summary on return for any content-gating prestige.
7. Every cap visible in the tooltip that uses it.
8. Deep endgame is subtractive — N+1 removes/constrains, doesn't ×constant.
9. Budget for developer energy (team / open-source / sponsor) as much as for design.
