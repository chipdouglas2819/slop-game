import Decimal from 'break_infinity.js'
import type {
  GameState,
  PageSlotDef,
  PageState,
  Recipe,
  Tag,
  TrendState,
} from './types'
import {
  AFFINITY_DEFAULT,
  BAND_VALUE,
  GEO_US_BOOMER_CPM_MULT,
  GEO_US_BOOMER_E_MULT,
  MILESTONES,
  MODELS,
  MODEL_CYCLE_COST,
  PAGE_SLOT_BY_ID,
  PLATFORMS,
  TACTIC_SYNERGY,
} from './data'

// ─────────────────────────────────────────────────────────────────────────────
// Recipe → key string (saturation lookup; per-recipe identity)
// ─────────────────────────────────────────────────────────────────────────────
export function recipeKey(r: Recipe): string {
  return `${r.model}|${r.topic}|${r.platform}|${r.tactic}`
}

export function recipeTags(r: Recipe): Tag[] {
  // Union of tags carried by each chip value (§4.5)
  const m = MODELS[r.model].tags
  const t = topicTags(r)
  const p = PLATFORMS[r.platform].tags
  const tac = tacticTags(r)
  return Array.from(new Set([...m, ...t, ...p, ...tac]))
}

import { TOPICS, TACTICS } from './data'
function topicTags(r: Recipe): Tag[] {
  return TOPICS[r.topic].tags
}
function tacticTags(r: Recipe): Tag[] {
  return TACTICS[r.tactic].tags
}

// ─────────────────────────────────────────────────────────────────────────────
// Affinity / TacticSynergy lookups (band → multiplier)
// ─────────────────────────────────────────────────────────────────────────────
export function affinityBand(
  state: GameState,
  r: Recipe,
): keyof typeof BAND_VALUE {
  return state.affinity[r.topic]?.[r.platform] ?? AFFINITY_DEFAULT[r.topic][r.platform]
}

export function tacticBand(r: Recipe): keyof typeof BAND_VALUE {
  return TACTIC_SYNERGY[r.tactic][r.platform]
}

export function affinityMult(state: GameState, r: Recipe): number {
  return BAND_VALUE[affinityBand(state, r)]
}

