import Decimal from 'break_infinity.js'
import type {
  GameState,
  ModelId,
  PageSlotDef,
  PageState,
  PlatformId,
  ProgressionState,
  Recipe,
  TacticId,
  TopicId,
} from './types'
import { AFFINITY_DEFAULT, PAGE_SLOTS, PAGE_SLOT_BY_ID, managerCost } from './data'
import {
  affinityMult,
  cyclePayout,
  effectiveCycleSec,
  maxBuyable,
  nextMilestone,
  recipeKey,
  saturationMult,
  saturationRecover,
  slopScore,
  tacticMult,
  trendMult,
  unitCost,
} from './math'
import { rollTrend, shouldRotate } from './trend'
import { applyAlgorithmUpdate } from './prestige'
import { maybeArmScandal, resolveScandal, ignoreScandal } from './scandals'
import type { ScandalChoice } from './scandals'

// ─────────────────────────────────────────────────────────────────────────────
// Default recipe per Platform — picks a sensible Great-affinity start
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_TOPIC: Record<PlatformId, TopicId> = {
  google: 'recipe_mill',
  facebook: 'shrimp_jesus',
  amazon: 'mushroom_guide',
  spotify: 'lofi',
  yt_kids: 'finger_family',
  tiktok: 'sob_bait',
  linkedin: 'agree_fable',
}
const DEFAULT_TACTIC: Record<PlatformId, TacticId> = {
  google: 'seo_stuff',
  facebook: 'geo_boomers',
  amazon: 'time_to_launch',
  spotify: 'playlist_hijack',
  yt_kids: 'algo_funnel',
  tiktok: 'bot_inflate',
  linkedin: 'agree_bait',
}
const DEFAULT_MODEL: ModelId = 'free_image' // Era I always starts free

export function defaultRecipeFor(platform: PlatformId): Recipe {
  return {
    model: DEFAULT_MODEL,
    topic: DEFAULT_TOPIC[platform],
    tactic: DEFAULT_TACTIC[platform],
    platform,
  }
}

function makePage(slot: PageSlotDef): PageState {
  return {
    defId: slot.id,
    units: 0,
    bots: 0,
    recipe: defaultRecipeFor(slot.platform),
    manager: false,
    cycleProgress: 0,
  }
}

