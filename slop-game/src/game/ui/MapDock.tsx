import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { PAGE_SLOT_BY_ID, PLATFORMS, TOPICS, managerCost } from '../engine/data'
import { effectiveCycleSec, nextMilestone, unitCost, recipeKey, saturationMult, SATURATION_OVERUSED_BELOW } from '../engine/math'
import { pageDollarsPerSec, pageTapPayout } from '../engine/state'
import { fmtMoney, fmtNumber, fmtSeconds } from '../format'
import { COLORS, EMOJI } from './PageCard'
import { TuneSheet } from './TuneSheet'
import { SHORT_NAME, beaconTargetSlotId } from './mapLogic'
import type { NextBestAction } from './mapLogic'
import { sfx } from './sfx'
import Decimal from 'break_infinity.js'

// The city's persistent control strip. Fixed height, stable button slots
// (Publish | Buy | Hire-or-Tune), every action an existing dispatch. NEXT is a
// NAVIGATOR — it selects the target lot; spending always takes a second,
// deliberate tap on a stable button. A short input guard after every selection
// change keeps a publish-mash from landing on a purchase.
export function MapDock({
  selected,
  action,
  onSelect,
  onDeselect,
  onOpenDetails,
}: {
  selected: string | null
  action: NextBestAction | null
  onSelect: (slotId: string) => void
  onDeselect: () => void
  onOpenDetails: (pageIdx: number) => void
}) {
  const { state, dispatch } = useStore()
  const [tuneOpen, setTuneOpen] = useState(false)

  // ── input guard: ignore button presses right after the selection changed ──
  const guardUntil = useRef(0)
  useEffect(() => {
    guardUntil.current = performance.now() + 280
  }, [selected])
  function guarded(fn: () => void) {
    return () => {
      if (performance.now() < guardUntil.current) return
      fn()
      // re-arm: the panel morphs in place after actions (Open it → Start →
      // Buy to ×N, Hire → Tune) — a double-tap must not land on the morph
      guardUntil.current = performance.now() + 280
    }
  }

  const pageIdx = selected ? state.pages.findIndex((p) => p.defId === selected) : -1
  const page = pageIdx >= 0 ? state.pages[pageIdx] : null

  // the Tune sheet must not outlive its page (prestige wipes its units)
  useEffect(() => {
    if (tuneOpen && (!page || page.units === 0)) setTuneOpen(false)
  }, [tuneOpen, page])

  const target = beaconTargetSlotId(state, action)
  const nextChip =
    target && target !== selected ? (
      <button
        onClick={() => onSelect(target)}
        className="shrink-0 text-[10px] font-semibold text-amber-300 border border-amber-500/50 bg-amber-950/40 rounded-full px-2.5 py-1"
      >
        → next
      </button>
    ) : null

  // ── nothing selected: the navigator row ─────────────────────────────────
  if (!selected) {
    let inner: React.ReactNode
    if (state.activeScandal) {
      inner = (
        <button
          onClick={() =>
            document.getElementById('scandal-interrupt')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          className="w-full rounded-xl border border-orange-600 bg-orange-950/40 py-2.5 text-sm font-semibold text-orange-200"
        >
          ⚡ scandal in progress — resolve it ↑
        </button>
      )
    } else if (action && target) {
      const label =
        action.kind === 'unlock'
          ? `open ${PAGE_SLOT_BY_ID[action.slotId].name}`
          : action.kind === 'manager'
          ? `hire a manager for ${SHORT_NAME[target]}`
          : action.kind === 'retune'
          ? `⚙ tune ${SHORT_NAME[target]} — topic worn out`
          : `grow ${SHORT_NAME[target]}`
      inner = (
        <button
          onClick={() => onSelect(target)}
          className="w-full rounded-xl border border-amber-500/60 bg-amber-950/30 py-2.5 text-sm font-semibold text-amber-200"
        >
          → next: {label}
        </button>
      )
    } else {
      // don't claim the city runs itself while the economy is still hand-cranked
      const anyManual = state.pages.some((p) => p.units > 0 && !p.manager)
      inner = (
        <div className="w-full text-center text-xs italic text-zinc-500 py-2.5">
          {anyManual
            ? 'tap a $ bubble to publish · tap any building to inspect'
            : 'the city runs itself. tap a building to inspect it.'}
        </div>
      )
    }
    return (
      <div className="h-[148px] px-3 py-2 border-t border-zinc-800/60 flex flex-col justify-center gap-1">
        {inner}
        <div className="text-center text-[10px] text-zinc-600">tap a building · tap the sky to deselect</div>
      </div>
    )
  }

  // ── a lot is selected ────────────────────────────────────────────────────
  const slot = PAGE_SLOT_BY_ID[selected]
  const locked = !state.unlockedSlots.includes(selected)

  if (locked) {
    const needCash = slot.unlock.cash ?? 0
    const needE = slot.unlock.lifetimeE ?? 0
    const cashOk = state.money.gte(needCash)
    const eOk = !needE || state.lifetimeE.gte(needE)
    const canUnlock = cashOk && eOk
    const rec = action?.kind === 'unlock' && action.slotId === selected
    return (
      <div className="h-[148px] px-3 py-2 border-t border-zinc-800/60 flex flex-col gap-1.5">
        <DockHeader
          emoji="🔒"
          color="#27272a"
          kicker={PLATFORMS[slot.platform].name}
          title={slot.name}
          right=""
          extra={nextChip}
          onClose={onDeselect}
        />
        <div className="flex items-center gap-3 text-[11px]">
          <span className={cashOk ? 'text-emerald-400' : 'text-zinc-500'}>
            {cashOk ? '✓' : '•'} {fmtMoney(needCash)} saved
          </span>
          {needE > 0 && (
            <span className={eOk ? 'text-emerald-400' : 'text-zinc-500'}>
              {eOk ? '✓' : '•'} {fmtNumber(needE)} lifetime views
            </span>
          )}
        </div>
        <button
          disabled={!canUnlock}
          onClick={guarded(() => {
            sfx('unlock')
            dispatch({ type: 'UNLOCK_SLOT', slotId: slot.id })
          })}
          className={`w-full rounded-xl py-2 font-semibold text-sm ${
            canUnlock
              ? `bg-fuchsia-700 hover:bg-fuchsia-600 text-white ${rec ? 'ring-2 ring-amber-400' : ''}`
              : 'bg-zinc-800 text-zinc-600'
          }`}
        >
          {canUnlock ? 'Open it →' : 'Locked'}
        </button>
      </div>
    )
  }

  if (!page) {
    // unlocked but no page row exists (shouldn't happen — unlock creates one)
    return <div className="h-[148px] border-t border-zinc-800/60" />
  }

  const dps = pageDollarsPerSec(state, pageIdx)
  const tap = pageTapPayout(state, pageIdx)
  const tapNet = tap.dollars - tap.modelCost
  const rate = page.manager ? `${fmtMoney(dps)}/s` : `${fmtMoney(tapNet)}/post`
  const rateRed = page.manager ? dps < 0 : tapNet < 0
  const inFlight = page.cycleProgress > 0
  const cycleSec = effectiveCycleSec(slot, page.units)

  // Buy: milestone bundle with the ×1 fallback (ported from the old popover)
  const m = nextMilestone(page.units)
  const bundleCount = page.units === 0 ? 1 : m ? m - page.units : 1
  const bundleCost = unitCost(slot, page.units, bundleCount)
  const bundleAffordable = bundleCost.eq(0) || state.money.gte(bundleCost)
  const fallback = !bundleAffordable && bundleCount > 1 && state.money.gte(unitCost(slot, page.units, 1))
  const buyCount = fallback ? 1 : bundleCount
  const buyCost = fallback ? unitCost(slot, page.units, 1) : bundleCost
  const buyAffordable = bundleAffordable || fallback
  const buyLabel =
    page.units === 0
      ? `Start — ${buyCost.eq(0) ? 'free' : fmtMoney(buyCost)}`
      : m && !fallback
      ? `Buy to ×${m}`
      : 'Buy ×1'

  const mgrCost = new Decimal(managerCost(slot))
  const overused =
    state.progression.topicChipUnlocked &&
    page.units > 0 &&
    saturationMult(state.saturation[recipeKey(page.recipe)]) < SATURATION_OVERUSED_BELOW
  const scandalHere = state.activeScandal?.pageIdx === pageIdx
  const crackdownHere =
    state.crackdown != null && state.crackdown.platform === slot.platform && state.lastTickAt < state.crackdown.untilMs
  const spotlightTune =
    page.manager && state.progression.topicChipUnlocked && !state.progression.firstRetuneDone

  // one status line, by priority — this is where smoke/sirens get words
  let status: React.ReactNode = null
  if (scandalHere)
    status = (
      <button
        onClick={() =>
          document.getElementById('scandal-interrupt')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        className="text-orange-300 text-left"
      >
        ⚡ scandal in progress — resolve it ↑
      </button>
    )
  else if (crackdownHere) status = <span className="text-cyan-300">🚨 crackdown — earnings cut until the bar empties</span>
  else if (overused)
    // a button: manual pages have no Tune slot (it holds Hire Mgr), so the
    // words ARE the control
    status = (
      <button
        onClick={() => {
          sfx('uiOpen')
          setTuneOpen(true)
        }}
        className="text-orange-300 text-left"
      >
        💨 topic worn out — ⚙ Tune it
      </button>
    )
  else if (page.manager && dps < 0) status = <span className="text-red-400">⚠ the model costs more than it earns</span>
  else if (page.units === 0 && page.manager)
    status = <span className="text-zinc-500 italic">manager retained — buy a unit to restart</span>
  else if (page.units > 0)
    status = (
      <span className="text-zinc-500">
        {page.manager ? 'auto-posts' : 'posts'} every {fmtSeconds(cycleSec)}
        {state.progression.topicChipUnlocked && ` · posting: ${TOPICS[page.recipe.topic].name}`}
      </span>
    )
  else status = <span className="text-zinc-500 italic">{slot.flavor ?? 'a vacant lot.'}</span>

  const recBuy = action?.kind === 'buy' && action.pageIdx === pageIdx
  const recMgr = action?.kind === 'manager' && action.pageIdx === pageIdx
  const recTune = action?.kind === 'retune' && action.pageIdx === pageIdx

  return (
    <div className="h-[148px] px-3 py-2 border-t border-zinc-800/60 flex flex-col gap-1.5">
      <DockHeader
        emoji={EMOJI[slot.platform]}
        color={COLORS[slot.platform]}
        kicker={`${PLATFORMS[slot.platform].name}${page.units > 0 ? ` · ×${page.units}` : ''}`}
        title={slot.name}
        right={page.units > 0 ? rate : ''}
        rightRed={rateRed}
        extra={nextChip}
        onClose={onDeselect}
      />
      <div className="text-[11px] leading-tight truncate">{status}</div>

      {/* the three stable slots — ghosts keep the layout from shifting */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* slot 1: Publish */}
        {page.units > 0 && !page.manager ? (
          <button
            disabled={inFlight}
            onClick={guarded(() => {
              sfx('tap')
              dispatch({ type: 'TAP', pageIdx })
            })}
            className="relative overflow-hidden rounded-lg bg-fuchsia-700 disabled:bg-zinc-800 text-white font-semibold py-2 text-xs"
          >
            <span
              className="absolute inset-y-0 left-0 bg-fuchsia-500/60"
              style={{ width: `${Math.min(100, page.cycleProgress * 100)}%`, transition: 'width 80ms linear' }}
            />
            <span className="relative">{inFlight ? `…${fmtSeconds(cycleSec * (1 - page.cycleProgress))}` : 'Publish'}</span>
          </button>
        ) : page.manager && page.units > 0 ? (
          <div className="rounded-lg border border-zinc-800 text-zinc-600 text-[10px] flex items-center justify-center">
            🧑‍💼 auto
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800/60" />
        )}

        {/* slot 2: Buy */}
        <button
          disabled={!buyAffordable}
          onClick={guarded(() => {
            sfx('buy')
            dispatch({ type: 'BUY_UNITS', pageIdx, count: buyCount })
          })}
          className={`rounded-lg py-2 text-xs font-semibold border leading-tight ${
            buyAffordable
              ? `bg-fuchsia-900/40 border-fuchsia-700/40 text-zinc-100 ${recBuy ? 'ring-2 ring-amber-400' : ''}`
              : 'bg-zinc-800/40 border-zinc-800 text-zinc-600'
          }`}
        >
          {buyLabel}
          <span className="block text-[9px] font-mono font-normal opacity-80">
            {buyCost.eq(0) ? '—' : fmtMoney(buyCost)}
          </span>
        </button>

        {/* slot 3: Hire / Tune */}
        {page.units > 0 && !page.manager ? (
          <button
            disabled={state.money.lt(mgrCost)}
            onClick={guarded(() => dispatch({ type: 'BUY_MANAGER', pageIdx }))}
            className={`rounded-lg py-2 text-xs font-semibold border leading-tight ${
              state.money.gte(mgrCost)
                ? `bg-zinc-800 border-zinc-700 text-zinc-100 ${recMgr ? 'ring-2 ring-amber-400' : ''}`
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            Hire Mgr
            <span className="block text-[9px] font-mono font-normal opacity-80">{fmtMoney(mgrCost)}</span>
          </button>
        ) : page.manager && page.units > 0 && state.progression.topicChipUnlocked ? (
          <button
            onClick={guarded(() => {
              sfx('uiOpen')
              setTuneOpen(true)
            })}
            className={`rounded-lg py-2 text-xs font-semibold border ${
              spotlightTune
                ? 'border-fuchsia-400 ring-2 ring-fuchsia-500/60 animate-pulse motion-reduce:animate-none bg-fuchsia-950/40 text-zinc-100'
                : recTune
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 ring-2 ring-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-100'
            }`}
          >
            ⚙ Tune
          </button>
        ) : (
          <div className="rounded-lg border border-zinc-800/60" />
        )}
      </div>

      {page.units > 0 && (
        <button
          onClick={guarded(() => onOpenDetails(pageIdx))}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 text-center py-1"
        >
          full details (buy ×10 / ×100 / MAX) →
        </button>
      )}

      {tuneOpen && page.units > 0 && <TuneSheet pageIdx={pageIdx} onClose={() => setTuneOpen(false)} />}
    </div>
  )
}

function DockHeader({
  emoji,
  color,
  kicker,
  title,
  right,
  rightRed,
  extra,
  onClose,
}: {
  emoji: string
  color: string
  kicker: string
  title: string
  right: string
  rightRed?: boolean
  extra?: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-sm"
        style={{ background: color }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-[8px] uppercase tracking-wider text-zinc-500">{kicker}</div>
        <div className="text-zinc-100 text-sm font-medium truncate">{title}</div>
      </div>
      {right && (
        <span className={`font-mono text-xs font-semibold ${rightRed ? 'text-red-400' : 'text-emerald-300'}`}>
          {right}
        </span>
      )}
      {extra}
      <button onClick={onClose} aria-label="Deselect" className="shrink-0 text-zinc-600 hover:text-zinc-300 p-2 -m-1 text-sm">
        ✕
      </button>
    </div>
  )
}
