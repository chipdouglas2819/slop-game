import { useStore } from '../store'
import { affinityBand, tacticBand, trendDirection } from '../engine/math'
import {
  BAND_GLYPH,
  BAND_LABEL,
  MODELS,
  PLATFORMS,
  TACTICS,
  TOPICS,
} from '../engine/data'
import type {
  ModelId,
  Recipe,
  TacticId,
  TopicId,
} from '../engine/types'

type Axis = 'model' | 'topic' | 'tactic'

interface Props {
  axis: Axis
  recipe: Recipe // the page's current recipe — picker computes options vs locked chips
  onPick: (value: ModelId | TopicId | TacticId) => void
  onClose: () => void
}

// Directional preview picker (D4) — band glyph + 🔥 if trending, no magnitude.
// Era I exception (D2): when trend.legible, the picker also shows the magnitude
// badge — vanishes at the first Algorithm Update.
export function ChipPicker({ axis, recipe, onPick, onClose }: Props) {
  const { state } = useStore()
  const opts = listOptions(axis)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider text-zinc-300 font-semibold">
            Pick {axisLabel(axis)}{' '}
            <span className="text-zinc-500 text-xs ml-2">
              vs {PLATFORMS[recipe.platform].name}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <ul>
          {opts.map((opt) => {
            const candidate: Recipe = { ...recipe, [axis]: opt.id }
            const aff = affinityBand(state, candidate)
            const tac = tacticBand(candidate)
            // For the picker we surface the *most relevant* band per axis:
            // - topic & platform pickers → Affinity band
            // - tactic picker → Tactic synergy band
            // - model picker → tier (no band, since Model doesn't go through the matrix)
            const showBand: 'aff' | 'tac' | 'tier' =
              axis === 'tactic' ? 'tac' : axis === 'model' ? 'tier' : 'aff'
            const band = showBand === 'tac' ? tac : aff
            const trend = trendDirection(candidate, state.trend)
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
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-100 truncate">
                      {opt.name}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] uppercase text-zinc-500">current</span>
                      )}
                    </div>
                    {'flavor' in opt && opt.flavor && (
                      <div className="text-xs text-zinc-500 mt-0.5 italic truncate">
                        {opt.flavor}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {showBand !== 'tier' ? (
                      <span
                        className="text-zinc-200 text-sm flex items-center gap-1"
                        title={`${showBand === 'tac' ? 'Tactic' : 'Affinity'}: ${BAND_LABEL[band]}`}
                      >
                        <span className="text-lg">{BAND_GLYPH[band]}</span>
                        <span className="text-[11px] uppercase text-zinc-400">
                          {BAND_LABEL[band]}
                        </span>
                      </span>
                    ) : (
                      <span className="text-zinc-300 text-xs">
                        Tier ×{(opt as { tier?: number }).tier?.toFixed(1) ?? '?'}
                      </span>
                    )}
                    {trend === 'hot' && <span title="Trending">🔥</span>}
                    {/* D2 — Era I training-wheel magnitude badge */}
                    {state.trend.legible && trend === 'hot' && (
                      <TrendMagnitudeBadge candidate={candidate} />
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="px-4 py-3 text-[11px] text-zinc-500 italic">
          Direction only — magnitudes are hidden{state.trend.legible ? ' (Algorithm still legible)' : ''}.
        </div>
      </div>
    </div>
  )
}

function TrendMagnitudeBadge({ candidate }: { candidate: Recipe }) {
  const { state } = useStore()
  // Compute the trend multiplier just for the matching tag(s) of this candidate
  // — only used in legible mode, then it dies.
  const hotMags = state.trend.hot
    .filter((h) => {
      // tag overlap check
      const allTags = [
        ...MODELS[candidate.model].tags,
        ...TOPICS[candidate.topic].tags,
        ...PLATFORMS[candidate.platform].tags,
        ...TACTICS[candidate.tactic].tags,
      ]
      return allTags.includes(h.tag)
    })
    .map((h) => h.magnitude)
  if (hotMags.length === 0) return null
  const total = hotMags.reduce((a, b) => a * b, 1)
  return (
    <span className="text-[10px] text-orange-400 font-mono">
      ×{total.toFixed(1)}
    </span>
  )
}

function listOptions(axis: Axis) {
  if (axis === 'model') return Object.values(MODELS)
  if (axis === 'topic') return Object.values(TOPICS)
  return Object.values(TACTICS)
}

function axisLabel(axis: Axis): string {
  return axis === 'model' ? 'Model' : axis === 'topic' ? 'Topic' : 'Tactic'
}
