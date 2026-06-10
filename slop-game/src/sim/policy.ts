// A "reasonable active player" policy for the balance sim. Not optimal —
// approximates how an engaged player actually progresses, so the pacing numbers
// reflect real feel. Tweak the heuristics here to explore balance.

import type { Action } from '../game/engine/state'
import type { GameState, TacticId, TopicId, ModelId } from '../game/engine/types'
import { PAGE_SLOTS, PAGE_SLOT_BY_ID, PLATFORMS, TOPICS, TACTICS, MODELS, managerCost } from '../game/engine/data'
import {
  canPullPlug,
  era,
  profitMult,
  slopScore,
  unitCost,
  tokensAvailable,
} from '../game/engine/math'
import { scandalHints } from '../game/engine/scandals'
import Decimal from 'break_infinity.js'

// ~2 buys per 200ms step ≈ 10 purchase-actions/sec — an actively-tapping human,
// not the old superhuman 60/sec that made the sim read far faster than real play.
const BUYS_PER_STEP = 2
const PAYBACK_HORIZON_SEC = 120 // buy a unit only if it pays for itself within this

export function decideActions(state: GameState): Action[] {
  const actions: Action[] = []

  // 0) A scandal is an interrupt — resolve it before anything else. Pick the
  //    sensible option from the hidden-state hints (mirrors a smart player).
  if (state.activeScandal) {
    const h = scandalHints(state)
    let choice: 'ride' | 'cashout' | 'damage'
    if (state.activeScandal.rideOnly) choice = 'ride'
    else if (h.hasPivot) choice = 'cashout'
    else if (h.stillHot && h.canAffordDamage) choice = 'damage'
    else choice = 'ride'
    return [{ type: 'SCANDAL_RESOLVE', choice }]
  }

  // 1) Tap any page that can publish (no manager, idle cycle).
  state.pages.forEach((p, i) => {
    if (p.units > 0 && !p.manager && p.cycleProgress === 0) {
      actions.push({ type: 'TAP', pageIdx: i })
    }
  })

  // 2) Buy the free first Comment Spam unit immediately.
  state.pages.forEach((p, i) => {
    if (p.units === 0 && PAGE_SLOT_BY_ID[p.defId].baseCost === 4) {
      actions.push({ type: 'BUY_UNITS', pageIdx: i, count: 1 })
    }
  })

  // 3) Hire a manager as soon as affordable (frees the finger → real idle).
  state.pages.forEach((p, i) => {
    if (p.units > 0 && !p.manager) {
      const cost = managerCost(PAGE_SLOT_BY_ID[p.defId])
      if (state.money.gte(cost)) actions.push({ type: 'BUY_MANAGER', pageIdx: i })
    }
  })

  // 4) Retune each page to its best available recipe given the live trend.
  state.pages.forEach((p, i) => {
    if (p.units === 0) return
    if (state.progression.topicChipUnlocked) {
      const bestTopic = bestTopicFor(state, i)
      if (bestTopic && bestTopic !== p.recipe.topic) {
        actions.push({ type: 'RETUNE', pageIdx: i, axis: 'topic', value: bestTopic })
      }
    }
    if (state.progression.tacticChipUnlocked) {
      const bestTactic = bestTacticFor(state, i)
      if (bestTactic && bestTactic !== p.recipe.tactic) {
        actions.push({ type: 'RETUNE', pageIdx: i, axis: 'tactic', value: bestTactic })
      }
    }
    if (state.progression.modelChipUnlocked) {
      const bestModel = bestAffordableModel(state)
      if (bestModel && bestModel !== p.recipe.model) {
        actions.push({ type: 'RETUNE', pageIdx: i, axis: 'model', value: bestModel })
      }
    }
  })

  // 5) Acquire the next page slot when affordable.
  const nextSlot = PAGE_SLOTS.find((s) => !state.unlockedSlots.includes(s.id))
  if (nextSlot && state.money.gte(nextSlot.unlock.cash ?? 0)) {
    actions.push({ type: 'UNLOCK_SLOT', slotId: nextSlot.id })
  }

  // 6) Reinvest: buy units whose payback time is short. The payback horizon
  //    (not a cash reserve) is what balances buying-now vs. saving for the next
  //    page — geometric unit cost lengthens payback until saving wins, exactly
  //    like a real idle player. No artificial reserve (that starved buying).
  let spendable = state.money
  for (let b = 0; b < BUYS_PER_STEP; b++) {
    // Only consider units we can actually afford — picking the globally-best
    // payback page and bailing when it's unaffordable would stall the rebuild
    // (post-prestige, every tier is already unlocked).
    const pick = bestUnitBuy(state, actions, spendable)
    if (!pick) break
    if (pick.payback > PAYBACK_HORIZON_SEC) break // saving for something better
    actions.push({ type: 'BUY_UNITS', pageIdx: pick.pageIdx, count: 1 })
    spendable = spendable.minus(pick.cost)
  }

  // 6b) Era II: run bots at a moderate level on managed pages — the player
  //     trades cash for views/tokens/Zombie progress. Back off to 30% during a
  //     crackdown on that platform (the re-opened decision).
  if (era(state) >= 2) {
    state.pages.forEach((p, i) => {
      if (p.units <= 0 || !p.manager) return
      const slot = PAGE_SLOT_BY_ID[p.defId]
      const purged =
        state.crackdown != null &&
        state.crackdown.platform === slot.platform &&
        state.lastTickAt < state.crackdown.untilMs
      const target = purged ? 0.3 : 0.6
      if (Math.abs(p.bots - target) > 0.05) {
        actions.push({ type: 'SET_BOTS', pageIdx: i, fraction: target })
      }
    })
  }

  // 7) Hard prestige the moment it's available (weights compound everything);
  //    otherwise soft-prestige only when the token gain roughly doubles the
  //    bank — resetting a thriving empire for 12 tokens is a trap.
  const prestigeOff = typeof process !== 'undefined' && process.env.SIM_NO_PRESTIGE === '1'
  if (!prestigeOff && canPullPlug(state)) {
    actions.push({ type: 'PULL_PLUG', now: state.lastTickAt })
    return actions
  }
  const gain = tokensAvailable(state)
  const elapsedSec = (state.lastTickAt - state.startedAt) / 1000
  const worthIt = gain >= Math.max(40, state.slopTokens)
  if (!prestigeOff && worthIt && elapsedSec > 60 && state.algorithmUpdatesCompleted < 8) {
    actions.push({ type: 'PRESTIGE', now: state.lastTickAt })
  }

  return actions
}

