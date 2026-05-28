import Decimal from 'break_infinity.js'
import type {
  GameState,
  ModelId,
  PageSlotDef,
  PageState,
  PlatformId,
  Recipe,
  TacticId,
  TopicId,
} from './types'
import { AFFINITY_DEFAULT, PAGE_SLOTS, PAGE_SLOT_BY_ID, managerCost } from './data'
import {
  effectiveCycleSec,
  pageProduction,
  recipeKey,
  saturationRecover,
  slopScore,
  unitCost,
} from './math'
import { rollTrend, shouldRotate } from './trend'
import { applyAlgorithmUpdate } from './prestige'

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
  }
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
    lastTickAt: now,
    startedAt: now,
    geoMultiplier: 1.0,
  }
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
  | { type: 'TICK'; now: number }
  | { type: 'PRESTIGE'; now: number }
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
    // Any tactic change unlocks the India-emotional flavor achievement
    if (value !== DEFAULT_TACTIC[recipe.platform]) s = maybeUnlock(s, 'india_emotional')
  }
  // Tidewater: fake_memoir × amazon × time_to_launch
  if (
    recipe.topic === 'fake_memoir' &&
    recipe.platform === 'amazon' &&
    recipe.tactic === 'time_to_launch'
  ) {
    s = maybeUnlock(s, 'tidewater')
  }
  return s
}

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
      let s = {
        ...state,
        money: state.money.minus(cost),
        pages,
      }
      const newUnits = pages[action.pageIdx].units
      if (newUnits >= 100) s = maybeUnlock(s, 'separate_legal_entity')
      return s
    }

    case 'UNLOCK_SLOT': {
      if (state.unlockedSlots.includes(action.slotId)) return state
      const slot = PAGE_SLOT_BY_ID[action.slotId]
      if (!slot) return state
      // Gate by cash
      const need = slot.unlock.cash ?? 0
      if (state.money.lt(need)) return state
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
      return {
        ...state,
        money: state.money.minus(cost),
        pages: state.pages.map((p, i) =>
          i === action.pageIdx ? { ...p, manager: true } : p,
        ),
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

    case 'TICK': {
      const dtMs = Math.max(0, action.now - state.lastTickAt)
      if (dtMs <= 0) return { ...state, lastTickAt: action.now }
      // Cap dt at 24h for offline progress (§9)
      const dt = Math.min(dtMs, 24 * 60 * 60 * 1000) / 1000 // seconds

      let money = state.money
      let lifetimeE = state.lifetimeE
      let totalEPerSec = 0
      const saturation = { ...state.saturation }
      const activeKeys = new Set<string>()

      const pages = state.pages.map((p) => {
        const slot = PAGE_SLOT_BY_ID[p.defId]
        if (!slot || p.units <= 0) return p
        const prod = pageProduction(state, p)
        // Continuous flow model: integrate over dt.
        // (Cycle is a UI/flavor detail — the math is continuous; manager-on
        //  is the common Phase 1 case so we treat all pages as flowing.)
        const eGained = prod.ePerSec * dt
        const dollarsGained = prod.dollarsPerSec * dt
        const modelCost = prod.modelCostPerSec * dt
        money = money.plus(dollarsGained).minus(modelCost)
        if (money.lt(0)) money = new Decimal(0) // can't go negative; cycle just halts
        lifetimeE = lifetimeE.plus(eGained)
        totalEPerSec += prod.ePerSec
        // Saturation accrual on this recipe
        const key = recipeKey(p.recipe)
        activeKeys.add(key)
        saturation[key] = (saturation[key] ?? 0) + eGained
        return p
      })

      // Idle recipes decay
      for (const key of Object.keys(saturation)) {
        if (!activeKeys.has(key)) {
          saturation[key] = saturationRecover(saturation[key], dtMs)
          if (saturation[key] < 1) delete saturation[key]
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

      // Tick-time achievements
      for (let i = 0; i < s.pages.length; i++) {
        const p = s.pages[i]
        if (!p || p.units <= 0) continue
        const prod = pageProduction(s, p)
        if (prod.dollarsPerSec >= 431) s = maybeUnlock(s, 'train_leaves')
        if (prod.modelCostPerSec >= 1) s = maybeUnlock(s, 'gpus_melting')
      }

      return s
    }

    case 'PRESTIGE': {
      const updated = applyAlgorithmUpdate(state, action.now)
      if (updated === state) return state
      return maybeUnlock(updated, 'first_prestige')
    }

    case 'HARD_RESET': {
      return initialState(action.now)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Selectors used by the UI
// ─────────────────────────────────────────────────────────────────────────────
export function totalDollarsPerSec(state: GameState): number {
  let total = 0
  for (const p of state.pages) {
    const prod = pageProduction(state, p)
    total += prod.dollarsPerSec - prod.modelCostPerSec
  }
  return total
}

export function totalEPerSec(state: GameState): number {
  let total = 0
  for (const p of state.pages) {
    total += pageProduction(state, p).ePerSec
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
