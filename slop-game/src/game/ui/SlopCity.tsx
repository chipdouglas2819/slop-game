import { memo, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { PAGE_SLOTS, managerCost } from '../engine/data'
import {
  effectiveCycleSec,
  era,
  recipeKey,
  SATURATION_OVERUSED_BELOW,
  saturationMult,
  unitCost,
  nextMilestone,
  zombieRatio,
} from '../engine/math'
import { pageDollarsPerSec } from '../engine/state'
import {
  caption,
  litter,
  nextBestAction,
  particleCount,
  skyVars,
  TIER,
  tierOf,
  TOPIC_EMOJI,
  zQuantize,
} from './mapLogic'
import { COLORS, EMOJI } from './PageCard'
import { MapPopover } from './MapPopover'
import type { MapTarget } from './MapPopover'
import { sfx } from './sfx'

// Slop City — the empire as a living city block at dusk. Buildings grow at
// milestones and blink at the economy's tempo; posts rise into the Algorithm's
// eye; the sky sickens and the sidewalk crowd turns robotic as Z climbs. One
// gold beacon (at most) marks the next best action: tap the glowing thing.
const LOT_W = 351 / 7
const VIEW_H = 168
const GROUND_Y = 140

const pct = (v: number, total: number) => `${(v / total) * 100}%`

export function SlopCity() {
  const { state } = useStore()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('slop.city.collapsed') === '1'
    } catch {
      return false
    }
  })
  const [popover, setPopover] = useState<MapTarget | null>(null)
  const [blackout, setBlackout] = useState(false)
  const prevEraGain = useRef<number | null>(state.lastEraJumpGain)
  const blackoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pull-the-Plug blackout: only on an observed null→number transition while
  // mounted (never on reload with a pending banner). The un-blackout timer is
  // NOT an effect cleanup — dismissing the EraBanner within 2.6s changes the
  // dep, and a cleanup would cancel the timer and latch the map black forever.
  useEffect(() => {
    const was = prevEraGain.current
    prevEraGain.current = state.lastEraJumpGain
    if (was == null && state.lastEraJumpGain != null) {
      setBlackout(true)
      setPopover(null)
      if (blackoutTimer.current) clearTimeout(blackoutTimer.current)
      blackoutTimer.current = setTimeout(() => setBlackout(false), 2600)
    }
  }, [state.lastEraJumpGain])
  useEffect(
    () => () => {
      if (blackoutTimer.current) clearTimeout(blackoutTimer.current)
    },
    [],
  )

  // One-time "tap the glowing thing." — state, not a per-render storage read.
  const [hintDone, setHintDone] = useState(() => {
    try {
      return localStorage.getItem('slop.city.beaconHintDone') === '1'
    } catch {
      return true
    }
  })

  const hasAnyUnit = state.pages.some((p) => p.units > 0)
  // Keep rendering through the blackout — the plug wipes all units in the same
  // dispatch that triggers the cinematic; bailing here would skip it entirely.
  if (!hasAnyUnit && !blackout) return null

  const gameEra = era(state)
  const zQ = zQuantize(zombieRatio(state))
  const sky = skyVars(zQ, gameEra)
  const robots = Math.round(zQ * 8)
  const trash = litter(state.lifetimeE.toNumber())
  const action = nextBestAction(state)

  // beacon → lot index (the scandal kind renders no ring — it routes to the
  // interrupt card instead)
  let beaconLot = -1
  if (action && action.kind !== 'scandal') {
    if (action.kind === 'unlock') beaconLot = PAGE_SLOTS.findIndex((s) => s.id === action.slotId)
    else beaconLot = PAGE_SLOTS.findIndex((s) => s.id === state.pages[action.pageIdx]?.defId)
  }

  function markHintDone() {
    if (hintDone) return
    setHintDone(true)
    try {
      localStorage.setItem('slop.city.beaconHintDone', '1')
    } catch {
      // fine
    }
  }

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem('slop.city.collapsed', next ? '1' : '0')
    } catch {
      // fine
    }
  }

  function tapLot(lotIdx: number) {
    const slot = PAGE_SLOTS[lotIdx]
    const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
    markHintDone() // any map tap proves the lesson landed
    // a scandal building routes to the existing interrupt — it stays the
    // resolution surface
    if (action?.kind === 'scandal' && pageIdx === action.pageIdx) {
      document.getElementById('scandal-interrupt')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    sfx('uiOpen')
    if (!state.unlockedSlots.includes(slot.id)) {
      setPopover({ kind: 'locked', slotId: slot.id })
    } else if (pageIdx >= 0) {
      setPopover({ kind: 'page', pageIdx })
    }
  }

  if (collapsed) {
    return (
      <button
        onClick={toggleCollapsed}
        aria-expanded={false}
        className="w-full flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-left"
      >
        <span className="text-[11px] italic text-zinc-500">🏙 your slop empire</span>
        <span className="flex items-center gap-2">
          {action && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 city-anim animate-[beaconPulse_1.6s_infinite]" />}
          <span className="text-zinc-600 text-xs">▾</span>
        </span>
      </button>
    )
  }

  // teach line only while an actual beacon ring is on screen
  const showHint = beaconLot >= 0 && !hintDone && !blackout
  const captionText = blackout
    ? 'you turned it off. it needed that.'
    : showHint
    ? 'tap the glowing thing.'
    : caption(zQ)

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/70">
      <div
        className="relative"
        style={{ '--sky-top': sky.top, '--sky-horizon': sky.horizon, '--core': sky.core } as React.CSSProperties}
      >
        <svg
          viewBox={`0 0 351 ${VIEW_H}`}
          className="w-full h-auto block"
          role="img"
          aria-label="Slop City — your empire as a city block"
        >
          <defs>
            <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--sky-top)" />
              <stop offset="83%" stopColor="var(--sky-horizon)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="351" height={GROUND_Y} fill="url(#citySky)" />
          <rect x="0" y={GROUND_Y} width="351" height={VIEW_H - GROUND_Y} fill="#15151c" />
          <line x1="0" y1={GROUND_Y} x2="351" y2={GROUND_Y} stroke="#3f3f46" strokeWidth="1" />

          {/* The Core: the open internet (sun), later the Algorithm's eye */}
          <circle cx="175.5" cy="30" r="19" fill="var(--core)" opacity="0.18" />
          <circle cx="175.5" cy="30" r="12" fill="var(--core)" />
          {gameEra >= 2 && (
            <>
              <circle cx="175.5" cy="30" r="5" fill="#0b0b10" />
              <circle cx="178.5" cy="27" r="1.5" fill="#fff" />
            </>
          )}

          {PAGE_SLOTS.map((slot, i) => {
            const x = i * LOT_W + 6
            const locked = !state.unlockedSlots.includes(slot.id)
            if (locked) {
              const cashOk = state.money.gte(slot.unlock.cash ?? 0)
              const eOk = !slot.unlock.lifetimeE || state.lifetimeE.gte(slot.unlock.lifetimeE)
              const ready = cashOk && eOk
              const tone = ready ? '#f59e0b' : '#52525b'
              return (
                <g key={slot.id}>
                  <rect x={x} y={GROUND_Y - 26} width="38" height="26" fill="#101016" stroke={ready ? '#f59e0b' : '#3f3f46'} strokeDasharray="3 3" strokeWidth="1" />
                  <text x={x + 19} y={GROUND_Y - 16} fontSize="8" textAnchor="middle">🏗</text>
                  <g transform={`rotate(-6 ${x + 19} ${GROUND_Y - 8})`}>
                    <text x={x + 19} y={GROUND_Y - 9} fontSize="5.5" textAnchor="middle" fill={tone}>ZONED FOR</text>
                    <text x={x + 19} y={GROUND_Y - 3} fontSize="5.5" textAnchor="middle" fill={tone}>SLOP</text>
                  </g>
                </g>
              )
            }
            const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
            const page = state.pages[pageIdx]
            if (!page) return null
            const tier = tierOf(page.units)
            const t = TIER[tier]
            const losing = page.manager && pageDollarsPerSec(state, pageIdx) < 0
            const overused =
              state.progression.topicChipUnlocked &&
              saturationMult(state.saturation[recipeKey(page.recipe)]) < SATURATION_OVERUSED_BELOW
            const m = nextMilestone(page.units)
            const buyCount = page.units === 0 ? 1 : m ? m - page.units : 0
            const affordable =
              (buyCount > 0 && state.money.gte(unitCost(slot, page.units, buyCount))) ||
              (!page.manager && page.units > 0 && state.money.gte(managerCost(slot)))
            const blinkSec =
              page.manager && page.units > 0
                ? Math.max(0.5, effectiveCycleSec(slot, page.units))
                : 0
            const scandalHere = state.activeScandal?.pageIdx === pageIdx
            const crackdownHere =
              state.crackdown != null &&
              state.crackdown.platform === slot.platform &&
              state.lastTickAt < state.crackdown.untilMs
            return (
              <Building
                key={`${slot.id}-t${tier}`}
                x={x}
                h={t.h}
                cols={t.cols}
                rows={t.rows}
                tier={tier}
                color={COLORS[slot.platform]}
                litAll={page.manager}
                anyLit={page.units > 0}
                dimmed={overused}
                red={losing}
                doorLit={affordable}
                blinkSec={blinkSec}
                billboard={tier >= 7 ? TOPIC_EMOJI[page.recipe.topic] : ''}
                sign={EMOJI[slot.platform]}
                scandal={scandalHere}
                crackdown={crackdownHere}
                dying={blackout}
                dieDelay={i * 0.12}
              />
            )
          })}
        </svg>

        {/* DOM overlay: pips, particles, beacon, crowd, litter, tap targets */}
        <div className="absolute inset-0 pointer-events-none">
          {PAGE_SLOTS.map((slot, i) => {
            const locked = !state.unlockedSlots.includes(slot.id)
            const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
            const page = pageIdx >= 0 ? state.pages[pageIdx] : null
            const tier = page ? tierOf(page.units) : 0
            const h = TIER[tier].h
            const centerPct = pct(i * LOT_W + LOT_W / 2, 351)
            const roofBottom = pct(VIEW_H - GROUND_Y + h + 8, VIEW_H)

            // exactly one pip per lot, by priority. The finger waits for
            // firstTapDone so it never competes with Onboarding's pointer.
            let pip: 'scandal' | 'smoke' | 'finger' | null = null
            if (page) {
              if (state.activeScandal?.pageIdx === pageIdx) pip = 'scandal'
              else if (
                state.progression.topicChipUnlocked &&
                page.units > 0 &&
                saturationMult(state.saturation[recipeKey(page.recipe)]) < SATURATION_OVERUSED_BELOW
              )
                pip = 'smoke'
              else if (
                page.units > 0 &&
                !page.manager &&
                page.cycleProgress === 0 &&
                state.progression.firstTapDone
              )
                pip = 'finger'
            }

            const crackdownHere =
              state.crackdown != null &&
              state.crackdown.platform === slot.platform &&
              state.lastTickAt < state.crackdown.untilMs

            return (
              <span key={slot.id}>
                {/* tap target */}
                <button
                  onClick={() => tapLot(i)}
                  className="absolute pointer-events-auto"
                  style={{ left: pct(i * LOT_W, 351), width: pct(LOT_W, 351), top: '12%', bottom: 0 }}
                  aria-label={locked ? `${slot.name} (locked)` : slot.name}
                />
                {/* status pip — outer span positions, inner span animates:
                    fingerBob/smokePuff drive `transform`, so the centering
                    translateX must live on a separate element */}
                {pip === 'scandal' && (
                  <span
                    aria-hidden
                    className="absolute text-[12px]"
                    style={{ left: centerPct, bottom: roofBottom, transform: 'translateX(-50%)' }}
                  >
                    <span className="inline-block city-anim" style={{ animation: 'redFlicker 0.9s infinite' }}>🚨</span>
                  </span>
                )}
                {pip === 'smoke' && (
                  <>
                    <span aria-hidden className="absolute text-[8px] text-zinc-400" style={{ left: centerPct, bottom: roofBottom, transform: 'translateX(-70%)' }}>
                      <span className="inline-block city-anim" style={{ opacity: 0, animation: 'smokePuff 2.4s infinite' }}>💨</span>
                    </span>
                    <span aria-hidden className="absolute text-[8px] text-zinc-500" style={{ left: centerPct, bottom: roofBottom, transform: 'translateX(-10%)' }}>
                      <span className="inline-block city-anim" style={{ opacity: 0, animation: 'smokePuff 2.4s infinite', animationDelay: '-1.2s' }}>💨</span>
                    </span>
                  </>
                )}
                {pip === 'finger' && (
                  <span
                    aria-hidden
                    className="absolute text-[12px]"
                    style={{ left: centerPct, bottom: roofBottom, transform: 'translateX(-50%)' }}
                  >
                    <span className="inline-block city-anim" style={{ animation: 'fingerBob 1.2s infinite' }}>👆</span>
                  </span>
                )}
                {/* post particles — only while something is actually posting;
                    base opacity 0 so reduced-motion shows nothing parked */}
                {page &&
                  page.units > 0 &&
                  (page.manager || page.cycleProgress > 0) &&
                  Array.from({ length: particleCount(page.units, page.manager) }).map((_, j) => (
                    <span
                      key={`${i}-${j}`}
                      aria-hidden
                      className="absolute text-[10px] city-anim"
                      style={{
                        left: centerPct,
                        bottom: pct(VIEW_H - GROUND_Y + h + 4, VIEW_H),
                        opacity: 0,
                        ['--drift' as string]: `${(j - 1) * 8}px`,
                        animation: `slopRise ${(3 + i * 0.25 + j * 0.7).toFixed(2)}s linear infinite`,
                        animationDelay: `${(-(j * 1.3 + i * 0.4)).toFixed(2)}s`,
                      }}
                    >
                      {TOPIC_EMOJI[page.recipe.topic]}
                    </span>
                  ))}
                {/* crackdown: police at the curb */}
                {crackdownHere && (
                  <span aria-hidden className="absolute text-[10px]" style={{ left: centerPct, bottom: '3%', transform: 'translateX(-50%)' }}>
                    🚓
                  </span>
                )}
              </span>
            )
          })}

          {/* THE gold beacon — at most one on the whole map */}
          {beaconLot >= 0 && (
            <span
              aria-hidden
              className="absolute city-anim animate-[beaconPulse_1.6s_infinite]"
              style={{
                left: pct(beaconLot * LOT_W + 3, 351),
                width: pct(44, 351),
                bottom: pct(24, VIEW_H),
                height: pct(
                  (state.unlockedSlots.includes(PAGE_SLOTS[beaconLot].id)
                    ? TIER[tierOf(state.pages.find((p) => p.defId === PAGE_SLOTS[beaconLot].id)?.units ?? 0)].h
                    : 20) + 16,
                  VIEW_H,
                ),
              }}
            >
              <span className="absolute inset-0 rounded-xl border-2 border-amber-400" />
              <span className="absolute inset-0 rounded-xl bg-amber-400/25 blur-[6px]" />
            </span>
          )}

          {/* crackdown countdown drain across the district */}
          {state.crackdown && state.lastTickAt < state.crackdown.untilMs && (
            <CrackdownSweep
              key={state.crackdown.untilMs}
              untilMs={state.crackdown.untilMs}
              lots={PAGE_SLOTS.map((s, i) => (s.platform === state.crackdown!.platform ? i : -1)).filter((i) => i >= 0)}
            />
          )}

          {/* sidewalk crowd — the Zombie Ratio made flesh */}
          <div aria-hidden className="absolute inset-x-0 flex justify-around" style={{ bottom: '1%' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="text-[11px] city-anim"
                style={
                  blackout
                    ? { animation: 'cursorBlink 1.1s steps(1) infinite' }
                    : { animation: 'crowdShuffle 6s ease-in-out infinite alternate', animationDelay: `${-(i * 0.8)}s` }
                }
              >
                {blackout ? (i === 3 ? '▌' : '') : i < robots ? '🤖' : '🚶'}
              </span>
            ))}
          </div>

          {/* litter — survives every prestige */}
          {trash.map((t, i) => (
            <span key={i} aria-hidden className="absolute text-[10px] opacity-25" style={{ left: `${t.leftPct}%`, bottom: pct(15, VIEW_H) }}>
              {t.glyph}
            </span>
          ))}

          {/* blackout */}
          {blackout && (
            <div className="absolute inset-0 bg-black city-anim" style={{ animation: 'flashPop 600ms ease-in 400ms both' }} />
          )}
        </div>
      </div>

      {/* caption row — hint goes amber so it visually rhymes with the beacon */}
      <div className="px-3 py-0.5 flex items-center justify-between border-t border-zinc-800/60">
        <span className={`text-[11px] italic ${showHint ? 'text-amber-300/90' : 'text-zinc-400'}`}>
          {captionText}
        </span>
        <button
          onClick={toggleCollapsed}
          className="text-zinc-500 text-xs px-3 py-2"
          aria-label="Collapse map"
          aria-expanded={true}
        >
          ▴
        </button>
      </div>

      {popover && <MapPopover target={popover} recommended={recommendedFor(action, popover)} onClose={() => setPopover(null)} />}
    </div>
  )
}

