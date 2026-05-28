import { useState } from 'react'
import { useStore } from '../store'
import { PAGE_SLOT_BY_ID, MODELS, TOPICS, TACTICS, PLATFORMS, managerCost } from '../engine/data'
import { effectiveCycleSec, maxBuyable, nextMilestone, pageProduction, unitCost } from '../engine/math'
import { pageScore } from '../engine/state'
import { fmtMoney, fmtSeconds } from '../format'
import { FactorStrip } from './FactorStrip'
import { ChipPicker } from './ChipPicker'
import Decimal from 'break_infinity.js'
import type { ModelId, TacticId, TopicId } from '../engine/types'

interface Props {
  pageIdx: number
}

export function PageCard({ pageIdx }: Props) {
  const { state, dispatch } = useStore()
  const page = state.pages[pageIdx]
  const slot = PAGE_SLOT_BY_ID[page.defId]
  const [expanded, setExpanded] = useState(page.units === 0) // expand fresh pages so the player sees how to buy
  const [picker, setPicker] = useState<'model' | 'topic' | 'tactic' | null>(null)

  const prod = pageProduction(state, page)
  const score = pageScore(state, pageIdx)
  const cycle = effectiveCycleSec(slot, page.units)
  const milestone = nextMilestone(page.units)

  const isBurning = (score?.saturation ?? 1) < 0.85

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* HEADER */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 pt-3 pb-2 flex items-center gap-3"
      >
        <PlatformAvatar id={slot.platform} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-100 font-medium truncate">{slot.name}</span>
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider shrink-0">
              {PLATFORMS[slot.platform].shortName}
            </span>
            <span className="text-zinc-500 text-xs ml-auto shrink-0">×{page.units}</span>
          </div>
          <div className="text-xs text-zinc-500 truncate italic mt-0.5">
            {TOPICS[page.recipe.topic].name}
          </div>
        </div>
        <span className="text-zinc-500 text-sm">{expanded ? '▴' : '▾'}</span>
      </button>

      {/* CHIPS — Model / Topic / Tactic (Platform is the page identity, D6) */}
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        <Chip
          label="Model"
          value={MODELS[page.recipe.model].name}
          onClick={() => setPicker('model')}
        />
        <Chip
          label="Topic"
          value={TOPICS[page.recipe.topic].name}
          onClick={() => setPicker('topic')}
        />
        <Chip
          label="Tactic"
          value={TACTICS[page.recipe.tactic].name}
          onClick={() => setPicker('tactic')}
        />
      </div>

      {/* HEADLINE FIGURES */}
      <div className="px-4 pb-3 flex items-center gap-3 text-sm">
        <span className="text-zinc-100 font-mono">
          {fmtMoney(prod.dollarsPerSec - prod.modelCostPerSec)}
          <span className="text-zinc-500 text-xs">/sec</span>
        </span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-300 font-mono text-xs">
          SlopScore ×{score ? score.total.toFixed(2) : '—'}
        </span>
        {isBurning && (
          <span className="text-orange-400 text-xs ml-auto" title="Saturation is biting">
            ⚠ burning
          </span>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-3">
          {/* Factor strip — D5 diagnose surface */}
          <FactorStrip recipe={page.recipe} />

          {/* Cycle info */}
          <div className="text-[11px] text-zinc-500 font-mono">
            cycle {fmtSeconds(cycle)}
            {milestone && (
              <>
                {' · '}
                next halving @ {milestone} units (in {milestone - page.units})
              </>
            )}
            {prod.modelCostPerSec > 0 && (
              <>
                {' · '}
                model burn {fmtMoney(prod.modelCostPerSec)}
                /sec
              </>
            )}
          </div>

          {/* Bots slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase tracking-wider mb-1">
              <span>Bots</span>
              <span className="text-zinc-300 font-mono">{Math.round(page.bots * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(page.bots * 100)}
              onChange={(e) =>
                dispatch({
                  type: 'SET_BOTS',
                  pageIdx,
                  fraction: Number(e.target.value) / 100,
                })
              }
              className="w-full accent-fuchsia-500"
            />
            <div className="text-[10px] text-zinc-600 mt-0.5">
              More bots → more E, less CPM. The tradeoff is real.
            </div>
          </div>

          {/* Buy buttons */}
          <BuyButtons pageIdx={pageIdx} />
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

function PlatformAvatar({ id }: { id: PageProps }) {
  const p = PLATFORMS[id]
  return (
    <div
      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
      style={{ background: COLORS[id] }}
    >
      {p.shortName}
    </div>
  )
}

type PageProps = keyof typeof PLATFORMS
const COLORS: Record<PageProps, string> = {
  facebook: '#1d4ed8',
  amazon: '#b45309',
  spotify: '#15803d',
  yt_kids: '#dc2626',
  google: '#7c3aed',
  tiktok: '#0891b2',
  linkedin: '#1e3a8a',
}

function BuyButtons({ pageIdx }: { pageIdx: number }) {
  const { state, dispatch } = useStore()
  const page = state.pages[pageIdx]
  const slot = PAGE_SLOT_BY_ID[page.defId]
  const counts = [1, 10, 100]
  const maxN = maxBuyable(slot, page.units, state.money)

  return (
    <div>
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
      </div>

      {/* Manager (Account-Management Software) */}
      {!page.manager && (
        <ManagerButton
          pageIdx={pageIdx}
          cost={new Decimal(managerCost(slot))}
        />
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
      className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 border border-zinc-700 disabled:border-zinc-800 rounded-lg py-2 text-xs"
    >
      <span className="font-semibold text-zinc-100">Buy Account-Management Software</span>
      <span className="ml-2 text-[10px] text-zinc-400 font-mono">{fmtMoney(cost)}</span>
      <div className="text-[10px] text-zinc-500 italic mt-0.5">
        You automate yourself out of your own farm.
      </div>
    </button>
  )
}

