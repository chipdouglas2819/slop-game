import type { Tag, TrendState } from './types'
import { ALL_TAGS } from './data'

// Rotation cadence (§4.5, D2)
export const ROTATION_MS_LEGIBLE = 15 * 60 * 1000 // 15 min before first prestige
export const ROTATION_MS_OPAQUE = 10 * 60 * 1000 // 8–12 min after; pick the midpoint
export const TELEGRAPH_LEAD_MS = 60_000 // 60s warning before a rotation lands

function pickN<T>(pool: readonly T[], n: number, rng: () => number = Math.random): T[] {
  const remaining = [...pool]
  const out: T[] = []
  for (let i = 0; i < n && remaining.length; i++) {
    const idx = Math.floor(rng() * remaining.length)
    out.push(remaining.splice(idx, 1)[0])
  }
  return out
}

export function rollTrend(opts: {
  legible: boolean
  now: number
  rng?: () => number
}): TrendState {
  const rng = opts.rng ?? Math.random
  const hotCount = 3 + Math.floor(rng() * 2) // 3 or 4 tags
  const hot = pickN(ALL_TAGS, hotCount, rng).map((tag) => ({
    tag: tag as Tag,
    magnitude: 2 + rng() * 3, // ×2 to ×5 (§15)
  }))
  const hotSet = new Set(hot.map((h) => h.tag))
  const cold = pickN(
    ALL_TAGS.filter((t) => !hotSet.has(t)),
    1 + Math.floor(rng() * 2),
    rng,
  ) as Tag[]
  return {
    hot,
    suppressed: cold,
    legible: opts.legible,
    nextRotationAt: opts.now + (opts.legible ? ROTATION_MS_LEGIBLE : ROTATION_MS_OPAQUE),
    rotationIntervalMs: opts.legible ? ROTATION_MS_LEGIBLE : ROTATION_MS_OPAQUE,
  }
}

// Telegraph: a UI signal can show "the Algorithm is shifting…" within the lead window
export function isTelegraphing(trend: TrendState, now: number): boolean {
  return now >= trend.nextRotationAt - TELEGRAPH_LEAD_MS && now < trend.nextRotationAt
}

export function shouldRotate(trend: TrendState, now: number): boolean {
  return now >= trend.nextRotationAt
}
