import { useStore } from '../store'
import {
  affinityBand,
  recipeKey,
  SATURATION_OVERUSED_BELOW,
  saturationGauge,
  saturationMult,
  slopScore,
  tacticBand,
  trendDirection,
} from '../engine/math'
import { BAND_GLYPH, BAND_LABEL } from '../engine/data'
import type { Recipe } from '../engine/types'

// Plain-language "why this earns what it does" breakdown. No designer jargon:
// Affinity→"Topic fit", TacticSynergy→"Tactic fit", Trend→"Trending",
// Saturation→"Freshness". Bands shown as stars + word (never color alone).
export function FactorStrip({ recipe }: { recipe: Recipe }) {
  const { state } = useStore()
  const aff = affinityBand(state, recipe)
  const tac = tacticBand(recipe)
  const trend = trendDirection(recipe, state.trend)
  const rawSat = saturationMult(state.saturation[recipeKey(recipe)])
  const fresh = saturationGauge(state.saturation[recipeKey(recipe)])
  const reach = slopScore(state, recipe).total
  const tacticUnlocked = state.progression.tacticChipUnlocked

  return (
    <div className="bg-zinc-800/40 rounded-lg px-3 py-2">
      <div className="text-[11px] text-zinc-400 mb-1.5">
        Each post reaches{' '}
        <span className="text-zinc-100 font-mono font-semibold">×{reach.toFixed(1)}</span>{' '}
        normal — here's why:
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <Factor label="Topic fit" glyph={BAND_GLYPH[aff]} word={BAND_LABEL[aff]} />
        {tacticUnlocked && (
          <Factor label="Tactic fit" glyph={BAND_GLYPH[tac]} word={BAND_LABEL[tac]} />
        )}
        <span className="flex items-center gap-1">
          <span className="text-zinc-500">Trending</span>
          {trend === 'hot' ? (
            <span className="text-orange-400">🔥 yes</span>
          ) : trend === 'cold' ? (
            <span className="text-sky-400">over it</span>
          ) : (
            <span className="text-zinc-500">no</span>
          )}
        </span>
        <Freshness fresh={fresh} raw={rawSat} />
      </div>
    </div>
  )
}

function Factor({ label, glyph, word }: { label: string; glyph: string; word: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-100">
        <span className="text-amber-300">{glyph}</span> {word}
      </span>
    </span>
  )
}

// Freshness gauge — fill is NORMALIZED (burned = empty) and the color agrees
// with the "⚠ overused" warning so the two surfaces can never contradict.
function Freshness({ fresh, raw }: { fresh: number; raw: number }) {
  const cells = 4
  const filled = Math.round(fresh * cells)
  const color =
    raw >= 0.85 ? 'text-emerald-400' : raw >= SATURATION_OVERUSED_BELOW ? 'text-amber-400' : 'text-red-400'
  return (
    <span className="flex items-center gap-1">
      <span className="text-zinc-500">Freshness</span>
      <span className="font-mono tracking-tight">
        {Array.from({ length: cells }).map((_, i) => (
          <span key={i} className={i < filled ? color : 'text-zinc-700'}>
            ▓
          </span>
        ))}
      </span>
      {raw < SATURATION_OVERUSED_BELOW && <span className="text-red-400">worn out</span>}
    </span>
  )
}
