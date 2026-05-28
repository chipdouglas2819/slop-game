# AdVenture Capitalist — Design Briefing

Actionable mechanics, numbers, and lessons for designing an exponential idle game.

---

## 1. Core Loop Numbers (Earth)

**Cost scaling** — geometric, per-business coefficient:

`Cost(unit n+1) = Base × Coef^n` · `Cost(0→N) = Base × (1 − Coef^N) / (1 − Coef)`

| Business | Base Cost | Base Cycle | Coef |
|---|---|---|---|
| Lemonade | ~$3.74 | 1.5s | **1.07** |
| Newspaper | $60 | 3s | **1.15** ← steepest |
| Car Wash | $720 | 6s | 1.14 |
| Pizza | $8,640 | 12s | 1.13 |
| Donut | $103,680 | 24s | 1.12 |
| Shrimp | $1.24M | 96s | 1.11 |
| Hockey | $14.9M | 6.4m | 1.10 |
| Movie | $179M | 25.6m | 1.09 |
| Bank | $2.15B | ~1.7h | 1.08 |
| Oil | $25.8B | ~10.24h | 1.07 |

**Takeaway:** coefficient *descends* with tier except Newspaper spikes to 1.15. Newspaper buffs *other* businesses (×4–×9 multipliers) instead of itself — justifying its steep cost, but it becomes a price wall (see §5).

## 2. Milestones (the mechanic that carries the game)

- Cycle time **halves** at **25 / 50 / 100 / 200 / 300 / 400** units, per-business *and* again at the "every business" capitalist tier.
- Max stacking = 12 halvings = **1/4096×** cycle → 10h Oil drops to ~9s.
- Profit multipliers layered on top: typically **×3 at 25/50, ×2 at 100/200/300/400+**, rare ×4–×7,777 spikes.
- Gives a perpetual "next goal" with **zero new content cost**. Highest-value mechanic to copy.

## 3. Prestige (Angels)

`Angels = 150 × √(lifetime earnings in quadrillions) − angels already spent`

- First Angel worthwhile at **$100T lifetime** (Earth).
- Each Angel = **+2% global income**, additive (50 angels ≈ 2× income).
- Square-root = soft cap: doubling earnings yields only ~1.41× angels. No hard cap.
- Reset rule of thumb: when angels-on-restart ≥ 2× current banked.
- **Managers** (auto-run a business) are flat-priced per tier: $1K Lemonade → $10B Bank. Buy = remove all manual tapping.

## 4. Monetization (what actually earns)

- **Rewarded ads (mobile only):** 4h **2× boost**, capped **5/planet/day**. Never gates progress — Steam build is ad-free and the loop still works. Copy the cap; don't make ads mandatory.
- **Gold IAP ladder:** ~$0.99 → $99.99. Best whale purchase = **permanent multipliers that survive resets** (×3 / ×12 / ×27), not consumables.
- **Steam bundle:** $9.99 = 115 gold + cosmetic. Bracket premium as permanent-value bundles to dodge the "predatory" tag.
- **MegaBucks** (event/skill currency): permanent per-business ×7.77 → ×7,777.77 boosts.
- **Pay-to-skip:** Time Warp (14 days for 40 gold), Angel claim without reset (20 gold).

## 5. Walls (where players quit — design around these)

1. **Oil wall** — Oil dwarfs everything; meta collapses to "buy Oil, ignore rest."
2. **Newspaper coefficient wall (~300–400 units)** — 1.15 makes each Newspaper cost like a 600-tier Oil rig; breaks the "buy-to-next-milestone" rhythm. *Keep top coefficient ≤1.10 unless you commit to mid-game balance patches.*
3. **Moon = Earth reskin** — biggest source of attrition. Second prestige world must add a *new mechanic*, not rename businesses. (Mars's faster pacing fared better.)
4. **Event paywall** — free players can't realistically reach top leaderboard rewards → motivation drop.

## 6. Retention Structure

- **No daily-login calendar.** Retention = offline earnings + **weekly rotating event worlds** (7–8 days each, own businesses/managers/upgrades).
- Offline cap ~2h default, extendable to 4/12/24h via gold; Time Warp credits up to 14 days.
- Push cadence ~every 24–48h idle.

## 7. UI Pattern

- Single vertical scroll of business cards: avatar · count · **green fill progress bar** · $/cycle (→ $/sec after manager) · buy button with **×1/×10/×100/MAX** toggle.
- Top bar: cash + premium counters. Everything else (upgrades, prestige, planets, events, cosmetics) in menus.
- Feedback: real-time bar fill + floating cash popup on cycle complete.

## 8. Ceilings

- Cash cap: **$10 uncentillion (10³⁰⁷)**. Unit cap: **2,147,483,647** (32-bit int).

---

## Design Checklist (steal these, fix those)

**Steal:** milestone halving (25/50/100/200/300/400), √-prestige with +2%/angel, ad cap at 5/day, permanent reset-surviving multipliers as the whale hook.

**Fix:** top coefficient >1.10 → guaranteed wall complaint · second prestige world that's a reskin → mass attrition · ads required to progress · events unreachable for F2P.

**Watch:** D30 cliff at 2nd prestige = reskin problem · session length plateau at 5–10min = milestone cadence too slow.
