import { memo, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { MILESTONES, PAGE_SLOTS, managerCost } from '../engine/data'
import {
  effectiveCycleSec,
  era,
  recipeKey,
  SATURATION_OVERUSED_BELOW,
  saturationMult,
  trendDirection,
  unitCost,
  nextMilestone,
  zombieRatio,
} from '../engine/math'
import { pageDollarsPerSec, pageTapPayout } from '../engine/state'
import { fmtMoney } from '../format'
import {
  beaconTargetSlotId,
  caption,
  litter,
  nextBestAction,
  particleCount,
  SHORT_NAME,
  skyVars,
  TIER,
  tierOf,
  TOPIC_EMOJI,
  zQuantize,
} from './mapLogic'
import { COLORS, EMOJI } from './PageCard'
import { MapDock } from './MapDock'
import { sfx } from './sfx'

// Slop City — the map IS the game. Tapping a manual building publishes (the
// existing TAP dispatch), with honest two-beat feedback: the ready bubble
// deflates into a refilling progress pill on tap, and the +$ float fires when
// the cycle actually pays. Managed/locked/vacant buildings select into the
// persistent dock below. One gold beacon (at most) marks the next best action.
const LOT_W = 351 / 7
const VIEW_H = 168
const GROUND_Y = 140

const pct = (v: number, total: number) => `${(v / total) * 100}%`

interface Float {
  id: number
  lot: number
  text: string
}
let floatSeq = 0

export function SlopCity({ onOpenDetails }: { onOpenDetails: (pageIdx: number) => void }) {
  const { state, dispatch } = useStore()
  const [sel, setSel] = useState<string | null>(null)
  const [blackout, setBlackout] = useState(false)
  const [floats, setFloats] = useState<Float[]>([])
  const [celebration, setCelebration] = useState<string | null>(null)
  const [dud, setDud] = useState<{ lot: number; n: number } | null>(null)
  const dudSeq = useRef(0)
  const prevEraGain = useRef<number | null>(state.lastEraJumpGain)
  const blackoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pull-the-Plug blackout: only on an observed null→number transition while
  // mounted (never on reload with a pending banner). The un-blackout timer is
  // NOT an effect cleanup — dismissing the EraBanner within 2.6s changes the
  // dep, and a cleanup would cancel the timer and latch the map black forever.
  useEffect(() => {
    const was = prevEraGain.current
    prevEraGain.current = state.lastEraJumpGain
    if (was == null && state.lastEraJumpGain != null) {
      setBlackout(true)
      setSel(null)
      if (blackoutTimer.current) clearTimeout(blackoutTimer.current)
      blackoutTimer.current = setTimeout(() => setBlackout(false), 2600)
    }
  }, [state.lastEraJumpGain])
  useEffect(
    () => () => {
      if (blackoutTimer.current) clearTimeout(blackoutTimer.current)
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
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

  // ── teach captions: one-shot queue, 7s each, priority = arrival order ────
  const [teachMsg, setTeachMsg] = useState<string | null>(null)
  const teachQueue = useRef<string[]>([])
  const teachBusy = useRef(false)
  function pumpTeach() {
    if (teachBusy.current) return
    const next = teachQueue.current.shift()
    if (!next) return
    teachBusy.current = true
    setTeachMsg(next)
    setTimeout(() => {
      teachBusy.current = false
      setTeachMsg(null)
      pumpTeach()
    }, 7000)
  }
  function fireTeach(key: string, msg: string) {
    try {
      if (localStorage.getItem(key) === '1') return
      localStorage.setItem(key, '1')
    } catch {
      return
    }
    teachQueue.current.push(msg)
    pumpTeach()
  }

  const gameEra = era(state)
  const zQ = zQuantize(zombieRatio(state))
  const sky = skyVars(zQ, gameEra)
  const robots = Math.round(zQ * 8)
  const trash = litter(state.lifetimeE.toNumber())
  const action = nextBestAction(state)
  const targetSlot = beaconTargetSlotId(state, action)
  const beaconLot = targetSlot ? PAGE_SLOTS.findIndex((s) => s.id === targetSlot) : -1
  const selLot = sel ? PAGE_SLOTS.findIndex((s) => s.id === sel) : -1

  const anyOverused =
    state.progression.topicChipUnlocked &&
    state.pages.some(
      (p) => p.units > 0 && saturationMult(state.saturation[recipeKey(p.recipe)]) < SATURATION_OVERUSED_BELOW,
    )

  // first city reveal / first robots / first smoke / first crackdown
  useEffect(() => {
    fireTeach('slop.city.teach.reveal', 'this is your empire. tap a building to post.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (zQ >= 0.1) fireTeach('slop.city.teach.crowd', 'the sidewalk: your audience. the robots are yours.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zQ])
  useEffect(() => {
    if (anyOverused) fireTeach('slop.city.teach.smoke', 'smoke = a worn-out topic. tap the building, then ⚙ Tune.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyOverused])
  useEffect(() => {
    if (state.crackdown) fireTeach('slop.city.teach.crackdown', 'crackdown: that platform pays less until the bar runs out.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.crackdown != null])

  // the first-retune lesson needs the Tune button on screen — select the
  // managed building once so the dock's spotlit ⚙ Tune is visible
  const autoSelDone = useRef(false)
  useEffect(() => {
    if (autoSelDone.current) return
    if (state.progression.topicChipUnlocked && !state.progression.firstRetuneDone) {
      const i = state.pages.findIndex((p) => p.manager)
      if (i >= 0) {
        autoSelDone.current = true
        setSel((s) => s ?? state.pages[i].defId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.progression.topicChipUnlocked, state.progression.firstRetuneDone])

  // ── always-mounted juice detectors (PageCards don't render in City view):
  // +$ float + payout sfx on manual cycle completion; milestone + manager
  // celebrations. Runs every tick over 7 pages — cheap.
  const prevCycles = useRef<number[] | null>(null)
  const prevUnits = useRef<number[] | null>(null)
  const prevMgrs = useRef<boolean[] | null>(null)
  useEffect(() => {
    const pages = state.pages
    if (prevCycles.current) {
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        const pc = prevCycles.current[i] ?? 0
        if (!p.manager && p.units > 0 && pc > 0 && p.cycleProgress === 0) {
          const tap = pageTapPayout(state, i)
          const net = tap.dollars - tap.modelCost
          const id = ++floatSeq
          const lot = PAGE_SLOTS.findIndex((s) => s.id === p.defId)
          setFloats((f) => [...f, { id, lot, text: `${net < 0 ? '' : '+'}${fmtMoney(net)}` }])
          setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1200)
          sfx('payout')
        }
        const pu = prevUnits.current?.[i] ?? p.units
        if (p.units > pu) {
          let crossed: number | null = null
          for (const ms of MILESTONES) if (pu < ms && p.units >= ms) crossed = ms
          if (crossed) {
            const mult = crossed === 25 || crossed === 50 ? 3 : 2
            celebrate(`🎉 ${SHORT_NAME[p.defId]} hit ×${crossed} — earns ×${mult} & posts 2× faster!`)
            sfx('milestone')
          }
        }
        const pm = prevMgrs.current?.[i] ?? p.manager
        if (p.manager && !pm) {
          celebrate('🧑‍💼 Manager hired — this building runs itself now.')
          sfx('manager')
        }
      }
    }
    prevCycles.current = pages.map((p) => p.cycleProgress)
    prevUnits.current = pages.map((p) => p.units)
    prevMgrs.current = pages.map((p) => p.manager)
  })

  function celebrate(text: string) {
    setCelebration(text)
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    celebrationTimer.current = setTimeout(() => setCelebration(null), 2600)
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

  // ── THE tap rule: manual+ready → publish; everything else → inspect ──────
  function tapLot(lotIdx: number) {
    const slot = PAGE_SLOTS[lotIdx]
    markHintDone()
    const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
    const page = pageIdx >= 0 ? state.pages[pageIdx] : null
    setSel(slot.id)
    if (pageIdx >= 0 && state.activeScandal?.pageIdx === pageIdx) {
      document.getElementById('scandal-interrupt')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!state.unlockedSlots.includes(slot.id) || !page || page.units === 0 || page.manager) {
      sfx('uiOpen')
      return
    }
    if (page.cycleProgress === 0) {
      sfx('tap')
      dispatch({ type: 'TAP', pageIdx })
    } else {
      // engine ignores mid-cycle taps — acknowledge with a pill pulse, not the
      // publish sound (a full sfx on a no-op would teach that sounds lie)
      setDud({ lot: lotIdx, n: ++dudSeq.current })
    }
  }

  // ready bubbles: rank by payout so only the two richest show amounts —
  // adjacent 50px lots can't fit three full pills
  const readyNet = new Map<number, number>()
  for (let i = 0; i < state.pages.length; i++) {
    const p = state.pages[i]
    if (p.units > 0 && !p.manager && p.cycleProgress === 0) {
      const t = pageTapPayout(state, i)
      readyNet.set(i, t.dollars - t.modelCost)
    }
  }
  const amountRank = [...readyNet.entries()].sort((a, b) => b[1] - a[1]).map(([i]) => i)

  const showHint = beaconLot >= 0 && !hintDone && !blackout
  const captionText = blackout
    ? 'you turned it off. it needed that.'
    : teachMsg ?? (showHint ? 'tap the glowing thing.' : caption(zQ))

  return (
    <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/70">
      <div
        className="relative"
        style={{ '--sky-top': sky.top, '--sky-horizon': sky.horizon, '--core': sky.core } as React.CSSProperties}
        onClick={() => setSel(null)}
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
                  <text x={x + 19} y={GROUND_Y - 16} fontSize="8" textAnchor="middle" aria-hidden>🏗</text>
                  <g transform={`rotate(-6 ${x + 19} ${GROUND_Y - 8})`}>
                    <text x={x + 19} y={GROUND_Y - 9} fontSize="5.5" textAnchor="middle" fill={tone} aria-hidden>ZONED FOR</text>
                    <text x={x + 19} y={GROUND_Y - 3} fontSize="5.5" textAnchor="middle" fill={tone} aria-hidden>SLOP</text>
                  </g>
                </g>
              )
            }
            const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
            const page = state.pages[pageIdx]
            if (!page) return null
            if (page.units === 0) {
              // vacant lot — the post-prestige rebuild path lives here
              return (
                <g key={`${slot.id}-vacant`} opacity={0.8}>
                  <rect x={x} y={GROUND_Y - 14} width="38" height="14" fill="none" stroke="#3f3f46" strokeDasharray="2 3" strokeWidth="1" />
                  <text x={x + 19} y={GROUND_Y - 4} fontSize="7" textAnchor="middle" opacity={0.5} aria-hidden>
                    {EMOJI[slot.platform]}
                  </text>
                </g>
              )
            }
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
                scandal={scandalHere}
                crackdown={crackdownHere}
                dying={blackout}
                dieDelay={i * 0.12}
              />
            )
          })}
        </svg>

        {/* DOM overlay: tap targets, pills, floats, pips, particles, beacon */}
        <div className="absolute inset-0 pointer-events-none">
          {PAGE_SLOTS.map((slot, i) => {
            const locked = !state.unlockedSlots.includes(slot.id)
            const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
            const page = pageIdx >= 0 ? state.pages[pageIdx] : null
            const tier = page ? tierOf(page.units) : 0
            const h = TIER[tier].h
            const centerPct = pct(i * LOT_W + LOT_W / 2, 351)
            const roofBottom = pct(VIEW_H - GROUND_Y + h + 8, VIEW_H)
            // pill anchor: above the roof, clamped clear of the Core's eye
            const pillBottom = pct(VIEW_H - GROUND_Y + Math.min(h + 7, 102), VIEW_H)

            // one ambient pip per lot: scandal siren or overuse smoke
            let pip: 'scandal' | 'smoke' | null = null
            if (page) {
              if (state.activeScandal?.pageIdx === pageIdx) pip = 'scandal'
              else if (
                state.progression.topicChipUnlocked &&
                page.units > 0 &&
                saturationMult(state.saturation[recipeKey(page.recipe)]) < SATURATION_OVERUSED_BELOW
              )
                pip = 'smoke'
            }

            const manual = !!page && page.units > 0 && !page.manager
            const ready = manual && page.cycleProgress === 0
            const net = readyNet.get(pageIdx) ?? 0
            const showAmount = ready && amountRank.indexOf(pageIdx) < 2

            const crackdownHere =
              state.crackdown != null &&
              state.crackdown.platform === slot.platform &&
              state.lastTickAt < state.crackdown.untilMs

            return (
              <span key={slot.id}>
                {/* tap target — full lot column */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    tapLot(i)
                  }}
                  className="absolute pointer-events-auto"
                  style={{ left: pct(i * LOT_W, 351), width: pct(LOT_W, 351), top: '10%', bottom: 0 }}
                  aria-label={
                    locked
                      ? `${slot.name} (locked)`
                      : ready
                      ? `${slot.name} — publish`
                      : slot.name
                  }
                />

                {/* READY BUBBLE → tap me; or PROGRESS PILL → cooking */}
                {ready && (
                  <span
                    aria-hidden
                    className="absolute"
                    style={{ left: centerPct, bottom: pillBottom, transform: 'translateX(-50%)' }}
                  >
                    <span
                      className={`inline-block city-anim rounded-full font-mono font-semibold shadow-lg border whitespace-nowrap ${
                        net < 0
                          ? 'bg-red-950/95 border-red-400/70 text-red-200'
                          : 'bg-emerald-700/95 border-emerald-300/70 text-white'
                      } ${showAmount ? 'text-[10px] px-1.5 py-0.5' : 'text-[10px] px-1 py-0.5'}`}
                      style={{ animation: 'bubbleBob 1.4s ease-in-out infinite' }}
                    >
                      {showAmount ? `${net < 0 ? '' : '+'}${fmtMoney(net)}` : '$'}
                    </span>
                  </span>
                )}
                {manual && !ready && (
                  <span
                    aria-hidden
                    key={dud && dud.lot === i ? `pp-${i}-${dud.n}` : `pp-${i}`}
                    className={`absolute ${dud && dud.lot === i ? 'animate-[flashPop_220ms_ease-out]' : ''}`}
                    style={{ left: centerPct, bottom: pillBottom, transform: 'translateX(-50%)' }}
                  >
                    <span className="block w-9 h-[5px] rounded-full bg-zinc-900/90 border border-zinc-600 overflow-hidden">
                      <span
                        className="block h-full bg-emerald-400"
                        style={{ width: `${Math.min(100, page!.cycleProgress * 100)}%`, transition: 'width 90ms linear' }}
                      />
                    </span>
                  </span>
                )}

                {/* payout floats — fired by the cycle-completion detector */}
                {floats
                  .filter((f) => f.lot === i)
                  .map((f) => (
                    <span
                      key={f.id}
                      aria-hidden
                      className="absolute font-mono font-bold text-emerald-300 text-xs animate-[floatUp_1.1s_ease-out_forwards] whitespace-nowrap"
                      style={{ left: centerPct, bottom: roofBottom, transform: 'translateX(-50%)' }}
                    >
                      {f.text}
                    </span>
                  ))}

                {/* ambient pip */}
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

                {/* post particles — only while something is actually posting */}
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

          {/* selection ring (suppressed when the beacon already rings the lot) */}
          {selLot >= 0 && selLot !== beaconLot && !blackout && (
            <span
              aria-hidden
              className="absolute rounded-xl border-2 border-zinc-300/50"
              style={{
                left: pct(selLot * LOT_W + 3, 351),
                width: pct(44, 351),
                bottom: pct(24, VIEW_H),
                height: pct(
                  (state.unlockedSlots.includes(PAGE_SLOTS[selLot].id)
                    ? TIER[tierOf(state.pages.find((p) => p.defId === PAGE_SLOTS[selLot].id)?.units ?? 0)].h
                    : 20) + 16,
                  VIEW_H,
                ),
              }}
            />
          )}

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

          {/* celebration toast (milestones / managers) */}
          {celebration && (
            <div className="absolute inset-x-2 top-2 z-10 flex justify-center pointer-events-none">
              <div className="bg-black/80 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-50 font-semibold animate-[flashPop_300ms_ease-out] text-center">
                {celebration}
              </div>
            </div>
          )}

          {/* blackout */}
          {blackout && (
            <div className="absolute inset-0 bg-black city-anim" style={{ animation: 'flashPop 600ms ease-in 400ms both' }} />
          )}
        </div>
      </div>

      {/* nameplate strip — every lot labeled, always legible, tappable */}
      <div className="flex border-t border-zinc-800/60">
        {PAGE_SLOTS.map((slot, i) => {
          const locked = !state.unlockedSlots.includes(slot.id)
          const pageIdx = state.pages.findIndex((p) => p.defId === slot.id)
          const page = pageIdx >= 0 ? state.pages[pageIdx] : null
          const isSel = sel === slot.id
          let line1: string
          let line2: string
          let tone = 'text-zinc-400'
          if (locked) {
            const cashOk = state.money.gte(slot.unlock.cash ?? 0)
            const eOk = !slot.unlock.lifetimeE || state.lifetimeE.gte(slot.unlock.lifetimeE)
            line1 = `🔒 ${SHORT_NAME[slot.id]}`
            line2 = fmtMoney(slot.unlock.cash ?? 0)
            tone = cashOk && eOk ? 'text-amber-300' : 'text-zinc-600'
          } else if (!page || page.units === 0) {
            line1 = `${EMOJI[slot.platform]} ${SHORT_NAME[slot.id]}`
            line2 = 'vacant'
            tone = 'text-zinc-500'
          } else {
            const hot = trendDirection(page.recipe, state.trend) === 'hot'
            line1 = `${EMOJI[slot.platform]} ${SHORT_NAME[slot.id]}`
            line2 = `×${page.units}${hot ? ' 🔥' : ''}`
            tone = 'text-zinc-300'
          }
          return (
            <button
              key={slot.id}
              onClick={() => tapLot(i)}
              className={`flex-1 min-w-0 px-0.5 py-1 text-center leading-tight ${
                isSel ? 'bg-zinc-800/80' : ''
              }`}
            >
              <span className={`block text-[9px] truncate ${isSel ? 'text-zinc-100' : tone}`}>{line1}</span>
              <span className={`block text-[8px] truncate ${isSel ? 'text-zinc-300' : 'text-zinc-600'}`}>{line2}</span>
            </button>
          )
        })}
      </div>

      {/* caption row — teach lines > beacon hint > the deadpan Z ladder */}
      <div className="px-3 py-1 border-t border-zinc-800/60">
        <span
          className={`text-[11px] italic ${
            teachMsg ? 'text-fuchsia-200' : showHint ? 'text-amber-300/90' : 'text-zinc-400'
          }`}
        >
          {captionText}
        </span>
      </div>

      <MapDock
        selected={sel}
        action={action}
        onSelect={(slotId) => {
          markHintDone()
          setSel(slotId)
        }}
        onDeselect={() => setSel(null)}
        onOpenDetails={onOpenDetails}
      />
    </div>
  )
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
          <text x={x + 19} y={top - 4.5} fontSize="7" textAnchor="middle" aria-hidden>
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
