import type Decimal from 'break_infinity.js'

// ─────────────────────────────────────────────────────────────────────────────
// Recipe axes — Model × Topic × Platform × Tactic (§4)
// Platform is the page's identity (D6); the engine still computes all four.
// ─────────────────────────────────────────────────────────────────────────────

export type ModelId =
  | 'free_image'
  | 'gumroad_pack'
  | 'midjourney'
  | 'tts_rig'
  | 'video_gen'
  | 'deepfake'
  | 'agi'

export type TopicId =
  | 'shrimp_jesus'
  | 'africa_boys'
  | 'sob_bait'
  | 'mushroom_guide'
  | 'fake_memoir'
  | 'lofi'
  | 'finger_family'
  | 'glue_pizza'
  | 'recipe_mill'
  | 'agree_fable'

export type PlatformId =
  | 'facebook'
  | 'amazon'
  | 'spotify'
  | 'yt_kids'
  | 'google'
  | 'tiktok'
  | 'linkedin'

export type TacticId =
  | 'bot_inflate'
  | 'geo_boomers'
  | 'seo_stuff'
  | 'playlist_hijack'
  | 'time_to_launch'
  | 'agree_bait'
  | 'algo_funnel'

export interface Recipe {
  model: ModelId
  topic: TopicId
  platform: PlatformId
  tactic: TacticId
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag taxonomy — Trend operates on tag overlap (§4.5)
// ─────────────────────────────────────────────────────────────────────────────

export type Tag =
  | 'nostalgia'
  | 'animals'
  | 'rage'
  | 'ai_aesthetic'
  | 'wholesome'
  | 'fear'
  | 'religion'
  | 'money'
  | 'sex'
  | 'kids'
  | 'food'
  | 'true_crime'
  | 'parasocial'
  | 'holiday'

// ─────────────────────────────────────────────────────────────────────────────
// Bands — show direction, hide magnitude (D4/D5/§10)
// ─────────────────────────────────────────────────────────────────────────────

export type Band = 'great' | 'good' | 'strange'

// ─────────────────────────────────────────────────────────────────────────────
// Definitions for each axis option
// ─────────────────────────────────────────────────────────────────────────────

export interface ModelDef {
  id: ModelId
  name: string
  tier: number // ModelTier in SlopScore
  tags: Tag[]
  unlock?: { lifetimeE?: number; cash?: number } // first-pass; Era I lets all in
  flavor?: string
}

export interface TopicDef {
  id: TopicId
  name: string
  tags: Tag[]
  flavor?: string
}

export interface PlatformDef {
  id: PlatformId
  name: string
  shortName: string
  cpm: number // relative $/engagement (§8)
  tags: Tag[]
  flavor?: string
}

export interface TacticDef {
  id: TacticId
  name: string
  tags: Tag[]
  flavor?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Page slots — AdvCap-style geometric units carrying Platform identity (D6)
// ─────────────────────────────────────────────────────────────────────────────

export interface PageSlotDef {
  id: string
  name: string
  platform: PlatformId
  baseCost: number // first unit cost in Slop Bucks
  baseCycleSec: number // seconds per production cycle
  costCoef: number // geometric cost coefficient, 1.07–1.10 (§15)
  baseE: number // engagement produced per cycle per unit, before SlopScore
  unlock: { cash?: number; lifetimeE?: number } // gate
  flavor?: string
}

export interface PageState {
  defId: string
  units: number
  bots: number // fraction 0..1 of bot engagement on this page
  recipe: Recipe
  manager: boolean // bought = no manual tap needed
  cycleProgress: number // 0..1 — current cycle fill; tap to start when no manager
}

// Progressive disclosure markers — matches §5 Era I roll-out.
// Pre-manager: tap to publish, no chips, no Trend ticker, no FactorStrip.
// First-manager: Topic chip unlocks (and the FactorStrip + Trend ticker).
// First Algorithm Update: Tactic chip unlocks (Era II).
// (Model is engine-supported but stays cosmetically gated for later.)
export interface ProgressionState {
  topicChipUnlocked: boolean
  tacticChipUnlocked: boolean
  modelChipUnlocked: boolean
  firstTapDone: boolean
  firstManagerBought: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend — rotating partially-hidden multiplier (§4.5, D2)
// ─────────────────────────────────────────────────────────────────────────────

export interface TrendState {
  hot: Array<{ tag: Tag; magnitude: number }> // current boosted tags + multiplier
  suppressed: Tag[] // ×0.5 set
  legible: boolean // D2 — magnitude shown in early Era I
  nextRotationAt: number // ms timestamp
  rotationIntervalMs: number // 15min legible, 8–12min opaque
}

// ─────────────────────────────────────────────────────────────────────────────
// Saturation — keyed by exact recipe string (§4.6)
// Map<recipeKey, cumulativeE>
// ─────────────────────────────────────────────────────────────────────────────

export type SaturationMap = Record<string, number>

// ─────────────────────────────────────────────────────────────────────────────
// Achievement
// ─────────────────────────────────────────────────────────────────────────────

export interface AchievementDef {
  id: string
  title: string
  hint?: string // hover/long-press flavor
}

// ─────────────────────────────────────────────────────────────────────────────
// Scandal — the active "Goes Mainstream" interrupt (§7). Defined here with the
// other state types; the scandal *engine* (triggers, resolution) lives in
// scandals.ts.
// ─────────────────────────────────────────────────────────────────────────────
export interface ActiveScandal {
  instanceId: string
  signatureId: string | null // authored scandal id, or null = Systemic
  pageIdx: number
  topic: TopicId
  platform: PlatformId
  headline: string
  line: string
  spikeMult: number // HIDDEN payout multiplier
  rideOnly: boolean
  armedAt: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Full game state
// ─────────────────────────────────────────────────────────────────────────────

export interface GameState {
  // Resources
  money: Decimal
  engagements: Decimal // current per-second output snapshot (not stockpiled — flow)
  lifetimeE: Decimal // for prestige math

  // Pages
  pages: PageState[]
  unlockedSlots: string[] // PageSlotDef ids the player has bought into existence

  // Prestige
  slopTokens: number // banked
  algorithmUpdatesCompleted: number

  // Affinity table (mutable so prestige can reshuffle 15%)
  affinity: Record<TopicId, Partial<Record<PlatformId, Band>>>

  // Trend
  trend: TrendState

  // Saturation — keyed by recipeKey(recipe)
  saturation: SaturationMap

  // Achievements
  unlocked: string[] // achievement ids

  // Scandals (§7) — one active interrupt at a time; fired Signature ids persist
  activeScandal: ActiveScandal | null
  firedSignatureScandals: string[]
  lastScandalResult: string | null // transient outcome summary for a toast
  scandalCooldownUntil: number // ms timestamp — no new scandal arms before this

  // Progressive UI disclosure markers
  progression: ProgressionState

  // Timestamps
  lastTickAt: number
  startedAt: number

  // Geo target (set via the Geo-target tactic; default neutral)
  geoMultiplier: number
}
