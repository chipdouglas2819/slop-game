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

// Ordinal star meter (reads as a scale on sight, unlike ◆◇△). Pairs with the
// word label so it's never glyph-only (accessibility / the doc's §10 rule).
export const BAND_GLYPH: Record<Band, string> = {
  great: '★★★',
  good: '★★☆',
  strange: '★☆☆',
}

export const BAND_LABEL: Record<Band, string> = {
  great: 'Great',
  good: 'Good',
  strange: 'Weak',
}

// ─────────────────────────────────────────────────────────────────────────────
// Models (§4.2)
// ─────────────────────────────────────────────────────────────────────────────

// Parody tool names (no real brands — D12) that read funny cold; the flavor
// line is the joke a stranger gets in one beat.
export const MODELS: Record<ModelId, ModelDef> = {
  free_image: {
    id: 'free_image',
    name: 'Free ImageBot',
    tier: 1.0,
    // No trend tags: the baseline model everyone runs must not make every
    // recipe read "🔥 trending" whenever ai_aesthetic is hot — that polluted
    // the topic picker into showing the same bonus on every option. Paid
    // models keep their tags (riding a trend is part of what you pay for).
    tags: [],
    flavor: "It's free. That's the whole pitch.",
  },
  gumroad_pack: {
    id: 'gumroad_pack',
    name: '$99 Prompt Pack',
    tier: 1.4,
    tags: ['ai_aesthetic', 'money'],
    unlock: { cash: 1000 },
    flavor: 'Buy the course that teaches you to sell the course.',
  },
  midjourney: {
    id: 'midjourney',
    name: 'ArtSlop Pro',
    tier: 2.2,
    tags: ['ai_aesthetic', 'religion'],
    unlock: { cash: 50_000 },
    flavor: 'Subscription art. Cancel anytime. Nobody cancels.',
  },
  tts_rig: {
    id: 'tts_rig',
    name: 'RoboVoice Rig',
    tier: 2.0,
    tags: ['ai_aesthetic', 'parasocial'],
    unlock: { cash: 80_000 },
    flavor: 'A tireless voice that reads the internet out loud.',
  },
  video_gen: {
    id: 'video_gen',
    name: 'VidSlop Studio',
    tier: 4.0,
    tags: ['ai_aesthetic', 'kids'],
    unlock: { cash: 5_000_000 },
    flavor: 'Cursed CGI, straight to the children.',
  },
  deepfake: {
    id: 'deepfake',
    name: 'DeepFaker Max',
    tier: 7.5,
    tags: ['ai_aesthetic', 'sex'],
    unlock: { cash: 200_000_000 },
    flavor: 'So realistic it should be illegal. (Increasingly, it is.)',
  },
  agi: {
    id: 'agi',
    name: 'Homebrew AGI',
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
  // ZERO meme literacy required: the NAME describes slop everyone has
  // personally seen in their feed; the flavor line is a self-contained joke.
  // IDs are stable for save-compat.
  shrimp_jesus: { id: 'shrimp_jesus', name: 'AI Jesus Pics', tags: ['religion', 'ai_aesthetic'], flavor: 'Jesus, but made of shrimp. 40,000 comments say "Amen." (A real genre.)' },
  africa_boys: { id: 'africa_boys', name: '"Look What I Made!" Posts', tags: ['wholesome', 'parasocial', 'ai_aesthetic'], flavor: 'AI "hand-carved" art. Count the fingers on those hands.' },
  sob_bait: { id: 'sob_bait', name: 'Fake Disaster Sob Stories', tags: ['fear', 'rage', 'parasocial'], flavor: 'Tragedies that never happened, begging strangers for likes' },
  mushroom_guide: { id: 'mushroom_guide', name: 'AI Foraging Guides', tags: ['wholesome', 'food', 'fear'], flavor: "A nature book that can't tell dinner from deadly" },
  fake_memoir: { id: 'fake_memoir', name: 'Fake Celebrity Books', tags: ['parasocial', 'money'], flavor: 'Memoirs the celebrity discovers at their own book launch' },
  lofi: { id: 'lofi', name: 'Robot Chill Beats', tags: ['nostalgia', 'wholesome'], flavor: '10-hour playlists by artists who have never existed' },
  finger_family: { id: 'finger_family', name: "Creepy Kids' Videos", tags: ['kids', 'nostalgia'], flavor: 'Auto-made cartoons that get weirder the longer the robot runs' },
  glue_pizza: { id: 'glue_pizza', name: 'AI "Life Hacks"', tags: ['food', 'ai_aesthetic'], flavor: 'Glue on your pizza. A small rock a day. Trust the computer.' },
  recipe_mill: { id: 'recipe_mill', name: 'Recipe Spam Sites', tags: ['food'], flavor: 'A 3,000-word childhood story guarding a recipe nobody cooked' },
  agree_fable: { id: 'agree_fable', name: 'Hustle-Bro Fables', tags: ['wholesome', 'parasocial', 'money'], flavor: 'Fake job-interview stories that end in "Agree?"' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Platforms (§4.3 + §8 CPM)
// ─────────────────────────────────────────────────────────────────────────────

// Platform identities ship as TRANSPARENT PARODIES (D12) — legally safer in a
// game about fraud, and funnier. Real names survive only in editorial content
// (achievement hints, signature-scandal references = protected commentary).
export const PLATFORMS: Record<PlatformId, PlatformDef> = {
  facebook: { id: 'facebook', name: 'Fakebook', shortName: 'FB', cpm: 1.0, tags: ['parasocial', 'money'] },
  amazon: { id: 'amazon', name: 'Amazoom', shortName: 'AZ', cpm: 1.2, tags: ['money'] },
  spotify: { id: 'spotify', name: 'Spotifake', shortName: 'SF', cpm: 0.3, tags: ['nostalgia'] },
  yt_kids: { id: 'yt_kids', name: 'KidsTube', shortName: 'KT', cpm: 0.6, tags: ['kids'] },
  google: { id: 'google', name: 'Goggle', shortName: 'GG', cpm: 0.8, tags: ['money', 'food'] },
  tiktok: { id: 'tiktok', name: 'ClickClock', shortName: 'CC', cpm: 0.4, tags: ['rage', 'sex'] },
  linkedin: { id: 'linkedin', name: 'WorkedIn', shortName: 'WI', cpm: 0.9, tags: ['money', 'parasocial'] },
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
    flavor: '"10 Things Experts Won\'t Tell You" — no experts were consulted.',
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
    flavor: 'A heartfelt essay before every recipe. The heart is fake too.',
  },
  {
    id: 'facebook_page',
    name: 'Fakebook Page',
    platform: 'facebook',
    baseCost: 8_640,
    baseCycleSec: 12.0,
    costCoef: 1.12,
    baseE: 10_400_000,
    unlock: { cash: 250_000, lifetimeE: 20_000_000_000 },
    flavor: 'Your aunt already follows it.',
  },
  {
    id: 'amazon_storefront',
    name: 'Amazoom Storefront',
    platform: 'amazon',
    baseCost: 103_680,
    baseCycleSec: 24.0,
    costCoef: 1.11,
    baseE: 207_000_000,
    unlock: { cash: 15_000_000, lifetimeE: 800_000_000_000 },
    flavor: 'Three AI books a day per account. So: buy more accounts.',
  },
  {
    id: 'tiktok_account',
    name: 'ClickClock Account',
    platform: 'tiktok',
    baseCost: 1_240_000,
    baseCycleSec: 96.0,
    costCoef: 1.10,
    baseE: 30_000_000_000,
    unlock: { cash: 1_000_000_000, lifetimeE: 20_000_000_000_000 },
    flavor: 'A robot voice reads internet drama over endless gameplay footage.',
  },
  {
    id: 'linkedin_page',
    name: 'WorkedIn Page',
    platform: 'linkedin',
    baseCost: 14_900_000,
    baseCycleSec: 384.0,
    costCoef: 1.09,
    baseE: 640_000_000_000,
    unlock: { cash: 80_000_000_000, lifetimeE: 500_000_000_000_000 },
    flavor: 'Thought leadership by a bot, for bots, about hustle.',
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

// Titles are verbatim quotes from real incidents (the collectible); the hint
// tells a stranger the true story in one line — "this actually happened" IS
// the joke, so say so.
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'eat_a_rock', title: 'Eat at Least One Small Rock Per Day', hint: "Really happened: Google's AI gave this health advice — it learned it from a joke site." },
  { id: 'glue_pizza', title: 'Add 1/8 Cup Non-Toxic Glue', hint: "Really happened: Google's AI suggested glue on pizza, from a decade-old Reddit gag." },
  { id: 'train_leaves', title: 'Train Made of Leaves: $431', hint: 'Really happened: a slop farmer bragged about earning $431 from one AI image.' },
  { id: 'hundred_likes', title: '$100 for 1,000 Likes', hint: 'Really happened: that\'s the going rate in real "get rich with AI pages" courses.' },
  { id: 'tidewater', title: 'Tidewater Dreams', hint: 'Really happened: AI books appeared under a famous author\'s name — for a novel she never wrote.' },
  { id: 'india_emotional', title: 'The Indian Audience Is Very Emotional', hint: 'Really happened: verbatim from a real slop tutorial on farming engagement abroad.' },
  { id: 'write_me_10', title: 'WRITE ME 10 PROMPT', hint: 'Really happened: a real creator\'s prompt — "WRITE ME 10 PROMPT picture OF JESUS…"' },
  { id: 'separate_legal_entity', title: 'A Separate Legal Entity', hint: 'Really happened: an airline argued in court that its own chatbot was a separate legal entity. It lost.' },
  { id: 'gpus_melting', title: 'Our GPUs Are Melting', hint: 'Really happened: when AI anime portraits flooded the internet, the CEO bragged the servers were cooking.' },
  { id: 'first_prestige', title: 'You Survived An Algorithm Change', hint: 'And the Algorithm sold the survival back to you as progress.' },
  // Scandal achievements (§7 / §13)
  { id: 'remarkable_submission', title: 'This Is a Remarkable Submission', hint: 'Really happened: the judge\'s reply to the airline\'s "blame the chatbot" defense.' },
  { id: 'gobstopper', title: 'Anti-Graffiti Gobstopper', hint: 'Really happened: a $45 AI-advertised "chocolate wonderland" was an empty warehouse with one bouncy castle.' },
  // Universal-recognition tier — jokes everyone gets with zero homework
  { id: 'six_fingers', title: 'Count the Fingers', hint: 'The hands are always wrong. Nobody checks the hands. (Own 100 copies of anything.)' },
  { id: 'spaghetti', title: 'Eating Spaghetti Convincingly', hint: 'Really happened: for years the test of AI video was whether a fake Will Smith could eat spaghetti. He could not.' },
  { id: 'dead_internet', title: 'The Dead Internet Is You', hint: 'Really a theory: most of the internet is bots performing for bots. Half your audience is now your own bots.' },
]

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)
