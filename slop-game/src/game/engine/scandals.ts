// Scandal Events (§7) — the risk layer. Over-pushing a recipe arms a "Goes
// Mainstream" event that resolves as a three-way gamble with no dominant option
// (D7). Two tiers (D9): Signature (finite, authored, fire-once) + Systemic
// (parameterized, infinite). Magnitudes are hidden — the player reads the room.

import Decimal from 'break_infinity.js'
import type {
  ActiveScandal,
  GameState,
  ModelId,
  PageState,
  PlatformId,
  Recipe,
  TopicId,
} from './types'
import { MODEL_CYCLE_COST, PAGE_SLOT_BY_ID, PLATFORMS, TOPICS } from './data'
import {
  botEMult,
  effectiveCPM,
  effectiveCycleSec,
  recipeKey,
  saturationMult,
  slopScore,
  trendDirection,
} from './math'

// Local page $/sec (net of model burn). Duplicated from state.ts's selector to
// avoid a circular import (state.ts imports the scandal engine).
function pageDps(state: GameState, pageIdx: number): number {
  const p = state.pages[pageIdx]
  if (!p || p.units <= 0) return 0
  const slot = PAGE_SLOT_BY_ID[p.defId]
  const score = slopScore(state, p.recipe).total
  const cycleSec = effectiveCycleSec(slot, p.units)
  const E = slot.baseE * p.units * score * botEMult(p.bots)
  const cpmGeo = p.recipe.tactic === 'geo_boomers' ? 1.5 : 1.0
  const cpm = effectiveCPM(PLATFORMS[slot.platform].cpm, cpmGeo, p.bots)
  const dollars = (E / 1000) * cpm
  const modelCost = MODEL_CYCLE_COST[p.recipe.model] * p.units
  return dollars / cycleSec - modelCost / cycleSec
}

// ─────────────────────────────────────────────────────────────────────────────
// Signature scandals (D9) — fire once each, with verbatim lines + achievements
// ─────────────────────────────────────────────────────────────────────────────
export interface SignatureScandalDef {
  id: string
  headline: string
  line: string
  achievement?: string
  rideOnly?: boolean
  // Match conditions — all present ones must hold for the page's recipe.
  matchTopic?: TopicId
  matchTopicTagAi?: boolean // matches any topic carrying the ai_aesthetic tag
  matchPlatform?: PlatformId
  matchModel?: ModelId
}

export const SIGNATURE_SCANDALS: SignatureScandalDef[] = [
  {
    id: 'ghibli_flood',
    headline: 'Studio Ghibli Flood',
    line: '"our GPUs are melting."',
    matchTopicTagAi: true,
    achievement: 'gpus_melting',
  },
  {
    id: 'drew_ortiz',
    headline: 'Sports Illustrated — "Drew Ortiz"',
    line: '"blame the third-party vendor (AdVon)."',
    matchTopic: 'fake_memoir',
    achievement: 'tidewater',
  },
  {
    id: 'sun_times',
    headline: 'Chicago Sun-Times Summer List',
    line: '"deeply disappointed this distracts from our journalism."',
    matchTopic: 'recipe_mill',
  },
  {
    id: 'willy',
    headline: "Willy's Chocolate Experience",
    line: '"refunds promised." An evil chocolatier lives in the walls.',
    matchPlatform: 'facebook',
    achievement: 'gobstopper',
  },
  {
    id: 'air_canada',
    headline: 'Air Canada Chatbot Lawsuit',
    line: '"the bot is a separate legal entity."',
    achievement: 'remarkable_submission',
  },
  {
    id: 'avianca',
    headline: 'Mata v. Avianca',
    line: '"it just never occurred to me it would make up cases."',
    matchTopic: 'glue_pizza',
  },
  {
    id: 'paknsave',
    headline: "Pak'nSave Recipe Bot",
    line: 'It suggests an "Aromatic Water Mix." That is chlorine gas.',
    matchTopic: 'recipe_mill',
    matchPlatform: 'google',
    rideOnly: true,
  },
]

// Systemic flavor bank (D9) — light rotating lines for the infinite tier.
const SYSTEMIC_LINES = [
  '"we take this very seriously."',
  '"a small number of users may have been affected."',
  '"the content did not meet our own high standards."',
  '"we have paused the feature pending review."',
  '"this does not reflect who we are as a company."',
  '"an isolated incident, now resolved."',
]

const SYSTEMIC_HEADLINES = [
  'Goes Mainstream',
  'It Hit the Timeline',
  'Screenshotted Everywhere',
  'The Quote-Tweets Have Arrived',
  'Picked Up by the Press',
]

// ─────────────────────────────────────────────────────────────────────────────
// Trigger — over-pushed recipe (heavily saturated + still producing), gated to
// after the first Algorithm Update so it doesn't hit brand-new players.
// ─────────────────────────────────────────────────────────────────────────────
const SATURATION_TRIGGER = 0.5 // below this multiplier = "over-pushed"
const ARM_CHANCE_PER_SEC = 0.012 // organic; combined with the cooldown gives
const SCANDAL_COOLDOWN_MS = 120_000 // roughly one scandal every few minutes

