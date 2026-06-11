import { useState } from 'react'
import { useStore } from '../store'
import {
  affinityBand,
  era,
  pageBotShare,
  tacticBand,
  tagsTrendBonusPercent,
  tagsTrendDirection,
} from '../engine/math'
import {
  BAND_GLYPH,
  BAND_LABEL,
  MODELS,
  MODEL_CYCLE_COST,
  PAGE_SLOT_BY_ID,
  PLATFORMS,
  TACTICS,
  TOPICS,
} from '../engine/data'
import type { ModelId, Recipe, TacticId, Tag, TopicId } from '../engine/types'
import { FactorStrip } from './FactorStrip'
import { useLockBodyScroll } from './useLockBodyScroll'
import { sfx } from './sfx'

type Axis = 'topic' | 'tactic' | 'model'

// ALL of a page's tuning lives in this one sheet — what to post, how to push
// it, what makes it, and (Era II) the bot slider. Cards stay clean; picking an
// option does NOT close the sheet, so the "why ×N" strip at the top updates
// live and you can tune several things in one visit.
export function TuneSheet({ pageIdx, onClose }: { pageIdx: number; onClose: () => void }) {
  const { state, dispatch } = useStore()
  useLockBodyScroll()
  const page = state.pages[pageIdx] as (typeof state.pages)[number] | undefined
  const [axis, setAxis] = useState<Axis>('topic')
  const gameEra = era(state)
  // a prestige can wipe the page out from under an open sheet
  if (!page) return null
  const slot = PAGE_SLOT_BY_ID[page.defId]

  const tabs: Array<{ id: Axis; label: string }> = [
    { id: 'topic', label: 'What to post' },
    ...(state.progression.tacticChipUnlocked ? [{ id: 'tactic' as Axis, label: 'How to push it' }] : []),
    ...(state.progression.modelChipUnlocked ? [{ id: 'model' as Axis, label: 'What makes it' }] : []),
  ]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: page identity + the live "why ×N" strip */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 pt-3 pb-2 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-zinc-100 font-semibold">
              ⚙ Tune — {slot.name}
              <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500">
                {PLATFORMS[slot.platform].name}
              </span>
            </h3>
            <button
              onClick={onClose}
              className="text-zinc-300 hover:text-zinc-100 text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-1.5"
            >
              Done
            </button>
          </div>
          <div className="mt-2">
            <FactorStrip recipe={page.recipe} />
          </div>
          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="mt-2 flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { sfx('uiOpen'); setAxis(t.id) }}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold border ${
                    axis === t.id
                      ? 'bg-fuchsia-900/60 border-fuchsia-600 text-fuchsia-100'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <OptionList axis={axis} pageIdx={pageIdx} />

        {/* Era II: bots belong to tuning too */}
        {gameEra >= 2 && page.manager && (
          <div className="px-4 py-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-zinc-400">🤖 Fake views (bots)</span>
              <span className="text-zinc-200 font-mono">{Math.round(page.bots * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(page.bots * 100)}
              onChange={(e) =>
                dispatch({ type: 'SET_BOTS', pageIdx, fraction: Number(e.target.value) / 100 })
              }
              className="w-full accent-cyan-500"
            />
            <div className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
              views ×{(1 + 4 * page.bots).toFixed(1)} · pay per view −{Math.round(50 * page.bots)}% ·{' '}
              {Math.round(pageBotShare(page.bots) * 100)}% of this page is bots. Bots speed up
              unlocks & Tokens — and feed the 🧟 meter.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// The option rows for one axis. Poor fits for this platform are hidden (the
// current pick always stays visible); picking updates the recipe in place.
function OptionList({ axis, pageIdx }: { axis: Axis; pageIdx: number }) {
  const { state, dispatch } = useStore()
  const page = state.pages[pageIdx]
  const recipe = page.recipe

  const all = sortedOptions(axis, state, recipe)
  const opts =
    axis === 'model'
      ? all
      : all.filter((opt) => {
          if (opt.id === recipe[axis]) return true
          const candidate: Recipe = { ...recipe, [axis]: opt.id }
          const band = axis === 'tactic' ? tacticBand(candidate) : affinityBand(state, candidate)
          return band !== 'strange'
        })
  const hiddenCount = all.length - opts.length

  return (
    <>
      <ul>
        {opts.map((opt) => {
          const candidate: Recipe = { ...recipe, [axis]: opt.id }
          const aff = affinityBand(state, candidate)
          const tac = tacticBand(candidate)
          const showBand: 'aff' | 'tac' | 'tier' =
            axis === 'tactic' ? 'tac' : axis === 'model' ? 'tier' : 'aff'
          const band = showBand === 'tac' ? tac : aff
          const ownTags = opt.tags as Tag[]
          const trend = tagsTrendDirection(ownTags, state.trend)
          const isCurrent = opt.id === recipe[axis]

          return (
            <li key={opt.id}>
              <button
                onClick={() => {
                  if (isCurrent) return
                  sfx('uiOpen')
                  dispatch({
                    type: 'RETUNE',
                    pageIdx,
                    axis,
                    value: opt.id as ModelId | TopicId | TacticId,
                  })
                }}
                className={`w-full text-left px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/60 flex items-center justify-between gap-3 ${
                  isCurrent ? 'bg-fuchsia-950/30 border-l-2 border-l-fuchsia-500' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-100 truncate">
                    {opt.name}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] uppercase text-fuchsia-300">✓ current</span>
                    )}
                  </div>
                  {'flavor' in opt && opt.flavor && (
                    <div className="text-xs text-zinc-500 mt-0.5 italic truncate">{opt.flavor}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {showBand !== 'tier' ? (
                    <span className="text-zinc-200 text-xs flex items-center gap-1">
                      <span className="text-amber-300">{BAND_GLYPH[band]}</span>
                      <span className="text-zinc-300">{BAND_LABEL[band]} fit</span>
                    </span>
                  ) : (
                    <span className="text-zinc-300 text-xs text-right">
                      reach ×{(opt as { tier?: number }).tier?.toFixed(1) ?? '?'}
                      {MODEL_CYCLE_COST[opt.id as ModelId] > 0 ? (
                        <div className="text-[10px] text-red-400">
                          costs ${MODEL_CYCLE_COST[opt.id as ModelId]}/post to run
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-500">free to run</div>
                      )}
                    </span>
                  )}
                  {trend === 'hot' && (
                    <span className="text-[11px] text-orange-400 font-mono whitespace-nowrap">
                      🔥 trending
                      {state.trend.legible ? ` +${tagsTrendBonusPercent(ownTags, state.trend)}%` : ''}
                    </span>
                  )}
                  {trend === 'cold' && (
                    <span className="text-[11px] text-sky-400 font-mono whitespace-nowrap">
                      ❄ everyone's over it
                    </span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      {hiddenCount > 0 && (
        <div className="px-4 py-2.5 text-[10px] text-zinc-600 italic">
          {hiddenCount} poor fit{hiddenCount > 1 ? 's' : ''} for this platform hidden
        </div>
      )}
    </>
  )
}

const BAND_RANK: Record<string, number> = { great: 3, good: 2, strange: 1 }
function sortedOptions(axis: Axis, state: ReturnType<typeof useStore>['state'], recipe: Recipe) {
  if (axis === 'model') return Object.values(MODELS)
  if (axis === 'topic') {
    return Object.values(TOPICS)
      .slice()
      .sort(
        (a, b) =>
          BAND_RANK[affinityBand(state, { ...recipe, topic: b.id })] -
          BAND_RANK[affinityBand(state, { ...recipe, topic: a.id })],
      )
  }
  return Object.values(TACTICS)
    .slice()
    .sort(
      (a, b) =>
        BAND_RANK[tacticBand({ ...recipe, tactic: b.id })] -
        BAND_RANK[tacticBand({ ...recipe, tactic: a.id })],
    )
}
