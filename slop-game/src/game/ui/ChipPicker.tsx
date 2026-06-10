import { useStore } from '../store'
import {
  affinityBand,
  tacticBand,
  tagsTrendBonusPercent,
  tagsTrendDirection,
} from '../engine/math'
import {
  BAND_GLYPH,
  BAND_LABEL,
  MODELS,
  MODEL_CYCLE_COST,
  TACTICS,
  TOPICS,
} from '../engine/data'
import type { ModelId, Recipe, TacticId, Tag, TopicId } from '../engine/types'
import { useLockBodyScroll } from './useLockBodyScroll'

type Axis = 'model' | 'topic' | 'tactic'

interface Props {
  axis: Axis
  recipe: Recipe
  onPick: (value: ModelId | TopicId | TacticId) => void
  onClose: () => void
}

// What each axis means, in plain words shown at the top of the picker.
const AXIS_HELP: Record<Axis, { title: string; help: string }> = {
  topic: {
    title: 'What to post',
    help: 'Pick something that fits this page (★★★ = best), and match a 🔥 trending tag for bonus money.',
  },
  tactic: {
    title: 'How to push it',
    help: 'Some tricks work better on some platforms. ★★★ = best fit for this page.',
  },
  model: {
    title: 'What makes it',
    help: 'Fancier tools reach more people but cost money to run. The cheapest one that does the job usually wins.',
  },
}

export function ChipPicker({ axis, recipe, onPick, onClose }: Props) {
  const { state } = useStore()
  useLockBodyScroll()
  const opts = sortedOptions(axis, state, recipe)
  const help = AXIS_HELP[axis]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base text-zinc-100 font-semibold">{help.title}</h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{help.help}</p>
        </div>

        <ul>
          {opts.map((opt) => {
            const candidate: Recipe = { ...recipe, [axis]: opt.id }
            const aff = affinityBand(state, candidate)
            const tac = tacticBand(candidate)
            const showBand: 'aff' | 'tac' | 'tier' =
              axis === 'tactic' ? 'tac' : axis === 'model' ? 'tier' : 'aff'
            const band = showBand === 'tac' ? tac : aff
            // Trend is judged on THIS OPTION's own tags — so 🔥 actually
            // discriminates between choices (the whole-recipe check made every
            // row light up whenever a model/platform tag happened to be hot).
            const ownTags = opt.tags as Tag[]
            const trend = tagsTrendDirection(ownTags, state.trend)
            const isCurrent = opt.id === recipe[axis]

            return (
              <li key={opt.id}>
                <button
                  onClick={() => {
                    onPick(opt.id as ModelId | TopicId | TacticId)
                    onClose()
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/60 flex items-center justify-between gap-3 ${
                    isCurrent ? 'bg-zinc-800/40' : ''
                  } ${showBand !== 'tier' && band === 'strange' ? 'opacity-45' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-100 truncate">
                      {opt.name}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] uppercase text-zinc-500">current</span>
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
                        {state.trend.legible
                          ? ` +${tagsTrendBonusPercent(ownTags, state.trend)}%`
                          : ''}
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
      </div>
    </div>
  )
}

// Order options so the BEST fit for THIS page floats to the top (Great → Good →
// Weak), so each platform feels like it wants specific content and there's
// always a legible next pick. Models stay in tier order.
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