export function scandalsUnlocked(state: GameState): boolean {
  return state.progression.tacticChipUnlocked // unlocks at first prestige
}

export function maybeArmScandal(state: GameState, dtSec: number): ActiveScandal | null {
  if (!scandalsUnlocked(state)) return null
  if (state.activeScandal) return null
  if (state.lastTickAt < state.scandalCooldownUntil) return null

  // Find an over-pushed, producing page.
  const candidates: number[] = []
  state.pages.forEach((p, i) => {
    if (p.units <= 0) return
    const sat = saturationMult(state.saturation[recipeKey(p.recipe)])
    const dps = pageDps(state, i)
    if (sat < SATURATION_TRIGGER && dps > 0) candidates.push(i)
  })
  if (candidates.length === 0) return null

  const roll = Math.random()
  const p = 1 - Math.pow(1 - ARM_CHANCE_PER_SEC, dtSec) // dt-correct probability
  if (roll > p) return null

  const pageIdx = candidates[Math.floor(Math.random() * candidates.length)]
  return createScandal(state, pageIdx)
}

export function createScandal(state: GameState, pageIdx: number): ActiveScandal {
  const page = state.pages[pageIdx]
  const recipe = page.recipe
  const sig = pickSignature(state, recipe)
  const spikeMult = 6 + Math.random() * 18 // ×6–24, HIDDEN

  if (sig) {
    return {
      instanceId: `${sig.id}-${state.lastTickAt}`,
      signatureId: sig.id,
      pageIdx,
      topic: recipe.topic,
      platform: recipe.platform,
      headline: sig.headline,
      line: sig.line,
      spikeMult,
      rideOnly: sig.rideOnly ?? false,
      armedAt: state.lastTickAt,
    }
  }

  const headline =
    SYSTEMIC_HEADLINES[Math.floor(Math.random() * SYSTEMIC_HEADLINES.length)]
  const line = SYSTEMIC_LINES[Math.floor(Math.random() * SYSTEMIC_LINES.length)]
  return {
    instanceId: `systemic-${state.lastTickAt}-${pageIdx}`,
    signatureId: null,
    pageIdx,
    topic: recipe.topic,
    platform: recipe.platform,
    headline: `${TOPICS[recipe.topic].name} ${headline}`,
    line,
    spikeMult,
    rideOnly: false,
    armedAt: state.lastTickAt,
  }
}

