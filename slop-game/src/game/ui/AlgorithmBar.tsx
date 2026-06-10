import { useState } from 'react'
import { useStore } from '../store'
import {
  canPrestige,
  canPullPlug,
  era,
  tokensAvailable,
  weightsMult,
  zombieRatio,
} from '../engine/math'
import { totalDollarsPerSec } from '../engine/state'
import { TAG_LABEL } from '../engine/data'
import { fmtMoney } from '../format'
import { isTelegraphing } from '../engine/trend'
import { PrestigeSheet } from './PrestigeSheet'
import { PullPlugSheet } from './PullPlugSheet'
import { sfx } from './sfx'

// The top bar. Money first; the prestige reward stays visible forever; Era II
// adds the Zombie meter (the long-term goal made visible) and the Pull-the-
// Plug entry point. Trend shows WHAT'S hot always — magnitudes only while the
// Algorithm is still legible — plus when it will shift next.
export function AlgorithmBar() {
  const { state } = useStore()
  const [showPrestige, setShowPrestige] = useState(false)
  const [showPlug, setShowPlug] = useState(false)
  const ready = canPrestige(state)
  const tokensIfPrestige = tokensAvailable(state)
  const rate = totalDollarsPerSec(state)
  const showTrend = state.progression.topicChipUnlocked
  const telegraphing = showTrend && isTelegraphing(state.trend, Date.now())
  const permMult = state.monetization?.permanentMult ?? 1
  const bonusMult = (1 + 0.02 * state.slopTokens) * weightsMult(state.modelWeights) * permMult
  const gameEra = era(state)
  const z = zombieRatio(state)
  const eraTag = gameEra === 1 ? 'ERA I' : gameEra === 2 ? 'ERA II' : 'ERA III'
  const minsToShift = Math.max(0, Math.ceil((state.trend.nextRotationAt - state.lastTickAt) / 60000))

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

          {/* Permanent-bonus chip — tokens × weights × store bonus */}
          {bonusMult > 1 && (
            <div
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-fuchsia-800 bg-fuchsia-950/50 px-2 py-1"
              title={`${state.slopTokens} Slop Tokens${
                state.modelWeights > 0 ? ` + ${state.modelWeights} Model Weights (permanent)` : ''
              }${permMult > 1 ? ` + ×${permMult.toFixed(1)} store bonus` : ''} — everything you earn is ×${bonusMult.toFixed(2)}, forever.`}
            >
              <span className="text-fuchsia-300 text-xs font-mono font-semibold">
                ⚡{state.slopTokens}
                {state.modelWeights > 0 && <span className="text-violet-300"> 🧬{state.modelWeights}</span>}
              </span>
              <span className="text-fuchsia-200/90 text-xs font-mono">×{bonusMult.toFixed(2)}</span>
            </div>
          )}

          {/* Zombie meter — the visible long-term goal (Era II+) */}
          {gameEra >= 2 && (
            <button
              onClick={() => { sfx('uiOpen'); setShowPlug(true) }}
              className="shrink-0 flex flex-col items-center rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 hover:bg-zinc-800"
              title="Zombie Ratio — the share of all your views that are bots. Drive it to 100% and the internet is fully dead (that's the win). Tap for Pull the Plug."
            >
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 leading-none">🧟 zombie</span>
              <span className="font-mono text-cyan-300 text-xs font-semibold">{Math.round(z * 100)}%</span>
            </button>
          )}

          {ready && (
            <button
              onClick={() => { sfx('uiOpen'); setShowPrestige(true) }}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-fuchsia-700 hover:bg-fuchsia-600 border-fuchsia-500 text-white animate-pulse"
            >
              ⚡<span className="ml-0.5 font-mono">+{tokensIfPrestige}</span>
            </button>
          )}

          {canPullPlug(state) && (
            <button
              onClick={() => { sfx('uiOpen'); setShowPlug(true) }}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-red-900 hover:bg-red-800 border-red-600 text-red-100 animate-pulse"
              title="Pull the Plug — the deep reset (Era Jump)"
            >
              🔌
            </button>
          )}
        </div>

        {showTrend ? (
          <div className="max-w-md mx-auto px-3 pb-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none">
              {eraTag} ·{' '}
              {telegraphing
                ? '⚠ the algorithm is about to change…'
                : state.trend.legible
                ? `🔥 hot now — post these for bonus $ · shifts in ~${minsToShift}m`
                : `🔥 hot now — match these (numbers hidden) · shifts in ~${minsToShift}m`}
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
            {eraTag} — the SEO mill · an idle game where the gameplay is the moral compromise
          </div>
        )}
      </header>
      {showPrestige && <PrestigeSheet onClose={() => setShowPrestige(false)} />}
      {showPlug && <PullPlugSheet onClose={() => setShowPlug(false)} />}
    </>
  )
}