function recommendedFor(
  action: ReturnType<typeof nextBestAction>,
  popover: MapTarget,
): 'buy' | 'manager' | 'unlock' | 'retune' | null {
  if (!action) return null
  if (popover.kind === 'locked') return action.kind === 'unlock' && action.slotId === popover.slotId ? 'unlock' : null
  if (action.kind === 'manager' && action.pageIdx === popover.pageIdx) return 'manager'
  if (action.kind === 'buy' && action.pageIdx === popover.pageIdx) return 'buy'
  if (action.kind === 'retune' && action.pageIdx === popover.pageIdx) return 'retune'
  return null
}

// 90s purge countdown bar under the affected district — duration computed once
// at mount, keyed on untilMs so it never restarts. NOT .city-anim: this is
// status, not decoration — a frozen full bar would misreport the countdown.
function CrackdownSweep({ untilMs, lots }: { untilMs: number; lots: number[] }) {
  const [secs] = useState(() => Math.max(1, (untilMs - Date.now()) / 1000))
  if (lots.length === 0) return null
  const left = Math.min(...lots) * LOT_W
  const width = (Math.max(...lots) - Math.min(...lots) + 1) * LOT_W
  return (
    <div
      className="absolute bg-cyan-400/80"
      style={{
        left: pct(left, 351),
        width: pct(width, 351),
        bottom: 0,
        height: 2,
        transformOrigin: 'left',
        animation: `sweepDrain ${secs.toFixed(1)}s linear forwards`,
      }}
    />
  )
}