function pickSignature(state: GameState, recipe: Recipe): SignatureScandalDef | null {
  for (const s of SIGNATURE_SCANDALS) {
    if (state.firedSignatureScandals.includes(s.id)) continue
    if (s.matchTopic && s.matchTopic !== recipe.topic) continue
    if (s.matchTopicTagAi && !TOPICS[recipe.topic].tags.includes('ai_aesthetic')) continue
    if (s.matchPlatform && s.matchPlatform !== recipe.platform) continue
    if (s.matchModel && s.matchModel !== recipe.model) continue
    return s
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolution — the three-way fork (D7). Returns a partial state patch.
// Magnitudes hidden; the "right" option depends on saturation + trend + cash.
// ─────────────────────────────────────────────────────────────────────────────
const SPIKE_SECONDS = 45

export type ScandalChoice = 'ride' | 'cashout' | 'damage'

export interface ScandalOutcome {
  state: GameState
  summary: string
}

export function resolveScandal(
  state: GameState,
  choice: ScandalChoice,
): ScandalOutcome {
  const sc = state.activeScandal
  if (!sc) return { state, summary: '' }
  const pageIdx = sc.pageIdx
  const page = state.pages[pageIdx]
  if (!page) return { state: clearScandal(state), summary: '' }

  const dps = pageDps(state, pageIdx)
  const baseLump = Math.max(0, dps) * SPIKE_SECONDS * sc.spikeMult
  const stillHot = trendDirection(page.recipe, state.trend) === 'hot'

  let s = state
  let summary = ''

  if (choice === 'ride') {
    // Full spike; niche burns; backlash worse if you rode a still-hot topic.
    s = addMoney(s, baseLump)
    s = burnRecipe(s, page.recipe)
    if (stillHot) {
      s = setPageUnits(s, pageIdx, Math.floor(page.units * 0.6)) // -40% units
      summary = `Rode it for ${money(baseLump)}. The backlash cost you 40% of the page — you flogged a live trend to death.`
    } else {
      summary = `Rode it for ${money(baseLump)}. The niche was already cooling; the backlash barely landed.`
    }
  } else if (choice === 'cashout') {
    // Smaller spike, then pivot to a fresh topic, no backlash.
    const lump = baseLump * 0.55
    s = addMoney(s, lump)
    const fresh = bestFreshTopic(s, pageIdx)
    if (fresh) s = retuneTopic(s, pageIdx, fresh)
    s = freshenRecipe(s, page.recipe)
    summary = `Banked ${money(lump)} and pivoted${
      fresh ? ` to ${TOPICS[fresh].name}` : ''
    } before the backlash landed.`
  } else {
    // Damage-control: pay to keep the niche; smaller spike; saturation halved.
    const cost = Math.min(s.money.toNumber(), dps * 60)
    const lump = baseLump * 0.35
    s = addMoney(s, lump - cost)
    s = halveRecipeSaturation(s, page.recipe)
    s = maybeUnlock(s, 'separate_legal_entity')
    summary = `Spent ${money(cost)} on crisis PR, kept the niche, banked ${money(
      lump,
    )}. ${sc.line}`
  }

  // Fire the signature's achievement (if any) + mark it fired.
  if (sc.signatureId) {
    const sig = SIGNATURE_SCANDALS.find((x) => x.id === sc.signatureId)
    if (sig?.achievement) s = maybeUnlock(s, sig.achievement)
    s = { ...s, firedSignatureScandals: [...s.firedSignatureScandals, sc.signatureId] }
  }

  return { state: clearScandal(s), summary }
}

// Ignoring the card (dismiss) = worst-case ride with no payout (§7).
export function ignoreScandal(state: GameState): GameState {
  const sc = state.activeScandal
  if (!sc) return state
  const page = state.pages[sc.pageIdx]
  let s = state
  if (page) {
    s = burnRecipe(s, page.recipe)
    s = setPageUnits(s, sc.pageIdx, Math.floor(page.units * 0.5))
  }
  if (sc.signatureId) {
    s = { ...s, firedSignatureScandals: [...s.firedSignatureScandals, sc.signatureId] }
  }
  return clearScandal(s)
}

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────
function clearScandal(s: GameState): GameState {
  return {
    ...s,
    activeScandal: null,
    scandalCooldownUntil: s.lastTickAt + SCANDAL_COOLDOWN_MS,
  }
}
function addMoney(s: GameState, amount: number): GameState {
  const next = s.money.plus(amount)
  return { ...s, money: next.lt(0) ? new Decimal(0) : next }
}
function money(n: number): string {
  return `$${new Decimal(n).toNumber().toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
function setPageUnits(s: GameState, pageIdx: number, units: number): GameState {
  return {
    ...s,
    pages: s.pages.map((p, i) => (i === pageIdx ? { ...p, units: Math.max(0, units) } : p)),
  }
}
function retuneTopic(s: GameState, pageIdx: number, topic: TopicId): GameState {
  return {
    ...s,
    pages: s.pages.map((p, i) =>
      i === pageIdx ? { ...p, recipe: { ...p.recipe, topic } } : p,
    ),
  }
}
function burnRecipe(s: GameState, recipe: Recipe): GameState {
  // Push saturation way up (multiplier to the floor).
  return { ...s, saturation: { ...s.saturation, [recipeKey(recipe)]: 1e9 } }
}
function freshenRecipe(s: GameState, recipe: Recipe): GameState {
  const sat = { ...s.saturation }
  delete sat[recipeKey(recipe)]
  return { ...s, saturation: sat }
}
function halveRecipeSaturation(s: GameState, recipe: Recipe): GameState {
  const key = recipeKey(recipe)
  const cur = s.saturation[key] ?? 0
  return { ...s, saturation: { ...s.saturation, [key]: cur * 0.5 } }
}
function maybeUnlock(s: GameState, id: string): GameState {
  if (s.unlocked.includes(id)) return s
  return { ...s, unlocked: [...s.unlocked, id] }
}
function bestFreshTopic(s: GameState, pageIdx: number): TopicId | null {
  const p = s.pages[pageIdx]
  if (!p) return null
  let best: TopicId | null = null
  let bestScore = -1
  for (const t of Object.keys(TOPICS) as TopicId[]) {
    if (t === p.recipe.topic) continue
    const candidate = { ...p.recipe, topic: t }
    const score = slopScore(s, candidate).total
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return best
}

// Direction-only hints for the UI (D5/D7) — never magnitudes.
export function scandalHints(state: GameState): {
  saturation: number
  stillHot: boolean
  hasPivot: boolean
  canAffordDamage: boolean
} {
  const sc = state.activeScandal
  if (!sc) return { saturation: 1, stillHot: false, hasPivot: false, canAffordDamage: false }
  const page = state.pages[sc.pageIdx] as PageState
  const sat = saturationMult(state.saturation[recipeKey(page.recipe)])
  const stillHot = trendDirection(page.recipe, state.trend) === 'hot'
  const fresh = bestFreshTopic(state, sc.pageIdx)
  const hasPivot =
    fresh != null && slopScore(state, { ...page.recipe, topic: fresh }).total > slopScore(state, page.recipe).total
  const dps = pageDps(state, sc.pageIdx)
  const canAffordDamage = state.money.gte(dps * 60)
  return { saturation: sat, stillHot, hasPivot, canAffordDamage }
}
