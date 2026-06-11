import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { PAGE_SLOT_BY_ID, PLATFORMS, managerCost } from '../engine/data'
import { nextMilestone, unitCost } from '../engine/math'
import { pageDollarsPerSec, pageTapPayout } from '../engine/state'
import { fmtMoney, fmtNumber } from '../format'
import { TuneSheet } from './TuneSheet'
import { useLockBodyScroll } from './useLockBodyScroll'
import { COLORS, EMOJI } from './PageCard'
import { sfx } from './sfx'
import Decimal from 'break_infinity.js'

export type MapTarget = { kind: 'page'; pageIdx: number } | { kind: 'locked'; slotId: string }

// The map's remote control: a mini bottom-sheet with AT MOST three actions,
// every one an existing dispatch. The Tune sheet stays the only decision
// surface; "Details ↓" hands off to the real card.
export function MapPopover({
  target,
  recommended,
  onClose,
}: {
  target: MapTarget
  recommended: 'buy' | 'manager' | 'unlock' | 'retune' | null
  onClose: () => void
}) {
  const { state, dispatch } = useStore()
  useLockBodyScroll()
  const [tuneOpen, setTuneOpen] = useState(false)

  // close if the target stops existing (e.g. prestige wiped the pages)
  const pageGone = target.kind === 'page' && !state.pages[target.pageIdx]
  useEffect(() => {
    if (pageGone) onClose()
  }, [pageGone, onClose])
  if (pageGone) return null

  const rec = (k: string) =>
    recommended === k ? 'ring-2 ring-amber-400' : ''

  let body: React.ReactNode
  if (target.kind === 'locked') {
    const slot = PAGE_SLOT_BY_ID[target.slotId]
    const needCash = slot.unlock.cash ?? 0
    const needE = slot.unlock.lifetimeE ?? 0
    const cashOk = state.money.gte(needCash)
    const eOk = state.lifetimeE.gte(needE)
    const canUnlock = cashOk && eOk
    body = (
      <>
        <Header
          emoji="🔒"
          color="#27272a"
          title={slot.name}
          kicker={PLATFORMS[slot.platform].name}
          right=""
        />
        <p className="text-xs text-zinc-500 italic px-1">{slot.flavor}</p>
        <div className="text-[12px] space-y-1 px-1">
          <div className={cashOk ? 'text-emerald-400' : 'text-zinc-500'}>
            {cashOk ? '✓' : '•'} {fmtMoney(needCash)} saved
          </div>
          {needE > 0 && (
            <div className={eOk ? 'text-emerald-400' : 'text-zinc-500'}>
              {eOk ? '✓' : '•'} {fmtNumber(needE)} lifetime views
            </div>
          )}
        </div>
        <button
          disabled={!canUnlock}
          onClick={() => {
            sfx('unlock')
            dispatch({ type: 'UNLOCK_SLOT', slotId: slot.id })
            onClose()
          }}
          className={`w-full rounded-xl py-2.5 font-semibold text-sm ${
            canUnlock
              ? `bg-fuchsia-700 hover:bg-fuchsia-600 text-white ${rec('unlock')}`
              : 'bg-zinc-800 text-zinc-600'
          }`}
        >
          {canUnlock ? 'Open it →' : 'Locked'}
        </button>
      </>
    )
  } else {
    const page = state.pages[target.pageIdx]
    const slot = PAGE_SLOT_BY_ID[page.defId]
    const dps = pageDollarsPerSec(state, target.pageIdx)
    const tap = pageTapPayout(state, target.pageIdx)
    const tapNet = tap.dollars - tap.modelCost
    const m = nextMilestone(page.units)
    const bundleCount = page.units === 0 ? 1 : m ? m - page.units : 1
    const bundleCost = unitCost(slot, page.units, bundleCount)
    const bundleAffordable = bundleCost.eq(0) || state.money.gte(bundleCost)
    // when the milestone bundle is out of reach, fall back to a live ×1 so the
    // map never shows a dead Buy button while the card below sells one
    const fallback =
      !bundleAffordable && bundleCount > 1 && state.money.gte(unitCost(slot, page.units, 1))
    const buyCount = fallback ? 1 : bundleCount
    const buyCost = fallback ? unitCost(slot, page.units, 1) : bundleCost
    const buyAffordable = bundleAffordable || fallback
    const mgrCost = new Decimal(managerCost(slot))
    const inFlight = page.cycleProgress > 0
    const rate = page.manager ? `${fmtMoney(dps)}/s` : `${fmtMoney(tapNet)}/post`

    body = (
      <>
        <Header
          emoji={EMOJI[slot.platform]}
          color={COLORS[slot.platform]}
          title={slot.name}
          kicker={`${PLATFORMS[slot.platform].name}${page.units > 0 ? ` · ×${page.units}` : ''}`}
          right={page.units > 0 ? rate : ''}
          rightRed={page.manager ? dps < 0 : tapNet < 0}
        />

        {page.units > 0 && !page.manager && (
          <button
            disabled={inFlight}
            onClick={() => {
              sfx('tap')
              dispatch({ type: 'TAP', pageIdx: target.pageIdx })
            }}
            className="relative w-full overflow-hidden rounded-xl bg-fuchsia-700 disabled:bg-zinc-800 text-white font-semibold py-2.5 text-sm"
          >
            <span
              className="absolute inset-y-0 left-0 bg-fuchsia-500/60"
              style={{ width: `${Math.min(100, page.cycleProgress * 100)}%`, transition: 'width 80ms linear' }}
            />
            <span className="relative">{inFlight ? 'Publishing…' : `Publish +${fmtMoney(tapNet)}`}</span>
          </button>
        )}

        <button
          disabled={!buyAffordable}
          onClick={() => {
            sfx('buy')
            dispatch({ type: 'BUY_UNITS', pageIdx: target.pageIdx, count: buyCount })
          }}
          className={`w-full rounded-xl py-2.5 font-semibold text-sm border ${
            buyAffordable
              ? `bg-fuchsia-900/40 hover:bg-fuchsia-800/60 border-fuchsia-700/40 text-zinc-100 ${rec('buy')}`
              : 'bg-zinc-800/40 border-zinc-800 text-zinc-600'
          }`}
        >
          {page.units === 0
            ? `Start this page — ${buyCost.eq(0) ? 'free' : fmtMoney(buyCost)}`
            : m && !fallback
            ? `Buy to ×${m} — ${fmtMoney(buyCost)}`
            : `Buy ×1 — ${fmtMoney(buyCost)}`}
        </button>

        {page.units > 0 && !page.manager ? (
          <button
            disabled={state.money.lt(mgrCost)}
            onClick={() => dispatch({ type: 'BUY_MANAGER', pageIdx: target.pageIdx })}
            className={`w-full rounded-xl py-2.5 font-semibold text-sm border ${
              state.money.gte(mgrCost)
                ? `bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100 ${rec('manager')}`
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            Hire Manager — {fmtMoney(mgrCost)}
          </button>
        ) : (
          page.manager &&
          state.progression.topicChipUnlocked && (
            <button
              onClick={() => {
                sfx('uiOpen')
                setTuneOpen(true)
              }}
              className={`w-full rounded-xl py-2.5 font-semibold text-sm border bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100 ${rec('retune')}`}
            >
              ⚙ Tune
            </button>
          )
        )}

        <button
          onClick={() => {
            onClose()
            window.dispatchEvent(new CustomEvent('slop:focus-page', { detail: { pageIdx: target.pageIdx } }))
          }}
          className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 py-1"
        >
          Details ↓
        </button>

        {tuneOpen && <TuneSheet pageIdx={target.pageIdx} onClose={() => setTuneOpen(false)} />}
      </>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-4 space-y-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </div>
    </div>
  )
}

function Header({
  emoji,
  color,
  title,
  kicker,
  right,
  rightRed,
}: {
  emoji: string
  color: string
  title: string
  kicker: string
  right: string
  rightRed?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg" style={{ background: color }}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-zinc-500">{kicker}</div>
        <div className="text-zinc-100 font-medium truncate leading-tight">{title}</div>
      </div>
      {right && (
        <div className={`font-mono text-sm font-semibold ${rightRed ? 'text-red-400' : 'text-emerald-300'}`}>{right}</div>
      )}
    </div>
  )
}
