import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import {
  PAGE_SLOT_BY_ID,
  MODELS,
  MODEL_CYCLE_COST,
  MILESTONES,
  TOPICS,
  TACTICS,
  PLATFORMS,
  managerCost,
} from '../engine/data'
import {
  effectiveCycleSec,
  maxBuyable,
  nextMilestone,
  recipeKey,
  unitCost,
  SATURATION_OVERUSED_BELOW,
  saturationMult,
} from '../engine/math'
import { pageDollarsPerSec, pageTapPayout } from '../engine/state'
import { fmtMoney, fmtSeconds } from '../format'
import { FactorStrip } from './FactorStrip'
import { ChipPicker } from './ChipPicker'
import { sfx } from './sfx'
import Decimal from 'break_infinity.js'
import type { ModelId, PlatformId, TacticId, TopicId } from '../engine/types'

interface Float {
  id: number
  text: string
  xPct: number
}

let floatId = 0

export function PageCard({ pageIdx }: { pageIdx: number }) {
  const { state, dispatch } = useStore()
  const page = state.pages[pageIdx]
  const slot = PAGE_SLOT_BY_ID[page.defId]
  const [picker, setPicker] = useState<'model' | 'topic' | 'tactic' | null>(null)

  // Collapsed by default once a manager runs the page; manual pages stay open.
  const [expanded, setExpanded] = useState(!page.manager || page.units === 0)
  const [celebration, setCelebration] = useState<string | null>(null)
  const [rateFlash, setRateFlash] = useState<string | null>(null)
  const [floats, setFloats] = useState<Float[]>([])

  const chipsUnlocked = state.progression.topicChipUnlocked
  const cycleSec = effectiveCycleSec(slot, page.units)
  const tapPayout = pageTapPayout(state, pageIdx)
  const dpsManager = pageDollarsPerSec(state, pageIdx)
  const rawSat = saturationMult(state.saturation[recipeKey(page.recipe)])
  const isBurning = rawSat < SATURATION_OVERUSED_BELOW
  const milestone = nextMilestone(page.units)
  const cycleInFlight = page.cycleProgress > 0
  const canTap = page.units > 0 && !page.manager && !cycleInFlight
  const modelCostPerPost = MODEL_CYCLE_COST[page.recipe.model] * page.units
  const losingMoney = page.manager && dpsManager < 0
  const liveRate = page.manager ? dpsManager : tapPayout.dollars - tapPayout.modelCost

  // ── Juice detectors ─────────────────────────────────────────────────────
  const prevUnits = useRef(page.units)
  const prevManager = useRef(page.manager)
  const prevCycle = useRef(page.cycleProgress)
  const lastRecipeKey = useRef(recipeKey(page.recipe))
  const lastRate = useRef(liveRate)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Milestone crossing → fanfare + overlay
  useEffect(() => {
    if (page.units > prevUnits.current) {
      let crossed: number | null = null
      for (const m of MILESTONES) {
        if (prevUnits.current < m && page.units >= m) crossed = m
      }
      if (crossed) {
        const mult = crossed === 25 || crossed === 50 ? 3 : 2
        celebrate(`🎉 ×${crossed} copies — earns ×${mult} & posts 2× faster!`)
        sfx('milestone')
      }
    }
    prevUnits.current = page.units
  }, [page.units])

  // Manager hired → chime + overlay + auto-collapse into glance mode.
  // EXCEPT the very first manager: the hint is about to say "tap the Topic
  // chip" — collapsing the card would hide the exact thing it points at.
  useEffect(() => {
    if (page.manager && !prevManager.current) {
      celebrate('🧑‍💼 Manager hired — this page now runs itself.')
      sfx('manager')
      if (state.pages.length > 1) {
        const t = setTimeout(() => setExpanded(false), 3000)
        return () => clearTimeout(t)
      }
    }
    prevManager.current = page.manager
  }, [page.manager])

  // Manual publish completed → floating +$ + coin blip
  useEffect(() => {
    if (!page.manager && prevCycle.current > 0 && page.cycleProgress === 0) {
      spawnFloat(`+${fmtMoney(tapPayout.dollars - tapPayout.modelCost)}`)
      sfx('payout')
    }
    prevCycle.current = page.cycleProgress
  }, [page.cycleProgress, page.manager])

  // Retune → show the rate delta so cause→effect is unmissable
  useEffect(() => {
    const key = recipeKey(page.recipe)
    if (key !== lastRecipeKey.current) {
      const before = lastRate.current
      const after = liveRate
      if (before > 0 && isFinite(after)) {
        const pct = Math.round(((after - before) / before) * 100)
        if (pct !== 0) {
          setRateFlash(`${pct > 0 ? '▲ +' : '▼ '}${pct}%`)
          const t = setTimeout(() => setRateFlash(null), 2600)
          lastRecipeKey.current = key
          lastRate.current = after
          return () => clearTimeout(t)
        }
      }
      lastRecipeKey.current = key
    }
    lastRate.current = liveRate
  }, [page.recipe, liveRate])

  function celebrate(text: string) {
    setCelebration(text)
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    celebrationTimer.current = setTimeout(() => setCelebration(null), 2600)
  }

  function spawnFloat(text: string) {
    const id = ++floatId
    setFloats((f) => [...f, { id, text, xPct: 35 + Math.random() * 30 }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1200)
  }

  // ── Collapsed glance row ────────────────────────────────────────────────
  const header = (
    <button onClick={() => setExpanded((e) => !e)} className="w-full text-left px-4 pt-3 pb-2">
      <div className="flex items-center gap-3">
        <PlatformAvatar id={slot.platform} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 shrink-0">
              {PLATFORMS[slot.platform].name}
            </span>
            {page.units > 0 && <span className="text-zinc-500 text-xs shrink-0">×{page.units}</span>}
            {isBurning && chipsUnlocked && page.units > 0 && (
              <span className="text-orange-400 text-[10px] shrink-0">⚠ overused</span>
            )}
            <span className="ml-auto" />
            {page.units > 0 && (
              <span className={`font-mono text-sm font-semibold shrink-0 ${losingMoney ? 'text-red-400' : 'text-emerald-300'}`}>
                {page.manager ? `${fmtMoney(dpsManager)}/s` : `${fmtMoney(liveRate)}/post`}
              </span>
            )}
            <span className="text-zinc-500 text-xs shrink-0">{expanded ? '▴' : '▾'}</span>
          </div>
          <div className="text-zinc-100 font-medium truncate leading-tight">{slot.name}</div>
          <div className="text-xs text-zinc-500 truncate italic mt-0.5">
            {page.units === 0
              ? slot.flavor ?? 'A blank page.'
              : chipsUnlocked
              ? `posting: ${TOPICS[page.recipe.topic].name}`
              : 'tap to publish'}
          </div>
        </div>
      </div>
    </button>
  )

  return (
    <div className="relative bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
      {header}

      {/* Thin production bar — always visible so the pulse never disappears */}
      {page.units > 0 && page.manager && (
        <div className="px-4 pb-2">
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500/70"
              style={{ width: `${Math.min(100, page.cycleProgress * 100)}%`, transition: 'width 90ms linear' }}
            />
          </div>
        </div>
      )}

      {expanded && (
        <>
          {/* CHIPS — hidden until first manager bought (§5 Era I roll-out) */}
          {chipsUnlocked && page.units > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              <Chip label="Topic" value={TOPICS[page.recipe.topic].name} onClick={() => { sfx('uiOpen'); setPicker('topic') }} />
              {state.progression.tacticChipUnlocked && (
                <Chip label="Tactic" value={TACTICS[page.recipe.tactic].name} onClick={() => { sfx('uiOpen'); setPicker('tactic') }} />
              )}
              {state.progression.modelChipUnlocked && (
                <Chip label="Model" value={MODELS[page.recipe.model].name} onClick={() => { sfx('uiOpen'); setPicker('model') }} />
              )}
            </div>
          )}

          {/* RATE READOUT + retune delta flash */}
          {page.units > 0 && (
            <div className="px-4 pb-1 flex items-center gap-2 text-sm">
              {page.manager ? (
                <span className={`font-mono font-semibold ${losingMoney ? 'text-red-400' : 'text-emerald-300'}`}>
                  {fmtMoney(dpsManager)}
                  <span className="text-zinc-500 text-xs font-normal"> /sec</span>
                </span>
              ) : (
                <span className="text-zinc-300 font-mono text-xs">
                  earns {fmtMoney(tapPayout.dollars - tapPayout.modelCost)} per post
                </span>
              )}
              {rateFlash && (
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded animate-[flashPop_300ms_ease-out] ${
                    rateFlash.startsWith('▲') ? 'text-emerald-300 bg-emerald-900/50' : 'text-red-300 bg-red-900/40'
                  }`}
                >
                  {rateFlash}
                </span>
              )}
            </div>
          )}

          {/* MODEL RUNNING COST */}
          {page.units > 0 && modelCostPerPost > 0 && (
            <div className="px-4 pb-2 text-[11px]">
              {losingMoney ? (
                <span className="text-red-400">
                  ⚠ {MODELS[page.recipe.model].name} costs more to run than it earns — switch to a cheaper
                  model or grow this page.
                </span>
              ) : (
                <span className="text-zinc-500">
                  running {MODELS[page.recipe.model].name}: −{fmtMoney(MODEL_CYCLE_COST[page.recipe.model])}/post
                </span>
              )}
            </div>
          )}

          {/* FACTOR STRIP */}
          {chipsUnlocked && page.units > 0 && (
            <div className="px-4 pb-3">
              <FactorStrip recipe={page.recipe} />
            </div>
          )}

          {/* PUBLISH BUTTON (pre-manager) */}
          {page.units > 0 && !page.manager && (
            <PublishButton
              pageIdx={pageIdx}
              canTap={canTap}
              progress={page.cycleProgress}
              cycleSec={cycleSec}
              payoutDollars={tapPayout.dollars - tapPayout.modelCost}
            />
          )}

          {/* BUY ROW */}
          <div className="px-4 pb-3">
            <BuyButtons pageIdx={pageIdx} />
          </div>

          {/* MANAGER BUTTON */}
          {!page.manager && page.units > 0 && (
            <div className="px-4 pb-4">
              <ManagerButton pageIdx={pageIdx} cost={new Decimal(managerCost(slot))} />
            </div>
          )}

          {/* CYCLE INFO */}
          {chipsUnlocked && page.units > 0 && (
            <div className="px-4 pb-3 text-[10px] text-zinc-600">
              {page.manager ? 'auto-posts' : 'posts'} every {fmtSeconds(cycleSec)}
              {milestone && <> · speeds up + earns more at {milestone} copies</>}
            </div>
          )}
        </>
      )}

      {/* Floating +$ */}
      {floats.map((f) => (
        <span
          key={f.id}
          className="pointer-events-none absolute bottom-1/3 font-mono font-bold text-emerald-300 text-base animate-[floatUp_1.1s_ease-out_forwards]"
          style={{ left: `${f.xPct}%` }}
        >
          {f.text}
        </span>
      ))}

      {/* Celebration overlay (milestone / manager) */}
      {celebration && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-[2px] animate-[flashPop_300ms_ease-out]">
          <div className="px-5 text-center text-zinc-50 font-semibold leading-snug">{celebration}</div>
        </div>
      )}

      {picker && (
        <ChipPicker
          axis={picker}
          recipe={page.recipe}
          onPick={(v) =>
            dispatch({
              type: 'RETUNE',
              pageIdx,
              axis: picker,
              value: v as ModelId | TopicId | TacticId,
            })
          }
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

function Chip({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-2.5 py-1.5 flex flex-col items-start"
    >
      <span className="text-[10px] uppercase text-zinc-500 tracking-wider leading-none">{label}</span>
      <span className="text-zinc-100 leading-tight mt-0.5">{value}</span>
    </button>
  )
}

function PlatformAvatar({ id }: { id: PlatformId }) {
  return (
    <div
      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg"
      style={{ background: COLORS[id] }}
    >
      {EMOJI[id]}
    </div>
  )
}

const COLORS: Record<PlatformId, string> = {
  facebook: '#1d4ed8',
  amazon: '#b45309',
  spotify: '#15803d',
  yt_kids: '#dc2626',
  google: '#7c3aed',
  tiktok: '#0891b2',
  linkedin: '#1e3a8a',
}

const EMOJI: Record<PlatformId, string> = {
  facebook: '👴',
  amazon: '📦',
  spotify: '🎵',
  yt_kids: '📺',
  google: '🔍',
  tiktok: '📱',
  linkedin: '💼',
}

function PublishButton({
  pageIdx,
  canTap,
  progress,
  cycleSec,
  payoutDollars,
}: {
  pageIdx: number
  canTap: boolean
  progress: number
  cycleSec: number
  payoutDollars: number
}) {
  const { dispatch } = useStore()
  const inFlight = progress > 0
  return (
    <div className="px-4 pb-3">
      <button
        onClick={() => {
          sfx('tap')
          dispatch({ type: 'TAP', pageIdx })
        }}
        disabled={!canTap}
        className="relative w-full overflow-hidden rounded-xl bg-fuchsia-700 disabled:bg-zinc-800 text-white font-semibold py-3 text-base active:scale-[0.99]"
      >
        <span
          className="absolute inset-y-0 left-0 bg-fuchsia-500/60"
          style={{ width: `${Math.min(100, progress * 100)}%`, transition: 'width 80ms linear' }}
        />
        <span className="relative flex items-center justify-center gap-2">
          {inFlight ? (
            <>
              <span>Publishing…</span>
              <span className="text-xs opacity-70 font-mono">~{fmtSeconds(cycleSec * (1 - progress))}</span>
            </>
          ) : (
            <>
              <span>Publish</span>
              <span className="text-xs opacity-80 font-mono">+{fmtMoney(payoutDollars)}</span>
            </>
          )}
        </span>
      </button>
    </div>
  )
}

function BuyButtons({ pageIdx }: { pageIdx: number }) {
  const { state, dispatch } = useStore()
  const page = state.pages[pageIdx]
  const slot = PAGE_SLOT_BY_ID[page.defId]
  const counts: number[] = page.units === 0 ? [1] : [1, 10, 100]
  const maxN = maxBuyable(slot, page.units, state.money)

  function buy(count: number) {
    sfx('buy')
    dispatch({ type: 'BUY_UNITS', pageIdx, count })
  }

  return (
    <div className="flex gap-2">
      {counts.map((n) => {
        const cost = unitCost(slot, page.units, n)
        const free = cost.eq(0)
        const canAfford = free || state.money.gte(cost)
        return (
          <button
            key={n}
            disabled={!canAfford}
            onClick={() => buy(n)}
            className="flex-1 bg-fuchsia-900/40 hover:bg-fuchsia-800/60 disabled:bg-zinc-800/40 disabled:text-zinc-600 border border-fuchsia-700/40 disabled:border-zinc-800 rounded-lg py-2 text-xs"
          >
            <div className="font-semibold text-zinc-100">
              Buy ×{n}
              {free && page.units === 0 ? ' (free)' : ''}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">{free ? '—' : fmtMoney(cost)}</div>
          </button>
        )
      })}
      {page.units > 0 && (
        <button
          disabled={maxN < 1}
          onClick={() => buy(Math.max(1, maxN))}
          className="flex-1 bg-fuchsia-700 hover:bg-fuchsia-600 disabled:bg-zinc-800/40 disabled:text-zinc-600 border border-fuchsia-500 disabled:border-zinc-800 rounded-lg py-2 text-xs"
        >
          <div className="font-semibold text-zinc-100">MAX</div>
          <div className="text-[10px] text-zinc-100/80 font-mono">×{maxN}</div>
        </button>
      )}
    </div>
  )
}

function ManagerButton({ pageIdx, cost }: { pageIdx: number; cost: Decimal }) {
  const { state, dispatch } = useStore()
  const canAfford = state.money.gte(cost)
  return (
    <button
      disabled={!canAfford}
      onClick={() => dispatch({ type: 'BUY_MANAGER', pageIdx })}
      className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 disabled:border-zinc-800 rounded-lg py-2 text-xs"
    >
      <div className="font-semibold text-zinc-100">
        Hire Account Manager
        <span className="ml-2 text-[10px] text-zinc-400 font-mono">{fmtMoney(cost)}</span>
      </div>
      <div className="text-[10px] text-zinc-500 italic mt-0.5">You automate yourself out of your own farm.</div>
    </button>
  )
}