// — helpers —————————————————————————————————————————————————————————————

function bestTopicFor(state: GameState, pageIdx: number): TopicId | null {
  const p = state.pages[pageIdx]
  let best: TopicId | null = null
  let bestScore = -1
  for (const t of Object.keys(TOPICS) as TopicId[]) {
    const s = slopScore(state, { ...p.recipe, topic: t }).total
    if (s > bestScore) {
      bestScore = s
      best = t
    }
  }
  return best
}

function bestTacticFor(state: GameState, pageIdx: number): TacticId | null {
  const p = state.pages[pageIdx]
  let best: TacticId | null = null
  let bestScore = -1
  for (const t of Object.keys(TACTICS) as TacticId[]) {
    const s = slopScore(state, { ...p.recipe, tactic: t }).total
    if (s > bestScore) {
      bestScore = s
      best = t
    }
  }
  return best
}

// Pick the highest-tier model whose compute cost we can comfortably sustain.
function bestAffordableModel(state: GameState): ModelId {
  // For pacing, stay on free_image unless cash is very healthy; higher tiers
  // burn compute. Approximate: upgrade only if money > 100× model cycle cost.
  const order: ModelId[] = ['free_image', 'gumroad_pack', 'tts_rig', 'midjourney']
  let pick: ModelId = 'free_image'
  for (const m of order) {
    const def = MODELS[m]
    if (def.unlock?.cash && state.money.lt(def.unlock.cash)) break
    pick = m
  }
  return pick
}

function bestUnitBuy(
  state: GameState,
  pending: Action[],
  budget: Decimal,
): { pageIdx: number; cost: Decimal; payback: number } | null {
  // Count pending buys per page so cost reflects this step's purchases.
  const pendingByPage = new Map<number, number>()
  for (const a of pending) {
    if (a.type === 'BUY_UNITS') {
      pendingByPage.set(a.pageIdx, (pendingByPage.get(a.pageIdx) ?? 0) + a.count)
    }
  }

  let best: { pageIdx: number; cost: Decimal; payback: number } | null = null
  state.pages.forEach((p, i) => {
    // Note: 0-unit pages ARE eligible — buying their first unit is how a new
    // page gets developed. (Skipping them was a bug that camped one page.)
    const slot = PAGE_SLOT_BY_ID[p.defId]
    const owned = p.units + (pendingByPage.get(i) ?? 0)
    const cost = unitCost(slot, owned, 1)
    if (cost.gt(budget)) return // only consider what we can afford this step
    // Marginal $/sec from +1 unit ≈ current per-unit contribution (incl. CPM
    // and the milestone profit multiplier, so mature pages are valued right).
    const score = slopScore(state, p.recipe).total
    const marginalE = slot.baseE * score // per cycle
    const cycleSec = slot.baseCycleSec // ignore halvings for the estimate
    const cpm = PLATFORMS[slot.platform].cpm
    const marginalDps = (marginalE / cycleSec / 1000) * cpm * profitMult(owned)
    if (marginalDps <= 0) return
    const payback = cost.toNumber() / marginalDps
    if (!best || payback < best.payback) best = { pageIdx: i, cost, payback }
  })
  return best
}
