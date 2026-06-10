import Decimal from 'break_infinity.js'
import type { Band, GameState, PlatformId, TopicId } from './types'
import { AFFINITY_DEFAULT, PLATFORMS, TOPICS } from './data'
import { tokensAvailable } from './math'
import { rollTrend } from './trend'

// Reshuffle ~15% of affinity cells (§15) — the post-prestige "the cells you
// memorized aren't where you left them" beat.
export function reshuffleAffinity(
  current: GameState['affinity'],
  fraction: number = 0.15,
  rng: () => number = Math.random,
): GameState['affinity'] {
  const topicIds = Object.keys(TOPICS) as TopicId[]
  const platformIds = Object.keys(PLATFORMS) as PlatformId[]
  const totalCells = topicIds.length * platformIds.length
  const cellsToShuffle = Math.max(1, Math.round(totalCells * fraction))

  const next: GameState['affinity'] = {} as GameState['affinity']
  for (const t of topicIds) {
    next[t] = { ...(current[t] ?? AFFINITY_DEFAULT[t]) }
  }

  for (let i = 0; i < cellsToShuffle; i++) {
    const t = topicIds[Math.floor(rng() * topicIds.length)]
    const p = platformIds[Math.floor(rng() * platformIds.length)]
    const bands: Band[] = ['great', 'good', 'strange']
    const current = next[t]![p]
    // Pick a different band, biased toward the bands that aren't the current
    const others = bands.filter((b) => b !== current)
    next[t]![p] = others[Math.floor(rng() * others.length)]
  }

  return next
}

// Apply an Algorithm Update soft prestige (§6).
// Banks available tokens, resets cash + page units (slot unlocks preserved),
// reshuffles 15% of affinity, flips Trend.legible→false on the FIRST prestige (D2).
export function applyAlgorithmUpdate(state: GameState, now: number): GameState {
  const gained = tokensAvailable(state)
  if (gained <= 0) return state

  const wasFirst = state.algorithmUpdatesCompleted === 0
  const newAffinity = reshuffleAffinity(state.affinity)

  return {
    ...state,
    money: new Decimal(0),
    engagements: new Decimal(0),
    slopTokens: state.slopTokens + gained,
    algorithmUpdatesCompleted: state.algorithmUpdatesCompleted + 1,
    pages: state.pages.map((p) => ({ ...p, units: 0, bots: 0 })),
    affinity: newAffinity,
    saturation: {}, // recipes start fresh after a shake-up
    trend: rollTrend({ legible: wasFirst ? false : state.trend.legible, now }),
    lastTickAt: now,
    geoMultiplier: 1.0,
  }
}