export function tacticMult(r: Recipe): number {
  return BAND_VALUE[tacticBand(r)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend (§4.5)
// Returns the recipe's Trend multiplier given the hot/suppressed sets.
// Multiple matched tags multiply.
// ─────────────────────────────────────────────────────────────────────────────
export function trendMult(r: Recipe, trend: TrendState): number {
  const tags = recipeTags(r)
  let mult = 1.0
  for (const { tag, magnitude } of trend.hot) {
    if (tags.includes(tag)) mult *= magnitude
  }
  for (const tag of trend.suppressed) {
    if (tags.includes(tag)) mult *= 0.5
  }
  return mult
}

// Direction-only Trend reading for the UI (D4/D5): is this recipe trending up?
export function trendDirection(r: Recipe, trend: TrendState): 'hot' | 'cold' | 'neutral' {
  const tags = recipeTags(r)
  const hot = trend.hot.some((h) => tags.includes(h.tag))
  const cold = trend.suppressed.some((t) => tags.includes(t))
  if (hot && !cold) return 'hot'
  if (cold && !hot) return 'cold'
  return 'neutral'
}

// Per-OPTION trend reading for pickers: judged on the option's OWN tags only,
// so the 🔥 badge discriminates between choices. (Judging the whole candidate
// recipe made every topic light up whenever a model/platform tag was hot.)
export function tagsTrendDirection(tags: Tag[], trend: TrendState): 'hot' | 'cold' | 'neutral' {
  const hot = trend.hot.some((h) => tags.includes(h.tag))
  const cold = trend.suppressed.some((t) => tags.includes(t))
  if (hot && !cold) return 'hot'
  if (cold && !hot) return 'cold'
  return 'neutral'
}

// The bonus those own-tags contribute, as a friendly percent (legible mode).
export function tagsTrendBonusPercent(tags: Tag[], trend: TrendState): number {
  let mult = 1
  for (const h of trend.hot) if (tags.includes(h.tag)) mult *= h.magnitude
  return Math.round((mult - 1) * 100)
}

// ─────────────────────────────────────────────────────────────────────────────
// Saturation (§4.6) — TIME-based, so "freshness" is a legible timer the player
// can read: post the same recipe for a couple of minutes and it goes stale;
// switch away and it recovers in a few minutes (the migration IS the gameplay).
// The saturation map now stores ACTIVE SECONDS per recipe (not cumulative E) so
// a 1-unit page and a 400-unit page burn at the same readable rate, and the
// profit-multiplier inflation never touches it.
// ─────────────────────────────────────────────────────────────────────────────
const SATURATION_FLOOR = 0.35
const SATURATION_K = 0.006 // ~0.6 at ~5 min active; playtest said 0.012 felt relentless
const SATURATION_HALFLIFE_MS = 150_000 // idle recipe recovers half its staleness every 2.5 min

// One source of truth for "is this recipe overused?" so the warning chip and
// the freshness bar can never contradict each other.
export const SATURATION_OVERUSED_BELOW = 0.7

export function saturationMult(activeSeconds: number | undefined): number {
  if (!activeSeconds) return 1.0
  const v = 1 / Math.sqrt(1 + SATURATION_K * activeSeconds)
  return Math.max(SATURATION_FLOOR, v)
}

export function saturationRecover(s: number, dtMs: number): number {
  return s * Math.exp(-(Math.LN2 / SATURATION_HALFLIFE_MS) * dtMs)
}

// Visible "freshness" 0..1, NORMALIZED over [floor, 1] so a fully burned
// recipe shows an EMPTY bar (the raw multiplier floors at 0.35, which used to
// render as a misleading 1-2 filled cells).
export function saturationGauge(activeSeconds: number | undefined): number {
  const raw = saturationMult(activeSeconds)
  return Math.max(0, (raw - SATURATION_FLOOR) / (1 - SATURATION_FLOOR))
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone PROFIT multipliers (AdvCap §2) — the mechanic that keeps OLD tiers
// earning so you buy ALL of them (not just the newest). ×3 at 25 & 50, ×2 at
// 100/200/300/400 → ×144 on a maxed page. Applied to DOLLARS only (see
// cyclePayout) so it doesn't inflate lifetime-E / prestige timing / saturation.
// ─────────────────────────────────────────────────────────────────────────────
export function profitMult(units: number): number {
  let m = 1
  for (const ms of MILESTONES) {
    if (units >= ms) m *= ms === 25 || ms === 50 ? 3 : 2
  }
  return m
}

// Next profit-multiplier milestone + the multiplier it grants (for the UI)
export function nextProfitMilestone(units: number): { at: number; mult: number } | null {
  for (const ms of MILESTONES) {
    if (units < ms) return { at: ms, mult: ms === 25 || ms === 50 ? 3 : 2 }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// THE one production formula — per cycle. Everything (tick, selectors, scandals,
// sim) derives from this. profitMult boosts dollars; E stays un-inflated.
// ─────────────────────────────────────────────────────────────────────────────
export interface CyclePayout {
  E: number // engagements ("views") this cycle
  dollars: number // gross $ this cycle (incl. milestone profit multiplier)
  modelCost: number // $ burned running the model this cycle
}

export function cyclePayout(state: GameState, page: PageState): CyclePayout {
  const slot = PAGE_SLOT_BY_ID[page.defId]
  if (!slot || page.units <= 0) return { E: 0, dollars: 0, modelCost: 0 }
  const score = slopScore(state, page.recipe).total
  const geoE = page.recipe.tactic === 'geo_boomers' ? GEO_US_BOOMER_E_MULT : 1
  // During a platform crackdown the bot boost is voided there (the purge), but
  // CPM dilution still applies — flagged fakes don't get refunded.
  const purged =
    state.crackdown != null &&
    state.crackdown.platform === slot.platform &&
    state.lastTickAt < state.crackdown.untilMs
  const botBoost = purged ? 1 : botEMult(page.bots)
  const E = slot.baseE * page.units * score * botBoost * geoE
  const cpmGeo =
    page.recipe.tactic === 'geo_boomers' ? GEO_US_BOOMER_CPM_MULT : state.geoMultiplier
  const cpm = effectiveCPM(PLATFORMS[slot.platform].cpm, cpmGeo, page.bots)
  const permanent = state.monetization?.permanentMult ?? 1 // reset-surviving IAP boost
  const dollars = (E / 1000) * cpm * profitMult(page.units) * permanent
  const modelCost = MODEL_CYCLE_COST[page.recipe.model] * page.units
  return { E, dollars, modelCost }
}

// ─────────────────────────────────────────────────────────────────────────────
// SlopScore — the per-recipe output multiplier (§4.1)
// ─────────────────────────────────────────────────────────────────────────────
export function slopScore(state: GameState, r: Recipe): {
  total: number
  modelTier: number
  affinity: number
  tactic: number
  trend: number
  saturation: number
  tokens: number
} {
  const modelTier = MODELS[r.model].tier
  const aff = affinityMult(state, r)
  const tac = tacticMult(r)
  // Trend grace: before the Topic chip (and the ticker) exist, the player can
  // neither see nor act on trend — a suppressed-tag roll silently halving the
  // opening earnings just reads as "the game is broken". Flat 1.0 until then.
  const tr = state.progression.topicChipUnlocked ? trendMult(r, state.trend) : 1.0
  const sat = saturationMult(state.saturation[recipeKey(r)])
  // Soft prestige tokens × hard prestige weights (weights survive everything)
  const tokens = (1 + 0.02 * state.slopTokens) * weightsMult(state.modelWeights)
  const zb = zombieBonus(zombieRatio(state))
  const total = modelTier * aff * tac * tr * sat * tokens * zb
  return { total, modelTier, affinity: aff, tactic: tac, trend: tr, saturation: sat, tokens }
}

// ─────────────────────────────────────────────────────────────────────────────
// Era II — Bots & the Zombie Ratio (§8)
// Bots multiply views (botEMult) but dilute CPM: money-now vs progress. The
// Zombie Ratio is the share of all your views that are bots watching bots —
// the long-term goal of the whole game (Z=100% = the internet is dead = win).
// ─────────────────────────────────────────────────────────────────────────────

// Share of a single page's views that are bots: botE/(humanE+botE).
export function pageBotShare(botFrac: number): number {
  const boost = botEMult(botFrac) // 1 + 4b
  return (boost - 1) / boost
}

// Global Z: view-weighted bot share across producing pages. Weighted by RAW
// volume (baseE × units × botEMult) — deliberately score-free so this can be
// called from inside slopScore (zombieBonus) without recursion.
export function zombieRatio(state: GameState): number {
  let total = 0
  let bots = 0
  for (const p of state.pages) {
    if (p.units <= 0) continue
    const slot = PAGE_SLOT_BY_ID[p.defId]
    if (!slot) continue
    const vol = (slot.baseE * p.units * botEMult(p.bots)) / slot.baseCycleSec
    total += vol
    bots += vol * pageBotShare(p.bots)
  }
  return total > 0 ? bots / total : 0
}

// Past 50% Z the bots start feeding each other — engagement begets engagement
// (the early taste of the §8 endgame inversion where bot-on-bot E becomes the
// whole economy).
export function zombieBonus(z: number): number {
  return 1 + Math.max(0, z - 0.5) * 2 // up to ×1.6 at the Era-II/III max of ~80%
}

// ─────────────────────────────────────────────────────────────────────────────
// Eras + the hard prestige gate ("Pull the Plug", §6)
// ─────────────────────────────────────────────────────────────────────────────
export function era(state: GameState): 1 | 2 | 3 {
  if (state.eraJumps > 0) return 3
  if (state.algorithmUpdatesCompleted > 0) return 2
  return 1
}

export const ERA_NAMES: Record<1 | 2 | 3, string> = {
  1: 'Era I — The SEO Mill',
  2: 'Era II — Social Slop',
  3: 'Era III — Video Slop',
}

export function weightsMult(weights: number): number {
  return 1 + 0.1 * weights
}

const PLUG_MIN_UPDATES = 2
const PLUG_MIN_Z = 0.25
const PLUG_ERA_E_FLOOR = new Decimal('1e16')

// Views earned since the last plug — the gate AND the reward run on this, so
// each era must be re-earned from scratch (lifetime-based gating let the sim
// re-pull every 30 seconds forever).
export function eraLifetimeE(state: GameState): Decimal {
  return state.lifetimeE.minus(state.lifetimeEAtEraStart)
}

// Each successive era must be WORTH jumping to — the gain has to move your
// total meaningfully (otherwise +1-weight micro-plugs every couple minutes
// become the degenerate optimum; the sim found and abused it).
export function plugGainNeeded(weights: number): number {
  return Math.max(2, Math.ceil(weights * 0.2))
}

export function canPullPlug(state: GameState): boolean {
  return (
    state.algorithmUpdatesCompleted >= PLUG_MIN_UPDATES &&
    zombieRatio(state) >= PLUG_MIN_Z &&
    eraLifetimeE(state).gte(PLUG_ERA_E_FLOOR) &&
    plugWeightsGained(eraLifetimeE(state)) >= plugGainNeeded(state.modelWeights)
  )
}

// What still blocks the plug — for the UI to show as a checklist.
export function plugRequirements(state: GameState): {
  updates: { need: number; have: number; ok: boolean }
  z: { need: number; have: number; ok: boolean }
  eraE: { need: Decimal; have: Decimal; ok: boolean }
} {
  const z = zombieRatio(state)
  const eraE = eraLifetimeE(state)
  return {
    updates: {
      need: PLUG_MIN_UPDATES,
      have: state.algorithmUpdatesCompleted,
      ok: state.algorithmUpdatesCompleted >= PLUG_MIN_UPDATES,
    },
    z: { need: PLUG_MIN_Z, have: z, ok: z >= PLUG_MIN_Z },
    eraE: { need: PLUG_ERA_E_FLOOR, have: eraE, ok: eraE.gte(PLUG_ERA_E_FLOOR) },
  }
}

// Model Weights granted by pulling the plug — log-compressed on THIS ERA's views.
export function plugWeightsGained(eraE: Decimal): number {
  const ratio = eraE.div(PLUG_ERA_E_FLOOR).toNumber()
  if (!isFinite(ratio) || ratio < 1) return 0
  return Math.max(1, Math.floor(1 + 2 * Math.log10(ratio)))
}

// ─────────────────────────────────────────────────────────────────────────────
// CPM (§8) — bots dilute CPM
// ─────────────────────────────────────────────────────────────────────────────
const DILUTION = 0.5 // at b=1, CPM cut in half
export function effectiveCPM(platformCpm: number, geoMult: number, botFrac: number): number {
  return platformCpm * geoMult * Math.max(0, 1 - DILUTION * botFrac)
}

// E gain multiplier from bots
const BOT_YIELD_AT_MAX = 4 // at b=1, E ×5 total
export function botEMult(botFrac: number): number {
  return 1 + BOT_YIELD_AT_MAX * botFrac
}

// Cycle seconds after milestone halvings (§15)
export function effectiveCycleSec(slot: PageSlotDef, units: number): number {
  let halvings = 0
  for (const m of MILESTONES) {
    if (units >= m) halvings++
  }
  return slot.baseCycleSec / Math.pow(2, halvings)
}

// Next milestone for the UI ("next halving at N units")
export function nextMilestone(units: number): number | null {
  for (const m of MILESTONES) {
    if (units < m) return m
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometric unit cost (§15)
// Cost(n+1) = Base × Coef^n
// Cumulative cost for buying `count` units starting from `owned`:
//   sum = Base × Coef^owned × (Coef^count − 1) / (Coef − 1)
// ─────────────────────────────────────────────────────────────────────────────
export function unitCost(slot: PageSlotDef, owned: number, count: number): Decimal {
  if (count <= 0) return new Decimal(0)
  if (owned === 0 && slot.id === 'comment_spam' && count === 1) {
    // First Comment Spam is free (§5 "1st free")
    return new Decimal(0)
  }
  const base = new Decimal(slot.baseCost)
  const k = new Decimal(slot.costCoef)
  const startScale = k.pow(owned)
  const numerator = k.pow(count).minus(1)
  const denominator = k.minus(1)
  return base.times(startScale).times(numerator).div(denominator)
}

// How many units can the player afford? (for the MAX button)
export function maxBuyable(slot: PageSlotDef, owned: number, cash: Decimal): number {
  if (cash.lte(0)) {
    // Still allow the free first Comment Spam
    if (owned === 0 && slot.id === 'comment_spam') return 1
    return 0
  }
  // Solve for largest count s.t. unitCost(owned, count) <= cash
  // Closed form: count <= log_k( 1 + cash·(k−1)/(Base·k^owned) )
  const base = slot.baseCost
  const k = slot.costCoef
  const startScale = Math.pow(k, owned)
  const inner = 1 + (cash.toNumber() * (k - 1)) / (base * startScale)
  if (inner <= 0 || !isFinite(inner)) return 0
  const n = Math.floor(Math.log(inner) / Math.log(k))
  return Math.max(0, n)
}

// ─────────────────────────────────────────────────────────────────────────────
// Token math (soft prestige; §15)
//   Tokens = 150 × √(lifetimeE / ANCHOR) − spent
// ANCHOR retuned via the sim from the doc's first-pass 1e15 → 2e16 so the first
// prestige lands at the ~5-min economy plateau (where there's nothing left to
// buy), not at 2 min. A Phase-1 constant; revisit when Era gates exist.
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN_ANCHOR = '3e15'
// Token curve runs on views earned THIS ERA — tokens are era-scoped (a plug
// wipes them), so if the curve ran on lifetime views, one free Algorithm
// Update right after a plug would re-grant the entire bank (+600 tokens for
// nothing) and the plug's headline cost would be fake. Sim/playtest-proven.
export function tokensAvailable(state: GameState): number {
  const lifeNum = eraLifetimeE(state).div(new Decimal(TOKEN_ANCHOR)).toNumber()
  if (!isFinite(lifeNum) || lifeNum <= 0) return 0
  const total = Math.floor(150 * Math.sqrt(lifeNum))
  return Math.max(0, total - state.slopTokens)
}

// First Algorithm Update is gated behind a lifetime-views FLOOR (not just
// tokens ≥ 1) so the reset button can't appear in the first couple minutes —
// idle-canon wants the first prestige to land deeper in, as a considered choice
// (~tens of tokens at once), not the instant the economy plateaus.
//
// Repeat updates are gated on a MEANINGFUL gain (min 10 tokens AND +10% of the
// bank) — the playtest showed prestige otherwise degenerates into a button you
// mash every two minutes, snowballing thousands of tokens in an hour.
const PRESTIGE_LIFETIME_FLOOR = '1e13'
export function prestigeGainNeeded(banked: number): number {
  return Math.max(10, Math.ceil(banked * 0.1))
}
export function canPrestige(state: GameState): boolean {
  if (
    state.algorithmUpdatesCompleted === 0 &&
    eraLifetimeE(state).lt(new Decimal(PRESTIGE_LIFETIME_FLOOR))
  ) {
    return false
  }
  const gain = tokensAvailable(state)
  return gain >= prestigeGainNeeded(state.slopTokens)
}