const INITIAL_PROGRESSION: ProgressionState = {
  topicChipUnlocked: false,
  tacticChipUnlocked: false,
  modelChipUnlocked: false,
  firstTapDone: false,
  firstManagerBought: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial state — Comment Spam is the always-unlocked starter
// ─────────────────────────────────────────────────────────────────────────────
export function initialState(now: number = Date.now()): GameState {
  return {
    money: new Decimal(0),
    engagements: new Decimal(0),
    lifetimeE: new Decimal(0),
    pages: [makePage(PAGE_SLOTS[0])], // Comment Spam, 0 units
    unlockedSlots: [PAGE_SLOTS[0].id],
    slopTokens: 0,
    algorithmUpdatesCompleted: 0,
    affinity: structuredClone(AFFINITY_DEFAULT),
    trend: rollTrend({ legible: true, now }),
    saturation: {},
    unlocked: [],
    activeScandal: null,
    firedSignatureScandals: [],
    lastScandalResult: null,
    scandalCooldownUntil: 0,
    monetization: {
      clout: 0,
      permanentMult: 1,
      boostUntilMs: 0,
      boostsToday: 0,
      boostDayStartMs: now,
      spentRealCentsPretend: 0,
    },
    progression: { ...INITIAL_PROGRESSION },
    lastTickAt: now,
    startedAt: now,
    geoMultiplier: 1.0,
  }
}

// Monetization SIMULATION constants (D11 guardrails)
const MAX_PERMANENT_MULT = 3 // hard cap — the whale hook can never become pay-to-win
const BOOST_DURATION_MS = 4 * 60 * 60 * 1000 // 4h, like AdvCap's rewarded-ad boost
const BOOST_DAILY_CAP = 5
const TIME_WARP_HOURS = 4

export function boostActive(state: GameState, now: number): boolean {
  return (state.monetization?.boostUntilMs ?? 0) > now
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────
export type Action =
  | { type: 'BUY_UNITS'; pageIdx: number; count: number }
  | { type: 'UNLOCK_SLOT'; slotId: string }
  | {
      type: 'RETUNE'
      pageIdx: number
      axis: 'model' | 'topic' | 'tactic'
      value: ModelId | TopicId | TacticId
    }
  | { type: 'BUY_MANAGER'; pageIdx: number }
  | { type: 'SET_BOTS'; pageIdx: number; fraction: number }
  | { type: 'TAP'; pageIdx: number }
  | { type: 'TICK'; now: number }
  | { type: 'PRESTIGE'; now: number }
  | { type: 'SCANDAL_RESOLVE'; choice: ScandalChoice }
  | { type: 'SCANDAL_IGNORE' }
  | { type: 'CLEAR_SCANDAL_RESULT' }
  | { type: 'BUY_CLOUT'; clout: number; centsPretend: number }
  | { type: 'BUY_PERMANENT_MULT'; cloutCost: number; mult: number }
  | { type: 'WATCH_AD_BOOST'; now: number }
  | { type: 'TIME_WARP'; cloutCost: number }
  | { type: 'HARD_RESET'; now: number }

// ─────────────────────────────────────────────────────────────────────────────
// Achievement triggers — checked after each relevant action
// ─────────────────────────────────────────────────────────────────────────────
function maybeUnlock(state: GameState, id: string): GameState {
  if (state.unlocked.includes(id)) return state
  return { ...state, unlocked: [...state.unlocked, id] }
}

function checkRetuneAchievements(
  state: GameState,
  axis: 'model' | 'topic' | 'tactic',
  value: string,
  recipe: Recipe,
): GameState {
  let s = state
  if (axis === 'topic' && value === 'glue_pizza') s = maybeUnlock(s, 'eat_a_rock')
  if (axis === 'topic' && value === 'recipe_mill' && recipe.platform === 'google') {
    s = maybeUnlock(s, 'glue_pizza')
  }
  if (axis === 'model') {
    if (value !== 'free_image') s = maybeUnlock(s, 'hundred_likes')
    if (value === 'midjourney') s = maybeUnlock(s, 'write_me_10')
  }
  if (axis === 'tactic') {
    if (value !== DEFAULT_TACTIC[recipe.platform]) s = maybeUnlock(s, 'india_emotional')
  }
  if (
    recipe.topic === 'fake_memoir' &&
    recipe.platform === 'amazon' &&
    recipe.tactic === 'time_to_launch'
  ) {
    s = maybeUnlock(s, 'tidewater')
  }
  return s
}

// Per-cycle payout — the single shared production formula lives in math.ts.
const oneCyclePayout = cyclePayout

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────
export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'BUY_UNITS': {
      const page = state.pages[action.pageIdx]
      if (!page) return state
      const slot = PAGE_SLOT_BY_ID[page.defId]
      const cost = unitCost(slot, page.units, action.count)
      if (state.money.lt(cost)) return state
      const pages = state.pages.map((p, i) =>
        i === action.pageIdx ? { ...p, units: p.units + action.count } : p,
      )
      return {
        ...state,
        money: state.money.minus(cost),
        pages,
      }
    }

    case 'UNLOCK_SLOT': {
      if (state.unlockedSlots.includes(action.slotId)) return state
      const slot = PAGE_SLOT_BY_ID[action.slotId]
      if (!slot) return state
      const need = slot.unlock.cash ?? 0
      if (state.money.lt(need)) return state
      // Lifetime-views gate too, so a single cash spike can't skip the ladder.
      if (slot.unlock.lifetimeE && state.lifetimeE.lt(slot.unlock.lifetimeE)) return state
      return {
        ...state,
        unlockedSlots: [...state.unlockedSlots, action.slotId],
        pages: [...state.pages, makePage(slot)],
      }
    }

    case 'RETUNE': {
      const page = state.pages[action.pageIdx]
      if (!page) return state
      const recipe: Recipe = { ...page.recipe, [action.axis]: action.value as never }
      const pages = state.pages.map((p, i) =>
        i === action.pageIdx ? { ...p, recipe } : p,
      )
      return checkRetuneAchievements({ ...state, pages }, action.axis, action.value, recipe)
    }

    case 'BUY_MANAGER': {
      const page = state.pages[action.pageIdx]
      if (!page || page.manager) return state
      const slot = PAGE_SLOT_BY_ID[page.defId]
      const cost = new Decimal(managerCost(slot))
      if (state.money.lt(cost)) return state
      const wasFirstManager = !state.progression.firstManagerBought
      return {
        ...state,
        money: state.money.minus(cost),
        pages: state.pages.map((p, i) =>
          i === action.pageIdx ? { ...p, manager: true } : p,
        ),
        progression: wasFirstManager
          ? {
              ...state.progression,
              firstManagerBought: true,
              topicChipUnlocked: true, // §5 Era I — Topic × Platform live after first manager
            }
          : state.progression,
      }
    }

    case 'SET_BOTS': {
      const page = state.pages[action.pageIdx]
      if (!page) return state
      const fraction = Math.max(0, Math.min(1, action.fraction))
      return {
        ...state,
        pages: state.pages.map((p, i) =>
          i === action.pageIdx ? { ...p, bots: fraction } : p,
        ),
      }
    }

    case 'TAP': {
      const page = state.pages[action.pageIdx]
      if (!page || page.units <= 0 || page.manager) return state
      if (page.cycleProgress > 0) return state // cycle already in flight
      return {
        ...state,
        pages: state.pages.map((p, i) =>
          i === action.pageIdx ? { ...p, cycleProgress: 0.0001 } : p,
        ),
        progression: { ...state.progression, firstTapDone: true },
      }
    }

    case 'TICK': {
      const dtMs = Math.max(0, action.now - state.lastTickAt)
      if (dtMs <= 0) return { ...state, lastTickAt: action.now }
      const dt = Math.min(dtMs, 24 * 60 * 60 * 1000) / 1000 // cap offline at 24h

      let money = state.money
      let lifetimeE = state.lifetimeE
      let totalEPerSec = 0
      const saturation = { ...state.saturation }
      const activeKeys = new Set<string>()
      const boost = boostActive(state, action.now) ? 2 : 1 // simulated 2× ad boost

      const pages = state.pages.map((p) => {
        const slot = PAGE_SLOT_BY_ID[p.defId]
        if (!slot || p.units <= 0) return p

        // Pre-tap, no-manager page: idle.
        if (!p.manager && p.cycleProgress === 0) return p

        const cycleSec = effectiveCycleSec(slot, p.units)
        const oneCycle = oneCyclePayout(state, p)
        const progress = p.cycleProgress + dt / cycleSec
        let completed = Math.floor(progress)
        if (!p.manager) completed = Math.min(completed, 1) // one cycle per tap

        if (completed > 0) {
          const eGained = oneCycle.E * completed
          const dollarsGained = oneCycle.dollars * completed * boost
          const modelCost = oneCycle.modelCost * completed
          money = money.plus(dollarsGained).minus(modelCost)
          if (money.lt(0)) money = new Decimal(0)
          lifetimeE = lifetimeE.plus(eGained)
        }

        // Saturation is TIME-based: accrue the active seconds onto this recipe
        // (independent of units/E/profit), so "freshness" reads as a steady
        // timer and a flooded niche cools while you run something else.
        const key = recipeKey(p.recipe)
        activeKeys.add(key)
        saturation[key] = (saturation[key] ?? 0) + dt

        // For a manager-on page, show a sensible /sec contribution
        if (p.manager) {
          totalEPerSec += oneCycle.E / cycleSec
        }

        // Compute next progress: managers keep going, non-managers stop after 1
        let next: number
        if (p.manager) {
          next = progress - completed
        } else {
          next = completed > 0 ? 0 : progress
        }

        if (completed > 0 || next !== p.cycleProgress) {
          return { ...p, cycleProgress: Math.max(0, Math.min(1, next)) }
        }
        return p
      })

      // Idle recipes recover (staleness decays with a ~2.5min half-life)
      for (const key of Object.keys(saturation)) {
        if (!activeKeys.has(key)) {
          saturation[key] = saturationRecover(saturation[key], dtMs)
          if (saturation[key] < 0.5) delete saturation[key]
        }
      }

      // Trend rotation
      let trend = state.trend
      if (shouldRotate(trend, action.now)) {
        trend = rollTrend({ legible: trend.legible, now: action.now })
      }

      let s: GameState = {
        ...state,
        money,
        engagements: new Decimal(totalEPerSec),
        lifetimeE,
        pages,
        saturation,
        trend,
        lastTickAt: action.now,
      }

      // Tick-time achievements (only check manager-on pages — they have a real /sec)
      for (const p of s.pages) {
        if (!p || p.units <= 0 || !p.manager) continue
        const oc = oneCyclePayout(s, p)
        const cycleSec = effectiveCycleSec(PAGE_SLOT_BY_ID[p.defId], p.units)
        const dollarsPerSec = oc.dollars / cycleSec
        const modelCostPerSec = oc.modelCost / cycleSec
        if (dollarsPerSec >= 431) s = maybeUnlock(s, 'train_leaves')
        if (modelCostPerSec >= 1) s = maybeUnlock(s, 'gpus_melting')
      }

      // Scandals (§7) — over-pushed recipe may Go Mainstream. Arm at most one.
      if (!s.activeScandal) {
        const scandal = maybeArmScandal(s, dt)
        if (scandal) s = { ...s, activeScandal: scandal }
      }

      return s
    }

    case 'SCANDAL_RESOLVE': {
      if (!state.activeScandal) return state
      const { state: next, summary } = resolveScandal(state, action.choice)
      return { ...next, lastScandalResult: summary }
    }

    case 'SCANDAL_IGNORE': {
      if (!state.activeScandal) return state
      return {
        ...ignoreScandal(state),
        lastScandalResult: 'You ignored it. The niche imploded and took half the page with it.',
      }
    }

    case 'CLEAR_SCANDAL_RESULT': {
      return { ...state, lastScandalResult: null }
    }

    case 'PRESTIGE': {
      const updated = applyAlgorithmUpdate(state, action.now)
      if (updated === state) return state
      let s = maybeUnlock(updated, 'first_prestige')
      // §5 Era II — Tactic chip unlocks at the first Algorithm Update
      s = {
        ...s,
        progression: {
          ...s.progression,
          tacticChipUnlocked: true,
          modelChipUnlocked: true, // also unlock model at this beat for the prototype
        },
      }
      return s
    }

    case 'BUY_CLOUT': {
      const m = state.monetization
      return {
        ...state,
        monetization: {
          ...m,
          clout: m.clout + action.clout,
          spentRealCentsPretend: m.spentRealCentsPretend + action.centsPretend,
        },
      }
    }

    case 'BUY_PERMANENT_MULT': {
      const m = state.monetization
      if (m.clout < action.cloutCost) return state
      const next = Math.min(MAX_PERMANENT_MULT, m.permanentMult + action.mult)
      if (next <= m.permanentMult) return state // already capped
      return {
        ...state,
        monetization: { ...m, clout: m.clout - action.cloutCost, permanentMult: next },
      }
    }

    case 'WATCH_AD_BOOST': {
      const m = state.monetization
      let boostsToday = m.boostsToday
      let boostDayStartMs = m.boostDayStartMs
      if (action.now - boostDayStartMs > 24 * 60 * 60 * 1000) {
        boostsToday = 0
        boostDayStartMs = action.now
      }
      if (boostsToday >= BOOST_DAILY_CAP) return state
      const base = Math.max(action.now, m.boostUntilMs)
      return {
        ...state,
        monetization: {
          ...m,
          boostUntilMs: base + BOOST_DURATION_MS,
          boostsToday: boostsToday + 1,
          boostDayStartMs,
        },
      }
    }

    case 'TIME_WARP': {
      const m = state.monetization
      if (m.clout < action.cloutCost) return state
      const grant = Math.max(0, totalDollarsPerSec(state)) * TIME_WARP_HOURS * 3600
      return {
        ...state,
        money: state.money.plus(grant),
        monetization: { ...m, clout: m.clout - action.cloutCost },
      }
    }

    case 'HARD_RESET': {
      return initialState(action.now)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Selectors used by the UI
// ─────────────────────────────────────────────────────────────────────────────

// Total $/sec across all manager-on pages — used by the header readout.
export function totalDollarsPerSec(state: GameState): number {
  let total = 0
  for (const p of state.pages) {
    if (!p.manager || p.units <= 0) continue
    const oc = oneCyclePayout(state, p)
    const cycleSec = effectiveCycleSec(PAGE_SLOT_BY_ID[p.defId], p.units)
    total += oc.dollars / cycleSec - oc.modelCost / cycleSec
  }
  return total
}

export function totalEPerSec(state: GameState): number {
  let total = 0
  for (const p of state.pages) {
    if (!p.manager || p.units <= 0) continue
    const oc = oneCyclePayout(state, p)
    const cycleSec = effectiveCycleSec(PAGE_SLOT_BY_ID[p.defId], p.units)
    total += oc.E / cycleSec
  }
  return total
}

export function pageScore(state: GameState, pageIdx: number): ReturnType<typeof slopScore> | null {
  const p = state.pages[pageIdx]
  if (!p) return null
  return slopScore(state, p.recipe)
}

export function pageCycleSec(state: GameState, pageIdx: number): number | null {
  const p = state.pages[pageIdx]
  if (!p) return null
  return effectiveCycleSec(PAGE_SLOT_BY_ID[p.defId], p.units)
}

// Per-tap payout (for the Publish button label).
export function pageTapPayout(state: GameState, pageIdx: number): {
  dollars: number
  modelCost: number
} {
  const p = state.pages[pageIdx]
  if (!p) return { dollars: 0, modelCost: 0 }
  const oc = oneCyclePayout(state, p)
  return { dollars: oc.dollars, modelCost: oc.modelCost }
}

// Per-second payout (for manager-on pages).
export function pageDollarsPerSec(state: GameState, pageIdx: number): number {
  const p = state.pages[pageIdx]
  if (!p || p.units <= 0) return 0
  const oc = oneCyclePayout(state, p)
  const cycleSec = effectiveCycleSec(PAGE_SLOT_BY_ID[p.defId], p.units)
  return oc.dollars / cycleSec - oc.modelCost / cycleSec
}

// no-op references so re-exports stay tree-shakable
export { affinityMult, tacticMult, trendMult, saturationMult, maxBuyable, nextMilestone }
