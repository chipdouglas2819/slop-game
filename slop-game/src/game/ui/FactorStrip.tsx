import { useStore } from '../store'
import {
  affinityBand,
  recipeKey,
  saturationGauge,
  tacticBand,
  trendDirection,
} from '../engine/math'
import { BAND_GLYPH, BAND_LABEL } from '../engine/data'
import type { Recipe } from '../engine/types'

// Diagnose strip (D5) — shows which factor is the weak link, by direction.
// Saturation gets a real gauge because it's the visible self-correcting system;
// the others are direction-only glyphs (the §10 rule).
export function FactorStrip({ recipe }: { recipe: Recipe }) {
  const { state } = useStore()
  const aff = affinityBand(state, recipe)
  const tac = tacticBand(recipe)
  const trend = trendDirection(recipe, state.trend)
  const sat = saturationGauge(state.saturation[recipeKey(recipe)])

  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
      <Factor label="Aff" glyph={BAND_GLYPH[aff]} title={`Affinity: ${BAND_LABEL[aff]}`} />
      <span className="text-zinc-700">·</span>
      <Factor label="Tac" glyph={BAND_GLYPH[tac]} title={`Tactic synergy: ${BAND_LABEL[tac]}`} />
      <span className="text-zinc-700">·</span>
      <Factor
        label="Trend"
        glyph={trend === 'hot' ? '🔥' : trend === 'cold' ? '❄' : '–'}
        title={
          trend === 'hot'
            ? 'Trend: this recipe is trending up'
            : trend === 'cold'
            ? "Trend: suppressed — yesterday's flood"
            : 'Trend: neutral'
        }
      />
      <span className="text-zinc-700">·</span>
      <Gauge value={sat} />
    </div>
  )
}

function Factor({ label, glyph, title }: { label: string; glyph: string; title: string }) {
  return (
    <span className="flex items-center gap-1" title={title}>
      <span className="text-zinc-500">{label}</span>
      <span className="text-base text-zinc-200">{glyph}</span>
    </span>
  )
}

function Gauge({ value }: { value: number }) {
  const cells = 4
  const filled = Math.round(value * cells)
  return (
    <span
      className="flex items-center gap-1"
      title={`Saturation freshness: ${Math.round(value * 100)}%`}
    >
      <span className="text-zinc-500">Sat</span>
      <span className="font-mono text-zinc-200 tracking-tight">
        {Array.from({ length: cells }).map((_, i) => (
          <span key={i} className={i < filled ? 'text-zinc-200' : 'text-zinc-700'}>
            ▓
          </span>
        ))}
      </span>
    </span>
  )
}
