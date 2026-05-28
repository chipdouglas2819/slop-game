import { useState } from 'react'
import { useStore } from '../store'
import {
  PAGE_SLOT_BY_ID,
  MODELS,
  TOPICS,
  TACTICS,
  PLATFORMS,
  managerCost,
} from '../engine/data'
import {
  effectiveCycleSec,
  maxBuyable,
  nextMilestone,
  unitCost,
} from '../engine/math'
import {
  pageDollarsPerSec,
  pageScore,
  pageTapPayout,
} from '../engine/state'
import { fmtMoney, fmtSeconds } from '../format'
import { FactorStrip } from './FactorStrip'
import { ChipPicker } from './ChipPicker'
import Decimal from 'break_infinity.js'
import type { ModelId, PlatformId, TacticId, TopicId } from '../engine/types'

interface Props {
  pageIdx: number
}

export function PageCard({ pageIdx }: Props) {
  const { state, dispatch } = useStore()
  const page = state.pages[pageIdx]
  const slot = PAGE_SLOT_BY_ID[page.defId]
  const [picker, setPicker] = useState<'model' | 'topic' | 'tactic' | null>(null)

  const chipsUnlocked = state.progression.topicChipUnlocked
  const cycleSec = effectiveCycleSec(slot, page.units)
  const tapPayout = pageTapPayout(state, pageIdx)
  const dpsManager = pageDollarsPerSec(state, pageIdx)
  const score = pageScore(state, pageIdx)
  const isBurning = (score?.saturation ?? 1) < 0.85
  const milestone = nextMilestone(page.units)
  const cycleInFlight = page.cycleProgress > 0
  const canTap = page.units > 0 && !page.manager && !cycleInFlight

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <PlatformAvatar id={slot.platform} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-100 font-medium truncate">{slot.name}</span>
            <span className="text-[10px] text-zinc-600 shrink-0">on {PLATFORMS[slot.platform].name}</span>
            {page.units > 0 && (
              <span className="text-zinc-500 text-xs ml-auto shrink-0">×{page.units}</span>
            )}
          </div>
          <div className="text-xs text-zinc-500 truncate italic mt-0.5">
            {page.units === 0
              ? slot.flavor ?? 'A blank page.'
              : chipsUnlocked
              ? `posting: ${TOPICS[page.recipe.topic].name}`
              : 'tap to publish'}
          </div>
        </div>
      </div>

      {/* CHIPS — hidden until first manager bought (§5 Era I roll-out) */}
      {chipsUnlocked && page.units > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          <Chip
            label="Topic"
            value={TOPICS[page.recipe.topic].name}
            onClick={() => setPicker('topic')}
          />
          {state.progression.tacticChipUnlocked && (
            <Chip
              label="Tactic"
              value={TACTICS[page.recipe.tactic].name}
              onClick={() => setPicker('tactic')}
            />
          )}
          {state.progression.modelChipUnlocked && (
            <Chip
              label="Model"
              value={MODELS[page.recipe.model].name}
              onClick={() => setPicker('model')}
            />
          )}
        </div>
      )}

      {/* RATE READOUT — money first, plain language */}
      {page.units > 0 && (
        <div className="px-4 pb-3 flex items-center gap-2 text-sm">
          {page.manager ? (
            <span className="text-emerald-300 font-mono font-semibold">
              {fmtMoney(dpsManager)}
              <span className="text-zinc-500 text-xs font-normal"> /sec</span>
            </span>
          ) : (
            <span className="text-zinc-300 font-mono text-xs">
              earns {fmtMoney(tapPayout.dollars - tapPayout.modelCost)} per post
            </span>
          )}
          {isBurning && chipsUnlocked && (
            <span
              className="text-orange-400 text-xs ml-auto"
              title="You've posted this too much — switch the topic to refresh it"
            >
              ⚠ overused
            </span>
          )}
        </div>
      )}

      {/* FACTOR STRIP — only when chips are live */}
      {chipsUnlocked && page.units > 0 && (
        <div className="px-4 pb-3">
          <FactorStrip recipe={page.recipe} />
        </div>
      )}

      {/* PUBLISH BUTTON (pre-manager) — the AdvCap-style tap-to-produce */}
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

      {/* CYCLE INFO — plain language, no "halving" jargon */}
      {chipsUnlocked && page.units > 0 && (
        <div className="px-4 pb-3 text-[10px] text-zinc-600">
          {page.manager ? 'auto-posts' : 'posts'} every {fmtSeconds(cycleSec)}
          {milestone && <> · speeds up at {milestone} copies</>}
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
      <span className="text-[10px] uppercase text-zinc-500 tracking-wider leading-none">
        {label}
      </span>
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
        onClick={() => dispatch({ type: 'TAP', pageIdx })}
        disabled={!canTap}
        className="relative w-full overflow-hidden rounded-xl bg-fuchsia-700 disabled:bg-zinc-800 text-white font-semibold py-3 text-base"
      >
        {/* fill */}
        <span
          className="absolute inset-y-0 left-0 bg-fuchsia-500/60"
          style={{ width: `${Math.min(100, progress * 100)}%`, transition: 'width 80ms linear' }}
        />
        <span className="relative flex items-center justify-center gap-2">
          {inFlight ? (
            <>
              <span>Publishing…</span>
              <span className="text-xs opacity-70 font-mono">
                ~{fmtSeconds(cycleSec * (1 - progress))}
              </span>
            </>
          ) : (
            <>
              <span>Publish</span>
              <span className="text-xs opacity-80 font-mono">
                +{fmtMoney(payoutDollars)}
              </span>
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
  const counts: number[] = page.units === 0 ? [1] : [1, 10]
  const maxN = maxBuyable(slot, page.units, state.money)

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
            onClick={() => dispatch({ type: 'BUY_UNITS', pageIdx, count: n })}
            className="flex-1 bg-fuchsia-900/40 hover:bg-fuchsia-800/60 disabled:bg-zinc-800/40 disabled:text-zinc-600 border border-fuchsia-700/40 disabled:border-zinc-800 rounded-lg py-2 text-xs"
          >
            <div className="font-semibold text-zinc-100">
              Buy ×{n}
              {free && page.units === 0 ? ' (free)' : ''}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {free ? '—' : fmtMoney(cost)}
            </div>
          </button>
        )
      })}
      {page.units > 0 && (
        <button
          disabled={maxN < 1}
          onClick={() =>
            dispatch({ type: 'BUY_UNITS', pageIdx, count: Math.max(1, maxN) })
          }
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
      <div className="text-[10px] text-zinc-500 italic mt-0.5">
        You automate yourself out of your own farm.
      </div>
    </button>
  )
}