// ── One building. PRIMITIVE PROPS ONLY (memo must bail at 10Hz). ─────────
interface BuildingProps {
  x: number
  h: number
  cols: number
  rows: number
  tier: number
  color: string
  litAll: boolean
  anyLit: boolean
  dimmed: boolean
  red: boolean
  doorLit: boolean
  blinkSec: number
  billboard: string
  sign: string
  scandal: boolean
  crackdown: boolean
  dying: boolean
  dieDelay: number
}

const Building = memo(function Building({
  x,
  h,
  cols,
  rows,
  tier,
  color,
  litAll,
  anyLit,
  dimmed,
  red,
  doorLit,
  blinkSec,
  billboard,
  sign,
  scandal,
  crackdown,
  dying,
  dieDelay,
}: BuildingProps) {
  const top = GROUND_Y - h
  const winW = 5
  const winH = 4
  const gap = 3
  // even the tier-1 shack gets its one lit window — that's the minute-1 tell
  const maxRows = Math.max(h >= 16 ? 1 : 0, Math.floor((h - 14) / (winH + gap)))
  const drawRows = Math.min(rows, maxRows)
  const gridW = cols * winW + (cols - 1) * gap
  const startX = x + (38 - gridW) / 2
  const windows: Array<{ wx: number; wy: number; lit: boolean }> = []
  for (let r = 0; r < drawRows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      if (idx >= 12) break
      windows.push({
        wx: startX + c * (winW + gap),
        wy: GROUND_Y - 10 - (r + 1) * (winH + gap),
        lit: litAll || (anyLit && idx === 0),
      })
    }
  }
  const winFill = red ? '#f87171' : '#fde68a'
  return (
    <g className="svg-grow city-anim" style={{ animation: 'buildingGrow 500ms ease-out' }}>
      {/* ground apron */}
      <rect x={x - 4} y={GROUND_Y - 4} width={46} height={4} fill={color} opacity={0.35} />
      {/* crackdown: the district strobes cyan at the curb */}
      {crackdown && (
        <rect
          x={x - 4}
          y={GROUND_Y - 4}
          width={46}
          height={4}
          fill="#22d3ee"
          className="city-anim"
          style={{ animation: 'crackStrobe 1.2s infinite' }}
        />
      )}
      {/* body */}
      <rect x={x} y={top} width={38} height={h} fill="#23232e" stroke={color} strokeOpacity={0.6} strokeWidth={1} />
      {/* scandal: the whole building washes red while it burns */}
      {scandal && <rect x={x} y={top} width={38} height={h} fill="#ef4444" opacity={0.16} />}
      {/* windows */}
      <g opacity={dimmed ? 0.45 : 1} style={dying ? { animation: `blackoutWin 0.8s ease-out ${dieDelay}s forwards` } : undefined}>
        {windows.map((w, i) =>
          w.lit ? (
            <rect
              key={i}
              x={w.wx}
              y={w.wy}
              width={winW}
              height={winH}
              fill={winFill}
              opacity={0.9}
              className="city-anim"
              style={{ animation: `${red ? 'redFlicker 1.4s' : 'winFlicker 7s'} infinite`, animationDelay: `${-(i * 1.3)}s` }}
            />
          ) : (
            <rect key={i} x={w.wx} y={w.wy} width={winW} height={winH} fill="#15151c" />
          ),
        )}
      </g>
      {/* door */}
      <rect x={x + 16.5} y={GROUND_Y - 7} width={5} height={7} fill={doorLit ? '#f59e0b' : '#1f1f28'} />
      {/* platform emoji as the street sign */}
      <text x={x + 2} y={GROUND_Y - 1.5} fontSize="6" aria-hidden>
        {sign}
      </text>
      {/* tier ornaments */}
      {tier >= 4 && <line x1={x + 19} y1={top} x2={x + 19} y2={top - 7} stroke="#71717a" strokeWidth={1.5} />}
      {tier >= 5 && <rect x={x + 27} y={top + 4} width={8} height={4} fill={color} opacity={0.9} />}
      {tier >= 6 && (
        <>
          <circle cx={x + 7} cy={top + 5} r={3} fill="none" stroke="#a1a1aa" strokeWidth={1} />
          <line x1={x + 7} y1={top + 5} x2={x + 10} y2={top + 2} stroke="#a1a1aa" strokeWidth={1} />
        </>
      )}
      {tier >= 7 && billboard && (
        <>
          <rect x={x + 13} y={top - 12} width={12} height={9} fill="#0b0b10" stroke="#52525b" strokeWidth={0.5} />
          <text x={x + 19} y={top - 4.5} fontSize="7" textAnchor="middle">
            {billboard}
          </text>
        </>
      )}
      {/* roof tempo beacon (managed pages): blinks at the cycle speed.
          Neutral white — amber is the beacon's, fuchsia is the cards'. */}
      {blinkSec > 0 && (
        <rect
          x={x + 17.5}
          y={top - 3}
          width={3}
          height={3}
          fill="#e4e4e7"
          className="city-anim"
          style={{ animation: `roofBlink ${blinkSec.toFixed(2)}s steps(1) infinite` }}
        />
      )}
    </g>
  )
})
