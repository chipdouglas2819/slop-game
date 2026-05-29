// All constants / tables. Names follow D12: real-name placeholders here for the
// design pass — swap to parodies (Facebark, Spotty, …) at the cosmetic pass.

import type {
  Band,
  ModelDef,
  PlatformDef,
  TacticDef,
  TopicDef,
  PageSlotDef,
  ModelId,
  TopicId,
  PlatformId,
  TacticId,
  AchievementDef,
} from './types'

// Band numeric values (§4.3)
export const BAND_VALUE: Record<Band, number> = {
  great: 1.0,
  good: 0.85,
  strange: 0.6,
}

export const BAND_GLYPH: Record<Band, string> = {
  great: '◆',
  good: '◇',
  strange: '△',
}

export const BAND_LABEL: Record<Band, string> = {
  great: 'Great',
  good: 'Good',
  strange: 'Weak',
}

// ─────────────────────────────────────────────────────────────────────────────
// Models (§4.2)
// ─────────────────────────────────────────────────────────────────────────────

export const MODELS: Record<ModelId, ModelDef> = {
  free_image: {
    id: 'free_image',
    name: 'Free MS Image Creator',
    tier: 1.0,
    tags: ['ai_aesthetic'],
    flavor: "It's free, that's the whole pitch.",
  },
  gumroad_pack: {
    id: 'gumroad_pack',
    name: 'Gumroad Prompt Pack',
    tier: 1.4,
    tags: ['ai_aesthetic', 'money'],
    unlock: { cash: 1000 },
    flavor: 'Buy the course that teaches the course.',
  },
  midjourney: {
    id: 'midjourney',
    name: 'Midjourney Sub',
    tier: 2.2,
    tags: ['ai_aesthetic', 'religion'],
    unlock: { cash: 50_000 },
    flavor: 'WRITE ME 10 PROMPT picture OF JESUS…',
  },
  tts_rig: {
    id: 'tts_rig',
    name: 'Stock-Voice / TTS Rig',
    tier: 2.0,
    tags: ['ai_aesthetic', 'parasocial'],
    unlock: { cash: 80_000 },
    flavor: 'AI voiceover reading r/AITA.',
  },
  video_gen: {
    id: 'video_gen',
    name: 'Video Gen',
    tier: 4.0,
    tags: ['ai_aesthetic', 'kids'],
    unlock: { cash: 5_000_000 },
    flavor: 'Cursed CGI, the Cocomelon cousin.',
  },
  deepfake: {
    id: 'deepfake',
    name: 'Deepfake / Sora-grade',
    tier: 7.5,
    tags: ['ai_aesthetic', 'sex'],
    unlock: { cash: 200_000_000 },
    flavor: 'our GPUs are melting.',
  },
  agi: {
    id: 'agi',
    name: 'Custom AGI',
    tier: 15,
    tags: ['ai_aesthetic'],
    unlock: { cash: 1e12 },
    flavor: 'It writes the recipes now.',
  },
}

// Model-compute cost per cycle (multiplied into the page's per-cycle $ burn)
// Era I lets free_image run free; later tiers gate by cash.
export const MODEL_CYCLE_COST: Record<ModelId, number> = {
  free_image: 0,
  gumroad_pack: 0,
  midjourney: 5,
  tts_rig: 4,
  video_gen: 200,
  deepfake: 5000,
  agi: 1_000_000,
}

// ─────────────────────────────────────────────────────────────────────────────
// Topics (§4.3)
// ─────────────────────────────────────────────────────────────────────────────

export const TOPICS: Record<TopicId, TopicDef> = {
  shrimp_jesus: { id: 'shrimp_jesus', name: 'Shrimp / Fruit Jesus', tags: ['religion', 'ai_aesthetic'] },
  africa_boys: { id: 'africa_boys', name: '"Africa Boys" Sculpture', tags: ['wholesome', 'parasocial', 'ai_aesthetic'] },
  sob_bait: { id: 'sob_bait', name: 'Disaster Sob-Bait', tags: ['fear', 'rage', 'parasocial'] },
  mushroom_guide: { id: 'mushroom_guide', name: 'Mushroom Foraging Guide', tags: ['wholesome', 'food', 'fear'] },
  fake_memoir: { id: 'fake_memoir', name: 'Fake Memoir of Real Author', tags: ['parasocial', 'money'] },
  lofi: { id: 'lofi', name: 'Lo-Fi / Ambient', tags: ['nostalgia', 'wholesome'] },
  finger_family: { id: 'finger_family', name: 'Finger-Family / Nursery', tags: ['kids', 'nostalgia'] },
  glue_pizza: { id: 'glue_pizza', name: 'Glue-Pizza / Eat-A-Rock', tags: ['food', 'ai_aesthetic'] },
  recipe_mill: { id: 'recipe_mill', name: 'Recipe Mill', tags: ['food'] },
  agree_fable: { id: 'agree_fable', name: '"Agree?" Inspirational Fable', tags: ['wholesome', 'parasocial', 'money'] },
}

