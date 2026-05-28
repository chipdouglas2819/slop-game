import { useStore } from '../store'
import { canPrestige, tokensAvailable } from '../engine/math'
import { totalDollarsPerSec } from '../engine/state'
import { TAG_LABEL } from '../engine/data'
import { fmtMoney } from '../format'
import { isTelegraphing } from '../engine/trend'

// The top bar. Money first. Trending is explained ("post these for bonus $")
// and always shows its bonus. The inert Zombie meter is hidden until the bots
// system gives it a real payoff. Prestige appears only when it's available.
export function AlgorithmBar() {
  const { state, dispatch } = useStore()
  const ready = canPrestige(state)
  const tokensIfPrestige = tokensAvailable(state.lifetimeE, state.slopTokens)
  const rate = totalDollarsPerSec(state)
  const showTrend = state.progression.topicChipUnlocked
  const telegraphing = showTrend && isTelegraphing(state.trend, Date.now())

  return (
    <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      {/* Money row — always the headline */}
      <div className="max-w-md mx-auto px-3 pt-2 pb-1 flex items-center justify-between">
        <div>
          <div className="text-emerald-300 font-mono text-lg font-semibold leading-none">
            {fmtMoney(state.money)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {fmtMoney(rate)}/sec
          </div>
        </div>

        {ready && (
          <button
            onClick={() => dispatch({ type: 'PRESTIGE', now: Date.now() })}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 text-white animate-pulse"
            title={`Reset your pages for ${tokensIfPrestige} permanent Slop Tokens (each one makes everything earn a little more, forever).`}
          >
            ⚡ Algorithm Update
            <span className="ml-1 font-mono">+{tokensIfPrestige}</span>
          </button>
        )}
      </div>

      {/* Trending row — only once the player can act on it */}
      {showTrend ? (
        <div className="max-w-md mx-auto px-3 pb-2">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none">
            {telegraphing ? '⚠ the algorithm is about to change…' : '🔥 hot now — post these for bonus $'}
          </div>
          <div className="flex items-center gap-2 mt-1 overflow-x-auto no-scrollbar">
            {state.trend.hot.map((h) => (
              <span
                key={h.tag}
                className="text-xs text-zinc-200 whitespace-nowrap bg-zinc-800/60 rounded px-1.5 py-0.5"
              >
                {TAG_LABEL[h.tag] ?? h.tag}
                <span className="ml-1 text-orange-400 font-mono">×{h.magnitude.toFixed(1)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-3 pb-2 text-[11px] text-zinc-500 italic">
          tap a page below to start posting
        </div>
      )}
    </header>
  )
}
