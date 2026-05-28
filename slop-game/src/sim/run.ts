// Headless balance sim. Run with: npm run sim   (optionally: npm run sim -- 7200 5)
//   arg1 = sim duration in game-seconds (default 3600 = 1h)
//   arg2 = RNG seed (default 1)
//
// Drives the pure engine reducer over fast-forwarded time with a seeded RNG and
// the active-player policy in ./policy. Prints a pacing timeline + snapshots.

// — Seeded RNG (mulberry32), patched over Math.random for determinism ——————————
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const durationSec = Number(process.argv[2] ?? 3600)
const seed = Number(process.argv[3] ?? 1)
Math.random = mulberry32(seed)

// Import engine AFTER patching Math.random so initial trend roll is seeded.
const { initialState, reduce, totalDollarsPerSec } = await import('../game/engine/state')
const { decideActions } = await import('./policy')
const { PAGE_SLOT_BY_ID } = await import('../game/engine/data')
const { fmtMoney, fmtNumber, fmtSeconds } = await import('../game/format')

const STEP_MS = 200 // game-time per sim step
const t0 = 0
let state = initialState(t0)
let nowMs = t0

const milestones: Record<string, number> = {}
function mark(label: string) {
  if (milestones[label] === undefined) milestones[label] = nowMs / 1000
}

const snapshots: Array<{ atSec: number; money: string; dps: string; lifeE: string; pages: number; units: number; tokens: number; era: number }> = []
const snapAt = (
  process.env.SIM_FINE === '1'
    ? [60, 180, 300, 360, 420, 480, 540, 600, 720]
    : [60, 300, 900, 1800, 3600, 7200, 14400]
).filter((s) => s <= durationSec)
let snapIdx = 0

const totalSteps = Math.ceil((durationSec * 1000) / STEP_MS)
for (let i = 0; i < totalSteps; i++) {
  // Policy acts on current state, then time advances.
  const actions = decideActions(state)
  for (const a of actions) state = reduce(state, a)

  nowMs += STEP_MS
  state = reduce(state, { type: 'TICK', now: nowMs })

  // Milestones
  if (state.pages.some((p) => p.units > 0)) mark('first unit bought')
  if (state.progression.firstTapDone) mark('first publish')
  if (state.pages.some((p) => p.manager)) mark('first manager hired')
  for (const slotId of state.unlockedSlots) mark(`page: ${PAGE_SLOT_BY_ID[slotId].name}`)
  if (state.algorithmUpdatesCompleted >= 1) mark('first Algorithm Update (prestige)')
  if (state.algorithmUpdatesCompleted >= 2) mark('second prestige')
  if (state.progression.tacticChipUnlocked) mark('Tactic chip unlocked')
  for (const a of ['eat_a_rock', 'glue_pizza', 'train_leaves', 'first_prestige']) {
    if (state.unlocked.includes(a)) mark(`achievement: ${a}`)
  }

  // Snapshots
  if (snapIdx < snapAt.length && nowMs / 1000 >= snapAt[snapIdx]) {
    const units = state.pages.reduce((n, p) => n + p.units, 0)
    snapshots.push({
      atSec: snapAt[snapIdx],
      money: fmtMoney(state.money),
      dps: fmtMoney(totalDollarsPerSec(state)),
      lifeE: fmtNumber(state.lifetimeE),
      pages: state.pages.filter((p) => p.units > 0).length,
      units,
      tokens: state.slopTokens,
      era: state.algorithmUpdatesCompleted,
    })
    snapIdx++
  }
}

// — Report —————————————————————————————————————————————————————————————————————
console.log('\n══════════════════════════════════════════════════════════════')
console.log(`  SLOP balance sim — ${fmtSeconds(durationSec)} of play, seed ${seed}`)
console.log('══════════════════════════════════════════════════════════════\n')

console.log('MILESTONES (game-time to first occurrence)')
console.log('──────────────────────────────────────────')
const ordered = Object.entries(milestones).sort((a, b) => a[1] - b[1])
for (const [label, sec] of ordered) {
  console.log(`  ${fmtSeconds(sec).padStart(9)}  ${label}`)
}

console.log('\nSNAPSHOTS')
console.log('─────────')
console.log(
  '  ' +
    ['time', 'money', '$/sec', 'lifetimeE', 'pages', 'units', 'tokens', 'updates']
      .map((h) => h.padEnd(10))
      .join(''),
)
for (const s of snapshots) {
  console.log(
    '  ' +
      [
        fmtSeconds(s.atSec),
        s.money,
        s.dps,
        s.lifeE,
        String(s.pages),
        String(s.units),
        String(s.tokens),
        String(s.era),
      ]
        .map((c) => c.padEnd(10))
        .join(''),
  )
}

console.log('\nFINAL STATE')
console.log('───────────')
console.log(`  money:       ${fmtMoney(state.money)}`)
console.log(`  $/sec:       ${fmtMoney(totalDollarsPerSec(state))}`)
console.log(`  lifetime E:  ${fmtNumber(state.lifetimeE)}`)
console.log(`  pages owned: ${state.pages.filter((p) => p.units > 0).length}`)
console.log(`  total units: ${state.pages.reduce((n, p) => n + p.units, 0)}`)
console.log(`  slop tokens: ${state.slopTokens}`)
console.log(`  prestiges:   ${state.algorithmUpdatesCompleted}`)
console.log(`  achievements:${state.unlocked.length}/10`)
console.log('')