// ─────────────────────────────────────────────────────────────────────────────
// Platforms (§4.3 + §8 CPM)
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORMS: Record<PlatformId, PlatformDef> = {
  facebook: { id: 'facebook', name: 'Facebook', shortName: 'FB', cpm: 1.0, tags: ['parasocial', 'money'] },
  amazon: { id: 'amazon', name: 'Amazon', shortName: 'Amz', cpm: 1.2, tags: ['money'] },
  spotify: { id: 'spotify', name: 'Spotify', shortName: 'Spt', cpm: 0.3, tags: ['nostalgia'] },
  yt_kids: { id: 'yt_kids', name: 'YouTube Kids', shortName: 'YTK', cpm: 0.6, tags: ['kids'] },
  google: { id: 'google', name: 'Google', shortName: 'Goog', cpm: 0.8, tags: ['money', 'food'] },
  tiktok: { id: 'tiktok', name: 'TikTok', shortName: 'TT', cpm: 0.4, tags: ['rage', 'sex'] },
  linkedin: { id: 'linkedin', name: 'LinkedIn', shortName: 'LI', cpm: 0.9, tags: ['money', 'parasocial'] },
}

// ─────────────────────────────────────────────────────────────────────────────
// Tactics (§4.4)
// ─────────────────────────────────────────────────────────────────────────────

export const TACTICS: Record<TacticId, TacticDef> = {
  bot_inflate: { id: 'bot_inflate', name: 'Bot-inflate engagement', tags: [] },
  geo_boomers: { id: 'geo_boomers', name: 'Geo-target US boomers', tags: ['money', 'parasocial'] },
  seo_stuff: { id: 'seo_stuff', name: 'SEO keyword-stuff', tags: ['money'] },
  playlist_hijack: { id: 'playlist_hijack', name: 'Editorial-playlist hijack', tags: ['nostalgia'] },
  time_to_launch: { id: 'time_to_launch', name: 'Time-to-a-real-launch', tags: ['money'] },
  agree_bait: { id: 'agree_bait', name: '"Agree?" engagement bait', tags: ['parasocial', 'wholesome'] },
  algo_funnel: { id: 'algo_funnel', name: 'Algorithm-pipeline funnel', tags: ['kids', 'ai_aesthetic'] },
}

// ─────────────────────────────────────────────────────────────────────────────
// Affinity matrix — Topic × Platform (§4.3)
// ─────────────────────────────────────────────────────────────────────────────

const G: Band = 'great'
const g: Band = 'good'
const S: Band = 'strange'

export const AFFINITY_DEFAULT: Record<TopicId, Record<PlatformId, Band>> = {
  shrimp_jesus:  { facebook: G, amazon: S, spotify: S, yt_kids: S, google: g, tiktok: g, linkedin: S },
  africa_boys:   { facebook: G, amazon: S, spotify: S, yt_kids: S, google: g, tiktok: G, linkedin: S },
  sob_bait:      { facebook: G, amazon: S, spotify: S, yt_kids: S, google: S, tiktok: G, linkedin: g },
  mushroom_guide:{ facebook: S, amazon: G, spotify: S, yt_kids: S, google: g, tiktok: S, linkedin: S },
  fake_memoir:   { facebook: S, amazon: G, spotify: S, yt_kids: S, google: g, tiktok: S, linkedin: g },
  lofi:          { facebook: S, amazon: S, spotify: G, yt_kids: g, google: S, tiktok: g, linkedin: S },
  finger_family: { facebook: S, amazon: S, spotify: g, yt_kids: G, google: S, tiktok: g, linkedin: S },
  glue_pizza:    { facebook: S, amazon: S, spotify: S, yt_kids: S, google: G, tiktok: S, linkedin: S },
  recipe_mill:   { facebook: g, amazon: S, spotify: S, yt_kids: S, google: G, tiktok: g, linkedin: S },
  agree_fable:   { facebook: S, amazon: S, spotify: S, yt_kids: S, google: S, tiktok: g, linkedin: G },
}

