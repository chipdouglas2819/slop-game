import { useStore } from '../store'
import { canPrestige, tokensAvailable } from '../engine/math'
import { totalDollarsPerSec } from '../engine/state'
import { TAG_LABEL } from '../engine/data'
import { fmtMoney, fmtPercent } from '../format'
import { isTelegraphing } from '../engine/trend'

// The Algorithm Bar — top strip. Trend ticker stays HIDDEN until the player
// has bought the first manager (i.e. the Topic chip is live). Otherwise the
// first thing the player sees is a lot of jargon, no point of reference.
export function AlgorithmBar() {
  const { state, dispatch } = useStore()
  const ready = canPrestige(state)
  const tokensIfPrestige = tokensAvailable(state.lifetimeE, state.slopTokens)
  const rate = totalDollarsPerSec(state)
  const showTrend = state.progression.topicChipUnlocked
  const telegraphing = showTrend && isTelegraphing(state.trend, Date.now())

  return (
    <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center gap-2">
        {showTrend ? (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none">
              {telegraphing ? 'the algorithm is shifting…' : 'trending'}
            </div>
            <div className="flex items-center gap-2 mt-0.5 overflow-x-auto no-scrollbar">
              {state.trend.hot.map((h) => (
                <span
                  key={h.tag}
                  className="text-xs text-zinc-200 whitespace-nowrap"
                  title={state.trend.legible ? `×${h.magnitude.toFixed(1)}` : 'magnitude hidden'}
                >
                  {TAG_LABEL[h.tag] ?? h.tag}
                  {state.trend.legible && (
                    <span className="ml-1 text-[10px] text-orange-400 font-mono">
                      ×{h.magnitude.toFixed(1)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none">
              slop empire
            </div>
            <div className="text-xs text-zinc-400 mt-0.5 italic truncate">
              tap publish to print engagement
            </div>
          </div>
        )}

        <div className="text-right shrink-0">
          <div className="text-zinc-100 font-mono text-sm leading-tight">
            {fmtMoney(state.money)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono leading-tight">
            {fmtMoney(rate)}/s
          </div>
        </div>

        {showTrend && (
          <div className="shrink-0 flex flex-col items-center" title="Zombie Ratio">
            <div className="text-[10px] uppercase text-zinc-500 leading-none">Z</div>
            <div className="font-mono text-zinc-300 text-xs">{fmtPercent(0)}</div>
          </div>
        )}

        {ready && (
          <button
            onClick={() => dispatch({ type: 'PRESTIGE', now: Date.now() })}
            className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 text-white animate-pulse"
            title={`Algorithm Update — bank ${tokensIfPrestige} Slop Tokens, reshuffle 15% of the matrix${
              state.trend.legible ? ', and the magnitude goes hidden forever' : ''
            }`}
          >
            ⚡ +{tokensIfPrestige}
          </button>
        )}
      </div>
    </header>
  )
}
