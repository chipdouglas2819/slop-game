// Pure helpers for Slop City (the map). No React — everything here is
// testable against a raw GameState.

import type { GameState, TopicId } from '../engine/types'
import { MILESTONES, PAGE_SLOTS, PAGE_SLOT_BY_ID, managerCost } from '../engine/data'
import {
  nextMilestone,
  recipeKey,
  SATURATION_OVERUSED_BELOW,
  saturationMult,
  unitCost,
} from '../engine/math'

// ── Building tiers ───────────────────────────────────────────────────────
// tier 0 = empty lot; 1..7 step up at the milestone table. Height in viewBox
// px (base line y=140); window grid cols×rows.
export const TIER = [
  { h: 0, cols: 0, rows: 0 },
  { h: 18, cols: 1, rows: 1 }, // shack
  { h: 30, cols: 2, rows: 2 }, // shop
  { h: 44, cols: 2, rows: 3 }, // office
  { h: 58, cols: 2, rows: 4 }, // tower (+antenna)
  { h: 72, cols: 3, rows: 4 }, // high-rise (+neon)
  { h: 86, cols: 3, rows: 4 }, // skyscraper (+dish)
  { h: 96, cols: 3, rows: 4 }, // megatower (+billboard)
] as const

export function tierOf(units: number): number {
  if (units <= 0) return 0
  let t = 1
  for (const m of MILESTONES) if (units >= m) t++
  return t
}

export function particleCount(units: number, manager: boolean): number {
  if (!manager) return 1
  return units >= 200 ? 3 : 2
}

// Short lot names for the 9px nameplate strip — platform shortNames won't do
// (the first three lots are all Goggle).
export const SHORT_NAME: Record<string, string> = {
  comment_spam: 'Spam Farm',
  listicle_blog: 'Listicles',
  recipe_page: 'Recipes',
  facebook_page: 'Fakebook',
  amazon_storefront: 'Amazoom',
  tiktok_account: 'ClickClock',
  linkedin_page: 'WorkedIn',
}

export const TOPIC_EMOJI: Record<TopicId, string> = {
  shrimp_jesus: '🦐',
  africa_boys: '🖼',
  sob_bait: '😢',
  mushroom_guide: '🍄',
  fake_memoir: '📖',
  lofi: '🎧',
  finger_family: '👶',
  glue_pizza: '🍕',
  recipe_mill: '🍲',
  agree_fable: '💼',
}

// ── Zombie progression ──────────────────────────────────────────────────
export function zQuantize(z: number): number {
  return Math.round(z * 20) / 20 // 5% steps so styles memo cleanly
}

function hexLerp(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  const out = pa.map((va, i) => Math.round(va + (pb[i] - va) * t))
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('')
}

const skyMemo = new Map<string, { top: string; horizon: string; core: string }>()
export function skyVars(zQ: number, gameEra: number): { top: string; horizon: string; core: string } {
  const key = `${zQ}|${gameEra >= 2 ? 2 : 1}`
  let v = skyMemo.get(key)
  if (!v) {
    v = {
      top: hexLerp('#1a2240', '#0c1f16', zQ),
      horizon: hexLerp('#4a3060', '#2f5a36', zQ),
      // Era-I sun is sunset-rose, NOT amber — amber is reserved for the beacon,
      // and a gold sun is the biggest decoy on screen during the beacon teach.
      core: gameEra >= 2 ? hexLerp('#a78bfa', '#4ade80', zQ) : hexLerp('#fb7185', '#86efac', zQ),
    }
    skyMemo.set(key, v)
  }
  return v
}

// The deadpan caption ladder — the map narrates the thesis, no numbers.
export function caption(zQ: number): string {
  if (zQ < 0.1) return 'the internet (still alive)'
  if (zQ < 0.3) return "the internet (it's seen better days)"
  if (zQ < 0.5) return 'the internet (mostly bots now)'
  if (zQ < 0.8) return 'the internet (bots watching bots)'
  return 'the internet is mostly you now. pull the plug?'
}

// Litter accumulates with lifetime views and SURVIVES every prestige — the
// world stays ruined; only your score resets.
const LITTER_GLYPHS = ['🗑', '📰', '🥡', '📦', '🥤', '🗞'] as const
const LITTER_LEFTS = [6, 21, 36, 52, 67, 83] as const
export function litter(lifetimeENum: number): Array<{ glyph: string; leftPct: number }> {
  if (!(lifetimeENum > 1e6)) return []
  const n = Math.min(6, Math.floor((Math.log10(lifetimeENum) - 6) / 2) + 1)
  return LITTER_GLYPHS.slice(0, n).map((glyph, i) => ({ glyph, leftPct: LITTER_LEFTS[i] }))
}

// ── The gold beacon — at most ONE next-best-action on the whole map ──────
export type NextBestAction =
  | { kind: 'scandal'; pageIdx: number }
  | { kind: 'unlock'; slotId: string }
  | { kind: 'manager'; pageIdx: number }
  | { kind: 'buy'; pageIdx: number; count: number }
  | { kind: 'retune'; pageIdx: number }

// Which lot a beacon action points at (null for scandal — that routes to the
// interrupt card, not a lot).
export function beaconTargetSlotId(state: GameState, action: NextBestAction | null): string | null {
  if (!action || action.kind === 'scandal') return null
  if (action.kind === 'unlock') return action.slotId
  return state.pages[action.pageIdx]?.defId ?? null
}

export function nextBestAction(state: GameState): NextBestAction | null {
  // 1 — a live scandal outranks everything
  if (state.activeScandal) return { kind: 'scandal', pageIdx: state.activeScandal.pageIdx }

  // 2 — an affordable new platform
  for (const slot of PAGE_SLOTS) {
    if (state.unlockedSlots.includes(slot.id)) continue
    const cashOk = state.money.gte(slot.unlock.cash ?? 0)
    const eOk = !slot.unlock.lifetimeE || state.lifetimeE.gte(slot.unlock.lifetimeE)
    if (cashOk && eOk) return { kind: 'unlock', slotId: slot.id }
    break // only the next locked slot is actionable in the Feed; match it
  }

  // 3 — an affordable manager (automation beats more units)
  for (let i = 0; i < state.pages.length; i++) {
    const p = state.pages[i]
    if (p.units > 0 && !p.manager && state.money.gte(managerCost(PAGE_SLOT_BY_ID[p.defId]))) {
      return { kind: 'manager', pageIdx: i }
    }
  }

  // 4 — an affordable buy-to-next-milestone bundle (or a first unit)
  for (let i = 0; i < state.pages.length; i++) {
    const p = state.pages[i]
    const slot = PAGE_SLOT_BY_ID[p.defId]
    const m = nextMilestone(p.units)
    const count = p.units === 0 ? 1 : m ? m - p.units : 0
    if (count <= 0) continue
    if (state.money.gte(unitCost(slot, p.units, count))) return { kind: 'buy', pageIdx: i, count }
  }

  // 5 — an overused recipe worth refreshing. Managed pages only: the popover's
  // Tune button needs a manager, so recommending retune elsewhere dead-ends.
  if (state.progression.topicChipUnlocked) {
    for (let i = 0; i < state.pages.length; i++) {
      const p = state.pages[i]
      if (p.units <= 0 || !p.manager) continue
      if (saturationMult(state.saturation[recipeKey(p.recipe)]) < SATURATION_OVERUSED_BELOW) {
        return { kind: 'retune', pageIdx: i }
      }
    }
  }

  return null
}