// ─────────────────────────────────────────────────────────────────────────────
// Tactic synergy — Tactic × Platform (§4.4)
// ─────────────────────────────────────────────────────────────────────────────

export const TACTIC_SYNERGY: Record<TacticId, Record<PlatformId, Band>> = {
  bot_inflate:     { facebook: G, amazon: S, spotify: g, yt_kids: g, google: S, tiktok: G, linkedin: g },
  geo_boomers:     { facebook: G, amazon: g, spotify: S, yt_kids: S, google: g, tiktok: S, linkedin: g },
  seo_stuff:       { facebook: S, amazon: g, spotify: S, yt_kids: S, google: G, tiktok: S, linkedin: S },
  playlist_hijack: { facebook: S, amazon: S, spotify: G, yt_kids: S, google: S, tiktok: S, linkedin: S },
  time_to_launch:  { facebook: g, amazon: G, spotify: S, yt_kids: S, google: g, tiktok: S, linkedin: g },
  agree_bait:      { facebook: g, amazon: S, spotify: S, yt_kids: S, google: S, tiktok: g, linkedin: G },
  algo_funnel:     { facebook: g, amazon: S, spotify: g, yt_kids: G, google: S, tiktok: G, linkedin: S },
}

// ─────────────────────────────────────────────────────────────────────────────
// Page slots — Phase 1 spans platforms so the four-axis interplay is felt
// (§5 Era I uses Google-leaning slots; Phase 1 widens this for the prototype,
//  per §16 "engine supports all four now so the core can be felt in full")
// ─────────────────────────────────────────────────────────────────────────────

// baseE + gates tuned via the balance sim (npm run sim). Design rules:
//  (1) a fresh Comment Spam unit earns ~$1/publish — the AdvCap opening feel.
//  (2) per-dollar efficiency is roughly FLAT across tiers (gentle ~1.08×/tier,
//      0.10→~0.16) — NOT the old 1.4× "pull-forward". Tier identity now comes
//      from the milestone PROFIT multipliers (math.ts profitMult) + Trend, so
//      a maxed early page (×144) stays a real earner and you buy ALL of them
//      (AdvCap "every business matters", not "newest wins").
//  (3) unlock gates are staggered (cash AND lifetime-views) so the 7 slots
//      arrive over ~20-60 min and a single cash spike can't skip the ladder.
//  (4) top coefficient ≤ 1.09 (AdvCap's >1.10 = guaranteed wall).
export const PAGE_SLOTS: PageSlotDef[] = [
  {
    id: 'comment_spam',
    name: 'Comment Spam',
    platform: 'google',
    baseCost: 4,
    baseCycleSec: 1.0,
    costCoef: 1.07,
    baseE: 500,
    unlock: {},
    flavor: 'Where the empire begins. First unit is free.',
  },
  {
    id: 'listicle_blog',
    name: 'Listicle Blog',
    platform: 'google',
    baseCost: 60,
    baseCycleSec: 3.0,
    costCoef: 1.14,
    baseE: 22_500,
    unlock: { cash: 200 },
    flavor: '"10 things experts won\'t tell you about" — actual experts unconsulted.',
  },
  {
    id: 'recipe_page',
    name: 'Recipe Page',
    platform: 'google',
    baseCost: 720,
    baseCycleSec: 6.0,
    costCoef: 1.13,
    baseE: 540_000,
    unlock: { cash: 5_000, lifetimeE: 500_000_000 },
    flavor: '3,000-word personal essay before the recipe. The essay is also fake.',
  },
  {
    id: 'facebook_page',
    name: 'Facebook Page',
    platform: 'facebook',
    baseCost: 8_640,
    baseCycleSec: 12.0,
    costCoef: 1.12,
    baseE: 10_400_000,
    unlock: { cash: 250_000, lifetimeE: 20_000_000_000 },
    flavor: 'Boomers, here.',
  },
  {
    id: 'amazon_storefront',
    name: 'Amazon Storefront',
    platform: 'amazon',
    baseCost: 103_680,
    baseCycleSec: 24.0,
    costCoef: 1.11,
    baseE: 207_000_000,
    unlock: { cash: 15_000_000, lifetimeE: 800_000_000_000 },
    flavor: '3 uploads/day per account. Buy more accounts.',
  },
  {
    id: 'tiktok_account',
    name: 'TikTok Account',
    platform: 'tiktok',
    baseCost: 1_240_000,
    baseCycleSec: 96.0,
    costCoef: 1.10,
    baseE: 30_000_000_000,
    unlock: { cash: 1_000_000_000, lifetimeE: 20_000_000_000_000 },
    flavor: 'AI voiceover reading r/AmITheAsshole over 8 hours of Subway Surfers.',
  },
  {
    id: 'linkedin_page',
    name: 'LinkedIn Page',
    platform: 'linkedin',
    baseCost: 14_900_000,
    baseCycleSec: 384.0,
    costCoef: 1.09,
    baseE: 640_000_000_000,
    unlock: { cash: 80_000_000_000, lifetimeE: 500_000_000_000_000 },
    flavor: 'Thought leadership. The leader is a bot. The thought is a Gumroad funnel.',
  },
]

