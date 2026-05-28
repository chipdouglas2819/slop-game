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

// ─────────────────────────────────────────────────────────────────────────────
// Saturation (§4.6)
// ─────────────────────────────────────────────────────────────────────────────
const SATURATION_FLOOR = 0.35
const SATURATION_K = 1e-7 // tuning constant; gives ~0.7 at s=1e7

export function saturationMult(cumulativeE: number | undefined): number {
  if (!cumulativeE) return 1.0
  const v = 1 / Math.sqrt(1 + SATURATION_K * cumulativeE)
  return Math.max(SATURATION_FLOOR, v)
}

// Recovery: idle recipes decay s back toward 0 over time (~1%/min currently)
const SATURATION_RECOVERY_PER_MS = 0.0001 / 60_000 // ~0.0001/sec → exp decay
export function saturationRecover(s: number, dtMs: number): number {
  return s * Math.exp(-SATURATION_RECOVERY_PER_MS * dtMs)
}

// Get the visible Saturation gauge value as a 0..1 "freshness" (1 = fresh, 0 = burned)
export function saturationGauge(cumulativeE: number | undefined): number {
  return saturationMult(cumulativeE) // same as the multiplier; floors at 0.35
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
  const tr = trendMult(r, state.trend)
  const sat = saturationMult(state.saturation[recipeKey(r)])
  const tokens = 1 + 0.02 * state.slopTokens // soft prestige
  // ZombieBonus omitted in Phase 1 (Era II/III gate)
  const total = modelTier * aff * tac * tr * sat * tokens
  return { total, modelTier, affinity: aff, tactic: tac, trend: tr, saturation: sat, tokens }
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

// ─────────────────────────────────────────────────────────────────────────────
// Page production — per-second
// Returns { ePerSec, dollarsPerSec, modelCostPerSec }
// ─────────────────────────────────────────────────────────────────────────────
export function pageProduction(state: GameState, page: PageState): {
  ePerSec: number
  dollarsPerSec: number
  modelCostPerSec: number
} {
  const slot = PAGE_SLOT_BY_ID[page.defId]
  if (!slot || page.units <= 0) return { ePerSec: 0, dollarsPerSec: 0, modelCostPerSec: 0 }
  const cycle = effectiveCycleSec(slot, page.units)
  const cyclesPerSec = 1 / cycle
  const score = slopScore(state, page.recipe).total
  // Geo tactic check
  const geo = page.recipe.tactic === 'geo_boomers' ? GEO_US_BOOMER_E_MULT : 1
  const baseE = slot.baseE * page.units * cyclesPerSec
  const ePerSec = baseE * score * botEMult(page.bots) * geo
  // Money side: CPM in dollars per 1000 engagements
  const cpmGeo = page.recipe.tactic === 'geo_boomers' ? GEO_US_BOOMER_CPM_MULT : state.geoMultiplier
  const cpm = effectiveCPM(PLATFORMS[slot.platform].cpm, cpmGeo, page.bots)
  const dollarsPerSec = (ePerSec / 1000) * cpm
  const modelCostPerSec = MODEL_CYCLE_COST[page.recipe.model] * page.units * cyclesPerSec
  return { ePerSec, dollarsPerSec, modelCostPerSec }
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
const TOKEN_ANCHOR = '2e16'
export function tokensAvailable(lifetimeE: Decimal, spent: number): number {
  const lifeNum = lifetimeE.div(new Decimal(TOKEN_ANCHOR)).toNumber()
  if (!isFinite(lifeNum) || lifeNum <= 0) return 0
  const total = Math.floor(150 * Math.sqrt(lifeNum))
  return Math.max(0, total - spent)
}

// Phase 1 prestige threshold — first Algorithm Update fires once tokens available ≥ 1
export function canPrestige(state: GameState): boolean {
  return tokensAvailable(state.lifetimeE, state.slopTokens) >= 1
}
