import { useStore } from '../store'
import { tokensAvailable } from '../engine/math'
import { useLockBodyScroll } from './useLockBodyScroll'
import { sfx } from './sfx'

// Plain-language "should I reset?" sheet — mobile has no hover tooltip, so the
// whole trade is spelled out: what you lose, what you gain, before/after, and
// the fact that waiting earns more but with diminishing returns.
export function PrestigeSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  useLockBodyScroll()
  const gain = tokensAvailable(state.lifetimeE, state.slopTokens)
  const curMult = 1 + 0.02 * state.slopTokens
  const newMult = 1 + 0.02 * (state.slopTokens + gain)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-fuchsia-700 rounded-2xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-[10px] uppercase tracking-widest text-fuchsia-400">Algorithm Update</div>
          <h3 className="text-lg text-zinc-50 font-semibold">Survive the next algorithm change?</h3>
        </div>

        <p className="text-sm text-zinc-400 leading-snug">
          The Algorithm reshuffles. You <span className="text-zinc-200">reset all your pages and cash to zero</span> —
          but you keep <span className="text-fuchsia-300 font-semibold">Slop Tokens</span> forever, and each one makes
          everything you ever earn a little more.
        </p>

        <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
          <Row label="Slop Tokens you'll gain" value={`+${gain}`} accent />
          <Row label="Permanent earnings bonus" value={`×${curMult.toFixed(2)} → ×${newMult.toFixed(2)}`} />
          <Row label="Tokens banked so far" value={`${state.slopTokens}`} />
        </div>

        <p className="text-[11px] text-zinc-500 leading-snug">
          You can always wait longer for more tokens — but each one is a little harder to earn than the last
          (the bonus grows by the square root). Reset when the gain feels worth starting over.
        </p>

        {state.algorithmUpdatesCompleted === 0 && (
          <p className="text-[11px] text-amber-300/90 leading-snug bg-amber-950/40 border border-amber-900 rounded-lg px-2.5 py-2">
            ⚠ Fair warning: after your first update, the Algorithm <em>goes dark</em> — it'll show
            you what's hot, but never the numbers again. And some topic fits get reshuffled.
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 font-medium"
          >
            Not yet
          </button>
          <button
            onClick={() => {
              sfx('prestige')
              dispatch({ type: 'PRESTIGE', now: Date.now() })
              onClose()
            }}
            disabled={gain < 1}
            className="flex-1 rounded-xl bg-fuchsia-700 hover:bg-fuchsia-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-2.5 font-semibold"
          >
            Reset for +{gain}
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-mono font-semibold ${accent ? 'text-fuchsia-300' : 'text-zinc-100'}`}>{value}</span>
    </div>
  )
}