export const PAGE_SLOT_BY_ID: Record<string, PageSlotDef> = Object.fromEntries(
  PAGE_SLOTS.map((s) => [s.id, s]),
)

// Manager (Account-Management Software) — flat price per slot that SCALES with
// tier (AdvCap: $1K Lemonade → $10B Bank), never a flat floor. ~60× the page's
// base unit cost makes it a real "tap for a while, then automate" goal and
// keeps every tier's manager distinct.
export function managerCost(slot: PageSlotDef): number {
  return Math.max(200, Math.round(slot.baseCost * 60))
}

// Milestone halvings: at 25/50/100/200/300/400 units the cycle halves (§15)
export const MILESTONES = [25, 50, 100, 200, 300, 400] as const

// ─────────────────────────────────────────────────────────────────────────────
// Trend tag taxonomy (§4.5) — 14 tags
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_TAGS = [
  'nostalgia',
  'animals',
  'rage',
  'ai_aesthetic',
  'wholesome',
  'fear',
  'religion',
  'money',
  'sex',
  'kids',
  'food',
  'true_crime',
  'parasocial',
  'holiday',
] as const

export const TAG_LABEL: Record<string, string> = {
  nostalgia: '🕯nostalgia',
  animals: '🐈animals',
  rage: '😡rage',
  ai_aesthetic: '🤖AI-aesthetic',
  wholesome: '🌅wholesome',
  fear: '⚠fear',
  religion: '✝religion',
  money: '💵money',
  sex: '🔞sex-adjacent',
  kids: '🧸kids',
  food: '🍕food',
  true_crime: '🔪true-crime',
  parasocial: '👀parasocial',
  holiday: '🎄holiday',
}

// ─────────────────────────────────────────────────────────────────────────────
// CPM geo modifier (§8)
// ─────────────────────────────────────────────────────────────────────────────

export const GEO_US_BOOMER_CPM_MULT = 1.5
export const GEO_US_BOOMER_E_MULT = 1.0
// "Emotional" audience ×0.5 CPM but ×2 raw E — not wired to a tactic in Phase 1

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 achievements (~10, verbatim titles, §13)
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'eat_a_rock', title: 'Eat at Least One Small Rock Per Day', hint: 'Google AI Overview, laundered from The Onion.' },
  { id: 'glue_pizza', title: 'Add 1/8 Cup Non-Toxic Glue', hint: 'A Reddit shitpost, 11 years aged into search-result canon.' },
  { id: 'train_leaves', title: 'Train Made of Leaves: $431', hint: 'A single image payout, screenshotted into a brag.' },
  { id: 'hundred_likes', title: '$100 for 1,000 Likes', hint: 'The slop-tutorial pitch.' },
  { id: 'tidewater', title: 'Tidewater Dreams', hint: "Isabel Allende's nonexistent novel." },
  { id: 'india_emotional', title: 'The Indian Audience Is Very Emotional', hint: '"…so you too should create a page like this."' },
  { id: 'write_me_10', title: 'WRITE ME 10 PROMPT', hint: 'A real creator\'s Midjourney prompt.' },
  { id: 'separate_legal_entity', title: 'A Separate Legal Entity', hint: 'Damage-control a scandal — blame deflected.' },
  { id: 'gpus_melting', title: 'Our GPUs Are Melting', hint: 'The Ghibli Flood.' },
  { id: 'first_prestige', title: 'You Survived An Algorithm Change', hint: 'And the Algorithm sold the survival back to you as progress.' },
  // Scandal achievements (§7 / §13)
  { id: 'remarkable_submission', title: 'This Is a Remarkable Submission', hint: 'The tribunal judge, to Air Canada.' },
  { id: 'gobstopper', title: 'Anti-Graffiti Gobstopper', hint: "The Wonka warehouse's magic sweet." },
]

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)
