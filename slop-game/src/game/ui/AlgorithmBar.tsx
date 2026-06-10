import { useState } from 'react'
import { useStore } from '../store'
import { canPrestige, tokensAvailable } from '../engine/math'
import { PrestigeSheet } from './PrestigeSheet'
import { totalDollarsPerSec } from '../engine/state'
import { TAG_LABEL } from '../engine/data'
import { fmtMoney } from '../format'
import { isTelegraphing } from '../engine/trend'

// The top bar. Money first. Trending is explained ("post these for bonus $")
// and shows its bonus only while legible (pre-first-prestige). The inert Zombie
// meter is gone until the bots system gives it a payoff. Prestige opens the
// plain-language confirm sheet.
export function AlgorithmBar() {
  const { state } = useStore()
  const [showPrestige, setShowPrestige] = useState(false)
  const ready = canPrestige(state)
  const tokensIfPrestige = tokensAvailable(state.lifetimeE, state.slopTokens)
  const rate = totalDollarsPerSec(state)
  const showTrend = state.progression.topicChipUnlocked
  const telegraphing = showTrend && isTelegraphing(state.trend, Date.now())
  const permMult = state.monetization?.permanentMult ?? 1
  const bonusMult = (1 + 0.02 * state.slopTokens) * permMult

  return (
    <>
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-md mx-auto px-3 pt-2 pb-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-emerald-300 font-mono text-lg font-semibold leading-none">
              {fmtMoney(state.money)}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{fmtMoney(rate)}/sec</div>
          </div>

          {/* Permanent-bonus chip — the prestige reward must stay visible
              forever, not just inside the confirm sheet */}
          {bonusMult > 1 && (
            <div
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-fuchsia-800 bg-fuchsia-950/50 px-2 py-1"
              title={`${state.slopTokens} Slop Tokens${permMult > 1 ? ` + ×${permMult.toFixed(1)} store bonus` : ''} — everything you earn is multiplied by ×${bonusMult.toFixed(2)}, forever.`}
            >
              <span className="text-fuchsia-300 text-xs font-mono font-semibold">⚡{state.slopTokens}</span>
              <span className="text-fuchsia-200/90 text-xs font-mono">×{bonusMult.toFixed(2)}</span>
            </div>
          )}

          {ready && (
            <button
              onClick={() => setShowPrestige(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 text-white animate-pulse"
            >
              ⚡ Algorithm Update
              <span className="ml-1 font-mono">+{tokensIfPrestige}</span>
            </button>
          )}
        </div>

        {showTrend ? (
          <div className="max-w-md mx-auto px-3 pb-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none">
              {telegraphing
                ? '⚠ the algorithm is about to change…'
                : state.trend.legible
                ? '🔥 hot now — post these for bonus $'
                : '🔥 hot now — match these (the algorithm hides the numbers)'}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {state.trend.hot.map((h) => (
                <span
                  key={h.tag}
                  className="text-xs text-zinc-200 whitespace-nowrap bg-zinc-800/60 rounded px-1.5 py-0.5"
                >
                  {TAG_LABEL[h.tag] ?? h.tag}
                  {state.trend.legible && (
                    <span className="ml-1 text-orange-400 font-mono">×{h.magnitude.toFixed(1)}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto px-3 pb-2 text-[11px] text-zinc-600 italic">
            an idle game where the gameplay is the moral compromise
          </div>
        )}
      </header>
      {showPrestige && <PrestigeSheet onClose={() => setShowPrestige(false)} />}
    </>
  )
}
